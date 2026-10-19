import { CircleUserIcon, Heart, Megaphone, Search, ShoppingBag } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HEADER_ANNOUNCEMENTS, HEADER_NAV_LINKS } from '@/constants';

const Header: FC = () => {
  return (
    <header className="bg-background sticky top-0 z-50 flex flex-col border-b">
      <div className="bg-foreground text-background relative flex h-7 items-center overflow-hidden">
        <div className="bg-foreground z-10 flex h-full shrink-0 items-center gap-1.5 pr-3 pl-4">
          <Megaphone className="text-background size-3.5" />
          <span className="text-xxs hidden font-bold tracking-widest uppercase sm:inline">
            PROMO
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee pause-on-hover flex items-center will-change-transform">
            <div className="flex shrink-0 items-center gap-8 pr-8">
              {HEADER_ANNOUNCEMENTS.map((promo, idx) => (
                <div key={`promo-1-${idx}`} className="flex items-center gap-8">
                  <span className="text-xxs font-medium tracking-wider whitespace-nowrap uppercase">
                    {promo}
                  </span>
                  <span className="text-xxs opacity-50 select-none">•</span>
                </div>
              ))}
            </div>

            <div aria-hidden="true" className="flex shrink-0 items-center gap-8 pr-8">
              {HEADER_ANNOUNCEMENTS.map((promo, idx) => (
                <div key={`promo-2-${idx}`} className="flex items-center gap-8">
                  <span className="text-xxs font-medium tracking-wider whitespace-nowrap uppercase">
                    {promo}
                  </span>
                  <span className="text-xxs opacity-50 select-none">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-[--font-heading] text-2xl font-semibold tracking-wider">
          ATELIER NOIR
        </Link>
        <nav className="flex items-center gap-8 text-xs font-medium">
          {HEADER_NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="relative w-110">
          <Input
            type="text"
            id="search-bar"
            className="h-9 pr-10"
            placeholder="Cari produk, kategori, atau brand favoritmu..."
          />
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            <Search size={16} />
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Button variant="ghost" size="icon">
            <ShoppingBag className="size-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="size-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <CircleUserIcon className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
