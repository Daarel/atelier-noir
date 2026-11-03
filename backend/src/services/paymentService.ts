import { BadRequestError, NotFoundError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';

class PaymentService {
  static async confirmPayment(orderNumber: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }
    if (order.status === 'PROCESSING' || order.status === 'DELIVERED') {
      throw new BadRequestError('Pesanan ini sudah dibayar sebelumnya');
    }
    if (order.status === 'CANCELLED') {
      throw new BadRequestError('Pesanan ini sudah dibatalkan dan tidak dapat dibayar');
    }

    const updateResult = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: 'PENDING',
      },
      data: {
        status: 'PROCESSING',
        paidAt: new Date(),
      },
    });

    if (updateResult.count === 0) {
      throw new BadRequestError('Pembayaran sedang diproses oleh request lain');
    }

    const updatedOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
    });

    return {
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      paymentMethod: updatedOrder.paymentMethod,
      totalAmount: updatedOrder.totalAmount.toNumber(),
      paidAt: updatedOrder.paidAt,
    };
  }
}

export default PaymentService;
