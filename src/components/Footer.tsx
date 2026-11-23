import { useStore } from '../context/StoreContext';

interface FooterProps { onScrollToSection: (id: string) => void; }

export function Footer({ onScrollToSection }: FooterProps) {
  const { settings } = useStore();
  const socialLinks = [
    { key: 'facebook', label: 'فيسبوك', url: settings?.facebookUrl },
    { key: 'instagram', label: 'إنستغرام', url: settings?.instagramUrl },
    { key: 'whatsapp', label: 'واتساب', url: settings?.whatsappUrl },
    { key: 'tiktok', label: 'تيك توك', url: settings?.tiktokUrl },
    { key: 'twitter', label: 'إكس', url: settings?.twitterUrl },
    { key: 'youtube', label: 'يوتيوب', url: settings?.youtubeUrl },
  ].filter((item) => item.url?.trim());
  return <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pb-20 md:pb-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8"><div className="lg:col-span-2 space-y-3"><h2 className="text-xl font-extrabold text-white">{settings?.storeName || 'الحمد جملة وتجزئة'}</h2><p className="text-sm text-stone-400 leading-relaxed max-w-md">{settings?.storeDescription || 'متجركم الموثوق للمواد الغذائية والمشروبات والعصائر الطبيعية.'}</p></div><div className="space-y-3"><h3 className="text-sm font-bold text-white">روابط سريعة</h3><ul className="space-y-2 text-sm"><li><button type="button" onClick={() => onScrollToSection('categories-section')}>الأقسام</button></li><li><button type="button" onClick={() => onScrollToSection('latest-section')}>أحدث الإضافات</button></li><li><button type="button" onClick={() => onScrollToSection('juices-section')}>عصائر ومشروبات</button></li><li><button type="button" onClick={() => onScrollToSection('offers-section')}>العروض</button></li></ul></div><div className="space-y-3"><h3 className="text-sm font-bold text-white">منصات التواصل الاجتماعي</h3>{socialLinks.length > 0 ? <div className="flex flex-wrap gap-2">{socialLinks.map((item) => <a key={item.key} href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 text-xs font-bold rounded-lg bg-stone-900 border border-stone-800">{item.label}</a>)}</div> : <p className="text-xs text-stone-500">يمكن إضافة روابط المنصات من لوحة الإدارة.</p>}</div></div><div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500"><p>جميع الحقوق محفوظة © {new Date().getFullYear()} {settings?.storeName || 'الحمد جملة وتجزئة'}</p><p>الدفع عند الاستلام متاح لجميع الطلبات</p></div></footer>;
}
