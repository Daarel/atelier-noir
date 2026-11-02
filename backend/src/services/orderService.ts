import { randomInt } from 'node:crypto';

import { BadRequestError, NotFoundError } from '@/errors/error.js';
import { Prisma } from '@/generated/prisma/client.js';
import type { OrderWhereInput } from '@/generated/prisma/models.js';
import { prisma } from '@/lib/prisma.js';
import type { CreateOrderInput, GetOrdersQuery } from '@/schemas/orderSchema.js';

const MAX_ORDER_NUMBER_RETRIES = 3;

/**
 * Bentuk `include` yang dipakai berulang untuk detail pesanan.
 * `satisfies` memastikan objek ini valid menurut tipe Prisma, tanpa menghilangkan
 * tipe literalnya — sehingga hasil query tetap ter-infer lengkap (items, product, address).
 */
const orderDetailInclude = {
  address: true,
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          // Konsisten dengan keranjang: tampilkan foto pakaian (cloth = isPrimary: false)
          images: {
            where: { isPrimary: false },
            select: { url: true },
            take: 1,
          },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithDetail = Prisma.OrderGetPayload<{ include: typeof orderDetailInclude }>;

class OrderService {
  /**
   * Membuat nomor pesanan yang mudah dibaca manusia.
   * Format: INV-YYYYMMDD-XXXXXX  → contoh: INV-20261030-482913
   * `randomInt` dari node:crypto lebih aman/acak dibanding Math.random().
   */
  private static generateOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // "2026-10-30" → "20261030"
    const random = randomInt(0, 1_000_000).toString().padStart(6, '0'); // selalu 6 digit
    return `INV-${date}-${random}`;
  }

  /**
   * Tipe Decimal Prisma ter-serialisasi menjadi string di JSON ("350000").
   * Helper ini mengubahnya menjadi number agar sesuai dengan tipe `Order` di frontend.
   */
  private static serializeOrder(order: OrderWithDetail) {
    /**
     * Fallback Alamat Pengiriman:
     * Jika relasi `order.address` menjadi null (karena user menghapus alamat dari buku alamatnya),
     * kita otomatis merekonstruksi objek `address` dari field snapshot `shipping...`
     * sehingga frontend selalu menerima alamat lengkap tanpa takut crash atau data hilang.
     */
    const address =
      order.address ??
      (order.shippingStreetAddress
        ? {
            id: order.addressId ?? '',
            userId: order.userId,
            recipientName: order.shippingRecipientName ?? '',
            phoneNumber: order.shippingPhoneNumber ?? '',
            streetAddress: order.shippingStreetAddress ?? '',
            city: order.shippingCity ?? '',
            province: order.shippingProvince ?? '',
            postalCode: order.shippingPostalCode ?? '',
            isDefault: false,
          }
        : null);

    return {
      ...order,
      address,
      totalAmount: order.totalAmount.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toNumber(),
        subtotal: item.price.mul(item.quantity).toNumber(),
      })),
    };
  }

  // ------------------------------------------------------------------
  // POST /api/v1/orders  →  Checkout
  // ------------------------------------------------------------------
  static async createOrder(userId: string, data: CreateOrderInput) {
    // Loop retry hanya untuk kasus langka: orderNumber yang di-generate sudah dipakai (error P2002).
    for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_RETRIES; attempt++) {
      try {
        const order = await this.runCheckoutTransaction(userId, data);
        return this.serializeOrder(order);
      } catch (err) {
        const isOrderNumberCollision =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002' &&
          attempt < MAX_ORDER_NUMBER_RETRIES;

        if (!isOrderNumberCollision) throw err;
        // Jika bentrok, transaksi sudah otomatis di-rollback → aman untuk mencoba lagi.
      }
    }

    // Secara teori tidak akan tercapai, tapi TypeScript butuh return/throw di akhir fungsi.
    throw new BadRequestError('Gagal membuat pesanan, silakan coba lagi');
  }

  /**
   * Seluruh proses checkout dijalankan di dalam SATU transaksi database.
   * Jika ada satu langkah yang gagal (stok habis, alamat salah, dll),
   * SEMUA perubahan dibatalkan (rollback) sehingga data tidak setengah jadi.
   */
  private static async runCheckoutTransaction(userId: string, data: CreateOrderInput) {
    return prisma.$transaction(
      async (tx) => {
        // 1. Ambil data alamat pengiriman lengkap milik user ini
        const address = await tx.address.findFirst({
          where: { id: data.addressId, userId },
        });
        if (!address) throw new NotFoundError('Alamat pengiriman tidak ditemukan');

        // 2. Ambil isi keranjang beserta data produk TERBARU dari database
        //    (harga & stok diambil dari DB, bukan dari client, agar tidak bisa dimanipulasi)
        const cart = await tx.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, price: true, stock: true, isPublished: true },
                },
              },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          throw new BadRequestError('Keranjang belanja Anda masih kosong');
        }

        // 3. Validasi awal: produk masih dijual & stok cukup (untuk pesan error yang jelas)
        for (const item of cart.items) {
          if (!item.product.isPublished) {
            throw new BadRequestError(`Produk "${item.product.name}" sudah tidak tersedia`);
          }
          if (item.product.stock < item.quantity) {
            throw new BadRequestError(
              `Stok "${item.product.name}" tidak mencukupi (tersisa ${item.product.stock})`,
            );
          }
        }

        // 4. Kurangi stok secara ATOMIK.
        //    Kenapa updateMany + kondisi `stock >= quantity`, bukan update biasa?
        //    → Jika 2 user checkout produk yang sama di waktu bersamaan, validasi di langkah 3
        //      bisa sama-sama lolos. Dengan kondisi di klausa WHERE, database sendiri yang
        //      menjamin stok tidak akan pernah minus. Jika `count === 0`, berarti stok
        //      sudah keburu dibeli orang lain → transaksi dibatalkan.
        for (const item of cart.items) {
          const result = await tx.product.updateMany({
            where: {
              id: item.productId,
              isPublished: true,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (result.count === 0) {
            throw new BadRequestError(
              `Stok "${item.product.name}" baru saja habis, silakan perbarui keranjang Anda`,
            );
          }
        }

        // 5. Hitung total memakai Prisma.Decimal (bukan number) agar tidak ada
        //    error pembulatan floating point (contoh klasik: 0.1 + 0.2 = 0.30000000000000004)
        const totalAmount = cart.items.reduce(
          (sum, item) => sum.plus(item.product.price.mul(item.quantity)),
          new Prisma.Decimal(0),
        );

        // 6. Buat Order + OrderItem sekaligus (nested create).
        //    `price` di OrderItem adalah SNAPSHOT harga saat checkout, sehingga riwayat
        //    pesanan tidak berubah meskipun admin mengubah harga produk di kemudian hari.
        const order = await tx.order.create({
          data: {
            orderNumber: this.generateOrderNumber(),
            userId,
            addressId: address.id,

            // Simpan snapshot alamat pengiriman saat checkout
            // (Data pesanan historis tetap abadi meskipun user mengubah/menghapus alamat nantinya)
            shippingRecipientName: address.recipientName,
            shippingPhoneNumber: address.phoneNumber,
            shippingStreetAddress: address.streetAddress,
            shippingCity: address.city,
            shippingProvince: address.province,
            shippingPostalCode: address.postalCode,

            totalAmount,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
          include: orderDetailInclude,
        });

        // 7. Kosongkan keranjang setelah pesanan berhasil dibuat
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order;
      },
      {
        // Default timeout transaksi interaktif Prisma adalah 5 detik.
        // Dinaikkan sedikit untuk berjaga-jaga jika isi keranjang banyak.
        timeout: 10_000,
      },
    );
  }

  // ------------------------------------------------------------------
  // GET /api/v1/orders  →  Riwayat pesanan milik user
  // ------------------------------------------------------------------
  static async findUserOrders(userId: string, query: GetOrdersQuery) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    // Spread kondisional: properti `status` hanya ditambahkan jika filter dikirim
    const where: OrderWhereInput = {
      userId,
      ...(status ? { status } : {}),
    };

    // $transaction berbentuk array → kedua query dijalankan bersamaan dalam satu koneksi
    const [totalItems, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: orderDetailInclude,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: orders.map((order) => this.serializeOrder(order)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ------------------------------------------------------------------
  // GET /api/v1/orders/:orderNumber  →  Detail pesanan
  // ------------------------------------------------------------------
  static async findOrderByNumber(orderNumber: string, userId: string, isAdmin: boolean) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: orderDetailInclude,
    });

    // Jika pesanan milik orang lain, tetap kembalikan 404 (bukan 403)
    // agar tidak membocorkan informasi bahwa nomor pesanan tersebut ada.
    if (!order || (!isAdmin && order.userId !== userId)) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    return this.serializeOrder(order);
  }

  // ------------------------------------------------------------------
  // PATCH /api/v1/orders/:orderNumber/cancel  →  Batalkan pesanan
  // ------------------------------------------------------------------
  static async cancelOrder(orderNumber: string, userId: string) {
    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { orderNumber },
        include: { items: { select: { productId: true, quantity: true } } },
      });

      if (!existingOrder || existingOrder.userId !== userId) {
        throw new NotFoundError('Pesanan tidak ditemukan');
      }

      // Ubah status HANYA jika masih PENDING (atomik).
      // Mencegah double-cancel: jika user menekan tombol batal 2x bersamaan,
      // hanya request pertama yang `count === 1`, sehingga stok tidak dikembalikan dua kali.
      const result = await tx.order.updateMany({
        where: { id: existingOrder.id, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });

      if (result.count === 0) {
        throw new BadRequestError(
          'Pesanan tidak dapat dibatalkan karena sudah diproses atau dibatalkan sebelumnya',
        );
      }

      // Kembalikan stok setiap produk sesuai jumlah yang dipesan
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: existingOrder.id },
        include: orderDetailInclude,
      });
    });

    return this.serializeOrder(order);
  }
}

export default OrderService;
