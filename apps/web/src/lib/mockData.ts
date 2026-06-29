export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverColor: string;
  coverGradient: string;
  duration: number;
  durationFormatted: string;
  plays: number;
  likes: number;
  genre: string;
  mood: string;
  bpm: number;
  isPublic: boolean;
  createdAt: string;
  tags: string[];
  audioUrl?: string;
}

export const mockSongs: Song[] = [
  { id: '1', title: 'Midnight Frequencies', artist: 'NovaSynth', artistId: 'u1', coverColor: '#3B82F6', coverGradient: 'linear-gradient(135deg,#3B82F6,#7C3AED)', duration: 214, durationFormatted: '3:34', plays: 48200, likes: 3100, genre: 'Electronic', mood: 'Melancholic', bpm: 128, isPublic: true, createdAt: '2026-06-01', tags: ['synth','ambient'] },
  { id: '2', title: 'Golden Hour Lagos', artist: 'AfroWave', artistId: 'u2', coverColor: '#F28C28', coverGradient: 'linear-gradient(135deg,#F28C28,#E91E8C)', duration: 187, durationFormatted: '3:07', plays: 91300, likes: 7800, genre: 'Afrobeats', mood: 'Euphoric', bpm: 102, isPublic: true, createdAt: '2026-06-05', tags: ['afro','dancehall'] },
  { id: '3', title: 'Brooklyn Drill Season', artist: 'GrimeTape', artistId: 'u3', coverColor: '#EF4444', coverGradient: 'linear-gradient(135deg,#1F2937,#7f1d1d)', duration: 163, durationFormatted: '2:43', plays: 204000, likes: 15200, genre: 'Drill', mood: 'Dark', bpm: 140, isPublic: true, createdAt: '2026-06-08', tags: ['drill','uk'] },
  { id: '4', title: 'Velvet Soul', artist: 'SilkThread', artistId: 'u4', coverColor: '#7C3AED', coverGradient: 'linear-gradient(135deg,#7C3AED,#EC4899)', duration: 241, durationFormatted: '4:01', plays: 37600, likes: 4200, genre: 'R&B', mood: 'Chill', bpm: 85, isPublic: true, createdAt: '2026-06-10', tags: ['soul','rnb'] },
  { id: '5', title: 'Neon Garden', artist: 'CyberBloom', artistId: 'u5', coverColor: '#06B6D4', coverGradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)', duration: 198, durationFormatted: '3:18', plays: 62100, likes: 5500, genre: 'Pop', mood: 'Energetic', bpm: 115, isPublic: true, createdAt: '2026-06-12', tags: ['pop','edm'] },
  { id: '6', title: 'Trap Cathedral', artist: 'DeepVault', artistId: 'u6', coverColor: '#A855F7', coverGradient: 'linear-gradient(135deg,#1F2937,#4C1D95)', duration: 175, durationFormatted: '2:55', plays: 118000, likes: 9300, genre: 'Trap', mood: 'Dark', bpm: 145, isPublic: true, createdAt: '2026-06-14', tags: ['trap','808'] },
  { id: '7', title: 'Sunday Morning Rain', artist: 'CloudPetal', artistId: 'u7', coverColor: '#22C55E', coverGradient: 'linear-gradient(135deg,#22C55E,#0D9488)', duration: 223, durationFormatted: '3:43', plays: 29400, likes: 2700, genre: 'Soul', mood: 'Melancholic', bpm: 72, isPublic: true, createdAt: '2026-06-15', tags: ['soul','indie'] },
  { id: '8', title: 'Hyper Tokyo Drift', artist: 'NeonKick', artistId: 'u8', coverColor: '#EC4899', coverGradient: 'linear-gradient(135deg,#EC4899,#EF4444)', duration: 192, durationFormatted: '3:12', plays: 145000, likes: 11800, genre: 'Electronic', mood: 'Aggressive', bpm: 160, isPublic: true, createdAt: '2026-06-17', tags: ['dnb','electronic'] },
  { id: '9', title: 'Afro Midnight Ritual', artist: 'DuskOracle', artistId: 'u9', coverColor: '#EAB308', coverGradient: 'linear-gradient(135deg,#EAB308,#F28C28)', duration: 207, durationFormatted: '3:27', plays: 53800, likes: 4600, genre: 'Afrobeats', mood: 'Euphoric', bpm: 96, isPublic: true, createdAt: '2026-06-18', tags: ['afro','spiritual'] },
  { id: '10', title: 'Slow Burn Confessions', artist: 'EmberVoice', artistId: 'u10', coverColor: '#DC2626', coverGradient: 'linear-gradient(135deg,#DC2626,#F28C28)', duration: 258, durationFormatted: '4:18', plays: 41200, likes: 3900, genre: 'R&B', mood: 'Melancholic', bpm: 78, isPublic: true, createdAt: '2026-06-19', tags: ['rnb','slow'] },
  { id: '11', title: 'Carbon Wave Rider', artist: 'PrismCode', artistId: 'u11', coverColor: '#0EA5E9', coverGradient: 'linear-gradient(135deg,#0EA5E9,#6366F1)', duration: 183, durationFormatted: '3:03', plays: 77600, likes: 6200, genre: 'Electronic', mood: 'Energetic', bpm: 132, isPublic: true, createdAt: '2026-06-20', tags: ['house','techno'] },
  { id: '12', title: 'Midnight Garden Walk', artist: 'MoonRoot', artistId: 'u12', coverColor: '#4F46E5', coverGradient: 'linear-gradient(135deg,#4F46E5,#7C3AED)', duration: 234, durationFormatted: '3:54', plays: 33900, likes: 3300, genre: 'Soul', mood: 'Chill', bpm: 80, isPublic: true, createdAt: '2026-06-21', tags: ['indie','soul'] },
];

export function formatPlays(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
