'use client';
import { useEffect, useRef } from 'react';
import { SkipBack, SkipForward, Play, Pause, Heart, Repeat, Volume2 } from 'lucide-react';
import { useAudioStore } from '@/lib/store';

export default function AudioPlayer() {
  const { currentSong, isPlaying, progress, volume, isLiked, isLooping, setIsPlaying, setProgress, setVolume, toggleLike, toggleLoop, playNext, playPrev } = useAudioStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying && currentSong) {
      intervalRef.current = setInterval(() => {
        setProgress(Math.min(progress + (100 / currentSong.duration), 100));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, progress, currentSong, setProgress]);

  if (!currentSong) return null;

  const elapsed = Math.floor((progress / 100) * currentSong.duration);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]/95 border-t border-[#222]" style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}>

      {/* ── MOBILE layout (< md) ── */}
      <div className="md:hidden px-4 py-2 flex flex-col gap-2">
        {/* Row 1: Cover + title + like */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md shrink-0 overflow-hidden" style={{ background: currentSong.coverGradient }}>
            <div className="w-full h-full flex items-center justify-center opacity-60">
              <div className="flex gap-0.5 items-end h-5">
                {[3,5,4,6,3,5,4].map((h, i) => (
                  <div key={i} className="waveform-bar" style={{ height: `${h * 3}px`, backgroundColor: 'white' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
            <p className="text-gray-500 text-xs truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={toggleLike}
            style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className={`flex items-center justify-center shrink-0 transition-colors ${isLiked ? 'text-[#E91E8C]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Row 2: Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 w-8 text-right">{fmt(elapsed)}</span>
          <div
            className="flex-1 h-1.5 bg-[#333] rounded-full cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(((e.clientX - rect.left) / rect.width) * 100);
            }}
          >
            <div className="h-full bg-[#F28C28] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-600 w-8">{currentSong.durationFormatted}</span>
        </div>

        {/* Row 3: Transport controls */}
        <div className="flex items-center justify-center gap-2 pb-1">
          <button
            onClick={playPrev}
            style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className="flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
          </button>
          <button
            onClick={playNext}
            style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className="flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={toggleLoop}
            style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className={`flex items-center justify-center transition-colors ${isLooping ? 'text-[#F28C28]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── DESKTOP layout (md+) ── */}
      <div className="hidden md:flex items-center px-6 h-20 gap-4">
        {/* Song info */}
        <div className="flex items-center gap-3 w-64 shrink-0">
          <div className="w-10 h-10 rounded-md shrink-0 overflow-hidden" style={{ background: currentSong.coverGradient }}>
            <div className="w-full h-full flex items-center justify-center opacity-60">
              <div className="flex gap-0.5 items-end h-5">
                {[3,5,4,6,3,5,4].map((h, i) => (
                  <div key={i} className="waveform-bar" style={{ height: `${h * 3}px`, backgroundColor: 'white' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
            <p className="text-gray-500 text-xs truncate">{currentSong.artist}</p>
          </div>
          <button onClick={toggleLike} className={`shrink-0 transition-colors ${isLiked ? 'text-[#E91E8C]' : 'text-gray-600 hover:text-gray-400'}`}>
            <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Center controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={playPrev} className="text-gray-500 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-gray-500 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={toggleLoop} className={`transition-colors ${isLooping ? 'text-[#F28C28]' : 'text-gray-600 hover:text-gray-400'}`}>
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-gray-600 w-8 text-right">{fmt(elapsed)}</span>
            <div className="flex-1 h-1 bg-[#333] rounded-full cursor-pointer relative group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}>
              <div className="h-full bg-[#F28C28] rounded-full transition-all" style={{ width: `${progress}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 6px)` }} />
            </div>
            <span className="text-xs text-gray-600 w-8">{currentSong.durationFormatted}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32 shrink-0">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <div className="flex-1 h-1 bg-[#333] rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
            }}>
            <div className="h-full bg-gray-400 rounded-full" style={{ width: `${volume}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
