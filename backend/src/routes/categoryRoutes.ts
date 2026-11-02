import express from 'express';

import CategoryController from '@/controllers/categoryController.js';
import { requireAdmin, requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(CategoryController.findAll)
  .post(requireAuth, requireAdmin, CategoryController.create);
router.route('/:slug').get(CategoryController.findDetail);
router
  .route('/:id')
  .patch(requireAuth, requireAdmin, CategoryController.update)
  .delete(requireAuth, requireAdmin, CategoryController.remove);

export default router;
