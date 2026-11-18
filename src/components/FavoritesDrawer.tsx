import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/storeLogic';
import { ImageWithFallback } from './ImageWithFallback';

export function FavoritesDrawer() {
  const {
    isFavoritesOpen,
    setIsFavoritesOpen,
    products,
    favoriteIds,
    toggleFavorite,
    addToCart,
    setSelectedProduct,
    settings,
  } = useStore();

  if (!isFavoritesOpen) return null;

  const currency = settings?.currency || 'ج.م';
  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="المنتجات المفضلة"
    >
      <div className="bg-white w-full max-w-md h-full flex flex-col border-r border-stone-200">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-extrabold text-stone-900">
              المفضلة ({favoriteProducts.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsFavoritesOpen(false)}
            aria-label="إغلاق المفضلة"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Heart className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-base font-bold text-stone-800">
                قائمة المفضلة فارغة
              </p>
              <p className="text-sm text-stone-500">
                اضغط على رمز القلب لحفظ منتجاتك المفضلة للوصول إليها لاحقاً.
              </p>
            </div>
          ) : (
            favoriteProducts.map((product) => (
              <div
                key={product.id}
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
                  <p className="mt-1 text-sm font-extrabold text-emerald-950 font-mono-nums">
                    {formatCurrency(product.price, currency)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFavoritesOpen(false);
                        setSelectedProduct(product);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg"
                    >
                      شراء الآن
                    </button>
                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg inline-flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>للسلة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(product.id)}
                      aria-label={`إزالة ${product.name} من المفضلة`}
                      className="p-1.5 text-stone-400 hover:text-rose-600 mr-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
