'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Play, Music2, Sparkles, Share2, SlidersHorizontal, Shield, LayoutGrid, Layers, Infinity } from 'lucide-react';
import { useT } from '@/lib/i18n';
import Emblem from '@/components/Emblem';
import { GENRES } from '@/lib/genreProfiles';

// Three.js only loads in the browser, after the page is already readable.
const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

const heroSongs = [
  { title: 'Midnight Frequencies', artist: 'NovaSynth', coverArt: '/covers/1.jpg', genre: 'Electronic', bpm: 128 },
  { title: 'Golden Hour Lagos', artist: 'AfroWave', coverArt: '/covers/2.jpg', genre: 'Afrobeats', bpm: 102 },
  { title: 'Trap Cathedral', artist: 'DeepVault', coverArt: '/covers/6.jpg', genre: 'Trap', bpm: 145 },
];

export default function HomePage() {
  const { t, lang } = useT();
  const es = lang === 'es';

  const features = [
    { icon: Music2, title: t('home.f1.title'), desc: t('home.f1.desc') },
    { icon: Sparkles, title: t('home.f2.title'), desc: t('home.f2.desc') },
    { icon: Share2, title: t('home.f3.title'), desc: t('home.f3.desc') },
    { icon: SlidersHorizontal, title: t('home.f4.title'), desc: t('home.f4.desc') },
    { icon: Shield, title: t('home.f5.title'), desc: t('home.f5.desc') },
    { icon: LayoutGrid, title: t('home.f6.title'), desc: t('home.f6.desc') },
    { icon: Layers, title: t('home.f7.title'), desc: t('home.f7.desc') },
    { icon: Infinity, title: t('home.f8.title'), desc: t('home.f8.desc') },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative border-b border-line-soft">
        <div className="mx-auto max-w-[1440px] grid lg:grid-cols-12 lg:min-h-[min(calc(100dvh-var(--nav-h)),880px)]">
          {/* Stage: 3D ring with the M in the middle */}
          <div className="relative order-first lg:order-last lg:col-span-7 h-[min(46dvh,400px)] sm:h-[min(60dvh,560px)] lg:h-auto overflow-hidden">
            {/* Shown until WebGL draws, and instead of it where WebGL is unavailable */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_58%,rgba(242,140,40,0.18),transparent_70%)]" />
            <HeroScene className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_75%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,black_22%,black_88%,transparent),linear-gradient(to_bottom,black_80%,transparent)] lg:[mask-composite:intersect]" />
            <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[46%] sm:w-[38%] lg:w-[34%] max-w-[320px] animate-[heroFloat_6s_ease-in-out_infinite]">
              <Emblem className="w-full drop-shadow-[0_10px_40px_rgba(233,30,140,0.25)]" />
            </div>
            {/* Readouts on the stage corners */}
            <div className="absolute top-4 left-4 lg:left-10 flex items-center gap-2 label !text-fog">
              <span className="live-dot" /> {es ? 'Señal en vivo' : 'Live signal'}
            </div>
            <div className="absolute bottom-4 right-4 lg:right-8 label tabular-nums text-right">
              116 BPM · 4/4 · DEMBOW
            </div>
          </div>

          {/* Copy */}
          <div className="relative lg:col-span-5 flex flex-col justify-center px-safe md:px-8 lg:pl-10 xl:pl-16 lg:pr-4 pt-8 pb-12 lg:py-16">
            <p className="flex items-center gap-2 label mb-6 lg:mb-8">
              <span className="inline-block w-6 h-px bg-melaos-orange" />
              {t('home.badge')}
            </p>

            <h1 className="display font-light text-white leading-[0.98] text-[clamp(2.4rem,7.4vw,3.4rem)] lg:text-[clamp(2.8rem,4.4vw,4.6rem)]">
              {t('home.title1')}{' '}
              <span className="font-medium text-melaos-orange">{t('home.title2')}</span>
            </h1>

            <p className="mt-6 text-fog text-base sm:text-[17px] leading-relaxed max-w-[34rem]">
              {t('home.subtitle')}
            </p>

            <div className="mt-8 flex flex-col xs:flex-row gap-3">
              <Link href="/studio" className="btn btn-primary !min-h-[52px] !px-7">
                {t('home.cta.create')} <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
              <Link href="/explore" className="btn btn-ghost !min-h-[52px] !px-7">
                {t('home.cta.explore')}
              </Link>
            </div>
            <p className="mt-4 label normal-case tracking-normal !text-[12px]">{t('home.noCard')}</p>

            {/* Spec strip */}
            <dl className="mt-10 grid grid-cols-3 border-t border-line-soft">
              {[
                [String(GENRES.length), es ? 'Géneros' : 'Genres'],
                ['ES · EN', es ? 'Idiomas' : 'Languages'],
                ['A&R', es ? 'Revisión en 72 h' : '72-hour review'],
              ].map(([value, name], i) => (
                <div key={name} className={`pt-4 ${i ? 'pl-4 border-l border-line-soft' : ''}`}>
                  <dt className="label">{name}</dt>
                  <dd className="mt-1.5 display text-lg sm:text-xl text-white tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Genre ticker ────────────────────────────────────────────── */}
      <div className="border-b border-line-soft overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" aria-hidden>
        <div className="flex w-max animate-ticker py-3.5">
          {[0, 1].map(copy => (
            <div key={copy} className="flex shrink-0">
              {GENRES.map(g => (
                <span key={`${copy}-${g}`} className="font-mono text-[11px] tracking-[0.2em] uppercase text-fog-dim px-6 flex items-center gap-6">
                  {g}
                  <span className="w-1 h-1 rotate-45 bg-melaos-orange/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── 01 Listen ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-safe md:px-8 py-16 sm:py-24">
        <SectionHead index="01" label={es ? 'Escucha' : 'Listen'} title={t('home.cta.explore')} action={{ href: '/explore', text: es ? 'Ver todo' : 'See all' }} />
        <div className="mt-10 flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {heroSongs.map((song, i) => (
            <Link
              key={song.title}
              href="/explore"
              className="group snap-start shrink-0 w-[78%] xs:w-[68%] md:w-auto"
            >
              <div className="relative aspect-square overflow-hidden border border-line bg-ink-2">
                <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hoverable:group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 label !text-white/80 tabular-nums">TRK {String(i + 1).padStart(2, '0')}</span>
                <span className="absolute bottom-3 right-3 btn btn-primary !min-h-[40px] !px-3.5 opacity-100 md:opacity-0 hoverable:group-hover:opacity-100 transition-opacity" aria-hidden>
                  <Play className="w-4 h-4 fill-current" strokeWidth={0} />
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{song.title}</p>
                  <p className="text-fog text-sm truncate">{song.artist}</p>
                </div>
                <p className="label shrink-0 text-right tabular-nums pt-1">{song.genre}<br />{song.bpm} BPM</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 02 Capabilities ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-safe md:px-8 pb-16 sm:pb-24">
        <SectionHead
          index="02"
          label={es ? 'Capacidades' : 'Capabilities'}
          title={<>{t('home.features.title1')} <span className="text-melaos-orange">{t('home.features.title2')}</span></>}
          sub={t('home.features.subtitle')}
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line-soft border border-line-soft">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="bg-ink-0 p-6 sm:p-7 transition-colors hoverable:hover:bg-ink-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-fog-dim tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <Icon className="w-[18px] h-[18px] text-melaos-orange" strokeWidth={1.5} />
              </div>
              <h3 className="mt-8 text-white font-medium text-[15px] leading-snug">{title}</h3>
              <p className="mt-2 text-fog text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 03 Start ────────────────────────────────────────────────── */}
      <section className="relative border-t border-line-soft overflow-hidden">
        <div className="brand-rule absolute top-0 inset-x-0 opacity-70" />
        <div className="absolute inset-0 rule-grid [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-[1440px] px-safe md:px-8 py-16 sm:py-24 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <p className="label mb-5">03 — {es ? 'Empieza' : 'Start'}</p>
            <h2 className="display font-light text-white text-[clamp(2rem,5vw,3.75rem)] leading-[1.02]">{t('home.ready.title')}</h2>
            <p className="mt-5 text-fog max-w-xl">{t('home.ready.subtitle')}</p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Link href="/studio" className="btn btn-primary !min-h-[56px] !px-8 w-full sm:w-auto">
              {t('home.ready.cta')} <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ index, label, title, sub, action }: {
  index: string;
  label: string;
  title: React.ReactNode;
  sub?: string;
  action?: { href: string; text: string };
}) {
  return (
    <div className="grid lg:grid-cols-12 gap-4 lg:gap-8 items-end border-b border-line-soft pb-6">
      <div className="lg:col-span-7">
        <p className="label mb-4">{index} — {label}</p>
        <h2 className="display font-light text-white text-[clamp(1.6rem,3.6vw,2.75rem)] leading-[1.05]">{title}</h2>
      </div>
      {sub && <p className="lg:col-span-5 text-fog leading-relaxed">{sub}</p>}
      {action && (
        <Link href={action.href} className="lg:col-span-5 justify-self-start lg:justify-self-end btn btn-quiet !px-0 gap-2">
          {action.text} <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  );
}
