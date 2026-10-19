import type { Product } from '@/types/product.types';
import type { Address } from '@/types/user.types';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId?: string | null;
  address?: Address | null;
  totalAmount: number;
  status: OrderStatus;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutFormData {
  addressId: string;
  notes?: string;
  paymentMethod: 'bank_transfer' | 'e_wallet' | 'cod';
}
