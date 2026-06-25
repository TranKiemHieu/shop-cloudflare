"use client";

import { useState, useEffect } from "react";
import { productsApi, categoriesApi, Product, Category, formatPrice } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.list({ featured: true, limit: 8 }),
      categoriesApi.list(),
    ]).then(([featuredRes, categoriesRes]) => {
      setFeatured(featuredRes.data ?? []);
      setCategories(categoriesRes.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        .hero {
          position: relative;
          min-height: calc(100vh - 72px);
          display: flex;
          align-items: center;
          overflow: hidden;
          background: var(--bg-primary);
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 30% 80%, rgba(100,60,180,0.05) 0%, transparent 50%);
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 60px 60px;
          opacity: 0.3;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          width: 100%;
        }
        .hero-text { animation: fadeIn 0.8s ease; }
        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 24px;
        }
        .hero-label::before {
          content: '';
          display: block;
          width: 32px; height: 1px;
          background: var(--gold);
        }
        .hero-title {
          font-size: clamp(40px, 5vw, 70px);
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 24px;
        }
        .hero-title em { font-style: italic; color: var(--gold); }
        .hero-desc {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 40px;
          max-width: 480px;
        }
        .hero-cta { display: flex; gap: 16px; flex-wrap: wrap; }
        .hero-stats {
          display: flex;
          gap: 40px;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid var(--border);
        }
        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--gold);
        }
        .stat-label { font-size: 12px; color: var(--text-muted); letter-spacing: 1px; }
        .hero-image { position: relative; animation: fadeIn 1s ease 0.2s both; }
        .hero-image-main {
          border-radius: var(--radius-lg);
          overflow: hidden;
          aspect-ratio: 3/4;
          border: 1px solid var(--border);
          background: var(--bg-card);
        }
        .hero-image-main img { width: 100%; height: 100%; object-fit: cover; }
        .hero-float-card {
          position: absolute;
          bottom: -20px;
          left: -30px;
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          min-width: 200px;
          animation: float 4s ease-in-out infinite;
        }
        .hero-float-card2 {
          position: absolute;
          top: 40px;
          right: -20px;
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          animation: float 4s ease-in-out infinite 2s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .float-label { font-size: 11px; color: var(--text-muted); letter-spacing: 1px; }
        .float-value { font-size: 15px; font-weight: 700; color: var(--gold); margin-top: 4px; }
        .categories-section {
          padding: 80px 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 40px;
        }
        .cat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 32px 24px;
          text-align: center;
          transition: var(--transition);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .cat-card:hover {
          border-color: var(--gold);
          background: var(--gold-glow);
          transform: translateY(-4px);
          box-shadow: var(--shadow-gold);
        }
        .cat-icon {
          width: 56px; height: 56px;
          background: var(--gold-glow);
          border: 1px solid rgba(201,169,110,0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .cat-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .cat-count { font-size: 12px; color: var(--text-muted); }
        .featured-section { padding: 80px 0; }
        .section-top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .view-all-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--gold);
          letter-spacing: 0.5px;
          transition: gap 0.2s;
        }
        .view-all-link:hover { gap: 10px; }
        .promo-banner {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: var(--radius-lg);
          padding: 60px 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          position: relative;
          overflow: hidden;
          margin: 40px 0 80px;
        }
        .promo-banner::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(201,169,110,0.15) 0%, transparent 70%);
        }
        .promo-content { position: relative; z-index: 1; }
        .promo-badge {
          display: inline-block;
          background: var(--gold);
          color: var(--bg-primary);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .promo-title { font-size: clamp(28px, 3vw, 40px); font-family: 'Playfair Display', serif; margin-bottom: 16px; }
        .promo-desc { color: var(--text-secondary); font-size: 15px; margin-bottom: 28px; }
        .promo-image { text-align: center; font-size: 120px; animation: float 3s ease-in-out infinite; z-index: 1; }
        @media (max-width: 900px) {
          .hero-content { grid-template-columns: 1fr; }
          .hero-image { display: none; }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
          .promo-banner { grid-template-columns: 1fr; }
          .promo-image { display: none; }
        }
        @media (max-width: 640px) {
          .hero-stats { gap: 24px; }
          .section-top { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-label">Bộ Sưu Tập 2025</div>
            <h1 className="hero-title">
              Thời Trang<br />
              Định Nghĩa<br />
              <em>Phong Cách</em>
            </h1>
            <p className="hero-desc">
              Khám phá những thiết kế tinh tế, chất liệu cao cấp,
              mang đến vẻ đẹp sang trọng và hiện đại cho mỗi ngày.
            </p>
            <div className="hero-cta">
              <Link href="/products" className="btn btn-primary btn-lg">
                Khám Phá Ngay
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/products?featured=true" className="btn btn-secondary btn-lg">
                Sản Phẩm Nổi Bật
              </Link>
            </div>
            <div className="hero-stats">
              <div><div className="stat-number">500+</div><div className="stat-label">Sản Phẩm</div></div>
              <div><div className="stat-number">10K+</div><div className="stat-label">Khách Hàng</div></div>
              <div><div className="stat-number">99%</div><div className="stat-label">Hài Lòng</div></div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-main">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80" alt="Fashion" />
            </div>
            <div className="hero-float-card">
              <div className="float-label">⭐ Được Đánh Giá</div>
              <div className="float-value">4.9 / 5.0</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Từ 2,400+ đánh giá</div>
            </div>
            <div className="hero-float-card2">
              <div className="float-label">🚚 Miễn Phí</div>
              <div className="float-value">Giao Hàng</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Danh Mục</span>
            <h2>Khám Phá Theo Loại</h2>
            <p>Tìm kiếm phong cách phù hợp với bạn qua các danh mục đa dạng</p>
          </div>
          <div className="cat-grid">
            {[
              { slug: "ao", icon: "👔", name: "Áo" },
              { slug: "quan", icon: "👖", name: "Quần" },
              { slug: "vay-dam", icon: "👗", name: "Váy & Đầm" },
              { slug: "phu-kien", icon: "👜", name: "Phụ Kiện" },
            ].map((cat) => {
              const found = categories.find((c) => c.slug === cat.slug);
              return (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="cat-card">
                  <div className="cat-icon">{cat.icon}</div>
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-count">{found?.product_count ?? 0} sản phẩm</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-section">
        <div className="container">
          <div className="section-top">
            <div>
              <span className="section-label">Nổi Bật</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)" }}>
                Sản Phẩm Được Yêu Thích
              </h2>
            </div>
            <Link href="/products" className="view-all-link">
              Xem Tất Cả
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden" }}>
                  <div className="skeleton" style={{ aspectRatio: "3/4" }} />
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="skeleton" style={{ height: 12, width: "60%" }} />
                    <div className="skeleton" style={{ height: 16 }} />
                    <div className="skeleton" style={{ height: 14, width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="product-grid">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <p>Chưa có sản phẩm nào. <Link href="/admin" style={{ color: "var(--gold)" }}>Thêm sản phẩm →</Link></p>
            </div>
          )}

          {/* Promo Banner */}
          <div className="promo-banner">
            <div className="promo-content">
              <div className="promo-badge">Ưu Đãi Đặc Biệt</div>
              <h2 className="promo-title">Giảm 20% Đơn Hàng<br />Đầu Tiên Của Bạn</h2>
              <p className="promo-desc">
                Đăng ký nhận tin và nhận ngay voucher giảm giá 20% cho lần mua đầu tiên.
                Áp dụng cho tất cả sản phẩm.
              </p>
              <Link href="/products" className="btn btn-primary">Mua Sắm Ngay →</Link>
            </div>
            <div className="promo-image">✨</div>
          </div>
        </div>
      </section>
    </>
  );
}
