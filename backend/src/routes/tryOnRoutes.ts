import express from 'express';

import TryOnController from '@/controllers/tryOnController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';
import { tryOnLimiter } from '@/middlewares/rateLimitMiddleware.js';
import { uploadTryOnImage } from '@/middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, tryOnLimiter, uploadTryOnImage, TryOnController.generate);

export default router;
