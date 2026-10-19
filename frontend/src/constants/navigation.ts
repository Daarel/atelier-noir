import type { FooterSection, NavLinkItem } from '@/types/common.types';

export const HEADER_ANNOUNCEMENTS: readonly string[] = [
  'Gratis ongkir ke seluruh Indonesia min. belanja Rp 500.000',
  'Promo Spesial: Diskon hingga 50% untuk koleksi pilihan minggu ini',
  'Voucher Spesial: Pakai kode NOIRNEW untuk potongan ekstra 10%',
  'Jaminan 100% produk asli dan resmi dari brand ternama',
  'Bebas tukar ukuran tanpa ribet jika pesanan kurang pas',
] as const;

export const HEADER_ANNOUNCEMENT = HEADER_ANNOUNCEMENTS.join(' • ');

export const HEADER_NAV_LINKS: NavLinkItem[] = [
  { label: 'WANITA', href: '/products?category=women' },
  { label: 'PRIA', href: '/products?category=men' },
  { label: 'SEMUA BRAND', href: '/products' },
  { label: 'PROMO SPESIAL', href: '/products?filter=promo' },
];

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Bantuan & Layanan',
    links: [
      { label: 'Pusat bantuan & FAQ', href: '/' },
      { label: 'Cek status pesanan', href: '/' },
      { label: 'Panduan ukuran & penukaran', href: '/' },
      { label: 'Kebijakan pengembalian barang', href: '/' },
    ],
  },
  {
    title: 'Kategori Belanja',
    links: [
      { label: 'Koleksi pria', href: '/products?category=men' },
      { label: 'Koleksi wanita', href: '/products?category=women' },
      { label: 'Daftar semua brand', href: '/products' },
      { label: 'Promo & diskon spesial', href: '/products?filter=promo' },
    ],
  },
  {
    title: 'Tentang Kami',
    links: [
      { label: 'Tentang Atelier Noir', href: '/' },
      { label: 'Jaminan keaslian 100%', href: '/' },
      { label: 'Kerja sama brand & mitra', href: '/' },
      { label: 'Kebijakan privasi', href: '/privacy' },
    ],
  },
];
