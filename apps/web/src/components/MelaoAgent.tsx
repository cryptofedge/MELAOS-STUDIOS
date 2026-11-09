'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, GripHorizontal, Mic, Volume2, VolumeX } from 'lucide-react';
import { useAudioStore } from '@/lib/store';
import ReportButton from '@/components/ReportButton';
import Emblem from '@/components/Emblem';

interface Message {
  role: 'user' | 'melao';
  text: string;
}

type Lang = 'en' | 'es';

const MELAO_RESPONSES: Record<Lang, Record<string, string>> = {
  en: {
    default: "Yo, I'm Melao — the mind behind MELAOS STUDIOS. Ask me about beats, production, the sound we're building, anything.",
    greet: "Wassup! Melao here. Ready to talk music, creation, or whatever's on your mind.",
    beat: "Every beat I make starts with a feeling. You gotta feel it before you can build it. What kind of energy are you going for?",
    studio: "The studio is where magic happens. MELAOS STUDIOS — powered by Eclat Universe — is built for artists who take their sound seriously. Every tool you need, right here.",
    collab: "Collaboration is everything in music. The best tracks come from two energies meeting in the right space. You trying to create something?",
    genre: "I don't box myself in. Afrobeats, Drill, R&B, Trap, Dembow — if it hits, it hits. What's your lane?",
    help: "I got you. Whether it's production tips, navigating the studio, or just vibing on ideas — I'm here. What do you need?",
    sign: "MELAOS STUDIOS is the label and the platform. If your sound is real, we want to hear it. Drop something in the studio and let's see what you've got.",
  },
  es: {
    default: "Dime a ver, soy Melao — la mente detrás de MELAOS STUDIOS. Pregúntame de beats, producción, el sonido que estamos construyendo, lo que sea.",
    greet: "¡Qué lo que! Aquí Melao. Listo pa' hablar de música, de crear, o de lo que tengas en mente.",
    beat: "Cada beat que hago empieza con un sentimiento. Tienes que sentirlo antes de construirlo. ¿Qué energía andas buscando?",
    studio: "El estudio es donde pasa la magia. MELAOS STUDIOS — con el poder de Eclat Universe — está hecho pa' artistas que se toman su sonido en serio. Todas las herramientas, aquí mismo.",
    collab: "La colaboración lo es todo en la música. Los mejores temas salen cuando dos energías se encuentran en el espacio correcto. ¿Quieres crear algo?",
    genre: "Yo no me encasillo. Dembow, Reggaetón, Bachata, Trap, R&B — si pega, pega. ¿Cuál es tu carril?",
    help: "Te tengo. Ya sean tips de producción, moverte por el estudio, o soltar ideas — aquí estoy. ¿Qué necesitas?",
    sign: "MELAOS STUDIOS es el sello y la plataforma. Si tu sonido es real, queremos escucharlo. Suelta algo en el estudio y vamos a ver qué tienes.",
  },
};

// Spanish input detection — accents, ñ, or common Spanish words flip the reply
// to Spanish even without touching the EN/ES toggle. Melao habla los dos.
function detectLang(input: string, current: Lang): Lang {
  const low = ` ${input.toLowerCase()} `;
  if (/[áéíóúñ¿¡]/.test(low)) return 'es';
  if (/ (hola|que lo que|dime|como|quiero|puedes|ayuda|musica|cancion|estudio|genero|ritmo|hacer|crear|gracias|por favor|el|la|los|una|un|de|y|con|para|mi) /.test(low)) return 'es';
  if (/ (hi|hello|hey|the|what|how|can|help|make|create|beat|song|thanks) /.test(low)) return 'en';
  return current;
}

function getMelaoResponse(input: string, lang: Lang): string {
  const low = input.toLowerCase();
  const R = MELAO_RESPONSES[lang];
  if (low.match(/hi|hello|hey|wassup|what's good|hola|que lo que|buenas|saludos/)) return R.greet;
  if (low.match(/beat|track|produce|production|sound|ritmo|pista|producir|producción|sonido/)) return R.beat;
  if (low.match(/studio|daw|record|create|generate|estudio|grabar|crear|generar/)) return R.studio;
  if (low.match(/collab|work together|feature|ft\.|colabor|junte|featuring/)) return R.collab;
  if (low.match(/genre|style|type of music|rap|drill|afro|r&b|trap|soul|género|genero|estilo|dembow|reggaeton|bachata|salsa|merengue/)) return R.genre;
  if (low.match(/help|how|what can|guide|ayuda|cómo|como puedo|guía|guia/)) return R.help;
  if (low.match(/sign|label|deal|contract|artist|firmar|sello|contrato|disquera|artista/)) return R.sign;
  return R.default;
}

const PANEL_W = 320;
const PANEL_H = 420;

export default function MelaoAgent() {
  const { currentSong } = useAudioStore();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'melao', text: "Yo, I'm Melao — MELAOS STUDIOS, powered by Eclat Universe. What's on your mind? / ¿Qué lo que? También hablo español. 🇩🇴" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Voice mode — talk to Melao and he talks back. Speech-to-text via the
  // browser's Web Speech API; replies spoken with SpeechSynthesis in the
  // conversation's language. No external services.
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);

  // On phones the chat becomes a full-width bottom sheet instead of a
  // small draggable panel (dragging a 320px box around a 375px screen
  // was unusable).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const recognitionRef = useRef<any>(null);
  const voiceRepliesRef = useRef(false);
  voiceRepliesRef.current = voiceReplies;

  const speak = useCallback((text: string, speakLang: Lang) => {
    if (!voiceRepliesRef.current || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speakLang === 'es' ? 'es-US' : 'en-US';
    u.rate = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(speakLang === 'es' ? 'es' : 'en'));
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang === 'es' ? 'es-US' : 'en-US';
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) sendText(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, lang]);

  // Floating position — starts anchored bottom-right, then user can drag
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // The trigger bubble itself is also draggable, independent of the panel,
  // so it can be moved out of the way (e.g. off the audio player) even
  // while closed.
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const btnDragging = useRef(false);
  const btnDidDrag = useRef(false);
  const btnDragStart = useRef({ x: 0, y: 0 });
  const btnDragOffset = useRef({ x: 0, y: 0 });
  const BTN_SIZE = 56;

  // Set initial position once window is available
  useEffect(() => {
    if (typeof window !== 'undefined' && pos === null) {
      const anchorX = btnPos ? btnPos.x - PANEL_W + BTN_SIZE : window.innerWidth - PANEL_W - 16;
      const anchorY = btnPos ? btnPos.y - PANEL_H - 12 : window.innerHeight - PANEL_H - 96;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - PANEL_W, anchorX)),
        y: Math.max(0, Math.min(window.innerHeight - PANEL_H, anchorY)),
      });
    }
  }, [open]);

  const onBtnPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    btnDragging.current = true;
    btnDidDrag.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    btnDragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    btnDragStart.current = { x: e.clientX, y: e.clientY };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* no-op: invalid/inactive pointer id */ }
  }, []);

  const onBtnPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!btnDragging.current) return;
    const dx = e.clientX - btnDragStart.current.x;
    const dy = e.clientY - btnDragStart.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) btnDidDrag.current = true;
    if (!btnDidDrag.current) return;
    const newX = Math.max(0, Math.min(window.innerWidth - BTN_SIZE, e.clientX - btnDragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - BTN_SIZE, e.clientY - btnDragOffset.current.y));
    setBtnPos({ x: newX, y: newY });
  }, []);

  const onBtnPointerUp = useCallback(() => {
    btnDragging.current = false;
    if (!btnDidDrag.current) setOpen(o => !o);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!panelRef.current) return;
    dragging.current = true;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const newX = Math.max(0, Math.min(window.innerWidth - PANEL_W, e.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - PANEL_H, e.clientY - dragOffset.current.y));
    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  async function sendText(raw: string) {
    const text = raw.trim();
    if (!text) return;
    // Auto-switch language when the user's message is clearly ES or EN
    const replyLang = detectLang(text, lang);
    if (replyLang !== lang) setLang(replyLang);
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    // Ask Melao's brain (server-side knowledge base trained by the real
    // Melao — see apps/web/brain/). Falls back to the local scripted
    // responses if the backend is unreachable.
    let reply: string;
    try {
      const res = await fetch('/api/melao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lang: replyLang }),
      });
      const data = await res.json();
      if (!res.ok || !data.answer) throw new Error('brain unavailable');
      reply = data.answer;
    } catch {
      reply = getMelaoResponse(text, replyLang);
    }
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'melao', text: reply }]);
      speak(reply, replyLang);
    }, 500 + Math.random() * 500);
  }

  function send() { sendText(input); }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  // In the studio the bottom-right corner holds the Generate button and the
  // bottom edge holds the transport bar, so the trigger starts bottom-left,
  // above the transport.
  const pathname = usePathname();
  const inStudio = pathname?.startsWith('/studio');
  const corner = inStudio
    ? { left: 'max(1rem, var(--safe-left))', bottom: 'calc(var(--player-h) + 76px)' }
    : { right: 'max(1rem, var(--safe-right))', bottom: 'calc(var(--player-h) + 16px)' };

  // Avatar: the official M mark, cropped from the logo.
  const avatar = (size: string) => (
    <div className={`${size} shrink-0 flex items-center justify-center bg-ink-0 border border-line`}>
      <Emblem className="w-[78%]" />
    </div>
  );

  return (
    <>
      {/* Floating trigger button — draggable; click (no drag) toggles the panel */}
      <button
        onPointerDown={onBtnPointerDown}
        onPointerMove={onBtnPointerMove}
        onPointerUp={onBtnPointerUp}
        onPointerLeave={() => { btnDragging.current = false; }}
        style={{
          minWidth: '56px',
          minHeight: '56px',
          touchAction: 'none',
          cursor: 'grab',
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
          ...(btnPos
            ? { left: btnPos.x, top: btnPos.y, right: 'auto', bottom: 'auto' }
            : corner),
        }}
        className="fixed z-50 w-14 h-14 flex items-center justify-center bg-ink-1 border border-line-strong transition-colors hoverable:hover:border-melaos-orange active:cursor-grabbing"
        aria-label="Chat with Melao"
      >
        <Emblem className="w-10" />
        <span className="absolute top-1.5 right-1.5 live-dot" />
      </button>

      {/* Draggable chat panel */}
      {open && pos && (
        <div
          ref={panelRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="fixed z-50 flex flex-col overflow-hidden bg-ink-1 border border-line-strong rounded-[4px] shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
          style={isMobile ? {
            left: 'max(8px, var(--safe-left))',
            right: 'max(8px, var(--safe-right))',
            bottom: 'calc(var(--player-h) + 84px)',
            height: 'min(62dvh, 480px)',
            touchAction: 'none',
          } : {
            width: PANEL_W,
            height: PANEL_H,
            left: pos.x,
            top: pos.y,
            touchAction: 'none',
          }}
        >
          <div className="brand-rule shrink-0" />
          {/* Drag handle header */}
          <div
            onPointerDown={onPointerDown}
            className="flex items-center gap-3 px-3 py-2.5 border-b border-line shrink-0 cursor-grab active:cursor-grabbing select-none bg-ink-0"
          >
            {avatar('w-9 h-9')}
            <div className="flex-1 min-w-0">
              <p className="display text-white text-sm leading-none">Melao</p>
              <p className="label mt-1.5 flex items-center gap-1.5 !text-[9.5px]">
                <span className="live-dot !w-[5px] !h-[5px]" />
                Eclat Universe · FEDGE 2.O
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setLang(l => l === 'en' ? 'es' : 'en')}
                style={{ touchAction: 'manipulation' }}
                className="h-7 px-2 border border-line rounded-xs font-mono text-[10px] tracking-[0.14em] text-melaos-orange hoverable:hover:border-melaos-orange transition-colors"
                title={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}
                aria-label="Toggle language"
              >
                {lang === 'en' ? 'EN' : 'ES'}
              </button>
              <GripHorizontal className="w-4 h-4 text-fog-faint mx-1 hidden sm:block" strokeWidth={1.75} />
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setOpen(false)}
                style={{ touchAction: 'manipulation' }}
                className="touch-target !min-w-[36px] !min-h-[36px] text-fog hoverable:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'melao' && avatar('w-6 h-6')}
                <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed rounded-[3px] ${
                  m.role === 'user'
                    ? 'bg-melaos-orange text-[#0A0A0E]'
                    : 'bg-ink-2 border border-line text-[#ECECF1]'
                }`}>
                  {m.text}
                </div>
                {/* Report a reply (Play's AI-content rule); not the canned greeting */}
                {m.role === 'melao' && i > 0 && (
                  <ReportButton iconOnly kind="chat"
                    className="self-end p-1 text-fog-faint hoverable:hover:text-melaos-hot transition-colors"
                    getContext={() => ({
                      reply: m.text,
                      message: messages[i - 1]?.role === 'user' ? messages[i - 1].text : '',
                    })} />
                )}
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2 justify-start">
                {avatar('w-6 h-6')}
                <div className="bg-ink-2 border border-line px-3 py-2.5 rounded-[3px] flex gap-1.5 items-center">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-melaos-orange animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-line flex items-center gap-1.5 shrink-0 bg-ink-0">
            <button
              onClick={() => setVoiceReplies(v => !v)}
              style={{ touchAction: 'manipulation' }}
              className={`w-10 h-10 flex items-center justify-center border rounded-xs transition-colors shrink-0 ${
                voiceReplies ? 'border-melaos-cyan text-melaos-cyan' : 'border-line text-fog hoverable:hover:text-white'
              }`}
              title={voiceReplies ? 'Melao voice: ON' : 'Melao voice: OFF'}
              aria-label="Toggle spoken replies"
              aria-pressed={voiceReplies}
            >
              {voiceReplies ? <Volume2 className="w-4 h-4" strokeWidth={1.75} /> : <VolumeX className="w-4 h-4" strokeWidth={1.75} />}
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={listening ? (lang === 'es' ? 'Escuchando...' : 'Listening...') : (lang === 'es' ? 'Háblale a Melao...' : 'Talk to Melao...')}
              className="field flex-1 min-w-0 h-10 !py-0 text-sm"
            />
            <button
              onClick={toggleListening}
              style={{ touchAction: 'manipulation' }}
              className={`w-10 h-10 flex items-center justify-center border rounded-xs transition-colors shrink-0 ${
                listening ? 'border-melaos-hot text-melaos-hot bg-melaos-hot/10 animate-pulse' : 'border-line text-fog hoverable:hover:text-white'
              }`}
              title={listening ? 'Stop listening' : 'Speak to Melao'}
              aria-label="Speak to Melao"
              aria-pressed={listening}
            >
              <Mic className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={send}
              disabled={!input.trim()}
              className="btn btn-primary !min-h-[40px] w-10 !px-0 shrink-0 [--chamfer:7px]"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
