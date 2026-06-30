import { NextRequest, NextResponse } from 'next/server';

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

function buildTags(prompt: string, genre: string, mood: string, bpm: number) {
  const base = prompt.trim() || `${genre} music, ${mood.toLowerCase()} mood`;
  return `${base}, ${genre.toLowerCase()}, ${mood.toLowerCase()}, ${bpm} bpm`.slice(0, 300);
}

// ACE-Step's lyrics field doubles as the vocals on/off switch: [instrumental]
// or [inst] anywhere in it suppresses vocals entirely.
function buildLyrics(lyrics: string, vocals: string, genre: string, mood: string) {
  if (vocals === 'none') return '[instrumental]';
  const trimmed = (lyrics || '').trim();
  if (trimmed.length >= 10) return trimmed.slice(0, 2000);
  return `[verse]\n${mood} ${genre} energy in the air tonight\nFeel the rhythm, feel it right`;
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

  const MAX_WAIT_MS = 90_000;
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
    vocals = 'male', duration = 30, lyrics = '',
  } = body;

  const tags = buildTags(prompt, genre, mood, bpm);
  const finalLyrics = buildLyrics(lyrics, vocals, genre, mood);
  const dur = Math.min(Math.max(Number(duration) || 30, 10), 240);
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
  });
}
