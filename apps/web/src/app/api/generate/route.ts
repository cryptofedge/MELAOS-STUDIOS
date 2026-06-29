import { NextRequest, NextResponse } from 'next/server';

const SUNO_API = 'https://studio-api.suno.ai/api';
const CLERK_API = 'https://auth.suno.com/v1/client/sessions';

// In-process JWT cache — refreshed automatically
let cachedJwt: string | null = null;
let jwtExpiresAt = 0;

async function getFreshJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached JWT if still valid (with 2-min buffer)
  if (cachedJwt && jwtExpiresAt - now > 120) return cachedJwt;

  // Try to refresh via Clerk using stored cookie
  const cookie = process.env.SUNO_COOKIE;
  const sessionId = process.env.SUNO_SESSION_ID || 'session_2c632f487407704d569ae2';

  if (cookie) {
    try {
      const res = await fetch(`${CLERK_API}/${sessionId}/tokens`, {
        method: 'POST',
        headers: {
          'Cookie': cookie,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://suno.com',
          'Referer': 'https://suno.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const token: string = data.jwt || data.token || '';
        if (token) {
          cachedJwt = token;
          try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            jwtExpiresAt = payload.exp;
          } catch { jwtExpiresAt = now + 3600; }
          // Persist so next cold start has it
          process.env.SUNO_JWT = token;
          return token;
        }
      }
    } catch (e) {
      console.error('Clerk refresh failed:', e);
    }
  }

  // Fall back to stored JWT
  const stored = process.env.SUNO_JWT;
  if (stored) {
    cachedJwt = stored;
    try {
      const payload = JSON.parse(Buffer.from(stored.split('.')[1], 'base64').toString());
      jwtExpiresAt = payload.exp;
    } catch { jwtExpiresAt = now + 3600; }
    return stored;
  }

  throw new Error('No Suno token available. Set SUNO_COOKIE + SUNO_SESSION_ID on Render.');
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

  let token: string;
  try { token = await getFreshJwt(); }
  catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 503 });
  }

  const { prompt = '', genre = 'Hip-Hop', mood = 'Energetic', bpm = 120, vocals = 'male' } = body;
  const tags = buildTags(genre, mood, vocals);
  const finalPrompt = prompt.trim()
    ? `${prompt.trim()}, ${bpm} BPM`
    : `${genre} music, ${mood.toLowerCase()} mood, ${bpm} BPM`;

  // 1. Submit to Suno
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
    // Invalidate cached JWT on auth failure so next request refreshes
    if (genRes.status === 401) { cachedJwt = null; jwtExpiresAt = 0; }
    return NextResponse.json({ error: `Suno error (${genRes.status}): ${err}` }, { status: 502 });
  }

  const genData = await genRes.json();
  const clips: any[] = genData.clips || [];
  if (!clips.length) {
    return NextResponse.json({ error: 'No clips returned from Suno' }, { status: 502 });
  }
  const ids = clips.map((c: any) => c.id).join(',');

  // 2. Poll until complete (max 120s)
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
