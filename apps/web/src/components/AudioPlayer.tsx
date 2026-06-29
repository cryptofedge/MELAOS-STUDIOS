'use client';
import { useEffect, useRef, useCallback } from 'react';
import { SkipBack, SkipForward, Play, Pause, Heart, Repeat, Volume2 } from 'lucide-react';
import { useAudioStore } from '@/lib/store';

// Web Audio beat engine — plays a genre-appropriate beat when no real audioUrl exists
function useBeatEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextBeatRef = useRef(0);
  const beatCountRef = useRef(0);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const scheduleKick = useCallback((ctx: AudioContext, when: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(160, when);
    osc.frequency.exponentialRampToValueAtTime(0.001, when + 0.35);
    gain.gain.setValueAtTime(1.2, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.4);
    osc.start(when); osc.stop(when + 0.4);
  }, []);

  const scheduleSnare = useCallback((ctx: AudioContext, when: number) => {
    const bufSize = Math.floor(ctx.sampleRate * 0.15);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 3000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.15);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(when);
  }, []);

  const scheduleHat = useCallback((ctx: AudioContext, when: number, vol = 0.25) => {
    const bufSize = Math.floor(ctx.sampleRate * 0.05);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.value = 9000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(when);
  }, []);

  const scheduleBass = useCallback((ctx: AudioContext, when: number, freq: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 400;
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.5, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.3);
    osc.start(when); osc.stop(when + 0.35);
  }, []);

  const start = useCallback((bpm: number) => {
    const ctx = getCtx();
    const step = 60 / bpm / 2; // 8th notes
    nextBeatRef.current = ctx.currentTime + 0.05;
    beatCountRef.current = 0;

    const bassNotes = [55, 55, 65, 55, 49, 55, 58, 55]; // A1, A1, C2, A1, G1...

    const tick = () => {
      const ctx2 = getCtx();
      const lookahead = 0.15;
      while (nextBeatRef.current < ctx2.currentTime + lookahead) {
        const when = nextBeatRef.current;
        const b = beatCountRef.current % 8;
        // Kick on 0 and 4
        if (b === 0 || b === 4) scheduleKick(ctx2, when);
        // Snare on 2 and 6
        if (b === 2 || b === 6) scheduleSnare(ctx2, when);
        // Hi-hats every 8th
        scheduleHat(ctx2, when, b % 2 === 0 ? 0.3 : 0.15);
        // Bass on downbeats
        if (b === 0 || b === 3 || b === 4 || b === 7) {
          scheduleBass(ctx2, when, bassNotes[b]);
        }
        nextBeatRef.current += step;
        beatCountRef.current++;
      }
    };

    tick();
    schedulerRef.current = setInterval(tick, 50);
  }, [getCtx, scheduleKick, scheduleSnare, scheduleHat, scheduleBass]);

  const stop = useCallback(() => {
    if (schedulerRef.current) { clearInterval(schedulerRef.current); schedulerRef.current = null; }
  }, []);

  return { start, stop };
}

export default function AudioPlayer() {
  const {
    currentSong, isPlaying, progress, volume, isLiked, isLooping,
    setIsPlaying, setProgress, setVolume, toggleLike, toggleLoop, playNext, playPrev
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beat = useBeatEngine();

  // Create audio element once
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      beat.stop();
    };
  }, []);

  // When song changes, load it
  useEffect(() => {
    if (!currentSong) return;
    beat.stop();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (currentSong.audioUrl) {
      const audio = audioRef.current!;
      audio.src = currentSong.audioUrl;
      audio.loop = isLooping;
      audio.volume = volume / 100;
      audio.load();
      if (isPlaying) audio.play().catch(() => {});
    }
  }, [currentSong?.id]);

  // Sync play/pause
  useEffect(() => {
    if (!currentSong) return;

    if (currentSong.audioUrl) {
      const audio = audioRef.current!;
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
        // Sync progress from real audio
        progressIntervalRef.current = setInterval(() => {
          if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
          if (audio.ended) { if (isLooping) audio.play(); else playNext(); }
        }, 500);
      } else {
        audio.pause();
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    } else {
      // Beat engine for mock songs
      if (isPlaying) {
        beat.start(currentSong.bpm);
        progressIntervalRef.current = setInterval(() => {
          const cur = useAudioStore.getState().progress;
          const next = cur + (100 / currentSong.duration / 2);
          if (next >= 100) { if (!isLooping) playNext(); setProgress(isLooping ? 0 : 100); }
          else setProgress(next);
        }, 500);
      } else {
        beat.stop();
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }

    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
  }, [isPlaying, currentSong?.id]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Sync loop
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping;
  }, [isLooping]);

  if (!currentSong) return null;

  const elapsed = Math.floor((progress / 100) * currentSong.duration);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const seek = (pct: number) => {
    setProgress(pct);
    if (currentSong.audioUrl && audioRef.current?.duration) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]/95 border-t border-[#222]"
      style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}>

      {/* ── MOBILE layout (< md) ── */}
      <div className="md:hidden px-4 py-2 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md shrink-0 overflow-hidden" style={{ background: currentSong.coverGradient }}>
            <div className="w-full h-full flex items-center justify-center opacity-60">
              <div className="flex gap-0.5 items-end h-5">
                {[3,5,4,6,3,5,4].map((h, i) => (
                  <div key={i} className={`waveform-bar${isPlaying ? '' : ''}`}
                    style={{ width: '4px', height: `${isPlaying ? h * 3 : 4}px`, backgroundColor: 'white', borderRadius: '2px', transition: 'height 0.3s' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
            <p className="text-gray-500 text-xs truncate">{currentSong.artist}</p>
          </div>
          <button onClick={toggleLike}
            style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className={`flex items-center justify-center shrink-0 transition-colors ${isLiked ? 'text-[#E91E8C]' : 'text-gray-600 hover:text-gray-400'}`}>
            <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 w-8 text-right">{fmt(elapsed)}</span>
          <div className="flex-1 h-1.5 bg-[#333] rounded-full cursor-pointer relative"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 100); }}>
            <div className="h-full bg-[#F28C28] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-600 w-8">{currentSong.durationFormatted}</span>
        </div>

        <div className="flex items-center justify-center gap-2 pb-1">
          <button onClick={playPrev} style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className="flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)}
            style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
            {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
          </button>
          <button onClick={playNext} style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className="flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
          <button onClick={toggleLoop} style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
            className={`flex items-center justify-center transition-colors ${isLooping ? 'text-[#F28C28]' : 'text-gray-600 hover:text-gray-400'}`}>
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── DESKTOP layout (md+) ── */}
      <div className="hidden md:flex items-center px-6 h-20 gap-4">
        <div className="flex items-center gap-3 w-64 shrink-0">
          <div className="w-10 h-10 rounded-md shrink-0 overflow-hidden" style={{ background: currentSong.coverGradient }} />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
            <p className="text-gray-500 text-xs truncate">{currentSong.artist}</p>
          </div>
          <button onClick={toggleLike} className={`shrink-0 transition-colors ${isLiked ? 'text-[#E91E8C]' : 'text-gray-600 hover:text-gray-400'}`}>
            <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={playPrev} className="text-gray-500 hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
              {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-gray-500 hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
            <button onClick={toggleLoop} className={`transition-colors ${isLooping ? 'text-[#F28C28]' : 'text-gray-600 hover:text-gray-400'}`}>
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-gray-600 w-8 text-right">{fmt(elapsed)}</span>
            <div className="flex-1 h-1 bg-[#333] rounded-full cursor-pointer relative group"
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 100); }}>
              <div className="h-full bg-[#F28C28] rounded-full transition-all" style={{ width: `${progress}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }} />
            </div>
            <span className="text-xs text-gray-600 w-8">{currentSong.durationFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-32 shrink-0">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <div className="flex-1 h-1 bg-[#333] rounded-full cursor-pointer"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume(Math.round(((e.clientX - r.left) / r.width) * 100)); }}>
            <div className="h-full bg-gray-400 rounded-full" style={{ width: `${volume}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
