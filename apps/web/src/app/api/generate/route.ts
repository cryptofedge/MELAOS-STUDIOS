import { NextRequest, NextResponse } from 'next/server';

// Hugging Face free Inference API — MusicGen stereo
const HF_API = 'https://api-inference.huggingface.co/models/facebook/musicgen-stereo-medium';
const HF_TOKEN = process.env.HF_TOKEN || '';

function buildPrompt(prompt: string, genre: string, mood: string, bpm: number, vocals: string): string {
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

  if (!HF_TOKEN) {
    return NextResponse.json(
      { error: 'No HF_TOKEN set. Add your free Hugging Face token to Render env vars.' },
      { status: 503 }
    );
  }

  const { prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120, vocals = 'male', duration = 30 } = body;
  // ~50 tokens per second of audio; cap at 150s to stay within server limits
  const maxTokens = Math.min(Math.max(Math.round(duration * 50), 750), 7500);
  const finalPrompt = buildPrompt(prompt, genre, mood, bpm, vocals);

  // Call HF Inference API — returns raw audio bytes (WAV/MP3 depending on model)
  const res = await fetch(HF_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'audio/wav',
    },
    body: JSON.stringify({
      inputs: finalPrompt,
      parameters: {
        max_new_tokens: maxTokens,
        do_sample: true,
        guidance_scale: 3.0,
      },
    }),
  });

  // HF returns 503 with estimated_time when model is loading
  if (res.status === 503) {
    const data = await res.json().catch(() => ({}));
    const wait = (data as any).estimated_time || 20;
    // Retry once after the model warms up
    await new Promise(r => setTimeout(r, Math.min(wait, 30) * 1000));
    const retry = await fetch(HF_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/wav',
      },
      body: JSON.stringify({
        inputs: finalPrompt,
        parameters: { max_new_tokens: maxTokens, do_sample: true, guidance_scale: 3.0 },
      }),
    });
    if (!retry.ok) {
      const err = await retry.text();
      return NextResponse.json({ error: `HF error after retry (${retry.status}): ${err.substring(0, 200)}` }, { status: 502 });
    }
    const audioBuffer = await retry.arrayBuffer();
    const b64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${b64}`;
    return NextResponse.json({ audioUrl, title: finalPrompt.substring(0, 50), duration });
  }

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `HF error (${res.status}): ${err.substring(0, 200)}` }, { status: 502 });
  }

  // Success — stream back as data URL so the browser can play it
  const audioBuffer = await res.arrayBuffer();
  const b64 = Buffer.from(audioBuffer).toString('base64');
  const audioUrl = `data:audio/wav;base64,${b64}`;
  return NextResponse.json({ audioUrl, title: finalPrompt.substring(0, 50), duration: 30 });
}
