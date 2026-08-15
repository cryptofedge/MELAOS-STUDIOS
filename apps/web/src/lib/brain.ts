import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────
// Melao's brain, shared.
//
// SOUL.md is who he is; MEMORY.md is what he knows about making records —
// tempo ranges, arrangement rules, why bachata has to ache, why the hook
// cannot wait past forty-five seconds.
//
// The chat bot reads it, and so does the songwriter: a song generated here
// should follow the same craft Melao teaches, not generic pop instincts.
// One loader, cached, so both paths stay in step.
// ─────────────────────────────────────────────────────────────────────────

const SOUL_FILE = path.join(process.cwd(), 'brain', 'SOUL.md');
const MEMORY_FILE = path.join(process.cwd(), 'brain', 'MEMORY.md');

let cache: { soul: string; memory: string } | null = null;

export async function loadBrainText(): Promise<{ soul: string; memory: string }> {
  if (cache) return cache;
  const [soul, memory] = await Promise.all([
    fs.readFile(SOUL_FILE, 'utf8').catch(() => ''),
    fs.readFile(MEMORY_FILE, 'utf8').catch(() => ''),
  ]);
  cache = { soul, memory };
  return cache;
}

type Section = { title: string; keywords: string; en: string };

async function sections(): Promise<Section[]> {
  const { memory } = await loadBrainText();
  if (!memory) return [];
  return memory.split(/^## /m).slice(1).map(block => {
    const title = block.split('\n')[0].trim();
    const keywords = (/keywords:\s*(.+)/i.exec(block)?.[1] ?? '').toLowerCase();
    // English answer only — the lyric writer is told the target language
    // separately, and the Spanish duplicate just doubles the prompt.
    const en = (/^EN:\s*([\s\S]*?)(?=^ES:|$)/m.exec(block)?.[1] ?? '').trim();
    return { title, keywords, en };
  }).filter(s => s.title && s.en);
}

const ALWAYS_RELEVANT = ['song structure', 'making a beat'];

/**
 * The production sections relevant to one genre, for the songwriter.
 *
 * The whole brain is mostly mixing and mic technique — useful to a person,
 * noise to a lyric writer. This pulls the sections whose keywords actually
 * match the genre, plus the ones about songwriting itself.
 */
export async function craftNotesFor(genre: string): Promise<string> {
  const wanted = genre.toLowerCase();
  return (await sections())
    .filter(s =>
      s.keywords.includes(wanted) ||
      s.title.toLowerCase().includes(wanted) ||
      ALWAYS_RELEVANT.includes(s.title.toLowerCase()))
    .map(s => `${s.title}: ${s.en}`)
    .join('\n\n');
}

/**
 * Anything the brain knows about a specific influence — who they are, where
 * they came from, who they came up under, what they released.
 *
 * Keyed on the name rather than the genre, so picking El Blachy on a
 * reggaeton track still carries his Cibao típico background into the writing.
 * Melao adds an artist section to MEMORY.md and generation uses it that day.
 */
export async function craftNotesForInfluence(name: string): Promise<string> {
  const wanted = name.toLowerCase();
  // Title match only. Matching on keywords too would pull in general topics
  // that merely mention the artist — the "Artist and producer influences"
  // feature doc lists names, and handing that back as an artist's background
  // is worse than having none. An artist gets a background when Melao writes
  // them a "## <Artist Name>" section, and not before.
  return (await sections())
    .filter(s => s.title.toLowerCase() === wanted)
    .map(s => `About ${s.title}: ${s.en}`)
    .join('\n\n');
}
