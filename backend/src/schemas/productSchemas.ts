import { z } from 'zod';

const createProductSchema = z.object({
  name: z
    .string()
    .min(10, 'Panjang nama produk minimal 10 karakter')
    .max(50, 'Panjang nama produk maksimal 50 karakter'),
  description: z
    .string()
    .min(30, 'Panjang deskripsi produk minimal 30 karakter')
    .max(200, 'Panjang deskripsi produk maksimal 200 karakter'),
  price: z.coerce.number().positive('Harga harus lebih dari 0'),
  stock: z.coerce.number().int().min(0).optional(),
  isPublished: z.preprocess(
    (val) => (val === undefined ? undefined : val === 'true' || val === true),
    z.boolean().optional(),
  ),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
});

const updateProductSchema = createProductSchema.partial();

const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'newest', 'oldest', 'relevant']).optional(),
});

type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
type CreateProductInput = z.infer<typeof createProductSchema>;
type UpdateProductInput = z.infer<typeof updateProductSchema>;

export {
  type CreateProductInput,
  createProductSchema,
  type GetProductsQuery,
  getProductsQuerySchema,
  type UpdateProductInput,
  updateProductSchema,
};
