import express from 'express';

import AdminController from '@/controllers/adminController.js';
import { requireAdmin, requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/products', AdminController.getProducts);
router.get('/orders', AdminController.getOrders);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

export default router;
