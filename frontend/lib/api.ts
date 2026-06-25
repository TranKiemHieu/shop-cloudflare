// ============================================
// API Client - communicates with Cloudflare Worker
// ============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
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
  sizes: string; // JSON string
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
  status: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  return data;
}

// ---- Products ----
export const productsApi = {
  list: (params?: {
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.featured) query.set("featured", "true");
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<Product[]>(`/api/products${qs}`);
  },
  get: (id: number) => apiFetch<Product>(`/api/products/${id}`),
  create: (data: ProductInput) =>
    apiFetch<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProductInput) =>
    apiFetch<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<null>(`/api/products/${id}`, { method: "DELETE" }),
};

// ---- Categories ----
export const categoriesApi = {
  list: () => apiFetch<Category[]>("/api/categories"),
};

// ---- Orders ----
export const ordersApi = {
  list: () => apiFetch<Order[]>("/api/orders"),
  get: (id: number) => apiFetch<Order>(`/api/orders/${id}`),
  create: (data: {
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
  }) =>
    apiFetch<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, status: string) =>
    apiFetch<Order>(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// ---- Utilities ----
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function parseSizes(sizesStr: string): string[] {
  try {
    return JSON.parse(sizesStr);
  } catch {
    return [];
  }
}

export function getDiscount(price: number, originalPrice: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
