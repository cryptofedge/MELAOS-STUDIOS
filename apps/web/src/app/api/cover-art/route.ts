import { NextRequest, NextResponse } from 'next/server';

// Proxies Pollinations image generation server-side so the response is
// same-origin — Pollinations 403s real browser CORS requests, which would
// otherwise taint the canvas used to stamp the MELAOS watermark on client.
export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get('prompt');
  const seed = req.nextUrl.searchParams.get('seed') || '0';
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${encodeURIComponent(seed)}`;
  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Image generation failed' }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'image/png' },
  });
}
