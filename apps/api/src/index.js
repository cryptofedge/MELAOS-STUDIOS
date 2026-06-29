require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ── Mock Data ──────────────────────────────────────────────────────────────────
const mockSongs = [
  { id: '1', title: 'Midnight Frequencies', artist: 'NovaSynth', artistId: 'u1', coverColor: '#3B82F6', coverGradient: 'from-blue-600 to-purple-800', duration: 214, durationFormatted: '3:34', plays: 48200, likes: 3100, genre: 'Electronic', mood: 'Melancholic', bpm: 128, isPublic: true, createdAt: '2026-06-01', tags: ['synth', 'ambient'] },
  { id: '2', title: 'Golden Hour Lagos', artist: 'AfroWave', artistId: 'u2', coverColor: '#F28C28', coverGradient: 'from-orange-500 to-pink-600', duration: 187, durationFormatted: '3:07', plays: 91300, likes: 7800, genre: 'Afrobeats', mood: 'Euphoric', bpm: 102, isPublic: true, createdAt: '2026-06-05', tags: ['afro', 'dancehall'] },
  { id: '3', title: 'Brooklyn Drill Season', artist: 'GrimeTape', artistId: 'u3', coverColor: '#111827', coverGradient: 'from-gray-900 to-red-900', duration: 163, durationFormatted: '2:43', plays: 204000, likes: 15200, genre: 'Drill', mood: 'Dark', bpm: 140, isPublic: true, createdAt: '2026-06-08', tags: ['drill', 'uk'] },
  { id: '4', title: 'Velvet Soul', artist: 'SilkThread', artistId: 'u4', coverColor: '#7C3AED', coverGradient: 'from-purple-700 to-pink-500', duration: 241, durationFormatted: '4:01', plays: 37600, likes: 4200, genre: 'R&B', mood: 'Chill', bpm: 85, isPublic: true, createdAt: '2026-06-10', tags: ['soul', 'rnb'] },
  { id: '5', title: 'Neon Garden', artist: 'CyberBloom', artistId: 'u5', coverColor: '#06B6D4', coverGradient: 'from-cyan-500 to-blue-700', duration: 198, durationFormatted: '3:18', plays: 62100, likes: 5500, genre: 'Pop', mood: 'Energetic', bpm: 115, isPublic: true, createdAt: '2026-06-12', tags: ['pop', 'edm'] },
  { id: '6', title: 'Trap Cathedral', artist: 'DeepVault', artistId: 'u6', coverColor: '#1F2937', coverGradient: 'from-gray-800 to-purple-900', duration: 175, durationFormatted: '2:55', plays: 118000, likes: 9300, genre: 'Trap', mood: 'Dark', bpm: 145, isPublic: true, createdAt: '2026-06-14', tags: ['trap', '808'] },
  { id: '7', title: 'Sunday Morning Rain', artist: 'CloudPetal', artistId: 'u7', coverColor: '#22C55E', coverGradient: 'from-green-500 to-teal-600', duration: 223, durationFormatted: '3:43', plays: 29400, likes: 2700, genre: 'Soul', mood: 'Melancholic', bpm: 72, isPublic: true, createdAt: '2026-06-15', tags: ['soul', 'indie'] },
  { id: '8', title: 'Hyper Tokyo Drift', artist: 'NeonKick', artistId: 'u8', coverColor: '#EC4899', coverGradient: 'from-pink-500 to-red-600', duration: 192, durationFormatted: '3:12', plays: 145000, likes: 11800, genre: 'Electronic', mood: 'Aggressive', bpm: 160, isPublic: true, createdAt: '2026-06-17', tags: ['dnb', 'electronic'] },
  { id: '9', title: 'Afro Midnight Ritual', artist: 'DuskOracle', artistId: 'u9', coverColor: '#EAB308', coverGradient: 'from-yellow-500 to-orange-600', duration: 207, durationFormatted: '3:27', plays: 53800, likes: 4600, genre: 'Afrobeats', mood: 'Euphoric', bpm: 96, isPublic: true, createdAt: '2026-06-18', tags: ['afro', 'spiritual'] },
  { id: '10', title: 'Slow Burn Confessions', artist: 'EmberVoice', artistId: 'u10', coverColor: '#DC2626', coverGradient: 'from-red-600 to-orange-500', duration: 258, durationFormatted: '4:18', plays: 41200, likes: 3900, genre: 'R&B', mood: 'Melancholic', bpm: 78, isPublic: true, createdAt: '2026-06-19', tags: ['rnb', 'slow'] },
  { id: '11', title: 'Carbon Wave Rider', artist: 'PrismCode', artistId: 'u11', coverColor: '#0EA5E9', coverGradient: 'from-sky-500 to-indigo-700', duration: 183, durationFormatted: '3:03', plays: 77600, likes: 6200, genre: 'Electronic', mood: 'Energetic', bpm: 132, isPublic: true, createdAt: '2026-06-20', tags: ['house', 'techno'] },
  { id: '12', title: 'Midnight Garden Walk', artist: 'MoonRoot', artistId: 'u12', coverColor: '#4F46E5', coverGradient: 'from-indigo-600 to-purple-800', duration: 234, durationFormatted: '3:54', plays: 33900, likes: 3300, genre: 'Soul', mood: 'Chill', bpm: 80, isPublic: true, createdAt: '2026-06-21', tags: ['indie', 'soul'] }
];

const mockUsers = [
  { id: 'u1', email: 'demo@melaos.io', displayName: 'Demo User', username: 'demouser', tier: 'pro', followerCount: 1240, followingCount: 87, songsGenerated: 47, monthlyLimit: 500, createdAt: '2026-01-01' }
];

// ── Routes ─────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MELAOS STUDIOS API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Songs
app.get('/api/songs', (req, res) => {
  const { filter = 'trending', genre, limit = 12 } = req.query;
  let songs = [...mockSongs];
  if (genre) songs = songs.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
  if (filter === 'trending') songs.sort((a, b) => b.plays - a.plays);
  else if (filter === 'new') songs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ songs: songs.slice(0, Number(limit)), total: songs.length });
});

app.get('/api/songs/:id', (req, res) => {
  const song = mockSongs.find(s => s.id === req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  res.json(song);
});

app.post('/api/songs/:id/like', (req, res) => {
  const song = mockSongs.find(s => s.id === req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  song.likes += 1;
  res.json({ likes: song.likes });
});

// Users
app.get('/api/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.get('/api/users/:id/songs', (req, res) => {
  res.json({ songs: mockSongs.slice(0, 6) });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = mockUsers[0];
  res.json({ user, token: 'mock-jwt-token-' + uuidv4() });
});

app.post('/api/auth/register', (req, res) => {
  const { email, displayName, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const newUser = { id: uuidv4(), email, displayName: displayName || email.split('@')[0], username: email.split('@')[0], tier: 'free', followerCount: 0, followingCount: 0, songsGenerated: 0, monthlyLimit: 10, createdAt: new Date().toISOString() };
  res.json({ user: newUser, token: 'mock-jwt-token-' + uuidv4() });
});

app.get('/api/auth/me', (req, res) => {
  res.json(mockUsers[0]);
});

// Generation
app.post('/api/generate', (req, res) => {
  const { prompt, genre, mood, bpm, vocalGender } = req.body;
  const jobId = uuidv4();
  res.json({ jobId, status: 'queued', message: 'Generation started' });
  // Emit progress via socket
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      const newSong = {
        ...mockSongs[Math.floor(Math.random() * mockSongs.length)],
        id: uuidv4(),
        title: prompt ? prompt.slice(0, 40) : 'Untitled Track',
        createdAt: new Date().toISOString(),
        plays: 0,
        likes: 0
      };
      io.emit(`job:${jobId}`, { status: 'complete', progress: 100, song: newSong });
    } else {
      io.emit(`job:${jobId}`, { status: 'generating', progress });
    }
  }, 600);
});

app.get('/api/generate/:jobId', (req, res) => {
  res.json({ jobId: req.params.jobId, status: 'generating', progress: 50 });
});

// ── Socket.io ──────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// ── Start ──────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🎵 MELAOS STUDIOS API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
