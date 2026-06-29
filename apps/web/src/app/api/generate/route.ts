import { NextRequest, NextResponse } from 'next/server';

const REPLICATE_API = 'https://api.replicate.com/v1';
// MusicGen stereo-large — best quality for music generation
const MODEL_VERSION = '671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb';

function buildPrompt(params: {
  prompt: string;
  genre: string;
  mood: string;
  bpm: number;
  vocals: string;
}) {
  const { prompt, genre, mood, bpm, vocals } = params;
  const vocalStr = vocals === 'none' ? 'instrumental, no vocals' : `${vocals} vocals`;
  const base = prompt.trim()
    ? prompt.trim()
    : `${genre} music, ${mood.toLowerCase()} mood`;
  return `${base}, ${genre}, ${mood.toLowerCase()}, ${bpm} BPM, ${vocalStr}, high quality, professional studio recording`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120, vocals = 'male' } = body;
  const finalPrompt = buildPrompt({ prompt, genre, mood, bpm, vocals });

  // 1. Create prediction
  const createRes = await fetch(`${REPLICATE_API}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        prompt: finalPrompt,
        duration: 30,
        model_version: 'stereo-large',
        output_format: 'mp3',
        normalization_strategy: 'peak',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    return NextResponse.json({ error: `Replicate create failed: ${err}` }, { status: 502 });
  }

  const prediction = await createRes.json();
  const id = prediction.id;

  // 2. Poll until complete (max 90 seconds)
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));

    const pollRes = await fetch(`${REPLICATE_API}/predictions/${id}`, {
      headers: { Authorization: `Token ${apiKey}` },
    });

    if (!pollRes.ok) continue;
    const result = await pollRes.json();

    if (result.status === 'succeeded') {
      const audioUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      return NextResponse.json({ audioUrl, prompt: finalPrompt });
    }

    if (result.status === 'failed' || result.status === 'canceled') {
      return NextResponse.json({ error: `Generation ${result.status}: ${result.error}` }, { status: 502 });
    }
    // still processing — keep polling
  }

  return NextResponse.json({ error: 'Generation timed out after 90s' }, { status: 504 });
}
