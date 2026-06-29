import { NextRequest, NextResponse } from 'next/server';

// Public HuggingFace MusicGen Gradio Space — no token needed
const SPACE = 'https://facebook-musicgen.hf.space';

function randHash() {
  return Math.random().toString(36).slice(2, 10);
}

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

  const { prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120, vocals = 'male', duration = 10 } = body;
  const finalPrompt = buildPrompt(prompt, genre, mood, bpm, vocals);
  const dur = Math.min(Math.max(duration, 5), 30);
  const sessionHash = randHash();

  // ── Step 1: join the Gradio queue ──────────────────────────────────────────
  const joinRes = await fetch(`${SPACE}/queue/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fn_index: 0,
      data: [finalPrompt, null, dur, 'facebook/musicgen-melody', 250, 0, 1.0, 3.0],
      session_hash: sessionHash,
    }),
  }).catch(e => { throw new Error(`Queue join network error: ${e.message}`); });

  if (!joinRes.ok) {
    const txt = await joinRes.text().catch(() => '');
    throw new Error(`Queue join ${joinRes.status}: ${txt.substring(0, 200)}`);
  }

  // ── Step 2: consume SSE stream until process_completed ────────────────────
  const MAX_WAIT_MS = 120_000;
  const started = Date.now();

  const streamRes = await fetch(`${SPACE}/queue/data?session_hash=${sessionHash}`, {
    headers: { Accept: 'text/event-stream' },
    signal: AbortSignal.timeout(MAX_WAIT_MS),
  }).catch(e => { throw new Error(`Queue stream error: ${e.message}`); });

  if (!streamRes.ok || !streamRes.body) {
    throw new Error(`Queue stream ${streamRes.status}`);
  }

  const reader = streamRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let audioUrl: string | null = null;

  outer: while (Date.now() - started < MAX_WAIT_MS) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      let evt: any;
      try { evt = JSON.parse(line.slice(5)); } catch { continue; }

      if (evt.msg === 'process_completed') {
        const output = evt.output?.data?.[0];
        if (output?.url) { audioUrl = output.url; break outer; }
        if (output?.name) { audioUrl = `${SPACE}/file=${output.name}`; break outer; }
        if (typeof output === 'string' && output.startsWith('http')) { audioUrl = output; break outer; }
      }

      if (evt.msg === 'process_generating') {
        // intermediate chunk — ignore and keep reading
      }
    }
  }

  reader.cancel().catch(() => {});

  if (!audioUrl) {
    return NextResponse.json(
      { error: 'Music generation timed out — Gradio Space may be busy. Try again in a moment.' },
      { status: 504 }
    );
  }

  // ── Step 3: fetch audio bytes and return as base64 data URL ───────────────
  const audioRes = await fetch(audioUrl).catch(e => { throw new Error(`Audio fetch error: ${e.message}`); });
  if (!audioRes.ok) throw new Error(`Audio fetch ${audioRes.status}`);

  const audioBuffer = await audioRes.arrayBuffer();
  const b64 = Buffer.from(audioBuffer).toString('base64');
  const mimeType = audioRes.headers.get('content-type') || 'audio/wav';

  return NextResponse.json({
    audioUrl: `data:${mimeType};base64,${b64}`,
    title: finalPrompt.substring(0, 50),
    duration: dur,
  });
}
