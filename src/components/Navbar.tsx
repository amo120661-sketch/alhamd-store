import { Home, LayoutGrid, LogIn, ShoppingBag, Tag, User as UserIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ImageWithFallback } from './ImageWithFallback';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
}

export function Navbar({ onNavigateHome, onNavigateCategories }: NavbarProps) {
  const {
    settings,
    user,
    totals,
    setIsCartOpen,
    setIsOffersOpen,
    setIsAuthOpen,
  } = useStore();

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          className="flex items-center gap-2.5 min-w-0"
        >
          {settings?.logoUrl ? (
            <ImageWithFallback
              src={settings.logoUrl}
              alt={settings.storeName || 'شعار المتجر'}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-contain shrink-0"
            />
          ) : (
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-emerald-950 text-amber-300 flex items-center justify-center text-xl font-extrabold shrink-0">
              ح
            </span>
          )}
          <span className="text-base sm:text-xl font-extrabold tracking-tight text-emerald-950 whitespace-nowrap truncate">
            {settings?.storeName || 'الحمد جملة وتجزئة'}
          </span>
        </a>

        <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
          <button
            type="button"
            onClick={onNavigateCategories}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>الأقسام</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOffersOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"
          >
            <Tag className="w-4 h-4" />
            <span>العروض</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>السلة</span>
            <span className="text-xs bg-emerald-900 text-white px-1.5 py-0.5 rounded-md">
              {totals.itemCount}
            </span>
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 rounded-lg max-w-[150px]"
            >
              <UserIcon className="w-4 h-4 shrink-0 text-emerald-800" />
              <span className="truncate">{user.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-900 rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </header>
    </div>
  );
}
