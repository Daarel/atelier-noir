import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { treeifyError, ZodError } from 'zod';

import { AppError } from '@/errors/error.js';
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: treeifyError(err),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Data dengan identifier slug sudah digunakan',
      });
    }
  }

  if (err instanceof MulterError) {
    return res.status(400).json({
      success: false,
      message: 'Ukuran file terlalu besar',
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
