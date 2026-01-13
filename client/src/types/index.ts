export type Role = 'user' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  status: 'pending' | 'approved' | 'suspended';
  businessDetails: {
    businessName: string;
    gstNumber: string;
    address: string;
  };
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
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
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
