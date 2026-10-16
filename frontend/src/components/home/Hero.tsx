import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import heroImage from '@/assets/images/hero-image.webp';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative isolate flex h-[120vh] max-h-230 min-h-160 w-full flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Atelier Noir Fall Winter Campaign"
          fetchPriority="high"
          loading="eager"
          className="h-full w-full object-cover object-center brightness-90 grayscale-15 transition-transform duration-1000 ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
      </div>
      <div className="relative z-10 container mx-auto px-6 pb-16 text-white md:pb-24">
        <div className="max-w-3xl space-y-4">
          <span className="inline-block text-xs tracking-[0.25em] text-white/80 uppercase">
            Musim Gugur / Musim Dingin 2026
          </span>
          <h1 className="font-[--font-heading] text-4xl leading-none font-light tracking-tight uppercase sm:text-6xl md:text-7xl">
            COLLECTION 04: <br className="hidden sm:inline" />
            MONOCHROME ESSENTIALS
          </h1>
          <p className="max-w-xl text-sm leading-relaxed font-light text-white/80 md:text-base">
            Eksplorasi siluet arsitektural dan material wol murni berkualitas tinggi, dirancang
            untuk estetika abadi.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              render={<a href="/Products" />}
              size="lg"
              className="rounded-2xl p-6 text-xs tracking-wider uppercase"
            >
              <Link to="/products" className="flex flex-row">
                Jelajahi Koleksi <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              render={<a href="/Products" />}
              variant="outline"
              size="lg"
              className="rounded-2xl border-white/40 bg-transparent p-6 text-xs tracking-wider text-white uppercase hover:bg-white hover:text-black"
            >
              <Link to="/editorial">Lihat Editorial</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-background border-border h-12 w-full border"></div>
    </section>
  );
};

export default Hero;
