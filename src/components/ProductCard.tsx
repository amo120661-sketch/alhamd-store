import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  formatCurrency,
  type PurchaseType,
  type StoreProduct,
} from '../utils/storeLogic';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { settings, setSelectedProduct, addToCart, openCheckout } = useStore();
  const currency = settings?.currency || 'ج.م';
  const cartonAvailable = Number(product.wholesalePrice) > 0;
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('piece');
  const [qty, setQty] = useState(1);
  const discount = String(product.discountValue || '').trim();

  const selectType = (type: PurchaseType) => {
    setPurchaseType(type);
    setQty(1);
  };

  return (
    <article className="group bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:border-stone-300">
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setSelectedProduct(product)}
          className="w-full h-full block text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
          aria-label={`عرض تفاصيل ${product.name}`}
        >
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </button>
      </div>

      {/* مربع الخصم الاختياري أسفل صورة المنتج */}
      {discount && (
        <div className="px-3 pt-2.5">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-200">
            خصم {discount}%
          </span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>{product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{product.unit}</span>
          </div>

          <h3 className="mt-1.5 text-sm sm:text-base font-bold text-stone-900 line-clamp-2 leading-snug">
            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="text-right hover:text-emerald-900 transition-colors"
            >
              {product.name}
            </button>
          </h3>
        </div>

        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          {/* سعر الكرتونة هو السعر الأساسي، وسعر القطعة أسفله */}
          {cartonAvailable ? (
            <div className="rounded-lg bg-emerald-50/70 border border-emerald-100 px-2.5 py-1.5 space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-emerald-900">
                  الكرتونة ({product.minWholesaleQty} زجاجة)
                </span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-800 font-mono-nums">
                  {formatCurrency(Number(product.wholesalePrice), currency)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 border-t border-emerald-100 pt-0.5">
                <span className="text-[11px] text-stone-500">
                  الزجاجة / القطعة
                </span>
                <span className="text-xs font-bold text-stone-600 font-mono-nums">
                  {formatCurrency(product.price, currency)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold text-stone-600">
                الزجاجة / القطعة
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-950 font-mono-nums">
                {formatCurrency(product.price, currency)}
              </span>
            </div>
          )}

          {cartonAvailable && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-lg" role="group" aria-label="نوع الشراء">
              <button
                type="button"
                onClick={() => selectType('piece')}
                aria-pressed={purchaseType === 'piece'}
                className={`py-1.5 text-[11px] font-bold rounded-md transition-colors ${
                  purchaseType === 'piece'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                قطعة
              </button>
              <button
                type="button"
                onClick={() => selectType('carton')}
                aria-pressed={purchaseType === 'carton'}
                className={`py-1.5 text-[11px] font-bold rounded-md transition-colors ${
                  purchaseType === 'carton'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                كرتونة
              </button>
            </div>
          )}

          {/* عداد الكمية يظهر دائماً بجانب زر الشراء، ويتغير عنوانه مع نوع الشراء */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center border border-stone-300 rounded-lg bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="إنقاص الكمية"
                className="w-8 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-r-lg"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold font-mono-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="زيادة الكمية"
                className="w-8 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-l-lg"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                addToCart(product, qty, purchaseType);
                setQty(1);
              }}
              aria-label={`إضافة ${qty} ${
                purchaseType === 'carton' ? 'كرتونة' : 'قطعة'
              } من ${product.name} إلى السلة`}
              className="flex-1 py-2.5 px-2 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                أضف {purchaseType === 'carton' ? 'كرتونة' : 'قطعة'} ({qty})
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const effectiveType =
                purchaseType === 'carton' &&
                !(Number(product.wholesalePrice) > 0)
                  ? 'piece'
                  : purchaseType;
              openCheckout([
                { product, quantity: qty, purchaseType: effectiveType },
              ]);
              setQty(1);
            }}
            className="w-full py-2 text-xs font-bold text-emerald-950 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            شراء الآن ({qty} {purchaseType === 'carton' ? 'كرتونة' : 'قطعة'})
          </button>
        </div>
      </div>
    </article>
  );
}
