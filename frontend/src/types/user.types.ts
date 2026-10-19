export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface AddressFormData {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}
