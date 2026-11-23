import bcrypt from 'bcryptjs';

// cliente REST مباشر إلى Supabase — يجعل صفحات GitHub Pages تعمل بدون سيرفر خارجي
const REST = 'https://vvoybpgxftsouscxplrr.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2b3licGd4ZnRzb3VzY3hwbHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMTQ4MTUsImV4cCI6MjExMDU5MDgxNX0.rSBeWRETFZYwlfZsQftAaoJVWkWxNFBYdsdGn8H64-k';
const BASE_HEADERS: Record<string, string> = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

const NUMERIC = new Set([
  'price',
  'wholesalePrice',
  'deliveryFee',
  'freeDeliveryThreshold',
  'subtotalAmount',
  'totalAmount',
  'unitPrice',
  'subtotal',
]);

function camel(key: string): string {
  return key.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase());
}

function convert(value: unknown, key = ''): unknown {
  if (Array.isArray(value)) return value.map((v) => convert(v));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[camel(k)] = convert(v, k);
    }
    return out;
  }
  if (
    typeof value === 'string' &&
    NUMERIC.has(key) &&
    value.trim() !== '' &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return value;
}

async function rest(
  method: string,
  table: string,
  query: string | Record<string, string> = '',
  body?: unknown,
  prefer?: string
): Promise<any> {
  const qs =
    typeof query === 'string'
      ? query
      : Object.entries(query)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&');
  const url = `${REST}/${table}${qs ? `?${qs}` : ''}`;
  const headers: Record<string, string> = { ...BASE_HEADERS };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(url, {
    method,
    headers: { ...headers, 'Cache-Control': 'no-cache' },
    cache: 'no-store',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).message || text;
    } catch {
      /* keep raw */
    }
    throw new Error(msg || `Supabase error ${res.status}`);
  }
  return text ? convert(JSON.parse(text)) : null;
}

const sel = (params: Record<string, string> = {}) =>
  Object.entries({ select: '*', ...params })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

const eq = (field: string, value: string | number | boolean) => ({
  [field]: `eq.${String(value)}`,
});

function makeToken(u: any): string {
  const payload = {
    id: u.id,
    uid: u.uid,
    email: u.email,
    role: u.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `local.${encoded}.publicdemo`;
}

function readToken(token: string): any | null {
  try {
    if (!token.startsWith('local.')) return null;
    const encoded = token.split('.')[1];
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(
      decodeURIComponent(escape(atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))))
    );
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function authFrom(init?: RequestInit): any | null {
  try {
    const headers = new Headers(init?.headers);
    const header = headers.get('Authorization') || '';
    if (!header.startsWith('Bearer ')) return null;
    return readToken(header.slice(7).trim());
  } catch {
    return null;
  }
}

function getBody(init?: RequestInit): any {
  try {
    return typeof init?.body === 'string' ? JSON.parse(init.body) : {};
  } catch {
    return {};
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function publicUser(u: any) {
  return {
    id: u.id,
    uid: u.uid,
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    storeName: u.storeName ?? '',
    governorate: u.governorate ?? '',
    center: u.center ?? '',
    address: u.address ?? '',
    role: u.role,
    isActive: u.isActive,
  };
}

async function ordersWithItems(list: any[]) {
  const items = await rest('GET', 'order_items', sel({ order: 'id.asc' }));
  const byOrder = new Map<number, any[]>();
  for (const item of items) {
    const arr = byOrder.get(item.orderId) ?? [];
    arr.push(item);
    byOrder.set(item.orderId, arr);
  }
  return list.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] }));
}

async function handle(path: string, method: string, init?: RequestInit): Promise<Response> {
  const body = getBody(init);
  const auth = authFrom(init);

  if (path === '/api/health') return json({ ok: true });

  if (path === '/api/storefront' && method === 'GET') {
    const [settings, offers, sliders, categories, products] = await Promise.all([
      rest('GET', 'store_settings', sel({ ...eq('id', 1), limit: '1' })),
      rest('GET', 'top_offers', sel({ ...eq('is_active', true), order: 'id.desc' })),
      rest('GET', 'slider_images', sel({ ...eq('is_active', true), order: 'sort_order.asc,id.desc' })),
      rest('GET', 'categories', sel({ order: 'sort_order.asc,id.asc' })),
      rest('GET', 'products', sel({ order: 'id.desc' })),
    ]);
    return json({
      settings: settings?.[0] ?? null,
      offers,
      sliders,
      categories,
      products,
    });
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const rawIdentifier = String(body.identifier || body.email || '').trim();
    const identifier = rawIdentifier.toLowerCase();
    const digits = rawIdentifier.replace(/[\s\-+()]/g, '');
    const password = String(body.password || '');
    if (!identifier || !password) return json({ error: 'يرجى إدخال رقم الهاتف (أو البريد الإلكتروني) وكلمة المرور.' }, 400);
    // البحث بالهاتف أولاً (حسابات التسجيل الجديدة بلا بريد حقيقي)، ثم بالبريد للمديرين
    let rows = digits.length >= 8
      ? await rest('GET', 'users', sel({ ...eq('phone', digits), limit: '1' }))
      : [];
    if (!rows.length) rows = await rest('GET', 'users', sel({ ...eq('email', identifier), limit: '1' }));
    if (!rows.length && digits === '01098765432') {
      rows = await rest('GET', 'users', sel({ ...eq('phone', '01098765432'), limit: '1' }));
    }
    const user = rows[0];
    if (!user || !user.passwordHash) return json({ error: 'بيانات الدخول غير صحيحة.' }, 401);
    if (user.isActive === false) return json({ error: 'تم إيقاف هذا الحساب من الإدارة.' }, 403);
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return json({ error: 'بيانات الدخول غير صحيحة.' }, 401);
    }
    return json({ token: makeToken(user), user: publicUser(user) });
  }

  if (path === '/api/auth/register' && method === 'POST') {
    const password = String(body.password || '');
    const name = String(body.name || '').trim();
    const storeName = String(body.storeName || '').trim();
    const phone = String(body.phone || '').replace(/[\s\-+()]/g, '');
    const governorate = String(body.governorate || '').trim();
    const center = String(body.center || '').trim();
    const address = String(body.address || '').trim();
    if (name.length < 2 || !storeName || password.length < 6) {
      return json({ error: 'يرجى إدخال إسم العميل واسم المحل وكلمة مرور لا تقل عن 6 أحرف.' }, 400);
    }
    if (!/^\d{11}$/.test(phone)) {
      return json({ error: 'يجب أن يكون رقم الهاتف 11 رقماً بالضبط.' }, 400);
    }
    if (!governorate || !center || !address) {
      return json({ error: 'يرجى إدخال المحافظة والمركز وعنوان المحل.' }, 400);
    }
    // عمود email في قاعدة البيانات إلزامي/fريد، لذا نولّد قيمة داخلية من رقم الهاتف
    const email = `${phone}@alhamd.local`;
    const existing = await rest('GET', 'users', sel({ ...eq('email', email), limit: '1' }));
    if (existing.length) return json({ error: 'هذا الرقم مسجل بالفعل. يرجى تسجيل الدخول.' }, 409);
    const created = await rest(
      'POST',
      'users',
      '',
      [{
        uid: `usr-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        name,
        email,
        phone,
        store_name: storeName,
        governorate,
        center,
        address,
        password_hash: await bcrypt.hash(password, 10),
        role: 'customer',
        is_active: true,
      }],
      'return=representation'
    );
    const user = convert(created[0]);
    return json({ token: makeToken(user), user: publicUser(user) }, 201);
  }

  if (path === '/api/auth/me' && method === 'GET') {
    if (!auth) return json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.' }, 401);
    const rows = await rest('GET', 'users', sel({ ...eq('id', auth.id), limit: '1' }));
    const user = rows[0];
    if (!user || user.isActive === false) return json({ error: 'جلسة غير صالحة.' }, 401);
    return json({ user: publicUser(user) });
  }

  if (path === '/api/orders' && method === 'POST') {
    const products = await rest('GET', 'products', sel());
    const settingsRows = await rest('GET', 'store_settings', sel({ ...eq('id', 1), limit: '1' }));
    const settings = settingsRows[0] ?? {};
    const feeConfig = Number(settings.deliveryFee ?? 35);
    const threshold = Number(settings.freeDeliveryThreshold ?? 600);
    const map = new Map<number, any>(products.map((p: any) => [p.id, p]));
    let subtotal = 0;
    const prepared: any[] = [];
    for (const item of Array.isArray(body.items) ? body.items : []) {
      const p = map.get(Number(item.productId));
      if (!p) continue;
      const purchaseType = item.purchaseType === 'carton' ? 'carton' : 'piece';
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const retail = Number(p.price);
      const cartonPrice = p.wholesalePrice ? Number(p.wholesalePrice) : 0;
      const perCarton = Math.max(1, Number(p.minWholesaleQty) || 12);
      // السعر حسب اختيار المشتري صراحةً: كرتونة بسعر الكرتونة، أو قطعة بسعر القطعة
      const unitPrice = purchaseType === 'carton' && cartonPrice > 0 ? cartonPrice : retail;
      const line = Math.round(unitPrice * qty * 100) / 100;
      subtotal += line;
      prepared.push({
        productId: p.id,
        productName: p.name,
        quantity: qty,
        unitPrice,
        subtotal: line,
        purchaseType,
        availability: 'متوفر',
        bottles: purchaseType === 'carton' ? qty * perCarton : qty,
      });
    }
    if (!prepared.length) return json({ error: 'لم يتم العثور على منتجات صالحة في الطلب.' }, 400);
    subtotal = Math.round(subtotal * 100) / 100;
    // الحد الأدنى للفاتورة: لا يُنشأ طلب أقل من 1000 جنيه
    if (subtotal < 1000) {
      return json({ error: `الحد الأدنى للفاتورة 1000 ج.م. أضف منتجات بقيمة ${(1000 - subtotal).toFixed(2)} ج.م لإتمام الطلب.` }, 400);
    }
    const deliveryFee = subtotal >= threshold ? 0 : feeConfig;
    const totalAmount = Math.round((subtotal + deliveryFee) * 100) / 100;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const created = await rest(
      'POST',
      'orders',
      '',
      [{
        order_number: orderNumber,
        user_id: auth?.id ?? null,
        customer_name: String(body.customerName || '').trim(),
        customer_phone: String(body.customerPhone || '').trim(),
        customer_address: String(body.customerAddress || '').trim(),
        payment_method: 'cash_on_delivery',
        status: 'pending',
        subtotal_amount: subtotal.toFixed(2),
        delivery_fee: deliveryFee.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        notes: String(body.notes || '').trim(),
      }],
      'return=representation'
    );
    const order = convert(created[0]);
    await rest(
      'POST',
      'order_items',
      '',
      prepared.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        product_name: it.productName,
        quantity: it.quantity,
        unit_price: it.unitPrice.toFixed(2),
        subtotal: it.subtotal.toFixed(2),
        purchase_type: it.purchaseType,
        availability: 'متوفر',
      })),
      'return=representation'
    );
    return json({ ...order, items: prepared }, 201);
  }

  if (path === '/api/my-orders' && method === 'GET') {
    if (!auth) return json({ error: 'يرجى تسجيل الدخول للمتابعة.' }, 401);
    const list = await rest('GET', 'orders', sel({ ...eq('user_id', auth.id), order: 'id.desc' }));
    return json(await ordersWithItems(list));
  }

  if (path === '/api/support' && method === 'POST') {
    const created = await rest(
      'POST',
      'support_messages',
      '',
      [{
        name: String(body.name || ''),
        phone: String(body.phone || ''),
        message: String(body.message || ''),
        status: 'new',
        admin_reply: '',
      }],
      'return=representation'
    );
    return json(convert(created[0]), 201);
  }

  const chatMatch = path.match(/^\/api\/chat\/([^/]+)$/);
  if (chatMatch && method === 'GET') {
    const list = await rest('GET', 'chat_messages', sel({ ...eq('session_id', decodeURIComponent(chatMatch[1])), order: 'id.asc' }));
    return json(list);
  }
  if (path === '/api/chat' && method === 'POST') {
    const created = await rest(
      'POST',
      'chat_messages',
      '',
      [{
        session_id: String(body.sessionId || ''),
        user_id: auth?.id ?? null,
        sender_name: String(body.senderName || 'زائر المتجر'),
        sender_role: 'customer',
        message: String(body.message || ''),
        is_read: false,
      }],
      'return=representation'
    );
    return json(convert(created[0]), 201);
  }

  // ===== ADMIN =====
  if (path.startsWith('/api/admin/')) {
    if (!auth || (auth.role !== 'admin' && auth.role !== 'manager')) {
      return json({ error: 'صلاحيات الإدارة مطلوبة للوصول إلى هذا القسم.' }, 403);
    }

    if (path === '/api/admin/overview' && method === 'GET') {
      const [orders, products, users, support, chats] = await Promise.all([
        rest('GET', 'orders', sel()),
        rest('GET', 'products', sel()),
        rest('GET', 'users', sel()),
        rest('GET', 'support_messages', sel()),
        rest('GET', 'chat_messages', sel()),
      ]);
      const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.totalAmount || 0), 0);
      const unread = chats.filter((c: any) => c.senderRole === 'customer' && !c.isRead).length;
      return json({
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        totalProducts: products.length,
        totalUsers: users.length,
        unreadSupport: support.filter((s: any) => s.status === 'new').length,
        unreadChats: unread,
        recentOrders: [...orders].reverse().slice(0, 8),
      });
    }

    if (path === '/api/admin/products' && method === 'GET') {
      return json(await rest('GET', 'products', sel({ order: 'id.desc' })));
    }
    if (path === '/api/admin/products' && method === 'POST') {
      const created = await rest('POST', 'products', '', [{
        name: String(body.name || '').trim(),
        description: String(body.description || '').trim(),
        price: String(Number(body.price) || 0),
        wholesale_price: body.wholesalePrice ? String(Number(body.wholesalePrice)) : null,
        min_wholesale_qty: Math.max(1, Number(body.minWholesaleQty) || 6),
        discount_value: String(body.discountValue || ''),
        image_url: String(body.imageUrl || ''),
        category_id: body.categoryId ? Number(body.categoryId) : null,
        category_name: String(body.categoryName || (body.isJuiceSection ? 'عصائر و مشروبات' : 'عام')),
        is_juice_section: Boolean(body.isJuiceSection),
        is_featured: true,
        stock: Math.max(0, Number(body.stock) || 50),
        unit: String(body.unit || 'قطعة'),
      }], 'return=representation');
      return json(convert(created[0]), 201);
    }
    let m = path.match(/^\/api\/admin\/products\/(\d+)$/);
    if (m && method === 'PUT') {
      const updated = await rest('PATCH', 'products', eq('id', Number(m[1])), {
        name: String(body.name || '').trim(),
        description: String(body.description || '').trim(),
        price: String(Number(body.price) || 0),
        wholesale_price: body.wholesalePrice ? String(Number(body.wholesalePrice)) : null,
        min_wholesale_qty: Math.max(1, Number(body.minWholesaleQty) || 6),
        discount_value: String(body.discountValue || ''),
        image_url: String(body.imageUrl || ''),
        category_id: body.categoryId ? Number(body.categoryId) : null,
        category_name: String(body.categoryName || 'عام'),
        is_juice_section: Boolean(body.isJuiceSection),
        stock: Math.max(0, Number(body.stock) || 0),
        unit: String(body.unit || 'قطعة'),
      }, 'return=representation');
      return json(convert(updated[0]));
    }
    if (m && method === 'DELETE') {
      await rest('DELETE', 'products', eq('id', Number(m[1])));
      return json({ ok: true });
    }

    if (path === '/api/admin/categories' && method === 'POST') {
      const created = await rest('POST', 'categories', '', [{
        name: String(body.name || '').trim(),
        slug: `cat-${Date.now()}`,
        description: String(body.description || ''),
        image_url: String(body.imageUrl || ''),
        sort_order: 10,
      }], 'return=representation');
      return json(convert(created[0]), 201);
    }
    m = path.match(/^\/api\/admin\/categories\/(\d+)$/);
    if (m && (method === 'PATCH' || method === 'PUT')) {
      const patch: Record<string, unknown> = {};
      if (body.name !== undefined) patch.name = String(body.name);
      if (body.description !== undefined) patch.description = String(body.description);
      if (body.imageUrl !== undefined) patch.image_url = String(body.imageUrl);
      const updated = await rest('PATCH', 'categories', eq('id', Number(m[1])), patch, 'return=representation');
      return json(convert(updated[0]));
    }
    if (m && method === 'DELETE') {
      await rest('DELETE', 'categories', eq('id', Number(m[1])));
      return json({ ok: true });
    }

    if (path === '/api/admin/orders' && method === 'GET') {
      return json(await ordersWithItems(await rest('GET', 'orders', sel({ order: 'id.desc' }))));
    }
    m = path.match(/^\/api\/admin\/orders\/(\d+)\/status$/);
    if (m && method === 'PATCH') {
      const updated = await rest('PATCH', 'orders', eq('id', Number(m[1])), { status: String(body.status) }, 'return=representation');
      return json(convert(updated[0]));
    }
    m = path.match(/^\/api\/admin\/order-items\/(\d+)\/availability$/);
    if (m && method === 'PATCH') {
      const availability = body.availability === 'غير متوفر' ? 'غير متوفر' : 'متوفر';
      const updated = await rest('PATCH', 'order_items', eq('id', Number(m[1])), { availability }, 'return=representation');
      return json(convert(updated[0]));
    }

    if (path === '/api/admin/users' && method === 'GET') {
      const rows = await rest('GET', 'users', sel({ order: 'id.desc' }));
      return json(rows.map((u: any) => publicUser(u)));
    }
    m = path.match(/^\/api\/admin\/users\/(\d+)\/toggle$/);
    if (m && method === 'PATCH') {
      const rows = await rest('GET', 'users', sel({ ...eq('id', Number(m[1])), limit: '1' }));
      const target = rows[0];
      if (!target) return json({ error: 'المستخدم غير موجود.' }, 404);
      if (target.email === 'amn2asayed@gmail.com' || target.id === auth.id) {
        return json({ error: 'لا يمكن تعطيل حسابك الحالي أو المالك الأساسي.' }, 400);
      }
      const updated = await rest('PATCH', 'users', eq('id', target.id), { is_active: !target.isActive }, 'return=representation');
      return json(publicUser(convert(updated[0])));
    }

    if (path === '/api/admin/admins' && method === 'GET') {
      const rows = await rest('GET', 'users', sel({ order: 'id.desc' }));
      return json(rows.filter((u: any) => u.role === 'admin' || u.role === 'manager').map((u: any) => publicUser(u)));
    }
    if (path === '/api/admin/admins' && method === 'POST') {
      const email = String(body.email || '').toLowerCase().trim();
      const role = body.role === 'admin' ? 'admin' : 'manager';
      if (!email.includes('@')) return json({ error: 'يرجى إدخال بريد إلكتروني صحيح.' }, 400);
      const existing = await rest('GET', 'users', sel({ ...eq('email', email), limit: '1' }));
      if (existing.length) {
        const updated = await rest('PATCH', 'users', eq('id', existing[0].id), { role, is_active: true, name: String(body.name || existing[0].name) }, 'return=representation');
        return json(publicUser(convert(updated[0])));
      }
      if (String(body.name || '').trim().length < 2 || String(body.password || '').length < 6) {
        return json({ error: 'لإنشاء مدير جديد، يرجى إدخال الاسم وكلمة المرور (6 أحرف على الأقل).' }, 400);
      }
      const created = await rest('POST', 'users', '', [{
        uid: `mgr-${Date.now()}`,
        name: String(body.name).trim(),
        email,
        phone: String(body.phone || ''),
        password_hash: await bcrypt.hash(String(body.password), 10),
        role,
        is_active: true,
      }], 'return=representation');
      return json(publicUser(convert(created[0])), 201);
    }
    m = path.match(/^\/api\/admin\/admins\/(\d+)\/demote$/);
    if (m && method === 'PATCH') {
      const rows = await rest('GET', 'users', sel({ ...eq('id', Number(m[1])), limit: '1' }));
      const target = rows[0];
      if (!target) return json({ error: 'غير موجود.' }, 404);
      if (target.email === 'amn2asayed@gmail.com' || target.email === 'admin@alhamd.store' || target.id === auth.id) {
        return json({ error: 'لا يمكن إزالة صلاحيات المدير الأساسي.' }, 400);
      }
      const updated = await rest('PATCH', 'users', eq('id', target.id), { role: 'customer' }, 'return=representation');
      return json(publicUser(convert(updated[0])));
    }

    if (path === '/api/admin/support' && method === 'GET') {
      return json(await rest('GET', 'support_messages', sel({ order: 'id.desc' })));
    }
    m = path.match(/^\/api\/admin\/support\/(\d+)$/);
    if (m && method === 'PATCH') {
      const patch: Record<string, unknown> = {};
      if (body.status !== undefined) patch.status = String(body.status);
      if (body.adminReply !== undefined) patch.admin_reply = String(body.adminReply);
      const updated = await rest('PATCH', 'support_messages', eq('id', Number(m[1])), patch, 'return=representation');
      return json(convert(updated[0]));
    }

    if (path === '/api/admin/chats' && method === 'GET') {
      const rows = await rest('GET', 'chat_messages', sel({ order: 'id.asc' }));
      const sessions = new Map<string, any>();
      for (const msg of rows) {
        const s = sessions.get(msg.sessionId) ?? {
          sessionId: msg.sessionId,
          customerName: 'زائر المتجر',
          lastMessage: msg.message,
          lastTime: msg.createdAt,
          unreadCount: 0,
          messages: [] as any[],
        };
        if (msg.senderRole === 'customer') s.customerName = msg.senderName;
        s.lastMessage = msg.message;
        s.lastTime = msg.createdAt;
        if (msg.senderRole === 'customer' && !msg.isRead) s.unreadCount += 1;
        s.messages.push(msg);
        sessions.set(msg.sessionId, s);
      }
      return json([...sessions.values()].sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()));
    }
    m = path.match(/^\/api\/admin\/chats\/([^/]+)\/reply$/);
    if (m && method === 'POST') {
      const sessionId = decodeURIComponent(m[1]);
      await rest('PATCH', 'chat_messages', eq('session_id', sessionId), { is_read: true });
      const created = await rest('POST', 'chat_messages', '', [{
        session_id: sessionId,
        user_id: auth.id,
        sender_name: 'إدارة المتجر',
        sender_role: 'admin',
        message: String(body.message || ''),
        is_read: true,
      }], 'return=representation');
      return json(convert(created[0]), 201);
    }

    if (path === '/api/admin/sliders' && method === 'GET') {
      return json(await rest('GET', 'slider_images', sel({ order: 'sort_order.asc,id.desc' })));
    }
    if (path === '/api/admin/sliders' && method === 'POST') {
      const created = await rest('POST', 'slider_images', '', [{
        title: String(body.title || '').trim(),
        subtitle: String(body.subtitle || ''),
        image_url: String(body.imageUrl || ''),
        link_section: String(body.linkSection || 'latest'),
        sort_order: Number(body.sortOrder) || 0,
        is_active: true,
      }], 'return=representation');
      return json(convert(created[0]), 201);
    }
    m = path.match(/^\/api\/admin\/sliders\/(\d+)$/);
    if (m && method === 'PATCH') {
      const updated = await rest('PATCH', 'slider_images', eq('id', Number(m[1])), { is_active: Boolean(body.isActive) }, 'return=representation');
      return json(convert(updated[0]));
    }
    if (m && method === 'DELETE') {
      await rest('DELETE', 'slider_images', eq('id', Number(m[1])));
      return json({ ok: true });
    }

    if (path === '/api/admin/offers' && method === 'GET') {
      return json(await rest('GET', 'top_offers', sel({ order: 'id.desc' })));
    }
    if (path === '/api/admin/offers' && method === 'POST') {
      const created = await rest('POST', 'top_offers', '', [{
        text: String(body.text || '').trim(),
        badge_text: String(body.badgeText || 'عرض خاص'),
        is_active: true,
      }], 'return=representation');
      return json(convert(created[0]), 201);
    }
    m = path.match(/^\/api\/admin\/offers\/(\d+)$/);
    if (m && method === 'PATCH') {
      const updated = await rest('PATCH', 'top_offers', eq('id', Number(m[1])), { is_active: Boolean(body.isActive) }, 'return=representation');
      return json(convert(updated[0]));
    }
    if (m && method === 'DELETE') {
      await rest('DELETE', 'top_offers', eq('id', Number(m[1])));
      return json({ ok: true });
    }

    if (path === '/api/admin/settings' && method === 'PUT') {
      const map: Record<string, string> = {
        storeName: 'store_name', storeDescription: 'store_description', phone: 'phone',
        whatsapp: 'whatsapp', email: 'email', address: 'address', currency: 'currency',
        deliveryFee: 'delivery_fee', freeDeliveryThreshold: 'free_delivery_threshold',
        facebookUrl: 'facebook_url', instagramUrl: 'instagram_url', tiktokUrl: 'tiktok_url',
        twitterUrl: 'twitter_url', youtubeUrl: 'youtube_url', whatsappUrl: 'whatsapp_url',
        logoUrl: 'logo_url',
      };
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const [key, col] of Object.entries(map)) {
        if (body[key] !== undefined) patch[col] = String(body[key]);
      }
      const updated = await rest('PATCH', 'store_settings', eq('id', 1), patch, 'return=representation');
      return json(convert(updated[0]));
    }
  }

  return json({ error: `Unknown endpoint: ${method} ${path}` }, 404);
}

const nativeFetch = window.fetch.bind(window);
window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const url = new URL(input, window.location.origin);
    return handle(url.pathname, (init?.method || 'GET').toUpperCase(), init).catch((error: unknown) => {
      return json(
        { error: error instanceof Error ? error.message : 'تعذر الاتصال بقاعدة البيانات.' },
        500
      );
    });
  }
  return nativeFetch(input as RequestInfo, init);
}) as typeof window.fetch;
