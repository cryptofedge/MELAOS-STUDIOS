'use client';

// ── Chord / scale definitions ──────────────────────────────────────────────
const NOTES: Record<string, number> = {
  C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00,
};

type ChordDef = { root: number; thirds: number[]; fifth: number };

const PROGRESSIONS: Record<string, number[][]> = {
  trap:      [[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.G3,NOTES.B3,NOTES.D4]],
  hiphop:    [[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.E3,NOTES.G3,NOTES.B3]],
  rnb:       [[NOTES.D4,NOTES.F4,NOTES.A4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.A3,NOTES.C4,NOTES.E4]],
  afrobeats: [[NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.G3,NOTES.B3,NOTES.D4]],
  electronic:[[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.E3,NOTES.G3,NOTES.B3]],
  pop:       [[NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.F3,NOTES.A3,NOTES.C4]],
  soul:      [[NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.G3,NOTES.B3,NOTES.D4]],
  drill:     [[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.E3,NOTES.G3,NOTES.B3], [NOTES.D3,NOTES.F3,NOTES.A3]],
  // ── Latin rhythms ─────────────────────────────────────────────────────
  reggaeton: [[NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.E3,NOTES.G3,NOTES.B3], [NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.D4,NOTES.F4,NOTES.A4]],
  dembow:    [[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.G3,NOTES.B3,NOTES.D4]],
  bachata:   [[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.D4,NOTES.F4,NOTES.A4], [NOTES.E3,NOTES.G3,NOTES.B3], [NOTES.A3,NOTES.C4,NOTES.E4]],
  salsa:     [[NOTES.D4,NOTES.F4,NOTES.A4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.D4,NOTES.F4,NOTES.A4]],
  merengue:  [[NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.C4,NOTES.E4,NOTES.G4]],
  cumbia:    [[NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.C4,NOTES.E4,NOTES.G4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.C4,NOTES.E4,NOTES.G4]],
  reggae:    [[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.D4,NOTES.F4,NOTES.A4]],
  latintrap: [[NOTES.A3,NOTES.C4,NOTES.E4], [NOTES.F3,NOTES.A3,NOTES.C4], [NOTES.G3,NOTES.B3,NOTES.D4], [NOTES.E3,NOTES.G3,NOTES.B3]],
};

const BASS_ROOTS: Record<string, number[]> = {
  trap:      [NOTES.A3/2, NOTES.F3/2, NOTES.C3, NOTES.G3/2],
  hiphop:    [NOTES.A3/2, NOTES.G3/2, NOTES.F3/2, NOTES.E3/2],
  rnb:       [NOTES.D3, NOTES.G3/2, NOTES.C3, NOTES.A3/2],
  afrobeats: [NOTES.C3, NOTES.A3/2, NOTES.F3/2, NOTES.G3/2],
  electronic:[NOTES.A3/2, NOTES.F3/2, NOTES.C3, NOTES.E3/2],
  pop:       [NOTES.C3, NOTES.G3/2, NOTES.A3/2, NOTES.F3/2],
  soul:      [NOTES.F3/2, NOTES.C3, NOTES.A3/2, NOTES.G3/2],
  drill:     [NOTES.A3/2, NOTES.F3/2, NOTES.E3/2, NOTES.D3],
  // ── Latin rhythms ─────────────────────────────────────────────────────
  reggaeton: [NOTES.G3/2, NOTES.E3/2, NOTES.C3, NOTES.D3/2],
  dembow:    [NOTES.A3/2, NOTES.G3/2, NOTES.F3/2, NOTES.G3/2],
  bachata:   [NOTES.A3/2, NOTES.D3/2, NOTES.E3/2, NOTES.A3/2],
  salsa:     [NOTES.D3/2, NOTES.G3/2, NOTES.C3, NOTES.D3/2],
  merengue:  [NOTES.C3, NOTES.F3/2, NOTES.G3/2, NOTES.C3],
  cumbia:    [NOTES.F3/2, NOTES.C3, NOTES.G3/2, NOTES.C3],
  reggae:    [NOTES.A3/2, NOTES.F3/2, NOTES.G3/2, NOTES.D3/2],
  latintrap: [NOTES.A3/2, NOTES.F3/2, NOTES.G3/2, NOTES.E3/2],
};

const MELODY_SCALES: Record<string, number[]> = {
  trap:      [NOTES.A4, NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5],
  hiphop:    [NOTES.A4, NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5],
  rnb:       [NOTES.D5, NOTES.E5, NOTES.F5, NOTES.A5, NOTES.C5],
  afrobeats: [NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5, NOTES.A5],
  electronic:[NOTES.A4, NOTES.B4, NOTES.C5, NOTES.E5, NOTES.G5],
  pop:       [NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5, NOTES.A5],
  soul:      [NOTES.F4, NOTES.G4, NOTES.A4, NOTES.C5, NOTES.D5],
  drill:     [NOTES.A4, NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5],
  // ── Latin rhythms ─────────────────────────────────────────────────────
  reggaeton: [NOTES.G4, NOTES.A4, NOTES.C5, NOTES.D5, NOTES.E5],
  dembow:    [NOTES.A4, NOTES.B4, NOTES.D5, NOTES.E5, NOTES.G5],
  bachata:   [NOTES.A4, NOTES.B4, NOTES.D5, NOTES.E5, NOTES.F5],
  salsa:     [NOTES.G4, NOTES.A4, NOTES.C5, NOTES.D5, NOTES.F5],
  merengue:  [NOTES.F4, NOTES.G4, NOTES.A4, NOTES.C5, NOTES.D5],
  cumbia:    [NOTES.F4, NOTES.G4, NOTES.A4, NOTES.C5, NOTES.E5],
  reggae:    [NOTES.E4, NOTES.G4, NOTES.A4, NOTES.B4, NOTES.D5],
  latintrap: [NOTES.A4, NOTES.C5, NOTES.D5, NOTES.F5, NOTES.G5],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
// All times offset by START so t=0 never causes negative AudioParam values
const START = 0.05;
function jitter(v: number, amt = 0.006): number { return Math.max(START, v + (Math.random() - 0.5) * amt); }

// ── Node helpers ───────────────────────────────────────────────────────────
function kick(ctx: OfflineAudioContext, when: number, vol = 1.0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  osc.connect(gain); gain.connect(comp); comp.connect(ctx.destination);
  osc.frequency.setValueAtTime(200, when);
  osc.frequency.exponentialRampToValueAtTime(0.001, when + 0.45);
  gain.gain.setValueAtTime(vol * 1.4, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.5);
  osc.start(when); osc.stop(when + 0.5);
}

function snare(ctx: OfflineAudioContext, when: number, vol = 0.55) {
  const bufSize = Math.floor(ctx.sampleRate * 0.18);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 3200;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(when);
}

function hat(ctx: OfflineAudioContext, when: number, vol = 0.18, duration = 0.04) {
  const bufSize = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 10000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(when);
}

function bassNote(ctx: OfflineAudioContext, when: number, freq: number, dur: number, vol = 0.55) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 280;
  const gain = ctx.createGain();
  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur * 0.85);
  osc.start(when); osc.stop(when + dur);
}

function chordNote(ctx: OfflineAudioContext, when: number, freq: number, dur: number, vol = 0.09) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2200;
  const reverb = ctx.createConvolver();
  const gain = ctx.createGain();
  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(vol, when + 0.04);
  gain.gain.setValueAtTime(vol, when + dur - 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.start(when); osc.stop(when + dur);
}

function melodyNote(ctx: OfflineAudioContext, when: number, freq: number, dur: number, vol = 0.13) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  const gain = ctx.createGain();
  const gain2 = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc2.connect(gain2); gain2.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, when);
  osc2.frequency.setValueAtTime(freq * 2, when);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(vol, when + 0.02);
  gain.gain.setValueAtTime(vol, when + dur - 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
  gain2.gain.setValueAtTime(0, when);
  gain2.gain.linearRampToValueAtTime(vol * 0.3, when + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.001, when + dur * 0.5);
  osc.start(when); osc.stop(when + dur);
  osc2.start(when); osc2.stop(when + dur);
}

// ── WAV encoder ────────────────────────────────────────────────────────────
function encodeWAV(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const numSamples = buffer.length;
  const byteRate = sr * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = numSamples * numChannels * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  const wr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  wr(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); wr(8, 'WAVE');
  wr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sr, true);
  view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); wr(36, 'data'); view.setUint32(40, dataSize, true);

  let offset = 44;
  const channels = Array.from({ length: numChannels }, (_, i) => buffer.getChannelData(i));
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

// ── Main export ────────────────────────────────────────────────────────────
export async function generateTrack(
  genre: string,
  mood: string,
  bpm: number,
  _vocals: string,
): Promise<string> {
  const SAMPLE_RATE = 44100;
  const DURATION = 30;
  const ctx = new OfflineAudioContext(2, SAMPLE_RATE * DURATION, SAMPLE_RATE);

  // Master compressor so it's not too hot
  const master = ctx.createDynamicsCompressor();
  master.threshold.value = -18;
  master.knee.value = 6;
  master.ratio.value = 4;
  master.attack.value = 0.003;
  master.release.value = 0.25;
  master.connect(ctx.destination);

  // "R&B" sanitizes to "rb" once symbols are stripped, but the tables below are
  // keyed "rnb" — alias it so R&B doesn't silently fall back to Hip-Hop.
  const GENRE_ALIASES: Record<string, string> = { rb: 'rnb' };
  const rawKey = genre.toLowerCase().replace(/[^a-z]/g, '');
  const genreKey = (GENRE_ALIASES[rawKey] ?? rawKey) as keyof typeof PROGRESSIONS;
  const prog = PROGRESSIONS[genreKey] ?? PROGRESSIONS.hiphop;
  const bassRoots = BASS_ROOTS[genreKey] ?? BASS_ROOTS.hiphop;
  const melScale = MELODY_SCALES[genreKey] ?? MELODY_SCALES.hiphop;

  const isTrap = genreKey === 'trap' || genreKey === 'drill' || genreKey === 'latintrap';
  const isAfro = genreKey === 'afrobeats';
  // Dembow riddim (the "boom-ch-boom-chick" pattern) underpins both
  // reggaeton and dembow — same rhythmic DNA, different intensity.
  const isDembow = genreKey === 'reggaeton' || genreKey === 'dembow';
  const isReggae = genreKey === 'reggae';
  const isSalsa = genreKey === 'salsa';
  const isMerengue = genreKey === 'merengue';

  const beat = 60 / bpm;           // seconds per quarter note
  const bar = beat * 4;             // seconds per bar
  const bars = Math.floor(DURATION / bar);
  const chordDur = bar * 2;         // 2 bars per chord

  // ── Drums ───────────────────────────────────────────────────────────────
  for (let b = 0; b < bars; b++) {
    const t = b * bar + START;

    if (isReggae) {
      // One-drop: kick and snare hit together on beat 3 only — the
      // signature reggae "drop" that leaves beat 1 empty.
      kick(ctx, jitter(t + beat * 2), 0.85);
      snare(ctx, jitter(t + beat * 2), 0.5);
    } else if (isDembow) {
      // Boom-ch-boom-chick: kick / kick(&2) / snare(3) / kick(4)
      kick(ctx, jitter(t), 0.9);
      kick(ctx, jitter(t + beat * 1.5), 0.6);
      snare(ctx, jitter(t + beat * 2), 0.6);
      kick(ctx, jitter(t + beat * 3), 0.55);
    } else if (isMerengue) {
      // Fast double-time merengue kick pattern
      kick(ctx, jitter(t), 0.7); kick(ctx, jitter(t + beat * 1), 0.55);
      kick(ctx, jitter(t + beat * 2), 0.7); kick(ctx, jitter(t + beat * 3), 0.55);
      snare(ctx, jitter(t + beat * 1.5), 0.4);
      snare(ctx, jitter(t + beat * 3.5), 0.4);
    } else {
      // Kick
      kick(ctx, jitter(t), 0.9);
      if (isTrap) { kick(ctx, jitter(t + beat * 2 + beat * 0.5), 0.65); }
      else if (isAfro) { kick(ctx, jitter(t + beat * 1.5), 0.55); kick(ctx, jitter(t + beat * 2.5), 0.5); }
      else { kick(ctx, jitter(t + beat * 2), 0.65); }

      // Snare
      snare(ctx, jitter(t + beat), 0.55);
      snare(ctx, jitter(t + beat * 3), 0.6);
      if (isAfro) snare(ctx, jitter(t + beat * 2.5), 0.3);
    }

    // Hi-hats — salsa stands in dense conga-like 16ths, reggae skanks on
    // the offbeat only, everything else gets the standard 8th-note pattern.
    if (isReggae) {
      for (let h = 0; h < 4; h++) hat(ctx, jitter(t + h * beat + beat / 2), 0.18, 0.06);
    } else {
      const hatStep = isTrap ? beat / 3 : isSalsa ? beat / 4 : beat / 2;
      const hatCount = Math.floor(bar / hatStep);
      for (let h = 0; h < hatCount; h++) {
        const hv = h % 2 === 0 ? 0.22 : 0.11;
        hat(ctx, jitter(t + h * hatStep), hv, isTrap ? 0.03 : 0.05);
      }
    }
  }

  // ── Bass ────────────────────────────────────────────────────────────────
  for (let c = 0; c < Math.ceil(bars / 2); c++) {
    const chord_i = c % prog.length;
    const t = c * chordDur + START;
    const root = bassRoots[chord_i];

    bassNote(ctx, jitter(t), root, beat * 1.2, 0.65);
    bassNote(ctx, jitter(t + beat * 1.5), root, beat * 0.5, 0.4);
    bassNote(ctx, jitter(t + beat * 2.5), root, beat * 0.8, 0.45);
    if (isTrap) bassNote(ctx, jitter(t + beat * 3.25), root * 1.5, beat * 0.4, 0.3);
  }

  // ── Chords (pads) ───────────────────────────────────────────────────────
  for (let c = 0; c < Math.ceil(bars / 2); c++) {
    const chord_i = c % prog.length;
    const t = c * chordDur + START;
    const notes = prog[chord_i];
    for (const freq of notes) {
      chordNote(ctx, t, freq, chordDur * 0.9, 0.1);
    }
  }

  // ── Melody (starts bar 4 for intro feel) ────────────────────────────────
  const melodyStartBar = Math.min(4, bars - 1);
  let prevNote = melScale[0];
  for (let b = melodyStartBar; b < bars; b++) {
    const t = b * bar + START;
    // Melody plays ~50% of beats, random selection
    const phrases = [[0, 1, 2.5], [0, 1.5, 3], [0.5, 2, 3.5]];
    const phrase = pick(phrases);
    for (const off of phrase) {
      if (Math.random() < 0.75) {
        const candidates = melScale.filter(f => Math.abs(f - prevNote) < 300);
        const freq = pick(candidates.length ? candidates : melScale);
        prevNote = freq;
        melodyNote(ctx, jitter(t + off * beat), freq, beat * 0.85, 0.14);
      }
    }
  }

  // ── Render & encode ─────────────────────────────────────────────────────
  const renderedBuffer = await ctx.startRendering();
  const blob = encodeWAV(renderedBuffer);
  return URL.createObjectURL(blob);
}
