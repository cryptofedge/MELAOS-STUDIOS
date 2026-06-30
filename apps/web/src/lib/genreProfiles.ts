// Shared genre/mood knowledge base — real production characteristics (tempo,
// instrumentation, rhythm) for every genre MELAOS supports, spanning US and
// Latin American traditions. Used to (1) populate Studio's genre/mood
// selectors, (2) enrich AI generation prompts with actual production
// language instead of just a bare genre word, and (3) drive the local synth
// fallback's chord/bass/melody tables so every genre sounds distinct.

export interface GenreProfile {
  label: string;
  bpmRange: [number, number];
  defaultBpm: number;
  /** Real instrumentation/rhythm descriptors fed into the AI prompt. */
  descriptor: string;
  /** Style lineage — legendary producers/songwriters who defined the sound. */
  lineage: string;
  /** Visual direction for AI-generated cover art. */
  artStyle: string;
}

export const GENRES = [
  'Hip-Hop', 'Trap', 'Drill', 'R&B', 'Soul', 'Pop', 'Electronic', 'Afrobeats',
  'Reggaeton', 'Dembow', 'Bachata', 'Salsa', 'Merengue', 'Cumbia', 'Reggae', 'Latin Trap',
] as const;

export const MOODS = [
  'Energetic', 'Melancholic', 'Euphoric', 'Dark', 'Chill', 'Aggressive',
  'Romantic', 'Sensual', 'Festive', 'Nostalgic',
] as const;

export const GENRE_PROFILES: Record<string, GenreProfile> = {
  'Hip-Hop': {
    label: 'Hip-Hop',
    bpmRange: [80, 100], defaultBpm: 90,
    descriptor: 'boom bap drums, sampled soul loop, deep 808 bass, vinyl warmth',
    lineage: 'in the lineage of Dr. Dre and Kanye West-era sample-based production',
    artStyle: 'urban street art, graffiti, city skyline, bold typography',
  },
  Trap: {
    label: 'Trap',
    bpmRange: [130, 150], defaultBpm: 140,
    descriptor: 'rolling hi-hat triplets, sliding 808 bass, dark cinematic synths, hard-hitting snare',
    lineage: 'in the style of Metro Boomin and Southside / 808 Mafia trap production',
    artStyle: 'dark moody aesthetic, purple fog, luxury cars, night city neon',
  },
  Drill: {
    label: 'Drill',
    bpmRange: [138, 145], defaultBpm: 140,
    descriptor: 'sliding 808 glides, syncopated drill hi-hats, ominous piano/strings, gritty UK/Chicago drum pattern',
    lineage: 'in the style of Tay Keith-era drill production',
    artStyle: 'dark concrete, black and white gritty, urban menace, smoke',
  },
  'R&B': {
    label: 'R&B',
    bpmRange: [60, 90], defaultBpm: 75,
    descriptor: 'smooth Rhodes/electric piano chords, silky layered vocals, neo-soul guitar, warm sub bass',
    lineage: 'in the lineage of Babyface and Pharrell-style R&B production',
    artStyle: 'soft golden light, silk textures, intimate atmosphere, warm tones',
  },
  Soul: {
    label: 'Soul',
    bpmRange: [70, 100], defaultBpm: 85,
    descriptor: 'live drums, horn section, warm Rhodes piano, analog bassline, vintage tape warmth',
    lineage: 'in the lineage of Quincy Jones-style soul arrangement',
    artStyle: 'vintage vinyl record texture, warm sepia, jazz club atmosphere',
  },
  Pop: {
    label: 'Pop',
    bpmRange: [100, 128], defaultBpm: 115,
    descriptor: 'polished radio production, catchy synth hook, bright layered vocals, punchy drums',
    lineage: 'in the style of Max Martin-style pop songcraft',
    artStyle: 'bright pastel gradients, confetti, glossy bubbly shapes',
  },
  Electronic: {
    label: 'Electronic',
    bpmRange: [120, 130], defaultBpm: 126,
    descriptor: 'four-on-the-floor kick, sidechain-pumping synths, rising arpeggios, festival-ready drop',
    lineage: 'in the style of Calvin Harris-era dance production',
    artStyle: 'glowing circuits, neon grid, futuristic holographic visuals',
  },
  Afrobeats: {
    label: 'Afrobeats',
    bpmRange: [95, 110], defaultBpm: 102,
    descriptor: 'log drum bass, syncopated West African percussion, call-and-response vocal hooks, airy synths',
    lineage: 'in the lineage of Don Jazzy and Sarz-style Afrobeats production',
    artStyle: 'vibrant colors, african patterns, tropical energy, sunset palette',
  },
  Reggaeton: {
    label: 'Reggaeton',
    bpmRange: [90, 100], defaultBpm: 95,
    descriptor: 'dembow riddim (boom-ch-boom-chick), brassy synth stabs, deep sub bass, Latin urban flow',
    lineage: 'in the lineage of Tainy and Luny Tunes-style reggaeton production',
    artStyle: 'neon Latin urban nightlife, palm trees, glowing skyline, vibrant magenta and gold',
  },
  Dembow: {
    label: 'Dembow',
    bpmRange: [95, 110], defaultBpm: 105,
    descriptor: 'raw Dominican dembow riddim, distorted bass hit, rapid-fire flow energy, street-level grit',
    lineage: 'in the style of El Alfa-era Dominican dembow production',
    artStyle: 'gritty Caribbean street scene, bold graffiti, hot neon colors, raw energy',
  },
  Bachata: {
    label: 'Bachata',
    bpmRange: [120, 130], defaultBpm: 125,
    descriptor: 'requinto guitar arpeggios, bongo and güira percussion, romantic minor-key melody, bolero-rooted bassline',
    lineage: 'in the lineage of Romeo Santos and Juan Luis Guerra-style bachata',
    artStyle: 'warm romantic candlelight, Dominican countryside, soft sepia and rose tones',
  },
  Salsa: {
    label: 'Salsa',
    bpmRange: [170, 220], defaultBpm: 190,
    descriptor: 'clave rhythm, conga and timbales, piano montuno, horn section stabs, son-rooted groove',
    lineage: 'in the lineage of Willie Colón and Marc Anthony-style salsa dura',
    artStyle: 'vibrant dance hall, bold tropical colors, motion blur of dancers, golden brass',
  },
  Merengue: {
    label: 'Merengue',
    bpmRange: [120, 160], defaultBpm: 140,
    descriptor: 'fast two-step tambora drum, güira scraper, accordion or synth horns, driving Dominican groove',
    lineage: 'in the lineage of Juan Luis Guerra and Wilfrido Vargas-style merengue',
    artStyle: 'festive carnival colors, Dominican flag motifs, energetic motion, bright sunlight',
  },
  Cumbia: {
    label: 'Cumbia',
    bpmRange: [90, 100], defaultBpm: 95,
    descriptor: 'accordion melody, guacharaca scraper, cumbia drum pattern, tropical mid-tempo groove',
    lineage: 'in the lineage of Celso Piña-style modern cumbia',
    artStyle: 'tropical riverside village, warm earth tones, folkloric patterns, golden hour light',
  },
  Reggae: {
    label: 'Reggae',
    bpmRange: [60, 90], defaultBpm: 75,
    descriptor: 'offbeat skank guitar, deep one-drop bassline, laid-back drum groove, dub-style space',
    lineage: 'in the lineage of Lee "Scratch" Perry-style reggae production',
    artStyle: 'Jamaican flag colors, lush green hills, sun-drenched warmth, relaxed island vibe',
  },
  'Latin Trap': {
    label: 'Latin Trap',
    bpmRange: [130, 150], defaultBpm: 138,
    descriptor: 'trap 808 bass with Latin urban flow, reggaeton-trap fusion hats, dark Spanish-language energy',
    lineage: 'in the style of Tainy and Ovy On The Drums-style Latin trap',
    artStyle: 'dark neon Latin nightlife, luxury and grit, gold chains and city lights',
  },
};

export function buildGenreTags(genre: string, mood: string, bpm: number): string {
  const profile = GENRE_PROFILES[genre];
  if (!profile) return `${genre} music, ${mood.toLowerCase()} mood, ${bpm} BPM`;
  return `${profile.label}, ${profile.descriptor}, ${profile.lineage}, ${mood.toLowerCase()} mood, ${bpm} BPM`;
}

export function genreArtStyle(genre: string): string {
  return GENRE_PROFILES[genre]?.artStyle ?? 'abstract music album art';
}
