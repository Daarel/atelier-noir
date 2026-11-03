import type { NextFunction, Request, Response } from 'express';

import PaymentService from '@/services/paymentService.js';

class PaymentController {
  /**
   * @desc Melakukan simulasi pembayaran terhadap pesanan
   * @route POST /api/v1/payments/:orderNumber
   * @access Private
   */
  static async payOrder(req: Request<{ orderNumber: string }>, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { orderNumber } = req.params;

      const result = await PaymentService.confirmPayment(orderNumber, userId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default PaymentController;
