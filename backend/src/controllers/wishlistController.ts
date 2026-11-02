import type { NextFunction, Request, Response } from 'express';

import WishlistService from '@/services/wishlistService.js';

class WishlistController {
  /**
   * @desc Mengambil semua produk di wishlist user
   * @route GET /api/v1/wishlist
   * @acc Private
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const wishlist = await WishlistService.findUserWishlist(userId);

      return res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menambahkan produk ke wishlist
   * @route POST /api/v1/wishlist/:productId
   * @acc Private
   */
  static async add(req: Request<{ productId: string }>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const item = await WishlistService.addToWishlist(userId, productId);

      return res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan ke wishlist',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menghapus produk dari wishlist
   * @route DELETE /api/v1/wishlist/:productId
   * @acc Private
   */
  static async remove(req: Request<{ productId: string }>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      await WishlistService.removeFromWishlist(userId, productId);

      return res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus dari wishlist',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Toggle status wishlist produk (on/off)
   * @route PATCH /api/v1/wishlist/:productId/toggle atau PATCH /api/v1/wishlist/:productId
   * @acc Private
   */
  static async toggle(req: Request<{ productId: string }>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const result = await WishlistService.toggleWishlist(userId, productId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default WishlistController;
