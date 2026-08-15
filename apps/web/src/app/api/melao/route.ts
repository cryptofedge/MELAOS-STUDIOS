import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_ANSWERS, GREETINGS, KnowledgeEntry } from '@/lib/melaoKnowledge';
import { askMelao, geminiConfigured } from '@/lib/melaoBrain';
import { promises as fs } from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────
// Melao's backend — his BRAIN (apps/web/brain/SOUL.md + MEMORY.md, the same
// SOUL/MEMORY architecture as FEDGE 2.O) is the source of truth. Gemini
// reads the brain as grounding and answers in Melao's voice, so questions
// the keyword index never anticipated still get a real reply.
//
// If Gemini is unavailable or unconfigured, the original keyword retrieval
// answers instead — the bot degrades, it does not break.
//
// Melao trains the bot by editing MEMORY.md sections; this route parses
// them. Runtime teachings can also be added via the train action (persisted
// to a JSON file; export and merge into MEMORY.md for permanence).
// ─────────────────────────────────────────────────────────────────────────

const BRAIN_FILE = path.join(process.cwd(), 'brain', 'MEMORY.md');
const SOUL_FILE = path.join(process.cwd(), 'brain', 'SOUL.md');
const TRAINING_FILE = path.join(process.cwd(), 'melao-training.json');

// No default key. An unset MELAO_TRAIN_KEY disables training entirely rather
// than leaving a publicly known password able to rewrite what the bot says.
const TRAIN_KEY = process.env.MELAO_TRAIN_KEY;

let brainCache: KnowledgeEntry[] | null = null;
let trainedCache: KnowledgeEntry[] | null = null;
let rawBrainCache: { soul: string; memory: string } | null = null;

// Parse MEMORY.md: each "## Topic" section with `keywords:` / `EN:` / `ES:` lines.
function parseBrain(md: string): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];
  const sections = md.split(/^## /m).slice(1);
  for (const section of sections) {
    const lines = section.split('\n');
    const topic = lines[0].trim();
    const body = lines.slice(1).join('\n');
    const keywords = /keywords:\s*(.+)/i.exec(body)?.[1]
      ?.split(',').map(k => k.trim().toLowerCase()).filter(Boolean) ?? [];
    const en = /^EN:\s*([\s\S]*?)(?=^ES:|\n## |$)/m.exec(body)?.[1]?.trim() ?? '';
    const es = /^ES:\s*([\s\S]*?)(?=^EN:|\n## |$)/m.exec(body)?.[1]?.trim() ?? '';
    if (topic && keywords.length && (en || es)) {
      entries.push({ id: `brain-${entries.length}`, topic, keywords, answer: en, answerEs: es });
    }
  }
  return entries;
}

async function loadBrain(): Promise<KnowledgeEntry[]> {
  if (brainCache) return brainCache;
  try {
    brainCache = parseBrain(await fs.readFile(BRAIN_FILE, 'utf8'));
  } catch {
    brainCache = [];
  }
  return brainCache!;
}

// Raw brain text, for grounding the model rather than keyword matching.
async function loadRawBrain(): Promise<{ soul: string; memory: string }> {
  if (rawBrainCache) return rawBrainCache;
  const [soul, memory] = await Promise.all([
    fs.readFile(SOUL_FILE, 'utf8').catch(() => ''),
    fs.readFile(BRAIN_FILE, 'utf8').catch(() => ''),
  ]);
  rawBrainCache = { soul, memory };
  return rawBrainCache;
}

async function loadTrained(): Promise<KnowledgeEntry[]> {
  if (trainedCache) return trainedCache;
  try { trainedCache = JSON.parse(await fs.readFile(TRAINING_FILE, 'utf8')); }
  catch { trainedCache = []; }
  return trainedCache!;
}

async function saveTrained(entries: KnowledgeEntry[]) {
  trainedCache = entries;
  try { await fs.writeFile(TRAINING_FILE, JSON.stringify(entries, null, 2)); } catch { /* ephemeral fs */ }
}

function detectLang(input: string): 'en' | 'es' {
  const low = ` ${input.toLowerCase()} `;
  if (/[áéíóúñ¿¡]/.test(low)) return 'es';
  if (/ (hola|que lo que|dime|como|quiero|puedes|ayuda|musica|cancion|estudio|genero|ritmo|hacer|crear|gracias|el|la|los|una|un|de|y|con|para|mi) /.test(low)) return 'es';
  return 'en';
}

// Keyword-scored retrieval; live-trained entries outrank brain entries on
// ties so Melao's newest teachings take priority.
function findAnswer(message: string, brain: KnowledgeEntry[], trained: KnowledgeEntry[], lang: 'en' | 'es') {
  const low = message.toLowerCase();
  if (/^(hi|hey|hello|wassup|what's good|hola|que lo que|buenas|saludos)\b/.test(low.trim())) {
    return { answer: GREETINGS[lang], topic: 'greeting', source: 'brain' };
  }
  const scoreOf = (e: KnowledgeEntry) =>
    e.keywords.reduce((s, k) => (low.includes(k) ? s + k.split(' ').length : s), 0);
  let best: { entry: KnowledgeEntry; score: number; trained: boolean } | null = null;
  for (const e of trained) {
    const score = scoreOf(e);
    if (score > 0 && (!best || score >= best.score)) best = { entry: e, score, trained: true };
  }
  for (const e of brain) {
    const score = scoreOf(e);
    if (score > 0 && (!best || score > best.score)) best = { entry: e, score, trained: false };
  }
  if (!best) return { answer: DEFAULT_ANSWERS[lang], topic: null, source: 'default' };
  const { entry } = best;
  const answer = lang === 'es' ? (entry.answerEs || entry.answer) : (entry.answer || entry.answerEs);
  return { answer, topic: entry.topic, source: best.trained ? 'trained' : 'brain' };
}

// POST /api/melao — { message, lang? } → chat reply
//                   { action: 'train', key, entry } → teach Melao live
//                   { action: 'delete', key, id } → remove a live teaching
export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.action === 'train' || body.action === 'delete') {
    if (!TRAIN_KEY) {
      return NextResponse.json(
        { error: 'Training is disabled — MELAO_TRAIN_KEY is not set on the server.' },
        { status: 503 }
      );
    }
    if (body.key !== TRAIN_KEY) return NextResponse.json({ error: 'Wrong training key' }, { status: 401 });
    const trained = await loadTrained();
    if (body.action === 'train') {
      const { topic = 'Untitled', keywords = [], answer = '', answerEs = '' } = body.entry || {};
      if (!String(answer).trim() && !String(answerEs).trim()) {
        return NextResponse.json({ error: 'Answer required' }, { status: 400 });
      }
      const kw = (Array.isArray(keywords) ? keywords : String(keywords).split(','))
        .map((k: string) => k.trim().toLowerCase()).filter(Boolean);
      if (!kw.length) return NextResponse.json({ error: 'At least one keyword required' }, { status: 400 });
      const entry: KnowledgeEntry = {
        id: `melao-${Date.now()}`,
        topic: String(topic).slice(0, 80),
        keywords: kw,
        answer: String(answer).slice(0, 2000),
        answerEs: String(answerEs).slice(0, 2000),
      };
      await saveTrained([...trained, entry]);
      return NextResponse.json({ ok: true, entry });
    }
    await saveTrained(trained.filter(e => e.id !== body.id));
    return NextResponse.json({ ok: true });
  }

  const message = String(body.message || '').slice(0, 500);
  if (!message.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 });
  const lang: 'en' | 'es' = body.lang === 'es' || body.lang === 'en' ? body.lang : detectLang(message);
  const [brain, trained] = await Promise.all([loadBrain(), loadTrained()]);

  // Gemini answers grounded in the brain. Falls through to keyword retrieval
  // if it is unconfigured or the call fails.
  if (geminiConfigured()) {
    const { soul, memory } = await loadRawBrain();
    const answer = await askMelao(message, { soul, memory, trained, lang });
    if (answer) return NextResponse.json({ answer, topic: null, source: 'gemini', lang });
  }

  const result = findAnswer(message, brain, trained, lang);
  return NextResponse.json({ ...result, lang });
}

// GET /api/melao?key=... — list/export Melao's live teachings + brain size
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (key !== TRAIN_KEY) return NextResponse.json({ error: 'Wrong training key' }, { status: 401 });
  const [brain, trained] = await Promise.all([loadBrain(), loadTrained()]);
  return NextResponse.json({ entries: trained, brainTopics: brain.map(b => b.topic) });
}
