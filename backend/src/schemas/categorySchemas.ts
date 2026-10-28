import z from 'zod';

const createCategorySchema = z.object({
  name: z
    .string()
    .min(5, 'Panjang kategori produk minimal 5 karakter')
    .max(30, 'panjang kategori produk maksimal 10 karakter'),
  description: z
    .string()
    .min(30, 'Panjang nama produk minimal 30 karakter')
    .max(200, 'Panjang deskripsi produk maksimal 200 karakter')
    .optional(),
});

const updateCategorySchema = createCategorySchema.partial();

type CreateCategoryInput = z.infer<typeof createCategorySchema>;
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export {
  type CreateCategoryInput,
  createCategorySchema,
  type UpdateCategoryInput,
  updateCategorySchema,
};
