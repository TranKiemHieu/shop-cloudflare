import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

export const metadata = {
  title: "Tất Cả Sản Phẩm",
  description: "Khám phá bộ sưu tập thời trang đa dạng tại LUXE Fashion",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
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
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
