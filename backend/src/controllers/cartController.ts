import type { NextFunction, Request, Response } from 'express';

import { addToCartSchema, updateCartItemSchema } from '@/schemas/cartSchema.js';
import CartService from '@/services/cartService.js';

class CartController {
  /**
   * @desc Mengambil semua data keranjang belanja
   * @route /api/v1/cart
   * @acc Private
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const cart = await CartService.findAllAndTotalCartItems(userId);

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menambahkan produk ke keranjang belanja
   * @route /api/v1/cart/items
   * @acc Private
   */
  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = addToCartSchema.parse(req.body);
      const userId = req.user!.id;

      const newCart = await CartService.addToCart(data, userId);

      return res.status(200).json({
        success: true,
        data: newCart,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengubah produk keranjang belanja
   * @route /api/v1/cart/items/:id
   * @acc Private
   */
  static async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = updateCartItemSchema.parse(req.body);

      const updatedCart = await CartService.updateCartItem(userId, id, data);

      return res.status(200).json({
        success: true,
        message: 'Produk berhasil diubah',
        data: updatedCart,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menghapus produk keranjang belanja
   * @route /api/v1/cart/items/:id
   * @acc Private
   */
  static async remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const removedProduct = await CartService.removeCartItem(userId, id);

      return res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus dari keranjang',
        data: removedProduct,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menghapus semua produk dari keranjang belanja
   * @route /api/v1/cart
   * @acc Private
   */
  static async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      await CartService.clearCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Keranjang belanja berhasil dibersihkan',
      });
    } catch (err) {
      next(err);
    }
  }
}

export default CartController;
