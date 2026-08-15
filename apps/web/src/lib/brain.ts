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

/**
 * The production sections relevant to one genre, for the songwriter.
 *
 * The whole brain is mostly mixing and mic technique — useful to a person,
 * noise to a lyric writer. This pulls the sections whose keywords actually
 * match the genre, plus the ones about songwriting itself.
 */
export async function craftNotesFor(genre: string): Promise<string> {
  const { memory } = await loadBrainText();
  if (!memory) return '';

  const wanted = genre.toLowerCase();
  const alwaysRelevant = ['song structure', 'making a beat'];

  const sections = memory.split(/^## /m).slice(1);
  const picked: string[] = [];

  for (const section of sections) {
    const title = section.split('\n')[0].trim();
    const keywords = /keywords:\s*(.+)/i.exec(section)?.[1]?.toLowerCase() ?? '';
    const matchesGenre = keywords.includes(wanted) || title.toLowerCase().includes(wanted);
    if (!matchesGenre && !alwaysRelevant.includes(title.toLowerCase())) continue;

    // Only the English answer — the lyric writer is told the target language
    // separately, and the Spanish duplicate just doubles the prompt.
    const en = /^EN:\s*([\s\S]*?)(?=^ES:|$)/m.exec(section)?.[1]?.trim();
    if (en) picked.push(`${title}: ${en}`);
  }

  return picked.join('\n\n');
}
