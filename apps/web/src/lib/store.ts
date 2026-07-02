'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song } from './mockData';

export type UserTier = 'free' | 'pro' | 'premier';

// Song length caps per subscription tier (seconds). Free gets a 50s
// preview-length track; paid tiers get the full 2:30 generation.
export const TIER_MAX_DURATION: Record<UserTier, number> = {
  free: 50,
  pro: 150,
  premier: 150,
};

interface AudioStore {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Song[];
  likedIds: string[];
  isLooping: boolean;
  tier: UserTier;
  setTier: (tier: UserTier) => void;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleLikedSong: (id: string) => void;
  isSongLiked: (id: string) => boolean;
  toggleLike: () => void;
  toggleLoop: () => void;
  playNext: () => void;
  playPrev: () => void;
}

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      progress: 0,
      volume: 80,
      queue: [],
      likedIds: [],
      isLooping: false,
      tier: 'free',
      setTier: (tier) => set({ tier }),
      setCurrentSong: (song) => set({ currentSong: song, isPlaying: true, progress: 0 }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setProgress: (progress) => set({ progress }),
      setVolume: (volume) => set({ volume }),
      toggleLikedSong: (id) => set((s) => ({
        likedIds: s.likedIds.includes(id) ? s.likedIds.filter(x => x !== id) : [...s.likedIds, id],
      })),
      isSongLiked: (id) => get().likedIds.includes(id),
      toggleLike: () => {
        const { currentSong, toggleLikedSong } = get();
        if (currentSong) toggleLikedSong(currentSong.id);
      },
      toggleLoop: () => set((s) => ({ isLooping: !s.isLooping })),
      playNext: () => {
        const { queue, currentSong } = get();
        if (!queue.length) return;
        const idx = queue.findIndex(s => s.id === currentSong?.id);
        const next = queue[(idx + 1) % queue.length];
        if (next) set({ currentSong: next, isPlaying: true, progress: 0 });
      },
      playPrev: () => {
        const { queue, currentSong } = get();
        if (!queue.length) return;
        const idx = queue.findIndex(s => s.id === currentSong?.id);
        const prev = queue[(idx - 1 + queue.length) % queue.length];
        if (prev) set({ currentSong: prev, isPlaying: true, progress: 0 });
      },
    }),
    { name: 'melaos-audio-store', partialize: (s) => ({ likedIds: s.likedIds, volume: s.volume, tier: s.tier }) }
  )
);
