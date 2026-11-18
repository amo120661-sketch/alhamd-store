import { Heart, Home, LayoutGrid, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface MobileBottomBarProps {
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
}

export function MobileBottomBar({
  onNavigateHome,
  onNavigateCategories,
}: MobileBottomBarProps) {
  const { totals, favoriteIds, setIsCartOpen, setIsFavoritesOpen } = useStore();

  return (
    <nav
      aria-label="شريط التنقل السريع للهاتف"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 h-16 px-2 grid grid-cols-4 items-center"
    >
      <button
        type="button"
        onClick={onNavigateHome}
        className="flex flex-col items-center justify-center gap-1 text-stone-700 hover:text-emerald-900 py-1.5"
      >
        <Home className="w-5 h-5" />
        <span className="text-[11px] font-bold">الرئيسية</span>
      </button>

      <button
        type="button"
        onClick={onNavigateCategories}
        className="flex flex-col items-center justify-center gap-1 text-stone-700 hover:text-emerald-900 py-1.5"
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="text-[11px] font-bold">الأقسام</span>
      </button>

      <button
        type="button"
        onClick={() => setIsFavoritesOpen(true)}
        className="relative flex flex-col items-center justify-center gap-1 text-stone-700 hover:text-emerald-900 py-1.5"
      >
        <Heart className="w-5 h-5" />
        <span className="text-[11px] font-bold">
          المفضلة{favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ''}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center gap-1 text-emerald-900 py-1.5"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[11px] font-bold font-mono-nums">
          السلة ({totals.itemCount})
        </span>
      </button>
    </nav>
  );
}
