'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, Globe } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { t, lang, setLang } = useT();

  const runSearch = () => {
    if (!query.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  const LangToggle = ({ className = '' }: { className?: string }) => (
    <button
      onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
      className={`flex items-center gap-1.5 border border-[#333] rounded-full px-3 py-1.5 text-xs font-bold text-[#F28C28] hover:border-[#F28C28] transition-colors ${className}`}
      title={lang === 'es' ? 'Switch to English' : 'Cambiar a español'}
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5" />
      {lang === 'es' ? 'ES' : 'EN'}
    </button>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 border-b border-[#1A1A1A]" style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}>
        {/* Main nav row */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img src="/melaos-logo-2.png" alt="MELAOS STUDIOS" className="h-16 w-auto" />
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
                placeholder={t('nav.search')}
                style={{ fontSize: '16px' }}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#F28C28] transition-colors"
              />
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/explore" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {t('nav.explore')}
            </Link>
            <Link href="/library" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {t('nav.library')}
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {t('nav.pricing')}
            </Link>
            <Link href="/learn" target="_blank" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {t('nav.learn')}
            </Link>
            <Link href="/studio" className="btn-orange text-white text-sm font-semibold px-4 py-2 rounded-full transition-all hover:scale-105">
              {t('nav.create')}
            </Link>
            <Link href="/auth" className="text-gray-400 hover:text-white text-sm font-medium">
              {t('nav.signin')}
            </Link>
            <LangToggle />
          </div>

          {/* Mobile: language + search icon + hamburger */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <LangToggle className="mr-1" />
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="touch-target text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="touch-target text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar (toggled) */}
        <div className={`md:hidden px-4 pb-3 ${searchOpen ? 'block' : 'hidden'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
              placeholder={t('nav.search')}
              style={{ fontSize: '16px' }}
              className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2 pl-10 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#F28C28] transition-colors"
            />
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#0A0A0A] z-40 overflow-y-auto">
          <div className="flex flex-col p-6 gap-6">
            <div className="flex justify-center py-2">
              <img src="/melaos-logo-3.png" alt="MELAOS STUDIOS" className="h-24 w-auto" />
            </div>
            {([
              [t('nav.explore'), '/explore'],
              [t('nav.library'), '/library'],
              [t('nav.pricing'), '/pricing'],
              [t('nav.learn'), '/learn'],
              [t('nav.dashboard'), '/dashboard'],
              [t('nav.signin'), '/auth'],
            ] as [string, string][]).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                target={href === '/learn' ? '_blank' : undefined}
                onClick={() => setMenuOpen(false)}
                className="text-xl font-semibold text-gray-200 hover:text-[#F28C28] transition-colors py-1"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/studio"
              onClick={() => setMenuOpen(false)}
              className="btn-orange text-white font-bold text-base px-6 py-4 rounded-full text-center mt-2"
            >
              {t('nav.createNow')}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
