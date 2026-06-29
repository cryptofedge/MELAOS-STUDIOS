'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SkipBack, Play, Pause, Square, Circle, Repeat,
  ChevronLeft, ChevronRight, Mic2, Loader2, Check,
  Volume2, VolumeX, Zap
} from 'lucide-react';

const TRACKS = [
  { id: 't1', name: 'Vocals', type: 'vocals', color: '#3B82F6' },
  { id: 't2', name: 'Drums', type: 'drums', color: '#22C55E' },
  { id: 't3', name: 'Bass', type: 'bass', color: '#F28C28' },
  { id: 't4', name: 'Synth', type: 'synth', color: '#A855F7' },
  { id: 't5', name: 'Strings', type: 'strings', color: '#EC4899' },
  { id: 't6', name: 'Percussion', type: 'percussion', color: '#EAB308' },
  { id: 't7', name: 'FX', type: 'fx', color: '#06B6D4' },
];

const SECTIONS = ['INTRO', 'VERSE', 'CHORUS', 'VERSE', 'CHORUS', 'BRIDGE', 'OUTRO'];

const GENRES = ['Hip-Hop', 'R&B', 'Afrobeats', 'Pop', 'Electronic', 'Drill', 'Soul', 'Trap'];
const MOODS = ['Energetic', 'Melancholic', 'Euphoric', 'Dark', 'Chill', 'Aggressive'];

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

function WaveformSVG({ color, height = 40 }: { color: string; height?: number }) {
  const points = Array.from({ length: 60 }, (_, i) => {
    const y = height / 2 + Math.sin(i * 0.4) * (height * 0.3) + Math.sin(i * 0.9) * (height * 0.15);
    return `${(i / 59) * 100}%,${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} className="opacity-70">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export default function StudioPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [playheadPct, setPlayheadPct] = useState(0);
  const [looping, setLooping] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // Track states
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [solo, setSolo] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>(
    Object.fromEntries(TRACKS.map(t => [t.id, 80]))
  );

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Hip-Hop');
  const [mood, setMood] = useState('Energetic');
  const [genBpm, setGenBpm] = useState(120);
  const [vocalGender, setVocalGender] = useState<'male' | 'female' | 'none'>('male');
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genDone, setGenDone] = useState(false);

  const [lyrics, setLyrics] = useState(DEFAULT_LYRICS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const TOTAL_MS = 214000;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimeMs(prev => {
          const next = prev + 100;
          if (next >= TOTAL_MS) { setIsPlaying(false); return 0; }
          setPlayheadPct((next / TOTAL_MS) * 100);
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const msec = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}:${String(msec).padStart(2,'0')}`;
  };

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setGenProgress(0);
    setGenDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.floor(Math.random() * 12) + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setGenProgress(100);
        setTimeout(() => { setGenerating(false); setGenDone(true); }, 400);
      } else {
        setGenProgress(p);
      }
    }, 300);
  }, []);

  const toggleMute = (id: string) => setMuted(m => ({ ...m, [id]: !m[id] }));
  const toggleSolo = (id: string) => setSolo(s => ({ ...s, [id]: !s[id] }));

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col bg-[#0A0A0A] overflow-hidden">
      {/* Top toolbar */}
      <div className="h-10 bg-[#111] border-b border-[#222] flex items-center px-4 gap-4 shrink-0">
        <span className="text-xs font-semibold text-[#F28C28]">MELAOS STUDIO</span>
        <span className="text-gray-700 text-xs">|</span>
        <span className="text-xs text-gray-500">Untitled Project</span>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Ready
        </div>
      </div>

      {/* Main 3-col layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — track list */}
        <div className="w-48 md:w-56 bg-[#111] border-r border-[#222] flex flex-col shrink-0 overflow-y-auto">
          <div className="h-10 bg-[#0F0F0F] border-b border-[#222] flex items-center px-3">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tracks</span>
          </div>
          {TRACKS.map(track => (
            <div key={track.id} className="border-b border-[#1A1A1A] p-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-8 rounded-sm shrink-0" style={{ backgroundColor: track.color }} />
                <span className="text-xs font-semibold text-gray-200 flex-1 truncate">{track.name}</span>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => toggleMute(track.id)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors border ${muted[track.id] ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'border-[#333] text-gray-600 hover:text-gray-400'}`}
                >M</button>
                <button
                  onClick={() => toggleSolo(track.id)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors border ${solo[track.id] ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-[#333] text-gray-600 hover:text-gray-400'}`}
                >S</button>
                <div className="flex-1 ml-1">
                  <div className="h-1 bg-[#333] rounded-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setVolumes(v => ({ ...v, [track.id]: Math.round(((e.clientX - rect.left) / rect.width) * 100) }));
                    }}>
                    <div className="h-full rounded-full" style={{ width: `${volumes[track.id]}%`, backgroundColor: track.color }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Center — timeline + transport */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section markers */}
          <div className="h-8 bg-[#0F0F0F] border-b border-[#222] flex shrink-0">
            {SECTIONS.map((s, i) => (
              <div key={i} className="flex-1 border-r border-[#222] flex items-center justify-center">
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{s}</span>
              </div>
            ))}
          </div>

          {/* Timeline tracks */}
          <div className="flex-1 overflow-y-auto relative">
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${playheadPct}%` }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -left-[3px]" />
            </div>

            {TRACKS.map(track => (
              <div
                key={track.id}
                className={`h-16 border-b border-[#1A1A1A] relative ${muted[track.id] ? 'opacity-30' : ''}`}
              >
                <div
                  className="absolute inset-y-2 left-1 right-1 rounded-md overflow-hidden"
                  style={{ backgroundColor: track.color + '22', border: `1px solid ${track.color}44` }}
                >
                  <WaveformSVG color={track.color} height={48} />
                </div>
              </div>
            ))}
          </div>

          {/* Transport bar */}
          <div className="h-14 bg-[#111] border-t border-[#222] flex items-center px-4 gap-3 shrink-0">
            <button onClick={() => { setTimeMs(0); setPlayheadPct(0); }} className="text-gray-500 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
            </button>
            <button onClick={() => { setIsPlaying(false); setTimeMs(0); setPlayheadPct(0); }} className="text-gray-500 hover:text-white transition-colors">
              <Square className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-red-400 transition-colors">
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLooping(l => !l)}
              className={`transition-colors ${looping ? 'text-[#F28C28]' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-[#333] mx-1" />

            {/* BPM */}
            <div className="flex items-center gap-1">
              <button onClick={() => setBpm(b => Math.max(40, b - 1))} className="text-gray-600 hover:text-white w-5 h-5 flex items-center justify-center text-xs">−</button>
              <div className="bg-[#1A1A1A] border border-[#333] rounded px-2 py-0.5 text-xs font-mono text-gray-300 min-w-[52px] text-center">
                {bpm} BPM
              </div>
              <button onClick={() => setBpm(b => Math.min(300, b + 1))} className="text-gray-600 hover:text-white w-5 h-5 flex items-center justify-center text-xs">+</button>
            </div>

            <div className="h-6 w-px bg-[#333] mx-1" />

            {/* Time */}
            <div className="font-mono text-xs text-gray-400 bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded">
              {formatTime(timeMs)}
            </div>

            {/* Metronome */}
            <button className="text-gray-600 hover:text-[#F28C28] transition-colors ml-auto flex items-center gap-1 text-xs">
              <Mic2 className="w-3.5 h-3.5" /> Metro
            </button>

            {/* Panel toggle */}
            <button
              onClick={() => setPanelOpen(p => !p)}
              className="text-gray-600 hover:text-white transition-colors"
            >
              {panelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Lyrics editor */}
          <div className="h-44 bg-[#0D0D0D] border-t border-[#222] p-3 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Mic2 className="w-3.5 h-3.5 text-[#F28C28]" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lyrics</span>
            </div>
            <textarea
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              className="w-full h-32 bg-transparent text-gray-400 text-xs font-mono resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right panel — AI Generation */}
        {panelOpen && (
          <div className="w-72 bg-[#111] border-l border-[#222] flex flex-col shrink-0 overflow-y-auto">
            <div className="h-10 bg-[#0F0F0F] border-b border-[#222] flex items-center px-4 gap-2">
              <Zap className="w-3.5 h-3.5 text-[#F28C28]" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">AI Generate</span>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Prompt */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Describe your song</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="A dark trap banger with 808s, auto-tune vocals, and a haunting piano melody..."
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-[#F28C28] resize-none transition-colors"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Genre</label>
                <select
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#F28C28] transition-colors"
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Mood</label>
                <select
                  value={mood}
                  onChange={e => setMood(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#F28C28] transition-colors"
                >
                  {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* BPM slider */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 flex justify-between">
                  <span className="font-medium">BPM</span>
                  <span className="text-[#F28C28] font-mono font-bold">{genBpm}</span>
                </label>
                <input
                  type="range" min={60} max={200} value={genBpm}
                  onChange={e => setGenBpm(Number(e.target.value))}
                  className="w-full accent-[#F28C28]"
                />
                <div className="flex justify-between text-[10px] text-gray-700 mt-0.5">
                  <span>60</span><span>200</span>
                </div>
              </div>

              {/* Vocal gender */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Vocals</label>
                <div className="flex gap-2">
                  {(['male', 'female', 'none'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVocalGender(v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                        vocalGender === v
                          ? 'bg-[#F28C28]/20 border-[#F28C28] text-[#F28C28]'
                          : 'border-[#333] text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {v === 'none' ? 'None' : v === 'male' ? 'Male' : 'Female'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  generating || genDone
                    ? 'bg-[#1A1A1A] border border-[#333] text-gray-400 cursor-not-allowed'
                    : 'btn-orange text-white hover:scale-105'
                }`}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : genDone ? (
                  <><Check className="w-4 h-4 text-green-400" /> <span className="text-green-400">Generated!</span></>
                ) : (
                  <><Zap className="w-4 h-4" /> Generate</>
                )}
              </button>

              {/* Progress bar */}
              {(generating || genDone) && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{genDone ? 'Complete' : 'Processing...'}</span>
                    <span>{genProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${genProgress}%`,
                        background: genDone
                          ? '#22C55E'
                          : 'linear-gradient(90deg, #F28C28, #E91E8C)'
                      }}
                    />
                  </div>
                  {genDone && (
                    <p className="text-xs text-green-400 mt-2">Track added to timeline. Press play to preview.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
