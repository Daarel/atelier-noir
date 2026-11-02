import express from 'express';

import WishlistController from '@/controllers/wishlistController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(requireAuth, WishlistController.findAll);
router
  .route('/:productId')
  .post(requireAuth, WishlistController.add)
  .delete(requireAuth, WishlistController.remove)
  .patch(requireAuth, WishlistController.toggle);
router.route('/:productId/toggle').patch(requireAuth, WishlistController.toggle);

export default router;
