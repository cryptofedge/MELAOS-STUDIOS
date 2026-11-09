'use client';
import { useState, useCallback } from 'react';
import { Play, Pause, Heart, Share2, Search, Plus, Music2, ListMusic, Tag, X, Download, RefreshCw, Image as ImageIcon, ChevronDown, ArrowRight } from 'lucide-react';
import { mockSongs, formatPlays, mockPlaylists } from '@/lib/mockData';
import { useAudioStore } from '@/lib/store';
import { genreArtStyle } from '@/lib/genreProfiles';
import ReportButton from '@/components/ReportButton';

/* ── Cover Art Modal ─────────────────────────────────────── */
function CoverArtModal({ song, onClose }: { song: { title: string; genre: string; tags: string[] }; onClose: () => void }) {
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [artError, setArtError] = useState<string | null>(null);

  const style = genreArtStyle(song.genre);
  const tags = song.tags.slice(0, 3).join(', ');
  const artPrompt = `album cover art for "${song.title}", ${style}, ${tags}, professional music artwork, square format, no text, no words`;

  const generate = useCallback(async () => {
    setLoading(true);
    setArtUrl(null);
    setArtError(null);
    // POST to our own API, which returns the image as a data URL. The API
    // has no GET, so a generation can never be triggered by a plain link.
    try {
      const res = await fetch('/api/cover-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: artPrompt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.imageUrl) throw new Error(data.error || 'Image generation failed');
      setArtUrl(data.imageUrl);
    } catch (err: any) {
      setArtError(err?.message || 'Image generation failed');
    } finally {
      setLoading(false);
    }
  }, [artPrompt]);

  return (
    // The backdrop scrolls (and the panel centres with m-auto), so the panel
    // stays reachable on short screens such as phones in landscape.
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4 bg-black/80" onClick={onClose}>
      <div
        className="hud panel m-auto w-full max-w-sm p-5 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 pt-1">
            <p className="text-white font-medium text-sm truncate">{song.title}</p>
            <p className="mt-1.5 label">{song.genre} · Cover Art Generator</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="touch-target -mr-3 -mt-2 text-fog transition-colors hoverable:hover:text-white">
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Art display */}
        {loading && (
          <div className="aspect-square border border-line bg-ink-0 rule-grid flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border border-melaos-orange border-t-transparent rounded-full animate-spin" />
            <p className="label">AI PAINTING...</p>
          </div>
        )}
        {artUrl && !loading && (
          <div className="relative group">
            <img src={artUrl} alt="Cover art" className="w-full aspect-square object-cover border border-line" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 pointer-events-none transition-opacity hoverable:group-hover:opacity-100 hoverable:group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto">
              <a href={artUrl} download={`${song.title}-cover.jpg`} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary">
                <Download className="w-4 h-4" strokeWidth={1.75} /> Save
              </a>
            </div>
          </div>
        )}
        {artUrl && !loading && (
          <div className="flex justify-end">
            <ReportButton
              kind="cover-art"
              getContext={() => ({ title: song.title, genre: song.genre, coverPrompt: artPrompt })}
              className="label inline-flex items-center gap-1.5 min-h-[44px] transition-colors hoverable:hover:text-melaos-hot"
            />
          </div>
        )}
        {!artUrl && !loading && (
          <div onClick={generate}
            className="group aspect-square border border-dashed border-line-strong rule-grid flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors hoverable:hover:border-melaos-orange/60">
            <ImageIcon className="w-9 h-9 text-fog-faint transition-colors hoverable:group-hover:text-melaos-orange" strokeWidth={1.5} />
            <p className="label transition-colors hoverable:group-hover:text-melaos-orange">CLICK TO GENERATE</p>
          </div>
        )}
        {artError && !loading && (
          <p className="flex items-start gap-2 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-melaos-hot">
            <span className="mt-[5px] w-1.5 h-1.5 shrink-0 rotate-45 bg-melaos-hot" aria-hidden />
            {artError}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={generate} disabled={loading}
            className="btn btn-primary flex-1">
            {loading ? <><span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /> Generating...</>
              : artUrl ? <><RefreshCw className="w-4 h-4" strokeWidth={1.75} /> Regenerate</> : 'Generate Cover Art'}
          </button>
          {artUrl && (
            <a href={artUrl} download={`${song.title}-cover.jpg`} target="_blank" rel="noopener noreferrer"
              aria-label="Save"
              className="btn btn-ghost !px-3.5">
              <Download className="w-4 h-4" strokeWidth={1.75} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const TABS = ['Songs', 'Playlists', 'Liked', 'History', 'Styles'];

const myPlaylists = mockPlaylists;

const myStyles = [
  { tag: 'dark trap', uses: 14 }, { tag: 'melodic drill', uses: 9 }, { tag: '808 bass heavy', uses: 22 },
  { tag: 'afrobeats uptempo', uses: 7 }, { tag: 'lo-fi hip hop', uses: 11 }, { tag: 'cinematic orchestral', uses: 4 },
  { tag: 'female rnb vocals', uses: 8 }, { tag: 'hard hitting kicks', uses: 17 }, { tag: 'piano melody', uses: 13 },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Songs');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Newest');
  const [coverArtSong, setCoverArtSong] = useState<typeof mockSongs[number] | null>(null);
  const { setCurrentSong, currentSong, isPlaying, setIsPlaying, likedIds, toggleLikedSong } = useAudioStore();

  const filtered = mockSongs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sort === 'Newest'
    ? [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : sort === 'Popular'
    ? [...filtered].sort((a, b) => b.plays - a.plays)
    : filtered;

  const liked = sorted.filter(s => likedIds.includes(s.id));

  const displaySongs = activeTab === 'Liked' ? liked : sorted;

  return (
    <div className="mx-auto max-w-[1440px] px-safe md:px-8 pt-8 sm:pt-12 pb-16 sm:pb-24">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="flex-1 min-w-[16rem]">
          <span className="block w-6 h-px bg-melaos-orange mb-5 sm:mb-6" aria-hidden />
          <h1 className="display font-light text-white leading-none text-[clamp(2.25rem,6vw,3.75rem)]">Library</h1>
          <p className="mt-4 text-fog text-sm sm:text-base leading-relaxed">Your music, your history, your styles</p>
        </div>
        <a href="/studio"
          className="btn btn-primary shrink-0">
          <Plus className="w-4 h-4" strokeWidth={1.75} /> New Track
        </a>
      </header>

      {/* Tabs: the header's rule, with the active tab marked in orange */}
      <div className="mt-8 sm:mt-10 mb-6 sm:mb-8 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex w-max min-w-full gap-6 sm:gap-8 border-b border-line-soft">
          {TABS.map(t => {
            const active = activeTab === t;
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                aria-pressed={active}
                className={`relative -mb-px h-11 min-w-touch font-mono text-[11px] tracking-[0.16em] uppercase whitespace-nowrap touch-manipulation transition-colors ${
                  active ? 'text-white' : 'text-fog hoverable:hover:text-white'
                }`}>
                {t}
                {active && <span className="absolute inset-x-0 bottom-0 h-px bg-melaos-orange" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SONGS / LIKED / HISTORY ── */}
      {(activeTab === 'Songs' || activeTab === 'Liked' || activeTab === 'History') && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fog-dim" strokeWidth={1.75} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search your library..."
                className="field h-11 !py-0 pl-9 text-sm"
              />
            </div>
            <div className="relative shrink-0">
              <select value={sort} onChange={e => setSort(e.target.value)}
                aria-label="Sort"
                className="field h-11 !py-0 pl-3 pr-9 w-auto text-sm cursor-pointer">
                <option>Newest</option>
                <option>Popular</option>
                <option>A–Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fog-dim" strokeWidth={1.75} />
            </div>
          </div>

          {/* Song list: a ruled table */}
          <div className="border-y border-line-soft divide-y divide-line-soft empty:hidden">
            {displaySongs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id;
              const isActive = isCurrent && isPlaying;
              const isLiked = likedIds.includes(song.id);
              return (
              <div key={song.id}
                onClick={() => isCurrent ? setIsPlaying(!isPlaying) : setCurrentSong(song)}
                className={`group relative flex items-center gap-3 sm:gap-4 min-h-[64px] py-2.5 px-1.5 sm:px-3 cursor-pointer transition-colors ${isCurrent ? 'bg-ink-2' : 'hoverable:hover:bg-ink-1'}`}>
                {isCurrent && <span className="absolute inset-y-0 left-0 w-px bg-melaos-orange" aria-hidden />}

                {/* Index / play */}
                <div className="w-6 flex justify-center shrink-0">
                  <span className={`font-mono text-[11px] text-fog-dim tabular-nums ${isActive ? 'hidden' : 'hoverable:group-hover:hidden'}`}>{String(i + 1).padStart(2, '0')}</span>
                  {isActive
                    ? <Pause className="w-3.5 h-3.5 text-melaos-orange block" strokeWidth={1.75} />
                    : <Play className="w-3.5 h-3.5 text-white hidden hoverable:group-hover:block" strokeWidth={1.75} />}
                </div>

                {/* Art */}
                <div className="w-11 h-11 shrink-0 relative overflow-hidden bg-ink-2"
                  style={{ background: song.coverGradient }}>
                  {song.coverArt && (
                    <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-0 right-0 bg-black/65 px-[3px] font-mono text-[9px] leading-[13px] text-white/90 tabular-nums">
                    {song.durationFormatted}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{song.title}</p>
                  <p className="mt-0.5 text-fog text-xs truncate">{song.artist} · {song.genre}</p>
                </div>

                {/* Tags — hidden on mobile */}
                <div className="hidden lg:flex gap-1.5 shrink-0">
                  {song.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="rounded-xs border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-fog-dim">{tag}</span>
                  ))}
                </div>

                {/* Stats */}
                <span className="hidden md:block w-24 shrink-0 text-right label tabular-nums">{formatPlays(song.plays)} plays</span>

                {/* Actions: on hover (mouse) or on the current row (touch) */}
                <div className={`items-center shrink-0 -mr-1.5 sm:mr-0 transition-opacity ${
                  isCurrent ? 'flex' : 'hidden hoverable:flex hoverable:opacity-0 hoverable:group-hover:opacity-100 hoverable:focus-within:opacity-100'
                }`}>
                  <button onClick={e => { e.stopPropagation(); toggleLikedSong(song.id); }}
                    aria-label="Like"
                    aria-pressed={isLiked}
                    className={`touch-target transition-colors ${isLiked ? 'text-melaos-pink' : 'text-fog-dim hoverable:hover:text-white'}`}>
                    <Heart className="w-4 h-4" strokeWidth={1.75} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={e => e.stopPropagation()} aria-label="Share" className="touch-target text-fog-dim transition-colors hoverable:hover:text-white">
                    <Share2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setCoverArtSong(song); }}
                    className="touch-target text-fog-dim transition-colors hoverable:hover:text-melaos-orange"
                    title="Generate cover art">
                    <ImageIcon className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {displaySongs.length === 0 && (
            <div className="border border-line-soft rule-grid py-16 px-6 text-center">
              <Music2 className="w-10 h-10 mx-auto mb-4 text-fog-faint" strokeWidth={1.5} />
              <p className="text-fog text-sm">
                No songs here yet.{' '}
                <a href="/studio" className="inline-flex items-center gap-1 min-h-[44px] text-melaos-orange hoverable:hover:underline underline-offset-4">
                  Create one <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </a>
              </p>
            </div>
          )}
        </>
      )}

      {/* ── PLAYLISTS ── */}
      {activeTab === 'Playlists' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 border-l border-t border-line-soft">
            {/* Create new */}
            <button className="group flex flex-col bg-ink-0 p-2.5 sm:p-3 border-r border-b border-line-soft text-fog-dim transition-colors hoverable:hover:bg-ink-1 hoverable:hover:text-melaos-orange">
              <span className="flex-1 w-full min-h-[8rem] flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong transition-colors hoverable:group-hover:border-melaos-orange/70">
                <Plus className="w-6 h-6" strokeWidth={1.5} />
                <span className="label text-inherit">New Playlist</span>
              </span>
            </button>
            {myPlaylists.map(p => (
              <div key={p.id} className="group cursor-pointer bg-ink-0 p-2.5 sm:p-3 border-r border-b border-line-soft transition-colors hoverable:hover:bg-ink-1">
                <div className="aspect-square relative overflow-hidden"
                  style={{ background: p.gradient }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 right-2.5 btn btn-primary !min-h-[40px] !px-3.5 transition-opacity hoverable:opacity-0 hoverable:group-hover:opacity-100" aria-hidden>
                    <Play className="w-4 h-4 fill-current" strokeWidth={0} />
                  </span>
                  <div className="absolute bottom-3 left-3">
                    <ListMusic className="w-5 h-5 text-white/75" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="mt-3 text-white text-sm font-medium truncate">{p.name}</p>
                <p className="mt-1 label tabular-nums">{p.count} tracks</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      {activeTab === 'Styles' && (
        <div>
          <p className="text-fog text-sm mb-5">Your saved style tags — click to use in your next generation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-line-soft">
            {myStyles.map(s => (
              <div key={s.tag}
                className="group flex items-center gap-3 min-h-[52px] px-4 bg-ink-0 border-r border-b border-line-soft cursor-pointer transition-colors hoverable:hover:bg-ink-1">
                <Tag className="w-3.5 h-3.5 shrink-0 text-fog-dim transition-colors hoverable:group-hover:text-melaos-orange" strokeWidth={1.75} />
                <span className="flex-1 min-w-0 truncate text-[#ECECF1] text-sm hoverable:group-hover:text-white">{s.tag}</span>
                <span className="font-mono text-[11px] text-fog-dim tabular-nums">×{s.uses}</span>
              </div>
            ))}
            <button className="flex items-center gap-3 min-h-[52px] px-4 bg-ink-0 border-r border-b border-line-soft text-fog-dim transition-colors hoverable:hover:bg-ink-1 hoverable:hover:text-melaos-orange">
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="text-sm">Add Style</span>
            </button>
          </div>
        </div>
      )}

      {/* Cover Art Modal */}
      {coverArtSong && (
        <CoverArtModal song={coverArtSong} onClose={() => setCoverArtSong(null)} />
      )}
    </div>
  );
}
