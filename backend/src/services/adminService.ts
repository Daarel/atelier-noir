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

// Aturan transisi status pesanan untuk menjaga konsistensi state machine
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: ['PENDING', 'PROCESSING'],
};

// Struktur relasi lengkap data pesanan untuk kebutuhan panel admin
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
  // Serialisasi data pesanan dan fallback ke snapshot alamat jika data master dihapus
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

  // Agregasi statistik menyeluruh untuk dashboard manajemen admin
  static async getDashboardStats() {
    // Jalankan seluruh query agregasi secara paralel tanpa membebani connection pool tunggal
    const [
      revenueAggregate,
      totalOrders,
      ordersByStatusGroup,
      totalProducts,
      publishedProducts,
      totalCustomers,
      lowStockProducts,
    ] = await Promise.all([
      // Hitung total pendapatan dari pesanan yang sukses dibayar atau telah terkirim
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['PROCESSING', 'DELIVERED'] },
        },
      }),

      // Hitung total keseluruhan pesanan yang masuk
      prisma.order.count(),

      // Hitung distribusi jumlah pesanan per status saat ini
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // Hitung total keseluruhan produk di katalog
      prisma.product.count(),

      // Hitung produk yang sedang tayang aktif untuk pembeli
      prisma.product.count({
        where: { isPublished: true },
      }),

      // Hitung jumlah akun pelanggan terdaftar
      prisma.user.count({
        where: { role: 'customer' },
      }),

      // Ambil daftar produk dengan stok menipis untuk peringatan inventaris
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

    // Format sebaran pesanan per status dengan nilai dasar nol
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

  // Mengambil daftar seluruh produk katalog dengan filter dan paginasi untuk admin
  static async findAllProducts(params: GetAdminProductsQuery) {
    const { page, limit, search, category, isPublished, sortBy } = params;
    const skip = (page - 1) * limit;

    const where: ProductWhereInput = {};

    // Filter status publikasi jika disediakan pada parameter
    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    // Filter kategori berdasarkan slug jika dipilih
    if (category) {
      where.category = { slug: category };
    }

    // Filter pencarian teks pada nama atau deskripsi produk
    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { name: { contains: trimmedSearch, mode: 'insensitive' } },
        { description: { contains: trimmedSearch, mode: 'insensitive' } },
      ];
    }

    // Tentukan urutan data berdasarkan kriteria sortBy
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

    // Ambil total data dan daftar produk dalam satu transaksi baca
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

  // Mengambil seluruh pesanan masuk dengan filter status dan pencarian kata kunci
  static async findAllOrders(params: GetAdminOrdersQuery) {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: OrderWhereInput = {};

    // Filter pesanan berdasarkan status tertentu
    if (status) {
      where.status = status;
    }

    // Filter pencarian pada nomor pesanan atau identitas pengguna
    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { orderNumber: { contains: trimmedSearch, mode: 'insensitive' } },
        { user: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
        { user: { email: { contains: trimmedSearch, mode: 'insensitive' } } },
      ];
    }

    // Ambil total data dan rekaman pesanan yang terurut dari terbaru
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

  // Memperbarui status pesanan dengan validasi transisi dan sinkronisasi stok otomatis
  static async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const updatedOrder = await prisma.$transaction(
      async (tx) => {
        // Cari data pesanan berdasarkan ID primer atau nomor faktur pesanan
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

        // Jika status yang dituju sama persis maka tidak perlu melakukan perubahan data
        if (previousStatus === newStatus) {
          return tx.order.findUniqueOrThrow({
            where: { id: order.id },
            include: adminOrderInclude,
          });
        }

        // Validasi alur transisi status sesuai aturan bisnis yang berlaku
        const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[previousStatus];
        if (!allowedTransitions.includes(newStatus)) {
          throw new BadRequestError(
            `Perubahan status pesanan dari "${previousStatus}" menjadi "${newStatus}" tidak diizinkan`,
          );
        }

        // Kembalikan kuantitas stok ke inventaris produk jika pesanan dibatalkan
        if (newStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // Kurangi kembali stok jika pesanan yang sebelumnya batal diaktifkan kembali
        if (previousStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
          for (const item of order.items) {
            const result = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.quantity },
              },
              data: { stock: { decrement: item.quantity } },
            });

            // Batalkan perubahan jika stok produk sudah tidak mencukupi untuk dipulihkan
            if (result.count === 0) {
              throw new BadRequestError(
                `Gagal mengaktifkan pesanan: Stok "${item.product.name}" tidak mencukupi untuk memenuhi pesanan ini`,
              );
            }
          }
        }

        // Atur penanda waktu bayar jika status beralih ke proses atau terkirim
        const shouldSetPaidAt =
          (newStatus === 'PROCESSING' || newStatus === 'DELIVERED') && !order.paidAt;
        const shouldResetPaidAt = newStatus === 'PENDING';

        // Lakukan pembaruan status pesanan atomik dengan optimistic concurrency check
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

        // Pastikan tidak ada benturan pembaruan oleh sesi admin lain pada detik yang sama
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
