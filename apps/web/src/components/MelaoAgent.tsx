'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Music2, Sparkles, GripHorizontal } from 'lucide-react';
import { useAudioStore } from '@/lib/store';

interface Message {
  role: 'user' | 'melao';
  text: string;
}

const MELAO_RESPONSES: Record<string, string> = {
  default: "Yo, I'm Melao — the mind behind MELAOS STUDIOS. Ask me about beats, production, the sound we're building, anything.",
  greet: "Wassup! Melao here. Ready to talk music, creation, or whatever's on your mind.",
  beat: "Every beat I make starts with a feeling. You gotta feel it before you can build it. What kind of energy are you going for?",
  studio: "The studio is where magic happens. MELAOS STUDIOS — powered by Eclat Universe — is built for artists who take their sound seriously. Every tool you need, right here.",
  collab: "Collaboration is everything in music. The best tracks come from two energies meeting in the right space. You trying to create something?",
  genre: "I don't box myself in. Afrobeats, Drill, R&B, Trap — if it hits, it hits. What's your lane?",
  help: "I got you. Whether it's production tips, navigating the studio, or just vibing on ideas — I'm here. What do you need?",
  sign: "MELAOS STUDIOS is the label and the platform. If your sound is real, we want to hear it. Drop something in the studio and let's see what you've got.",
};

function getMelaoResponse(input: string): string {
  const low = input.toLowerCase();
  if (low.match(/hi|hello|hey|wassup|what's good/)) return MELAO_RESPONSES.greet;
  if (low.match(/beat|track|produce|production|sound/)) return MELAO_RESPONSES.beat;
  if (low.match(/studio|daw|record|create|generate/)) return MELAO_RESPONSES.studio;
  if (low.match(/collab|work together|feature|ft\./)) return MELAO_RESPONSES.collab;
  if (low.match(/genre|style|type of music|rap|drill|afro|r&b|trap|soul/)) return MELAO_RESPONSES.genre;
  if (low.match(/help|how|what can|guide/)) return MELAO_RESPONSES.help;
  if (low.match(/sign|label|deal|contract|artist/)) return MELAO_RESPONSES.sign;
  return MELAO_RESPONSES.default;
}

const PANEL_W = 320;
const PANEL_H = 420;

export default function MelaoAgent() {
  const { currentSong } = useAudioStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'melao', text: "Yo, I'm Melao — MELAOS STUDIOS, powered by Eclat Universe. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'melao', text: getMelaoResponse(text) }]);
    }, 900 + Math.random() * 600);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* Floating trigger button — draggable; click (no drag) toggles the panel */}
      <button
        onPointerDown={onBtnPointerDown}
        onPointerMove={onBtnPointerMove}
        onPointerUp={onBtnPointerUp}
        onPointerLeave={() => { btnDragging.current = false; }}
        style={{
          background: 'linear-gradient(135deg, #F28C28, #E91E8C)',
          minWidth: '56px',
          minHeight: '56px',
          touchAction: 'none',
          cursor: 'grab',
          ...(btnPos ? { left: btnPos.x, top: btnPos.y, right: 'auto', bottom: 'auto' } : {}),
        }}
        className={`fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 active:cursor-grabbing ${
          btnPos ? '' : `right-4 ${currentSong ? 'bottom-40 sm:bottom-24' : 'bottom-24'}`
        }`}
        aria-label="Chat with Melao"
      >
        <Music2 className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
      </button>

      {/* Draggable chat panel */}
      {open && pos && (
        <div
          ref={panelRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="fixed z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#333]"
          style={{
            width: PANEL_W,
            height: PANEL_H,
            background: '#111',
            left: pos.x,
            top: pos.y,
            touchAction: 'none',
          }}
        >
          {/* Drag handle header */}
          <div
            onPointerDown={onPointerDown}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#222] shrink-0 cursor-grab active:cursor-grabbing select-none"
            style={{ background: 'linear-gradient(135deg, #1a0a00, #1a001a)' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F28C28, #E91E8C)' }}>
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none">Melao</p>
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Eclat Universe · FEDGE 2.O
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-gray-600" />
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setOpen(false)}
                style={{ minWidth: '36px', minHeight: '36px', touchAction: 'manipulation' }}
                className="flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'melao' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #F28C28, #E91E8C)' }}>
                    M
                  </div>
                )}
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug
                  ${m.role === 'user'
                    ? 'text-white rounded-tr-sm'
                    : 'text-gray-100 rounded-tl-sm border border-[#2a2a2a]'
                  }`}
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, #F28C28, #E91E8C)' }
                    : { background: '#1a1a1a' }
                  }>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #F28C28, #E91E8C)' }}>
                  M
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-[#222] flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Talk to Melao..."
              style={{ fontSize: '16px' }}
              className="flex-1 bg-[#1a1a1a] text-white text-sm rounded-full px-4 py-2 outline-none border border-[#333] focus:border-orange-500 placeholder-gray-600 transition-colors"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              style={{
                background: 'linear-gradient(135deg, #F28C28, #E91E8C)',
                minWidth: '36px',
                minHeight: '36px',
                touchAction: 'manipulation',
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110 active:scale-95 flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
