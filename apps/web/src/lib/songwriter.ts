import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────────────────
// Writes lyrics from the user's prompt.
//
// ACE-Step sings whatever is in its `lyrics` field — the style tags only
// steer the backing track. So when nobody supplies lyrics, something has to
// write them, or every song ends up singing the same words regardless of
// what was asked for.
//
// Server-side only. The key never reaches the browser.
// ─────────────────────────────────────────────────────────────────────────

const MODEL = process.env.GEMINI_MODEL || 'gemini-pro-latest';

export function songwriterAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// ACE-Step expects plain section tags. Strip markdown, stray commentary and
// anything that is not a section header or a lyric line.
function tidy(raw: string): string {
  return raw
    .replace(/```[a-z]*/gi, '')
    .split('\n')
    .map(l => l.replace(/^\s*[*#>-]+\s?/, '').trimEnd())
    // Drop preambles like "Here are your lyrics:" that survive the prompt.
    .filter(l => !/^\s*(here (are|is)|sure[,!]|certainly)/i.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function writeLyrics(opts: {
  prompt: string;
  genre: string;
  mood: string;
  language: string;
  vocals: string;
}): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const subject = opts.prompt.trim();
  if (!subject) return null;

  const voice =
    opts.vocals === 'female' ? 'a female vocalist' :
    opts.vocals === 'male'   ? 'a male vocalist'   :
    'a vocalist';

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction:
      `You are a songwriter at MELAOS STUDIOS. You write lyrics that get sung, ` +
      `not poems that get read — singable lines, natural stresses, a hook that repeats.\n\n` +
      `Output ONLY the lyrics. No title, no commentary, no markdown, no chords, ` +
      `no explanation of your choices.\n\n` +
      `Use plain section tags on their own lines, exactly like:\n` +
      `[Verse 1]\n[Chorus]\n[Verse 2]\n[Bridge]\n\n` +
      `Structure: Verse 1, Chorus, Verse 2, Chorus, Bridge. Four to six lines ` +
      `per section. The chorus must repeat identically both times.`,
    // Pro models spend tokens reasoning before emitting text; a tight cap
    // truncates the song mid-verse.
    generationConfig: { maxOutputTokens: 3000, temperature: 1.0 },
  });

  const ask =
    `Write song lyrics about: ${subject}\n\n` +
    `Genre: ${opts.genre}\n` +
    `Mood: ${opts.mood}\n` +
    `Sung by: ${voice}\n` +
    `Language: ${opts.language} — write the lyrics entirely in ${opts.language}.\n\n` +
    `The lyrics must be about the subject above. That is the whole point of the song.`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(ask);
      const text = tidy(result.response.text());
      // A usable lyric sheet has at least one section tag and real content.
      if (text.length > 40 && /\[/.test(text)) return text.slice(0, 2000);
    } catch (err) {
      console.error(`[songwriter] attempt ${attempt}/2 failed:`, (err as Error).message);
      if (attempt === 1) await new Promise(r => setTimeout(r, 1200));
    }
  }
  return null;
}
