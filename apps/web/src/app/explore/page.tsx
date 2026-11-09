'use client';
import { useState, useEffect, Suspense, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Pause, Heart, MoreHorizontal, Search, Plus } from 'lucide-react';
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

// A square rounded cover with the title, artist and play count under it.
// Used in the carousels (the caller passes the width) and in the grids.
// `rank` puts a "#1"-style chart tag on the cover.
function SongArtCard({ song, version, rank, className = '' }: { song: Song; version?: string; rank?: number; className?: string }) {
  const { setCurrentSong, setIsPlaying, currentSong, isPlaying, likedIds, toggleLikedSong } = useAudioStore();
  const [hovered, setHovered] = useState(false);
  const isActive = currentSong?.id === song.id && isPlaying;
  const isCurrent = currentSong?.id === song.id;
  const isLiked = likedIds.includes(song.id);

  // Tapping the card plays it (or resumes it if it's the paused current song,
  // instead of restarting it). The round button toggles play/pause.
  const playCard = () => (isCurrent ? setIsPlaying(true) : setCurrentSong(song));
  const togglePlay = () => (isCurrent ? setIsPlaying(!isPlaying) : setCurrentSong(song));

  return (
    <div
      className={`group cursor-pointer ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={playCard}
    >
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-ink-2"
        style={{ background: song.coverGradient }}
      >
        {song.coverArt && (
          <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hoverable:group-hover:scale-[1.04]" />
        )}
        {/* Overlay: controls on a bottom scrim */}
        <div className={`absolute inset-0 flex items-end justify-between p-1 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity focus-within:opacity-100 ${hovered || isActive ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={e => { e.stopPropagation(); toggleLikedSong(song.id); }}
            aria-label="Like"
            aria-pressed={isLiked}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isLiked ? 'text-melaos-pink' : 'text-white hoverable:hover:text-melaos-pink'}`}>
            <Heart className="w-[18px] h-[18px]" strokeWidth={2} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); togglePlay(); }}
            aria-label={isActive ? 'Pause' : 'Play'}
            className="btn btn-primary !w-11 !min-h-[44px] !px-0 shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
            {isActive ? <Pause className="w-4 h-4 fill-current" strokeWidth={0} /> : <Play className="w-4 h-4 fill-current" strokeWidth={0} />}
          </button>
          <button onClick={e => e.stopPropagation()} aria-label="More" className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors hoverable:hover:bg-white/10">
            <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>
        {/* Chart rank and version tags */}
        {(!!rank || !!version) && (
          <div className="absolute top-2 left-2 flex gap-1">
            {!!rank && <span className="tag tag-white tabular-nums">#{rank}</span>}
            {version && <span className="tag bg-black/60 text-[#ffb26b]">{version}</span>}
          </div>
        )}
        {/* Playing indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 flex gap-0.5 items-end rounded-full bg-black/60 px-2 py-1.5">
            {[3,5,4,6,3].map((h, i) => (
              <div key={i} className="waveform-bar" style={{ height: `${h * 3}px`, backgroundColor: '#F28C28' }} />
            ))}
          </div>
        )}
      </div>
      <p className={`mt-2.5 text-[13px] sm:text-sm font-semibold truncate transition-colors ${isCurrent ? 'text-[#ff7cc0]' : 'text-white'}`}>{song.title}</p>
      <p className="mt-0.5 text-fog text-xs truncate">{song.artist}</p>
      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-fog-dim tabular-nums">
        <Play className="w-3 h-3 fill-current" strokeWidth={0} aria-hidden /> {formatPlays(song.plays)}
        <span className="mx-0.5" aria-hidden>·</span>
        <Heart className="w-3 h-3" strokeWidth={2} aria-hidden /> {formatPlays(song.likes)}
      </p>
    </div>
  );
}

// Section header: bold title, optional pill action on the right.
function RowHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
      <h2 className="display text-white text-xl sm:text-2xl leading-tight min-w-0 break-words">{title}</h2>
      {action}
    </div>
  );
}

function HorizontalRow({ title, songs, seeAll, ranked = false }: { title: string; songs: any[]; seeAll?: string; ranked?: boolean }) {
  return (
    <section>
      <RowHead
        title={title}
        action={seeAll && (
          // A 34px pill; the ::after strip makes the tap target 44px tall.
          <button className="btn btn-ghost !min-h-[34px] !px-3.5 text-xs shrink-0 relative after:absolute after:inset-x-0 after:-inset-y-[5px]">
            See all
          </button>
        )}
      />
      <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x scrollbar-hide scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 md:scroll-px-0 empty:hidden">
        {songs.map((s, i) => (
          <SongArtCard
            key={s.id}
            song={s}
            rank={ranked ? i + 1 : undefined}
            className="snap-start shrink-0 w-[148px] xs:w-[156px] sm:w-[176px] lg:w-[192px]"
          />
        ))}
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

  // Grid of covers (search results, All Tracks).
  const gridClass = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-7 empty:hidden';

  return (
    <div className="mx-auto max-w-[1280px] px-safe md:px-8 py-6 sm:py-8">
      {/* Page header, over a soft brand glow */}
      <header className="relative">
        <div className="brand-glow -top-20 inset-x-0 h-[240px] sm:h-[280px] opacity-40" aria-hidden />
        <div className="relative flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="display text-white leading-[1.05] text-3xl sm:text-4xl lg:text-5xl">Explore</h1>
            <p className="mt-2 sm:mt-3 max-w-xl text-fog text-sm sm:text-base leading-relaxed">Discover the latest and trending music from Eclat Universe artists</p>
          </div>
          <a href="/studio"
            className="hidden sm:inline-flex btn btn-primary shrink-0">
            <Plus className="w-4 h-4" strokeWidth={2} /> Create
          </a>
        </div>

        {/* Inline search (mirrors navbar search, lets users refine on this page) */}
        <div className="relative max-w-xl mt-5 sm:mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-fog-dim" strokeWidth={2} />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search songs, artists..."
            className="field !rounded-full h-12 !py-0 pl-11 pr-5 text-[15px]"
          />
        </div>
      </header>

      {searchResults ? (
        <section className="mt-8 sm:mt-10">
          <RowHead
            title={searchResults.length > 0 ? `Results for "${searchInput}"` : `No results for "${searchInput}"`}
          />
          <div className={gridClass}>
            {searchResults.map(song => <SongArtCard key={song.id} song={song} />)}
          </div>
        </section>
      ) : (
      <div className="mt-8 sm:mt-10 space-y-10 sm:space-y-12">
      {/* Staff Picks — always shown at top */}
      <HorizontalRow title="Staff Picks" songs={STAFF_PICKS} seeAll="#" />

      <div>
        {/* Tab bar: pill segmented control (full width on phones) */}
        <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex w-full sm:w-max gap-1 rounded-full bg-ink-2 p-1">
            {tabs.map(tab => {
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  aria-pressed={active}
                  className={`flex-1 sm:flex-none h-11 min-w-touch px-2 sm:px-5 rounded-full text-sm font-semibold whitespace-nowrap touch-manipulation transition-colors ${
                    active ? 'bg-white text-[#08080A]' : 'text-fog hoverable:hover:text-white'
                  }`}>
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre chips: scroll on phones and tablets, wrap on desktop.
            Each chip is 36px; its ::after strip makes the tap target 44px. */}
        <div className="mt-3 -mx-4 px-4 md:-mx-1 md:px-1 py-1 overflow-x-auto snap-x scroll-px-4 md:scroll-px-1 scrollbar-hide">
          <div className="flex w-max lg:w-auto lg:flex-wrap gap-2">
            {genres.map(genre => {
              const active = activeGenre === genre;
              return (
                <button key={genre} onClick={() => setActiveGenre(genre)}
                  aria-pressed={active}
                  className={`chip ${active ? 'chip-on' : ''} relative snap-start shrink-0 touch-manipulation after:absolute after:inset-x-0 after:-inset-y-1`}>
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trending row: a chart, so each cover gets its rank */}
      <HorizontalRow title="Trending This Week" songs={topRow} seeAll="#" ranked />

      {/* New releases */}
      <HorizontalRow title="Fresh Drops" songs={newRow} seeAll="#" />

      {/* Full grid */}
      <section>
        <RowHead title="All Tracks" />
        <div className={gridClass}>
          {sorted.map(song => <SongArtCard key={song.id} song={song} />)}
        </div>
        {sorted.length === 0 && (
          <div className="panel py-16 px-6 text-center">
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
