import type { NextFunction, Request, Response } from 'express';

import {
  getAdminOrdersQuerySchema,
  getAdminProductsQuerySchema,
  updateOrderStatusSchema,
} from '@/schemas/adminSchema.js';
import AdminService from '@/services/adminService.js';

class AdminController {
  /**
   * @desc Mengambil ringkasan statistik dashboard admin
   * @route GET /api/v1/admin/stats
   * @acc Private (Admin)
   */
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil daftar seluruh produk (aktif & draft) untuk admin
   * @route GET /api/v1/admin/products
   * @acc Private (Admin)
   */
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getAdminProductsQuerySchema.parse(req.query);
      const result = await AdminService.findAllProducts(query);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil seluruh riwayat pesanan pelanggan untuk admin
   * @route GET /api/v1/admin/orders
   * @acc Private (Admin)
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getAdminOrdersQuerySchema.parse(req.query);
      const result = await AdminService.findAllOrders(query);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengubah status pesanan pelanggan oleh admin
   * @route PATCH /api/v1/admin/orders/:id/status
   * @acc Private (Admin)
   */
  static async updateOrderStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = updateOrderStatusSchema.parse(req.body);

      const updatedOrder = await AdminService.updateOrderStatus(id, status);

      return res.status(200).json({
        success: true,
        message: 'Status pesanan berhasil diperbarui',
        data: updatedOrder,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AdminController;
