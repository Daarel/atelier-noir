import express from 'express';

import PaymentController from '@/controllers/paymentController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:orderNumber', requireAuth, PaymentController.payOrder);
router.post('/pay/:orderNumber', requireAuth, PaymentController.payOrder);

export default router;
