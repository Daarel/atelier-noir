import type { FC, MouseEvent, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { cn } from '@/utils/cn';

interface FooterLinkProps {
  to?: string;
  className?: string;
}

const FooterLink: FC<PropsWithChildren<FooterLinkProps>> = ({ children, to = '/', className }) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (to === '/') {
      e.preventDefault();
      toast.info('Fitur demonstrasi: Halaman ini tidak tersedia pada versi portfolio.');
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        'text-muted-foreground hover:text-foreground transition-colors duration-200',
        className,
      )}
    >
      {children}
    </Link>
  );
};

export default FooterLink;
