import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import type { Category, OrderRecord } from '../../types/store';
import {
  formatCurrency,
  getOrderStatusLabel,
  type StoreProduct,
} from '../../utils/storeLogic';
import { ImageWithFallback } from '../ImageWithFallback';

const PRESET_IMAGES = [
  {
    label: 'زيت زيتون',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_olive_oil_1794832545531.jpg`,
  },
  {
    label: 'أرز بسمتي',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_basmati_rice_1794832544609.jpg`,
  },
  {
    label: 'عسل طبيعي',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_clover_honey_1794832548060.jpg`,
  },
  {
    label: 'قهوة عربية',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_arabic_coffee_1794832776305.jpg`,
  },
  {
    label: 'بهارات',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_mixed_spices_1794832776606.jpg`,
  },
  {
    label: 'عصير مانجو',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_mango_juice_1794832544692.jpg`,
  },
  {
    label: 'عصير رمان',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_pomegranate_juice_1794832545108.jpg`,
  },
  {
    label: 'عصير جوافة',
    url: `${import.meta.env.BASE_URL}src/assets/images/product_guava_juice_1794832777616.jpg`,
  },
];

interface ProductsAdminProps {
  token: string;
  products: StoreProduct[];
  categories: Category[];
  currency: string;
  onRefresh: () => Promise<void>;
  onToast: (msg: string) => void;
}

export function AdminProductsPanel({
  token,
  products,
  categories,
  currency,
  onRefresh,
  onToast,
}: ProductsAdminProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minWholesaleQty, setMinWholesaleQty] = useState('12');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState(
    categories[0]?.name || 'زيوت و سمن'
  );
  const [unit, setUnit] = useState('قطعة');
  const [stock, setStock] = useState('50');
  const [isJuiceSection, setIsJuiceSection] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newCatName, setNewCatName] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setWholesalePrice('');
    setMinWholesaleQty('12');
    setImageUrl(PRESET_IMAGES[0].url);
    setDescription('');
    setUnit('قطعة');
    setStock('50');
    setIsJuiceSection(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const catObj = categories.find((c) => c.name === categoryName);
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
          minWholesaleQty: Number(minWholesaleQty) || 6,
          imageUrl,
          description,
          categoryId: catObj?.id ?? null,
          categoryName,
          unit,
          stock: Number(stock) || 50,
          isJuiceSection,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ المنتج.');
      onToast(editingId ? 'تم تحديث المنتج بنجاح' : 'تمت إضافة المنتج للمتجر');
      resetForm();
      await onRefresh();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'حدث خطأ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p: StoreProduct) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setWholesalePrice(p.wholesalePrice ? String(p.wholesalePrice) : '');
    setMinWholesaleQty(String(p.minWholesaleQty || 6));
    setImageUrl(p.imageUrl);
    setDescription(p.description);
    setCategoryName(p.categoryName);
    setUnit(p.unit);
    setStock(String(p.stock));
    setIsJuiceSection(p.isJuiceSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      onToast('تم حذف المنتج');
      await onRefresh();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    if (res.ok) {
      setNewCatName('');
      onToast('تمت إضافة القسم');
      await onRefresh();
    }
  };

  const cartonCount = Math.max(1, Number(minWholesaleQty) || 12);
  const cartonPriceValue = Number(wholesalePrice) || 0;
  const perBottleInCarton = cartonPriceValue > 0 ? cartonPriceValue / cartonCount : null;

  return (
    <div className="space-y-6">
      {/* Add/Edit Product Form */}
      <form
        onSubmit={handleSaveProduct}
        className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
            {editingId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="prod-name"
              className="block text-xs font-bold text-stone-700 mb-1"
            >
              اسم المنتج
            </label>
            <input
              id="prod-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: زيت زيتون بكر 1 لتر"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label
              htmlFor="prod-price"
              className="block text-xs font-bold text-stone-700 mb-1"
            >
              سعر البيع (الزجاجة / القطعة - {currency})
            </label>
            <input
              id="prod-price"
              type="number"
              step="0.01"
              min="1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="38"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label
              htmlFor="prod-wholesale"
              className="block text-xs font-bold text-stone-700 mb-1"
            >
              سعر الكرتونة ({currency})
            </label>
            <input
              id="prod-wholesale"
              type="number"
              step="0.01"
              min="0"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              placeholder="360"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          <div>
            <label
              htmlFor="prod-category"
              className="block text-xs font-bold text-stone-700 mb-1"
            >
              القسم
            </label>
            <select
              id="prod-category"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="عام">عام</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="prod-unit"
              className="block text-xs font-bold text-stone-700 mb-1"
            >
              الوحدة / الوزن
            </label>
            <input
              id="prod-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="عبوة / كجم / كرتونة"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="prod-stock"
                className="block text-xs font-bold text-stone-700 mb-1"
              >
                المخزون
              </label>
              <input
                id="prod-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono-nums"
              />
            </div>
            <div>
              <label
                htmlFor="prod-minqty"
                className="block text-xs font-bold text-stone-700 mb-1"
              >
                عدد الزجاجات داخل الكرتونة
              </label>
              <input
                id="prod-minqty"
                type="number"
                min="1"
                value={minWholesaleQty}
                onChange={(e) => setMinWholesaleQty(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono-nums"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-900 leading-relaxed">
          {perBottleInCarton !== null ? (
            <>
              سعر الزجاجة داخل الكرتونة:{' '}
              <strong className="font-mono-nums">
                {formatCurrency(perBottleInCarton, currency)}
              </strong>
              {' · '} سيظهر للمشتري: الكرتونة ({cartonCount} زجاجة) بسعر{' '}
              <strong className="font-mono-nums">
                {formatCurrency(cartonPriceValue, currency)}
              </strong>
              {' '}والزجاجة بسعر{' '}
              <strong className="font-mono-nums">
                {formatCurrency(Number(price) || 0, currency)}
              </strong>
            </>
          ) : (
            <>أدخل سعر الكرتونة وعدد الزجاجات بداخلها ليظهر السعران للمشتري في المتجر.</>
          )}
        </div>

        {/* Product Image URL or Upload */}
        <div className="space-y-2">
          <label
            htmlFor="prod-image"
            className="block text-xs font-bold text-stone-700"
          >
            صورة المنتج (رابط الصورة أو رفع ملف أو اختيار من المعرض)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="prod-image"
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/src/assets/images/..."
              className="flex-1 px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
            <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg cursor-pointer shrink-0">
              <Upload className="w-4 h-4" />
              <span>رفع صورة</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  imageUrl === preset.url
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <label
            htmlFor="prod-desc"
            className="block text-xs font-bold text-stone-700 mb-1"
          >
            بيانات المنتج (الوصف والمواصفات)
          </label>
          <textarea
            id="prod-desc"
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب مواصفات المنتج وجودته وتفاصيل العبوة..."
            className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isJuiceSection}
              onChange={(e) => setIsJuiceSection(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-800"
            />
            <span>إظهار في قسم عصائر ومشروبات</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            <span>
              {submitting
                ? 'جاري الحفظ...'
                : editingId
                  ? 'حفظ التعديلات'
                  : 'إضافة المنتج'}
            </span>
          </button>
        </div>
      </form>

      {/* Quick Category Adder */}
      <form
        onSubmit={handleAddCategory}
        className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="إضافة قسم جديد للمتجر..."
          className="flex-1 px-3.5 py-2 text-sm border border-stone-300 rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 text-xs sm:text-sm font-bold text-emerald-950 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg whitespace-nowrap"
        >
          إضافة قسم
        </button>
      </form>

      {/* Products Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-stone-900">
            قائمة المنتجات ({products.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">المنتج</th>
                <th className="py-3 px-4">القسم</th>
                <th className="py-3 px-4">السعر / الكرتونة</th>
                <th className="py-3 px-4">المخزون</th>
                <th className="py-3 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <ImageWithFallback
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 truncate max-w-[200px]">
                          {p.name}
                        </p>
                        <p className="text-xs text-stone-500 truncate max-w-[200px]">
                          {p.unit}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-stone-700">
                    {p.categoryName}
                  </td>
                  <td className="py-3 px-4 font-mono-nums">
                    <span className="font-bold text-emerald-950">
                      {formatCurrency(p.price, currency)}
                    </span>
                    {p.wholesalePrice && (
                      <span className="block text-[11px] text-stone-500 mt-0.5">
                        كرتونة ({p.minWholesaleQty}):{' '}
                        {formatCurrency(p.wholesalePrice, currency)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono-nums text-stone-700">
                    {p.stock}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        aria-label={`تعديل ${p.name}`}
                        className="p-2 text-stone-600 hover:text-emerald-900 hover:bg-stone-100 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        aria-label={`حذف ${p.name}`}
                        className="p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface OrdersAdminProps {
  token: string;
  orders: OrderRecord[];
  currency: string;
  onReloadOrders: () => Promise<void>;
  onToast: (msg: string) => void;
}

export function AdminOrdersPanel({
  token,
  orders,
  currency,
  onReloadOrders,
  onToast,
}: OrdersAdminProps) {
  const handleStatusChange = async (orderId: number, status: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      onToast('تم تحديث حالة الطلب');
      await onReloadOrders();
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-200">
        <h3 className="text-base font-extrabold text-stone-900">
          الطلبات المستلمة ({orders.length})
        </h3>
      </div>
      {orders.length === 0 ? (
        <p className="p-8 text-center text-sm text-stone-500">
          لا توجد طلبات مسجلة حتى الآن.
        </p>
      ) : (
        <div className="divide-y divide-stone-200">
          {orders.map((ord) => (
            <div key={ord.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono-nums font-extrabold text-stone-900">
                    {ord.orderNumber}
                  </span>
                  <span className="text-xs text-stone-500 mr-3">
                    {ord.customerName} · {ord.customerPhone}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono-nums font-extrabold text-emerald-950">
                    {formatCurrency(ord.totalAmount, currency)}
                  </span>
                  <select
                    aria-label={`تغيير حالة الطلب ${ord.orderNumber}`}
                    value={ord.status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="pending">قيد المراجعة</option>
                    <option value="processing">جاري التجهيز</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-stone-600">
                العنوان: {ord.customerAddress} · الدفع: عند الاستلام · الحالة:{' '}
                <strong>{getOrderStatusLabel(ord.status)}</strong>
              </p>

              {ord.items && ord.items.length > 0 && (
                <div className="bg-stone-50 rounded-xl p-3 text-xs space-y-1">
                  {ord.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.productName} × {it.quantity}
                      </span>
                      <span className="font-mono-nums font-semibold">
                        {formatCurrency(it.subtotal, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
