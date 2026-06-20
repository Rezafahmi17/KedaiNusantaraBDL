import { menuData } from '../data/menuData';

// Helper to parse price string like "Rp 25.000" to number 25000
const parsePriceToNumber = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
};

// Initialize Database if not already present
export const initDB = () => {
  // 1. Initialize Menu
  if (!localStorage.getItem('kn_menu')) {
    const initializedMenu = menuData.map((item, index) => ({
      ...item,
      price: parsePriceToNumber(item.price),
      available: true,
      recommended: index < 3,
    }));
    localStorage.setItem('kn_menu', JSON.stringify(initializedMenu));
  }

  // 2. Initialize Orders (Empty array if not exists)
  if (!localStorage.getItem('kn_orders')) {
    localStorage.setItem('kn_orders', JSON.stringify([]));
  }

  // 3. Initialize Expenses (Empty array if not exists)
  if (!localStorage.getItem('kn_expenses')) {
    localStorage.setItem('kn_expenses', JSON.stringify([]));
  }
};

// --- MENU CRUD OPERATIONS ---

export const getMenu = () => {
  initDB();
  try {
    const menu = JSON.parse(localStorage.getItem('kn_menu')) || [];
    return menu.map((item, index) => ({
      ...item,
      available: item.available !== undefined ? item.available : true,
      recommended: item.recommended !== undefined ? item.recommended : index < 3,
    }));
  } catch (e) {
    console.error('Error parsing kn_menu from localStorage', e);
    return [];
  }
};

export const saveMenu = (menu) => {
  localStorage.setItem('kn_menu', JSON.stringify(menu));
};

export const addMenuItem = (item) => {
  const menu = getMenu();
  const newId = menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1;
  const newItem = {
    ...item,
    id: newId,
    price: Number(item.price) || 0,
    available: item.available !== undefined ? item.available : true,
    recommended: item.recommended !== undefined ? item.recommended : false,
  };
  menu.push(newItem);
  saveMenu(menu);
  return newItem;
};

export const updateMenuItem = (id, updatedFields) => {
  const menu = getMenu();
  const index = menu.findIndex(m => m.id === Number(id));
  if (index !== -1) {
    menu[index] = {
      ...menu[index],
      ...updatedFields,
      price: updatedFields.price !== undefined ? Number(updatedFields.price) : menu[index].price,
    };
    saveMenu(menu);
    return menu[index];
  }
  return null;
};

export const deleteMenuItem = (id) => {
  const menu = getMenu();
  const filtered = menu.filter(m => m.id !== Number(id));
  saveMenu(filtered);
  return true;
};

// --- ORDERS OPERATIONS ---

export const getOrders = () => {
  initDB();
  try {
    return JSON.parse(localStorage.getItem('kn_orders')) || [];
  } catch (e) {
    console.error('Error parsing kn_orders from localStorage', e);
    return [];
  }
};

export const saveOrders = (orders) => {
  localStorage.setItem('kn_orders', JSON.stringify(orders));
};

export const createOrder = (orderData) => {
  const orders = getOrders();
  const timestamp = Date.now();
  const shortId = `KN-${String(timestamp).slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
  
  const newOrder = {
    id: `KN-ORD-${timestamp}`,
    shortId,
    meja: orderData.meja,
    nama: orderData.nama || 'Pelanggan Anonim',
    items: orderData.items.map(item => ({
      ...item,
      price: Number(item.price),
    })),
    total: orderData.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
    status: 'Masuk',
    tanggal: new Date().toISOString(),
    pembayaran: 'Pending',
  };
  
  orders.unshift(newOrder); // Add to beginning of array
  saveOrders(orders);
  return newOrder;
};

export const updateOrderStatus = (orderId, status, pembayaran) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      status: status || orders[index].status,
      pembayaran: pembayaran || orders[index].pembayaran,
    };
    saveOrders(orders);
    return orders[index];
  }
  return null;
};

// --- EXPENSES CRUD OPERATIONS ---

export const getExpenses = () => {
  initDB();
  try {
    return JSON.parse(localStorage.getItem('kn_expenses')) || [];
  } catch (e) {
    console.error('Error parsing kn_expenses from localStorage', e);
    return [];
  }
};

export const saveExpenses = (expenses) => {
  localStorage.setItem('kn_expenses', JSON.stringify(expenses));
};

export const addExpense = (expenseData) => {
  const expenses = getExpenses();
  const newExpense = {
    id: `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tanggal: expenseData.tanggal || new Date().toISOString().split('T')[0],
    kategori: expenseData.kategori || 'Lainnya',
    deskripsi: expenseData.deskripsi || 'Pengeluaran Tanpa Keterangan',
    jumlah: Number(expenseData.jumlah) || 0,
  };
  expenses.unshift(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

export const deleteExpense = (id) => {
  const expenses = getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  saveExpenses(filtered);
  return true;
};

// --- SERVER SYNC OPERATIONS ---
// Dipakai agar pesanan dari HP pelanggan masuk ke dashboard admin.
// Jika server/API belum dijalankan, aplikasi tetap memakai localStorage sebagai cadangan.
const getApiBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  const { protocol, hostname, port } = window.location;

  // Saat berjalan lokal melalui Vite, API ada di server.js port 3001.
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (port && port !== '3001') return `${protocol}//${hostname}:3001`;
  }

  return window.location.origin;
};

const getRequestPath = (path) => {
  const { hostname } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // Di Netlify, Express server.js tidak berjalan.
  // Karena itu semua request pesanan diarahkan ke Netlify Functions + Netlify Blobs
  // supaya pesanan dari HP pelanggan tersimpan di server dan terbaca oleh admin di perangkat lain.
  if (!isLocalhost && path.startsWith('/api/orders')) {
    const orderId = path.replace('/api/orders/', '');
    if (orderId && orderId !== path) {
      return `/.netlify/functions/orders?id=${encodeURIComponent(orderId)}`;
    }
    return '/.netlify/functions/orders';
  }

  return path;
};

const requestJSON = async (path, options = {}) => {
  const response = await fetch(`${getApiBaseUrl()}${getRequestPath(path)}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
};

export const getOrdersSync = async () => {
  try {
    const remoteOrders = await requestJSON('/api/orders');
    if (Array.isArray(remoteOrders)) {
      saveOrders(remoteOrders);
      return remoteOrders;
    }
  } catch (error) {
    // Fallback untuk mode static/Vite biasa.
  }

  return getOrders();
};

export const createOrderSync = async (orderData) => {
  try {
    const remoteOrder = await requestJSON('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    const orders = getOrders();
    if (!orders.some((order) => order.id === remoteOrder.id)) {
      saveOrders([remoteOrder, ...orders]);
    }
    return remoteOrder;
  } catch (error) {
    return createOrder(orderData);
  }
};

export const updateOrderStatusSync = async (orderId, status, pembayaran) => {
  try {
    const updatedOrder = await requestJSON(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, pembayaran }),
    });

    const orders = getOrders();
    const index = orders.findIndex((order) => order.id === orderId);
    if (index !== -1) {
      orders[index] = updatedOrder;
      saveOrders(orders);
    }
    return updatedOrder;
  } catch (error) {
    return updateOrderStatus(orderId, status, pembayaran);
  }
};
