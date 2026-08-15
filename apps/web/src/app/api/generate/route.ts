import { NextRequest, NextResponse } from 'next/server';
import { buildGenreTags } from '@/lib/genreProfiles';
import { writeLyrics, songwriterAvailable } from '@/lib/songwriter';
import { findInfluence, detectInfluences, type Influence } from '@/lib/artistInfluences';

// Hosted ACE-Step 1.5 via Replicate — a real, already-trained, MIT-licensed
// music foundation model (open-source, ~11k GitHub stars, actively
// maintained) benchmarked between Suno v4.5 and v5 quality. Handles both
// instrumental and vocal generation in one model via the `lyrics` field.
// Requires REPLICATE_API_TOKEN (server-side only, never exposed to the
// browser).
//
// lucataco/ace-step is a community model, not an "official model" on
// Replicate, so the /models/{owner}/{name}/predictions shorthand 404s for
// it — it must be run via the versioned /predictions endpoint.
const ACE_STEP_VERSION = '280fc4f9ee507577f880a167f639c02622421d8fecf492454320311217b688f1';
const REPLICATE_API = 'https://api.replicate.com/v1';

// Combines the user's free-text prompt (if any) with real production
// knowledge for the chosen genre — instrumentation, rhythm, and the
// legendary producer lineage that defines the sound — so ACE-Step gets a
// genuinely informed prompt instead of just a bare genre word.
// An explicitly picked influence wins; otherwise names mentioned in the prompt
// itself are honoured, so "a bachata like Romeo Santos" works without anyone
// opening a dropdown.
function resolveInfluences(prompt: string, picked?: string): Influence[] {
  const explicit = picked ? findInfluence(picked) : undefined;
  if (explicit) return [explicit];
  return detectInfluences(prompt, 2);
}

function buildTags(
  prompt: string, genre: string, mood: string, bpm: number,
  lyricsLanguage: string, influences: Influence[]
) {
  const enriched = buildGenreTags(genre, mood, bpm);
  const base = prompt.trim();
  const langTag = lyricsLanguage && lyricsLanguage !== 'English' ? `, ${lyricsLanguage} vocals` : '';

  // Influence tags lead: they are the most specific instruction available, and
  // the tag budget is only 350 characters, so what matters must survive the cut.
  const infTag = influences.length ? `${influences.map(i => i.tag).join(', ')}, ` : '';

  return (base ? `${base}, ${infTag}${enriched}${langTag}` : `${infTag}${enriched}${langTag}`).slice(0, 350);
}

// ACE-Step's lyrics field doubles as the vocals on/off switch: [instrumental]
// or [inst] anywhere in it suppresses vocals entirely.
//
// Everything sung comes from this field — the style tags only shape the
// backing track. So when the user has not written lyrics, they have to be
// written from the prompt, or the vocal ends up singing something unrelated
// to what was asked for.
async function buildLyrics(
  lyrics: string, vocals: string, genre: string, mood: string,
  prompt: string, language: string, influences: Influence[]
) {
  if (vocals === 'none') return '[instrumental]';

  const trimmed = (lyrics || '').trim();
  if (trimmed.length >= 10) return trimmed.slice(0, 2000);

  if (songwriterAvailable() && prompt.trim()) {
    const lead = influences[0];
    const written = await writeLyrics({
      prompt, genre, mood, language, vocals,
      influenceStyle: lead?.style,
      influenceName: lead?.name,
    });
    if (written) return written;
  }

  // Last resort only: no prompt to work from, or the songwriter was
  // unreachable. Anything sung here is generic by definition.
  return `[Verse]\n${mood} ${genre} energy in the air tonight\nFeel the rhythm, feel it right`;
}

async function runReplicate(token: string, version: string, input: Record<string, unknown>) {
  const createRes = await fetch(`${REPLICATE_API}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=25', // ask Replicate to hold the connection up to 25s if it finishes fast
    },
    body: JSON.stringify({ version, input }),
  }).catch(e => { throw new Error(`Replicate request error: ${e.message}`); });

  if (!createRes.ok) {
    const txt = await createRes.text().catch(() => '');
    return { error: `Replicate request failed (${createRes.status}): ${txt.substring(0, 300)}`, status: 502 as const };
  }

  let prediction = await createRes.json();

  const MAX_WAIT_MS = 160_000;
  const started = Date.now();

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (Date.now() - started > MAX_WAIT_MS) {
      return { error: 'Music generation timed out — Replicate may be under load. Try again in a moment.', status: 504 as const };
    }
    await new Promise(r => setTimeout(r, 1500));

    const pollRes = await fetch(`${REPLICATE_API}/predictions/${prediction.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(e => { throw new Error(`Replicate poll error: ${e.message}`); });

    if (!pollRes.ok) throw new Error(`Replicate poll ${pollRes.status}`);
    prediction = await pollRes.json();
  }

  if (prediction.status !== 'succeeded') {
    const reason = prediction.error || `Generation ${prediction.status}`;
    return { error: `Generation failed: ${reason}`, status: 502 as const };
  }

  const audioUrl: string | undefined = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!audioUrl) return { error: 'Replicate returned no audio output', status: 502 as const };

  return { audioUrl };
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'AI generation not configured — REPLICATE_API_TOKEN is missing.' },
      { status: 503 }
    );
  }

  const {
    prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120,
    vocals = 'male', duration = 30, lyrics = '', lyricsLanguage = 'English',
    tier = 'free', influence = '',
  } = body;

  const influences = resolveInfluences(prompt, influence);
  const tags = buildTags(prompt, genre, mood, bpm, lyricsLanguage, influences);
  const finalLyrics = await buildLyrics(lyrics, vocals, genre, mood, prompt, lyricsLanguage, influences);
  // Free tier is capped at a sub-minute preview; paid tiers get full songs.
  // (Note: tier is client-reported until real auth lands — this cap is a
  // product gate, not a security boundary.)
  const tierCap = tier === 'pro' || tier === 'premier' ? 240 : 50;
  const dur = Math.min(Math.max(Number(duration) || 30, 10), tierCap);
  const title = tags.substring(0, 50);

  const result = await runReplicate(token, ACE_STEP_VERSION, {
    tags,
    lyrics: finalLyrics,
    duration: dur,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 502 });
  }

  // ── Fetch audio bytes and return as base64 data URL ────────────────────────
  const audioRes = await fetch(result.audioUrl!).catch(e => { throw new Error(`Audio fetch error: ${e.message}`); });
  if (!audioRes.ok) throw new Error(`Audio fetch ${audioRes.status}`);

  const audioBuffer = await audioRes.arrayBuffer();
  const b64 = Buffer.from(audioBuffer).toString('base64');
  const mimeType = audioRes.headers.get('content-type') || 'audio/mpeg';

  return NextResponse.json({
    audioUrl: `data:${mimeType};base64,${b64}`,
    title,
    duration: dur,
    // The words that were actually sung. Without this the studio's lyrics
    // panel stays empty and there is no way to read, edit or reuse what the
    // songwriter wrote. Omitted for instrumentals, which have none.
    lyrics: finalLyrics === '[instrumental]' ? '' : finalLyrics,
    // Surfaced so the studio can show what steered the track — especially when
    // it was picked up from the prompt rather than chosen from the list.
    influences: influences.map(i => i.name),
  });
}
