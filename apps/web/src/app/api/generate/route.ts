import { NextRequest, NextResponse } from 'next/server';

// HF Inference API — works anonymously for public models (lower rate limits)
// Set HF_TOKEN env var on Render for higher limits
const HF_API = 'https://api-inference.huggingface.co/models/facebook/musicgen-stereo-medium';
const HF_TOKEN = process.env.HF_TOKEN || '';

function hfHeaders() {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'audio/wav',
  };
  if (HF_TOKEN) h['Authorization'] = `Bearer ${HF_TOKEN}`;
  return h;
}

function buildPrompt(prompt: string, genre: string, mood: string, bpm: number, vocals: string): string {
  const base = prompt.trim() || `${genre} music, ${mood.toLowerCase()} mood`;
  const parts = [base, `${bpm} BPM`];
  if (vocals === 'none') parts.push('instrumental, no vocals');
  else parts.push(`${vocals} vocals`);
  parts.push('high quality, professional studio recording');
  return parts.join(', ');
}

function hfBody(finalPrompt: string, maxTokens: number) {
  return JSON.stringify({
    inputs: finalPrompt,
    parameters: { max_new_tokens: maxTokens, do_sample: true, guidance_scale: 3.0 },
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120, vocals = 'male', duration = 30 } = body;
  const maxTokens = Math.min(Math.max(Math.round(duration * 50), 750), 7500);
  const finalPrompt = buildPrompt(prompt, genre, mood, bpm, vocals);

  let res = await fetch(HF_API, { method: 'POST', headers: hfHeaders(), body: hfBody(finalPrompt, maxTokens) });

  // 503 = model warming up — wait then retry once
  if (res.status === 503) {
    const data = await res.json().catch(() => ({}));
    const wait = Math.min((data as any).estimated_time || 20, 40);
    await new Promise(r => setTimeout(r, wait * 1000));
    res = await fetch(HF_API, { method: 'POST', headers: hfHeaders(), body: hfBody(finalPrompt, maxTokens) });
  }

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Music generation error (${res.status}): ${err.substring(0, 300)}` },
      { status: 502 }
    );
  }

  const audioBuffer = await res.arrayBuffer();
  const audioUrl = `data:audio/wav;base64,${Buffer.from(audioBuffer).toString('base64')}`;
  return NextResponse.json({ audioUrl, title: finalPrompt.substring(0, 50), duration });
}
