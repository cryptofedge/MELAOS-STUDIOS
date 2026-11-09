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
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4 bg-black/75" onClick={onClose}>
      <div
        className="panel-raised m-auto w-full max-w-sm p-4 sm:p-5 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 pt-1.5 pl-1">
            <p className="display text-white text-lg leading-tight truncate">{song.title}</p>
            <p className="mt-1 text-fog text-xs">{song.genre} · Cover Art Generator</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="touch-target shrink-0 -mr-1 -mt-1 rounded-full bg-white/[0.06] text-fog transition-colors hoverable:hover:bg-white/[0.12] hoverable:hover:text-white">
            <X className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>

        {/* Art display */}
        {loading && (
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-3 flex flex-col items-center justify-center gap-4">
            <div className="brand-glow inset-10 opacity-40 animate-pulse" aria-hidden />
            <div className="relative w-10 h-10 rounded-full border-[3px] border-white/15 border-t-melaos-pink animate-spin" />
            <p className="relative text-sm font-semibold text-white/85">AI PAINTING...</p>
          </div>
        )}
        {artUrl && !loading && (
          <div className="relative group overflow-hidden rounded-2xl">
            <img src={artUrl} alt="Cover art" className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center gap-3 opacity-0 pointer-events-none transition-opacity hoverable:group-hover:opacity-100 hoverable:group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto">
              <a href={artUrl} download={`${song.title}-cover.jpg`} target="_blank" rel="noopener noreferrer"
                className="btn btn-white">
                <Download className="w-4 h-4" strokeWidth={2} /> Save
              </a>
            </div>
          </div>
        )}
        {artUrl && !loading && (
          <div className="flex justify-end -my-2">
            <ReportButton
              kind="cover-art"
              getContext={() => ({ title: song.title, genre: song.genre, coverPrompt: artPrompt })}
              className="btn btn-quiet !min-h-[44px] !px-3 text-xs hoverable:hover:!text-melaos-hot"
            />
          </div>
        )}
        {!artUrl && !loading && (
          <div onClick={generate}
            className="group aspect-square rounded-2xl border-2 border-dashed border-line-strong bg-white/[0.03] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors hoverable:hover:border-melaos-pink/60 hoverable:hover:bg-white/[0.05]">
            <span className="flex w-16 h-16 items-center justify-center rounded-full bg-white/[0.06] transition-colors hoverable:group-hover:bg-melaos-pink/15">
              <ImageIcon className="w-7 h-7 text-fog transition-colors hoverable:group-hover:text-[#ff7cc0]" strokeWidth={2} />
            </span>
            <p className="text-sm font-semibold text-fog transition-colors hoverable:group-hover:text-white">CLICK TO GENERATE</p>
          </div>
        )}
        {artError && !loading && (
          <p className="flex items-start gap-2.5 rounded-xl bg-melaos-hot/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-melaos-hot">
            <span className="mt-[7px] w-1.5 h-1.5 shrink-0 rounded-full bg-melaos-hot" aria-hidden />
            {artError}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={generate} disabled={loading}
            className="btn btn-primary flex-1 !min-h-[48px]">
            {loading ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Generating...</>
              : artUrl ? <><RefreshCw className="w-4 h-4" strokeWidth={2} /> Regenerate</> : 'Generate Cover Art'}
          </button>
          {artUrl && (
            <a href={artUrl} download={`${song.title}-cover.jpg`} target="_blank" rel="noopener noreferrer"
              aria-label="Save"
              className="btn btn-ghost !w-12 !min-h-[48px] !px-0">
              <Download className="w-[18px] h-[18px]" strokeWidth={2} />
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
    <div className="mx-auto max-w-[1280px] px-safe md:px-8 py-6 sm:py-8">
      {/* Header */}
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="display text-white leading-[1.05] text-3xl sm:text-4xl lg:text-5xl">Library</h1>
          <p className="mt-2 sm:mt-3 text-fog text-sm sm:text-base leading-relaxed">Your music, your history, your styles</p>
        </div>
        <a href="/studio"
          className="btn btn-primary shrink-0">
          <Plus className="w-4 h-4" strokeWidth={2} /> New Track
        </a>
      </header>

      {/* Tabs: a pill segmented control with the active tab a white pill.
          Phones get separate pills in a swipeable row (five won't fit joined). */}
      <div className="mt-6 sm:mt-8 mb-5 sm:mb-6 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto snap-x scroll-px-4 md:scroll-px-0 scrollbar-hide">
        <div className="flex w-max gap-2 sm:gap-1 sm:rounded-full sm:bg-ink-2 sm:p-1">
          {TABS.map(t => {
            const active = activeTab === t;
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                aria-pressed={active}
                className={`snap-start h-11 min-w-touch px-4 sm:px-5 rounded-full text-sm font-semibold whitespace-nowrap touch-manipulation transition-colors ${
                  active ? 'bg-white text-[#08080A]' : 'bg-ink-2 sm:bg-transparent text-fog hoverable:hover:text-white'
                }`}>
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SONGS / LIKED / HISTORY ── */}
      {(activeTab === 'Songs' || activeTab === 'Liked' || activeTab === 'History') && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fog-dim" strokeWidth={2} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search your library..."
                className="field !rounded-full h-11 !py-0 pl-10 pr-4 text-sm"
              />
            </div>
            <div className="relative shrink-0">
              <select value={sort} onChange={e => setSort(e.target.value)}
                aria-label="Sort"
                className="field !rounded-full h-11 !py-0 pl-4 pr-9 w-auto text-sm font-medium cursor-pointer">
                <option>Newest</option>
                <option>Popular</option>
                <option>A–Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" strokeWidth={2} />
            </div>
          </div>

          {/* Song list: rows with rounded covers; the playing row is lit */}
          <div className="-mx-2 sm:-mx-3 flex flex-col gap-0.5 empty:hidden">
            {displaySongs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id;
              const isActive = isCurrent && isPlaying;
              const isLiked = likedIds.includes(song.id);
              return (
              <div key={song.id}
                onClick={() => isCurrent ? setIsPlaying(!isPlaying) : setCurrentSong(song)}
                className={`group relative flex items-center gap-3 sm:gap-4 min-h-[64px] py-2 px-2 sm:px-3 rounded-card cursor-pointer transition-colors ${isCurrent ? 'bg-white/[0.07]' : 'hoverable:hover:bg-white/[0.04]'}`}>

                {/* Index / play */}
                <div className="w-6 flex justify-center shrink-0">
                  <span className={`text-[13px] font-semibold text-fog-dim tabular-nums ${isActive ? 'hidden' : 'hoverable:group-hover:hidden'}`}>{i + 1}</span>
                  {isActive
                    ? <Pause className="w-4 h-4 text-[#ff7cc0] fill-current block" strokeWidth={0} />
                    : <Play className="w-4 h-4 text-white fill-current hidden hoverable:group-hover:block" strokeWidth={0} />}
                </div>

                {/* Art */}
                <div className="w-12 h-12 shrink-0 relative overflow-hidden rounded-[10px] bg-ink-2"
                  style={{ background: song.coverGradient }}>
                  {song.coverArt && (
                    <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-0.5 right-0.5 rounded-[5px] bg-black/60 px-1 text-[9px] font-semibold leading-[14px] text-white tabular-nums">
                    {song.durationFormatted}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#ff7cc0]' : 'text-white'}`}>{song.title}</p>
                  <p className="mt-0.5 text-fog text-xs truncate">{song.artist} · {song.genre}</p>
                </div>

                {/* Tags — hidden on mobile */}
                <div className="hidden lg:flex gap-1.5 shrink-0">
                  {song.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-fog">{tag}</span>
                  ))}
                </div>

                {/* Stats */}
                <span className="hidden md:block w-24 shrink-0 text-right text-xs font-medium text-fog-dim tabular-nums">{formatPlays(song.plays)} plays</span>

                {/* Actions: on hover (mouse) or on the current row (touch) */}
                <div className={`items-center shrink-0 -mr-1 sm:mr-0 transition-opacity ${
                  isCurrent ? 'flex' : 'hidden hoverable:flex hoverable:opacity-0 hoverable:group-hover:opacity-100 hoverable:focus-within:opacity-100'
                }`}>
                  <button onClick={e => { e.stopPropagation(); toggleLikedSong(song.id); }}
                    aria-label="Like"
                    aria-pressed={isLiked}
                    className={`touch-target rounded-full transition-colors ${isLiked ? 'text-melaos-pink' : 'text-fog hoverable:hover:text-white hoverable:hover:bg-white/[0.08]'}`}>
                    <Heart className="w-[18px] h-[18px]" strokeWidth={2} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={e => e.stopPropagation()} aria-label="Share" className="touch-target rounded-full text-fog transition-colors hoverable:hover:text-white hoverable:hover:bg-white/[0.08]">
                    <Share2 className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setCoverArtSong(song); }}
                    className="touch-target rounded-full text-fog transition-colors hoverable:hover:text-white hoverable:hover:bg-white/[0.08]"
                    title="Generate cover art">
                    <ImageIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {displaySongs.length === 0 && (
            <div className="panel py-14 px-6 text-center">
              <span className="mx-auto mb-4 flex w-14 h-14 items-center justify-center rounded-full bg-white/[0.06]">
                <Music2 className="w-6 h-6 text-fog" strokeWidth={2} />
              </span>
              <p className="text-fog text-sm">No songs here yet.</p>
              <a href="/studio" className="btn btn-white mt-4">
                Create one <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </a>
            </div>
          )}
        </>
      )}

      {/* ── PLAYLISTS ── */}
      {activeTab === 'Playlists' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-7">
            {/* Create new */}
            <button className="group flex flex-col text-left">
              <span className="aspect-square w-full flex items-center justify-center rounded-2xl border-2 border-dashed border-line-strong bg-white/[0.03] transition-colors hoverable:group-hover:border-white/30 hoverable:group-hover:bg-white/[0.05]">
                <span className="flex w-14 h-14 items-center justify-center rounded-full bg-white/[0.08] text-white transition-transform hoverable:group-hover:scale-105">
                  <Plus className="w-6 h-6" strokeWidth={2} />
                </span>
              </span>
              <span className="mt-2.5 text-white text-sm font-semibold">New Playlist</span>
            </button>
            {myPlaylists.map(p => (
              <div key={p.id} className="group cursor-pointer">
                <div className="aspect-square relative overflow-hidden rounded-2xl"
                  style={{ background: p.gradient }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <ListMusic className="absolute inset-0 m-auto w-10 h-10 text-white/85 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" strokeWidth={2} />
                  <span className="absolute bottom-2.5 right-2.5 btn btn-primary !w-11 !min-h-[44px] !px-0 shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-opacity hoverable:opacity-0 hoverable:group-hover:opacity-100" aria-hidden>
                    <Play className="w-4 h-4 fill-current" strokeWidth={0} />
                  </span>
                </div>
                <p className="mt-2.5 text-white text-sm font-semibold truncate">{p.name}</p>
                <p className="mt-0.5 text-fog text-xs tabular-nums">{p.count} tracks</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      {activeTab === 'Styles' && (
        <div>
          <p className="text-fog text-sm mb-4">Your saved style tags — click to use in your next generation.</p>
          <div className="flex flex-wrap gap-2">
            {myStyles.map(s => (
              <div key={s.tag}
                className="group chip !min-h-[44px] !pl-3.5 !pr-1.5 !text-sm cursor-pointer">
                <Tag className="w-3.5 h-3.5 shrink-0 text-fog transition-colors hoverable:group-hover:text-[#ff7cc0]" strokeWidth={2} />
                <span className="min-w-0 truncate">{s.tag}</span>
                <span className="ml-0.5 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-fog tabular-nums">×{s.uses}</span>
              </div>
            ))}
            <button className="chip !min-h-[44px] !px-4 !text-sm border-dashed !border-line-strong text-fog hoverable:hover:text-white">
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Add Style</span>
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
