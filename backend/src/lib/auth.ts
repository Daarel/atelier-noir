import { prismaAdapter } from 'better-auth/adapters/prisma';
import { betterAuth } from 'better-auth/minimal';

import { sendEmail } from '@/lib/email.js';
import { prisma } from '@/lib/prisma.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset Password Akun - Atelier Noir',
        html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #111;">Reset Password</h2>
            <p>Halo <strong>${user.name || 'Pelanggan'}</strong>,</p>
            <p>Kami menerima permintaan untuk mereset password akun Atelier Noir kamu. Silakan klik tombol di bawah ini untuk membuat password baru:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Atau kamu bisa memasukkan kode token verifikasi ini langsung di aplikasi:</p>
            <div style="background: #f4f4f5; padding: 12px; font-family: monospace; font-size: 16px; letter-spacing: 2px; text-align: center; border-radius: 6px; font-weight: bold;">
              ${token}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">Jika kamu tidak merasa meminta reset password, silakan abaikan email ini.</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verifikasi Alamat Email - Atelier Noir',
        html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2>Selamat Datang di Atelier Noir!</h2>
          <p>Halo <strong>${user.name || 'Pelanggan'}</strong>,</p>
          <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah untuk memverifikasi alamat email kamu:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verifikasi Email Saya
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">Link ini berlaku selama 24 jam.</p>
        </div>
      `,
      });
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: ['http://localhost:5173'],
});
