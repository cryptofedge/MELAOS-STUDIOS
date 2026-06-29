'use client';
import { create } from 'zustand';
import type { Song } from './mockData';

interface AudioStore {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Song[];
  isLiked: boolean;
  isLooping: boolean;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleLike: () => void;
  toggleLoop: () => void;
  playNext: () => void;
  playPrev: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  volume: 80,
  queue: [],
  isLiked: false,
  isLooping: false,
  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true, progress: 0 }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  toggleLike: () => set((s) => ({ isLiked: !s.isLiked })),
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
}));
