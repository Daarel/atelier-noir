import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP Anda, silakan coba lagi setelah 15 menit',
  },
});

export const tryOnLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Batas kuota AI Virtual Try-On tercapai (maks 5x per 10 menit). Silakan coba lagi nanti.',
  },
});
