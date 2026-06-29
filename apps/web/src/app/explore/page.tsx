'use client';
import { useState } from 'react';
import SongCard from '@/components/SongCard';
import { mockSongs } from '@/lib/mockData';

const tabs = ['Trending', 'New', 'Following', 'Genres'];
const genres = ['All', 'Hip-Hop', 'R&B', 'Afrobeats', 'Pop', 'Electronic', 'Drill', 'Soul', 'Trap'];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('Trending');
  const [activeGenre, setActiveGenre] = useState('All');

  const filtered = mockSongs.filter(s => activeGenre === 'All' || s.genre === activeGenre);
  const sorted = activeTab === 'New'
    ? [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...filtered].sort((a, b) => b.plays - a.plays);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Explore</h1>
        <p className="text-gray-500">Discover the latest and trending music from MELAOS creators</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b border-[#1A1A1A] pb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#F28C28] text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Genre pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              activeGenre === genre
                ? 'border-[#F28C28] text-[#F28C28] bg-[#F28C28]/10'
                : 'border-[#333] text-gray-500 hover:border-[#555] hover:text-gray-300'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Song grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sorted.map(song => (
          <SongCard key={song.id} song={song as any} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <p className="text-lg">No songs found in this genre yet.</p>
        </div>
      )}
    </div>
  );
}
