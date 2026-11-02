import express from 'express';

import AddressController from '@/controllers/addressController.js';
import { requireAuth } from '@/middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(requireAuth, AddressController.findAll)
  .post(requireAuth, AddressController.create);
router.route('/:id').get(requireAuth, AddressController.findDetail);
router
  .route('/:id')
  .patch(requireAuth, AddressController.update)
  .delete(requireAuth, AddressController.remove);

export default router;
