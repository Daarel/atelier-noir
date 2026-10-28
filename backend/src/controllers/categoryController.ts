import type { NextFunction, Request, Response } from 'express';

import { createCategorySchema, updateCategorySchema } from '@/schemas/categorySchemas.js';
import CategoryService from '@/services/categoryService.js';

class CategoryController {
  /**
   * @desc Mengambil semua data category
   * @route /api/v1/categories/
   * @acc Public
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.findAllCategories();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menambahkan Kategori
   * @route /api/v1/categories/
   * @acc Private
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCategorySchema.parse(req.body);

      const newCategory = await CategoryService.createCategory(data);

      return res.status(201).json({
        success: true,
        message: 'Kategori baru berhasil ditambahkan',
        data: newCategory,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil detail kategori berdasarkan slug
   * @route /api/v1/categories/:slug
   * @acc Public
   */
  static async findDetail(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const category = await CategoryService.findCategoryBySlug(slug);

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengubah data kategori berdasarkan id
   * @route /api/v1/categories/:id
   * @acc Private
   */
  static async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateCategorySchema.parse(req.body);

      const updatedCategory = await CategoryService.updateCategoryById(id, data);

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil diubah',
        data: updatedCategory,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menghapus kategori berdasarkan id
   * @route /api/v1/categories/:id
   * @acc Private
   */
  static async remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await CategoryService.removeCategoryById(id);

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus',
      });
    } catch (err) {
      next(err);
    }
  }
}

export default CategoryController;
