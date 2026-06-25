import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './types';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import ordersRouter from './routes/orders';

const app = new Hono<{ Bindings: Env }>();

// ---- Middleware ----
app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      const allowed = c.env.ALLOW_ORIGIN || '*';
      if (allowed === '*') return origin;

      const allowedOrigins = allowed.split(',').map((o: string) => o.trim());
      if (allowedOrigins.includes(origin)) return origin;

      // Allow localhost/127.0.0.1 dynamically for local development convenience
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return origin;
      }

      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// ---- Health check ----
app.get('/', (c) => {
  return c.json({
    name: 'Fashion Store API',
    version: '1.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ---- Routes ----
app.route('/api/products', productsRouter);
app.route('/api/categories', categoriesRouter);
app.route('/api/orders', ordersRouter);

// ---- 404 Handler ----
app.notFound((c) => {
  return c.json({ success: false, error: `Route ${c.req.path} không tồn tại` }, 404);
});

// ---- Error Handler ----
app.onError((err, c) => {
  console.error('[Error]', err);
  return c.json({ success: false, error: 'Lỗi server nội bộ' }, 500);
});

export default app;
