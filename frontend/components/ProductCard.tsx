"use client";

import Link from "next/link";
import Image from "next/image";
import { Product, formatPrice, parseSizes, getDiscount } from "@/lib/api";
import { addToCart, getCart, getCartCount } from "@/lib/cart";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [added, setAdded] = useState(false);
  const sizes = parseSizes(product.sizes);
  const discount = getDiscount(product.price, product.original_price);
  const defaultSize = sizes[0] ?? "";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      image_data: product.image_data,
      quantity: 1,
      size: defaultSize,
    });
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <style>{`
        .product-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: var(--transition);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg), var(--shadow-gold);
        }
        .product-img-wrap {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        .product-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .product-card:hover .product-img-wrap img {
          transform: scale(1.06);
        }
        .product-badges {
          position: absolute;
          top: 12px; left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .product-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 12px;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-overlay {
          transform: translateY(0);
        }
        .quick-add-btn {
          width: 100%;
          padding: 10px;
          background: var(--gold);
          color: var(--bg-primary);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: var(--transition-fast);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .quick-add-btn:hover { background: var(--gold-light); }
        .quick-add-btn.added { background: var(--success); color: white; }
        .product-info {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .product-category {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--gold);
        }
        .product-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .product-prices {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .product-sizes {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .size-chip {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
        }
        .out-of-stock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(8,8,15,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .out-of-stock-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--error);
          background: rgba(248,113,113,0.15);
          border: 1px solid rgba(248,113,113,0.4);
          padding: 6px 14px;
          border-radius: 4px;
        }
        .no-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted);
          font-size: 13px;
          background: var(--bg-secondary);
        }
      `}</style>

      <Link href={`/products/detail?id=${product.id}`} className="product-card">
        <div className="product-img-wrap">
          {product.image_data ? (
            <img src={product.image_data} alt={product.name} loading="lazy" />
          ) : (
            <div className="no-img-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          <div className="product-badges">
            {product.is_featured === 1 && (
              <span className="badge badge-gold">Nổi Bật</span>
            )}
            {discount > 0 && (
              <span className="badge badge-success">-{discount}%</span>
            )}
          </div>

          {product.stock === 0 && (
            <div className="out-of-stock-overlay">
              <span className="out-of-stock-label">Hết Hàng</span>
            </div>
          )}

          {product.stock > 0 && (
            <div className="product-overlay">
              <button
                className={`quick-add-btn${added ? " added" : ""}`}
                onClick={handleQuickAdd}
              >
                {added ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Đã Thêm!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Thêm Giỏ Hàng
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="product-info">
          {product.category_name && (
            <span className="product-category">{product.category_name}</span>
          )}
          <p className="product-name">{product.name}</p>
          <div className="product-prices">
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="price-original">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          {sizes.length > 0 && (
            <div className="product-sizes">
              {sizes.slice(0, 5).map((s) => (
                <span key={s} className="size-chip">{s}</span>
              ))}
              {sizes.length > 5 && (
                <span className="size-chip">+{sizes.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </>
  );
}
