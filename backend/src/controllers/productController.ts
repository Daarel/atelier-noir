import type { NextFunction, Request, Response } from 'express';

import type { ProductImageFiles } from '@/middlewares/uploadMiddleware.js';
import {
  createProductSchema,
  getProductsQuerySchema,
  updateProductSchema,
} from '@/schemas/productSchemas.js';
import ProductService from '@/services/productService.js';

class ProductController {
  /**
   * @desc Mengambil semua data product dengan pagination
   * @route /api/v1/productRoutes/
   * @acc Public
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getProductsQuerySchema.parse(req.query);

      const result = await ProductService.getAll(query);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menambahkan product
   * @route /api/v1/productRoutes/
   * @acc Private
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const files = req.files as ProductImageFiles | undefined;

      const newProduct = await ProductService.create(data, files);

      return res.status(201).json({
        success: true,
        message: 'Product baru berhasil ditambahkan',
        data: newProduct,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil detail product berdasarkan slug
   * @route /api/v1/productRoutes/:slug
   * @acc Public
   */
  static async getDetail(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const product = await ProductService.getDetail(slug);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengubah data product berdasarkan id
   * @route /api/v1/productRoutes/:id
   * @acc Private
   */
  static async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateProductSchema.parse(req.body);
      const files = req.files as ProductImageFiles | undefined;

      const updatedProduct = await ProductService.update(id, data, files);

      return res.status(200).json({
        success: true,
        message: 'Product berhasil di-update',
        data: updatedProduct,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menghapus product berdasarkan id
   * @route /api/v1/productRoutes/:id
   * @acc Private
   */
  static async remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await ProductService.remove(id);

      return res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus',
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ProductController;
