"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCart, removeFromCart, updateQuantity, getCartTotal, getCartCount, CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/api";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemove = (productId: number, size: string) => {
    const updated = removeFromCart(productId, size);
    setCart(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleQty = (productId: number, size: string, qty: number) => {
    const updated = updateQuantity(productId, size, qty);
    setCart(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const total = getCartTotal(cart);
  const shipping = total > 500000 ? 0 : 30000;
  const grandTotal = total + shipping;

  return (
    <>
      <style>{`
        .cart-page { padding: 40px 0 80px; min-height: 60vh; }
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
          align-items: start;
        }
        .cart-items-box {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .cart-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cart-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
        }
        .cart-item {
          display: flex;
          gap: 20px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .cart-item:last-child { border-bottom: none; }
        .cart-item:hover { background: var(--bg-card-hover); }
        .cart-item-img {
          width: 90px;
          height: 110px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-secondary);
        }
        .cart-item-img img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .cart-item-info { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .cart-item-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1.4;
        }
        .cart-item-meta {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          gap: 12px;
        }
        .cart-item-meta span {
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }
        .cart-item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 4px;
        }
        .cart-item-price { font-size: 16px; font-weight: 700; color: var(--gold); }
        .cart-qty {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }
        .cart-qty-btn {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-secondary);
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 16px;
          transition: var(--transition-fast);
        }
        .cart-qty-btn:hover { background: var(--bg-card-hover); color: var(--gold); }
        .cart-qty-val {
          width: 40px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          background: transparent;
        }
        .remove-btn {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 6px;
          color: var(--error);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .remove-btn:hover { background: rgba(248,113,113,0.2); }
        /* Summary */
        .cart-summary {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          position: sticky;
          top: 90px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cart-summary h3 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }
        .summary-row span:first-child { color: var(--text-secondary); }
        .summary-row.total {
          padding-top: 16px;
          border-top: 1px solid var(--border);
          font-size: 18px;
          font-weight: 700;
        }
        .summary-row.total span:last-child { color: var(--gold); }
        .free-shipping-note {
          font-size: 12px;
          color: var(--success);
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.2);
          border-radius: 6px;
          padding: 8px 12px;
          text-align: center;
        }
        /* Empty cart */
        .empty-cart {
          text-align: center;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .empty-cart-icon {
          width: 80px; height: 80px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr; }
          .cart-summary { position: static; }
        }
      `}</style>

      <div className="cart-page">
        <div className="container">
          <div className="page-hero" style={{ textAlign: "left", paddingTop: "0", marginBottom: "32px" }}>
            <span className="section-label">Mua Sắm</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)" }}>
              Giỏ Hàng
            </h1>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px" }}>Giỏ hàng trống</h2>
              <p style={{ color: "var(--text-muted)" }}>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi</p>
              <Link href="/products" className="btn btn-primary">
                Mua Sắm Ngay →
              </Link>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Cart Items */}
              <div className="cart-items-box">
                <div className="cart-header">
                  <h2>Sản Phẩm ({getCartCount(cart)})</h2>
                  <Link href="/products" style={{ fontSize: "13px", color: "var(--gold)" }}>
                    ← Tiếp Tục Mua Sắm
                  </Link>
                </div>

                {cart.map((item) => (
                  <div key={`${item.product_id}-${item.size}`} className="cart-item">
                    <div className="cart-item-img">
                      {item.image_data ? (
                        <img src={item.image_data} alt={item.product_name} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                          📷
                        </div>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.product_name}</p>
                      <div className="cart-item-meta">
                        {item.size && <span>Size: {item.size}</span>}
                        <span>{formatPrice(item.price)} / cái</span>
                      </div>
                      <div className="cart-item-bottom">
                        <div className="cart-qty">
                          <button className="cart-qty-btn" onClick={() => handleQty(item.product_id, item.size, item.quantity - 1)}>−</button>
                          <span className="cart-qty-val">{item.quantity}</span>
                          <button className="cart-qty-btn" onClick={() => handleQty(item.product_id, item.size, item.quantity + 1)}>+</button>
                        </div>
                        <span className="cart-item-price">{formatPrice(item.price * item.quantity)}</span>
                        <button className="remove-btn" onClick={() => handleRemove(item.product_id, item.size)} title="Xóa">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <h3>Tóm Tắt Đơn Hàng</h3>
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span style={{ color: shipping === 0 ? "var(--success)" : undefined }}>
                    {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 ? (
                  <div className="free-shipping-note">🎉 Bạn được miễn phí vận chuyển!</div>
                ) : (
                  <div className="free-shipping-note" style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    Mua thêm {formatPrice(500000 - total)} để được miễn phí vận chuyển
                  </div>
                )}
                <div className="summary-row total">
                  <span>Tổng Cộng</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <Link href="/checkout" className="btn btn-primary btn-full btn-lg">
                  Thanh Toán →
                </Link>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "4px" }}>
                  {["🔒 Bảo mật SSL", "📦 Đóng gói cẩn thận", "🔄 Đổi trả 30 ngày"].map((f) => (
                    <span key={f} style={{ fontSize: "11px", color: "var(--text-muted)" }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
