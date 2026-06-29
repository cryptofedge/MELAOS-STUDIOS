'use client';
import { Play, Heart } from 'lucide-react';
import { useAudioStore } from '@/lib/store';
import { formatPlays, type Song } from '@/lib/mockData';

interface SongCardProps {
  song: Song;
}

export default function SongCard({ song }: SongCardProps) {
  const { setCurrentSong, currentSong, isPlaying } = useAudioStore();
  const isActive = currentSong?.id === song.id && isPlaying;

  return (
    <div className="group cursor-pointer" onClick={() => setCurrentSong(song)}>
      {/* Cover art */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <div className="absolute inset-0" style={{ background: song.coverGradient }} />
        {/* Waveform decoration */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="flex gap-1 items-end h-12">
            {[4,7,5,8,6,9,5,7,4,6,8,5,7,6,4].map((h, i) => (
              <div key={i} className="w-1 rounded-full bg-white" style={{ height: `${h * 4}px` }} />
            ))}
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full font-mono">
          {song.durationFormatted}
        </div>
        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
        {/* Playing indicator */}
        {isActive && (
          <div className="absolute bottom-2 left-2 flex gap-0.5 items-end">
            {[3,5,4,6,3].map((h, i) => (
              <div key={i} className="waveform-bar" style={{ height: `${h * 3}px`, backgroundColor: '#F28C28' }} />
            ))}
          </div>
        )}
      </div>
      <p className="text-white text-sm font-semibold truncate mb-0.5">{song.title}</p>
      <p className="text-gray-500 text-xs truncate mb-2">{song.artist}</p>
      <div className="flex items-center gap-3 text-gray-600 text-xs">
        <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {formatPlays(song.plays)}</span>
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatPlays(song.likes)}</span>
        <span className="ml-auto text-gray-700 text-xs">{song.genre}</span>
      </div>
    </div>
  );
}
