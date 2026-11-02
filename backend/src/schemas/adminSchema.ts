import { z } from 'zod';

import { OrderStatus } from '@/generated/prisma/enums.js';

const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus, {
    error: 'Status pesanan tidak valid',
  }),
});

const getAdminProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().trim().max(50).optional(),
  search: z.string().trim().max(100).optional(),
  isPublished: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  sortBy: z
    .enum(['price-asc', 'price-desc', 'newest', 'oldest', 'stock-asc', 'stock-desc'])
    .optional(),
});

const getAdminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(OrderStatus).optional(),
  search: z.string().trim().max(100).optional(),
});

type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
type GetAdminProductsQuery = z.infer<typeof getAdminProductsQuerySchema>;
type GetAdminOrdersQuery = z.infer<typeof getAdminOrdersQuerySchema>;

export {
  type GetAdminOrdersQuery,
  getAdminOrdersQuerySchema,
  type GetAdminProductsQuery,
  getAdminProductsQuerySchema,
  type UpdateOrderStatusInput,
  updateOrderStatusSchema,
};
