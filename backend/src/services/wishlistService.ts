import { NotFoundError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';

class WishlistService {
  static async findUserWishlist(userId: string) {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              select: { id: true, url: true, isPrimary: true },
            },
          },
        },
      },
    });

    return wishlists.map((w) => ({
      ...w.product,
      wishlistId: w.id,
      wishlistedAt: w.createdAt,
    }));
  }

  static async addToWishlist(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isPublished) {
      throw new NotFoundError('Produk tidak ditemukan atau tidak tersedia');
    }

    const wishlistItem = await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
    });

    return wishlistItem;
  }

  static async removeFromWishlist(userId: string, productId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Produk tidak ditemukan di wishlist Anda');
    }

    await prisma.wishlist.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }

  static async toggleWishlist(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isPublished) {
      throw new NotFoundError('Produk tidak ditemukan atau tidak tersedia');
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { isWishlisted: false, message: 'Produk dihapus dari wishlist' };
    }

    await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });

    return { isWishlisted: true, message: 'Produk berhasil ditambahkan ke wishlist' };
  }
}

export default WishlistService;
