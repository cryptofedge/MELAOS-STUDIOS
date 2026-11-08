import { NextRequest, NextResponse } from 'next/server';
import { COVER_ART_LIMIT, consume, clientIp, limitedResponse } from '@/lib/rateLimit';

// Cover art via Google's Gemini image models — same GEMINI_API_KEY the Melao
// chat bot already uses, so there is no second vendor or second bill.
//
// POST only. It returns a same-origin data URL, which the studio needs (a
// remote image would taint the MELAOS watermark canvas) and the library uses
// too. There used to be a GET that served image bytes for <img src>. It made
// every paid generation a plain link: any page could embed it, any crawler
// could follow it, and a new `seed` in the query skipped the cache. Gone.
//
// The response carries a text part alongside the image; only the inlineData
// part matters here.

const GEMINI_HOST = 'https://generativelanguage.googleapis.com';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image';

// The image formats Gemini accepts as input.
const REF_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
// Length of the base64 data URL. About 7 MB of image once decoded, inside
// Gemini's 20 MB request limit.
const MAX_REF_IMAGE_CHARS = 10_000_000;
const MAX_PROMPT_CHARS = 1500;

type GeneratedImage = { buffer: Buffer; mimeType: string };
type InlineData = { inlineData: { mimeType: string; data: string } };

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

// The reference image must be a file the artist uploaded, which the studio
// sends as a data: URL. Remote URLs are refused. This server used to fetch
// whatever URL it was handed, which let anyone make it request internal
// addresses on Render's network (server-side request forgery).
function refToInlineData(refImage: unknown): InlineData {
  if (typeof refImage !== 'string') {
    throw httpError('Reference image must be an uploaded image file.', 400);
  }
  const header = /^data:([\w.+-]+\/[\w.+-]+);base64,/.exec(refImage.slice(0, 100));
  const mimeType = header?.[1].toLowerCase();
  if (!header || !mimeType || !REF_IMAGE_TYPES.includes(mimeType)) {
    throw httpError('Reference image must be a PNG, JPEG, WebP or HEIC file.', 400);
  }
  if (refImage.length > MAX_REF_IMAGE_CHARS) {
    throw httpError('Reference image is too large. Use one under about 7 MB.', 413);
  }
  return { inlineData: { mimeType, data: refImage.slice(header[0].length) } };
}

async function generateImage(key: string, prompt: string, ref?: InlineData): Promise<GeneratedImage> {
  const parts: unknown[] = [{ text: prompt }];
  if (ref) parts.push(ref);

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
    throw httpError(`Image generation failed (${res.status}): ${detail.slice(0, 200)}`, 502);
  }

  const data = await res.json();
  const responseParts = data?.candidates?.[0]?.content?.parts ?? [];
  const image = responseParts.find((p: any) => p?.inlineData?.data);

  if (!image) {
    // A blocked prompt comes back with no image and a finishReason instead.
    const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
    throw httpError(reason ? `No image returned (${reason})` : 'No image returned', 502);
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

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const prompt = (typeof body?.prompt === 'string' ? body.prompt : '').trim().slice(0, MAX_PROMPT_CHARS);
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Image generation not configured — GEMINI_API_KEY is missing.' },
      { status: 503 }
    );
  }

  try {
    // Checked before the limit, so a bad upload does not use up an allowance.
    const ref = body?.refImage ? refToInlineData(body.refImage) : undefined;

    const limit = consume(COVER_ART_LIMIT, clientIp(req.headers));
    if (!limit.ok) return limitedResponse(limit, 'cover art');

    const { buffer, mimeType } = await generateImage(key, prompt, ref);
    return NextResponse.json({ imageUrl: `data:${mimeType};base64,${buffer.toString('base64')}` });
  } catch (err) {
    return errorResponse(err);
  }
}
