export type Role = 'user' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Seller {
  _id: string;
  user: string;
  storeName: string;
  description: string;
  slug: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  businessDetails: {
    gstNumber?: string;
    pan: string;
    address: string;
  };
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  commissionRate: number;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  category: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  attributes: { name: string; value: string }[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
