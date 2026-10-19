import { type FC, type MouseEvent, type SubmitEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import ServicesGrid from '@/components/home/ServicesGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Newsletter: FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Silakan masukkan alamat email yang valid.');
      return;
    }
    toast.success('Terima kasih! Kamu sudah berhasil terdaftar untuk promo dan diskon spesial.');
    setEmail('');
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast.info('Fitur demonstrasi: Halaman ini tidak tersedia pada versi portfolio.');
  };

  return (
    <section className="bg-background w-full">
      <ServicesGrid />

      <div className="py-16 md:py-24">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16">
          <div className="border-foreground/15 bg-background mx-auto max-w-4xl border p-8 text-center sm:p-14 md:p-16 lg:p-20">
            <span className="text-xxs text-muted-foreground font-semibold tracking-[0.3em] uppercase sm:text-xs">
              Kabar & Diskon Spesial
            </span>

            <h2 className="font-heading text-foreground mt-5 text-3xl leading-[1.08] font-light tracking-tight uppercase sm:text-4xl md:text-5xl lg:text-6xl">
              Mau Dapat Promo &amp;
              <br />
              Voucher Belanja?
            </h2>

            <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-xs leading-relaxed font-light sm:text-sm">
              Yuk masukkan email kamu sekarang! Dapatkan info diskon terbaru, voucher belanja
              mingguan, dan bocoran produk baru dari brand-brand favoritmu sebelum kehabisan.
            </p>

            <form onSubmit={handleSubscribe} className="mx-auto mt-8 max-w-md sm:mt-10">
              <div className="flex flex-col items-stretch sm:flex-row">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ketik alamat email kamu di sini..."
                  required
                  className="border-foreground/20 bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-foreground/20 focus:border-foreground/20 flex-1 rounded-none border px-4 py-3 text-xs transition-colors outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm"
                />
                <Button
                  type="submit"
                  className="bg-foreground text-background cursor-pointer rounded-none px-4 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-90 sm:border-l-0"
                >
                  Daftar Promo
                </Button>
              </div>
              <p className="text-muted-foreground/80 mt-5 text-[10px] sm:text-xs">
                Tenang, kami tidak akan kirim spam. Kamu bisa berhenti langganan kapan saja. Baca{' '}
                <Link
                  to="/"
                  onClick={handleClick}
                  className="hover:text-foreground underline underline-offset-3 transition-colors"
                >
                  Kebijakan Privasi
                </Link>{' '}
                kami.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
