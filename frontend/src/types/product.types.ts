export interface ProductBadge {
  text: string;
  variant: 'dark' | 'light';
}

export type ProductCategory = 'SEMUA' | 'ATASAN & KAOS' | 'JAKET & OUTER' | 'CELANA' | 'DRESS';

export interface ProductImage {
  id: string;
  url: string;
  publicId?: string | null;
  isPrimary: boolean;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductItem {
  id: string;
  badge?: ProductBadge;
  category: string;
  name: string;
  price: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  isPublished: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  page?: number;
  limit?: number;
}
