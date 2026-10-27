import express from 'express';

import ProductController from '@/controllers/productController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';
import { uploadProductImages } from '@/middlewares/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(ProductController.getAll)
  .post(requireAuth, uploadProductImages, ProductController.create);
router.route('/:slug').get(ProductController.getDetail);
router
  .route('/:id')
  .patch(requireAuth, uploadProductImages, ProductController.update)
  .delete(requireAuth, ProductController.remove);

export default router;
