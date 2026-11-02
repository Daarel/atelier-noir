import { BadRequestError, NotFoundError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';
import type { AddToCartInput, UpdateCartItemInput } from '@/schemas/cartSchema.js';

class CartService {
  private static async findOrCreate(userId: string) {
    return await prisma.cart.upsert({
      where: { userId },
      create: {
        userId,
      },
      update: {},
    });
  }

  static async findAllAndTotalCartItems(userId: string) {
    const cart = await prisma.cart.upsert({
      where: {
        userId,
      },
      create: {
        userId,
      },
      update: {},
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                stock: true,
                images: {
                  where: { isPrimary: false },
                  select: { url: true },
                },
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    const totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price.toNumber(),
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      totalQuantity,
      totalAmount,
      items: cart.items,
      updatedAt: cart.updatedAt,
    };
  }

  static async addToCart(data: AddToCartInput, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true, stock: true, isPublished: true },
    });

    if (!product || !product.isPublished) throw new NotFoundError('Produk tidak tersedia');

    const cart = await this.findOrCreate(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: data.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;

      if (newQuantity > product.stock) throw new BadRequestError('Stok produk tidak mencukupi');

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      if (data.quantity > product.stock) {
        throw new BadRequestError('Stok produk tidak mencukupi');
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          quantity: data.quantity,
        },
      });
    }

    return await this.findAllAndTotalCartItems(userId);
  }

  static async updateCartItem(userId: string, itemId: string, data: UpdateCartItemInput) {
    const item = await prisma.cartItem.findUnique({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: {
        product: {
          select: {
            stock: true,
          },
        },
      },
    });

    if (!item) throw new NotFoundError('Item tidak ditemukan di dalam keranjang Anda');

    if (data.quantity > item.product.stock)
      throw new BadRequestError('Stok produk tidak mencukupi, kurangkan jumlah pembelian');

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
    });

    return await this.findAllAndTotalCartItems(userId);
  }

  static async removeCartItem(userId: string, itemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: {
        id: itemId,
        cart: { userId },
      },
    });
    if (!item) {
      throw new NotFoundError('Item tidak ditemukan di keranjang Anda');
    }
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    return await this.findAllAndTotalCartItems(userId);
  }

  static async clearCart(userId: string) {
    const cart = await this.findAllAndTotalCartItems(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return await this.findAllAndTotalCartItems(userId);
  }
}

export default CartService;
