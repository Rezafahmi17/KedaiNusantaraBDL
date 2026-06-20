import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'server-db.json');
const DIST_DIR = path.join(__dirname, 'dist');

const defaultDB = { orders: [] };
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
    return { ...defaultDB, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}') };
  } catch {
    return { ...defaultDB };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
  });
}

function normalizeOrder(orderData) {
  const timestamp = Date.now();
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  return {
    id: orderData.id || `KN-ORD-${timestamp}-${Math.floor(Math.random() * 1000)}`,
    shortId: orderData.shortId || `KN-${String(timestamp).slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
    meja: orderData.meja || '-',
    nama: orderData.nama || 'Pelanggan Anonim',
    items: items.map(item => ({ ...item, price: Number(item.price) || 0, quantity: Number(item.quantity) || 1 })),
    total: items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0),
    status: orderData.status || 'Masuk',
    tanggal: orderData.tanggal || new Date().toISOString(),
    pembayaran: orderData.pembayaran || 'Pending'
  };
}

function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  let filePath = path.join(DIST_DIR, requestPath === '/' ? 'index.html' : requestPath);
  if (!filePath.startsWith(DIST_DIR)) filePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(DIST_DIR, 'index.html');
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJSON(res, 200, { ok: true });

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/health') return sendJSON(res, 200, { ok: true, message: 'Kedai Coffee API aktif' });

  if (url.pathname === '/api/orders' && req.method === 'GET') {
    return sendJSON(res, 200, readDB().orders || []);
  }

  if (url.pathname === '/api/orders' && req.method === 'POST') {
    const db = readDB();
    const order = normalizeOrder(await readBody(req));
    db.orders = [order, ...(db.orders || [])];
    writeDB(db);
    return sendJSON(res, 201, order);
  }

  const match = url.pathname.match(/^\/api\/orders\/(.+)$/);
  if (match && req.method === 'PATCH') {
    const db = readDB();
    const body = await readBody(req);
    const id = decodeURIComponent(match[1]);
    const index = (db.orders || []).findIndex(order => order.id === id);
    if (index === -1) return sendJSON(res, 404, { message: 'Pesanan tidak ditemukan' });
    db.orders[index] = { ...db.orders[index], status: body.status || db.orders[index].status, pembayaran: body.pembayaran || db.orders[index].pembayaran };
    writeDB(db);
    return sendJSON(res, 200, db.orders[index]);
  }

  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('=================================================');
  console.log(`Kedai Coffee berjalan di http://localhost:${PORT}`);
  console.log('Untuk HP: sambungkan ke WiFi yang sama, lalu buka alamat IP laptop:3001');
  console.log('Contoh: http://192.168.1.5:3001');
  console.log('=================================================');
});
