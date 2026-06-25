// ============================================
// TypeScript Types for Fashion Store API
// ============================================

export interface Env {
  DB: D1Database;
  ALLOW_ORIGIN?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_data: string | null;
  category_id: number | null;
  category_name?: string;
  stock: number;
  sizes: string; // JSON string array
  is_featured: number;
  created_at: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_data?: string;
  category_id?: number;
  stock?: number;
  sizes?: string[];
  is_featured?: boolean;
}

export interface Order {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  note: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  size: string | null;
}

export interface CreateOrderInput {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    size?: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}
