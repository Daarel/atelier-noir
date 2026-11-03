import { z } from 'zod';

export const tryOnSchema = z.object({
  productId: z
    .string({
      error: 'Product ID wajib diisi',
    })
    .min(1, 'Product ID tidak boleh kosong'),
  garmentDescription: z.string().optional(),
});

export type TryOnInput = z.infer<typeof tryOnSchema>;
