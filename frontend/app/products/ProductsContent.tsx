"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productsApi, categoriesApi, Product, Category } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const activeCategory = searchParams.get("category") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const LIMIT = 12;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({
        category: activeCategory || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: LIMIT,
      });
      setProducts(res.data ?? []);
      setTotal(res.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, debouncedSearch, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoriesApi.list().then((r) => setCategories(r.data ?? [])); }, []);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <style>{`
        .products-page { padding-bottom: 80px; }
        .products-hero {
          padding: 60px 0 40px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          text-align: center;
          position: relative;
        }
        .products-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px 0;
          flex-wrap: wrap;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 240px;
          max-width: 380px;
        }
        .search-input {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 11px 14px 11px 42px;
          font-size: 14px;
          color: var(--text-primary);
          width: 100%;
          outline: none;
          transition: var(--transition-fast);
        }
        .search-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); }
        .search-input::placeholder { color: var(--text-muted); }
        .search-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .cat-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .cat-filter-btn {
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }
        .cat-filter-btn:hover { border-color: var(--gold); color: var(--gold); }
        .cat-filter-btn.active {
          background: var(--gold);
          color: var(--bg-primary);
          border-color: var(--gold);
          font-weight: 600;
        }
        .results-meta { font-size: 13px; color: var(--text-muted); margin: 0 0 24px; }
        .results-meta span { color: var(--gold); font-weight: 600; }
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 48px;
        }
        .page-btn {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .page-btn:hover { border-color: var(--gold); color: var(--gold); }
        .page-btn.active { background: var(--gold); color: var(--bg-primary); border-color: var(--gold); font-weight: 700; }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 80px 0; color: var(--text-muted); }
        .empty-state h3 { font-size: 20px; color: var(--text-secondary); margin-bottom: 8px; }
      `}</style>

      <div className="products-page">
        <div className="products-hero">
          <div className="container">
            <span className="section-label">Cửa Hàng</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)", marginBottom: "12px", position: "relative" }}>
              Tất Cả Sản Phẩm
            </h1>
            <p style={{ color: "var(--text-secondary)", position: "relative" }}>
              Khám phá bộ sưu tập thời trang đa dạng, phong phú
            </p>
          </div>
        </div>

        <div className="container">
          <div className="filter-bar">
            <div className="search-wrap">
              <span className="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </span>
              <input
                className="search-input"
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="cat-filters">
              <button className={`cat-filter-btn${!activeCategory ? " active" : ""}`} onClick={() => setCategory("")}>
                Tất Cả
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  className={`cat-filter-btn${activeCategory === c.slug ? " active" : ""}`}
                  onClick={() => setCategory(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <p className="results-meta">
            Hiển thị <span>{products.length}</span> / <span>{total}</span> sản phẩm
            {activeCategory && <> trong danh mục <span>{categories.find((c) => c.slug === activeCategory)?.name}</span></>}
          </p>

          {loading ? (
            <div className="skeleton-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderRadius: "12px", overflow: "hidden" }}>
                  <div className="skeleton" style={{ aspectRatio: "3/4" }} />
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="skeleton" style={{ height: 12, width: "60%" }} />
                    <div className="skeleton" style={{ height: 16 }} />
                    <div className="skeleton" style={{ height: 14, width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="product-grid fade-in">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto 20px", opacity: 0.3 }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                p.set("page", String(page - 1));
                router.push(`/products?${p.toString()}`);
              }}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} className={`page-btn${page === p ? " active" : ""}`} onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(p));
                    router.push(`/products?${params.toString()}`);
                  }}>{p}</button>
                );
              })}
              <button className="page-btn" disabled={page >= totalPages} onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                p.set("page", String(page + 1));
                router.push(`/products?${p.toString()}`);
              }}>→</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
