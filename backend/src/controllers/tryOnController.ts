import type { NextFunction, Request, Response } from 'express';

import { tryOnSchema } from '@/schemas/tryOnSchema.js';
import TryOnService from '@/services/tryOnService.js';

class TryOnController {
  /**
   * @desc Generate virtual try-on image menggunakan model AI
   * @route POST /api/v1/try-on
   * @access Private
   */
  static async generate(req: Request, res: Response, next: NextFunction) {
    try {
      req.setTimeout(120_000);
      res.setTimeout(120_000);

      const validatedData = tryOnSchema.parse(req.body);
      const result = await TryOnService.generateTryOn(validatedData, req.file);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default TryOnController;
