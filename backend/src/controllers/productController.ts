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
   * @desc Mengambil semua produk dengan pagination
   * @route /api/v1/products/
   * @acc Public
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getProductsQuerySchema.parse(req.query);

      const result = await ProductService.findAllProducts(query);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menambahkan produk
   * @route /api/v1/products/
   * @acc Private
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const files = req.files as ProductImageFiles | undefined;

      const newProduct = await ProductService.createProduct(data, files);

      return res.status(201).json({
        success: true,
        message: 'Produk baru berhasil ditambahkan',
        data: newProduct,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil detail produk berdasarkan slug
   * @route /api/v1/products/:slug
   * @acc Public
   */
  static async findDetail(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const product = await ProductService.findProductBySlug(slug);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengubah data produk berdasarkan id
   * @route /api/v1/products/:id
   * @acc Private
   */
  static async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateProductSchema.parse(req.body);
      const files = req.files as ProductImageFiles | undefined;

      const updatedProduct = await ProductService.updateProductById(id, data, files);

      return res.status(200).json({
        success: true,
        message: 'Produk berhasil diubah',
        data: updatedProduct,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menghapus produk berdasarkan id
   * @route /api/v1/products/:id
   * @acc Private
   */
  static async remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await ProductService.removeProductById(id);

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
