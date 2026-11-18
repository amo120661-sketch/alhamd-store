import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  formatCurrency,
  getCartUnitPrice,
  getItemBottles,
} from '../utils/storeLogic';
import { ImageWithFallback } from './ImageWithFallback';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    totals,
    settings,
    updateCartQty,
    removeFromCart,
    openCheckout,
  } = useStore();

  if (!isCartOpen) return null;

  const currency = settings?.currency || 'ج.م';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="سلة التسوق"
    >
      <div className="bg-white w-full max-w-md h-full flex flex-col border-r border-stone-200">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-900" />
            <h2 className="text-lg font-extrabold text-stone-900">
              سلة التسوق ({totals.itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="إغلاق سلة التسوق"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-base font-bold text-stone-800">
                سلة التسوق فارغة حالياً
              </p>
              <p className="text-sm text-stone-500">
                تصفح المنتجات وأضف ما تحتاجه بالكرتونة أو بالقطعة.
              </p>
            </div>
          ) : (
            cart.map(({ product, quantity, purchaseType }) => {
              const unitPrice = getCartUnitPrice(product, quantity, purchaseType);
              const bottles = getItemBottles({
                product,
                quantity,
                purchaseType,
              });
              return (
                <div
                  key={`${product.id}-${purchaseType || 'piece'}`}
                  className="flex gap-3.5 pb-4 border-b border-stone-100"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <ImageWithFallback
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 font-mono-nums">
                      <span>{formatCurrency(unitPrice, currency)}</span>
                      <span className="font-semibold text-emerald-800">
                        {purchaseType === 'carton' ? '/ كرتونة' : '/ قطعة'}
                      </span>
                      {purchaseType === 'carton' && (
                        <span className="text-stone-500">
                          ({bottles} زجاجة)
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="inline-flex items-center border border-stone-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(product.id, quantity - 1, purchaseType)
                          }
                          aria-label={`إنقاص كمية ${product.name}`}
                          className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold font-mono-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(product.id, quantity + 1, purchaseType)
                          }
                          aria-label={`زيادة كمية ${product.name}`}
                          className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id, purchaseType)}
                        aria-label={`حذف ${product.name} من السلة`}
                        className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            {totals.remainingForFreeDelivery > 0 ? (
              <p className="text-xs text-stone-600">
                أضف منتجات بقيمة{' '}
                <strong className="font-mono-nums text-emerald-900">
                  {formatCurrency(totals.remainingForFreeDelivery, currency)}
                </strong>{' '}
                للحصول على توصيل مجاني
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>مؤهل للتوصيل المجاني</span>
              </p>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>المجموع الفرعي</span>
                <span className="font-mono-nums font-semibold">
                  {formatCurrency(totals.subtotal, currency)}
                </span>
              </div>
              {totals.wholesaleSavings > 0 && (
                <div className="flex justify-between text-emerald-800 text-xs font-semibold">
                  <span>توفير سعر الكرتونة</span>
                  <span className="font-mono-nums">
                    - {formatCurrency(totals.wholesaleSavings, currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>رسوم التوصيل</span>
                <span className="font-mono-nums font-semibold">
                  {totals.deliveryFee === 0
                    ? 'مجاني'
                    : formatCurrency(totals.deliveryFee, currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>الإجمالي</span>
                <span className="font-mono-nums text-emerald-950">
                  {formatCurrency(totals.total, currency)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openCheckout(cart)}
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors"
            >
              إتمام الطلب · الدفع عند الاستلام
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
