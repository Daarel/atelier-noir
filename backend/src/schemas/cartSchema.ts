import { z } from 'zod';

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Anda wajib memasukkan sebuah produk'),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Anda harus memasukkan produk')
    .max(50, 'Maksimal pembelian 50 produk'),
});

const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number()
    .min(1, 'Anda harus memasukkan produk')
    .max(50, 'Maksimal pembelian 50 produk'),
});

type AddToCartInput = z.infer<typeof addToCartSchema>;
type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export { type AddToCartInput, addToCartSchema, type UpdateCartItemInput, updateCartItemSchema };
