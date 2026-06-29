'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SkipBack, Play, Pause, Square, Circle, Repeat,
  ChevronLeft, ChevronRight, Mic2, Loader2, Check,
  Zap, Activity, Cpu, Layers
} from 'lucide-react';

const TRACKS = [
  { id: 't1', name: 'Vocals',      type: 'vocals',      color: '#007AFF', glow: '0 0 12px #007AFF88' },
  { id: 't2', name: 'Drums',       type: 'drums',        color: '#AE06ED', glow: '0 0 12px #AE06ED88' },
  { id: 't3', name: 'Bass',        type: 'bass',         color: '#F28C28', glow: '0 0 12px #F28C2888' },
  { id: 't4', name: 'Synth',       type: 'synth',        color: '#00FFD1', glow: '0 0 12px #00FFD188' },
  { id: 't5', name: 'Strings',     type: 'strings',      color: '#FF2D78', glow: '0 0 12px #FF2D7888' },
  { id: 't6', name: 'Percussion',  type: 'percussion',   color: '#EAB308', glow: '0 0 12px #EAB30888' },
  { id: 't7', name: 'FX',          type: 'fx',           color: '#6A0572', glow: '0 0 12px #6A057288' },
];

const SECTIONS = ['INTRO', 'VERSE', 'CHORUS', 'VERSE', 'CHORUS', 'BRIDGE', 'OUTRO'];
const GENRES   = ['Hip-Hop', 'R&B', 'Afrobeats', 'Pop', 'Electronic', 'Drill', 'Soul', 'Trap'];
const MOODS    = ['Energetic', 'Melancholic', 'Euphoric', 'Dark', 'Chill', 'Aggressive'];

const DEFAULT_LYRICS = `[Verse 1]
Walking through the city lights tonight
Every sound a pulse, every beat ignites
The music in my veins won't let me rest
MELAOS Studios, putting sound to test

[Chorus]
Where sound meets soul and dreams take flight
Every note we make cuts through the night
This is more than music, this is life
MELAOS — turning darkness into light

[Verse 2]
From the studio walls to the open stage
Every song we write is a turning page
The rhythm hits different, the bass line low
Building something timeless, watch it grow

[Chorus]
Where sound meets soul and dreams take flight
Every note we make cuts through the night
This is more than music, this is life
MELAOS — turning darkness into light

[Bridge]
We don't just make beats, we make moments
We don't just make songs, we make movements
Every track a statement, every bar a truth
From the studio to you — this is proof

[Outro]
Where sound meets soul...`;

/* ─── Waveform ─────────────────────────────────────────── */
const W = 600;
function WaveformSVG({ color, glow, height = 40, seed = 0 }: { color: string; glow: string; height?: number; seed?: number }) {
  const pts = Array.from({ length: 80 }, (_, i) => {
    const x = (i / 79) * W;
    const y =
      height / 2 +
      Math.sin(i * 0.35 + seed) * (height * 0.32) +
      Math.sin(i * 0.85 + seed * 2) * (height * 0.14) +
      Math.sin(i * 1.4 + seed * 0.5) * (height * 0.08);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <filter id={`glow-${seed}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        filter={`url(#glow-${seed})`} opacity="0.85" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

/* ─── Scanline overlay ─────────────────────────────────── */
function ScanLines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
        backgroundSize: '100% 4px',
      }} />
  );
}

/* ─── Dot-grid bg ──────────────────────────────────────── */
function DotGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
      style={{
        backgroundImage: 'radial-gradient(circle, #AE06ED 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />
  );
}

type MobileTab = 'timeline' | 'ai' | 'lyrics';

export default function StudioPage() {
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [timeMs,       setTimeMs]       = useState(0);
  const [bpm,          setBpm]          = useState(120);
  const [playheadPct,  setPlayheadPct]  = useState(0);
  const [looping,      setLooping]      = useState(false);
  const [panelOpen,    setPanelOpen]    = useState(true);
  const [mobileTab,    setMobileTab]    = useState<MobileTab>('timeline');
  const [muted,        setMuted]        = useState<Record<string, boolean>>({});
  const [solo,         setSolo]         = useState<Record<string, boolean>>({});
  const [volumes,      setVolumes]      = useState<Record<string, number>>(
    Object.fromEntries(TRACKS.map(t => [t.id, 80]))
  );
  const [prompt,       setPrompt]       = useState('');
  const [genre,        setGenre]        = useState('Hip-Hop');
  const [mood,         setMood]         = useState('Energetic');
  const [genBpm,       setGenBpm]       = useState(120);
  const [vocalGender,  setVocalGender]  = useState<'male' | 'female' | 'none'>('male');
  const [generating,   setGenerating]   = useState(false);
  const [genProgress,  setGenProgress]  = useState(0);
  const [genDone,      setGenDone]      = useState(false);
  const [genError,     setGenError]     = useState<string | null>(null);
  const [audioUrl,     setAudioUrl]     = useState<string | null>(null);
  const [lyrics,       setLyrics]       = useState(DEFAULT_LYRICS);
  const [activeTrack,  setActiveTrack]  = useState<string | null>('t1');
  const [tick,         setTick]         = useState(0);

  const intervalRef   = useRef<NodeJS.Timeout | null>(null);
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const TOTAL_MS = 214000;

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimeMs(prev => {
          const next = prev + 100;
          if (next >= TOTAL_MS) { setIsPlaying(false); return 0; }
          setPlayheadPct((next / TOTAL_MS) * 100);
          return next;
        });
        setTick(t => t + 1);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}:${String(Math.floor((ms % 1000) / 10)).padStart(2,'0')}`;
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenProgress(0);
    setGenDone(false);
    setGenError(null);
    setAudioUrl(null);
    setIsPlaying(false);

    // Animate progress bar while waiting for API (~20-30s)
    let p = 0;
    progressTimer.current = setInterval(() => {
      p = Math.min(p + Math.random() * 2 + 0.5, 88); // cap at 88% until real response
      setGenProgress(Math.round(p));
    }, 400);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, genre, mood, bpm: genBpm, vocals: vocalGender }),
      });

      clearInterval(progressTimer.current!);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setGenProgress(100);

      // Load the returned audio URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioRef.current = new Audio(data.audioUrl);
      audioRef.current.preload = 'auto';
      audioRef.current.volume = 0.9;

      // Sync playhead from real audio
      audioRef.current.ontimeupdate = () => {
        const a = audioRef.current!;
        if (a.duration) setPlayheadPct((a.currentTime / a.duration) * 100);
        setTimeMs(Math.floor(a.currentTime * 1000));
      };
      audioRef.current.onended = () => { setIsPlaying(false); setPlayheadPct(0); setTimeMs(0); };

      setAudioUrl(data.audioUrl);
      setTimeout(() => { setGenerating(false); setGenDone(true); }, 300);

    } catch (err: any) {
      clearInterval(progressTimer.current!);
      setGenerating(false);
      setGenError(err.message || 'Generation failed');
    }
  }, [prompt, genre, mood, genBpm, vocalGender]);

  // Sync play/pause with real audio when available
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    if (isPlaying) { a.play().catch(() => setIsPlaying(false)); }
    else { a.pause(); }
  }, [isPlaying, audioUrl]);

  const toggleMute = (id: string) => setMuted(m => ({ ...m, [id]: !m[id] }));
  const toggleSolo = (id: string) => setSolo(s => ({ ...s, [id]: !s[id] }));

  /* ── Shared: AI panel ──────────────────────────────────── */
  const AIPanel = () => (
    <div className="p-4 flex flex-col gap-4">
      {/* Prompt */}
      <div>
        <label className="text-[10px] font-bold text-[#AE06ED] mb-1.5 block tracking-[0.15em] uppercase">
          ◈ Describe Your Song
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            placeholder="A dark trap banger with 808s, auto-tune vocals, and a haunting piano melody..."
            style={{ fontSize: '16px' }}
            className="w-full bg-black/60 border border-[#AE06ED]/40 rounded-lg p-3 text-sm text-[#E0E0FF] placeholder:text-[#444466] focus:outline-none focus:border-[#AE06ED] resize-none transition-all"
            style={{
              fontSize: '14px',
              background: 'rgba(0,0,0,0.6)',
              boxShadow: 'inset 0 0 20px rgba(174,6,237,0.05)',
            }}
          />
          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#444466]">{prompt.length}/500</div>
        </div>
      </div>

      {/* Genre + Mood */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-[#007AFF] mb-1.5 block tracking-[0.15em] uppercase">◈ Genre</label>
          <select
            value={genre} onChange={e => setGenre(e.target.value)}
            style={{ fontSize: '14px', background: 'rgba(0,0,0,0.7)', boxShadow: '0 0 8px rgba(0,122,255,0.15)' }}
            className="w-full border border-[#007AFF]/40 rounded-lg px-3 py-2 text-sm text-[#E0E0FF] focus:outline-none focus:border-[#007AFF] transition-all"
          >
            {GENRES.map(g => <option key={g} value={g} style={{ background: '#0A0A14' }}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-[#007AFF] mb-1.5 block tracking-[0.15em] uppercase">◈ Mood</label>
          <select
            value={mood} onChange={e => setMood(e.target.value)}
            style={{ fontSize: '14px', background: 'rgba(0,0,0,0.7)', boxShadow: '0 0 8px rgba(0,122,255,0.15)' }}
            className="w-full border border-[#007AFF]/40 rounded-lg px-3 py-2 text-sm text-[#E0E0FF] focus:outline-none focus:border-[#007AFF] transition-all"
          >
            {MOODS.map(m => <option key={m} value={m} style={{ background: '#0A0A14' }}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* BPM */}
      <div>
        <label className="text-[10px] font-bold text-[#F28C28] mb-1.5 flex justify-between tracking-[0.15em] uppercase">
          <span>◈ BPM</span>
          <span className="font-mono text-[#F28C28]" style={{ textShadow: '0 0 8px #F28C28' }}>{genBpm}</span>
        </label>
        <input
          type="range" min={60} max={200} value={genBpm}
          onChange={e => setGenBpm(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F28C28 ${((genBpm - 60) / 140) * 100}%, #1a1a2e ${((genBpm - 60) / 140) * 100}%)`,
            accentColor: '#F28C28',
          }}
        />
        <div className="flex justify-between text-[9px] text-[#333355] mt-1 font-mono">
          <span>60</span><span>130</span><span>200</span>
        </div>
      </div>

      {/* Vocals */}
      <div>
        <label className="text-[10px] font-bold text-[#00FFD1] mb-1.5 block tracking-[0.15em] uppercase">◈ Vocals</label>
        <div className="flex gap-2">
          {(['male', 'female', 'none'] as const).map(v => (
            <button key={v} onClick={() => setVocalGender(v)}
              style={{
                minHeight: '40px', touchAction: 'manipulation',
                boxShadow: vocalGender === v ? `0 0 14px ${v === 'none' ? '#666' : '#00FFD1'}88` : 'none',
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                vocalGender === v
                  ? 'bg-[#00FFD1]/10 border-[#00FFD1] text-[#00FFD1]'
                  : 'border-[#1a1a3a] text-[#333355] hover:text-[#00FFD1]/60 hover:border-[#00FFD1]/30'
              }`}
            >
              {v === 'none' ? 'None' : v}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate} disabled={generating}
        style={{
          minHeight: '50px', touchAction: 'manipulation',
          boxShadow: generating || genDone ? 'none' : '0 0 20px rgba(174,6,237,0.4), 0 0 40px rgba(174,6,237,0.15)',
        }}
        className={`w-full py-3 rounded-xl font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all ${
          generating || genDone
            ? 'bg-[#0A0A14] border border-[#222244] text-[#333355] cursor-not-allowed'
            : 'bg-gradient-to-r from-[#6A0572] via-[#AE06ED] to-[#007AFF] text-white hover:scale-[1.02]'
        }`}
      >
        {generating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing...</>
        ) : genDone ? (
          <><Check className="w-4 h-4 text-[#00FFD1]" style={{ filter: 'drop-shadow(0 0 4px #00FFD1)' }} />
            <span className="text-[#00FFD1]" style={{ textShadow: '0 0 8px #00FFD1' }}>Generated</span></>
        ) : (
          <><Zap className="w-4 h-4" /> Generate Track</>
        )}
      </button>

      {/* Error */}
      {genError && (
        <div className="rounded-lg border border-[#FF2D78]/40 bg-[#FF2D78]/05 p-3">
          <p className="text-[10px] font-mono text-[#FF2D78] tracking-wider">◈ ERROR: {genError}</p>
        </div>
      )}

      {/* Progress bar */}
      {(generating || genDone) && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] font-mono"
            style={{ color: genDone ? '#00FFD1' : '#AE06ED' }}>
            <span>{genDone ? '◈ TRACK READY' : '◈ SYNTHESIZING'}</span>
            <span>{genProgress}%</span>
          </div>
          <div className="h-1 bg-[#0A0A14] rounded-full overflow-hidden border border-[#1a1a3a]">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${genProgress}%`,
                background: genDone
                  ? 'linear-gradient(90deg, #00FFD1, #007AFF)'
                  : 'linear-gradient(90deg, #6A0572, #AE06ED, #007AFF)',
                boxShadow: genDone ? '0 0 8px #00FFD1' : '0 0 8px #AE06ED',
              }} />
          </div>

          {genDone && audioUrl && (
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => setIsPlaying(p => !p)}
                style={{ boxShadow: '0 0 14px #00FFD144', minHeight: '42px' }}
                className="w-full py-2 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 border border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1]/10 transition-all"
              >
                {isPlaying ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5 ml-0.5" /> Play Track</>}
              </button>
              <a
                href={audioUrl}
                download="melaos-track.mp3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-mono text-center tracking-wider hover:underline transition-colors"
                style={{ color: '#007AFF' }}
              >
                ◈ Download MP3
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ── Transport bar ─────────────────────────────────────── */
  const TransportBar = () => (
    <div className="h-14 border-t flex items-center px-3 gap-1 shrink-0 overflow-x-auto"
      style={{
        background: 'linear-gradient(90deg, #050510, #0A0A1A, #050510)',
        borderColor: '#AE06ED33',
        boxShadow: '0 -1px 0 #AE06ED22, inset 0 1px 0 #ffffff08',
      }}>

      <button onClick={() => { setTimeMs(0); setPlayheadPct(0); }}
        style={{ minWidth: '40px', minHeight: '40px', touchAction: 'manipulation' }}
        className="flex items-center justify-center text-[#333366] hover:text-[#AE06ED] transition-colors">
        <SkipBack className="w-4 h-4" />
      </button>

      <button onClick={() => setIsPlaying(p => !p)}
        style={{
          minWidth: '40px', minHeight: '40px', touchAction: 'manipulation',
          boxShadow: isPlaying ? '0 0 16px #AE06ED, 0 0 32px #AE06ED44' : '0 0 8px #333',
          background: isPlaying
            ? 'linear-gradient(135deg, #6A0572, #AE06ED)'
            : 'linear-gradient(135deg, #111130, #1a1a3a)',
          border: `1px solid ${isPlaying ? '#AE06ED' : '#333366'}`,
        }}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all shrink-0">
        {isPlaying
          ? <Pause className="w-4 h-4 text-white" />
          : <Play className="w-4 h-4 text-[#AE06ED] ml-0.5" />}
      </button>

      <button onClick={() => {
          setIsPlaying(false); setTimeMs(0); setPlayheadPct(0);
          if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
        }}
        style={{ minWidth: '40px', minHeight: '40px', touchAction: 'manipulation' }}
        className="flex items-center justify-center text-[#333366] hover:text-[#FF2D78] transition-colors">
        <Square className="w-4 h-4" />
      </button>

      <button style={{ minWidth: '40px', minHeight: '40px', touchAction: 'manipulation' }}
        className="flex items-center justify-center text-[#333366] hover:text-[#FF2D78] transition-colors">
        <Circle className="w-4 h-4" />
      </button>

      <button onClick={() => setLooping(l => !l)}
        style={{ minWidth: '40px', minHeight: '40px', touchAction: 'manipulation',
          filter: looping ? 'drop-shadow(0 0 4px #00FFD1)' : 'none' }}
        className={`flex items-center justify-center transition-all ${looping ? 'text-[#00FFD1]' : 'text-[#333366] hover:text-[#00FFD1]/60'}`}>
        <Repeat className="w-4 h-4" />
      </button>

      <div className="h-5 w-px mx-1 shrink-0" style={{ background: 'linear-gradient(180deg, transparent, #AE06ED44, transparent)' }} />

      {/* BPM */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => setBpm(b => Math.max(40, b - 1))}
          className="text-[#333366] hover:text-[#F28C28] w-4 h-4 flex items-center justify-center text-xs transition-colors">−</button>
        <div className="border rounded px-2 py-0.5 text-xs font-mono min-w-[58px] text-center"
          style={{ background: '#050510', borderColor: '#F28C2844', color: '#F28C28', textShadow: '0 0 6px #F28C28', boxShadow: '0 0 8px #F28C2822' }}>
          {bpm} BPM
        </div>
        <button onClick={() => setBpm(b => Math.min(300, b + 1))}
          className="text-[#333366] hover:text-[#F28C28] w-4 h-4 flex items-center justify-center text-xs transition-colors">+</button>
      </div>

      <div className="h-5 w-px mx-1 shrink-0" style={{ background: 'linear-gradient(180deg, transparent, #007AFF44, transparent)' }} />

      {/* Timecode */}
      <div className="font-mono text-xs px-2 py-1 rounded shrink-0 border"
        style={{
          background: '#020208',
          borderColor: '#007AFF33',
          color: '#007AFF',
          textShadow: '0 0 8px #007AFF',
          boxShadow: '0 0 12px #007AFF22',
          letterSpacing: '0.1em',
        }}>
        {formatTime(timeMs)}
      </div>

      {/* VU meter dots */}
      <div className="hidden lg:flex items-end gap-0.5 h-5 ml-2 shrink-0">
        {Array.from({ length: 12 }, (_, i) => {
          const active = isPlaying && (tick % 3 !== 0 ? i < Math.floor(Math.random() * 5) + 5 : i < 4);
          return (
            <div key={i} className="w-1 rounded-sm transition-all duration-75"
              style={{
                height: `${(i + 1) * 1.5 + 2}px`,
                background: active
                  ? i < 7 ? '#00FFD1' : i < 10 ? '#F28C28' : '#FF2D78'
                  : '#1a1a2e',
                boxShadow: active ? `0 0 4px ${i < 7 ? '#00FFD1' : i < 10 ? '#F28C28' : '#FF2D78'}` : 'none',
              }} />
          );
        })}
      </div>

      <button onClick={() => setPanelOpen(p => !p)}
        className="hidden lg:flex text-[#333366] hover:text-[#AE06ED] transition-colors items-center justify-center ml-auto">
        {panelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  /* ── Track sidebar item ─────────────────────────────────── */
  const TrackRow = ({ track }: { track: typeof TRACKS[0] }) => {
    const isActive = activeTrack === track.id;
    return (
      <div
        onClick={() => setActiveTrack(track.id)}
        className={`border-b p-2 cursor-pointer transition-all`}
        style={{
          borderColor: '#0D0D20',
          background: isActive ? `${track.color}08` : 'transparent',
          boxShadow: isActive ? `inset 3px 0 0 ${track.color}` : 'inset 3px 0 0 transparent',
        }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full shrink-0 transition-all"
            style={{ backgroundColor: track.color, boxShadow: isActive ? `0 0 6px ${track.color}` : 'none' }} />
          <span className={`text-[11px] font-bold tracking-wider flex-1 truncate uppercase transition-colors`}
            style={{ color: isActive ? track.color : '#445566', textShadow: isActive ? `0 0 6px ${track.color}44` : 'none' }}>
            {track.name}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-3">
          <button onClick={e => { e.stopPropagation(); toggleMute(track.id); }}
            className="text-[9px] font-black px-1.5 py-0.5 rounded transition-all border"
            style={{
              background: muted[track.id] ? '#F28C2820' : 'transparent',
              borderColor: muted[track.id] ? '#F28C28' : '#1a1a3a',
              color: muted[track.id] ? '#F28C28' : '#333355',
            }}>M</button>
          <button onClick={e => { e.stopPropagation(); toggleSolo(track.id); }}
            className="text-[9px] font-black px-1.5 py-0.5 rounded transition-all border"
            style={{
              background: solo[track.id] ? '#007AFF20' : 'transparent',
              borderColor: solo[track.id] ? '#007AFF' : '#1a1a3a',
              color: solo[track.id] ? '#007AFF' : '#333355',
            }}>S</button>
          <div className="flex-1 ml-1 h-0.5 rounded-full bg-[#0D0D20] cursor-pointer overflow-hidden"
            onClick={e => {
              e.stopPropagation();
              const r = e.currentTarget.getBoundingClientRect();
              setVolumes(v => ({ ...v, [track.id]: Math.round(((e.clientX - r.left) / r.width) * 100) }));
            }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${volumes[track.id]}%`,
                background: `linear-gradient(90deg, ${track.color}88, ${track.color})`,
                boxShadow: `0 0 4px ${track.color}`,
              }} />
          </div>
        </div>
      </div>
    );
  };

  /* ── Timeline track lane ───────────────────────────────── */
  const TimelineLane = ({ track, compact = false }: { track: typeof TRACKS[0]; compact?: boolean }) => {
    const isActive = activeTrack === track.id;
    const h = compact ? 12 : 16;
    return (
      <div
        onClick={() => setActiveTrack(track.id)}
        className={`border-b relative cursor-pointer transition-all ${muted[track.id] ? 'opacity-20' : ''}`}
        style={{
          height: compact ? '48px' : '64px',
          borderColor: '#0D0D20',
          background: isActive ? `${track.color}05` : 'transparent',
        }}>
        <div className="absolute inset-y-2 inset-x-1 rounded overflow-hidden transition-all"
          style={{
            background: `linear-gradient(180deg, ${track.color}12, ${track.color}06)`,
            border: `1px solid ${track.color}${isActive ? '55' : '22'}`,
            boxShadow: isActive ? `0 0 10px ${track.color}22` : 'none',
          }}>
          <WaveformSVG color={track.color} glow={track.glow} height={compact ? 32 : 48} seed={TRACKS.indexOf(track)} />
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col overflow-hidden relative"
      style={{ background: 'linear-gradient(180deg, #020208 0%, #050512 50%, #020208 100%)' }}>
      <DotGrid />
      <ScanLines />

      {/* Top toolbar */}
      <div className="relative z-10 h-10 border-b flex items-center px-4 gap-4 shrink-0"
        style={{
          background: 'linear-gradient(90deg, #050510, #0A0A1A 50%, #050510)',
          borderColor: '#AE06ED22',
          boxShadow: '0 1px 0 #AE06ED11',
        }}>
        <div className="flex items-center gap-2">
          <img src="/melaos-logo-2.png" alt="MELAOS STUDIOS" className="h-7 w-auto"
            style={{ filter: 'drop-shadow(0 0 6px #AE06ED88)' }} />
        </div>
        <div className="w-px h-4 shrink-0" style={{ background: '#AE06ED33' }} />
        <span className="text-[11px] font-mono text-[#333366] tracking-wider truncate">Untitled Project</span>
        <div className="ml-auto flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" style={{ color: '#00FFD1', filter: 'drop-shadow(0 0 3px #00FFD1)' }} />
          <span className="text-[10px] font-mono tracking-wider hidden sm:inline"
            style={{ color: '#00FFD1', textShadow: '0 0 6px #00FFD1' }}>ONLINE</span>
        </div>
      </div>

      {/* ── MOBILE (< lg) ─────────────────────────────────── */}
      <div className="lg:hidden relative z-10 flex flex-col flex-1 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b shrink-0"
          style={{ background: '#050510', borderColor: '#AE06ED22' }}>
          {(['timeline', 'ai', 'lyrics'] as const).map(tab => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              style={{ minHeight: '44px', touchAction: 'manipulation' }}
              className="flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative">
              <span style={{
                color: mobileTab === tab ? '#AE06ED' : '#333366',
                textShadow: mobileTab === tab ? '0 0 8px #AE06ED' : 'none',
              }}>
                {tab === 'ai' ? 'AI Generate' : tab === 'lyrics' ? 'Lyrics' : 'Timeline'}
              </span>
              {mobileTab === tab && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                  style={{ background: '#AE06ED', boxShadow: '0 0 6px #AE06ED' }} />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {mobileTab === 'timeline' && (
            <div className="flex flex-col h-full">
              {/* Section markers */}
              <div className="h-7 border-b flex shrink-0 sticky top-0 z-10"
                style={{ background: '#030310', borderColor: '#0D0D20' }}>
                {SECTIONS.map((s, i) => (
                  <div key={i} className="flex-1 border-r flex items-center justify-center"
                    style={{ borderColor: '#0D0D20' }}>
                    <span className="text-[7px] font-black tracking-[0.2em] uppercase"
                      style={{ color: i % 2 === 0 ? '#AE06ED55' : '#007AFF44' }}>{s}</span>
                  </div>
                ))}
              </div>
              {TRACKS.map(track => (
                <div key={track.id} className={`h-12 border-b relative flex items-center ${muted[track.id] ? 'opacity-20' : ''}`}
                  style={{ borderColor: '#0D0D20' }}>
                  <div className="w-16 shrink-0 flex items-center gap-1 px-2 h-full border-r"
                    style={{ borderColor: '#0D0D20', background: '#030310' }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: track.color, boxShadow: `0 0 4px ${track.color}` }} />
                    <span className="text-[9px] font-bold truncate tracking-wider"
                      style={{ color: track.color }}>{track.name}</span>
                  </div>
                  <div className="flex-1 h-full relative overflow-hidden">
                    <div className="absolute inset-y-1 left-1 right-1 rounded overflow-hidden"
                      style={{
                        background: `${track.color}10`,
                        border: `1px solid ${track.color}30`,
                      }}>
                      <WaveformSVG color={track.color} glow={track.glow} height={38} seed={TRACKS.indexOf(track)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mobileTab === 'ai' && (
            <div className="overflow-y-auto">{AIPanel()}</div>
          )}

          {mobileTab === 'lyrics' && (
            <div className="p-3 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Mic2 className="w-3.5 h-3.5" style={{ color: '#AE06ED', filter: 'drop-shadow(0 0 3px #AE06ED)' }} />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: '#AE06ED' }}>Lyrics Editor</span>
              </div>
              <textarea value={lyrics} onChange={e => setLyrics(e.target.value)}
                style={{ fontSize: '13px', background: 'transparent', color: '#7788AA', letterSpacing: '0.03em' }}
                className="flex-1 font-mono text-xs resize-none focus:outline-none leading-relaxed"
                spellCheck={false} />
            </div>
          )}
        </div>

        <TransportBar />
      </div>

      {/* ── DESKTOP (lg+) ──────────────────────────────────── */}
      <div className="hidden lg:flex relative z-10 flex-1 overflow-hidden">

        {/* Track sidebar */}
        <div className="w-52 border-r flex flex-col shrink-0 overflow-y-auto"
          style={{ background: '#030310', borderColor: '#AE06ED22' }}>
          <div className="h-9 border-b flex items-center px-3 gap-2 shrink-0"
            style={{ background: '#050510', borderColor: '#0D0D20' }}>
            <Layers className="w-3 h-3" style={{ color: '#AE06ED' }} />
            <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: '#AE06ED' }}>Tracks</span>
          </div>
          {TRACKS.map(track => <TrackRow key={track.id} track={track} />)}
        </div>

        {/* Center — timeline + transport + lyrics */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Section markers */}
          <div className="h-8 border-b flex shrink-0"
            style={{ background: '#030310', borderColor: '#0D0D20' }}>
            {SECTIONS.map((s, i) => (
              <div key={i} className="flex-1 border-r flex items-center justify-center"
                style={{ borderColor: '#0D0D20' }}>
                <span className="text-[8px] font-black tracking-[0.2em] uppercase"
                  style={{ color: i % 2 === 0 ? '#AE06ED44' : '#007AFF33' }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto relative min-h-0">
            {/* Playhead */}
            <div className="absolute top-0 bottom-0 w-px z-20 pointer-events-none transition-all"
              style={{
                left: `${playheadPct}%`,
                background: 'linear-gradient(180deg, #FF2D78, #FF2D7888)',
                boxShadow: '0 0 8px #FF2D78, 0 0 16px #FF2D7844',
              }}>
              <div className="w-3 h-3 rounded-full absolute -top-1 -left-[5px]"
                style={{ background: '#FF2D78', boxShadow: '0 0 8px #FF2D78' }} />
            </div>

            {TRACKS.map(track => <TimelineLane key={track.id} track={track} />)}
          </div>

          <TransportBar />

          {/* Lyrics editor */}
          <div className="h-44 border-t p-3 overflow-hidden shrink-0"
            style={{
              background: 'linear-gradient(180deg, #030310, #050512)',
              borderColor: '#AE06ED22',
            }}>
            <div className="flex items-center gap-2 mb-2">
              <Mic2 className="w-3.5 h-3.5" style={{ color: '#AE06ED', filter: 'drop-shadow(0 0 3px #AE06ED)' }} />
              <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: '#AE06ED' }}>Lyrics Editor</span>
            </div>
            <textarea value={lyrics} onChange={e => setLyrics(e.target.value)}
              style={{ fontSize: '12px', background: 'transparent', color: '#556677', letterSpacing: '0.03em' }}
              className="w-full h-32 font-mono resize-none focus:outline-none leading-relaxed"
              spellCheck={false} />
          </div>
        </div>

        {/* Right panel — AI */}
        {panelOpen && (
          <div className="w-72 border-l flex flex-col shrink-0 overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, #030310, #050512)',
              borderColor: '#AE06ED22',
              boxShadow: '-1px 0 0 #AE06ED11',
            }}>
            <div className="h-9 border-b flex items-center px-4 gap-2 shrink-0"
              style={{ background: '#050510', borderColor: '#0D0D20' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#AE06ED', filter: 'drop-shadow(0 0 4px #AE06ED)' }} />
              <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: '#AE06ED' }}>AI Generate</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FFD1', boxShadow: '0 0 4px #00FFD1' }} />
                <span className="text-[8px] font-mono" style={{ color: '#00FFD1' }}>READY</span>
              </div>
            </div>
            {AIPanel()}
          </div>
        )}
      </div>
    </div>
  );
}
