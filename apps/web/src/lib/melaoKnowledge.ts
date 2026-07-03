// Types + fallback lines for the Melao bot. His actual knowledge lives in
// the brain: apps/web/brain/MEMORY.md (FEDGE 2.O brain architecture) —
// that's the file Melao edits to train the bot. Parsed by /api/melao.

export interface KnowledgeEntry {
  id: string;
  topic: string;
  keywords: string[];
  answer: string;   // English
  answerEs: string; // Spanish
}

export const DEFAULT_ANSWERS = {
  en: "That's a good one — I don't have that in my brain yet, but Melao trains me all the time. Ask me about making beats, 808s, mixing, recording vocals, dembow, bachata, song structure, or how to use the studio.",
  es: "Esa está buena — todavía no la tengo en mi cerebro, pero Melao me entrena todos los días. Pregúntame de hacer beats, 808s, mezcla, grabar voces, dembow, bachata, estructura de canciones, o cómo usar el estudio.",
};

export const GREETINGS = {
  en: "Wassup! Melao here — running on my own brain, trained by the real Melao. No internet, just knowledge. Ask me about beats, production, or the studio.",
  es: "¡Qué lo que! Aquí Melao — corriendo con mi propio cerebro, entrenado por el Melao de verdad. Sin internet, puro conocimiento. Pregúntame de beats, producción, o del estudio.",
};
