import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { filterProducts } from '../utils/storeLogic';
import { HeroSlider } from './HeroSlider';
import { ProductCard } from './ProductCard';
import { SupportSection } from './SupportSection';

export function StorefrontHome() {
  const { loading, error, categories, products, refreshStorefront } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLatest = useMemo(
    () =>
      filterProducts(products, {
        categoryName: selectedCategory,
        searchQuery,
      }),
    [products, selectedCategory, searchQuery]
  );

  const juiceProducts = useMemo(
    () => filterProducts(products, { onlyJuices: true }),
    [products]
  );

  const handleSliderAction = (section: string) => {
    const idMap: Record<string, string> = {
      categories: 'categories-section',
      latest: 'latest-section',
      juices: 'juices-section',
      support: 'support-section',
    };
    const el = document.getElementById(idMap[section] || 'latest-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="h-[240px] sm:h-[320px] rounded-2xl bg-stone-200 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-stone-200 animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-lg font-bold text-stone-900">{error}</p>
        <button
          type="button"
          onClick={refreshStorefront}
          className="px-5 py-2.5 bg-emerald-900 text-white text-sm font-bold rounded-xl"
        >
          إعادة المحاولة
        </button>
      </main>
    );
  }

  return (
    <main id="top">
      {/* 1. Wide Auto-Transitioning Top Slider */}
      <HeroSlider onSelectSection={handleSliderAction} />

      {/* 2. Categories Section (الأقسام) */}
      <section
        id="categories-section"
        aria-labelledby="categories-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <h2
              id="categories-heading"
              className="text-xl sm:text-2xl font-extrabold text-stone-900"
            >
              الأقسام
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              اختر القسم لعرض المنتجات المتاحة بسعر الجملة والتجزئة
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              aria-label="ابحث عن منتج"
              className="w-full pr-9 pl-3 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('الكل')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-colors whitespace-nowrap ${
              selectedCategory === 'الكل'
                ? 'bg-emerald-900 text-white border-emerald-900'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
            }`}
          >
            الكل ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-colors whitespace-nowrap ${
                selectedCategory === cat.name
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Latest Additions (أحدث الإضافات) */}
      <section
        id="latest-section"
        aria-labelledby="latest-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12"
      >
        <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-stone-200">
          <div>
            <h2
              id="latest-heading"
              className="text-xl sm:text-2xl font-extrabold text-stone-900"
            >
              أحدث الإضافات
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              اختر المنتج للمفاضلة بين الشراء الفوري أو الإضافة إلى السلة
            </p>
          </div>
          <span className="text-xs font-mono-nums text-stone-500">
            {filteredLatest.length} منتج
          </span>
        </div>

        {filteredLatest.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-2">
            <p className="text-base font-bold text-stone-800">
              لا توجد منتجات مطابقة لبحثك حالياً
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('الكل');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 text-xs font-bold bg-emerald-900 text-white rounded-lg"
            >
              عرض جميع المنتجات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredLatest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Juices & Beverages Section (قسم عصائر ومشروبات) */}
      <section
        id="juices-section"
        aria-labelledby="juices-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-14"
      >
        <div className="bg-stone-100/80 border border-stone-200 rounded-2xl p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <h2
                id="juices-heading"
                className="text-xl sm:text-2xl font-extrabold text-stone-900"
              >
                قسم عصائر ومشروبات
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                عصائر طبيعية مبردة ومشروبات منتقاة متاحة بالزجاجة وبأسعار
                الكراتين
              </p>
            </div>
            <span className="text-xs font-mono-nums text-emerald-900 font-bold">
              {juiceProducts.length} أصناف
            </span>
          </div>

          {juiceProducts.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">
              لا توجد مشروبات مضافة في هذا القسم حالياً.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {juiceProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Contact Support Section (تواصل مع الدعم) */}
      <SupportSection />
    </main>
  );
}
