export interface NavLinkItem {
  label: string;
  href: string;
}

export interface FooterLinkItem {
  label: string;
  href?: string;
}

export interface FooterSection {
  title: string;
  links: FooterLinkItem[];
}

export interface ServiceItem {
  id: string;
  category: string;
  title: string;
  description: string;
}

export interface ArchiveStatItem {
  value: string;
  label: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}
