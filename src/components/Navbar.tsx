import { Heart, Home, LayoutGrid, LogIn, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

interface NavbarProps { onNavigateHome: () => void; onNavigateCategories: () => void; }

export function Navbar({ onNavigateHome, onNavigateCategories }: NavbarProps) {
  const { settings, offers, user, totals, favoriteIds, setIsCartOpen, setIsFavoritesOpen, setIsAuthOpen } = useStore();
  const [offerIdx, setOfferIdx] = useState(0);
  const [offerDismissed, setOfferDismissed] = useState(false);
  useEffect(() => {
    if (offers.length <= 1) return;
    const timer = setInterval(() => setOfferIdx((prev) => (prev + 1) % offers.length), 5000);
    return () => clearInterval(timer);
  }, [offers.length]);
  const currentOffer = offers[offerIdx % Math.max(1, offers.length)];
  return <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
    {!offerDismissed && currentOffer && <div className="bg-emerald-950 text-stone-100 h-9 px-4 flex items-center justify-between text-xs"><div className="w-6" /><p className="truncate font-medium text-center">{currentOffer.badgeText && <span className="text-amber-300 font-semibold ml-2">{currentOffer.badgeText} ·</span>}{currentOffer.text}</p><button type="button" onClick={() => setOfferDismissed(true)} aria-label="إغلاق شريط العرض" className="text-stone-300 p-1"><X className="w-3.5 h-3.5" /></button></div>}
    <header className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
      <a href="#top" onClick={(e) => { e.preventDefault(); onNavigateHome(); }} className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-950 whitespace-nowrap shrink-0">{settings?.storeName || 'الحمد جملة وتجزئة'}</a>
      <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-2">
        <button type="button" onClick={onNavigateHome} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"><Home className="w-4 h-4" /><span>الرئيسية</span></button>
        <button type="button" onClick={onNavigateCategories} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"><LayoutGrid className="w-4 h-4" /><span>الأقسام</span></button>
        <button type="button" onClick={() => setIsFavoritesOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"><Heart className="w-4 h-4" /><span>المفضلة</span>{favoriteIds.length > 0 && <span className="text-xs text-emerald-800 font-bold">({favoriteIds.length})</span>}</button>
        <button type="button" onClick={() => setIsCartOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-700 rounded-lg"><ShoppingBag className="w-4 h-4" /><span>السلة</span><span className="text-xs bg-emerald-900 text-white px-1.5 py-0.5 rounded-md">{totals.itemCount}</span></button>
      </nav>
      <div className="flex items-center gap-2 shrink-0">{user ? <button type="button" onClick={() => setIsAuthOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 rounded-lg max-w-[150px]"><UserIcon className="w-4 h-4 shrink-0 text-emerald-800" /><span className="truncate">{user.name}</span></button> : <button type="button" onClick={() => setIsAuthOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-900 rounded-lg"><LogIn className="w-4 h-4" /><span>تسجيل الدخول</span></button>}</div>
    </header>
  </div>;
}
