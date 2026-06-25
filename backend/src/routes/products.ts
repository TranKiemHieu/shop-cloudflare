import { Hono } from 'hono';
import { Env, Product, ProductInput, ApiResponse } from '../types';

const products = new Hono<{ Bindings: Env }>();

// GET /api/products - List all products with optional filters
products.get('/', async (c) => {
  const { category, featured, search, page = '1', limit = '12' } = c.req.query();
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    if (featured === 'true') {
      query += ' AND p.is_featured = 1';
    }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total ?? 0;

    // Paginated results
    query += ' ORDER BY p.is_featured DESC, p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const result = await c.env.DB.prepare(query).bind(...params).all<Product>();

    return c.json<ApiResponse<Product[]>>({
      success: true,
      data: result.results,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tải danh sách sản phẩm' }, 500);
  }
});

// GET /api/products/:id - Get single product
products.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json<ApiResponse<null>>({ success: false, error: 'ID không hợp lệ' }, 400);
  }

  try {
    const product = await c.env.DB.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).bind(id).first<Product>();

    if (!product) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Không tìm thấy sản phẩm' }, 404);
    }

    return c.json<ApiResponse<Product>>({ success: true, data: product });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tải sản phẩm' }, 500);
  }
});

// POST /api/products - Create product
products.post('/', async (c) => {
  try {
    const body = await c.req.json<ProductInput>();

    if (!body.name || !body.price) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Tên và giá là bắt buộc' }, 400);
    }

    const sizesJson = JSON.stringify(body.sizes ?? []);
    const result = await c.env.DB.prepare(`
      INSERT INTO products (name, description, price, original_price, image_data, category_id, stock, sizes, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      body.description ?? null,
      body.price,
      body.original_price ?? null,
      body.image_data ?? null,
      body.category_id ?? null,
      body.stock ?? 0,
      sizesJson,
      body.is_featured ? 1 : 0,
    ).run();

    const newProduct = await c.env.DB.prepare(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?'
    ).bind(result.meta.last_row_id).first<Product>();

    return c.json<ApiResponse<Product>>({ success: true, data: newProduct! }, 201);
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tạo sản phẩm' }, 500);
  }
});

// PUT /api/products/:id - Update product
products.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json<ApiResponse<null>>({ success: false, error: 'ID không hợp lệ' }, 400);
  }

  try {
    const body = await c.req.json<Partial<ProductInput>>();

    const existing = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first<Product>();
    if (!existing) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Không tìm thấy sản phẩm' }, 404);
    }

    const sizesJson = body.sizes ? JSON.stringify(body.sizes) : existing.sizes;

    await c.env.DB.prepare(`
      UPDATE products SET
        name = ?,
        description = ?,
        price = ?,
        original_price = ?,
        image_data = ?,
        category_id = ?,
        stock = ?,
        sizes = ?,
        is_featured = ?
      WHERE id = ?
    `).bind(
      body.name ?? existing.name,
      body.description !== undefined ? body.description : existing.description,
      body.price ?? existing.price,
      body.original_price !== undefined ? body.original_price : existing.original_price,
      body.image_data !== undefined ? body.image_data : existing.image_data,
      body.category_id !== undefined ? body.category_id : existing.category_id,
      body.stock !== undefined ? body.stock : existing.stock,
      sizesJson,
      body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : existing.is_featured,
      id,
    ).run();

    const updated = await c.env.DB.prepare(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?'
    ).bind(id).first<Product>();

    return c.json<ApiResponse<Product>>({ success: true, data: updated! });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi cập nhật sản phẩm' }, 500);
  }
});

// DELETE /api/products/:id - Delete product
products.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json<ApiResponse<null>>({ success: false, error: 'ID không hợp lệ' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare('SELECT id FROM products WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Không tìm thấy sản phẩm' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM order_items WHERE product_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();

    return c.json<ApiResponse<null>>({ success: true, data: null });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi xóa sản phẩm' }, 500);
  }
});

export default products;
