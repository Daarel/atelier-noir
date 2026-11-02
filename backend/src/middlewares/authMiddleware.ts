import { fromNodeHeaders } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthorizedError } from '@/errors/error.js';
import { auth } from '@/lib/auth.js';

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new UnauthorizedError('Silakan login terlebih dahulu');
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Silakan login terlebih dahulu');
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Akses terbatas untuk Administrator');
    }

    next();
  } catch (err) {
    next(err);
  }
};
