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
  const iconBtn = 'touch-target text-fog transition-colors hoverable:hover:text-white';

  const cover = (size: string) => (
    <div className={`${size} shrink-0 overflow-hidden relative border border-line`} style={{ background: currentSong.coverGradient }}>
      {currentSong.coverArt && (
        <img src={currentSong.coverArt} alt={currentSong.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {isPlaying && (
        <div className="absolute inset-0 bg-black/45 flex items-end justify-center gap-[2px] pb-2">
          {[3, 5, 4, 6, 3].map((h, i) => (
            <div key={i} className="waveform-bar !w-[3px] !m-0 bg-melaos-orange" style={{ height: `${h * 2.5}px` }} />
          ))}
        </div>
      )}
    </div>
  );

  const playButton = (large = false) => (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className={`btn btn-primary !px-0 ${large ? '!min-h-[44px] w-11' : '!min-h-[36px] w-10 [--chamfer:7px]'}`}
    >
      {isPlaying ? <Pause className="w-4 h-4 fill-current" strokeWidth={0} /> : <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={0} />}
    </button>
  );

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 bg-ink-0/90 border-t border-line pb-safe"
      style={{ WebkitBackdropFilter: 'blur(14px) saturate(140%)', backdropFilter: 'blur(14px) saturate(140%)' }}
    >
      {/* Progress: a hairline along the top edge, with a taller invisible hit area */}
      <div
        className="absolute -top-[7px] inset-x-0 h-[14px] cursor-pointer group"
        onClick={seekFromEvent}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="absolute top-[6px] inset-x-0 h-[2px] bg-line-strong" />
        <div className="absolute top-[6px] left-0 h-[2px] bg-melaos-orange transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Phones and small tablets ── */}
      <div className="md:hidden px-safe">
        <div className="flex items-center gap-3 pt-2.5">
          {cover("w-10 h-10")}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-fog text-xs truncate">{currentSong.artist}</p>
          </div>
          <button onClick={toggleLike} aria-label="Like" className={`touch-target -mr-2 transition-colors ${isLiked ? 'text-melaos-pink' : 'text-fog'}`}>
            <Heart className="w-[18px] h-[18px]" strokeWidth={1.75} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex items-center justify-between pb-1.5">
          <span className="label tabular-nums w-12">{fmt(elapsed)}</span>
          <div className="flex items-center gap-1">
            <button onClick={playPrev} aria-label="Previous" className={iconBtn}><SkipBack className="w-[18px] h-[18px]" strokeWidth={1.75} /></button>
            {playButton(true)}
            <button onClick={playNext} aria-label="Next" className={iconBtn}><SkipForward className="w-[18px] h-[18px]" strokeWidth={1.75} /></button>
            <button onClick={toggleLoop} aria-label="Loop" aria-pressed={isLooping} className={`touch-target transition-colors ${isLooping ? 'text-melaos-orange' : 'text-fog'}`}>
              <Repeat className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
          <span className="label tabular-nums w-12 text-right">{currentSong.durationFormatted}</span>
        </div>
      </div>

      {/* ── Tablets in landscape and computers ── */}
      <div className="hidden md:grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 px-6 h-[72px]">
        <div className="flex items-center gap-3 min-w-0">
          {cover("w-11 h-11")}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-fog text-xs truncate">{currentSong.artist}</p>
          </div>
          <button onClick={toggleLike} aria-label="Like" className={`shrink-0 p-2 transition-colors ${isLiked ? 'text-melaos-pink' : 'text-fog hoverable:hover:text-white'}`}>
            <Heart className="w-4 h-4" strokeWidth={1.75} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="label tabular-nums w-10 text-right">{fmt(elapsed)}</span>
          <button onClick={playPrev} aria-label="Previous" className="p-2 text-fog hoverable:hover:text-white transition-colors"><SkipBack className="w-4 h-4" strokeWidth={1.75} /></button>
          {playButton()}
          <button onClick={playNext} aria-label="Next" className="p-2 text-fog hoverable:hover:text-white transition-colors"><SkipForward className="w-4 h-4" strokeWidth={1.75} /></button>
          <button onClick={toggleLoop} aria-label="Loop" aria-pressed={isLooping} className={`p-2 transition-colors ${isLooping ? 'text-melaos-orange' : 'text-fog hoverable:hover:text-white'}`}>
            <Repeat className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <span className="label tabular-nums w-10">{currentSong.durationFormatted}</span>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Volume2 className="w-4 h-4 text-fog" strokeWidth={1.75} />
          <div
            className="w-28 h-[14px] cursor-pointer relative"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume(Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))); }}
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volume}
          >
            <div className="absolute top-[6px] inset-x-0 h-[2px] bg-line-strong" />
            <div className="absolute top-[6px] left-0 h-[2px] bg-fog" style={{ width: `${volume}%` }} />
          </div>
          <span className="label tabular-nums w-7 text-right">{volume}</span>
        </div>
      </div>
    </div>
  );
}
