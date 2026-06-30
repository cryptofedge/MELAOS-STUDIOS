import { NextRequest, NextResponse } from 'next/server';

// Hosted MusicGen via Replicate — real, already-trained model, no GPU/training
// required on our side. Requires REPLICATE_API_TOKEN (server-side only, never
// exposed to the browser).
//
// meta/musicgen is a community model, not an "official model" — Replicate's
// shorthand /models/{owner}/{name}/predictions route 404s for it. It must be
// run via the versioned /predictions endpoint instead.
const REPLICATE_MODEL_VERSION = '671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb';
const REPLICATE_API = 'https://api.replicate.com/v1';

function buildPrompt(prompt: string, genre: string, mood: string, bpm: number, vocals: string) {
  const base = prompt.trim() || `${genre} music, ${mood.toLowerCase()} mood`;
  const parts = [base, `${bpm} BPM`];
  if (vocals === 'none') parts.push('instrumental, no vocals');
  else parts.push(`${vocals} vocals`);
  parts.push('high quality, professional studio recording');
  return parts.join(', ');
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

  const { prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120, vocals = 'male', duration = 10 } = body;
  const finalPrompt = buildPrompt(prompt, genre, mood, bpm, vocals);
  const dur = Math.min(Math.max(Number(duration) || 10, 5), 30);

  // ── Step 1: create the prediction ──────────────────────────────────────────
  const createRes = await fetch(`${REPLICATE_API}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=25', // ask Replicate to hold the connection up to 25s if it finishes fast
    },
    body: JSON.stringify({
      version: REPLICATE_MODEL_VERSION,
      input: {
        prompt: finalPrompt,
        duration: dur,
        model_version: 'stereo-melody-large',
        output_format: 'mp3',
        normalization_strategy: 'peak',
      },
    }),
  }).catch(e => { throw new Error(`Replicate request error: ${e.message}`); });

  if (!createRes.ok) {
    const txt = await createRes.text().catch(() => '');
    return NextResponse.json(
      { error: `Replicate request failed (${createRes.status}): ${txt.substring(0, 300)}` },
      { status: 502 }
    );
  }

  let prediction = await createRes.json();

  // ── Step 2: poll until the prediction completes ────────────────────────────
  const MAX_WAIT_MS = 90_000;
  const started = Date.now();

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (Date.now() - started > MAX_WAIT_MS) {
      return NextResponse.json(
        { error: 'Music generation timed out — Replicate may be under load. Try again in a moment.' },
        { status: 504 }
      );
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
    return NextResponse.json({ error: `Generation failed: ${reason}` }, { status: 502 });
  }

  const audioUrl: string | undefined = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!audioUrl) {
    return NextResponse.json({ error: 'Replicate returned no audio output' }, { status: 502 });
  }

  // ── Step 3: fetch audio bytes and return as base64 data URL ───────────────
  const audioRes = await fetch(audioUrl).catch(e => { throw new Error(`Audio fetch error: ${e.message}`); });
  if (!audioRes.ok) throw new Error(`Audio fetch ${audioRes.status}`);

  const audioBuffer = await audioRes.arrayBuffer();
  const b64 = Buffer.from(audioBuffer).toString('base64');
  const mimeType = audioRes.headers.get('content-type') || 'audio/mpeg';

  return NextResponse.json({
    audioUrl: `data:${mimeType};base64,${b64}`,
    title: finalPrompt.substring(0, 50),
    duration: dur,
  });
}
