import express from 'express';

import ProductController from '@/controllers/productController.js';
import { requireAdmin, requireAuth } from '@/middlewares/authMiddleware.js';
import { uploadProductImages } from '@/middlewares/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(ProductController.findAll)
  .post(requireAuth, requireAdmin, uploadProductImages, ProductController.create);
router.route('/:slug').get(ProductController.findDetail);
router
  .route('/:id')
  .patch(requireAuth, requireAdmin, uploadProductImages, ProductController.update)
  .delete(requireAuth, requireAdmin, ProductController.remove);

export default router;
