import { randomInt } from 'node:crypto';

import { BadRequestError, NotFoundError } from '@/errors/error.js';
import { Prisma } from '@/generated/prisma/client.js';
import type { OrderWhereInput } from '@/generated/prisma/models.js';
import { prisma } from '@/lib/prisma.js';
import type { CreateOrderInput, GetOrdersQuery } from '@/schemas/orderSchema.js';

// Batas toleransi percobaan pembuatan nomor pesanan jika terjadi tabrakan unik
const MAX_ORDER_NUMBER_RETRIES = 3;

// Relasi data pesanan pelanggan dan item produk terkait
const orderDetailInclude = {
  address: true,
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
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
  // Pembuatan nomor faktur unik berbasis tanggal kalender dan digit acak
  private static generateOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = randomInt(0, 1_000_000).toString().padStart(6, '0');
    return `INV-${date}-${random}`;
  }

  // Normalisasi data pesanan dengan fallback ke snapshot pengiriman historis
  private static serializeOrder(order: OrderWithDetail) {
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

  // Pembuatan pesanan baru dengan penanganan benturan nomor faktur otomatis
  static async createOrder(userId: string, data: CreateOrderInput) {
    for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_RETRIES; attempt++) {
      try {
        const order = await this.runCheckoutTransaction(userId, data);
        return this.serializeOrder(order);
      } catch (err) {
        // Cek apakah error disebabkan oleh benturan unique constraint pada nomor faktur
        const isOrderNumberCollision =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002' &&
          attempt < MAX_ORDER_NUMBER_RETRIES;

        if (!isOrderNumberCollision) throw err;
      }
    }

    throw new BadRequestError('Gagal membuat pesanan, silakan coba lagi');
  }

  // Eksekusi transaksi checkout atomik mulai dari validasi stok hingga pengosongan keranjang
  private static async runCheckoutTransaction(userId: string, data: CreateOrderInput) {
    return prisma.$transaction(
      async (tx) => {
        // Verifikasi kepemilikan alamat pengiriman yang dipilih pelanggan
        const address = await tx.address.findFirst({
          where: { id: data.addressId, userId },
        });
        if (!address) throw new NotFoundError('Alamat pengiriman tidak ditemukan');

        // Ambil isi keranjang belanja beserta status publikasi dan stok produk terbaru
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

        // Validasi ketersediaan publikasi dan kecukupan stok seluruh item sebelum pemotongan
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

        // Potong stok produk secara atomik dengan kondisi stok saat ini masih mencukupi
        for (const item of cart.items) {
          const result = await tx.product.updateMany({
            where: {
              id: item.productId,
              isPublished: true,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          // Batalkan transaksi jika stok telah berkurang oleh transaksi paralel lain
          if (result.count === 0) {
            throw new BadRequestError(
              `Stok "${item.product.name}" baru saja habis, silakan perbarui keranjang Anda`,
            );
          }
        }

        // Hitung total nilai belanja seluruh item keranjang menggunakan desimal presisi
        const totalAmount = cart.items.reduce(
          (sum, item) => sum.plus(item.product.price.mul(item.quantity)),
          new Prisma.Decimal(0),
        );

        // Buat rekaman pesanan baru lengkap beserta snapshot alamat dan rincian harga beli
        const order = await tx.order.create({
          data: {
            orderNumber: this.generateOrderNumber(),
            userId,
            addressId: address.id,

            // Simpan snapshot permanen alamat pengiriman saat checkout berlangsung
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

        // Kosongkan keranjang belanja pelanggan setelah pesanan berhasil terbuat
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order;
      },
      {
        timeout: 10_000,
      },
    );
  }

  // Mengambil daftar riwayat pesanan milik pelanggan yang sedang masuk
  static async findUserOrders(userId: string, query: GetOrdersQuery) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: OrderWhereInput = {
      userId,
      ...(status ? { status } : {}),
    };

    // Eksekusi pencarian riwayat dan perhitungan total pesanan
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

  // Mengambil rincian pesanan tunggal berdasarkan nomor faktur dan izin akses
  static async findOrderByNumber(orderNumber: string, userId: string, isAdmin: boolean) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: orderDetailInclude,
    });

    // Pastikan pesanan ditemukan dan pengguna berhak melihat pesanan tersebut
    if (!order || (!isAdmin && order.userId !== userId)) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    return this.serializeOrder(order);
  }

  // Pembatalan pesanan yang masih berstatus pending oleh pelanggan beserta pemulihan stok
  static async cancelOrder(orderNumber: string, userId: string) {
    const order = await prisma.$transaction(async (tx) => {
      // Ambil data pesanan dan pastikan milik pelanggan yang meminta
      const existingOrder = await tx.order.findUnique({
        where: { orderNumber },
        include: { items: { select: { productId: true, quantity: true } } },
      });

      if (!existingOrder || existingOrder.userId !== userId) {
        throw new NotFoundError('Pesanan tidak ditemukan');
      }

      // Perbarui status pesanan menjadi dibatalkan hanya jika status saat ini masih pending
      const result = await tx.order.updateMany({
        where: { id: existingOrder.id, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });

      // Tolak pembatalan jika pesanan sudah diproses atau telah dibatalkan sebelumnya
      if (result.count === 0) {
        throw new BadRequestError(
          'Pesanan tidak dapat dibatalkan karena sudah diproses atau dibatalkan sebelumnya',
        );
      }

      // Kembalikan seluruh kuantitas stok barang ke tabel produk
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
