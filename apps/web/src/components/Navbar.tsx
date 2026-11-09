'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Plus, Library, GraduationCap, Gem, LayoutDashboard, Search, X, MessageCircle, Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n';
import Emblem from '@/components/Emblem';

// The app frame.
//   Computers (lg+): a side menu — an icon rail at lg (and always in the
//   studio, which needs the width), the full menu with labels at xl.
//   Phones and tablets: a top bar and an app-style bottom tab bar with a big
//   Crear button in the middle.
// The layout pads pages for all of this through CSS variables (globals.css).

const openMelao = () => window.dispatchEvent(new Event('melao:toggle'));

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { t, lang, setLang } = useT();
  const es = lang === 'es';

  // Lets CSS keep the side menu slim in the studio.
  useEffect(() => {
    document.documentElement.dataset.route = pathname.startsWith('/studio') ? 'studio' : 'page';
    setSearchOpen(false);
  }, [pathname]);

  const runSearch = () => {
    if (!query.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const links = [
    { href: '/', label: es ? 'Inicio' : 'Home', icon: Home },
    { href: '/studio', label: t('nav.create'), icon: Sparkles },
    { href: '/explore', label: t('nav.explore'), icon: Compass },
    { href: '/library', label: t('nav.library'), icon: Library },
    { href: '/learn', label: t('nav.learn'), icon: GraduationCap, external: true },
    { href: '/pricing', label: t('nav.pricing'), icon: Gem },
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  ];

  const langToggle = (compact = false) => (
    <div className={`flex items-center rounded-full bg-ink-2 p-1 ${compact ? '' : 'w-full'}`} role="group" aria-label="Language">
      {(['es', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`flex-1 h-8 px-3 rounded-full text-[12px] font-semibold transition-colors ${lang === l ? 'bg-white text-[#08080A]' : 'text-fog hoverable:hover:text-white'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const searchField = (autoFocus = false) => (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog-dim" />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
        placeholder={t('nav.search')}
        className="field !rounded-full h-10 !py-0 pl-10 text-[13px]"
      />
    </div>
  );

  return (
    <>
      {/* ── Computers: side menu ─────────────────────────────────────── */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 z-40 flex-col pt-safe"
        style={{ width: 'var(--side-w)', bottom: 'var(--player-h)' }}
      >
        <div className="flex flex-col h-full px-3 py-4 gap-1 overflow-y-auto scrollbar-hide">
          <Link href="/" className="mb-4 flex items-center px-2 h-10" aria-label="MELAOS STUDIOS">
            <Emblem variant="wordmark" className="side-full h-8 w-auto" />
            <Emblem variant="mark" className="side-rail w-11 -ml-1" />
          </Link>

          <div className="side-full mb-3 px-1">{searchField()}</div>
          <Link href="/explore" className="side-rail mb-2 side-item" title={t('nav.search')} aria-label={t('nav.search')}>
            <Search className="w-5 h-5" />
          </Link>

          {links.map(({ href, label, icon: Icon, external }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                target={external ? '_blank' : undefined}
                title={label}
                className={`side-item ${active ? 'side-item-on' : ''}`}
              >
                <span className={`side-icon ${active && href === '/studio' ? 'bg-brand text-white' : ''}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span className="side-full">{label}</span>
              </Link>
            );
          })}

          <div className="flex-1 min-h-6" />

          <button onClick={openMelao} className="side-full panel !rounded-2xl p-3 flex items-center gap-3 text-left transition-colors hoverable:hover:bg-ink-3">
            <span className="w-11 h-11 shrink-0 rounded-full bg-ink-0 flex items-center justify-center">
              <Emblem className="w-9" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-white">{es ? 'Pregúntale a Melao' : 'Ask Melao'}</span>
              <span className="block text-[11.5px] text-fog">{es ? 'Tu productor IA' : 'Your AI producer'}</span>
            </span>
          </button>
          <button onClick={openMelao} className="side-rail side-item" title="Melao" aria-label="Melao">
            <span className="side-icon"><MessageCircle className="w-[18px] h-[18px]" /></span>
          </button>

          <div className="side-full mt-3">{langToggle()}</div>
          <Link href="/auth" className="side-full btn btn-white w-full mt-3">{t('nav.signin')}</Link>
        </div>
      </aside>

      {/* ── Phones and tablets: top bar ─────────────────────────────── */}
      <header
        className="lg:hidden fixed top-0 inset-x-0 z-50 pt-safe bg-ink-0/85"
        style={{ WebkitBackdropFilter: 'blur(16px) saturate(150%)', backdropFilter: 'blur(16px) saturate(150%)' }}
      >
        <div className="h-14 px-safe flex items-center gap-2">
          <Link href="/" aria-label="MELAOS STUDIOS" className="mr-auto">
            <Emblem variant="wordmark" className="h-7 w-auto" />
          </Link>
          <button
            onClick={() => setSearchOpen(s => !s)}
            className="touch-target text-fog hoverable:hover:text-white"
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          {langToggle(true)}
          <Link href="/auth" className="btn btn-white !min-h-[36px] !px-4 text-[13px] ml-1">{t('nav.signin')}</Link>
        </div>
        {searchOpen && <div className="px-safe pb-3">{searchField(true)}</div>}
      </header>

      {/* ── Phones and tablets: bottom tab bar ──────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-ink-0/92 border-t border-line pb-safe"
        style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}
        aria-label="Main"
      >
        <div className="h-16 grid grid-cols-5 items-center px-safe">
          {[
            { href: '/', label: es ? 'Inicio' : 'Home', icon: Home },
            { href: '/explore', label: t('nav.explore'), icon: Compass },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`tab-item ${isActive(href) ? 'text-white' : 'text-fog-dim'}`}>
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive(href) ? 2.4 : 2} />
              <span>{label}</span>
            </Link>
          ))}
          <Link href="/studio" className="tab-item text-white" aria-label={t('nav.create')}>
            <span className="w-14 h-9 rounded-2xl bg-brand flex items-center justify-center shadow-[0_6px_20px_rgba(233,30,140,0.35)]">
              <Plus className="w-6 h-6" strokeWidth={2.6} />
            </span>
            <span className={isActive('/studio') ? 'text-white' : 'text-fog-dim'}>{t('nav.create')}</span>
          </Link>
          <Link href="/library" className={`tab-item ${isActive('/library') ? 'text-white' : 'text-fog-dim'}`}>
            <Library className="w-[22px] h-[22px]" strokeWidth={isActive('/library') ? 2.4 : 2} />
            <span>{t('nav.library')}</span>
          </Link>
          <button onClick={openMelao} className="tab-item text-fog-dim">
            <MessageCircle className="w-[22px] h-[22px]" />
            <span>Melao</span>
          </button>
        </div>
      </nav>
    </>
  );
}
