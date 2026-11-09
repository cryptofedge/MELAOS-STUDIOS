'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, ArrowUpRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import Emblem from '@/components/Emblem';

// Top bar. Sits under the status bar / notch (padding = safe-area inset),
// 56px tall below it. Links are mono labels; the one action is "Crear".
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { t, lang, setLang } = useT();

  // Close the drawer on navigation, and stop the page scrolling under it.
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const runSearch = () => {
    if (!query.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  const links: { label: string; href: string; external?: boolean }[] = [
    { label: t('nav.explore'), href: '/explore' },
    { label: t('nav.library'), href: '/library' },
    { label: t('nav.pricing'), href: '/pricing' },
    { label: t('nav.learn'), href: '/learn', external: true },
  ];

  const langToggle = () => (
    <div className="flex items-center h-8 border border-line rounded-xs overflow-hidden font-mono text-[10.5px] tracking-[0.14em]" role="group" aria-label="Language">
      {(['es', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`h-full px-2.5 transition-colors ${lang === l ? 'bg-ink-3 text-melaos-orange' : 'text-fog-dim hoverable:hover:text-white'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const searchField = (autoFocus = false) => (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fog-dim" strokeWidth={1.75} />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
        placeholder={t('nav.search')}
        className="field h-9 !py-0 pl-9 text-[13px]"
      />
    </div>
  );

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 z-50 border-b border-line-soft bg-ink-0/85 pt-safe"
        style={{ WebkitBackdropFilter: 'blur(14px) saturate(140%)', backdropFilter: 'blur(14px) saturate(140%)' }}
      >
        <div className="mx-auto max-w-[1440px] h-14 px-safe md:px-6 flex items-center gap-6">
          <Link href="/" className="shrink-0 flex items-center" aria-label="MELAOS STUDIOS">
            <Emblem variant="wordmark" alt="MELAOS STUDIOS" className="h-7 sm:h-8 w-auto" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] tracking-[0.16em] uppercase">
            {links.map(({ label, href, external }) => {
              const active = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  target={external ? '_blank' : undefined}
                  className={`relative px-3 h-14 flex items-center transition-colors ${active ? 'text-white' : 'text-fog hoverable:hover:text-white'}`}
                >
                  {label}
                  {external && <ArrowUpRight className="w-3 h-3 ml-1 opacity-60" strokeWidth={1.75} />}
                  {active && <span className="absolute left-3 right-3 bottom-0 h-px bg-melaos-orange" />}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block flex-1 max-w-sm ml-auto">
            {searchField()}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {langToggle()}
            <Link href="/auth" className="btn btn-quiet !px-3">{t('nav.signin')}</Link>
            <Link href="/studio" className="btn btn-primary">{t('nav.create')}</Link>
          </div>

          {/* Phones */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            {langToggle()}
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="touch-target text-fog hoverable:hover:text-white"
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="touch-target -mr-2 text-fog hoverable:hover:text-white"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden px-safe pb-3">
            {searchField(true)}
          </div>
        )}
      </nav>

      {/* Phone drawer */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-[55] bg-ink-0 rule-grid overflow-y-auto"
          style={{ top: 'var(--nav-h)' }}
        >
          <div className="flex flex-col min-h-full px-safe pt-8 pb-safe">
            <p className="label mb-4">{lang === 'es' ? 'Navegación' : 'Navigation'}</p>
            {([
              ...links,
              { label: t('nav.dashboard'), href: '/dashboard' },
              { label: t('nav.signin'), href: '/auth' },
            ]).map(({ label, href, external }, i) => (
              <Link
                key={href}
                href={href}
                target={external ? '_blank' : undefined}
                onClick={() => setMenuOpen(false)}
                className="group flex items-baseline gap-4 py-4 border-b border-line-soft"
              >
                <span className="font-mono text-[11px] text-fog-dim tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="display text-2xl font-light text-white group-active:text-melaos-orange">{label}</span>
              </Link>
            ))}
            <Link
              href="/studio"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary w-full mt-8 mb-6 !min-h-[52px]"
            >
              {t('nav.createNow')}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
