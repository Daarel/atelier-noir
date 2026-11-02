import fs from 'node:fs';
import path from 'node:path';

import { prisma } from '../src/lib/prisma.js';

interface SeedProduct {
  filename: string;
  name: string;
  categorySlug: string;
  description: string;
  price: number;
  images: {
    url: string;
    publicId?: string | null;
    isPrimary: boolean;
  }[];
}

const SEED_FILE_PATH = path.join(import.meta.dirname, 'products_seed.json');
const CHUNK_SIZE = 50;
const FALLBACK_CATEGORY_SLUG = 'dress';

const CATEGORIES = [
  { name: 'Atasan & Kaos', slug: 'atasan-kaos' },
  { name: 'Jaket & Outer', slug: 'jaket-outer' },
  { name: 'Dress', slug: 'dress' },
];

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

/** Stok acak antara 10 - 39 */
const randomStock = () => Math.floor(Math.random() * 30) + 10;

/** Slug unik: nama-produk + kode file (misal: "silk-dress-00001-00") */
function buildProductSlug({ name, filename }: SeedProduct) {
  const fileId = filename
    ? filename.replace(/\.[^/.]+$/, '')
    : Math.random().toString(36).substring(7);

  return `${slugify(name)}-${slugify(fileId)}`;
}

/** Hapus data produk & transaksi lama (child dihapus lebih dulu karena foreign key) */
async function clearProductData() {
  console.log('Menghapus data produk dan transaksi terkait di database...');

  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
  ]);

  console.log('Data lama berhasil dibersihkan.');
}

/** Upsert kategori utama dan kembalikan map slug -> id */
async function syncCategories() {
  const categoryIdBySlug = new Map<string, string>();

  for (const { name, slug } of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    categoryIdBySlug.set(slug, category.id);
  }

  console.log('Kategori berhasil disinkronkan.');
  return categoryIdBySlug;
}

function loadSeedProducts(): SeedProduct[] {
  if (!fs.existsSync(SEED_FILE_PATH)) {
    throw new Error(
      `Berkas tidak ditemukan: ${SEED_FILE_PATH}. Pastikan file ditaruh di backend/prisma/products_seed.json`,
    );
  }

  const products: SeedProduct[] = JSON.parse(fs.readFileSync(SEED_FILE_PATH, 'utf-8'));
  console.log(`Membaca ${products.length} produk dari JSON...`);

  return products;
}

function upsertProduct(item: SeedProduct, categoryId: string) {
  const slug = buildProductSlug(item);

  return prisma.product.upsert({
    where: { slug },
    update: {},
    create: {
      name: item.name,
      slug,
      description: item.description,
      price: item.price,
      stock: randomStock(),
      isPublished: true,
      categoryId,
      images: {
        create: item.images.map(({ url, publicId, isPrimary }) => ({
          url,
          publicId: publicId || null,
          isPrimary,
        })),
      },
    },
  });
}

/** Simpan produk per chunk agar hemat koneksi DB */
async function seedProducts(products: SeedProduct[], categoryIdBySlug: Map<string, string>) {
  const fallbackCategoryId = categoryIdBySlug.get(FALLBACK_CATEGORY_SLUG)!;

  for (let i = 0; i < products.length; i += CHUNK_SIZE) {
    const chunk = products.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(
      chunk.map((item) =>
        upsertProduct(item, categoryIdBySlug.get(item.categorySlug) ?? fallbackCategoryId),
      ),
    );

    console.log(`Berhasil menyimpan ${i + chunk.length}/${products.length} produk...`);
  }

  console.log(`${products.length} produk dan gambar berhasil masuk ke database.`);
}

async function main() {
  console.log('Memulai proses seeding ke database...');

  await clearProductData();
  const categoryIdBySlug = await syncCategories();
  const products = loadSeedProducts();
  await seedProducts(products, categoryIdBySlug);
}

main()
  .catch((error) => {
    console.error('Terjadi kesalahan saat seed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
