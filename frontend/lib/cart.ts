// ============================================
// Cart State Management (localStorage)
// ============================================

export interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  image_data: string | null;
  quantity: number;
  size: string;
}

const CART_KEY = "luxe_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const existing = cart.findIndex(
    (i) => i.product_id === item.product_id && i.size === item.size
  );
  if (existing >= 0) {
    cart[existing].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: number, size: string): CartItem[] {
  const cart = getCart().filter(
    (i) => !(i.product_id === productId && i.size === size)
  );
  saveCart(cart);
  return cart;
}

export function updateQuantity(
  productId: number,
  size: string,
  quantity: number
): CartItem[] {
  const cart = getCart().map((i) => {
    if (i.product_id === productId && i.size === size) {
      return { ...i, quantity: Math.max(1, quantity) };
    }
    return i;
  });
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
