"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productsApi, Product, formatPrice, parseSizes, getDiscount } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    productsApi.get(parseInt(id)).then((r) => {
      setProduct(r.data ?? null);
      const sizes = parseSizes(r.data?.sizes ?? "[]");
      if (sizes.length > 0) setSelectedSize(sizes[0]);
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const sizes = parseSizes(product.sizes);
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      image_data: product.image_data,
      quantity,
      size: selectedSize,
    });
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}>
          <div className="skeleton" style={{ aspectRatio: "3/4", borderRadius: "var(--radius-lg)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "20px" }}>
            {[60, 100, 40, 200, 60].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: i === 1 ? "40px" : "20px", width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "120px 24px" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", color: "var(--text-secondary)" }}>
          Không tìm thấy sản phẩm
        </h2>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: "24px", display: "inline-flex" }}>
          ← Quay lại
        </Link>
      </div>
    );
  }

  const sizes = parseSizes(product.sizes);
  const discount = getDiscount(product.price, product.original_price);

  return (
    <>
      <style>{`
        .detail-page { padding: 40px 0 80px; }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 40px;
        }
        .breadcrumb a { color: var(--text-muted); transition: color 0.2s; }
        .breadcrumb a:hover { color: var(--gold); }
        .breadcrumb-sep { color: var(--text-muted); }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        .detail-image {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          aspect-ratio: 3/4;
          background: var(--bg-card);
          border: 1px solid var(--border);
          position: sticky;
          top: 90px;
        }
        .detail-image img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .detail-img-badge {
          position: absolute;
          top: 16px; left: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .no-img-lg {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-secondary);
          color: var(--text-muted);
        }
        .detail-info { display: flex; flex-direction: column; gap: 24px; }
        .detail-category {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold);
        }
        .detail-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3vw, 38px);
          font-weight: 600;
          line-height: 1.2;
        }
        .detail-prices {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .detail-price-current {
          font-size: 28px;
          font-weight: 700;
          color: var(--gold);
        }
        .detail-price-orig {
          font-size: 18px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .detail-desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.8;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--gold);
        }
        .detail-section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .size-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .size-btn {
          min-width: 52px;
          height: 44px;
          padding: 0 14px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .size-btn:hover { border-color: var(--gold); color: var(--gold); }
        .size-btn.active {
          border-color: var(--gold);
          background: var(--gold);
          color: var(--bg-primary);
        }
        .size-error { color: var(--error); font-size: 12px; margin-top: 6px; }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          width: fit-content;
        }
        .qty-btn {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-card);
          color: var(--text-secondary);
          border: none;
          cursor: pointer;
          font-size: 18px;
          font-weight: 300;
          transition: var(--transition-fast);
        }
        .qty-btn:hover { background: var(--bg-card-hover); color: var(--gold); }
        .qty-value {
          width: 56px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-secondary);
          font-size: 15px;
          font-weight: 600;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }
        .add-cart-btn {
          padding: 16px 32px;
          background: var(--gold);
          color: var(--bg-primary);
          border: none;
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
        }
        .add-cart-btn:hover { background: var(--gold-light); box-shadow: var(--shadow-gold); }
        .add-cart-btn.added { background: var(--success); color: white; }
        .add-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .buy-now-btn {
          padding: 16px 32px;
          background: transparent;
          color: var(--gold);
          border: 1.5px solid var(--gold);
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
        }
        .buy-now-btn:hover { background: var(--gold-glow); }
        .stock-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .stock-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }
        .stock-dot.low { background: var(--warning); box-shadow: 0 0 8px var(--warning); }
        .stock-dot.out { background: var(--error); box-shadow: none; }
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .feature-item span { color: var(--gold); font-size: 16px; }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr; gap: 32px; }
          .detail-image { position: static; }
        }
      `}</style>

      <div className="detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/">Trang Chủ</Link>
            <span className="breadcrumb-sep">›</span>
            <Link href="/products">Sản Phẩm</Link>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
          </div>

          <div className="detail-grid">
            {/* Image */}
            <div className="detail-image">
              {product.image_data ? (
                <img src={product.image_data} alt={product.name} />
              ) : (
                <div className="no-img-lg">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              )}
              <div className="detail-img-badge">
                {product.is_featured === 1 && <span className="badge badge-gold">⭐ Nổi Bật</span>}
                {discount > 0 && <span className="badge badge-success">-{discount}%</span>}
              </div>
            </div>

            {/* Info */}
            <div className="detail-info">
              {product.category_name && (
                <div className="detail-category">{product.category_name}</div>
              )}
              <h1 className="detail-name">{product.name}</h1>

              {/* Price */}
              <div className="detail-prices">
                <span className="detail-price-current">{formatPrice(product.price)}</span>
                {product.original_price && (
                  <span className="detail-price-orig">{formatPrice(product.original_price)}</span>
                )}
                {discount > 0 && <span className="price-discount">Tiết kiệm {discount}%</span>}
              </div>

              {/* Stock */}
              <div className="stock-info">
                <span className={`stock-dot${product.stock === 0 ? " out" : product.stock < 10 ? " low" : ""}`} />
                <span style={{ color: product.stock === 0 ? "var(--error)" : "var(--text-secondary)" }}>
                  {product.stock === 0
                    ? "Hết hàng"
                    : product.stock < 10
                    ? `Chỉ còn ${product.stock} sản phẩm`
                    : `Còn hàng (${product.stock} sản phẩm)`}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="detail-desc">{product.description}</p>
              )}

              {/* Size */}
              {sizes.length > 0 && (
                <div>
                  <p className="detail-section-label">
                    Chọn Size
                    {selectedSize && <span style={{ color: "var(--gold)", marginLeft: "8px" }}>{selectedSize}</span>}
                  </p>
                  <div className="size-grid">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        className={`size-btn${selectedSize === s ? " active" : ""}`}
                        onClick={() => { setSelectedSize(s); setSizeError(false); }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {sizeError && <p className="size-error">Vui lòng chọn size trước khi thêm giỏ hàng</p>}
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="detail-section-label">Số Lượng</p>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="qty-value">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className={`add-cart-btn${added ? " added" : ""}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {added ? (
                    <>✓ Đã Thêm Vào Giỏ!</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      Thêm Vào Giỏ Hàng
                    </>
                  )}
                </button>
                <button
                  className="buy-now-btn"
                  onClick={() => { handleAddToCart(); router.push("/checkout"); }}
                  disabled={product.stock === 0}
                >
                  Mua Ngay
                </button>
              </div>

              {/* Features */}
              <div className="feature-grid">
                <div className="feature-item"><span>🚚</span> Miễn phí vận chuyển</div>
                <div className="feature-item"><span>🔄</span> Đổi trả 30 ngày</div>
                <div className="feature-item"><span>💎</span> Chất liệu cao cấp</div>
                <div className="feature-item"><span>🛡️</span> Bảo hành chính hãng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
