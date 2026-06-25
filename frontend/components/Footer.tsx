import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          margin-top: 80px;
        }
        .footer-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 24px 40px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
        }
        .footer-brand h3 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: var(--gold);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .footer-brand p {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.8;
          max-width: 280px;
        }
        .footer-social {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .social-btn {
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(201,169,110,0.08);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .social-btn:hover {
          background: var(--gold-glow);
          border-color: var(--gold);
          color: var(--gold);
          transform: translateY(-2px);
        }
        .footer-col h4 {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links a {
          font-size: 14px;
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--text-primary); }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1280px;
          margin: 0 auto;
        }
        .footer-bottom p {
          font-size: 13px;
          color: var(--text-muted);
        }
        .footer-bottom span { color: var(--gold); }
        @media (max-width: 768px) {
          .footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            padding: 40px 16px 32px;
          }
          .footer-brand { grid-column: 1 / -1; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
        }
        @media (max-width: 480px) {
          .footer-main { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h3>LUXE Fashion</h3>
            <p>
              Mang đến những sản phẩm thời trang cao cấp, tinh tế và hiện đại.
              Phong cách sống của bạn bắt đầu từ đây.
            </p>
            <div className="footer-social">
              {/* Facebook */}
              <a href="#" className="social-btn" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="social-btn" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="social-btn" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.53V6.76a4.85 4.85 0 01-1-.07z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Sản Phẩm</h4>
            <ul className="footer-links">
              <li><Link href="/products?category=ao">Áo</Link></li>
              <li><Link href="/products?category=quan">Quần</Link></li>
              <li><Link href="/products?category=vay-dam">Váy & Đầm</Link></li>
              <li><Link href="/products?category=phu-kien">Phụ Kiện</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hỗ Trợ</h4>
            <ul className="footer-links">
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Hướng dẫn size</a></li>
              <li><a href="#">Vận chuyển</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Về Chúng Tôi</h4>
            <ul className="footer-links">
              <li><a href="#">Câu chuyện</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Chính sách BM</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} <span>LUXE Fashion</span>. Tất cả quyền được bảo lưu.</p>
          <p>Made with <span>♥</span> in Vietnam</p>
        </div>
      </footer>
    </>
  );
}
