"use client";

import { useState, useEffect, useRef } from "react";
import { productsApi, categoriesApi, ordersApi, Product, Category, Order, formatPrice, parseSizes } from "@/lib/api";

type Tab = "products" | "orders";
type ModalMode = "create" | "edit";

const EMPTY_FORM = {
  name: "", description: "", price: "", original_price: "",
  category_id: "", stock: "", sizes: "", is_featured: false, image_data: "",
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; product?: Product }>({ open: false, mode: "create" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([productsApi.list({ limit: 100 }), categoriesApi.list()]);
    setProducts(pRes.data ?? []);
    setCategories(cRes.data ?? []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const res = await ordersApi.list();
    setOrders(res.data ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (tab === "orders") fetchOrders();
  }, [tab]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImagePreview("");
    setModal({ open: true, mode: "create" });
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      original_price: String(p.original_price ?? ""),
      category_id: String(p.category_id ?? ""),
      stock: String(p.stock),
      sizes: parseSizes(p.sizes).join(", "),
      is_featured: p.is_featured === 1,
      image_data: p.image_data ?? "",
    });
    setImagePreview(p.image_data ?? "");
    setModal({ open: true, mode: "edit", product: p });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setForm((f) => ({ ...f, image_data: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      showToast("Tên và giá là bắt buộc", "error");
      return;
    }
    setSaving(true);
    const sizesArr = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : undefined,
      image_data: form.image_data || undefined,
      category_id: form.category_id ? parseInt(form.category_id) : undefined,
      stock: form.stock ? parseInt(form.stock) : 0,
      sizes: sizesArr,
      is_featured: form.is_featured,
    };

    const res = modal.mode === "create"
      ? await productsApi.create(payload)
      : await productsApi.update(modal.product!.id, payload);

    if (res.success) {
      showToast(modal.mode === "create" ? "Thêm sản phẩm thành công!" : "Cập nhật thành công!");
      setModal({ open: false, mode: "create" });
      fetchData();
    } else {
      showToast(res.error ?? "Lỗi lưu sản phẩm", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    const res = await productsApi.delete(id);
    if (res.success) { showToast("Đã xóa sản phẩm!"); fetchData(); }
    else showToast(res.error ?? "Lỗi xóa", "error");
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    await ordersApi.updateStatus(orderId, status);
    fetchOrders();
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ xác nhận", confirmed: "Đã xác nhận",
    shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy",
  };

  return (
    <>
      <style>{`
        .admin-page { padding: 40px 0 80px; min-height: 80vh; }
        .admin-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
        }
        .tab-bar {
          display: flex; gap: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: 28px;
        }
        .tab-btn {
          padding: 11px 24px;
          font-size: 14px; font-weight: 500;
          cursor: pointer; border: none;
          background: transparent;
          color: var(--text-secondary);
          transition: var(--transition-fast);
          display: flex; align-items: center; gap: 8px;
        }
        .tab-btn.active { background: var(--gold); color: var(--bg-primary); font-weight: 600; }
        .tab-btn:hover:not(.active) { background: var(--bg-card-hover); color: var(--text-primary); }
        /* Stats */
        .admin-stats {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px;
        }
        .stat-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md);
          padding: 20px; display: flex; flex-direction: column; gap: 8px;
        }
        .stat-card-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); }
        .stat-card-value { font-size: 26px; font-weight: 700; color: var(--gold); font-family: 'Playfair Display', serif; }
        /* Table */
        .admin-table-wrap {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;
        }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th {
          padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted);
          background: var(--bg-secondary); border-bottom: 1px solid var(--border);
        }
        .admin-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--bg-card-hover); }
        .table-img {
          width: 48px; height: 58px; border-radius: 6px; overflow: hidden;
          background: var(--bg-secondary); flex-shrink: 0;
        }
        .table-img img { width: 100%; height: 100%; object-fit: cover; }
        .table-name { font-weight: 600; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 20px;
        }
        .modal-box {
          background: var(--bg-card); border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg); width: 100%; max-width: 640px;
          max-height: 90vh; overflow-y: auto; animation: fadeIn 0.25s ease;
        }
        .modal-header {
          padding: 24px 28px 20px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; background: var(--bg-card); z-index: 1;
        }
        .modal-header h3 { font-family: 'Playfair Display', serif; font-size: 20px; }
        .modal-close {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; border: 1px solid var(--border);
          background: transparent; color: var(--text-secondary);
          cursor: pointer; font-size: 18px; transition: var(--transition-fast);
        }
        .modal-close:hover { background: var(--bg-secondary); color: var(--error); }
        .modal-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }
        .modal-footer {
          padding: 20px 28px; border-top: 1px solid var(--border);
          display: flex; gap: 12px; justify-content: flex-end;
          position: sticky; bottom: 0; background: var(--bg-card);
        }
        /* Image upload */
        .img-upload-area {
          border: 2px dashed var(--border); border-radius: var(--radius-sm);
          padding: 20px; text-align: center; cursor: pointer;
          transition: var(--transition-fast);
        }
        .img-upload-area:hover { border-color: var(--gold); background: var(--gold-glow); }
        .img-preview {
          width: 100%; max-height: 200px; object-fit: cover;
          border-radius: var(--radius-sm); margin-top: 12px;
        }
        /* Toast */
        .toast-wrap {
          position: fixed; bottom: 24px; right: 24px; z-index: 300;
          animation: slideInRight 0.3s ease;
        }
        .toast-msg {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 14px 20px;
          font-size: 14px; box-shadow: var(--shadow-lg);
          display: flex; align-items: center; gap: 10px; min-width: 280px;
        }
        .toast-msg.success { border-left: 3px solid var(--success); }
        .toast-msg.error { border-left: 3px solid var(--error); }
        @media (max-width: 900px) {
          .admin-stats { grid-template-columns: 1fr 1fr; }
          .admin-table-wrap { overflow-x: auto; }
        }
        @media (max-width: 480px) {
          .admin-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="admin-page">
        <div className="container">
          <div className="admin-header">
            <div>
              <span className="section-label">Quản Trị</span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 36px)" }}>
                Admin Dashboard
              </h1>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-card-label">Tổng Sản Phẩm</div>
              <div className="stat-card-value">{products.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Danh Mục</div>
              <div className="stat-card-value">{categories.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Đơn Hàng</div>
              <div className="stat-card-value">{orders.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Doanh Thu</div>
              <div className="stat-card-value" style={{ fontSize: "18px" }}>
                {formatPrice(orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn${tab === "products" ? " active" : ""}`} onClick={() => setTab("products")}>
              📦 Sản Phẩm
            </button>
            <button className={`tab-btn${tab === "orders" ? " active" : ""}`} onClick={() => setTab("orders")}>
              🛒 Đơn Hàng
            </button>
          </div>

          {/* Products Tab */}
          {tab === "products" && (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <button className="btn btn-primary" onClick={openCreate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Thêm Sản Phẩm
                </button>
              </div>

              <div className="admin-table-wrap">
                {loading ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sản Phẩm</th>
                        <th>Giá</th>
                        <th>Danh Mục</th>
                        <th>Tồn Kho</th>
                        <th>Nổi Bật</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div className="table-img">
                                {p.image_data
                                  ? <img src={p.image_data} alt={p.name} />
                                  : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📷</div>
                                }
                              </div>
                              <span className="table-name">{p.name}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--gold)" }}>{formatPrice(p.price)}</div>
                            {p.original_price && (
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                {formatPrice(p.original_price)}
                              </div>
                            )}
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>{p.category_name ?? "—"}</td>
                          <td>
                            <span style={{ color: p.stock === 0 ? "var(--error)" : p.stock < 10 ? "var(--warning)" : "var(--success)", fontWeight: 600 }}>
                              {p.stock}
                            </span>
                          </td>
                          <td>
                            {p.is_featured === 1 ? <span className="badge badge-gold">⭐ Có</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Sửa</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                          Chưa có sản phẩm nào
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Khách Hàng</th><th>SĐT</th><th>Thành Phố</th>
                    <th>Tổng</th><th>Trạng Thái</th><th>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ color: "var(--gold)", fontWeight: 700 }}>#{o.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{o.email}</div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{o.phone}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{o.city}</td>
                      <td style={{ fontWeight: 700, color: "var(--gold)" }}>{formatPrice(o.total)}</td>
                      <td>
                        <select
                          className="form-input"
                          style={{ fontSize: "12px", padding: "6px 10px", width: "auto" }}
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(o.created_at).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      Chưa có đơn hàng nào
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal({ open: false, mode: "create" }); }}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{modal.mode === "create" ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"}</h3>
              <button className="modal-close" onClick={() => setModal({ open: false, mode: "create" })}>×</button>
            </div>

            <div className="modal-body">
              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">Hình Ảnh Sản Phẩm</label>
                <div className="img-upload-area" onClick={() => fileRef.current?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="img-preview" />
                  ) : (
                    <>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📁</div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Click để chọn file ảnh</p>
                      <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>JPG, PNG, WEBP (tối đa 5MB)</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                {imagePreview && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: "8px" }}
                    onClick={() => { setImagePreview(""); setForm(f => ({ ...f, image_data: "" })); if (fileRef.current) fileRef.current.value = ""; }}>
                    🗑️ Xóa ảnh
                  </button>
                )}
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Hoặc nhập URL ảnh:
                </p>
                <input
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={!imagePreview.startsWith("data:") ? form.image_data : ""}
                  onChange={(e) => {
                    setForm(f => ({ ...f, image_data: e.target.value }));
                    setImagePreview(e.target.value);
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Tên Sản Phẩm *</label>
                  <input className="form-input" placeholder="Áo Sơ Mi Trắng..." value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Giá Bán (VNĐ) *</label>
                  <input className="form-input" type="number" placeholder="450000" value={form.price}
                    onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Giá Gốc (VNĐ)</label>
                  <input className="form-input" type="number" placeholder="600000" value={form.original_price}
                    onChange={(e) => setForm(f => ({ ...f, original_price: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Danh Mục</label>
                  <select className="form-input" value={form.category_id}
                    onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tồn Kho</label>
                  <input className="form-input" type="number" placeholder="50" value={form.stock}
                    onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Size (cách nhau bằng dấu phẩy)</label>
                  <input className="form-input" placeholder="S, M, L, XL hoặc 28, 29, 30, 31" value={form.sizes}
                    onChange={(e) => setForm(f => ({ ...f, sizes: e.target.value }))} />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Mô Tả</label>
                  <textarea className="form-input" rows={3} placeholder="Mô tả chi tiết sản phẩm..."
                    value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: "vertical" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="checkbox" id="is_featured" checked={form.is_featured}
                    onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                    style={{ width: "16px", height: "16px", accentColor: "var(--gold)" }} />
                  <label htmlFor="is_featured" style={{ fontSize: "14px", cursor: "pointer" }}>
                    ⭐ Sản phẩm nổi bật
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal({ open: false, mode: "create" })}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : modal.mode === "create" ? "Thêm Sản Phẩm" : "Lưu Thay Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-wrap">
          <div className={`toast-msg ${toast.type}`}>
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}
