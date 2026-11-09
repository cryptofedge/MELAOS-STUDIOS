'use client';
import { useState, useEffect, Suspense, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Pause, Heart, MoreHorizontal, ArrowRight, Search, Plus } from 'lucide-react';
import { mockSongs, formatPlays, type Song } from '@/lib/mockData';
import { useAudioStore } from '@/lib/store';
import { GENRES } from '@/lib/genreProfiles';

const tabs = ['Trending', 'New', 'Following', 'Genres'];
const genres = ['All', ...GENRES];

// Staff Picks are curated mock songs (not in the main catalog) — built as full Song objects so they're playable
const STAFF_PICKS: Song[] = [
  { id: 's1', title: 'My Vision', artist: 'Luna World', artistId: 'sp1', coverColor: '#E91E8C', coverGradient: 'linear-gradient(135deg,#E91E8C,#7C3AED)', coverArt: '/covers/s1.jpg', duration: 198, durationFormatted: '3:18', plays: 150000, likes: 2200, genre: 'Pop', mood: 'Euphoric', bpm: 118, isPublic: true, createdAt: '2026-06-22', tags: ['staffpick'] },
  { id: 's2', title: 'Secret Fantasy', artist: 'Alfie', artistId: 'sp2', coverColor: '#F28C28', coverGradient: 'linear-gradient(135deg,#F28C28,#E91E8C)', coverArt: '/covers/s2.jpg', duration: 211, durationFormatted: '3:31', plays: 74000, likes: 12000, genre: 'R&B', mood: 'Romantic', bpm: 92, isPublic: true, createdAt: '2026-06-23', tags: ['staffpick'] },
  { id: 's3', title: 'BIZARRE', artist: 'MOSTER', artistId: 'sp3', coverColor: '#7C3AED', coverGradient: 'linear-gradient(135deg,#1F2937,#4C1D95)', coverArt: '/covers/s3.jpg', duration: 176, durationFormatted: '2:56', plays: 70000, likes: 12000, genre: 'Trap', mood: 'Dark', bpm: 142, isPublic: true, createdAt: '2026-06-24', tags: ['staffpick'] },
  { id: 's4', title: 'Velvet Heist', artist: 'Stageism', artistId: 'sp4', coverColor: '#06B6D4', coverGradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)', coverArt: '/covers/s4.jpg', duration: 203, durationFormatted: '3:23', plays: 39000, likes: 747, genre: 'Electronic', mood: 'Energetic', bpm: 126, isPublic: true, createdAt: '2026-06-25', tags: ['staffpick'] },
  { id: 's5', title: 'Ethereal Sun', artist: 'Rachel Claveau', artistId: 'sp5', coverColor: '#22C55E', coverGradient: 'linear-gradient(135deg,#22C55E,#0D9488)', coverArt: '/covers/s5.jpg', duration: 219, durationFormatted: '3:39', plays: 30000, likes: 927, genre: 'Soul', mood: 'Chill', bpm: 76, isPublic: true, createdAt: '2026-06-26', tags: ['staffpick'] },
  { id: 's6', title: 'Back to June', artist: 'grimeko', artistId: 'sp6', coverColor: '#EAB308', coverGradient: 'linear-gradient(135deg,#EAB308,#F28C28)', coverArt: '/covers/s6.jpg', duration: 187, durationFormatted: '3:07', plays: 28000, likes: 644, genre: 'Hip-Hop', mood: 'Melancholic', bpm: 88, isPublic: true, createdAt: '2026-06-27', tags: ['staffpick'] },
  { id: 's7', title: 'Lucid Dreaming', artist: 'Varletine', artistId: 'sp7', coverColor: '#A855F7', coverGradient: 'linear-gradient(135deg,#7C3AED,#EC4899)', coverArt: '/covers/s7.jpg', duration: 234, durationFormatted: '3:54', plays: 410000, likes: 72000, genre: 'Electronic', mood: 'Euphoric', bpm: 124, isPublic: true, createdAt: '2026-06-28', tags: ['staffpick'] },
];

// One cell of a ruled strip or grid. The parent draws the hairlines; the
// caller passes the width (rows) or the cell borders (grids).
function SongArtCard({ song, version, className = '' }: { song: Song; version?: string; className?: string }) {
  const { setCurrentSong, currentSong, isPlaying, likedIds, toggleLikedSong } = useAudioStore();
  const [hovered, setHovered] = useState(false);
  const isActive = currentSong?.id === song.id && isPlaying;
  const isCurrent = currentSong?.id === song.id;
  const isLiked = likedIds.includes(song.id);

  return (
    <div
      className={`group cursor-pointer bg-ink-0 p-2.5 sm:p-3 transition-colors hoverable:hover:bg-ink-1 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setCurrentSong(song)}
    >
      <div
        className="relative aspect-square overflow-hidden bg-ink-2"
        style={{ background: song.coverGradient }}
      >
        {song.coverArt && (
          <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hoverable:group-hover:scale-[1.03]" />
        )}
        {/* Overlay: controls on a bottom scrim */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end justify-between transition-opacity focus-within:opacity-100 ${hovered || isActive ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={e => { e.stopPropagation(); toggleLikedSong(song.id); }}
            aria-label="Like"
            aria-pressed={isLiked}
            className={`w-11 h-11 flex items-center justify-center transition-colors ${isLiked ? 'text-melaos-pink' : 'text-white hoverable:hover:text-melaos-pink'}`}>
            <Heart className="w-4 h-4" strokeWidth={1.75} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={e => e.stopPropagation()}
            aria-label={isActive ? 'Pause' : 'Play'}
            className="btn btn-primary !w-11 !min-h-[44px] !px-0">
            {isActive ? <Pause className="w-4 h-4 fill-current" strokeWidth={0} /> : <Play className="w-4 h-4 fill-current" strokeWidth={0} />}
          </button>
          <button onClick={e => e.stopPropagation()} aria-label="More" className="w-11 h-11 flex items-center justify-center text-white transition-colors hoverable:hover:text-melaos-orange">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
        {/* Version badge */}
        {version && (
          <div className="absolute top-2 left-2 rounded-xs bg-ink-0/80 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.14em] uppercase text-melaos-orange">
            {version}
          </div>
        )}
        {/* Playing indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 flex gap-0.5 items-end rounded-xs bg-ink-0/75 px-1.5 py-1">
            {[3,5,4,6,3].map((h, i) => (
              <div key={i} className="waveform-bar" style={{ height: `${h * 3}px`, backgroundColor: '#F28C28' }} />
            ))}
          </div>
        )}
      </div>
      <p className="mt-3 text-white text-[13px] sm:text-sm font-medium truncate">{song.title}</p>
      <p className="mt-0.5 text-fog text-xs truncate">{song.artist}</p>
      <p className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] text-fog-dim tabular-nums">
        <Play className="w-2.5 h-2.5 fill-current" strokeWidth={0} aria-hidden /> {formatPlays(song.plays)}
        <span className="text-fog-faint" aria-hidden>·</span>
        <Heart className="w-2.5 h-2.5" strokeWidth={1.75} aria-hidden /> {formatPlays(song.likes)}
      </p>
    </div>
  );
}

// Numbered row header: "01 — Title", hairline under it, optional action.
function RowHead({ index, title, action }: { index: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line-soft pb-4 mb-5 sm:mb-6">
      <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
        <span className="label tabular-nums shrink-0" aria-hidden>{index} —</span>
        <h2 className="display font-light text-white leading-tight text-[clamp(1.15rem,2.6vw,1.75rem)] min-w-0 break-words">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function HorizontalRow({ index, title, songs, seeAll }: { index: string; title: string; songs: any[]; seeAll?: string }) {
  return (
    <section className="mb-12 sm:mb-16">
      <RowHead
        index={index}
        title={title}
        action={seeAll && (
          <button className="btn btn-quiet !px-0 shrink-0">
            See all <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
      />
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto snap-x snap-mandatory scroll-px-4 md:scroll-px-0 scrollbar-hide">
        <div className="flex w-max gap-px bg-line-soft border border-line-soft empty:hidden">
          {songs.map(s => <SongArtCard key={s.id} song={s} className="snap-start shrink-0 w-[160px] sm:w-[176px] lg:w-[188px]" />)}
        </div>
      </div>
    </section>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('Trending');
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchInput, setSearchInput] = useState(queryParam);

  useEffect(() => { setSearchInput(queryParam); }, [queryParam]);

  const allCatalog = [...mockSongs, ...STAFF_PICKS];
  const searchResults = searchInput.trim()
    ? allCatalog.filter(s =>
        s.title.toLowerCase().includes(searchInput.trim().toLowerCase()) ||
        s.artist.toLowerCase().includes(searchInput.trim().toLowerCase())
      )
    : null;

  const filtered = mockSongs.filter(s => activeGenre === 'All' || s.genre === activeGenre);
  const sorted = activeTab === 'New'
    ? [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...filtered].sort((a, b) => b.plays - a.plays);

  const topRow = sorted.slice(0, 6);
  const newRow = [...mockSongs].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,6);

  return (
    <div className="mx-auto max-w-[1440px] px-safe md:px-8 pt-8 sm:pt-12 pb-16 sm:pb-24">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-line-soft pb-6 sm:pb-8">
        <div className="flex-1 min-w-[16rem]">
          <span className="block w-6 h-px bg-melaos-orange mb-5 sm:mb-6" aria-hidden />
          <h1 className="display font-light text-white leading-none text-[clamp(2.25rem,6vw,3.75rem)]">Explore</h1>
          <p className="mt-4 max-w-xl text-fog text-sm sm:text-base leading-relaxed">Discover the latest and trending music from Eclat Universe artists</p>
        </div>
        <a href="/studio"
          className="hidden sm:inline-flex btn btn-primary shrink-0">
          <Plus className="w-4 h-4" strokeWidth={1.75} /> Create
        </a>
      </header>

      {/* Inline search (mirrors navbar search, lets users refine on this page) */}
      <div className="relative max-w-md mt-6 sm:mt-8">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog-dim" strokeWidth={1.75} />
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search songs, artists..."
          className="field h-11 !py-0 pl-10 text-sm"
        />
      </div>

      {searchResults ? (
        <section className="mt-10 sm:mt-14">
          <RowHead
            index="01"
            title={searchResults.length > 0 ? `Results for "${searchInput}"` : `No results for "${searchInput}"`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-l border-t border-line-soft empty:hidden">
            {searchResults.map(song => <SongArtCard key={song.id} song={song} className="border-r border-b border-line-soft" />)}
          </div>
        </section>
      ) : (
      <div className="mt-10 sm:mt-14">
      {/* Staff Picks — always shown at top */}
      <HorizontalRow index="01" title="Staff Picks" songs={STAFF_PICKS} seeAll="#" />

      <div className="mb-12 sm:mb-16">
        {/* Tab bar */}
        <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex w-max min-w-full gap-6 sm:gap-8 border-b border-line-soft">
            {tabs.map(tab => {
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  aria-pressed={active}
                  className={`relative -mb-px h-11 min-w-touch font-mono text-[11px] tracking-[0.16em] uppercase whitespace-nowrap touch-manipulation transition-colors ${
                    active ? 'text-white' : 'text-fog hoverable:hover:text-white'
                  }`}>
                  {tab}
                  {active && <span className="absolute inset-x-0 bottom-0 h-px bg-melaos-orange" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre selector: a ruled strip; scrolls on phones and tablets, wraps on desktop */}
        <div className="mt-5 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto snap-x scroll-px-4 md:scroll-px-0 scrollbar-hide">
          <div className="flex w-max lg:w-auto lg:flex-wrap pl-px pt-px">
            {genres.map(genre => {
              const active = activeGenre === genre;
              return (
                <button key={genre} onClick={() => setActiveGenre(genre)}
                  aria-pressed={active}
                  className={`snap-start -ml-px -mt-px h-11 px-4 border font-mono text-[11px] tracking-[0.12em] uppercase whitespace-nowrap touch-manipulation transition-colors ${
                    active
                      ? 'relative z-[1] border-melaos-orange/70 bg-melaos-orange/10 text-melaos-orange'
                      : 'border-line bg-ink-0 text-fog hoverable:hover:bg-ink-1 hoverable:hover:text-white'
                  }`}>
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trending row */}
      <HorizontalRow index="02" title="Trending This Week" songs={topRow} seeAll="#" />

      {/* New releases */}
      <HorizontalRow index="03" title="Fresh Drops" songs={newRow} seeAll="#" />

      {/* Full grid */}
      <section>
        <RowHead index="04" title="All Tracks" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-l border-t border-line-soft empty:hidden">
          {sorted.map(song => <SongArtCard key={song.id} song={song} className="border-r border-b border-line-soft" />)}
        </div>
        {sorted.length === 0 && (
          <div className="border border-line-soft rule-grid py-20 px-6 text-center">
            <p className="text-fog text-base">No songs found in this genre yet.</p>
          </div>
        )}
      </section>
      </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  );
}
