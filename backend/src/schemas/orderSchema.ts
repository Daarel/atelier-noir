import { z } from 'zod';

import { OrderStatus } from '@/generated/prisma/enums.js';

const PAYMENT_METHODS = ['bank_transfer', 'qris', 'e_wallet'] as const;

const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Alamat pengiriman wajib dipilih'),
  notes: z
    .string()
    .trim()
    .max(255, 'Catatan pesanan maksimal 255 karakter')
    .optional()
    .transform((val) => (val ? val : undefined)),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: 'Metode pembayaran tidak valid',
  }),
});

const getOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(OrderStatus).optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;
type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;

export { type CreateOrderInput, createOrderSchema, type GetOrdersQuery, getOrdersQuerySchema };
