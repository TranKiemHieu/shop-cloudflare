import { Hono } from 'hono';
import { Env, Order, OrderItem, CreateOrderInput, ApiResponse } from '../types';

const orders = new Hono<{ Bindings: Env }>();

// GET /api/orders - List all orders (admin)
orders.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC
    `).all<Order>();

    return c.json<ApiResponse<Order[]>>({
      success: true,
      data: result.results,
      total: result.results.length,
    });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tải đơn hàng' }, 500);
  }
});

// GET /api/orders/:id - Get order detail
orders.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json<ApiResponse<null>>({ success: false, error: 'ID không hợp lệ' }, 400);
  }

  try {
    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).bind(id).first<Order>();

    if (!order) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Không tìm thấy đơn hàng' }, 404);
    }

    const items = await c.env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).bind(id).all<OrderItem>();

    return c.json<ApiResponse<Order & { items: OrderItem[] }>>({
      success: true,
      data: { ...order, items: items.results },
    });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tải đơn hàng' }, 500);
  }
});

// POST /api/orders - Create new order
orders.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateOrderInput>();

    // Validate required fields
    if (!body.customer_name || !body.email || !body.phone || !body.address || !body.city) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Vui lòng điền đầy đủ thông tin' }, 400);
    }
    if (!body.items || body.items.length === 0) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Giỏ hàng trống' }, 400);
    }

    // Calculate total
    const total = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const orderResult = await c.env.DB.prepare(`
      INSERT INTO orders (customer_name, email, phone, address, city, total, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.customer_name,
      body.email,
      body.phone,
      body.address,
      body.city,
      total,
      body.note ?? null,
    ).run();

    const orderId = orderResult.meta.last_row_id;

    // Insert order items
    for (const item of body.items) {
      await c.env.DB.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        orderId,
        item.product_id,
        item.product_name,
        item.quantity,
        item.price,
        item.size ?? null,
      ).run();

      // Reduce stock
      await c.env.DB.prepare(
        'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?'
      ).bind(item.quantity, item.product_id).run();
    }

    const newOrder = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first<Order>();

    return c.json<ApiResponse<Order>>({ success: true, data: newOrder! }, 201);
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi tạo đơn hàng' }, 500);
  }
});

// PUT /api/orders/:id/status - Update order status
orders.put('/:id/status', async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json<ApiResponse<null>>({ success: false, error: 'ID không hợp lệ' }, 400);
  }

  try {
    const { status } = await c.req.json<{ status: string }>();
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return c.json<ApiResponse<null>>({ success: false, error: 'Trạng thái không hợp lệ' }, 400);
    }

    await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, id).run();
    const updated = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<Order>();

    return c.json<ApiResponse<Order>>({ success: true, data: updated! });
  } catch (err) {
    return c.json<ApiResponse<null>>({ success: false, error: 'Lỗi cập nhật trạng thái' }, 500);
  }
});

export default orders;
