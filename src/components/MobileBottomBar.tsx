import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface MobileBottomBarProps {
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
}

export function MobileBottomBar({
  onNavigateHome,
  onNavigateCategories,
}: MobileBottomBarProps) {
  const { totals, setIsCartOpen, setIsOffersOpen, setIsAuthOpen } = useStore();

  const base =
    'flex flex-col items-center justify-center gap-1 text-stone-700 hover:text-emerald-900 py-1.5';

  return (
    <nav
      aria-label="شريط التنقل السريع للهاتف"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 h-16 px-1 grid grid-cols-5 items-center"
    >
      <button type="button" onClick={onNavigateHome} className={base}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">الرئيسية</span>
      </button>

      <button type="button" onClick={onNavigateCategories} className={base}>
        <LayoutGrid className="w-5 h-5" />
        <span className="text-[10px] font-bold">الأقسام</span>
      </button>

      {/* سلة المشتريات في المنتصف تماماً */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center gap-1 text-emerald-900 py-1.5"
      >
        <span className="absolute -top-3 w-12 h-12 rounded-full bg-emerald-900 text-white shadow-lg border-4 border-white flex items-center justify-center">
          <ShoppingBag className="w-5 h-5" />
        </span>
        <span className="text-[9px] leading-none font-bold font-mono-nums mt-7 whitespace-nowrap">
          سلة المشتريات ({totals.itemCount})
        </span>
      </button>

      <button type="button" onClick={() => setIsOffersOpen(true)} className={base}>
        <Tag className="w-5 h-5" />
        <span className="text-[10px] font-bold">العروض</span>
      </button>

      <button type="button" onClick={() => setIsAuthOpen(true)} className={base}>
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px] font-bold">حسابي</span>
      </button>
    </nav>
  );
}
