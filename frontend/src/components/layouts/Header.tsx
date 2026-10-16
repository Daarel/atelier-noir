import { CircleUserIcon, Heart, Search, ShoppingBag } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header: FC = () => {
  return (
    <header className="flex flex-col border-b">
      <div className="bg-foreground flex h-7 items-center justify-center">
        <p className="text-background text-xxs uppercase">
          Pengiriman ekspres gratis untuk pesanan di atas IDR 1.500.000 • Akses arsip pribadi
        </p>
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-[--font-heading] text-2xl font-semibold tracking-wider">
          ATELIER NOIR
        </Link>
        <nav className="flex items-center gap-8 text-xs font-medium">
          <Link to="/" className="hover:text-primary transition-colors">
            WANITA
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            PRIA
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            EDITORIAL
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            ARSIP
          </Link>
        </nav>
        <div className="relative w-124">
          <Input
            type="text"
            id="search-bar"
            className="h-9 pr-10"
            placeholder="Cari produk atau arsip..."
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
