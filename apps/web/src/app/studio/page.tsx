'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SkipBack, Play, Pause, Square, Circle, Repeat,
  ChevronLeft, ChevronRight, Mic2, Loader2, Check,
  Zap, Activity, Cpu, Layers, Clock3, Sparkles, SlidersHorizontal,
} from 'lucide-react';
import { generateTrack } from '@/lib/musicSynth';
import { GENRES as GENRE_LIST, MOODS as MOOD_LIST, genreArtStyle } from '@/lib/genreProfiles';
import StudioWaveform from '@/components/StudioWaveform';
import type WaveSurfer from 'wavesurfer.js';

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
const GENRES   = [...GENRE_LIST];
const MOODS    = [...MOOD_LIST];

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
// Decodes the actual generated audio and reduces it to per-segment peak
// amplitudes, so every track lane's waveform reflects the real song's
// energy/dynamics instead of a decorative fixed sine curve.
async function extractWaveformPeaks(audioUrl: string, numPeaks = 200): Promise<number[]> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const res = await fetch(audioUrl);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channelData.length / numPeaks));
    const peaks: number[] = [];
    for (let i = 0; i < numPeaks; i++) {
      const start = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) sum += Math.abs(channelData[start + j] || 0);
      peaks.push(sum / blockSize);
    }
    const max = Math.max(...peaks, 0.0001);
    return peaks.map(p => p / max);
  } finally {
    ctx.close().catch(() => {});
  }
}

const W = 600;
// Pro Tools-style vertical peak/bar waveform, mirrored around a center
// zero-line, drawn on a filled clip background with rounded clip corners.
// Renders real decoded peak data when available (post-generation); falls
// back to a placeholder shape beforehand. Each track applies a subtle
// per-track jitter to the same real peak data so lanes read as related
// (same song) rather than identical copies.
//
// All computed coordinates are rounded with .toFixed() before being used —
// Math.sin can differ in its last bit between Node (SSR) and the browser
// (CSR), which otherwise causes a hydration mismatch.
function WaveformSVG({ color, height = 40, seed = 0, peaks }: { color: string; glow?: string; height?: number; seed?: number; peaks?: number[] | null }) {
  const barCount = 100;
  const amps = Array.from({ length: barCount }, (_, i) => {
    let raw: number;
    if (peaks && peaks.length > 0) {
      const idx = Math.min(peaks.length - 1, Math.floor((i / barCount) * peaks.length));
      const base = peaks[idx];
      const jitter = 1 + Math.sin(i * 0.6 + seed * 3.1) * 0.15;
      raw = Math.max(0.05, Math.min(1, base * jitter));
    } else {
      raw = 0.22 + Math.abs(Math.sin(i * 0.35 + seed)) * 0.5 + Math.abs(Math.sin(i * 1.3 + seed * 2)) * 0.15;
    }
    return Number(raw.toFixed(4));
  });
  const barW = W / barCount;
  const bars = amps.map((amp, i) => {
    const barH = Number(Math.max(1.5, amp * (height * 0.92)).toFixed(2));
    const x = Number((i * barW + barW * 0.18).toFixed(2));
    const y = Number(((height - barH) / 2).toFixed(2));
    return <rect key={i} x={x} y={y} width={(barW * 0.64).toFixed(2)} height={barH} rx={(barW * 0.3).toFixed(2)} fill={color} />;
  });
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {/* Zero (center) line — a defining Pro Tools waveform cue */}
      <line x1="0" y1={height / 2} x2={W} y2={height / 2} stroke={color} strokeOpacity="0.2" strokeWidth="1" />
      <g opacity="0.95">{bars}</g>
    </svg>
  );
}

/* ─── Bar/tick ruler ──────────────────────────────────── */
// Pro Tools-style bar ruler: numbered bar marks with minor tick subdivisions.
function BarRuler({ compact = false }: { compact?: boolean }) {
  const BARS = 32;
  return (
    <div className="h-5 border-b flex shrink-0 relative select-none"
      style={{ background: '#020208', borderColor: '#0D0D20' }}>
      {Array.from({ length: BARS }, (_, i) => (
        <div key={i} className="flex-1 relative border-r" style={{ borderColor: '#0D0D2088' }}>
          {i % 4 === 0 && (
            <span className="absolute left-0.5 top-0 text-[7px] font-mono" style={{ color: '#445566' }}>{i + 1}</span>
          )}
          <div className="absolute bottom-0 left-1/2 w-px" style={{ height: i % 4 === 0 ? '6px' : '3px', background: '#1a1a3a' }} />
        </div>
      ))}
    </div>
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

/* ─── Stamp the MELAOS logo onto a generated image ────────── */
function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const logo = new window.Image();
    logo.onload = () => resolve(logo);
    logo.onerror = reject;
    logo.src = '/melaos-logo-3.png';
  });
}

async function watermarkImage(img: HTMLImageElement): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');
  ctx.drawImage(img, 0, 0);

  const logo = await loadLogo();
  const logoW = canvas.width * 0.28;
  const logoH = logoW * (logo.naturalHeight / logo.naturalWidth);
  const pad = canvas.width * 0.03;
  ctx.globalAlpha = 0.85;
  ctx.drawImage(logo, canvas.width - logoW - pad, canvas.height - logoH - pad, logoW, logoH);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png'); // throws if canvas is CORS-tainted
}

type MobileTab = 'timeline' | 'ai' | 'mix';

export default function StudioPage() {
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [timeMs,       setTimeMs]       = useState(0);
  const [bpm,          setBpm]          = useState(120);
  const [playheadPct,  setPlayheadPct]  = useState(0);
  const [looping,      setLooping]      = useState(false);
  const [editMode,     setEditMode]     = useState<'Shuffle' | 'Slip' | 'Spot' | 'Grid'>('Grid');
  const [gridValue,    setGridValue]    = useState('1/4 Note');
  const [recordArmed,  setRecordArmed]  = useState<Record<string, boolean>>({});
  const GRID_VALUES = ['1 Bar', '1/2 Note', '1/4 Note', '1/8 Note', '1/16 Note'];
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
  const [waveformPeaks,setWaveformPeaks]= useState<number[] | null>(null);
  const [audioEl,      setAudioEl]      = useState<HTMLAudioElement | null>(null);
  const [lyrics,       setLyrics]       = useState(DEFAULT_LYRICS);
  const [activeTrack,  setActiveTrack]  = useState<string | null>('t1');
  const [editTool,     setEditTool]     = useState<'zoom' | 'trim' | 'selector' | 'grabber' | 'scrub' | 'pencil'>('selector');
  const [pinnedTracks, setPinnedTracks] = useState<Record<string, boolean>>({});
  const [zoomLevel,    setZoomLevel]    = useState(50); // px/sec, passed to WaveSurfer.zoom()
  const [tick,         setTick]         = useState(0);
  const [pan,          setPan]          = useState<Record<string, number>>(
    Object.fromEntries(TRACKS.map(t => [t.id, 50]))
  );
  const [eq,           setEq]           = useState<Record<string, [number,number,number]>>(
    Object.fromEntries(TRACKS.map(t => [t.id, [50, 50, 50] as [number,number,number]]))
  );
  const [masterVol,    setMasterVol]    = useState(85);
  const [aiTab,          setAiTab]          = useState<'simple' | 'advanced' | 'lyrics'>('simple');
  const advancedMode = aiTab === 'advanced';
  const [instrumental,   setInstrumental]   = useState(false);
  const [coverArtUrl,    setCoverArtUrl]    = useState<string | null>(null);
  const [coverArtLoading,setCoverArtLoading]= useState(false);

  const STYLE_SUGGESTIONS: Record<string, string[]> = {
    'Hip-Hop': ['boom bap', 'lofi', 'west coast', 'lyrical', 'boom bap drums'],
    'Trap':    ['808 heavy', 'dark melody', 'skittering hats', 'triplet flow', 'drill'],
    'R&B':     ['smooth vocals', 'neo soul', 'falsetto', 'jazzy chords', 'slow jam'],
    'Afrobeats':['afropop', 'highlife', 'dancehall', 'percussion heavy', 'amapiano'],
    'Electronic':['house', 'techno', 'synth wave', 'bass drop', 'euphoric build'],
    'Pop':     ['catchy hook', 'bright synths', 'anthemic', 'upbeat', 'radio ready'],
    'Soul':    ['gospel feel', 'vintage', 'warm bass', 'lush strings', 'blues'],
    'Drill':   ['dark', 'sliding bass', 'off beat snares', 'aggressive', 'uk drill'],
    'Reggaeton':['dembow riddim', 'perreo', 'brassy synths', 'urbano', 'club ready'],
    'Dembow':  ['Dominican dembow', 'raw street energy', 'rapid flow', 'distorted bass', 'tipico'],
    'Bachata': ['requinto guitar', 'bongo groove', 'romantic', 'bolero roots', 'güira'],
    'Salsa':   ['clave rhythm', 'piano montuno', 'horn section', 'conga heavy', 'son cubano'],
    'Merengue':['tambora drum', 'güira scraper', 'fast two-step', 'accordion', 'carnival energy'],
    'Cumbia':  ['accordion melody', 'guacharaca', 'tropical groove', 'folkloric', 'mid-tempo sway'],
    'Reggae':  ['one-drop', 'offbeat skank', 'dub space', 'island groove', 'roots reggae'],
    'Latin Trap':['trapeton', 'Spanish flow', 'dark 808s', 'urbano fusion', 'street anthem'],
  };

  const intervalRef   = useRef<NodeJS.Timeout | null>(null);
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const wsInstanceRef = useRef<WaveSurfer | null>(null);

  // Real-time level from the actual generated audio's signal, sampled once
  // per playback tick — drives the mixing board meters so they pulse with
  // this song's real energy instead of random flicker.
  const getRealLevel = useCallback((): number => {
    const analyser = analyserRef.current;
    if (!analyser) return 0;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum / data.length / 255;
  }, []);

  // Tab to Transients — a real Pro Tools editing feature: jump the playhead
  // to the next/previous detected transient (a sharp rise in amplitude)
  // using the actual decoded peak data from the generated song, not a
  // fixed grid step.
  const jumpToTransient = useCallback((direction: 1 | -1) => {
    const peaks = waveformPeaks;
    const audio = audioRef.current;
    if (!peaks || peaks.length < 2 || !audio || !audio.duration) return;
    const currentIdx = Math.floor((audio.currentTime / audio.duration) * peaks.length);
    const threshold = 0.35;
    let idx = currentIdx + direction;
    while (idx > 0 && idx < peaks.length - 1) {
      if (peaks[idx] > threshold && peaks[idx] > peaks[idx - 1] * 1.3) break;
      idx += direction;
    }
    idx = Math.max(0, Math.min(peaks.length - 1, idx));
    const newTime = (idx / peaks.length) * audio.duration;
    audio.currentTime = newTime;
    setPlayheadPct((newTime / audio.duration) * 100);
    setTimeMs(Math.floor(newTime * 1000));
  }, [waveformPeaks]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return; // don't hijack form navigation
      if (!waveformPeaks) return;
      e.preventDefault();
      jumpToTransient(e.shiftKey ? -1 : 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [jumpToTransient, waveformPeaks]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(z => {
      const next = Math.min(500, z + 25);
      wsInstanceRef.current?.zoom(next);
      return next;
    });
  }, []);
  const handleZoomOut = useCallback(() => {
    setZoomLevel(z => {
      const next = Math.max(10, z - 25);
      wsInstanceRef.current?.zoom(next);
      return next;
    });
  }, []);

  const togglePin = (id: string) => setPinnedTracks(p => ({ ...p, [id]: !p[id] }));
  const orderedTracks = [...TRACKS].sort((a, b) => (pinnedTracks[b.id] ? 1 : 0) - (pinnedTracks[a.id] ? 1 : 0));

  const EDIT_TOOLS = [
    { id: 'zoom', icon: '🔍', label: 'Zoom' },
    { id: 'trim', icon: '✂️', label: 'Trim' },
    { id: 'selector', icon: 'I', label: 'Selector' },
    { id: 'grabber', icon: '✋', label: 'Grabber' },
    { id: 'scrub', icon: '↔', label: 'Scrub' },
    { id: 'pencil', icon: '✏️', label: 'Pencil' },
  ] as const;

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

  // Pro Tools' primary counter — Bars|Beats|Ticks (960 ticks per beat,
  // assumes 4/4) — derived from elapsed time and the current BPM.
  const formatBarsBeats = (ms: number, currentBpm: number) => {
    const beatMs = 60000 / currentBpm;
    const totalBeats = ms / beatMs;
    const bar = Math.floor(totalBeats / 4) + 1;
    const beat = Math.floor(totalBeats % 4) + 1;
    const ticks = Math.floor((totalBeats % 1) * 960);
    return `${bar}|${beat}|${String(ticks).padStart(3, '0')}`;
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenProgress(0);
    setGenDone(false);
    setGenError(null);
    setAudioUrl(null);
    setWaveformPeaks(null);
    setIsPlaying(false);

    // Animate progress bar while waiting for API (~20-30s)
    let p = 0;
    progressTimer.current = setInterval(() => {
      p = Math.min(p + Math.random() * 2 + 0.5, 88); // cap at 88% until real response
      setGenProgress(Math.round(p));
    }, 400);

    try {
      // Try the real AI generator first (Replicate-hosted MusicGen for
      // instrumentals, MiniMax Music-1.5 for vocal tracks); fall back to the
      // client-side synth if it's unavailable, slow, or out of credit.
      let resolvedAudioUrl: string;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 85_000);
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt, genre, mood, bpm: genBpm, vocals: vocalGender, lyrics,
            duration: vocalGender === 'none' ? 15 : 30,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('AI generator unavailable');
        const json = await res.json();
        if (!json.audioUrl) throw new Error('AI generator returned no audio');
        resolvedAudioUrl = json.audioUrl;
      } catch {
        resolvedAudioUrl = await generateTrack(genre, mood, genBpm, vocalGender);
      }

      clearInterval(progressTimer.current!);
      const data = { audioUrl: resolvedAudioUrl, title: `${genre} · ${mood} · ${genBpm}bpm`, duration: 30 };
      setGenProgress(100);

      // Load the returned audio URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioRef.current = new Audio(data.audioUrl);
      audioRef.current.preload = 'auto';
      audioRef.current.volume = 0.9;
      audioRef.current.crossOrigin = 'anonymous';
      setAudioEl(audioRef.current);

      // Route through an AnalyserNode so the mixing board meters can read
      // this song's real signal level during playback.
      try {
        if (!audioCtxRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioCtx();
        }
        const source = audioCtxRef.current.createMediaElementSource(audioRef.current);
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
        analyserRef.current = analyser;
      } catch {
        analyserRef.current = null; // meters fall back to a static look — playback is unaffected
      }

      // Sync playhead from real audio
      audioRef.current.ontimeupdate = () => {
        const a = audioRef.current!;
        if (a.duration) setPlayheadPct((a.currentTime / a.duration) * 100);
        setTimeMs(Math.floor(a.currentTime * 1000));
      };
      audioRef.current.onended = () => { setIsPlaying(false); setPlayheadPct(0); setTimeMs(0); };

      setAudioUrl(data.audioUrl);
      setWaveformPeaks(null);
      // Decode the real audio into peak data so the timeline waveforms
      // reflect this song's actual dynamics instead of a placeholder shape.
      extractWaveformPeaks(data.audioUrl).then(setWaveformPeaks).catch(() => setWaveformPeaks(null));
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
  const toggleRecordArm = (id: string) => setRecordArmed(r => ({ ...r, [id]: !r[id] }));
  // I/O routing labels, one per track — decorative but authentic to a real
  // console's channel strip, cycling through the interface's input pairs.
  const trackIO = (trackId: string) => `A ${(TRACKS.findIndex(t => t.id === trackId) % 4) * 2 + 1}-${(TRACKS.findIndex(t => t.id === trackId) % 4) * 2 + 2}`;

  const handleGenerateCoverArt = useCallback(async () => {
    setCoverArtLoading(true);
    setCoverArtUrl(null);
    const moodMap: Record<string, string> = {
      'Energetic':  'high energy explosive dynamic',
      'Dark':       'dark shadowy brooding cinematic',
      'Chill':      'calm peaceful lo-fi dreamy',
      'Romantic':   'sensual warm intimate candlelit',
      'Sensual':    'sultry intimate slow-burn candlelit',
      'Festive':    'celebratory vibrant carnival energy',
      'Nostalgic':  'wistful retro warm-toned vintage',
      'Aggressive': 'raw intense powerful urban gritty',
      'Melancholic':'melancholic emotional soft blue tones',
      'Euphoric':   'uplifting bright golden hopeful',
    };
    const base = prompt.trim() || `${genre} music`;
    const style = genreArtStyle(genre);
    const moodStr = moodMap[mood] || mood.toLowerCase();
    const artPrompt = `album cover art, ${base}, ${style}, ${moodStr} mood, ${genBpm} BPM, professional music artwork, square format, no text, no words`;
    const seed = Math.floor(Math.random() * 999999);
    // Routed through our own API so the image is same-origin (Pollinations
    // 403s direct browser CORS requests, which would taint the watermark canvas).
    const url = `/api/cover-art?prompt=${encodeURIComponent(artPrompt)}&seed=${seed}`;
    const img = new window.Image();
    img.onload = async () => {
      try {
        const watermarked = await watermarkImage(img);
        setCoverArtUrl(watermarked);
      } catch {
        setCoverArtUrl(url); // fallback — show art unwatermarked
      } finally {
        setCoverArtLoading(false);
      }
    };
    img.onerror = () => { setCoverArtLoading(false); };
    img.src = url;
  }, [genre, mood, genBpm, prompt]);

  /* ── Shared: AI panel ──────────────────────────────────── */
  const AIPanel = () => (
    <div className="p-4 flex flex-col gap-4">
      {/* Simple / Advanced / Lyrics toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center bg-[#0A0A14] border border-[#1a1a3a] rounded-full p-0.5 gap-0.5">
          {([['simple', 'Simple'], ['advanced', 'Advanced'], ['lyrics', 'Lyrics']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setAiTab(key)}
              style={{ minHeight: '32px', touchAction: 'manipulation' }}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                aiTab === key
                  ? 'bg-[#AE06ED] text-white shadow-lg'
                  : 'text-[#444466] hover:text-[#8888AA]'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setInstrumental(v => !v)}
          style={{ minHeight: '32px', touchAction: 'manipulation' }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            instrumental
              ? 'border-[#00FFD1] bg-[#00FFD1]/10 text-[#00FFD1]'
              : 'border-[#1a1a3a] text-[#444466] hover:border-[#333355]'
          }`}>
          ♪ Instrumental
        </button>
      </div>

      {/* Prompt — hidden on the dedicated Lyrics tab */}
      {aiTab !== 'lyrics' && (
        <div>
          <label className="text-[10px] font-bold text-[#AE06ED] mb-1.5 block tracking-[0.15em] uppercase">
            ◈ {advancedMode ? 'Song Style / Description' : 'Describe Your Song'}
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="A dark trap banger with 808s, auto-tune vocals, and a haunting piano melody..."
              className="w-full bg-black/60 border border-[#AE06ED]/40 rounded-lg p-3 text-sm text-[#E0E0FF] placeholder:text-[#444466] focus:outline-none focus:border-[#AE06ED] resize-none transition-all"
              style={{
                fontSize: '14px',
                background: 'rgba(0,0,0,0.6)',
                boxShadow: 'inset 0 0 20px rgba(174,6,237,0.05)',
              }}
            />
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#444466]">{prompt.length}/500</div>
          </div>
          {/* Style tag suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(STYLE_SUGGESTIONS[genre] || STYLE_SUGGESTIONS['Hip-Hop']).map(tag => (
              <button key={tag} onClick={() => setPrompt(p => p ? `${p}, ${tag}` : tag)}
                style={{ touchAction: 'manipulation' }}
                className="px-2 py-0.5 rounded-full bg-[#1a0a2a] border border-[#AE06ED]/30 text-[#AE06ED]/70 text-[10px] hover:border-[#AE06ED] hover:text-[#AE06ED] transition-all">
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced: compact lyrics field */}
      {aiTab === 'advanced' && (
        <div>
          <label className="text-[10px] font-bold text-[#F28C28] mb-1.5 block tracking-[0.15em] uppercase">◈ Custom Lyrics (optional)</label>
          <textarea
            value={lyrics}
            onChange={e => setLyrics(e.target.value)}
            rows={4}
            placeholder={"[Verse 1]\nWrite your lyrics here...\n\n[Chorus]\n..."}
            className="w-full bg-black/60 border border-[#F28C28]/30 rounded-lg p-3 text-sm text-[#E0E0FF] placeholder:text-[#444466] focus:outline-none focus:border-[#F28C28] resize-none transition-all font-mono"
            style={{ fontSize: '13px', background: 'rgba(0,0,0,0.6)' }}
          />
        </div>
      )}

      {/* Lyrics tab: dedicated full-width lyrics workspace */}
      {aiTab === 'lyrics' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold text-[#F28C28] tracking-[0.15em] uppercase">◈ Lyrics</label>
            <span className="text-[9px] font-mono text-[#444466]">{lyrics.length} chars</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {['[Verse]', '[Chorus]', '[Bridge]', '[Outro]', '[Intro]'].map(tag => (
              <button key={tag} onClick={() => setLyrics(l => l ? `${l}\n\n${tag}\n` : `${tag}\n`)}
                style={{ touchAction: 'manipulation' }}
                className="px-2 py-0.5 rounded-full bg-[#1a0a00] border border-[#F28C28]/30 text-[#F28C28]/80 text-[10px] hover:border-[#F28C28] hover:text-[#F28C28] transition-all">
                + {tag}
              </button>
            ))}
          </div>
          <textarea
            value={lyrics}
            onChange={e => setLyrics(e.target.value)}
            rows={12}
            placeholder={"[Verse]\nWrite your lyrics here...\n\n[Chorus]\nThe hook everyone remembers...\n\n[Bridge]\n..."}
            className="w-full bg-black/60 border border-[#F28C28]/30 rounded-lg p-3 text-sm text-[#E0E0FF] placeholder:text-[#444466] focus:outline-none focus:border-[#F28C28] resize-none transition-all font-mono leading-relaxed"
            style={{ fontSize: '13px', background: 'rgba(0,0,0,0.6)' }}
          />
          <p className="text-[10px] text-[#444466] mt-1.5">
            Pick a genre, mood, and BPM below, then hit Generate — these lyrics become the vocal track.
          </p>
        </div>
      )}

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

      {/* Vocals — hidden when instrumental */}
      {!instrumental && <div>
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
      </div>}

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

      {/* ── Cover Art Generator ── */}
      <div className="border-t pt-4" style={{ borderColor: '#1a1a3a' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-bold text-[#E91E8C] tracking-[0.15em] uppercase">◈ Cover Art</label>
          <button
            onClick={handleGenerateCoverArt}
            disabled={coverArtLoading}
            style={{
              minHeight: '32px', touchAction: 'manipulation',
              boxShadow: coverArtLoading ? 'none' : '0 0 12px rgba(233,30,140,0.35)',
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
              coverArtLoading
                ? 'border-[#1a1a3a] text-[#333355] cursor-not-allowed'
                : 'border-[#E91E8C]/60 text-[#E91E8C] hover:bg-[#E91E8C]/10'
            }`}
          >
            {coverArtLoading
              ? <><span className="w-2.5 h-2.5 border border-[#E91E8C] border-t-transparent rounded-full animate-spin" /> Generating...</>
              : coverArtUrl ? '↺ Regenerate' : '✦ Generate'
            }
          </button>
        </div>

        {/* Art preview */}
        {coverArtLoading && (
          <div className="w-full aspect-square rounded-xl bg-[#0A0A14] border border-[#1a1a3a] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E91E8C] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono text-[#444466] tracking-widest">AI PAINTING...</p>
          </div>
        )}

        {coverArtUrl && !coverArtLoading && (
          <div className="relative group">
            <img
              src={coverArtUrl}
              alt="Generated cover art"
              className="w-full aspect-square rounded-xl object-cover border border-[#E91E8C]/30"
              style={{ boxShadow: '0 0 24px rgba(233,30,140,0.2)' }}
            />
            {/* Download overlay */}
            <div className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <a
                href={coverArtUrl}
                download="melaos-cover-art.jpg"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
              >
                ↓ Save
              </a>
              <button
                onClick={handleGenerateCoverArt}
                className="flex items-center gap-1.5 px-4 py-2 border border-white/60 text-white text-xs font-bold rounded-full hover:scale-105 transition-transform"
              >
                ↺ New
              </button>
            </div>
          </div>
        )}

        {!coverArtUrl && !coverArtLoading && (
          <div
            onClick={handleGenerateCoverArt}
            className="w-full aspect-square rounded-xl border-2 border-dashed border-[#1a1a3a] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#E91E8C]/40 transition-colors group"
          >
            <span className="text-3xl opacity-20 group-hover:opacity-40 transition-opacity">🎨</span>
            <p className="text-[10px] text-[#333355] group-hover:text-[#E91E8C]/60 transition-colors font-mono tracking-widest">CLICK TO GENERATE</p>
          </div>
        )}
      </div>
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

      {/* Edit mode — Shuffle / Slip / Spot / Grid */}
      <div className="hidden md:flex items-center rounded overflow-hidden border shrink-0"
        style={{ borderColor: '#1a1a3a', background: '#020208' }}>
        {(['Shuffle', 'Slip', 'Spot', 'Grid'] as const).map(m => (
          <button key={m} onClick={() => setEditMode(m)}
            style={{ minHeight: '28px', touchAction: 'manipulation' }}
            className={`px-2 text-[9px] font-bold tracking-wide transition-all ${
              editMode === m ? 'bg-[#AE06ED]/20 text-[#AE06ED]' : 'text-[#333355] hover:text-[#8888AA]'
            }`}>
            {m}
          </button>
        ))}
      </div>

      <div className="h-5 w-px mx-1 shrink-0 hidden md:block" style={{ background: 'linear-gradient(180deg, transparent, #AE06ED44, transparent)' }} />

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

      {/* Bars|Beats — Pro Tools' primary counter */}
      <div className="hidden sm:block font-mono text-xs px-2 py-1 rounded shrink-0 border"
        style={{
          background: '#020208',
          borderColor: '#00FFD133',
          color: '#00FFD1',
          textShadow: '0 0 8px #00FFD1',
          boxShadow: '0 0 12px #00FFD122',
          letterSpacing: '0.1em',
        }}>
        {formatBarsBeats(timeMs, bpm)}
      </div>

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

      <div className="h-5 w-px mx-1 shrink-0 hidden lg:block" style={{ background: 'linear-gradient(180deg, transparent, #F28C2844, transparent)' }} />

      {/* Grid + Nudge */}
      <div className="hidden lg:flex items-center gap-1 shrink-0">
        <select value={gridValue} onChange={e => setGridValue(e.target.value)}
          style={{ minHeight: '28px', background: '#020208', borderColor: '#F28C2844', color: '#F28C28' }}
          className="text-[9px] font-mono rounded px-1.5 border focus:outline-none">
          {GRID_VALUES.map(g => <option key={g} value={g} style={{ background: '#0A0A14' }}>{g}</option>)}
        </select>
      </div>

      {/* VU meter dots — driven by the real generated audio's signal level */}
      <div className="hidden lg:flex items-end gap-0.5 h-5 ml-2 shrink-0">
        {Array.from({ length: 12 }, (_, i) => {
          const lvl = isPlaying ? getRealLevel() : 0;
          const active = lvl * 12 > i;
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
          <button onClick={e => { e.stopPropagation(); togglePin(track.id); }}
            className="text-[9px] shrink-0 transition-colors"
            style={{ color: pinnedTracks[track.id] ? '#F28C28' : '#2a2a44' }}
            aria-label="Pin track to top" title="Pin track">📌</button>
          <span className="text-[7px] font-mono shrink-0" style={{ color: '#2a2a44' }}>{trackIO(track.id)}</span>
        </div>
        <div className="flex items-center gap-1 ml-3">
          <button onClick={e => { e.stopPropagation(); toggleRecordArm(track.id); }}
            className="text-[9px] font-black w-4 h-4 rounded-full transition-all border flex items-center justify-center shrink-0"
            style={{
              background: recordArmed[track.id] ? '#FF2D78' : 'transparent',
              borderColor: recordArmed[track.id] ? '#FF2D78' : '#1a1a3a',
              boxShadow: recordArmed[track.id] ? '0 0 6px #FF2D78' : 'none',
            }} aria-label="Record enable" />
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
          <WaveformSVG color={track.color} glow={track.glow} height={compact ? 32 : 48} seed={TRACKS.indexOf(track)} peaks={waveformPeaks} />
        </div>
      </div>
    );
  };

  /* ── Knob helper ──────────────────────────────────────── */
  const Knob = ({ value, onChange, color, size = 32 }: { value: number; onChange: (v: number) => void; color: string; size?: number }) => {
    const angle = -135 + (value / 100) * 270;
    return (
      <div className="relative flex items-center justify-center cursor-pointer select-none"
        style={{ width: size, height: size }}
        onMouseDown={e => {
          const startY = e.clientY, startVal = value;
          const move = (ev: MouseEvent) => onChange(Math.max(0, Math.min(100, startVal - (ev.clientY - startY) * 0.8)));
          const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
          window.addEventListener('mousemove', move);
          window.addEventListener('mouseup', up);
        }}>
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="#0A0A18" stroke={`${color}33`} strokeWidth="1.5" />
          <circle cx="16" cy="16" r="10" fill={`${color}10`} />
          <line x1="16" y1="16"
            x2={16 + 8 * Math.sin((angle * Math.PI) / 180)}
            y2={16 - 8 * Math.cos((angle * Math.PI) / 180)}
            stroke={color} strokeWidth="2" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
          <circle cx="16" cy="16" r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
      </div>
    );
  };

  /* ── Mixing board ──────────────────────────────────────── */
  const MixingBoard = () => (
    <div className="border-t shrink-0 overflow-x-auto"
      style={{
        background: 'linear-gradient(180deg, #02020C, #050514)',
        borderColor: '#AE06ED33',
        boxShadow: '0 -2px 20px rgba(174,6,237,0.1)',
      }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b shrink-0"
        style={{ borderColor: '#0D0D20', background: '#030310' }}>
        <Cpu className="w-3 h-3" style={{ color: '#F28C28', filter: 'drop-shadow(0 0 3px #F28C28)' }} />
        <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: '#F28C28' }}>Mixing Board</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[8px] font-mono" style={{ color: '#333366' }}>EQ · PAN · FADER</span>
        </div>
      </div>

      {/* Channel strips — same pinned-first order as the track sidebar */}
      <div className="flex gap-0 py-2 px-1 min-w-max">
        {orderedTracks.map(track => {
          const [bass, mid, treble] = eq[track.id] || [50, 50, 50];
          const vol = volumes[track.id] ?? 80;
          const panVal = pan[track.id] ?? 50;
          const isActive = activeTrack === track.id;
          return (
            <div key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all"
              style={{
                width: '72px',
                padding: '6px 4px',
                background: isActive ? `${track.color}08` : 'transparent',
                borderRight: '1px solid #0D0D20',
                boxShadow: isActive ? `inset 0 0 12px ${track.color}11` : 'none',
              }}>
              {/* Track name */}
              <div className="w-full flex items-center justify-center gap-1 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: track.color, boxShadow: isActive ? `0 0 5px ${track.color}` : 'none' }} />
                <span className="text-[8px] font-black tracking-wider uppercase truncate"
                  style={{ color: isActive ? track.color : '#334455' }}>{track.name}</span>
              </div>

              {/* EQ knobs: Bass / Mid / Treble */}
              <div className="flex gap-0.5 items-end">
                {([bass, mid, treble] as number[]).map((v, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <Knob value={v} color={i === 0 ? '#F28C28' : i === 1 ? '#00FFD1' : '#007AFF'} size={20}
                      onChange={val => setEq(prev => {
                        const cur = [...(prev[track.id] || [50,50,50])] as [number,number,number];
                        cur[i] = val;
                        return { ...prev, [track.id]: cur };
                      })} />
                    <span className="text-[6px] font-mono" style={{ color: '#222244' }}>
                      {i === 0 ? 'B' : i === 1 ? 'M' : 'T'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pan knob */}
              <div className="flex flex-col items-center gap-0.5">
                <Knob value={panVal} color="#AE06ED" size={22}
                  onChange={val => setPan(p => ({ ...p, [track.id]: val }))} />
                <span className="text-[6px] font-mono" style={{ color: '#222244' }}>
                  {panVal < 45 ? `L${Math.round((50-panVal)*2)}` : panVal > 55 ? `R${Math.round((panVal-50)*2)}` : 'C'}
                </span>
              </div>

              {/* Level meter + fader */}
              <div className="flex gap-1 items-end" style={{ height: '64px' }}>
                {/* Level meter */}
                <div className="flex gap-0.5 items-end h-full">
                  {[0,1].map(ch => {
                    // Real signal level from the generated audio's analyser,
                    // with a small per-track/per-channel offset so the seven
                    // strips don't all move in lockstep despite reading the
                    // same (non-stem-separated) master signal.
                    const trackSeed = TRACKS.indexOf(track);
                    const jitter = 0.85 + 0.3 * Math.abs(Math.sin(trackSeed * 1.7 + ch * 2.3 + tick * 0.4));
                    const lvl = isPlaying && !muted[track.id] ? getRealLevel() * jitter * (vol / 100) : 0;
                    return (
                      <div key={ch} className="w-1.5 h-full flex flex-col-reverse gap-px">
                        {Array.from({length: 12}, (_, i) => (
                          <div key={i} className="w-full rounded-sm transition-all duration-75"
                            style={{
                              height: '4px',
                              background: lvl * 12 > i
                                ? i > 9 ? '#FF2D78' : i > 7 ? '#F28C28' : '#00FFD1'
                                : '#0D0D20',
                              boxShadow: lvl * 12 > i && i > 9 ? '0 0 3px #FF2D78' : 'none',
                            }} />
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Fader */}
                <div className="relative flex flex-col items-center h-full" style={{ width: '16px' }}>
                  <div className="flex-1 w-1 rounded-full mx-auto"
                    style={{ background: '#0D0D1A', border: '1px solid #1a1a3a' }} />
                  <div
                    className="absolute w-4 h-3 rounded cursor-ns-resize"
                    style={{
                      bottom: `calc(${vol}% - 6px)`,
                      background: `linear-gradient(180deg, ${track.color}CC, ${track.color}66)`,
                      boxShadow: `0 0 6px ${track.color}66`,
                      border: `1px solid ${track.color}`,
                    }}
                    onMouseDown={e => {
                      e.stopPropagation();
                      const el = e.currentTarget.parentElement!;
                      const rect = el.getBoundingClientRect();
                      const startY = e.clientY, startVol = vol;
                      const move = (ev: MouseEvent) => {
                        const delta = ((startY - ev.clientY) / rect.height) * 100;
                        setVolumes(v => ({ ...v, [track.id]: Math.max(0, Math.min(100, Math.round(startVol + delta))) }));
                      };
                      const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                      window.addEventListener('mousemove', move);
                      window.addEventListener('mouseup', up);
                    }}
                  />
                </div>
              </div>

              {/* Volume % */}
              <span className="text-[8px] font-mono" style={{ color: track.color, textShadow: isActive ? `0 0 4px ${track.color}` : 'none' }}>{vol}%</span>

              {/* M / S buttons */}
              <div className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); toggleMute(track.id); }}
                  className="text-[7px] font-black px-1 py-0.5 rounded border transition-all"
                  style={{ background: muted[track.id] ? '#F28C2820' : 'transparent', borderColor: muted[track.id] ? '#F28C28' : '#1a1a3a', color: muted[track.id] ? '#F28C28' : '#333355' }}>M</button>
                <button onClick={e => { e.stopPropagation(); toggleSolo(track.id); }}
                  className="text-[7px] font-black px-1 py-0.5 rounded border transition-all"
                  style={{ background: solo[track.id] ? '#007AFF20' : 'transparent', borderColor: solo[track.id] ? '#007AFF' : '#1a1a3a', color: solo[track.id] ? '#007AFF' : '#333355' }}>S</button>
              </div>
            </div>
          );
        })}

        {/* Master bus */}
        <div className="flex flex-col items-center gap-1 ml-1" style={{ width: '72px', padding: '6px 4px', borderLeft: '1px solid #AE06ED33' }}>
          <span className="text-[8px] font-black tracking-wider uppercase" style={{ color: '#AE06ED' }}>MASTER</span>

          {/* Stereo meter */}
          <div className="flex gap-0.5 items-end" style={{ height: '64px', marginTop: '28px' }}>
            {[0,1].map(ch => {
              const lvl = isPlaying ? 0.6 + Math.random() * 0.3 : 0;
              return (
                <div key={ch} className="w-2 h-full flex flex-col-reverse gap-px">
                  {Array.from({length:12}, (_, i) => (
                    <div key={i} className="w-full rounded-sm transition-all duration-75"
                      style={{
                        height:'4px',
                        background: lvl*12>i ? i>9?'#FF2D78':i>7?'#F28C28':'#AE06ED' : '#0D0D20',
                        boxShadow: lvl*12>i&&i>9?'0 0 3px #FF2D78':'none',
                      }} />
                  ))}
                </div>
              );
            })}

            {/* Master fader */}
            <div className="relative flex flex-col items-center h-full ml-1" style={{width:'16px'}}>
              <div className="flex-1 w-1 rounded-full mx-auto" style={{background:'#0D0D1A',border:'1px solid #1a1a3a'}} />
              <div className="absolute w-4 h-3 rounded cursor-ns-resize"
                style={{
                  bottom:`calc(${masterVol}% - 6px)`,
                  background:'linear-gradient(180deg,#AE06EDCC,#AE06ED66)',
                  boxShadow:'0 0 8px #AE06ED66',
                  border:'1px solid #AE06ED',
                }}
                onMouseDown={e => {
                  const el = e.currentTarget.parentElement!;
                  const rect = el.getBoundingClientRect();
                  const startY = e.clientY, startVol = masterVol;
                  const move = (ev: MouseEvent) => {
                    const delta = ((startY - ev.clientY) / rect.height) * 100;
                    setMasterVol(Math.max(0, Math.min(100, Math.round(startVol + delta))));
                  };
                  const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                  window.addEventListener('mousemove', move);
                  window.addEventListener('mouseup', up);
                }} />
            </div>
          </div>

          <span className="text-[8px] font-mono" style={{ color: '#AE06ED', textShadow: '0 0 4px #AE06ED' }}>{masterVol}%</span>
          <span className="text-[6px] font-mono mt-1" style={{ color: '#333355' }}>–{Math.round((100-masterVol)*0.6)}dB</span>
        </div>
      </div>
    </div>
  );

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
        <div className="flex gap-1.5 p-1.5 border-b shrink-0"
          style={{ background: '#050510', borderColor: '#AE06ED22' }}>
          {(['timeline', 'ai', 'mix'] as const).map(tab => {
            const Icon = tab === 'ai' ? Sparkles : tab === 'mix' ? SlidersHorizontal : Clock3;
            const active = mobileTab === tab;
            return (
              <button key={tab} onClick={() => setMobileTab(tab)}
                style={{
                  minHeight: '44px',
                  touchAction: 'manipulation',
                  background: active ? 'linear-gradient(135deg, #AE06ED, #6A0572)' : '#15152a',
                  boxShadow: active ? '0 0 14px #AE06ED88' : 'none',
                  border: active ? '1px solid #D946EF' : '1px solid #2a2a45',
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-black uppercase tracking-[0.12em] transition-all">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? '#fff' : '#9999bb' }} />
                <span style={{ color: active ? '#fff' : '#9999bb' }}>
                  {tab === 'ai' ? 'AI Generate' : tab === 'mix' ? 'Mixer' : 'Timeline'}
                </span>
              </button>
            );
          })}
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
              <BarRuler compact />
              <div className="border-b shrink-0 px-2 py-1.5" style={{ background: '#020208', borderColor: '#0D0D20' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-2.5 h-2.5" style={{ color: '#FF2D78' }} />
                  <span className="text-[8px] font-black tracking-[0.25em] uppercase" style={{ color: '#FF2D78' }}>Master Waveform</span>
                </div>
                <StudioWaveform audioEl={audioEl} audioUrl={audioUrl} color="#FF2D78" height={40}
                  onReady={ws => { wsInstanceRef.current = ws; }} />
              </div>
              {orderedTracks.map(track => (
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
                      <WaveformSVG color={track.color} glow={track.glow} height={38} seed={TRACKS.indexOf(track)} peaks={waveformPeaks} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mobileTab === 'ai' && (
            <div className="overflow-y-auto">{AIPanel()}</div>
          )}

          {mobileTab === 'mix' && (
            <div className="overflow-x-auto overflow-y-hidden p-2">{MixingBoard()}</div>
          )}
        </div>

        <TransportBar />
      </div>

      {/* ── DESKTOP (lg+) ──────────────────────────────────── */}
      <div className="hidden lg:flex relative z-10 flex-1 overflow-hidden">

        {/* Left sidebar — tracks + lyrics */}
        <div className="w-52 border-r flex flex-col shrink-0"
          style={{ background: '#030310', borderColor: '#AE06ED22' }}>
          {/* Tracks header */}
          <div className="h-9 border-b flex items-center px-3 gap-2 shrink-0"
            style={{ background: '#050510', borderColor: '#0D0D20' }}>
            <Layers className="w-3 h-3" style={{ color: '#AE06ED' }} />
            <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: '#AE06ED' }}>Tracks</span>
          </div>
          {/* Track list — pinned tracks (Pro Tools 2026.4's "track pinning")
              stay fixed at the top */}
          <div className="overflow-y-auto" style={{ flex: '0 0 auto' }}>
            {orderedTracks.map(track => <TrackRow key={track.id} track={track} />)}
          </div>
          {/* Lyrics editor */}
          <div className="flex-1 border-t flex flex-col min-h-0"
            style={{ borderColor: '#AE06ED22', background: 'linear-gradient(180deg, #030310, #050512)' }}>
            <div className="h-7 border-b flex items-center px-3 gap-2 shrink-0"
              style={{ background: '#050510', borderColor: '#0D0D20' }}>
              <Mic2 className="w-3 h-3" style={{ color: '#AE06ED', filter: 'drop-shadow(0 0 3px #AE06ED)' }} />
              <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: '#AE06ED' }}>Lyrics</span>
            </div>
            <textarea value={lyrics} onChange={e => setLyrics(e.target.value)}
              style={{ fontSize: '11px', background: 'transparent', color: '#445566', letterSpacing: '0.03em', resize: 'none' }}
              className="flex-1 font-mono p-2 focus:outline-none leading-relaxed min-h-0"
              spellCheck={false} />
          </div>
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
          <BarRuler />

          {/* Master waveform — real decoded audio via WaveSurfer.js, not a
              synthetic shape. Click to seek; the playhead genuinely tracks
              this song's actual audio element. */}
          <div className="border-b shrink-0 px-2 py-1.5"
            style={{ background: '#020208', borderColor: '#0D0D20' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-2.5 h-2.5" style={{ color: '#FF2D78' }} />
              <span className="text-[8px] font-black tracking-[0.25em] uppercase" style={{ color: '#FF2D78' }}>Master Waveform</span>
            </div>
            <StudioWaveform audioEl={audioEl} audioUrl={audioUrl} color="#FF2D78" height={48}
              onReady={ws => { wsInstanceRef.current = ws; }} />
          </div>

          {/* Edit Tools — Pro Tools' Trim/Selector/Grabber/Scrub/Pencil/Zoom
              toolbar, plus real zoom controls wired to the waveform */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 border-b shrink-0"
            style={{ background: '#020208', borderColor: '#0D0D20' }}>
            {EDIT_TOOLS.map(t => (
              <button key={t.id} onClick={() => setEditTool(t.id)} title={t.label}
                style={{ minWidth: '26px', minHeight: '26px' }}
                className={`flex items-center justify-center rounded text-xs transition-all ${
                  editTool === t.id ? 'bg-[#AE06ED]/20 text-[#AE06ED] border border-[#AE06ED]/50' : 'text-[#444466] hover:text-[#8888AA] border border-transparent'
                }`}>
                {t.icon}
              </button>
            ))}
            <div className="h-4 w-px mx-1" style={{ background: '#1a1a3a' }} />
            <button onClick={handleZoomOut} title="Zoom out"
              className="w-6 h-6 flex items-center justify-center rounded text-[#444466] hover:text-[#8888AA] text-xs">−</button>
            <span className="text-[8px] font-mono w-10 text-center" style={{ color: '#333355' }}>{zoomLevel}px/s</span>
            <button onClick={handleZoomIn} title="Zoom in"
              className="w-6 h-6 flex items-center justify-center rounded text-[#444466] hover:text-[#8888AA] text-xs">+</button>
            <div className="h-4 w-px mx-1" style={{ background: '#1a1a3a' }} />
            <button onClick={() => jumpToTransient(-1)} title="Previous transient (Shift+Tab)"
              className="text-[8px] font-mono px-1.5 h-6 rounded text-[#444466] hover:text-[#8888AA] border border-[#1a1a3a]">⏮ Tab</button>
            <button onClick={() => jumpToTransient(1)} title="Next transient (Tab)"
              className="text-[8px] font-mono px-1.5 h-6 rounded text-[#444466] hover:text-[#8888AA] border border-[#1a1a3a]">Tab ⏭</button>
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

            {orderedTracks.map(track => <TimelineLane key={track.id} track={track} />)}
          </div>

          <TransportBar />
          {MixingBoard()}
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
