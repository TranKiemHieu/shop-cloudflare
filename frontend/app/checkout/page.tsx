"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCart, getCartTotal, clearCart, CartItem } from "@/lib/cart";
import { ordersApi, formatPrice } from "@/lib/api";
import Link from "next/link";

const CITIES = ["Hà Nội","TP. Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","Biên Hòa","Nha Trang","Huế","Buôn Ma Thuột","Quy Nhơn","Vũng Tàu","Nam Định","Thái Nguyên","Bắc Ninh","Hạ Long"];

type FormData = {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
};

type FormErrors = Partial<FormData>;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<FormData>({
    customer_name: "", email: "", phone: "", address: "", city: "", note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);

  useEffect(() => { setCart(getCart()); }, []);

  const total = getCartTotal(cart);
  const shipping = total > 500000 ? 0 : 30000;
  const grandTotal = total + shipping;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.customer_name.trim()) e.customer_name = "Vui lòng nhập họ tên";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email không hợp lệ";
    if (!form.phone.match(/^[0-9]{9,11}$/)) e.phone = "Số điện thoại không hợp lệ";
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ";
    if (!form.city) e.city = "Vui lòng chọn tỉnh/thành phố";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || cart.length === 0) return;
    setLoading(true);
    try {
      const res = await ordersApi.create({
        ...form,
        items: cart.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.price,
          size: i.size,
        })),
      });
      if (res.success && res.data) {
        clearCart();
        window.dispatchEvent(new Event("cartUpdated"));
        setSuccess(res.data.id);
      } else {
        alert(res.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch {
      alert("Không thể kết nối server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <style>{`
          .success-page {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px 24px;
          }
          .success-box {
            max-width: 480px;
            width: 100%;
            text-align: center;
            padding: 60px 40px;
            background: var(--bg-card);
            border: 1px solid var(--border-hover);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-gold);
            animation: fadeIn 0.5s ease;
          }
          .success-icon {
            width: 80px; height: 80px;
            background: rgba(74,222,128,0.1);
            border: 2px solid var(--success);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 24px;
            color: var(--success);
          }
        `}</style>
        <div className="success-page">
          <div className="success-box">
            <div className="success-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", marginBottom: "12px" }}>
              Đặt Hàng Thành Công!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
              Mã đơn hàng: <strong style={{ color: "var(--gold)" }}>#{success}</strong>
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px" }}>
              Cảm ơn bạn đã mua hàng! Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
            </p>
            <Link href="/products" className="btn btn-primary btn-full">
              Tiếp Tục Mua Sắm →
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-secondary)" }}>Giỏ hàng trống</h2>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: "24px", display: "inline-flex" }}>
          Mua Sắm Ngay →
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .checkout-page { padding: 40px 0 80px; }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 32px;
          align-items: start;
        }
        .checkout-form-box {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 32px;
        }
        .checkout-form-box h2 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .checkout-order-box {
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
        .checkout-order-box h3 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .order-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .order-item-img {
          width: 52px; height: 64px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-secondary);
        }
        .order-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .order-item-info { flex: 1; }
        .order-item-name { font-size: 13px; font-weight: 500; line-height: 1.4; }
        .order-item-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .order-item-price { font-size: 14px; font-weight: 700; color: var(--gold); }
        .summary-divider { height: 1px; background: var(--border); }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .summary-row span:first-child { color: var(--text-secondary); }
        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .summary-row.total span:last-child { color: var(--gold); }
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: var(--gold);
          color: var(--bg-primary);
          border: none;
          border-radius: var(--radius-sm);
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .submit-btn:hover:not(:disabled) { background: var(--gold-light); box-shadow: var(--shadow-gold); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .loading-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: var(--bg-primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .checkout-order-box { position: static; }
          .form-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="checkout-page">
        <div className="container">
          <div style={{ marginBottom: "32px" }}>
            <span className="section-label">Thanh Toán</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)" }}>
              Hoàn Tất Đơn Hàng
            </h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="checkout-grid">
              {/* Form */}
              <div className="checkout-form-box">
                <h2>Thông Tin Giao Hàng</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Họ và Tên *</label>
                    <input
                      className={`form-input${errors.customer_name ? " error" : ""}`}
                      placeholder="Nguyễn Văn A"
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      style={errors.customer_name ? { borderColor: "var(--error)" } : {}}
                    />
                    {errors.customer_name && <span className="form-error">{errors.customer_name}</span>}
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        className="form-input"
                        type="email"
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={errors.email ? { borderColor: "var(--error)" } : {}}
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số Điện Thoại *</label>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="0912345678"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        style={errors.phone ? { borderColor: "var(--error)" } : {}}
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa Chỉ *</label>
                    <input
                      className="form-input"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      style={errors.address ? { borderColor: "var(--error)" } : {}}
                    />
                    {errors.address && <span className="form-error">{errors.address}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tỉnh / Thành Phố *</label>
                    <select
                      className="form-input"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      style={errors.city ? { borderColor: "var(--error)" } : {}}
                    >
                      <option value="">-- Chọn tỉnh/thành phố --</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ghi Chú (tùy chọn)</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Ghi chú cho đơn hàng (thời gian giao hàng, yêu cầu đặc biệt...)"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="checkout-order-box">
                <h3>Đơn Hàng ({cart.length})</h3>

                {cart.map((item) => (
                  <div key={`${item.product_id}-${item.size}`} className="order-item">
                    <div className="order-item-img">
                      {item.image_data
                        ? <img src={item.image_data} alt={item.product_name} />
                        : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>📷</div>
                      }
                    </div>
                    <div className="order-item-info">
                      <p className="order-item-name">{item.product_name}</p>
                      <p className="order-item-meta">
                        {item.size && `Size: ${item.size} · `}
                        x{item.quantity}
                      </p>
                    </div>
                    <span className="order-item-price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="summary-divider" />
                <div className="summary-row">
                  <span>Tạm tính</span><span>{formatPrice(total)}</span>
                </div>
                <div className="summary-row">
                  <span>Vận chuyển</span>
                  <span style={{ color: shipping === 0 ? "var(--success)" : undefined }}>
                    {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Tổng Cộng</span><span>{formatPrice(grandTotal)}</span>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <><div className="loading-spinner" /> Đang xử lý...</>
                  ) : (
                    <>🔒 Đặt Hàng ({formatPrice(grandTotal)})</>
                  )}
                </button>

                <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                  Thanh toán khi nhận hàng (COD). Thông tin được bảo mật.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
