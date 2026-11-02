import express from 'express';

import OrderController from '@/controllers/orderController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.route('/').get(OrderController.findAll).post(OrderController.create);
router.route('/:orderNumber').get(OrderController.findDetail);
router.route('/:orderNumber/cancel').patch(OrderController.cancel);

export default router;
