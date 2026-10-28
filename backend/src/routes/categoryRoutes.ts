import express from 'express';

import CategoryController from '@/controllers/categoryController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(CategoryController.findAll).post(requireAuth, CategoryController.create);
router.route('/:slug').get(CategoryController.findDetail);
router
  .route('/:id')
  .patch(requireAuth, CategoryController.update)
  .delete(requireAuth, CategoryController.remove);

export default router;
