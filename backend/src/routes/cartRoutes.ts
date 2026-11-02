import express from 'express';

import CartController from '@/controllers/cartController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(requireAuth, CartController.findAll)
  .delete(requireAuth, CartController.clear);
router.route('/items').post(requireAuth, CartController.addToCart);
router
  .route('/items/:id')
  .patch(requireAuth, CartController.update)
  .delete(requireAuth, CartController.remove);

export default router;
