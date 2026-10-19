import { ArrowRight, Heart } from 'lucide-react';
import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';

import manInSuit from '@/assets/images/man-in-suit.webp';
import womanInSuit from '@/assets/images/woman-in-suit.webp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, COLLECTION_FEATURES, PRODUCTS } from '@/constants';
import type { ProductCategory } from '@/types/product.types';

const Collection: FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('SEMUA');
  return (
    <section className="relative isolate flex w-full flex-col justify-start">
      <div>
        <div className="border-foreground/20 flex min-h-14 w-full items-center overflow-hidden border-b py-3">
          <div className="animate-marquee pause-on-hover flex items-center will-change-transform">
            <div className="flex shrink-0 items-center gap-10 pr-10">
              {COLLECTION_FEATURES.map((feature, idx) => (
                <div key={`track1-${idx}`} className="flex items-center gap-10">
                  <span className="text-muted-foreground text-xxs font-semibold tracking-widest whitespace-nowrap uppercase">
                    {feature}
                  </span>
                  <span className="text-muted-foreground text-xxs select-none">•</span>
                </div>
              ))}
              {COLLECTION_FEATURES.map((feature, idx) => (
                <div key={`track1-dup-${idx}`} className="flex items-center gap-10">
                  <span className="text-muted-foreground text-xxs font-semibold tracking-widest whitespace-nowrap uppercase">
                    {feature}
                  </span>
                  <span className="text-muted-foreground text-xxs select-none">•</span>
                </div>
              ))}
            </div>

            <div aria-hidden="true" className="flex shrink-0 items-center gap-10 pr-10">
              {COLLECTION_FEATURES.map((feature, idx) => (
                <div key={`track2-${idx}`} className="flex items-center gap-10">
                  <span className="text-muted-foreground text-xxs font-semibold tracking-widest whitespace-nowrap uppercase">
                    {feature}
                  </span>
                  <span className="text-muted-foreground text-xxs select-none">•</span>
                </div>
              ))}
              {COLLECTION_FEATURES.map((feature, idx) => (
                <div key={`track2-dup-${idx}`} className="flex items-center gap-10">
                  <span className="text-muted-foreground text-xxs font-semibold tracking-widest whitespace-nowrap uppercase">
                    {feature}
                  </span>
                  <span className="text-muted-foreground text-xxs select-none">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-secondary flex w-full flex-col items-center justify-start gap-6 px-16 pt-10 pb-20">
          <div className="w-full">
            <div className="mb-2 flex flex-row items-center justify-between">
              <p className="text-xxs uppercase">Kategori Populer</p>
              <p className="text-muted-foreground text-xxs">Banyak Dicari Minggu Ini</p>
            </div>
            <div className="mb-4">
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl">
                Gaya Pilihan Buat Kamu
              </h1>
            </div>
            <hr className="border-foreground/20" />
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group relative aspect-3/4 w-full overflow-hidden rounded-none">
              <img
                src={womanInSuit}
                alt="Koleksi Pakaian Wanita dari Berbagai Brand"
                className="h-full w-full rounded-none object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/30 via-40% to-black/20" />
              <div className="absolute top-5 left-5 z-10">
                <span className="text-xxs bg-black/35 px-3 py-1 font-medium tracking-widest text-white uppercase backdrop-blur-xs">
                  Koleksi Wanita
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-6 text-white md:p-8">
                <div className="text-xxs mb-2 flex items-center justify-between font-medium tracking-widest text-white/80 uppercase">
                  <span>Pilihan Lengkap</span>
                  <span>120+ Produk Baru</span>
                </div>
                <h2 className="font-heading mb-4 text-xl tracking-wide text-white uppercase sm:text-2xl">
                  Fashion Wanita: Anggun, Kasual & Siap Pakai
                </h2>
                <div>
                  <Link
                    to="/products?category=women"
                    className="text-xxs inline-flex items-center gap-2 border-b border-white pb-0.5 font-semibold tracking-widest text-white uppercase transition-all duration-300 hover:gap-3 hover:opacity-80"
                  >
                    <span>Lihat Koleksi Wanita</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative aspect-3/4 w-full overflow-hidden rounded-none">
              <img
                src={manInSuit}
                alt="Koleksi Pakaian Pria dari Berbagai Brand"
                className="h-full w-full rounded-none object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/30 via-40% to-black/20" />
              <div className="absolute top-5 left-5 z-10">
                <span className="text-xxs bg-black/35 px-3 py-1 font-medium tracking-widest text-white uppercase backdrop-blur-xs">
                  Koleksi Pria
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-6 text-white md:p-8">
                <div className="text-xxs mb-2 flex items-center justify-between font-medium tracking-widest text-white/80 uppercase">
                  <span>Pilihan Lengkap</span>
                  <span>95+ Produk Baru</span>
                </div>
                <h2 className="font-heading mb-4 text-xl tracking-wide text-white uppercase sm:text-2xl">
                  Fashion Pria: Tampil Rapi & Keren Setiap Hari
                </h2>
                <div>
                  <Link
                    to="/products?category=men"
                    className="text-xxs inline-flex items-center gap-2 border-b border-white pb-0.5 font-semibold tracking-widest text-white uppercase transition-all duration-300 hover:gap-3 hover:opacity-80"
                  >
                    <span>Lihat Koleksi Pria</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-between gap-6 px-16 pt-16 pb-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xxs text-muted-foreground font-medium tracking-widest uppercase">
              Rekomendasi Terbaik
            </span>
            <span className="bg-muted text-xxs px-2 py-0.5 font-medium tracking-wider">
              BANYAK PILIHAN
            </span>
          </div>
          <h2 className="font-heading mt-2 text-3xl tracking-tight uppercase sm:text-4xl md:text-5xl">
            Produk Pilihan Minggu Ini
          </h2>
        </div>

        <nav className="text-xxs flex flex-wrap items-center gap-6 font-medium tracking-widest uppercase sm:gap-8">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`cursor-pointer border-b-2 pb-1.5 transition-colors ${
                  isActive
                    ? 'border-foreground font-semibold'
                    : 'text-muted-foreground border-transparent'
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-16 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className="group border-foreground/30 bg-card hover:border-foreground/70 relative flex flex-col gap-0 overflow-hidden rounded-none border p-0 shadow-none transition-all duration-300 [--card-spacing:0]"
            >
              <CardHeader className="bg-muted/40 group-hover:bg-muted/60 relative block aspect-4/5 w-full overflow-hidden rounded-none p-0 transition-colors">
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`text-xxs px-2.5 py-1 font-bold tracking-widest uppercase ${
                        product.badge.variant === 'dark'
                          ? 'bg-black text-white'
                          : 'border-border/80 text-foreground border bg-white/95 shadow-xs backdrop-blur-xs'
                      }`}
                    >
                      {product.badge.text}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  aria-label="Tambah ke favorit"
                  className="border-border/60 text-foreground/80 hover:text-foreground absolute top-3 right-3 z-10 flex size-8 cursor-pointer items-center justify-center border bg-white/90 shadow-xs backdrop-blur-xs transition-colors"
                >
                  <Heart className="size-4" />
                </button>

                <div className="text-muted-foreground/40 flex h-full w-full items-center justify-center text-xs tracking-widest uppercase">
                  Foto Produk
                </div>
              </CardHeader>

              <CardContent className="flex flex-col p-4 pb-2 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xxs text-muted-foreground font-medium tracking-wider uppercase">
                    {product.category}
                  </span>
                </div>

                <CardTitle className="text-foreground group-hover:text-primary mt-2 line-clamp-1 text-sm font-medium tracking-tight transition-colors">
                  {product.name}
                </CardTitle>
              </CardContent>

              <CardFooter className="px-4 pt-0 pb-4 sm:px-5 sm:pb-5">
                <p className="text-foreground text-sm font-semibold tracking-tight">
                  {product.price}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex w-full items-center justify-center">
          <Button
            render={<Link to="/products" />}
            variant="outline"
            size="lg"
            className="border-foreground/30 hover:bg-foreground hover:text-background rounded-none bg-transparent px-12 py-3 text-xs tracking-wider uppercase"
          >
            Lihat semua produk
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Collection;
