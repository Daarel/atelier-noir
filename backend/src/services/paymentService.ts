import { BadRequestError, NotFoundError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';

class PaymentService {
  // Konfirmasi pembayaran pesanan oleh pelanggan dengan perlindungan concurrency
  static async confirmPayment(orderNumber: string, userId: string) {
    // Ambil data pesanan beserta rincian produk yang dipesan
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

    // Pastikan pesanan ditemukan dan dimiliki oleh pelanggan yang sesuai
    if (!order || order.userId !== userId) {
      throw new NotFoundError('Pesanan tidak ditemukan');
    }

    // Tolak proses pembayaran jika pesanan sudah berstatus lunas atau telah terkirim
    if (order.status === 'PROCESSING' || order.status === 'DELIVERED') {
      throw new BadRequestError('Pesanan ini sudah dibayar sebelumnya');
    }

    // Tolak proses pembayaran jika pesanan sebelumnya telah dibatalkan
    if (order.status === 'CANCELLED') {
      throw new BadRequestError('Pesanan ini sudah dibatalkan dan tidak dapat dibayar');
    }

    // Eksekusi pembaruan status atomik dengan kondisi status saat ini masih pending
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

    // Batalkan proses jika pembayaran telah diselesaikan oleh permintaan lain
    if (updateResult.count === 0) {
      throw new BadRequestError('Pembayaran sedang diproses oleh request lain');
    }

    // Ambil rekaman terbaru setelah pembaruan status berhasil disimpan
    const updatedOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
    });

    // Kembalikan ringkasan data pembayaran untuk kebutuhan antarmuka
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
