import { ArrowRight } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import heroImage from '@/assets/images/hero-image.webp';
import { Button } from '@/components/ui/button';

const Hero: FC = () => {
  return (
    <section className="relative isolate flex h-[120vh] max-h-230 min-h-160 w-full flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Koleksi Fashion Multi Brand Atelier Noir"
          fetchPriority="high"
          loading="eager"
          className="h-full w-full object-cover object-center brightness-90 grayscale-15 transition-transform duration-1000 ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
      </div>
      <div className="relative z-10 container mx-auto px-6 pb-16 text-white md:pb-24">
        <div className="max-w-3xl space-y-4">
          <span className="inline-block text-xs tracking-[0.25em] text-white/80 uppercase">
            Pusat Fashion & Brand Pilihan
          </span>
          <h1 className="font-[--font-heading] text-4xl leading-none font-light tracking-tight uppercase sm:text-6xl md:text-7xl">
            Satu Tempat Buat <br className="hidden sm:inline" />
            Semua Brand Favoritmu
          </h1>
          <p className="max-w-xl text-sm leading-relaxed font-light text-white/80 md:text-base">
            Temukan baju, celana, jaket, dan aksesori keren dari berbagai brand lokal
            maupun internasional. Kualitasnya terjamin, modelnya kekinian, dan pastinya pas
            buat nemenin gaya sehari-harimu.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              render={<Link to="/products" />}
              size="lg"
              className="rounded-2xl p-6 text-xs tracking-wider uppercase"
            >
              Mulai Belanja <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              render={<Link to="/products" />}
              variant="outline"
              size="lg"
              className="rounded-2xl border-white/40 bg-transparent p-6 text-xs tracking-wider text-white uppercase hover:bg-white hover:text-black"
            >
              Lihat Koleksi Baru
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
