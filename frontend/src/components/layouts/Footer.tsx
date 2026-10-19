import { type FC, type SubmitEvent, useState } from 'react';
import { toast } from 'sonner';

import FooterLink from '@/components/layouts/FooterLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FOOTER_SECTIONS } from '@/constants';

const Footer: FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Silakan masukkan alamat email yang valid.');
      return;
    }
    toast.success('Terima kasih! Kamu sudah terdaftar untuk menerima info promo terbaru.');
    setEmail('');
  };

  return (
    <footer className="flex min-h-[65dvh] flex-col justify-between border-t px-14 py-16 text-xs">
      <div className="flex items-start justify-between gap-8">
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title} className="flex-1">
            <h2 className="mb-6 text-xs font-semibold tracking-widest uppercase">
              {section.title}
            </h2>
            <ul className="flex list-none flex-col gap-2 capitalize">
              {section.links.map((link) => (
                <FooterLink key={link.label} to={link.href ?? '/'}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex-1">
          <h2 className="mb-6 text-xs font-semibold tracking-widest uppercase">Promo & Diskon</h2>
          <p className="text-muted-foreground max-w-[35ch] leading-relaxed">
            Daftarkan emailmu untuk dapat voucher belanja, info diskon kilat, dan update koleksi
            terbaru.
          </p>
          <form onSubmit={handleSubscribe} className="relative mt-4">
            <Input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              className="focus-visible:border-input rounded-none pr-18 text-xs placeholder:text-xs focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
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
