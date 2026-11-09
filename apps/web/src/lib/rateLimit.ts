// ─────────────────────────────────────────────────────────────────────────
// Spending limits for the routes that call paid APIs (Replicate, Gemini).
//
// There is no real login yet, so every visitor is anonymous and nothing
// stops a script from calling /api/generate in a loop on our keys. Two caps
// guard each route:
//
//   per IP  — keeps one visitor from using up the day. Best effort: the IP
//             comes from X-Forwarded-For, which a client can fake.
//   global  — the hard ceiling on spend, whatever IP the requests claim.
//
// Counters live in this process's memory. Render runs one instance, so every
// request sees the same Map. They reset on restart or deploy, and would need
// Redis if the app ever runs on more than one instance.
//
// Every number can be changed with an env var on Render, no code change.
// Setting one to 0 turns that route's paid path off.
// ─────────────────────────────────────────────────────────────────────────

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Window = { max: number; windowMs: number };
export type Limit = { name: string; perIp: Window; global: Window };

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

// Song generation: one Replicate run, plus a Gemini call to write lyrics.
export const GENERATE_LIMIT: Limit = {
  name: 'generate',
  perIp: { max: envInt('GENERATE_LIMIT_PER_IP_HOUR', 5), windowMs: HOUR },
  global: { max: envInt('GENERATE_LIMIT_PER_DAY', 100), windowMs: DAY },
};

// Songs on the MiniMax engine: $0.15 each on fal.ai, several times an
// ACE-Step run, so it gets its own, tighter budget. The defaults cap MiniMax
// at about $4.50 a day.
export const MINIMAX_LIMIT: Limit = {
  name: 'minimax',
  perIp: { max: envInt('MINIMAX_LIMIT_PER_IP_HOUR', 3), windowMs: HOUR },
  global: { max: envInt('MINIMAX_LIMIT_PER_DAY', 30), windowMs: DAY },
};

// Cover art: the image model is the most expensive call per request.
export const COVER_ART_LIMIT: Limit = {
  name: 'cover-art',
  perIp: { max: envInt('COVER_ART_LIMIT_PER_IP_HOUR', 5), windowMs: HOUR },
  global: { max: envInt('COVER_ART_LIMIT_PER_DAY', 50), windowMs: DAY },
};

// Melao chat: cheap per message, but a chat sends many. Over the limit the
// bot answers from its keyword brain instead, so nobody sees an error.
export const CHAT_LIMIT: Limit = {
  name: 'chat',
  perIp: { max: envInt('CHAT_LIMIT_PER_IP_HOUR', 30), windowMs: HOUR },
  global: { max: envInt('CHAT_LIMIT_PER_DAY', 1000), windowMs: DAY },
};

// Content reports: free to us, but each one can post to the report webhook,
// so a script must not be able to flood that channel.
export const REPORT_LIMIT: Limit = {
  name: 'report',
  perIp: { max: envInt('REPORT_LIMIT_PER_IP_HOUR', 10), windowMs: HOUR },
  global: { max: envInt('REPORT_LIMIT_PER_DAY', 300), windowMs: DAY },
};

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function bucketFor(key: string, windowMs: number, now: number): Bucket {
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  return b;
}

// Drop expired buckets once a minute so one-off IPs do not pile up forever.
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  buckets.forEach((b, key) => {
    if (b.resetAt <= now) buckets.delete(key);
  });
}

export type LimitResult =
  | { ok: true }
  | { ok: false; scope: 'ip' | 'global'; retryAfterSec: number };

/** Counts one request against both caps, or refuses it without counting. */
export function consume(limit: Limit, ip: string, now = Date.now()): LimitResult {
  sweep(now);
  const global = bucketFor(`${limit.name}:global`, limit.global.windowMs, now);
  const mine = bucketFor(`${limit.name}:ip:${ip}`, limit.perIp.windowMs, now);

  if (global.count >= limit.global.max) {
    return { ok: false, scope: 'global', retryAfterSec: Math.max(1, Math.ceil((global.resetAt - now) / 1000)) };
  }
  if (mine.count >= limit.perIp.max) {
    return { ok: false, scope: 'ip', retryAfterSec: Math.max(1, Math.ceil((mine.resetAt - now) / 1000)) };
  }
  global.count++;
  mine.count++;
  return { ok: true };
}

/** The visitor's IP as the proxy reports it. See the note at the top. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || 'unknown';
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

/** The 429 the studio shows as-is, so the wording is for the artist. */
export function limitedResponse(result: Extract<LimitResult, { ok: false }>, what: string): Response {
  const minutes = Math.ceil(result.retryAfterSec / 60);
  const wait = minutes >= 90 ? `${Math.round(minutes / 60)} hours` : `${minutes} min`;
  const error = result.scope === 'global'
    ? `The studio has reached today's ${what} limit. Try again in about ${wait}.`
    : `You've reached the ${what} limit for now. Try again in about ${wait}.`;
  return new Response(JSON.stringify({ error }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(result.retryAfterSec) },
  });
}

// Test hook only: clears every counter.
export function _resetLimits() {
  buckets.clear();
  lastSweep = 0;
}
