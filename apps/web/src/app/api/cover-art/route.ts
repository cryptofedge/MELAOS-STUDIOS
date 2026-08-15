import { NextRequest, NextResponse } from 'next/server';

// Cover art via Google's Gemini image models — same GEMINI_API_KEY the Melao
// chat bot already uses, so there is no second vendor or second bill.
//
// Two entry points, because the two callers need different things:
//   POST  studio page — returns a same-origin data URL. It must be same-origin
//         or the MELAOS watermark canvas taints and readback is blocked.
//   GET   library page — sets the URL directly as img.src, so this returns raw
//         image bytes rather than JSON.
//
// The response carries a text part alongside the image; only the inlineData
// part matters here.

const GEMINI_HOST = 'https://generativelanguage.googleapis.com';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image';

type GeneratedImage = { buffer: Buffer; mimeType: string };

// Accepts a data: URL or an http(s) URL and returns the inlineData part
// Gemini expects for image-guided generation.
async function refToInlineData(refImage: string) {
  if (refImage.startsWith('data:')) {
    const comma = refImage.indexOf(',');
    const mimeType = refImage.slice(5, refImage.indexOf(';'));
    return { inlineData: { mimeType, data: refImage.slice(comma + 1) } };
  }
  const res = await fetch(refImage);
  if (!res.ok) throw new Error(`Could not fetch reference image (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    inlineData: {
      mimeType: res.headers.get('content-type') || 'image/jpeg',
      data: buf.toString('base64'),
    },
  };
}

async function generateImage(prompt: string, refImage?: string): Promise<GeneratedImage> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error('Image generation not configured — GEMINI_API_KEY is missing.'), { status: 503 });

  const parts: unknown[] = [{ text: prompt }];
  if (refImage) parts.push(await refToInlineData(refImage));

  const res = await fetch(`${GEMINI_HOST}/v1beta/models/${IMAGE_MODEL}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
    // Image generation runs 7-45s depending on model; well inside Render's
    // request window, but do not let a hung upstream hold the socket forever.
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw Object.assign(
      new Error(`Image generation failed (${res.status}): ${detail.slice(0, 200)}`),
      { status: 502 }
    );
  }

  const data = await res.json();
  const responseParts = data?.candidates?.[0]?.content?.parts ?? [];
  const image = responseParts.find((p: any) => p?.inlineData?.data);

  if (!image) {
    // A blocked prompt comes back with no image and a finishReason instead.
    const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
    throw Object.assign(
      new Error(reason ? `No image returned (${reason})` : 'No image returned'),
      { status: 502 }
    );
  }

  return {
    buffer: Buffer.from(image.inlineData.data, 'base64'),
    mimeType: image.inlineData.mimeType || 'image/jpeg',
  };
}

function errorResponse(err: any) {
  const status = err?.status ?? 502;
  return NextResponse.json({ error: err?.message || 'Image generation failed' }, { status });
}

// POST — studio page. Returns a same-origin data URL so the watermark canvas
// can read the pixels back.
export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const prompt = String(body?.prompt || '').trim();
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

  try {
    const { buffer, mimeType } = await generateImage(prompt, body?.refImage || undefined);
    return NextResponse.json({ imageUrl: `data:${mimeType};base64,${buffer.toString('base64')}` });
  } catch (err) {
    return errorResponse(err);
  }
}

// GET — library page sets this URL as img.src, so serve the bytes directly.
// A missing GET handler here is why that cover-art button did nothing.
export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get('prompt')?.trim();
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

  try {
    const { buffer, mimeType } = await generateImage(prompt);
    // Buffer is not a valid BodyInit under the fetch types — hand over the
    // underlying bytes instead.
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        // Keyed by prompt + seed in the query string, so a repeat of the same
        // URL should not pay for a second generation.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
