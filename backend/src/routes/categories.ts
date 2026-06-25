import { Hono } from 'hono';
import { Env, Category, ApiResponse } from '../types';

const categories = new Hono<{ Bindings: Env }>();

// GET /api/categories - List all categories
categories.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all<Category & { product_count: number }>();

    return c.json<ApiResponse<(Category & { product_count: number })[]>>({
      success: true,
      data: result.results,
    });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tải categories' }, 500);
  }
});

// GET /api/categories/:slug - Get products by category slug
categories.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  try {
    const category = await c.env.DB.prepare(
      'SELECT * FROM categories WHERE slug = ?'
    ).bind(slug).first<Category>();

    if (!category) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Category không tồn tại' }, 404);
    }

    return c.json<ApiResponse<Category>>({ success: true, data: category });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tải category' }, 500);
  }
});

export default categories;
