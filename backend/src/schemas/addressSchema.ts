import z from 'zod';

const createAddressSchema = z.object({
  recipientName: z
    .string()
    .min(3, 'Panjang nama penerima minimal 3 karakter')
    .max(50, 'Panjang nama penerima maksimal 50 karakter'),
  phoneNumber: z
    .string()
    .min(8, 'Panjang nomor telepon minimal 8 karakter')
    .max(20, 'Panjang nomor telepon maksimal 20 karakter')
    .regex(
      /^(\+62|62|0)[0-9]{8,15}$/,
      'Format nomor telepon tidak valid (contoh: 08123456789 atau +628123456789)',
    ),
  streetAddress: z
    .string()
    .min(5, 'Panjang alamat minimal 5 karakter')
    .max(255, 'Panjang alamat maksimal 255 karakter'),
  city: z
    .string()
    .min(2, 'Panjang kota atau kabupaten minimal 2 karakter')
    .max(100, 'Panjang kota atau kabupaten maksimal 100 karakter'),
  province: z
    .string()
    .min(2, 'Panjang provinsi minimal 2 karakter')
    .max(100, 'Panjang provinsi maksimal 100 karakter'),
  postalCode: z
    .string()
    .min(3, 'Kode pos minimal 3 karakter')
    .max(10, 'Kode pos maksimal 10 karakter'),
  isDefault: z.boolean().optional(),
});

const updateAddressSchema = createAddressSchema.partial();

type CreateAddressInput = z.infer<typeof createAddressSchema>;
type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export {
  type CreateAddressInput,
  createAddressSchema,
  type UpdateAddressInput,
  updateAddressSchema,
};
