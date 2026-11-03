import { Client, handle_file } from '@gradio/client';

import { uploadToCloudinary } from '@/config/cloudinary.js';
import { BadRequestError, NotFoundError, ServiceUnavailableError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';
import type { TryOnInput } from '@/schemas/tryOnSchema.js';

class TryOnService {
  // Eksekusi proses virtual try-on busana menggunakan model kecerdasan buatan
  static async generateTryOn(input: TryOnInput, file?: Express.Multer.File) {
    const { productId, garmentDescription } = input;

    // Verifikasi keberadaan file foto model atau diri pengguna
    if (!file || !file.buffer) {
      throw new BadRequestError('Foto model atau diri sendiri (personImage) wajib diunggah');
    }

    // Ambil data produk beserta relasi gambar dari basis data
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

    // Pilih gambar pakaian khusus try-on atau gunakan gambar pertama sebagai alternatif
    const clothImage = product.images.find((img) => !img.isPrimary) || product.images[0];

    if (!clothImage) {
      throw new BadRequestError('Produk ini belum memiliki gambar pakaian untuk proses try-on');
    }

    // Konversi buffer foto pengguna menjadi tipe blob biner standar web
    const personBlob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype,
    });

    // Unduh gambar pakaian dari cloud storage untuk disiapkan sebagai input model
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

    // Inisialisasi koneksi klien gradio menuju ruang kerja idm-vton
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

    // Jalankan inferensi diffusion model try-on dengan auto-masking aktif
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

    // Ekstraksi alamat url gambar hasil inferensi dari respons gradio
    const outputItem = Array.isArray(result?.data) ? result.data[0] : result?.data;
    const generatedUrl =
      typeof outputItem === 'string' ? outputItem : (outputItem as { url?: string })?.url;

    if (!generatedUrl) {
      throw new ServiceUnavailableError('Server AI tidak mengembalikan gambar hasil yang valid.');
    }

    // Unduh gambar hasil sementara dari server gradio dan simpan permanen ke cloudinary
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

    // Kembalikan tautan gambar permanen beserta ringkasan metadata produk
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
