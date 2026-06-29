import { NextRequest, NextResponse } from 'next/server';

const SUNO_API = 'https://studio-api.suno.ai/api';

// In-memory token store — updated by /api/suno-token endpoint
let runtimeToken: string | null = null;

function getToken(): string | null {
  return runtimeToken || process.env.SUNO_JWT || null;
}

function buildTags(genre: string, mood: string, vocals: string): string {
  const parts = [genre, mood.toLowerCase()];
  if (vocals === 'none') parts.push('instrumental');
  else parts.push(`${vocals} vocals`);
  return parts.join(', ');
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const token = getToken();
  if (!token) {
    return NextResponse.json({ error: 'No Suno token configured. Set SUNO_JWT env var on Render.' }, { status: 503 });
  }

  const { prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120, vocals = 'male' } = body;

  const tags = buildTags(genre, mood, vocals);
  const finalPrompt = prompt.trim()
    ? `${prompt.trim()}, ${bpm} BPM`
    : `${genre} music, ${mood.toLowerCase()} mood, ${bpm} BPM`;

  // 1. Submit generation request to Suno
  const genRes = await fetch(`${SUNO_API}/generate/v2/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      prompt: finalPrompt,
      mv: 'chirp-v3-5',
      title: '',
      tags,
      make_instrumental: vocals === 'none',
      generation_type: 'TEXT',
    }),
  });

  if (!genRes.ok) {
    const err = await genRes.text();
    // If token expired, clear runtime token so next call uses env var refresh
    if (genRes.status === 401) runtimeToken = null;
    return NextResponse.json({ error: `Suno error (${genRes.status}): ${err}` }, { status: 502 });
  }

  const genData = await genRes.json();
  const clips: any[] = genData.clips || [];
  if (!clips.length) {
    return NextResponse.json({ error: 'No clips returned from Suno' }, { status: 502 });
  }
  const ids = clips.map((c: any) => c.id).join(',');

  // 2. Poll feed until complete (max 120s)
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4000));

    const feedRes = await fetch(`${SUNO_API}/feed/?ids=${ids}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });

    if (!feedRes.ok) continue;
    const feed: any[] = await feedRes.json();

    const done = feed.filter((c: any) => c.status === 'complete' && c.audio_url);
    if (done.length > 0) {
      const clip = done[0];
      return NextResponse.json({
        audioUrl: clip.audio_url,
        title: clip.title || finalPrompt.substring(0, 40),
        imageUrl: clip.image_url || null,
        duration: clip.metadata?.duration || 60,
        clipId: clip.id,
      });
    }

    const failed = feed.filter((c: any) => c.status === 'error');
    if (failed.length === feed.length) {
      return NextResponse.json({ error: 'Suno generation failed' }, { status: 502 });
    }
  }

  return NextResponse.json({ error: 'Generation timed out after 120s' }, { status: 504 });
}
