'use client';
import { useState } from 'react';
import { Play, Heart, MoreHorizontal, ChevronRight } from 'lucide-react';
import { mockSongs, formatPlays } from '@/lib/mockData';

const tabs = ['Trending', 'New', 'Following', 'Genres'];
const genres = ['All', 'Hip-Hop', 'R&B', 'Afrobeats', 'Pop', 'Electronic', 'Drill', 'Soul', 'Trap'];

const STAFF_PICKS = [
  { id: 's1', title: 'My Vision', artist: 'Luna World', version: 'v5.5', plays: '150K', likes: '2.2K', gradient: 'linear-gradient(135deg,#E91E8C,#7C3AED)' },
  { id: 's2', title: 'Secret Fantasy', artist: 'Alfie', version: 'v5.5', plays: '74K', likes: '12K', gradient: 'linear-gradient(135deg,#F28C28,#E91E8C)' },
  { id: 's3', title: 'BIZARRE', artist: 'MOSTER', version: 'v5.5', plays: '70K', likes: '12K', gradient: 'linear-gradient(135deg,#1F2937,#4C1D95)' },
  { id: 's4', title: 'Velvet Heist', artist: 'Stageism', version: 'v5.5', plays: '39K', likes: '747', gradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
  { id: 's5', title: 'Ethereal Sun', artist: 'Rachel Claveau', version: 'v5.5', plays: '30K', likes: '927', gradient: 'linear-gradient(135deg,#22C55E,#0D9488)' },
  { id: 's6', title: 'Back to June', artist: 'grimeko', version: 'v5.5', plays: '28K', likes: '644', gradient: 'linear-gradient(135deg,#EAB308,#F28C28)' },
  { id: 's7', title: 'Lucid Dreaming', artist: 'Varletine', version: 'v5.5', plays: '410K', likes: '72K', gradient: 'linear-gradient(135deg,#7C3AED,#EC4899)' },
];

function SongArtCard({ song, size = 'md' }: { song: any; size?: 'lg' | 'md' }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer shrink-0"
      style={{ width: size === 'lg' ? 180 : 150 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="rounded-2xl relative overflow-hidden mb-2"
        style={{ aspectRatio: '1', background: song.gradient || song.coverGradient }}
      >
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-end justify-between p-2 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => setLiked(l => !l)}
            className={`p-1.5 rounded-full bg-black/40 transition-colors ${liked ? 'text-[#E91E8C]' : 'text-white'}`}>
            <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button className="p-1.5 rounded-full bg-white text-black hover:scale-110 transition-transform">
            <Play className="w-3.5 h-3.5 ml-0.5" />
          </button>
          <button className="p-1.5 rounded-full bg-black/40 text-white">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Version badge */}
        {song.version && (
          <div className="absolute top-2 left-2 bg-black/60 text-[#F28C28] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {song.version}
          </div>
        )}
      </div>
      <p className="text-white text-xs font-semibold truncate">{song.title}</p>
      <p className="text-gray-500 text-xs truncate">{song.artist}</p>
      {song.plays && (
        <p className="text-gray-600 text-[10px] mt-0.5">▶ {song.plays} · ♥ {song.likes}</p>
      )}
    </div>
  );
}

function HorizontalRow({ title, songs, seeAll }: { title: string; songs: any[]; seeAll?: string }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        {seeAll && (
          <button className="text-gray-500 hover:text-white text-sm flex items-center gap-1 transition-colors">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {songs.map(s => <SongArtCard key={s.id} song={s} />)}
      </div>
    </section>
  );
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('Trending');
  const [activeGenre, setActiveGenre] = useState('All');

  const filtered = mockSongs.filter(s => activeGenre === 'All' || s.genre === activeGenre);
  const sorted = activeTab === 'New'
    ? [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...filtered].sort((a, b) => b.plays - a.plays);

  const topRow = sorted.slice(0, 6);
  const newRow = [...mockSongs].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">Explore</h1>
        <p className="text-gray-500 text-sm sm:text-base">Discover the latest and trending music from Eclat Universe artists</p>
      </div>

      {/* Staff Picks — always shown at top */}
      <HorizontalRow title="⭐ Staff Picks" songs={STAFF_PICKS} seeAll="#" />

      {/* Tab bar */}
      <div className="overflow-x-auto scrollbar-hide mb-6 border-b border-[#1A1A1A] pb-4">
        <div className="flex gap-2 whitespace-nowrap">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ minHeight: '44px', touchAction: 'manipulation' }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-[#F28C28] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A]'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Genre pills */}
      <div className="overflow-x-auto scrollbar-hide mb-8 pb-2">
        <div className="flex gap-2 whitespace-nowrap">
          {genres.map(genre => (
            <button key={genre} onClick={() => setActiveGenre(genre)}
              style={{ minHeight: '44px', touchAction: 'manipulation' }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                activeGenre === genre
                  ? 'border-[#F28C28] text-[#F28C28] bg-[#F28C28]/10'
                  : 'border-[#333] text-gray-500 hover:border-[#555] hover:text-gray-300'
              }`}>
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Trending row */}
      <HorizontalRow title="🔥 Trending This Week" songs={topRow} seeAll="#" />

      {/* New releases */}
      <HorizontalRow title="✨ Fresh Drops" songs={newRow} seeAll="#" />

      {/* Full grid */}
      <section>
        <h2 className="text-white font-bold text-lg mb-4">All Tracks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {sorted.map(song => <SongArtCard key={song.id} song={song} />)}
        </div>
        {sorted.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-lg">No songs found in this genre yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
