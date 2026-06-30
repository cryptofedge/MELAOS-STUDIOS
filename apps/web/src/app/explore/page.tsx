'use client';
import { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, ChevronRight } from 'lucide-react';
import { mockSongs, formatPlays, type Song } from '@/lib/mockData';
import { useAudioStore } from '@/lib/store';

const tabs = ['Trending', 'New', 'Following', 'Genres'];
const genres = ['All', 'Hip-Hop', 'R&B', 'Afrobeats', 'Pop', 'Electronic', 'Drill', 'Soul', 'Trap'];

// Staff Picks are curated mock songs (not in the main catalog) — built as full Song objects so they're playable
const STAFF_PICKS: Song[] = [
  { id: 's1', title: 'My Vision', artist: 'Luna World', artistId: 'sp1', coverColor: '#E91E8C', coverGradient: 'linear-gradient(135deg,#E91E8C,#7C3AED)', duration: 198, durationFormatted: '3:18', plays: 150000, likes: 2200, genre: 'Pop', mood: 'Euphoric', bpm: 118, isPublic: true, createdAt: '2026-06-22', tags: ['staffpick'] },
  { id: 's2', title: 'Secret Fantasy', artist: 'Alfie', artistId: 'sp2', coverColor: '#F28C28', coverGradient: 'linear-gradient(135deg,#F28C28,#E91E8C)', duration: 211, durationFormatted: '3:31', plays: 74000, likes: 12000, genre: 'R&B', mood: 'Romantic', bpm: 92, isPublic: true, createdAt: '2026-06-23', tags: ['staffpick'] },
  { id: 's3', title: 'BIZARRE', artist: 'MOSTER', artistId: 'sp3', coverColor: '#7C3AED', coverGradient: 'linear-gradient(135deg,#1F2937,#4C1D95)', duration: 176, durationFormatted: '2:56', plays: 70000, likes: 12000, genre: 'Trap', mood: 'Dark', bpm: 142, isPublic: true, createdAt: '2026-06-24', tags: ['staffpick'] },
  { id: 's4', title: 'Velvet Heist', artist: 'Stageism', artistId: 'sp4', coverColor: '#06B6D4', coverGradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)', duration: 203, durationFormatted: '3:23', plays: 39000, likes: 747, genre: 'Electronic', mood: 'Energetic', bpm: 126, isPublic: true, createdAt: '2026-06-25', tags: ['staffpick'] },
  { id: 's5', title: 'Ethereal Sun', artist: 'Rachel Claveau', artistId: 'sp5', coverColor: '#22C55E', coverGradient: 'linear-gradient(135deg,#22C55E,#0D9488)', duration: 219, durationFormatted: '3:39', plays: 30000, likes: 927, genre: 'Soul', mood: 'Chill', bpm: 76, isPublic: true, createdAt: '2026-06-26', tags: ['staffpick'] },
  { id: 's6', title: 'Back to June', artist: 'grimeko', artistId: 'sp6', coverColor: '#EAB308', coverGradient: 'linear-gradient(135deg,#EAB308,#F28C28)', duration: 187, durationFormatted: '3:07', plays: 28000, likes: 644, genre: 'Hip-Hop', mood: 'Melancholic', bpm: 88, isPublic: true, createdAt: '2026-06-27', tags: ['staffpick'] },
  { id: 's7', title: 'Lucid Dreaming', artist: 'Varletine', artistId: 'sp7', coverColor: '#A855F7', coverGradient: 'linear-gradient(135deg,#7C3AED,#EC4899)', duration: 234, durationFormatted: '3:54', plays: 410000, likes: 72000, genre: 'Electronic', mood: 'Euphoric', bpm: 124, isPublic: true, createdAt: '2026-06-28', tags: ['staffpick'] },
];

function SongArtCard({ song, version }: { song: Song; version?: string }) {
  const { setCurrentSong, currentSong, isPlaying, toggleLike } = useAudioStore();
  const [hovered, setHovered] = useState(false);
  const isActive = currentSong?.id === song.id && isPlaying;
  const isCurrent = currentSong?.id === song.id;

  return (
    <div
      className="group cursor-pointer shrink-0"
      style={{ width: 150 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setCurrentSong(song)}
    >
      <div
        className="rounded-2xl relative overflow-hidden mb-2"
        style={{ aspectRatio: '1', background: song.coverGradient }}
      >
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-end justify-between p-2 transition-opacity ${hovered || isActive ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={e => { e.stopPropagation(); if (isCurrent) toggleLike(); else { setCurrentSong(song); toggleLike(); } }}
            className="p-1.5 rounded-full bg-black/40 transition-colors text-white hover:text-[#E91E8C]">
            <Heart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-full bg-white text-black hover:scale-110 transition-transform">
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-full bg-black/40 text-white">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Version badge */}
        {version && (
          <div className="absolute top-2 left-2 bg-black/60 text-[#F28C28] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {version}
          </div>
        )}
        {/* Playing indicator */}
        {isActive && (
          <div className="absolute bottom-2 left-2 flex gap-0.5 items-end">
            {[3,5,4,6,3].map((h, i) => (
              <div key={i} className="waveform-bar" style={{ height: `${h * 3}px`, backgroundColor: '#F28C28' }} />
            ))}
          </div>
        )}
      </div>
      <p className="text-white text-xs font-semibold truncate">{song.title}</p>
      <p className="text-gray-500 text-xs truncate">{song.artist}</p>
      <p className="text-gray-600 text-[10px] mt-0.5">▶ {formatPlays(song.plays)} · ♥ {formatPlays(song.likes)}</p>
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
