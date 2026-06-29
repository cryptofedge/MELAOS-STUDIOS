export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  tier: 'free' | 'pro' | 'premier';
  songsGenerated: number;
  monthlyLimit: number;
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverColor: string;
  coverGradient: string;
  audioUrl?: string;
  duration: number;
  durationFormatted: string;
  plays: number;
  likes: number;
  isLiked?: boolean;
  genre: string;
  mood: string;
  bpm: number;
  prompt?: string;
  lyrics?: string;
  isPublic: boolean;
  createdAt: string;
  tags: string[];
}

export interface StemTrack {
  id: string;
  songId: string;
  name: string;
  type: 'vocals' | 'drums' | 'bass' | 'synth' | 'strings' | 'percussion' | 'fx';
  color: string;
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
  audioUrl?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  songs: Song[];
  bpm: number;
  key: string;
  timeSignature: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'pro' | 'premier';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  prompt: string;
  genre: string;
  mood: string;
  bpm: number;
  vocalGender: 'male' | 'female' | 'none';
  status: 'queued' | 'generating' | 'complete' | 'failed';
  progress: number;
  resultSongId?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverColor: string;
  songs: Song[];
  isPublic: boolean;
  createdAt: string;
}
