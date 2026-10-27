import cloudinary, { uploadToCloudinary } from '@/config/cloudinary.js';
import { NotFoundError } from '@/errors/error.js';
import type {
  ProductOrderByWithRelationInput,
  ProductWhereInput,
} from '@/generated/prisma/models.js';
import { prisma } from '@/lib/prisma.js';
import type { ProductImageFiles } from '@/middlewares/uploadMiddleware.js';
import type {
  CreateProductInput,
  GetProductsQuery,
  UpdateProductInput,
} from '@/schemas/productSchemas.js';

export type ProductSortBy = 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'relevant';

class ProductService {
  static async getAll(params: GetProductsQuery) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where: ProductWhereInput = {
      isPublished: true,
    };

    if (params.search) {
      where.OR = [
        {
          name: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (params.category) {
      where.category = {
        slug: params.category,
      };
    }

    let orderBy: ProductOrderByWithRelationInput;

    switch (params.sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [totalItems, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            select: { id: true, url: true, isPrimary: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    if (!products) throw new NotFoundError('Produk tidak ditemukan');

    return {
      data: products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getDetail(productSlug: string) {
    const product = await prisma.product.findUnique({
      where: {
        slug: productSlug,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          select: { id: true, url: true, isPrimary: true },
        },
      },
    });

    if (!product) throw new NotFoundError('Produk tidak ditemukan');

    return product;
  }

  static async create(data: CreateProductInput, files?: ProductImageFiles) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const [clothImg, modelImg] = await Promise.all([
      files?.cloth?.[0] ? uploadToCloudinary(files.cloth[0].buffer, 'atelier-noir/cloth') : null,
      files?.model?.[0] ? uploadToCloudinary(files.model[0].buffer, 'atelier-noir/model') : null,
    ]);
    const images = [
      ...(clothImg ? [{ ...clothImg, isPrimary: true }] : []),
      ...(modelImg ? [{ ...modelImg, isPrimary: false }] : []),
    ];

    return await prisma.product.create({
      data: {
        ...data,
        slug,
        images: { create: images },
      },
      include: { images: true, category: true },
    });
  }

  static async update(productId: string, data: UpdateProductInput, files?: ProductImageFiles) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!existingProduct) throw new NotFoundError('Produk mungkin sudah dihapus');

    let newSlug: string | undefined;
    if (data.name && data.name !== existingProduct.name) {
      newSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const imagesToCreate: { url: string; publicId: string; isPrimary: boolean }[] = [];
    const imageIdsToDelete: string[] = [];

    if (files?.cloth?.[0]) {
      const oldClothImg = existingProduct.images.find((img) => img.isPrimary);
      if (oldClothImg) {
        if (oldClothImg.publicId) {
          await cloudinary.uploader.destroy(oldClothImg.publicId);
        }
        imageIdsToDelete.push(oldClothImg.id);
      }

      const uploadedCloth = await uploadToCloudinary(files.cloth[0].buffer, 'atelier-noir/cloth');
      imagesToCreate.push({
        url: uploadedCloth.url,
        publicId: uploadedCloth.publicId,
        isPrimary: true,
      });
    }

    if (files?.model?.[0]) {
      const oldModelImg = existingProduct.images.find((img) => !img.isPrimary);
      if (oldModelImg) {
        if (oldModelImg.publicId) {
          await cloudinary.uploader.destroy(oldModelImg.publicId);
        }
        imageIdsToDelete.push(oldModelImg.id);
      }

      const uploadedModel = await uploadToCloudinary(files.model[0].buffer, 'atelier-noir/model');
      imagesToCreate.push({
        url: uploadedModel.url,
        publicId: uploadedModel.publicId,
        isPrimary: false,
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        ...(newSlug ? { slug: newSlug } : {}),
        ...(imagesToCreate.length > 0
          ? {
              images: {
                deleteMany: { id: { in: imageIdsToDelete } },
                create: imagesToCreate,
              },
            }
          : {}),
      },
      include: {
        images: true,
        category: true,
      },
    });

    return updatedProduct;
  }

  static async remove(productId: string) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) throw new NotFoundError('Produk mungkin sudah dihapus');

    const removeProduct = await prisma.product.delete({
      where: { id: productId },
    });

    return removeProduct;
  }
}

export default ProductService;
