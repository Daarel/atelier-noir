import type { ProductItem } from '@/types/product.types';

export const CATEGORIES = [
  'SEMUA',
  'ATASAN & KAOS',
  'JAKET & OUTER',
  'CELANA',
  'DRESS',
] as const;

export const COLLECTION_FEATURES: readonly string[] = [
  'Koleksi lengkap dari 50+ brand pilihan',
  '100% Produk asli dan terpercaya',
  'Gratis ongkir ke seluruh Indonesia',
  'Model baru datang setiap minggu',
] as const;

export const PRODUCTS: ProductItem[] = [
  {
    id: '1',
    badge: { text: 'TERLARIS', variant: 'dark' },
    category: 'Jaket & Outer • Pria',
    name: 'Casual Wool Blend Peacoat',
    price: 'Rp 1.250.000',
  },
  {
    id: '2',
    badge: { text: 'PRODUK BARU', variant: 'light' },
    category: 'Blazer & Setelan • Wanita',
    name: 'Relaxed Tailored Blazer',
    price: 'Rp 899.000',
  },
  {
    id: '3',
    badge: { text: 'POPULER', variant: 'light' },
    category: 'Kemeja • Uniseks',
    name: 'Kemeja Katun Oxford Oversized',
    price: 'Rp 459.000',
  },
  {
    id: '4',
    category: 'Celana Panjang • Pria & Wanita',
    name: 'Pleated Wide-Leg Trousers',
    price: 'Rp 589.000',
  },
];
