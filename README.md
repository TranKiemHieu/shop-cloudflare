# 🛍️ LUXE Fashion Store

Dự án bán quần áo online với **Next.js** (frontend), **Cloudflare Workers + Hono** (backend), và **Cloudflare D1** (SQL database).

## 🏗️ Cấu Trúc

```
cloudflare/
├── backend/           # Cloudflare Worker API (Hono + TypeScript)
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── routes/
│   │   │   ├── products.ts    # CRUD sản phẩm
│   │   │   ├── categories.ts  # Danh mục
│   │   │   └── orders.ts      # Đơn hàng
│   │   └── types/index.ts     # TypeScript interfaces
│   ├── schema.sql             # D1 schema + seed data (10 sản phẩm)
│   └── wrangler.toml          # Cloudflare config
└── frontend/          # Next.js App Router
    ├── app/
    │   ├── page.tsx           # Trang chủ (hero, categories, featured)
    │   ├── products/          # Danh sách + chi tiết sản phẩm
    │   ├── cart/              # Giỏ hàng (localStorage)
    │   ├── checkout/          # Thanh toán COD
    │   └── admin/             # Quản trị (CRUD + đơn hàng)
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   └── ProductCard.tsx
    └── lib/
        ├── api.ts             # API client
        └── cart.ts            # Cart logic
```

## 🚀 Chạy Local

### 1. Backend

```bash
cd backend
npm install

# Tạo D1 database (cần đăng nhập Cloudflare)
npx wrangler login
npm run db:create
# Copy database_id từ output, cập nhật vào wrangler.toml

# Khởi tạo schema + seed data
npm run db:init

# Chạy dev server
npm run dev
# API chạy tại: http://localhost:8787
```

### 2. Frontend

```bash
cd frontend
npm install

# Chỉnh sửa .env.local nếu cần:
# NEXT_PUBLIC_API_URL=http://localhost:8787

npm run dev
# App chạy tại: http://localhost:3000
```

## 📦 Deploy lên Cloudflare

### Backend (Worker)

```bash
cd backend

# Đảm bảo đã login Cloudflare
npx wrangler login

# Tạo D1 database trên cloud (nếu chưa)
npm run db:create

# Cập nhật database_id trong wrangler.toml

# Chạy schema trên remote
npm run db:init:remote

# Deploy Worker
npm run deploy
# → https://fashion-store-api.<subdomain>.workers.dev
```

### Frontend (Cloudflare Pages)

```bash
cd frontend

# Cập nhật NEXT_PUBLIC_API_URL trong .env.production
# với URL Worker đã deploy ở bước trên

npm run build

# Deploy qua Cloudflare Pages dashboard hoặc:
npx wrangler pages deploy out
```

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy danh sách (filter, search, paginate) |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products` | Tạo sản phẩm mới |
| PUT | `/api/products/:id` | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Xóa sản phẩm |
| GET | `/api/categories` | Danh sách categories |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders` | Danh sách đơn hàng |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái |

## 🎨 Tech Stack

- **Frontend**: Next.js 14 (App Router), Vanilla CSS, Google Fonts
- **Backend**: Cloudflare Workers, Hono v4, TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **Styling**: Dark luxury theme, gold accents, glassmorphism

## 📸 Tính Năng

- ✅ Trang chủ với hero animated, categories, featured products
- ✅ Danh sách sản phẩm với filter + search + pagination
- ✅ Chi tiết sản phẩm: size picker, quantity, add to cart
- ✅ Giỏ hàng (localStorage, free shipping threshold)
- ✅ Checkout form với validation + COD
- ✅ Admin: CRUD sản phẩm, upload ảnh từ file, quản lý đơn hàng
- ✅ Responsive mobile-first design
- ✅ Skeleton loading states
