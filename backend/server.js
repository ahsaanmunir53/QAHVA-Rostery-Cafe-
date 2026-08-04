import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readJson, writeJson, exists } from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 5003);
const RESET_KEY = process.env.RESET_KEY || 'QV-RESET';
const uid = () => crypto.randomUUID();

/* ---------------- auth (scrypt + bearer tokens) ---------------- */
const hashPassword = (pw, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.scryptSync(pw, salt, 64).toString('hex'),
});
const verifyPassword = (pw, rec) =>
  !!rec && crypto.timingSafeEqual(Buffer.from(rec.hash, 'hex'), crypto.scryptSync(pw, rec.salt, 64));

if (!exists('admin')) {
  const { salt, hash } = hashPassword(process.env.ADMIN_PASSWORD || 'Qahva@Admin2026');
  writeJson('admin', { user: process.env.ADMIN_USER || 'admin', salt, hash });
}
const TOKEN_TTL = 7 * 24 * 3600 * 1000;
function issueToken() {
  const tokens = readJson('tokens', []).filter((t) => t.exp > Date.now());
  const token = crypto.randomBytes(24).toString('hex');
  tokens.push({ token, exp: Date.now() + TOKEN_TTL });
  writeJson('tokens', tokens);
  return token;
}
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const ok = readJson('tokens', []).some((t) => t.token === token && t.exp > Date.now());
  if (!ok) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

/* ---------------- seeds ---------------- */
let n = 0;
const P = (category, name, price, description, opts = {}) => ({
  id: `item-${++n}`,
  category, name, price, description,
  featured: !!opts.featured,
  soldOut: !!opts.soldOut,
  tag: opts.tag || '',
  image: '',
});

const DEFAULT_MENU = [
  P('Espresso Bar', 'Espresso', 350, 'A precise double shot — chocolatey, syrupy, never bitter.'),
  P('Espresso Bar', 'Americano', 450, 'Double shot lengthened with hot water. Clean and bright.'),
  P('Espresso Bar', 'Cappuccino', 550, 'Equal parts espresso, steamed milk and silky microfoam.', { tag: 'bestseller' }),
  P('Espresso Bar', 'Flat White', 600, 'Stronger, smaller, smoother — for people who mean it.'),
  P('Espresso Bar', 'Signature Latte', 650, 'Our house latte with slow-steamed milk and latte art on every pour.', { featured: true, tag: 'bestseller' }),
  P('Espresso Bar', 'Dark Mocha', 700, '70% dark chocolate melted into espresso, topped with foam.'),
  P('Slow Brews', 'V60 Pour Over', 750, 'Single-origin of the week, brewed by hand over three minutes.', { featured: true }),
  P('Slow Brews', 'Chemex (for two)', 850, 'A slower, softer cup — floral and tea-like. Made to share.'),
  P('Slow Brews', 'French Press', 650, 'Full-bodied and honest. Four minutes, plunged at your table.'),
  P('Iced & Cold Brew', 'Classic Cold Brew', 700, 'Steeped 18 hours, served over crystal ice. Naturally sweet.', { featured: true, tag: 'new' }),
  P('Iced & Cold Brew', 'Iced Spanish Latte', 800, 'Espresso, condensed milk and cold milk over ice — the summer icon.', { featured: true, tag: 'bestseller' }),
  P('Iced & Cold Brew', 'Gold-Dust Affogato', 750, 'Vanilla gelato drowned in espresso, finished with gold dust.', { tag: 'new' }),
  P('Iced & Cold Brew', 'Iced Caramel Macchiato', 850, 'Layered milk, house caramel and a double shot poured through.'),
  P('Qahva & Chai', 'Traditional Qahva', 350, 'Green tea, cardamom, almonds and saffron — the original.', { tag: 'bestseller' }),
  P('Qahva & Chai', 'Kashmiri Chai', 400, 'Pink, salted, and finished with crushed pistachio.'),
  P('Qahva & Chai', 'Karak Chai', 300, 'Strong doodh patti brewed the dhaba way, minus the traffic.'),
  P('Bakery', 'Butter Croissant', 450, 'Laminated in-house — 27 layers, all of them worth it.'),
  P('Bakery', 'Chocolate Fudge Brownie', 500, 'Dense, dark and slightly under-baked on purpose.', { featured: true }),
  P('Bakery', 'New York Cheesecake', 700, 'Baked slow, chilled overnight, sliced generously.'),
  P('Bakery', 'Almond Biscotti', 300, 'Twice-baked, made for dunking in your americano.', { soldOut: true }),
];

const DEFAULT_TESTIMONIALS = [
  { id: uid(), name: 'Hassan R.', text: 'First place in Lahore where the flat white tastes like the ones I missed from Melbourne. Dialled-in every single time.', stars: 5, approved: true },
  { id: uid(), name: 'Mariam S.', text: 'The Iced Spanish Latte is dangerously good. Ordered online, it was ready before I found parking.', stars: 5, approved: true },
  { id: uid(), name: 'Bilal A.', text: 'Asked the barista about the beans and got a five-minute origin story. This is a coffee shop run by coffee people.', stars: 5, approved: true },
  { id: uid(), name: 'Dr. Sana', text: 'Quiet corners, fast Wi-Fi, and a V60 that actually tastes of something. My new office.', stars: 4, approved: true },
  { id: uid(), name: 'Omar K.', text: 'Cold brew is steeped 18 hours and you can tell. Smooth, no acid, no sugar needed.', stars: 5, approved: true },
  { id: uid(), name: 'Ayesha M.', text: 'The croissants sell out by noon for a reason. Go early.', stars: 5, approved: true },
];

const DEFAULT_GALLERY = [
  { id: uid(), title: 'Morning roast', url: '' },
  { id: uid(), title: 'Latte art', url: '' },
  { id: uid(), title: 'The pour', url: '' },
  { id: uid(), title: 'Cold brew tower', url: '' },
  { id: uid(), title: 'Bakery counter', url: '' },
  { id: uid(), title: 'The bench outside', url: '' },
];

const DEFAULT_SETTINGS = {
  phone: '+92 300 0000000',
  whatsapp: '923000000000',
  email: 'hello@qahva.pk',
  address: 'Demo Roastery, MM Alam Road, Gulberg III, Lahore',
  hours: 'Open daily · 8:00 am – 11:00 pm',
  deliveryFee: 200,
  freeOver: 2500,
  openForOrders: true,
};

if (!exists('menu')) writeJson('menu', DEFAULT_MENU);
if (!exists('testimonials')) writeJson('testimonials', DEFAULT_TESTIMONIALS);
if (!exists('gallery')) writeJson('gallery', DEFAULT_GALLERY);
if (!exists('settings')) writeJson('settings', DEFAULT_SETTINGS);
for (const f of ['orders', 'messages']) if (!exists(f)) writeJson(f, []);

const settings = () => ({ ...DEFAULT_SETTINGS, ...readJson('settings', {}) });
const menu = () => readJson('menu', DEFAULT_MENU);

/* ---------------- public ---------------- */
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'qahva-backend' }));
app.get('/api/menu', (_req, res) => res.json(menu()));
app.get('/api/testimonials', (_req, res) => res.json(readJson('testimonials', []).filter((t) => t.approved)));
app.get('/api/gallery', (_req, res) => res.json(readJson('gallery', [])));
app.get('/api/settings/public', (_req, res) => {
  const s = settings();
  res.json({
    phone: s.phone, whatsapp: s.whatsapp, email: s.email, address: s.address, hours: s.hours,
    deliveryFee: s.deliveryFee, freeOver: s.freeOver, openForOrders: s.openForOrders,
  });
});

app.post('/api/orders', (req, res) => {
  const s = settings();
  if (!s.openForOrders) return res.status(503).json({ error: 'Online ordering is paused right now — please call or WhatsApp us.' });
  const { customer, type, items } = req.body || {};
  if (!['Pickup', 'Delivery'].includes(type)) return res.status(400).json({ error: 'Choose pickup or delivery.' });
  if (!customer?.name?.trim() || !customer?.phone?.trim())
    return res.status(400).json({ error: 'Name and phone are required.' });
  if (type === 'Delivery' && !customer?.address?.trim())
    return res.status(400).json({ error: 'Delivery address is required.' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Your order is empty.' });

  const byId = Object.fromEntries(menu().map((m) => [m.id, m]));
  const lines = [];
  for (const it of items) {
    const m = byId[it.id];
    const qty = Number(it.qty);
    if (!m) return res.status(400).json({ error: 'One of the items is no longer on the menu.' });
    if (m.soldOut) return res.status(400).json({ error: `${m.name} is sold out today.` });
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ error: 'Quantities must be 1–20.' });
    lines.push({ id: m.id, name: m.name, price: m.price, qty, lineTotal: m.price * qty });
  }
  const subtotal = lines.reduce((t, l) => t + l.lineTotal, 0);
  const deliveryFee = type === 'Delivery' ? (subtotal >= s.freeOver ? 0 : s.deliveryFee) : 0;
  const order = {
    id: uid(),
    createdAt: new Date().toISOString(),
    status: 'Pending',
    type,
    customer: {
      name: String(customer.name).trim(),
      phone: String(customer.phone).trim(),
      address: String(customer.address || '').trim(),
      notes: String(customer.notes || '').trim(),
    },
    items: lines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
  const orders = readJson('orders', []);
  orders.unshift(order);
  writeJson('orders', orders);
  res.status(201).json({ ok: true, id: order.id, total: order.total, type });
});

app.post('/api/contact', (req, res) => {
  const { name, phone, message } = req.body || {};
  if (!String(name || '').trim() || !String(message || '').trim())
    return res.status(400).json({ error: 'Name and message are required.' });
  const list = readJson('messages', []);
  list.unshift({ id: uid(), at: new Date().toISOString(), name: String(name).trim(), phone: String(phone || '').trim(), message: String(message).trim() });
  writeJson('messages', list);
  res.json({ ok: true });
});

/* ---------------- admin: auth ---------------- */
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const admin = readJson('admin', null);
  if (!admin || username !== admin.user || !verifyPassword(String(password || ''), admin))
    return res.status(401).json({ error: 'Invalid username or password.' });
  res.json({ ok: true, token: issueToken() });
});
app.post('/api/admin/change-password', auth, (req, res) => {
  const { current, next } = req.body || {};
  const admin = readJson('admin', null);
  if (!verifyPassword(String(current || ''), admin)) return res.status(400).json({ error: 'Current password is incorrect.' });
  if (String(next || '').length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  const { salt, hash } = hashPassword(String(next));
  writeJson('admin', { ...admin, salt, hash });
  writeJson('tokens', []);
  res.json({ ok: true });
});
app.post('/api/admin/forgot-password', (req, res) => {
  const { resetKey, next } = req.body || {};
  if (String(resetKey || '') !== RESET_KEY) return res.status(401).json({ error: 'Invalid reset key.' });
  if (String(next || '').length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  const admin = readJson('admin', null);
  const { salt, hash } = hashPassword(String(next));
  writeJson('admin', { ...admin, salt, hash });
  writeJson('tokens', []);
  res.json({ ok: true });
});

/* ---------------- admin: orders ---------------- */
const STATUSES = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
app.get('/api/admin/orders', auth, (req, res) => {
  let list = readJson('orders', []);
  const { status, q } = req.query;
  if (status) list = list.filter((o) => o.status === status);
  if (q) {
    const s = String(q).toLowerCase();
    list = list.filter((o) => o.customer.name.toLowerCase().includes(s) || o.customer.phone.includes(s) || o.id.startsWith(s));
  }
  res.json(list);
});
app.patch('/api/admin/orders/:id', auth, (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  const list = readJson('orders', []);
  const o = list.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found.' });
  o.status = status;
  writeJson('orders', list);
  res.json({ ok: true, order: o });
});
app.delete('/api/admin/orders/:id', auth, (req, res) => {
  const list = readJson('orders', []);
  const next = list.filter((x) => x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Order not found.' });
  writeJson('orders', next);
  res.json({ ok: true });
});

/* ---------------- admin: menu ---------------- */
function itemBody(b) {
  const name = String(b.name || '').trim();
  const category = String(b.category || '').trim();
  const price = Number(b.price);
  if (!name || !category) return { error: 'Name and category are required.' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Price must be a positive number.' };
  return {
    value: {
      name, category, price,
      description: String(b.description || '').trim(),
      featured: !!b.featured,
      soldOut: !!b.soldOut,
      tag: String(b.tag || '').trim(),
      image: String(b.image || '').trim(),
    },
  };
}
app.post('/api/admin/menu', auth, (req, res) => {
  const r = itemBody(req.body || {});
  if (r.error) return res.status(400).json({ error: r.error });
  const list = readJson('menu', []);
  const item = { id: uid(), ...r.value };
  list.push(item);
  writeJson('menu', list);
  res.status(201).json(item);
});
app.patch('/api/admin/menu/:id', auth, (req, res) => {
  const list = readJson('menu', []);
  const i = list.findIndex((x) => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Item not found.' });
  const r = itemBody({ ...list[i], ...req.body });
  if (r.error) return res.status(400).json({ error: r.error });
  list[i] = { ...list[i], ...r.value };
  writeJson('menu', list);
  res.json(list[i]);
});
app.delete('/api/admin/menu/:id', auth, (req, res) => {
  const list = readJson('menu', []);
  const next = list.filter((x) => x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Item not found.' });
  writeJson('menu', next);
  res.json({ ok: true });
});

/* ---------------- admin: gallery / testimonials / messages ---------------- */
app.post('/api/admin/gallery', auth, (req, res) => {
  const title = String(req.body?.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  const list = readJson('gallery', []);
  const item = { id: uid(), title, url: String(req.body?.url || '').trim() };
  list.unshift(item);
  writeJson('gallery', list);
  res.status(201).json(item);
});
app.delete('/api/admin/gallery/:id', auth, (req, res) => {
  const list = readJson('gallery', []);
  const next = list.filter((x) => x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Not found.' });
  writeJson('gallery', next);
  res.json({ ok: true });
});

app.get('/api/admin/testimonials', auth, (_req, res) => res.json(readJson('testimonials', [])));
app.post('/api/admin/testimonials', auth, (req, res) => {
  const name = String(req.body?.name || '').trim();
  const text = String(req.body?.text || '').trim();
  if (!name || !text) return res.status(400).json({ error: 'Name and text are required.' });
  const list = readJson('testimonials', []);
  const t = { id: uid(), name, text, stars: Math.min(5, Math.max(1, Number(req.body?.stars) || 5)), approved: !!req.body?.approved };
  list.unshift(t);
  writeJson('testimonials', list);
  res.status(201).json(t);
});
app.patch('/api/admin/testimonials/:id', auth, (req, res) => {
  const list = readJson('testimonials', []);
  const t = list.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found.' });
  if (req.body?.approved !== undefined) t.approved = !!req.body.approved;
  writeJson('testimonials', list);
  res.json(t);
});
app.delete('/api/admin/testimonials/:id', auth, (req, res) => {
  const list = readJson('testimonials', []);
  const next = list.filter((x) => x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Not found.' });
  writeJson('testimonials', next);
  res.json({ ok: true });
});

app.get('/api/admin/messages', auth, (_req, res) => res.json(readJson('messages', [])));
app.delete('/api/admin/messages/:id', auth, (req, res) => {
  const list = readJson('messages', []);
  const next = list.filter((x) => x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Not found.' });
  writeJson('messages', next);
  res.json({ ok: true });
});

/* ---------------- admin: settings + stats ---------------- */
app.get('/api/admin/settings', auth, (_req, res) => res.json(settings()));
app.patch('/api/admin/settings', auth, (req, res) => {
  const s = settings();
  const b = req.body || {};
  const next = {
    ...s,
    phone: b.phone !== undefined ? String(b.phone).trim() : s.phone,
    whatsapp: b.whatsapp !== undefined ? String(b.whatsapp).replace(/\D/g, '') : s.whatsapp,
    email: b.email !== undefined ? String(b.email).trim() : s.email,
    address: b.address !== undefined ? String(b.address).trim() : s.address,
    hours: b.hours !== undefined ? String(b.hours).trim() : s.hours,
    deliveryFee: b.deliveryFee !== undefined ? Math.max(0, Number(b.deliveryFee) || 0) : s.deliveryFee,
    freeOver: b.freeOver !== undefined ? Math.max(0, Number(b.freeOver) || 0) : s.freeOver,
    openForOrders: b.openForOrders !== undefined ? !!b.openForOrders : s.openForOrders,
  };
  writeJson('settings', next);
  res.json(next);
});

app.get('/api/admin/stats', auth, (_req, res) => {
  const orders = readJson('orders', []);
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const by = (st) => orders.filter((o) => o.status === st).length;
  res.json({
    total: orders.length,
    pending: by('Pending'),
    preparing: by('Preparing'),
    ready: by('Ready'),
    completed: by('Completed'),
    cancelled: by('Cancelled'),
    today: orders.filter((o) => o.createdAt.slice(0, 10) === today && o.status !== 'Cancelled').length,
    monthRevenue: orders.filter((o) => o.status === 'Completed' && o.createdAt.slice(0, 7) === month).reduce((t, o) => t + o.total, 0),
    messages: readJson('messages', []).length,
    recent: orders.slice(0, 6),
  });
});

// ---------------- serve the built frontend (production) ----------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(buildDir, 'index.html'));
  });
  console.log('   [web] serving frontend build');
}

app.listen(PORT, () => console.log(`QAHVA running on http://localhost:${PORT}`));
