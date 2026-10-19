import type { ArchiveStatItem, ServiceItem } from '@/types/common.types';

export const SERVICES: ServiceItem[] = [
  {
    id: '01',
    category: '01 / PENGIRIMAN',
    title: 'PENGIRIMAN CEPAT & AMAN',
    description:
      'Pesananmu diproses langsung di hari yang sama dengan pilihan ekspedisi terpercaya ke seluruh Indonesia.',
  },
  {
    id: '02',
    category: '02 / KEASLIAN',
    title: '100% PRODUK ASLI DARI BRAND RESMI',
    description:
      'Semua produk dipasok langsung dari official brand dan distributor sah. Garansi uang kembali jika tidak ori.',
  },
  {
    id: '03',
    category: '03 / FLEKSIBILITAS',
    title: 'BEBAS TUKAR JIKA KURANG PAS',
    description:
      'Baju kekecilan atau kurang cocok saat dicoba? Kami sediakan kemudahan tukar ukuran tanpa proses yang berbelit.',
  },
  {
    id: '04',
    category: '04 / BANTUAN',
    title: 'LAYANAN PELANGGAN RESPONSIF',
    description:
      'Tim kami siap membantu menjawab pertanyaanmu seputar rekomendasi gaya, ukuran, dan status paket belanjaanmu.',
  },
];

export const ARCHIVE_STATS: ArchiveStatItem[] = [
  {
    value: '50+',
    label: 'Brand Terpercaya',
  },
  {
    value: '100%',
    label: 'Produk Original',
  },
  {
    value: '24/7',
    label: 'Bantuan Belanja',
  },
];
