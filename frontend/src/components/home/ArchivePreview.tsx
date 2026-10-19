import { ArrowRight } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import archivePreviewMaterial from '@/assets/images/archive-preview-material.webp';
import archivePreviewModel from '@/assets/images/archive-preview-model.webp';
import { ARCHIVE_STATS } from '@/constants';

const ArchivePreview: FC = () => {
  return (
    <section className="border-foreground/10 bg-secondary relative w-full border-t py-16 md:py-24 lg:py-28">
      <div className="container mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          <div className="relative mx-auto w-full max-w-xl pb-10 sm:pb-12 lg:col-span-6 lg:mx-0 lg:max-w-none lg:pb-8">
            <div className="bg-muted/30 relative aspect-4/5 w-full overflow-hidden">
              <img
                src={archivePreviewModel}
                alt="Koleksi Fashion Multi Brand Terkurasi di Atelier Noir"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>

            <div className="border-foreground/15 bg-background absolute right-0 bottom-0 z-20 w-48 border p-3 shadow-xl backdrop-blur-xs transition-transform duration-300 hover:-translate-y-1 sm:w-60 sm:p-4 md:w-68">
              <div className="bg-muted aspect-square w-full overflow-hidden">
                <img
                  src={archivePreviewMaterial}
                  alt="Kualitas Bahan Terjamin"
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="pt-3">
                <p className="text-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                  Jaminan 100% Original
                </p>
                <p className="text-muted-foreground mt-1 text-[9px] leading-relaxed sm:text-[11px]">
                  Setiap barang dicek kualitas dan keasliannya sebelum dikirim.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-6 lg:pl-4 xl:pl-8">
            <span className="text-xxs text-muted-foreground font-semibold tracking-[0.25em] uppercase sm:text-xs">
              Kenapa Belanja di Atelier Noir
            </span>

            <h2 className="font-heading text-foreground mt-4 text-3xl font-normal tracking-tight uppercase sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl xl:leading-[1.08]">
              Kurasi Brand Terbaik,
              <br />
              Kualitas Tanpa
              <br />
              Kompromi.
            </h2>

            <div className="text-muted-foreground mt-6 space-y-4 text-xs leading-relaxed font-light sm:text-sm md:text-base">
              <p>
                Belanja fashion impian sekarang nggak perlu repot buka banyak toko. Di Atelier Noir,
                kami mengumpulkan koleksi terbaik dari puluhan brand pilihan, mulai dari gaya kasual
                santai, baju kerja rapi, sampai streetwear kekinian.
              </p>
              <p>
                Semua produk yang ada di sini kami jamin keasliannya dan sudah lolos pengecekan
                kualitas bahan. Jadi, kamu bisa belanja dengan tenang tanpa khawatir salah ukuran
                atau dapat barang yang mengecewakan.
              </p>
            </div>

            <div className="border-foreground/15 my-8 border-y py-6 sm:my-9 sm:py-7">
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {ARCHIVE_STATS.map((stat, idx) => (
                  <div key={idx}>
                    <span className="font-heading text-foreground block text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
                      {stat.value}
                    </span>
                    <span className="text-xxs text-muted-foreground mt-1.5 block font-semibold tracking-[0.18em] uppercase sm:text-[11px]">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Link
                to="/products"
                className="group text-foreground hover:text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 sm:text-sm"
              >
                <span className="border-foreground group-hover:border-primary border-b pb-0.5 transition-colors">
                  Eksplor Semua Brand & Produk
                </span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchivePreview;
