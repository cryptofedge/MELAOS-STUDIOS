// ─────────────────────────────────────────────────────────────────────────
// MiniMax Music 2.5 on fal.ai — the studio's second song engine.
//
// Like ACE-Step it sings the lyrics it is given over a style description,
// so the songwriter and the genre tags feed both engines the same way.
// Differences that matter:
//   - Flat price per song ($0.15 on fal.ai as of November 2026), whatever
//     its length. There is no duration input; the lyrics set the length.
//   - Instrumentals are a flag (is_instrumental), not a lyrics tag.
//
// fal runs it on a queue: submit, poll the status URL, then fetch the result
// from the response URL. Both URLs are used exactly as fal returns them;
// fal's docs warn that URLs built by hand from the model path can 405.
//
// Requires FAL_KEY. Server-side only; the key never reaches the browser.
// ─────────────────────────────────────────────────────────────────────────

const QUEUE_URL = 'https://queue.fal.run/fal-ai/minimax-music/v2.5';

// Input limits from the model's schema.
const MAX_PROMPT = 2000;
const MAX_LYRICS = 3500;

export function minimaxConfigured(): boolean {
  return Boolean(process.env.FAL_KEY);
}

export type MinimaxInput = { prompt: string; lyrics: string; instrumental: boolean };
export type MinimaxResult =
  | { audioUrl: string; error?: undefined; status?: undefined }
  | { error: string; status: number; audioUrl?: undefined };

type Options = { maxWaitMs?: number; pollMs?: number; fetchImpl?: typeof fetch };

export async function runMinimax(key: string, input: MinimaxInput, opts: Options = {}): Promise<MinimaxResult> {
  const f = opts.fetchImpl ?? fetch;
  const maxWaitMs = opts.maxWaitMs ?? 160_000;
  const pollMs = opts.pollMs ?? 2000;
  const auth = { Authorization: `Key ${key}` };

  const body = {
    prompt: input.prompt.slice(0, MAX_PROMPT),
    lyrics: input.instrumental ? '' : input.lyrics.slice(0, MAX_LYRICS),
    is_instrumental: input.instrumental,
    audio_setting: { format: 'mp3', sample_rate: 44100, bitrate: 256000 },
  };

  let submit: Response;
  try {
    submit = await f(QUEUE_URL, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { error: `MiniMax request error: ${(e as Error).message}`, status: 502 };
  }
  if (!submit.ok) {
    const detail = await submit.text().catch(() => '');
    return { error: `MiniMax request failed (${submit.status}): ${detail.slice(0, 300)}`, status: 502 };
  }

  const job = await submit.json().catch(() => null);
  const statusUrl: unknown = job?.status_url;
  const responseUrl: unknown = job?.response_url;
  const cancelUrl: unknown = job?.cancel_url;
  if (typeof statusUrl !== 'string' || typeof responseUrl !== 'string') {
    return { error: 'MiniMax queue did not return a status URL', status: 502 };
  }

  const started = Date.now();
  for (;;) {
    if (Date.now() - started > maxWaitMs) {
      // Best effort: a request still waiting in the queue can be cancelled
      // so it does not run, and bill, after we have given up on it.
      if (typeof cancelUrl === 'string') f(cancelUrl, { method: 'PUT', headers: auth }).catch(() => {});
      return { error: 'Music generation timed out — MiniMax may be under load. Try again in a moment.', status: 504 };
    }
    await new Promise(r => setTimeout(r, pollMs));

    let status: Response;
    try {
      status = await f(statusUrl, { headers: auth });
    } catch (e) {
      return { error: `MiniMax status error: ${(e as Error).message}`, status: 502 };
    }
    if (!status.ok) return { error: `MiniMax status check failed (${status.status})`, status: 502 };

    const state = (await status.json().catch(() => null))?.status;
    if (state === 'COMPLETED') break;
    if (state !== 'IN_QUEUE' && state !== 'IN_PROGRESS') {
      return { error: `MiniMax returned an unexpected status: ${String(state)}`, status: 502 };
    }
  }

  // A run that failed still ends as COMPLETED; the failure shows up here, as
  // an error response from the result URL.
  let result: Response;
  try {
    result = await f(responseUrl, { headers: auth });
  } catch (e) {
    return { error: `MiniMax result error: ${(e as Error).message}`, status: 502 };
  }
  if (!result.ok) {
    const detail = await result.text().catch(() => '');
    return { error: `Generation failed (${result.status}): ${detail.slice(0, 300)}`, status: 502 };
  }

  const audioUrl: unknown = (await result.json().catch(() => null))?.audio?.url;
  if (typeof audioUrl !== 'string' || !audioUrl) return { error: 'MiniMax returned no audio', status: 502 };
  return { audioUrl };
}
