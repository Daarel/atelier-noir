import { Client, handle_file } from '@gradio/client';

import { uploadToCloudinary } from '@/config/cloudinary.js';
import { BadRequestError, NotFoundError, ServiceUnavailableError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';
import type { TryOnInput } from '@/schemas/tryOnSchema.js';

class TryOnService {
  /**
   * Menjalankan AI Virtual Try-On menggunakan model IDM-VTON di Hugging Face Spaces.
   *
   * Tahapan proses:
   * 1. Validasi keberadaan produk dan gambar pakaian (cloth image dengan isPrimary: false).
   * 2. Validasi file foto pengguna (personImage) yang dikirimkan via multipart/form-data.
   * 3. Menyiapkan input biner: foto pengguna diubah menjadi Blob, dan gambar produk
   *    diunduh dari Cloudinary menjadi Blob agar siap diunggah langsung ke Gradio server.
   * 4. Inisialisasi koneksi @gradio/client ke Space 'yisol/IDM-VTON' (dengan HF_TOKEN jika tersedia).
   * 5. Eksekusi inferensi diffusion pipeline (/tryon) dengan auto-masking aktif.
   * 6. Mengunduh hasil gambar sementara dari Gradio dan mengunggahnya ke Cloudinary folder 'atelier-noir/try-on'
   *    agar hasil try-on tersimpan permanen dan memiliki URL CDN berkecepatan tinggi.
   * 7. Mengembalikan metadata produk dan URL gambar hasil try-on ke klien.
   */
  static async generateTryOn(input: TryOnInput, file?: Express.Multer.File) {
    const { productId, garmentDescription } = input;

    // 1. Validasi foto pengguna
    if (!file || !file.buffer) {
      throw new BadRequestError('Foto model atau diri sendiri (personImage) wajib diunggah');
    }

    // 2. Ambil data produk dan relasi gambar dari database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Produk tidak ditemukan');
    }

    // Prioritaskan gambar pakaian (isPrimary: false) untuk virtual try-on,
    // jika tidak ada gunakan gambar pertama sebagai fallback
    const clothImage = product.images.find((img) => !img.isPrimary) || product.images[0];

    if (!clothImage) {
      throw new BadRequestError('Produk ini belum memiliki gambar pakaian untuk proses try-on');
    }

    // 3. Konversi buffer foto pengguna menjadi Web-standard Blob
    const personBlob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype,
    });

    // Unduh gambar pakaian dari Cloudinary agar menjadi Blob biner terverifikasi
    let clothBlob: Blob;
    try {
      const clothResponse = await fetch(clothImage.url);
      if (!clothResponse.ok) {
        throw new Error(`Status ${clothResponse.status}`);
      }
      clothBlob = await clothResponse.blob();
    } catch (fetchErr) {
      console.error('[TryOnService] Gagal mengunduh gambar pakaian produk:', fetchErr);
      throw new BadRequestError('Gagal memuat gambar pakaian produk untuk proses try-on');
    }

    // 4. Inisialisasi Gradio Client menuju space yisol/IDM-VTON
    const hfToken = process.env.HF_TOKEN;
    let client: Client;

    try {
      client = await Client.connect(
        'yisol/IDM-VTON',
        hfToken ? { token: hfToken as `hf_${string}` } : {},
      );
    } catch (connErr) {
      console.error('[TryOnService] Gagal terhubung ke Hugging Face space:', connErr);
      throw new ServiceUnavailableError(
        'Layanan AI Virtual Try-On sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi.',
      );
    }

    // 5. Jalankan inferensi AI IDM-VTON
    let result: { data: unknown };
    try {
      result = (await client.predict('/tryon', {
        dict: {
          background: handle_file(personBlob),
          layers: [],
          composite: null,
        },
        garm_img: handle_file(clothBlob),
        garment_des: garmentDescription || product.name,
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      })) as { data: unknown };
    } catch (predictErr: unknown) {
      const errorMessage = predictErr instanceof Error ? predictErr.message : String(predictErr);
      console.error('[TryOnService] Gradio prediction error:', errorMessage);
      throw new ServiceUnavailableError(
        errorMessage.includes('queue') || errorMessage.includes('busy')
          ? 'Antrean server AI sedang penuh. Silakan coba beberapa saat lagi.'
          : 'Gagal memproses AI Virtual Try-On pada server. Silakan coba beberapa saat lagi.',
      );
    }

    // 6. Ekstraksi URL hasil dari respons Gradio
    const outputItem = Array.isArray(result?.data) ? result.data[0] : result?.data;
    const generatedUrl =
      typeof outputItem === 'string' ? outputItem : (outputItem as { url?: string })?.url;

    if (!generatedUrl) {
      throw new ServiceUnavailableError('Server AI tidak mengembalikan gambar hasil yang valid.');
    }

    // 7. Unduh hasil sementara dari server Gradio untuk disimpan ke Cloudinary
    let cloudinaryResult: { url: string; publicId: string };
    try {
      const generatedResponse = await fetch(generatedUrl);
      if (!generatedResponse.ok) {
        throw new Error(`Status ${generatedResponse.status}`);
      }
      const arrayBuffer = await generatedResponse.arrayBuffer();
      const outputBuffer = Buffer.from(arrayBuffer);

      cloudinaryResult = await uploadToCloudinary(outputBuffer, 'atelier-noir/try-on');
    } catch (uploadErr) {
      console.error('[TryOnService] Gagal menyimpan hasil try-on ke Cloudinary:', uploadErr);
      throw new ServiceUnavailableError(
        'Gagal menyimpan gambar hasil virtual try-on ke cloud storage.',
      );
    }

    // 8. Kembalikan data lengkap untuk frontend
    return {
      resultImageUrl: cloudinaryResult.url,
      resultPublicId: cloudinaryResult.publicId,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price.toNumber(),
        clothImageUrl: clothImage.url,
        category: product.category,
      },
    };
  }
}

export default TryOnService;
