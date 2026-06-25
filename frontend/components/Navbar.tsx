"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCartCount, getCart } from "@/lib/cart";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount(getCart()));
    updateCount();
    window.addEventListener("cartUpdated", updateCount);
    return () => window.removeEventListener("cartUpdated", updateCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Trang Chủ" },
    { href: "/products", label: "Sản Phẩm" },
    { href: "/admin", label: "Quản Trị" },
  ];

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: all 0.3s ease;
          padding: 0 24px;
        }
        .navbar.scrolled {
          background: rgba(8, 8, 15, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--gold);
          text-transform: uppercase;
        }
        .navbar-logo span { color: var(--text-primary); }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 36px;
          list-style: none;
        }
        .navbar-links a {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-secondary);
          transition: color 0.2s ease;
          position: relative;
        }
        .navbar-links a::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1px;
          background: var(--gold);
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .navbar-links a:hover,
        .navbar-links a.active { color: var(--gold); }
        .navbar-links a:hover::after,
        .navbar-links a.active::after { transform: scaleX(1); }
        .navbar-cart {
          position: relative;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(201, 169, 110, 0.1);
          border: 1px solid var(--border);
          color: var(--gold);
          transition: var(--transition);
        }
        .navbar-cart:hover {
          background: var(--gold-glow);
          border-color: var(--gold);
          transform: scale(1.05);
        }
        .cart-badge {
          position: absolute;
          top: -4px; right: -4px;
          width: 18px; height: 18px;
          background: var(--gold);
          color: var(--bg-primary);
          font-size: 10px;
          font-weight: 700;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .menu-toggle {
          display: none;
          width: 36px; height: 36px;
          align-items: center; justify-content: center;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
        }
        .menu-toggle span {
          display: block;
          width: 22px; height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: var(--transition);
        }
        .menu-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .menu-toggle.open span:nth-child(2) { opacity: 0; }
        .menu-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
        .mobile-menu {
          display: none;
          position: fixed;
          top: 72px; left: 0; right: 0;
          background: rgba(8, 8, 15, 0.97);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 24px;
          z-index: 99;
          flex-direction: column;
          gap: 20px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          transition: color 0.2s;
        }
        .mobile-menu a:hover, .mobile-menu a.active { color: var(--gold); }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .menu-toggle { display: flex; }
        }
      `}</style>

      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            LUXE <span>Fashion</span>
          </Link>

          <ul className="navbar-links">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={pathname === l.href ? "active" : ""}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-right">
            <Link href="/cart" className="navbar-cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <button
              className={`menu-toggle${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}
