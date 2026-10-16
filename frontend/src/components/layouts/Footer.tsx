import { type FC, type SubmitEvent, useState } from 'react';
import { toast } from 'sonner';

import FooterLink from '@/components/layouts/FooterLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer: FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Silakan masukkan alamat email yang valid.');
      return;
    }
    toast.success('Terima kasih telah bergabung dengan warta Atelier Noir.');
    setEmail('');
  };

  return (
    <footer className="flex min-h-[65dvh] flex-col justify-between border-t px-14 py-16 text-xs">
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <h2 className="mb-6 text-xs font-semibold tracking-widest uppercase">
            Layanan pelanggan
          </h2>
          <li className="flex list-none flex-col gap-2 capitalize">
            <FooterLink>Konsultasi pribadi</FooterLink>
            <FooterLink>Pengiriman & pengembalian seluruh indonesia</FooterLink>
            <FooterLink>Perawatan busana & pelestarian</FooterLink>
            <FooterLink>Janji temu studio privat</FooterLink>
          </li>
        </div>
        <div className="flex-1">
          <h2 className="mb-6 text-xs font-semibold tracking-widest uppercase">Tentang atelier</h2>
          <li className="flex list-none flex-col gap-2 capitalize">
            <FooterLink>Studio Bandung & Jakarta</FooterLink>
            <FooterLink>Pengrajin indonesia</FooterLink>
            <FooterLink>Disiplin arsitektur</FooterLink>
            <FooterLink>Siaran pers & publikasi</FooterLink>
          </li>
        </div>
        <div className="flex-1">
          <h2 className="mb-6 text-xs font-semibold tracking-widest uppercase">
            Keberlanjutan & warisan
          </h2>
          <li className="flex list-none flex-col gap-2 capitalize">
            <FooterLink>Manifesto monokrom</FooterLink>
            <FooterLink>Bahan asal italia</FooterLink>
            <FooterLink>Siklus hidup sirkular</FooterLink>
            <FooterLink>Keterlacakan asal usul</FooterLink>
          </li>
        </div>
        <div className="flex-1">
          <h2 className="mb-6 text-xs font-semibold tracking-widest uppercase">warta newsletter</h2>
          <p className="text-muted-foreground max-w-[35ch] leading-relaxed">
            Dapatkan warta eksklusif undangan salon pribadi dan rilis buku gaya musiman sebelum
            dipublikasikan luas.
          </p>
          <form onSubmit={handleSubscribe} className="relative mt-4">
            <Input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              className="rounded-none pr-18 text-xs placeholder:text-xs focus:outline-none focus-visible:border-input focus-visible:ring-0 focus-visible:outline-none"
            />
            <Button
              className="absolute top-0 right-2 h-full text-xs font-medium hover:bg-transparent"
              variant="ghost"
              type="submit"
            >
              Gabung
            </Button>
          </form>
        </div>
      </div>
      <div className="space-y-4">
        <hr className="border-border" />
        <div className="text-xxs flex items-center justify-between tracking-wider uppercase">
          <p className="text-muted-foreground">
            &#169; 2026 atelier noir • indonesia. All rights reserved.
          </p>
          <span>
            <li className="flex list-none gap-4">
              <FooterLink>Catatan hukum</FooterLink>
              <FooterLink>Kebijakan privasi</FooterLink>
              <FooterLink>Syarat penjualan</FooterLink>
              <FooterLink>Mata uang: IDR (RP)</FooterLink>
            </li>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
