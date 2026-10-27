import multer from 'multer';

import { BadRequestError } from '@/errors/error.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Format file harus berupa gambar'));
    }
  },
});

export interface ProductImageFiles {
  cloth?: Express.Multer.File[];
  model?: Express.Multer.File[];
}

export const uploadProductImages = upload.fields([
  { name: 'cloth', maxCount: 1 },
  { name: 'model', maxCount: 1 },
]);
