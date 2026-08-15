import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { KnowledgeEntry } from '@/lib/melaoKnowledge';
import { INFLUENCES } from '@/lib/artistInfluences';

// ─────────────────────────────────────────────────────────────────────────
// Melao's reasoning layer.
//
// The brain (SOUL.md + MEMORY.md) stays the source of truth for what Melao
// knows and how he sounds. Gemini reads it as grounding and answers in his
// voice, so questions the keyword index never anticipated — "do you do
// merengue?" — get a real answer instead of the not-in-my-brain fallback.
//
// The key is server-side only. This module is never bundled to the browser.
// ─────────────────────────────────────────────────────────────────────────

// "-latest" tracks the current GA model. Pinned Gemini IDs get retired and
// then 404 silently, which is exactly how the FEDGE WhatsApp bot broke.
const MODEL = process.env.GEMINI_MODEL || 'gemini-pro-latest';

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// The studio's actual influence roster, so Melao can answer "do you have
// Romeo Santos?" by checking rather than guessing. Names only — the sonic
// tags are for the music model, not for chat.
function rosterSummary(): string {
  const group = (region: string, role: string) =>
    INFLUENCES.filter(i => i.region === region && i.role === role)
      .map(i => i.name)
      .sort((a, b) => a.localeCompare(b))
      .join(', ');

  return [
    `Latin artists (${INFLUENCES.filter(i => i.region === 'Latin' && i.role === 'artist').length}): ${group('Latin', 'artist')}`,
    `Latin producers (${INFLUENCES.filter(i => i.region === 'Latin' && i.role === 'producer').length}): ${group('Latin', 'producer')}`,
    `American artists (${INFLUENCES.filter(i => i.region === 'American' && i.role === 'artist').length}): ${group('American', 'artist')}`,
    `American producers (${INFLUENCES.filter(i => i.region === 'American' && i.role === 'producer').length}): ${group('American', 'producer')}`,
  ].join('\n\n');
}

function buildSystemPrompt(soul: string, memory: string, trained: KnowledgeEntry[], lang: 'en' | 'es') {
  const teachings = trained.length
    ? trained
        .map(e => `## ${e.topic}\nEN: ${e.answer}\nES: ${e.answerEs}`)
        .join('\n\n')
    : '(none yet)';

  return `${soul}

---
# YOUR KNOWLEDGE BASE (MEMORY.md)
${memory}

---
# LIVE TEACHINGS FROM MELAO
${teachings}

---
# INFLUENCE ROSTER IN THE STUDIO (${INFLUENCES.length} total)
Artists and producers a track can be steered toward. Someone can name one
straight in their description — "a bachata like Romeo Santos" — or pick from
the Influence menu. It shapes the arrangement and how the lyrics are written.
This is a style reference, not an impersonation: it borrows the sound and the
craft, never a voice and never anyone's actual lyrics. Say so if asked.

${rosterSummary()}

If someone asks about a name that is NOT on this list, say it is not in the
studio yet and suggest the closest one that is.

---
# HOW TO ANSWER
- Reply in ${lang === 'es' ? 'Spanish, with Dominican flavor' : 'English'}. Match the language the artist used.
- Stay in character as Melao: a working producer. Direct, warm, generous.
- When the knowledge base covers the topic, use it — that is Melao's own voice
  and it outranks anything else you know.
- When it does not, you may still help from general music-production knowledge,
  because a real producer would. Keep it practical and specific to the genre
  asked about. Do not claim it came from Melao's brain, and do not invent facts
  about MELAOS STUDIOS itself — its services, pricing, roster, or contracts.
  Those come only from the knowledge base; if it is silent, say you'll get Melao
  to confirm.
- End by moving the artist toward making something.
- Keep it to 2-5 sentences unless the question genuinely needs more. This is a
  chat bubble, not an article. No markdown headers, no bullet lists.`;
}

export async function askMelao(
  message: string,
  opts: { soul: string; memory: string; trained: KnowledgeEntry[]; lang: 'en' | 'es' }
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: buildSystemPrompt(opts.soul, opts.memory, opts.trained, opts.lang),
    // Current Pro models spend tokens on internal reasoning before emitting
    // text, so a tight cap truncates the reply mid-sentence. Give it headroom
    // and keep the answer short via the prompt instead.
    generationConfig: { maxOutputTokens: 2048, temperature: 0.9 },
  });

  // One retry: transient fetch failures against the API are common enough
  // that a single miss should not drop the artist to the canned fallback.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(message);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      console.error(`[melao] Gemini attempt ${attempt}/2 failed:`, (err as Error).message);
      if (attempt === 1) await new Promise(r => setTimeout(r, 1200));
    }
  }
  return null;
}
