import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "LUXE Fashion – Thời Trang Cao Cấp",
    template: "%s | LUXE Fashion",
  },
  description:
    "Khám phá bộ sưu tập quần áo thời trang cao cấp tại LUXE Fashion. Phong cách, chất lượng, đẳng cấp.",
  keywords: ["thời trang", "quần áo", "thời trang cao cấp", "mua sắm online"],
  openGraph: {
    type: "website",
    siteName: "LUXE Fashion",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Navbar />
        <main style={{ minHeight: "100vh", paddingTop: "72px" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
