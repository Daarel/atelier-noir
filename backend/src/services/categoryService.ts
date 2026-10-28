import { NotFoundError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/schemas/categorySchemas.js';

class CategoryService {
  static async findAllCategories() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  static async findCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug: slug },
    });

    if (!category) throw new NotFoundError('Kategori tidak ditemukan');

    return category;
  }

  static async createCategory(data: CreateCategoryInput) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const addedCategory = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });

    return addedCategory;
  }

  static async updateCategoryById(categoryId: string, data: UpdateCategoryInput) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) throw new NotFoundError('Produk mungkin sudah dihapus');

    let newSlug: string | undefined;
    if (data.name && data.name !== existingCategory.name) {
      newSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...data,
        ...(newSlug ? { slug: newSlug } : {}),
      },
    });

    return updatedCategory;
  }

  static async removeCategoryById(categoryId: string) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) throw new NotFoundError('Kategori mungkin sudah dihapus');

    const removedProduct = await prisma.category.delete({
      where: { id: categoryId },
    });

    return removedProduct;
  }
}

export default CategoryService;
