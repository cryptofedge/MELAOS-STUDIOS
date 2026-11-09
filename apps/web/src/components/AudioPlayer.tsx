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
    currentSong, isPlaying, progress, volume, likedIds, isLooping,
    setIsPlaying, setProgress, setVolume, toggleLike, toggleLoop, playNext, playPrev
  } = useAudioStore();
  const isLiked = currentSong ? likedIds.includes(currentSong.id) : false;

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

  // Tell the layout the player is showing, so pages pad their bottom by its
  // height (see --player-h in globals.css) and nothing hides behind it.
  useEffect(() => {
    const root = document.documentElement;
    if (currentSong) root.dataset.player = 'on';
    else delete root.dataset.player;
    return () => { delete root.dataset.player; };
  }, [currentSong]);

  if (!currentSong) return null;

  const elapsed = Math.floor((progress / 100) * currentSong.duration);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const seek = (pct: number) => {
    setProgress(pct);
    if (currentSong.audioUrl && audioRef.current?.duration) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    }
  };

  const seekFromEvent = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };

  const cover = (size: string) => (
    <div className={`${size} shrink-0 overflow-hidden relative rounded-[10px]`} style={{ background: currentSong.coverGradient }}>
      {currentSong.coverArt && (
        <img src={currentSong.coverArt} alt={currentSong.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  );

  const playButton = (size: string) => (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className={`${size} shrink-0 rounded-full bg-white text-[#08080A] flex items-center justify-center transition-transform active:scale-95`}
    >
      {isPlaying ? <Pause className="w-4 h-4 fill-current" strokeWidth={0} /> : <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={0} />}
    </button>
  );

  const likeButton = (cls: string) => (
    <button onClick={toggleLike} aria-label="Like" aria-pressed={isLiked} className={`${cls} transition-colors ${isLiked ? 'text-melaos-pink' : 'text-fog hoverable:hover:text-white'}`}>
      <Heart className="w-[18px] h-[18px]" fill={isLiked ? 'currentColor' : 'none'} />
    </button>
  );

  return (
    <>
      {/* ── Phones and tablets: mini player floating above the tab bar ── */}
      <div
        className="lg:hidden fixed z-50 left-0 right-0 px-2.5"
        style={{ bottom: 'calc(var(--tabs-h) + 8px)' }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-ink-3/95 border border-line shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-2.5 pl-2 pr-1 h-[58px]">
            {cover('w-[42px] h-[42px]')}
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13.5px] font-semibold truncate">{currentSong.title}</p>
              <p className="text-fog text-xs truncate">{currentSong.artist}</p>
            </div>
            {likeButton('touch-target !min-w-[40px]')}
            <button onClick={playPrev} aria-label="Previous" className="touch-target !min-w-[40px] text-fog"><SkipBack className="w-[18px] h-[18px] fill-current" /></button>
            {playButton('w-10 h-10')}
            <button onClick={playNext} aria-label="Next" className="touch-target !min-w-[40px] text-fog"><SkipForward className="w-[18px] h-[18px] fill-current" /></button>
          </div>
          {/* Progress along the bottom edge; tap it to seek */}
          <div
            className="absolute bottom-0 inset-x-0 h-3 cursor-pointer"
            onClick={seekFromEvent}
            role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}
          >
            <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/10" />
            <div className="absolute bottom-0 left-0 h-[3px] bg-brand transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* ── Computers: full-width player bar ── */}
      <div
        className="hidden lg:grid fixed z-50 bottom-0 inset-x-0 h-[76px] pb-safe bg-ink-0 grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-6 px-5"
      >
        <div className="flex items-center gap-3 min-w-0">
          {cover('w-12 h-12')}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
            <p className="text-fog text-xs truncate">{currentSong.artist}</p>
          </div>
          {likeButton('shrink-0 p-2')}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-5">
            <button onClick={toggleLoop} aria-label="Loop" aria-pressed={isLooping} className={`p-1.5 transition-colors ${isLooping ? 'text-melaos-pink' : 'text-fog hoverable:hover:text-white'}`}>
              <Repeat className="w-4 h-4" />
            </button>
            <button onClick={playPrev} aria-label="Previous" className="p-1.5 text-fog hoverable:hover:text-white"><SkipBack className="w-[18px] h-[18px] fill-current" /></button>
            {playButton('w-10 h-10')}
            <button onClick={playNext} aria-label="Next" className="p-1.5 text-fog hoverable:hover:text-white"><SkipForward className="w-[18px] h-[18px] fill-current" /></button>
            <span className="w-7" />
          </div>
          <div className="flex items-center gap-3 w-full max-w-[520px]">
            <span className="text-[11px] text-fog tabular-nums w-9 text-right">{fmt(elapsed)}</span>
            <div
              className="flex-1 h-3 cursor-pointer relative group"
              onClick={seekFromEvent}
              role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}
            >
              <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1 rounded-full bg-ink-4" />
              <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-brand" style={{ width: `${progress}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 6px)` }} />
            </div>
            <span className="text-[11px] text-fog tabular-nums w-9">{currentSong.durationFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Volume2 className="w-[18px] h-[18px] text-fog" />
          <div
            className="w-28 h-3 cursor-pointer relative"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume(Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))); }}
            role="slider" aria-label="Volume" aria-valuemin={0} aria-valuemax={100} aria-valuenow={volume}
          >
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1 rounded-full bg-ink-4" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-white" style={{ width: `${volume}%` }} />
          </div>
        </div>
      </div>
    </>
  );
}
