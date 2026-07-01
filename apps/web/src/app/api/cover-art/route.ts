import { NextRequest, NextResponse } from 'next/server';

// Generates cover art via the Higgsfield API (platform.higgsfield.ai).
// Higgsfield uses an async queue: submit a request, poll its status until
// completed, then fetch the resulting image and return it as a same-origin
// data URL so the client can stamp the MELAOS watermark on canvas without
// tainting it (a remote-origin <img> would block canvas readback).
const HIGGSFIELD_BASE = 'https://platform.higgsfield.ai';

async function pollUntilDone(statusUrl: string, authHeader: string, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(statusUrl, { headers: { Authorization: authHeader } });
    const data = await res.json();
    if (data.status === 'completed') return data;
    if (data.status === 'failed' || data.status === 'nsfw') {
      throw new Error(data.status === 'nsfw' ? 'Image failed moderation checks' : 'Image generation failed');
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Image generation timed out');
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.HIGGSFIELD_API_KEY;
  const apiSecret = process.env.HIGGSFIELD_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Higgsfield API credentials not configured' }, { status: 500 });
  }

  const { prompt, refImage } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const authHeader = `Key ${apiKey}:${apiSecret}`;
  // Soul Reference is used when a reference image is supplied (style/content
  // guidance from the user's upload); otherwise plain Soul Standard text-to-image.
  const modelId = refImage ? 'higgsfield-ai/soul/reference' : 'higgsfield-ai/soul/standard';
  const body: Record<string, unknown> = refImage
    ? { prompt, reference_image_urls: [refImage], quality: '720p' }
    : { prompt, aspect_ratio: '1:1', resolution: '720p' };

  try {
    const submitRes = await fetch(`${HIGGSFIELD_BASE}/${modelId}`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const submitData = await submitRes.json();
    if (!submitRes.ok) {
      return NextResponse.json({ error: submitData.detail || 'Higgsfield request failed' }, { status: submitRes.status });
    }

    const result = submitData.status === 'completed' ? submitData : await pollUntilDone(submitData.status_url, authHeader);
    const imageUrl = result.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned' }, { status: 502 });
    }

    // Fetch the generated image and re-serve it as a data URL (same-origin, canvas-safe).
    const imgRes = await fetch(imageUrl);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get('Content-Type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${buf.toString('base64')}`;

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image generation failed' }, { status: 502 });
  }
}
