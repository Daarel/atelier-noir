import z from 'zod';

export const loginSchema = z.object({
  email: z.email().min(1, 'Email wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type loginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    username: z.string().min(5, 'Nama minimal 5 karakter'),
    email: z.email().min(1, 'Email wajib diisi'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type signupFormValues = z.infer<typeof signupSchema>;
