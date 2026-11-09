'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight, Play, Pause, Plus, Dices, Mic, Globe, Music2, Sparkles, Share2,
  SlidersHorizontal, Shield, LayoutGrid, Layers, Infinity as InfinityIcon, Heart,
} from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useAudioStore } from '@/lib/store';
import { mockSongs, formatPlays, type Song } from '@/lib/mockData';
import { GENRES } from '@/lib/genreProfiles';

// Quick ideas for the 🎲 button.
const IDEAS = {
  es: [
    "Un dembow pa' la calle con 808s pesados y un coro pegajoso",
    'Una bachata triste sobre un amor que se fue a Nueva York',
    'Merengue típico para celebrar el viernes con los panas',
    'Reggaeton romántico para dedicar en la madrugada',
    'Un trap latino oscuro sobre salir del barrio',
    'Afrobeats alegre para un verano en la playa',
  ],
  en: [
    'A street dembow with heavy 808s and a catchy hook',
    'A sad bachata about a love who moved to New York',
    'Merengue típico to celebrate Friday with friends',
    'A romantic reggaeton for late-night texts',
    'A dark Latin trap about leaving the block',
    'Feel-good Afrobeats for a summer at the beach',
  ],
};

const VOICES = ['male', 'female', 'none'] as const;
const FEATURED_GENRES = ['Dembow', 'Bachata', 'Reggaeton', 'Merengue', 'Latin Trap', 'Afrobeats', 'Salsa'];

export default function HomePage() {
  const { t, lang } = useT();
  const es = lang === 'es';
  const router = useRouter();
  const { setCurrentSong, currentSong, isPlaying } = useAudioStore();

  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [voice, setVoice] = useState<(typeof VOICES)[number]>('male');
  const [songLang, setSongLang] = useState<'Spanish' | 'English'>(es ? 'Spanish' : 'English');

  const voiceLabel = voice === 'male' ? (es ? 'Hombre' : 'Male') : voice === 'female' ? (es ? 'Mujer' : 'Female') : (es ? 'Instrumental' : 'Instrumental');

  const rollIdea = () => {
    const list = IDEAS[es ? 'es' : 'en'];
    let next = list[Math.floor(Math.random() * list.length)];
    if (next === prompt) next = list[(list.indexOf(next) + 1) % list.length];
    setPrompt(next);
  };

  // Hands the idea to the studio, which fills its own fields from the URL.
  const create = () => {
    const q = new URLSearchParams();
    if (prompt.trim()) q.set('prompt', prompt.trim());
    if (genre) q.set('genre', genre);
    q.set('vocals', voice);
    q.set('lang', songLang);
    router.push(`/studio?${q.toString()}`);
  };

  const byPlays = [...mockSongs].sort((a, b) => b.plays - a.plays);
  const byNew = [...mockSongs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const byLikes = [...mockSongs].sort((a, b) => b.likes - a.likes);

  const charts = [
    { title: es ? 'Top de hoy' : 'Top today', tag: '🔥 HOT', tagCls: 'tag-orange', songs: byPlays.slice(0, 4) },
    { title: es ? 'Recién salidos' : 'Fresh drops', tag: es ? 'NUEVO' : 'NEW', tagCls: 'tag-pink', songs: byNew.slice(0, 4) },
    { title: es ? 'Más gustados' : 'Most liked', tag: 'TRENDING', tagCls: 'tag-cyan', songs: byLikes.slice(0, 4) },
  ];

  const features = [
    { icon: Music2, title: t('home.f1.title'), desc: t('home.f1.desc') },
    { icon: Sparkles, title: t('home.f2.title'), desc: t('home.f2.desc') },
    { icon: Share2, title: t('home.f3.title'), desc: t('home.f3.desc') },
    { icon: SlidersHorizontal, title: t('home.f4.title'), desc: t('home.f4.desc') },
    { icon: Shield, title: t('home.f5.title'), desc: t('home.f5.desc') },
    { icon: LayoutGrid, title: t('home.f6.title'), desc: t('home.f6.desc') },
    { icon: Layers, title: t('home.f7.title'), desc: t('home.f7.desc') },
    { icon: InfinityIcon, title: t('home.f8.title'), desc: t('home.f8.desc') },
  ];

  const playing = (s: Song) => currentSong?.id === s.id && isPlaying;

  return (
    <div className="relative">
      {/* ── Hero: make a song right here ─────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="brand-glow left-1/2 -translate-x-1/2 -top-40 w-[min(1000px,140vw)] h-[520px] opacity-90" />
        <div className="relative mx-auto max-w-[820px] px-safe pt-8 sm:pt-14 pb-2 sm:pb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[12px] font-semibold text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-melaos-orange" /> {t('home.badge')}
          </span>

          <h1 className="display mt-5 text-[2.35rem] leading-[1.02] sm:text-6xl lg:text-[4.2rem]">
            {t('home.title1')}{' '}
            <span className="text-brand">{t('home.title2')}</span>
          </h1>
          <p className="mt-4 text-fog text-[15px] sm:text-[17px] max-w-xl mx-auto">{t('home.subtitle')}</p>

          {/* Prompt box */}
          <div className="mt-7 glass rounded-[26px] p-3 sm:p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, 500))}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) create(); }}
              rows={2}
              placeholder={es ? "Un dembow pa' la calle con 808s y coro pegajoso..." : 'A street dembow with 808s and a catchy hook...'}
              aria-label={es ? 'Describe tu canción' : 'Describe your song'}
              className="w-full resize-none bg-transparent px-2 pt-1 text-[16px] sm:text-[17px] text-white placeholder:text-fog-dim focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Link href="/studio" className="w-10 h-10 rounded-full border border-line-strong flex items-center justify-center text-white/90 hoverable:hover:bg-white/10" aria-label={es ? 'Abrir el estudio' : 'Open the studio'}>
                <Plus className="w-5 h-5" />
              </Link>
              <button onClick={() => setVoice(v => VOICES[(VOICES.indexOf(v) + 1) % VOICES.length])} className="chip">
                <Mic className="w-3.5 h-3.5" /> {es ? 'Voz' : 'Voice'}: {voiceLabel}
              </button>
              <button onClick={() => setSongLang(l => (l === 'Spanish' ? 'English' : 'Spanish'))} className="chip hidden xs:inline-flex">
                <Globe className="w-3.5 h-3.5" /> {songLang === 'Spanish' ? 'Español' : 'English'}
              </button>
              <button onClick={rollIdea} className="w-10 h-10 rounded-full border border-line-strong flex items-center justify-center text-white/90 hoverable:hover:bg-white/10" aria-label={es ? 'Idea al azar' : 'Random idea'} title={es ? 'Idea al azar' : 'Random idea'}>
                <Dices className="w-[18px] h-[18px]" />
              </button>
              <button onClick={create} className="btn btn-primary ml-auto !min-h-[44px] !px-6 text-[15px]">
                <Music2 className="w-4 h-4" /> {t('nav.create')}
              </button>
            </div>
          </div>

          {/* Genre chips */}
          <div className="mt-4 flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {FEATURED_GENRES.filter(g => (GENRES as readonly string[]).includes(g)).map(g => (
              <button key={g} onClick={() => setGenre(cur => (cur === g ? null : g))} className={`chip shrink-0 ${genre === g ? 'chip-on' : ''}`} aria-pressed={genre === g}>
                {g}
              </button>
            ))}
            <Link href="/studio" className="chip shrink-0">+ {GENRES.length - FEATURED_GENRES.length}</Link>
          </div>
          <p className="mt-4 text-[12.5px] text-fog-dim">{t('home.noCard')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-safe md:px-8 pb-6">
        {/* ── Trending charts ───────────────────────────────────────── */}
        <SectionHead title={es ? 'Tendencias' : 'Trending'} href="/explore" more={es ? 'Ver todo' : 'See all'} />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {charts.map(chart => (
            <div key={chart.title} className="panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-[15px] text-white">{chart.title}</h3>
                <span className={`tag ${chart.tagCls}`}>{chart.tag}</span>
              </div>
              {chart.songs.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSong(s)}
                  className="w-full grid grid-cols-[18px_48px_1fr_auto] items-center gap-3 py-2 text-left rounded-xl transition-colors hoverable:hover:bg-white/5 -mx-1 px-1"
                >
                  <span className="text-[13px] font-bold text-fog-dim tabular-nums text-center">{i + 1}</span>
                  <span className="relative w-12 h-12 rounded-[10px] overflow-hidden bg-ink-3">
                    {s.coverArt && <img src={s.coverArt} alt="" className="w-full h-full object-cover" />}
                    {playing(s) && <span className="absolute inset-0 bg-black/50 flex items-center justify-center"><Pause className="w-4 h-4 fill-white text-white" /></span>}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-white truncate">{s.title}</span>
                    <span className="flex items-center gap-1 text-[11.5px] text-fog truncate">
                      <Play className="w-3 h-3 fill-current" strokeWidth={0} /> {formatPlays(s.plays)} · {s.artist}
                    </span>
                  </span>
                  <span className="text-[11px] text-fog-dim flex items-center gap-1"><Heart className="w-3 h-3" /> {formatPlays(s.likes)}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── Most played ──────────────────────────────────────────── */}
        <SectionHead title={es ? 'Lo más escuchado' : 'Most played'} href="/explore" more={es ? 'Ver todo' : 'See all'} />
        <div className="mt-4 flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 md:scroll-px-0 pb-1">
          {byPlays.slice(0, 8).map((s, i) => (
            <button key={s.id} onClick={() => setCurrentSong(s)} className="group snap-start shrink-0 w-[148px] sm:w-[180px] text-left">
              <span className="relative block aspect-square rounded-2xl overflow-hidden bg-ink-3">
                {s.coverArt && <img src={s.coverArt} alt="" className="w-full h-full object-cover transition-transform duration-500 hoverable:group-hover:scale-105" />}
                {i < 3 && <span className="absolute left-2 top-2 tag tag-white">#{i + 1}</span>}
                <span className={`absolute right-2 bottom-2 w-10 h-10 rounded-full bg-brand flex items-center justify-center shadow-lg transition-opacity ${playing(s) ? 'opacity-100' : 'opacity-100 lg:opacity-0 hoverable:group-hover:opacity-100'}`}>
                  {playing(s) ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white ml-0.5" />}
                </span>
              </span>
              <span className="block mt-2 text-[13.5px] font-semibold text-white truncate">{s.title}</span>
              <span className="flex items-center gap-1 text-[12px] text-fog truncate">
                <Play className="w-3 h-3 fill-current" strokeWidth={0} /> {formatPlays(s.plays)} · {s.genre}
              </span>
            </button>
          ))}
        </div>

        {/* ── Everything you need ─────────────────────────────────── */}
        <div className="mt-14 sm:mt-20 text-center max-w-2xl mx-auto">
          <h2 className="display text-[1.9rem] sm:text-4xl leading-[1.08]">
            {t('home.features.title1')} <span className="text-brand">{t('home.features.title2')}</span>
          </h2>
          <p className="mt-3 text-fog">{t('home.features.subtitle')}</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="panel p-5 transition-colors hoverable:hover:bg-ink-3">
              <span className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </span>
              <h3 className="mt-4 font-semibold text-white text-[15px] leading-snug">{title}</h3>
              <p className="mt-1.5 text-fog text-[13.5px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Start ──────────────────────────────────────────────── */}
        <section className="relative mt-14 sm:mt-20 mb-6 overflow-hidden rounded-[28px] bg-ink-2 border border-line-soft">
          <div className="brand-glow -right-24 -top-24 w-[520px] h-[360px] opacity-80" />
          <div className="relative px-6 py-10 sm:px-12 sm:py-14 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <h2 className="display text-[1.9rem] sm:text-4xl leading-[1.08]">{t('home.ready.title')}</h2>
              <p className="mt-3 text-white/75 max-w-xl">{t('home.ready.subtitle')}</p>
            </div>
            <Link href="/studio" className="btn btn-primary !min-h-[54px] !px-8 text-[15px] self-start lg:self-auto">
              {t('home.ready.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ title, href, more }: { title: string; href: string; more: string }) {
  return (
    <div className="mt-8 sm:mt-12 flex items-center justify-between gap-4">
      <h2 className="display text-xl sm:text-2xl">{title}</h2>
      <Link href={href} className="btn btn-ghost !min-h-[34px] !px-3.5 text-[12.5px]">{more}</Link>
    </div>
  );
}
