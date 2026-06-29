import { NextRequest, NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': 'https://suno.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS });
  }

  const { token, cookie, secret } = body;
  const expectedSecret = process.env.SUNO_REFRESH_SECRET || 'melaos2026';

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  if (token && typeof token === 'string' && token.startsWith('ey')) {
    process.env.SUNO_JWT = token;
  }

  if (cookie && typeof cookie === 'string' && cookie.length > 10) {
    process.env.SUNO_COOKIE = cookie;
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: CORS });
}

export async function GET() {
  const token = process.env.SUNO_JWT;
  if (!token) return NextResponse.json({ configured: false }, { headers: CORS });
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const expiresAt = new Date(payload.exp * 1000).toISOString();
    const expired = payload.exp * 1000 < Date.now();
    return NextResponse.json({ configured: true, expiresAt, expired }, { headers: CORS });
  } catch {
    return NextResponse.json({ configured: true }, { headers: CORS });
  }
}
