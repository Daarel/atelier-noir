import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { prisma } from '../src/lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawProductItem {
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('🚀 Memulai proses seeding ke database...');

  // 0. Bersihkan seluruh isi tabel terkait produk & transaksi sebelumnya
  console.log('🧹 Menghapus data produk dan transaksi terkait di database...');
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
  ]);
  console.log('✅ Data lama berhasil dibersihkan.');

  // 1. Pastikan Kategori Utama Tersedia (Upsert)
  const categoriesData = [
    { name: 'Atasan & Kaos', slug: 'atasan-kaos' },
    { name: 'Jaket & Outer', slug: 'jaket-outer' },
    { name: 'Dress', slug: 'dress' },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categoryMap.set(cat.slug, createdCat.id);
  }
  console.log('✅ Kategori berhasil disinkronkan.');

  // 2. Baca file products_seed.json
  const jsonPath = path.join(__dirname, 'products_seed.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Berkas tidak ditemukan: ${jsonPath}. Pastikan file ditaruh di backend/prisma/products_seed.json`);
  }

  const rawProducts: RawProductItem[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Membaca ${rawProducts.length} produk dari JSON...`);

  // 3. Masukkan ke Database secara bertahap (Chunking agar hemat koneksi DB)
  const CHUNK_SIZE = 50;
  let successCount = 0;

  for (let i = 0; i < rawProducts.length; i += CHUNK_SIZE) {
    const chunk = rawProducts.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(
      chunk.map((item) => {
        // Ambil ID kategori yang sesuai (fallback ke dress jika tidak cocok)
        const categoryId = categoryMap.get(item.categorySlug) || categoryMap.get('dress')!;

        // Buat slug unik: nama-produk + kode file (misal: "silk-dress-00001-00")
        const fileId = item.filename ? item.filename.replace(/\.[^/.]+$/, '') : Math.random().toString(36).substring(7);
        const uniqueSlug = `${slugify(item.name)}-${slugify(fileId)}`;

        return prisma.product.upsert({
          where: { slug: uniqueSlug },
          update: {},
          create: {
            name: item.name,
            slug: uniqueSlug,
            description: item.description,
            price: item.price,
            stock: Math.floor(Math.random() * 30) + 10, // Stok random 10 - 40
            isPublished: true,
            categoryId: categoryId,
            images: {
              create: item.images.map((img) => ({
                url: img.url,
                publicId: img.publicId || null,
                isPrimary: img.isPrimary,
              })),
            },
          },
        });
      })
    );

    successCount += chunk.length;
    console.log(`⚡ Berhasil menyimpan ${successCount}/${rawProducts.length} produk...`);
  }

  console.log(`${successCount} produk dan gambar berhasil masuk ke database.`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });