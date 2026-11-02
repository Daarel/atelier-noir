import type { NextFunction, Request, Response } from 'express';

import { createOrderSchema, getOrdersQuerySchema } from '@/schemas/orderSchema.js';
import OrderService from '@/services/orderService.js';

class OrderController {
  /**
   * @desc Checkout: membuat pesanan baru dari isi keranjang
   * @route POST /api/v1/orders
   * @acc Private
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = createOrderSchema.parse(req.body);

      const order = await OrderService.createOrder(userId, data);

      return res.status(201).json({
        success: true,
        message: 'Pesanan berhasil dibuat',
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil riwayat pesanan milik user
   * @route GET /api/v1/orders
   * @acc Private
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const query = getOrdersQuerySchema.parse(req.query);

      const result = await OrderService.findUserOrders(userId, query);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil detail pesanan berdasarkan nomor pesanan
   * @route GET /api/v1/orders/:orderNumber
   * @acc Private
   */
  static async findDetail(
    req: Request<{ orderNumber: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { orderNumber } = req.params;
      const { id: userId, role } = req.user!;

      const order = await OrderService.findOrderByNumber(orderNumber, userId, role === 'admin');

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Membatalkan pesanan yang masih berstatus PENDING
   * @route PATCH /api/v1/orders/:orderNumber/cancel
   * @acc Private
   */
  static async cancel(req: Request<{ orderNumber: string }>, res: Response, next: NextFunction) {
    try {
      const { orderNumber } = req.params;
      const userId = req.user!.id;

      const order = await OrderService.cancelOrder(orderNumber, userId);

      return res.status(200).json({
        success: true,
        message: 'Pesanan berhasil dibatalkan',
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default OrderController;
