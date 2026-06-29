import { NextRequest, NextResponse } from 'next/server';

// Shared in-memory store for refreshed token
// Import same reference as generate route uses
let stored: string | null = null;

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { token, secret } = body;
  if (!token || typeof token !== 'string' || !token.startsWith('ey')) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  // Simple shared secret to prevent random updates — matches SUNO_REFRESH_SECRET env var
  const expectedSecret = process.env.SUNO_REFRESH_SECRET || 'melaos2026';
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Can't directly update the generate route's module-level var across Next.js modules,
  // so we update the env var in-process (works for same dyno lifetime)
  process.env.SUNO_JWT = token;
  return NextResponse.json({ ok: true, preview: token.substring(0, 20) + '...' });
}

export async function GET() {
  const token = process.env.SUNO_JWT;
  if (!token) return NextResponse.json({ configured: false });
  // Decode exp from JWT payload
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const expiresAt = new Date(payload.exp * 1000).toISOString();
    const expired = payload.exp * 1000 < Date.now();
    return NextResponse.json({ configured: true, expiresAt, expired });
  } catch {
    return NextResponse.json({ configured: true, expiresAt: 'unknown', expired: false });
  }
}
