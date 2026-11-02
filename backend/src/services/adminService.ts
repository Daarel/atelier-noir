import { BadRequestError, NotFoundError } from '@/errors/error.js';
import { Prisma } from '@/generated/prisma/client.js';
import type { OrderStatus } from '@/generated/prisma/enums.js';
import type {
  OrderWhereInput,
  ProductOrderByWithRelationInput,
  ProductWhereInput,
} from '@/generated/prisma/models.js';
import { prisma } from '@/lib/prisma.js';
import type { GetAdminOrdersQuery, GetAdminProductsQuery } from '@/schemas/adminSchema.js';

/**
 * State Machine Transisi Status Pesanan:
 * Mencegah perubahan status tidak logis (misalnya pesanan yang sudah DELIVERED
 * tiba-tiba dikembalikan ke PENDING atau CANCELLED tanpa proses retur barang).
 */
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal state: pesanan sudah diterima pelanggan, status terkunci
  CANCELLED: ['PENDING', 'PROCESSING'], // Bisa diaktifkan kembali jika pembatalan keliru
};

/**
 * Objek relasi Prisma yang diambil untuk setiap pesanan di modul admin.
 * Mengutamakan gambar pakaian datar (`isPrimary: false`), namun jika produk hanya
 * memiliki gambar model, query tetap mengambil gambar yang tersedia (tidak kosong).
 */
const adminOrderInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  address: true,
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          // Mengurutkan isPrimary: 'asc' (false dulu = cloth, lalu true = model).
          // Ini mencegah array gambar kosong jika produk hanya punya foto model.
          images: {
            orderBy: { isPrimary: 'asc' },
            select: { url: true, isPrimary: true },
            take: 1,
          },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

type AdminOrderPayload = Prisma.OrderGetPayload<{ include: typeof adminOrderInclude }>;

class AdminService {
  /**
   * Helper serialisasi:
   * 1. Mengubah Decimal Prisma menjadi number JavaScript.
   * 2. Fallback Snapshot Alamat: Jika customer menghapus alamat dari buku alamatnya,
   *    backend otomatis merekonstruksi objek alamat dari field snapshot `shipping...`
   *    agar halaman detail pesanan admin tidak rusak/null.
   */
  private static serializeOrder(order: AdminOrderPayload) {
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

  /**
   * Mengambil statistik ringkas dashboard admin:
   * Menggunakan `Promise.all` ketimbang `$transaction` untuk operasi read-only agregasi.
   * Ini memanfaatkan connection pool PostgreSQL dengan optimal dan mencegah
   * warning `DeprecationWarning: Calling client.query() concurrently` pada driver pg.
   */
  static async getDashboardStats() {
    const [
      revenueAggregate,
      totalOrders,
      ordersByStatusGroup,
      totalProducts,
      publishedProducts,
      totalCustomers,
      lowStockProducts,
    ] = await Promise.all([
      // 1. Akumulasi omset dari pesanan yang sah/sudah dibayar (PROCESSING & DELIVERED)
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['PROCESSING', 'DELIVERED'] },
        },
      }),

      // 2. Jumlah total seluruh pesanan
      prisma.order.count(),

      // 3. Rincian jumlah pesanan dikelompokkan berdasarkan status
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // 4. Jumlah seluruh produk
      prisma.product.count(),

      // 5. Jumlah produk aktif di etalase
      prisma.product.count({
        where: { isPublished: true },
      }),

      // 6. Jumlah pelanggan aktif terdaftar
      prisma.user.count({
        where: { role: 'customer' },
      }),

      // 7. Ambil produk AKTIF (isPublished: true) yang stoknya menipis (<= 5).
      // Filter isPublished penting agar produk draft usang tidak mencemari alert restock.
      prisma.product.findMany({
        where: {
          isPublished: true,
          stock: { lte: 5 },
        },
        orderBy: { stock: 'asc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          stock: true,
          price: true,
          category: {
            select: { name: true },
          },
          images: {
            orderBy: { isPrimary: 'asc' },
            select: { url: true },
            take: 1,
          },
        },
      }),
    ]);

    // Format groupBy menjadi objek terstruktur yang stabil untuk frontend chart/card
    const ordersByStatus: Record<OrderStatus, number> = {
      PENDING: 0,
      PROCESSING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const group of ordersByStatusGroup) {
      ordersByStatus[group.status] = group._count._all;
    }

    return {
      revenue: {
        totalRevenue: revenueAggregate._sum.totalAmount
          ? revenueAggregate._sum.totalAmount.toNumber()
          : 0,
      },
      orders: {
        totalOrders,
        byStatus: ordersByStatus,
      },
      products: {
        totalProducts,
        publishedProducts,
        draftProducts: totalProducts - publishedProducts,
      },
      customers: {
        totalCustomers,
      },
      lowStockProducts: lowStockProducts.map((p) => ({
        ...p,
        price: p.price.toNumber(),
      })),
    };
  }

  /**
   * Mengambil data produk untuk tabel admin (termasuk produk draft `isPublished: false`).
   * Sanitasi input query search dilakukan untuk mencegah full table scan yang tidak perlu.
   */
  static async findAllProducts(params: GetAdminProductsQuery) {
    const { page, limit, search, category, isPublished, sortBy } = params;
    const skip = (page - 1) * limit;

    const where: ProductWhereInput = {};

    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    if (category) {
      where.category = { slug: category };
    }

    // Hanya lakukan pencarian teks jika query string tidak kosong setelah di-trim
    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { name: { contains: trimmedSearch, mode: 'insensitive' } },
        { description: { contains: trimmedSearch, mode: 'insensitive' } },
      ];
    }

    let orderBy: ProductOrderByWithRelationInput;
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'stock-asc':
        orderBy = { stock: 'asc' };
        break;
      case 'stock-desc':
        orderBy = { stock: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [totalItems, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            select: { id: true, url: true, isPrimary: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: products.map((product) => ({
        ...product,
        price: product.price.toNumber(),
      })),
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

  /**
   * Mengambil seluruh riwayat pesanan semua pelanggan.
   * Pencarian fleksibel mencakup nomor pesanan, nama customer, atau email customer.
   */
  static async findAllOrders(params: GetAdminOrdersQuery) {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { orderNumber: { contains: trimmedSearch, mode: 'insensitive' } },
        { user: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
        { user: { email: { contains: trimmedSearch, mode: 'insensitive' } } },
      ];
    }

    const [totalItems, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: adminOrderInclude,
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

  /**
   * Mengubah status pesanan dengan proteksi integritas tingkat tinggi:
   * 1. Validasi State Machine (Mencegah loncatan status ilegal seperti DELIVERED -> PENDING).
   * 2. Atomic Optimistic Locking (Mencegah duplikasi stok akibat double-request simultan).
   * 3. Atomic Stock Decrement (Mencegah stok minus saat pesanan batal diaktifkan kembali).
   * 4. Sinkronisasi status pembayaran `paidAt`.
   */
  static async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const updatedOrder = await prisma.$transaction(
      async (tx) => {
        // Cari order berdasarkan ID atau orderNumber
        const order = await tx.order.findFirst({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, stock: true },
                },
              },
            },
          },
        });

        if (!order) {
          throw new NotFoundError('Pesanan tidak ditemukan');
        }

        const previousStatus = order.status;

        // Jika status tidak berubah, langsung kembalikan data terkini
        if (previousStatus === newStatus) {
          return tx.order.findUniqueOrThrow({
            where: { id: order.id },
            include: adminOrderInclude,
          });
        }

        // 1. Validasi State Machine
        const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[previousStatus];
        if (!allowedTransitions.includes(newStatus)) {
          throw new BadRequestError(
            `Perubahan status pesanan dari "${previousStatus}" menjadi "${newStatus}" tidak diizinkan`,
          );
        }

        // 2. Transisi Menuju CANCELLED: Kembalikan stok barang ke inventaris
        if (newStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // 3. Transisi Dari CANCELLED Kembali ke Aktif: Kurangi stok secara ATOMIK
        // Menggunakan updateMany bersyarat `stock >= quantity` untuk mencegah stok menjadi minus
        // jika barang tersebut sudah terlanjur dibeli orang lain saat pesanan dibatalkan.
        if (previousStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
          for (const item of order.items) {
            const result = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.quantity },
              },
              data: { stock: { decrement: item.quantity } },
            });

            if (result.count === 0) {
              throw new BadRequestError(
                `Gagal mengaktifkan pesanan: Stok "${item.product.name}" tidak mencukupi untuk memenuhi pesanan ini`,
              );
            }
          }
        }

        // 4. Pengaturan otomatis timestamp `paidAt`
        const shouldSetPaidAt =
          (newStatus === 'PROCESSING' || newStatus === 'DELIVERED') && !order.paidAt;
        const shouldResetPaidAt = newStatus === 'PENDING';

        // 5. Optimistic Locking: Hanya update jika status di database masih `previousStatus`.
        // Jika ada request lain yang mendahului mengubah status ini, count akan 0 dan transaksi rollback.
        const updateResult = await tx.order.updateMany({
          where: {
            id: order.id,
            status: previousStatus,
          },
          data: {
            status: newStatus,
            ...(shouldSetPaidAt ? { paidAt: new Date() } : {}),
            ...(shouldResetPaidAt ? { paidAt: null } : {}),
          },
        });

        if (updateResult.count === 0) {
          throw new BadRequestError(
            'Status pesanan telah diperbarui oleh proses lain, silakan muat ulang halaman',
          );
        }

        return tx.order.findUniqueOrThrow({
          where: { id: order.id },
          include: adminOrderInclude,
        });
      },
      {
        timeout: 10_000,
      },
    );

    return this.serializeOrder(updatedOrder);
  }
}

export default AdminService;
