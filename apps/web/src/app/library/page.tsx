'use client';
import { useState } from 'react';
import { Play, Heart, Share2, MoreHorizontal, Search, SlidersHorizontal, Plus, Clock, Music2, ListMusic, Mic2, Tag } from 'lucide-react';
import { mockSongs, formatPlays } from '@/lib/mockData';

const TABS = ['Songs', 'Playlists', 'Liked', 'History', 'Styles'];

const myPlaylists = [
  { id: 'p1', name: 'Late Night Vibes', count: 12, gradient: 'linear-gradient(135deg,#3B82F6,#7C3AED)' },
  { id: 'p2', name: 'Trap Essentials', count: 8, gradient: 'linear-gradient(135deg,#1F2937,#4C1D95)' },
  { id: 'p3', name: 'Afrobeats Energy', count: 15, gradient: 'linear-gradient(135deg,#F28C28,#E91E8C)' },
  { id: 'p4', name: 'Chill R&B Sessions', count: 6, gradient: 'linear-gradient(135deg,#7C3AED,#EC4899)' },
];

const myStyles = [
  { tag: 'dark trap', uses: 14 }, { tag: 'melodic drill', uses: 9 }, { tag: '808 bass heavy', uses: 22 },
  { tag: 'afrobeats uptempo', uses: 7 }, { tag: 'lo-fi hip hop', uses: 11 }, { tag: 'cinematic orchestral', uses: 4 },
  { tag: 'female rnb vocals', uses: 8 }, { tag: 'hard hitting kicks', uses: 17 }, { tag: 'piano melody', uses: 13 },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Songs');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Newest');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(['2', '3', '6']));

  const toggleLike = (id: string) => {
    setLikedIds(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = mockSongs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sort === 'Newest'
    ? [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : sort === 'Popular'
    ? [...filtered].sort((a, b) => b.plays - a.plays)
    : filtered;

  const liked = sorted.filter(s => likedIds.has(s.id));

  const displaySongs = activeTab === 'Liked' ? liked : sorted;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Library</h1>
          <p className="text-gray-500 text-sm mt-1">Your music, your history, your styles</p>
        </div>
        <a href="/studio"
          className="flex items-center gap-2 btn-orange text-white text-sm font-semibold px-4 py-2 rounded-full hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> New Track
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1A1A1A] mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ minHeight: '44px', touchAction: 'manipulation' }}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === t ? 'border-[#F28C28] text-[#F28C28]' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── SONGS / LIKED / HISTORY ── */}
      {(activeTab === 'Songs' || activeTab === 'Liked' || activeTab === 'History') && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search your library..."
                style={{ fontSize: '16px' }}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2 pl-9 pr-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#F28C28] transition-colors"
              />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-[#1A1A1A] border border-[#333] text-gray-400 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#F28C28]">
              <option>Newest</option>
              <option>Popular</option>
              <option>A–Z</option>
            </select>
          </div>

          {/* Song list */}
          <div className="space-y-1">
            {displaySongs.map((song, i) => (
              <div key={song.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                {/* Index / play */}
                <div className="w-6 text-center shrink-0">
                  <span className="text-gray-600 text-xs group-hover:hidden">{i + 1}</span>
                  <Play className="w-3.5 h-3.5 text-white hidden group-hover:block" />
                </div>

                {/* Art */}
                <div className="w-10 h-10 rounded-lg shrink-0 relative overflow-hidden"
                  style={{ background: song.coverGradient }}>
                  <span className="absolute bottom-0.5 right-1 text-white text-[9px] font-bold opacity-80">
                    {song.durationFormatted}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                  <p className="text-gray-500 text-xs truncate">{song.artist} · {song.genre}</p>
                </div>

                {/* Tags — hidden on mobile */}
                <div className="hidden lg:flex gap-1">
                  {song.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-[#222] text-gray-500 text-xs rounded-full">{tag}</span>
                  ))}
                </div>

                {/* Stats */}
                <span className="hidden md:block text-gray-600 text-xs w-14 text-right">{formatPlays(song.plays)} plays</span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleLike(song.id)}
                    className={`p-2 rounded-full transition-colors ${likedIds.has(song.id) ? 'text-[#E91E8C]' : 'text-gray-600 hover:text-gray-400'}`}>
                    <Heart className="w-3.5 h-3.5" fill={likedIds.has(song.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-400 rounded-full transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-400 rounded-full transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {displaySongs.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Music2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No songs here yet. <a href="/studio" className="text-[#F28C28] hover:underline">Create one →</a></p>
            </div>
          )}
        </>
      )}

      {/* ── PLAYLISTS ── */}
      {activeTab === 'Playlists' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Create new */}
            <button className="aspect-square rounded-2xl border-2 border-dashed border-[#333] flex flex-col items-center justify-center gap-2 text-gray-600 hover:border-[#F28C28] hover:text-[#F28C28] transition-colors">
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">New Playlist</span>
            </button>
            {myPlaylists.map(p => (
              <div key={p.id} className="group cursor-pointer">
                <div className="aspect-square rounded-2xl relative overflow-hidden mb-2"
                  style={{ background: p.gradient }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <ListMusic className="w-5 h-5 text-white/70" />
                  </div>
                </div>
                <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.count} tracks</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      {activeTab === 'Styles' && (
        <div>
          <p className="text-gray-500 text-sm mb-5">Your saved style tags — click to use in your next generation.</p>
          <div className="flex flex-wrap gap-3">
            {myStyles.map(s => (
              <div key={s.tag}
                className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333] rounded-full px-4 py-2 hover:border-[#F28C28] cursor-pointer group transition-colors">
                <Tag className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#F28C28]" />
                <span className="text-gray-300 text-sm group-hover:text-white">{s.tag}</span>
                <span className="text-gray-600 text-xs">×{s.uses}</span>
              </div>
            ))}
            <button className="flex items-center gap-2 border-2 border-dashed border-[#333] rounded-full px-4 py-2 text-gray-600 hover:border-[#F28C28] hover:text-[#F28C28] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span className="text-sm">Add Style</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
