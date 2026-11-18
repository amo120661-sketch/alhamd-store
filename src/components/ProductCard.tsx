import { Heart, ShoppingBag } from 'lucide-react';
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
  const { settings, favoriteIds, toggleFavorite, setSelectedProduct, addToCart } =
    useStore();
  const currency = settings?.currency || 'ج.م';
  const isFav = favoriteIds.includes(product.id);
  const cartonAvailable = Number(product.wholesalePrice) > 0;
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('piece');

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

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={
            isFav
              ? `إزالة ${product.name} من المفضلة`
              : `إضافة ${product.name} إلى المفضلة`
          }
          className={`absolute top-2.5 left-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
            isFav
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white/90 text-stone-700 border-stone-200 hover:text-rose-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Unboxed clean metadata with middot separator */}
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
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold text-stone-600">
              الزجاجة / القطعة
            </span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-950 font-mono-nums">
              {formatCurrency(product.price, currency)}
            </span>
          </div>
          {product.wholesalePrice && (
            <div className="flex items-baseline justify-between gap-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-2.5 py-1.5">
              <span className="text-xs font-semibold text-emerald-900">
                الكرتونة ({product.minWholesaleQty} زجاجة)
              </span>
              <span className="text-sm font-extrabold text-emerald-800 font-mono-nums">
                {formatCurrency(product.wholesalePrice, currency)}
              </span>
            </div>
          )}

          {cartonAvailable && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-lg" role="group" aria-label="نوع الشراء">
              <button
                type="button"
                onClick={() => setPurchaseType('piece')}
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
                onClick={() => setPurchaseType('carton')}
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

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="py-2.5 px-3 text-xs font-bold text-emerald-950 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
            >
              شراء الآن
            </button>
            <button
              type="button"
              onClick={() => addToCart(product, 1, purchaseType)}
              aria-label={`إضافة ${
                purchaseType === 'carton' ? 'كرتونة' : 'قطعة'
              } من ${product.name} إلى السلة`}
              className="py-2.5 px-3 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                أضف {purchaseType === 'carton' ? 'كرتونة' : 'قطعة'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
