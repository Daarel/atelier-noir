import type { ErrorRequestHandler } from 'express';
import { treeifyError, ZodError } from 'zod';

import { AppError } from '@/errors/error.js';

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

  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
