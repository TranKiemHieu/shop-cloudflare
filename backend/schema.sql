-- ============================================
-- Fashion Store Database Schema
-- Cloudflare D1 (SQLite compatible)
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  original_price REAL,
  image_data TEXT,         -- stores base64 data URL or external URL
  category_id INTEGER,
  stock INTEGER DEFAULT 0,
  sizes TEXT DEFAULT '[]', -- JSON array: ["S","M","L","XL"]
  is_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | confirmed | shipping | delivered | cancelled
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  size TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================
-- Seed Data
-- ============================================

INSERT OR IGNORE INTO categories (id, name, slug) VALUES
  (1, 'Áo', 'ao'),
  (2, 'Quần', 'quan'),
  (3, 'Váy & Đầm', 'vay-dam'),
  (4, 'Phụ Kiện', 'phu-kien');

INSERT OR IGNORE INTO products (id, name, description, price, original_price, image_data, category_id, stock, sizes, is_featured) VALUES
(1, 'Áo Sơ Mi Trắng Classic',
 'Áo sơ mi trắng thanh lịch, chất liệu cotton 100% cao cấp, thoáng mát, không nhăn. Phù hợp đi làm và dạo phố.',
 450000, 600000,
 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
 1, 50, '["S","M","L","XL"]', 1),

(2, 'Áo Thun Oversize Basic',
 'Áo thun oversize basic form rộng thoải mái, chất cotton dày dặn, màu sắc trẻ trung, dễ phối đồ.',
 280000, 350000,
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
 1, 80, '["S","M","L","XL","2XL"]', 1),

(3, 'Áo Khoác Denim Vintage',
 'Áo khoác denim phong cách vintage Hàn Quốc, wash màu tự nhiên, túi hộp tiện dụng.',
 650000, 850000,
 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
 1, 30, '["S","M","L","XL"]', 1),

(4, 'Áo Blazer Linen',
 'Áo blazer linen cao cấp, form chuẩn công sở, chất vải mát mẻ, phù hợp 4 mùa.',
 890000, 1200000,
 'https://images.unsplash.com/photo-1594938298603-c8148c4b4ae7?w=800&q=80',
 1, 20, '["XS","S","M","L","XL"]', 0),

(5, 'Quần Jeans Slim Fit',
 'Quần jeans ống đứng slim fit, vải denim co giãn 4 chiều, tôn dáng, bền màu.',
 580000, 720000,
 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
 2, 45, '["28","29","30","31","32","33","34"]', 1),

(6, 'Quần Âu Ống Suông',
 'Quần âu ống suông thanh lịch, chất liệu polyester cao cấp, không nhăn, phù hợp công sở.',
 520000, 680000,
 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
 2, 35, '["28","29","30","31","32","33"]', 0),

(7, 'Quần Short Kaki Summer',
 'Quần short kaki năng động, chất liệu thoáng mát, nhiều màu tươi sáng cho mùa hè.',
 320000, 420000,
 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&q=80',
 2, 60, '["S","M","L","XL"]', 0),

(8, 'Váy Hoa Midi Dịu Dàng',
 'Váy hoa midi thanh thoát, chất liệu voan mềm nhẹ, phù hợp dạo phố và đi tiệc nhẹ.',
 480000, 620000,
 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80',
 3, 25, '["XS","S","M","L"]', 1),

(9, 'Đầm Maxi Boho Chic',
 'Đầm maxi phong cách boho tự do, vải mềm mại, hoạ tiết đẹp, lý tưởng cho du lịch biển.',
 720000, 950000,
 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
 3, 20, '["S","M","L"]', 1),

(10, 'Đầm Bodycon Tối Giản',
 'Đầm bodycon tối giản, ôm dáng sang trọng, chất liệu spandex cao cấp, phù hợp đi tiệc.',
 560000, 720000,
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
 3, 30, '["XS","S","M","L","XL"]', 0);
