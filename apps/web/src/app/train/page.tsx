'use client';
import { useState } from 'react';
import { Brain, Plus, Trash2, Download, Send, Lock } from 'lucide-react';

// Melao's Trainer — where Milciades "Melao" Holguin teaches his bot.
// Teachings go live instantly (stored server-side via /api/melao). For
// permanence across deploys, Export and merge into apps/web/brain/MEMORY.md.

interface Teaching {
  id: string;
  topic: string;
  keywords: string[];
  answer: string;
  answerEs: string;
}

export default function TrainPage() {
  const [trainKey, setTrainKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<Teaching[]>([]);
  const [brainTopics, setBrainTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerEs, setAnswerEs] = useState('');
  const [status, setStatus] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [testReply, setTestReply] = useState('');

  async function unlock() {
    setStatus('');
    const res = await fetch(`/api/melao?key=${encodeURIComponent(trainKey)}`);
    if (!res.ok) { setStatus('Wrong key. / Clave incorrecta.'); return; }
    const data = await res.json();
    setEntries(data.entries);
    setBrainTopics(data.brainTopics);
    setUnlocked(true);
  }

  async function addTeaching() {
    setStatus('');
    const res = await fetch('/api/melao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'train', key: trainKey, entry: { topic, keywords, answer, answerEs } }),
    });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error || 'Failed'); return; }
    setEntries(e => [...e, data.entry]);
    setTopic(''); setKeywords(''); setAnswer(''); setAnswerEs('');
    setStatus('✓ Melao learned it! / ¡Melao lo aprendió!');
  }

  async function removeTeaching(id: string) {
    await fetch('/api/melao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', key: trainKey, id }),
    });
    setEntries(e => e.filter(x => x.id !== id));
  }

  function exportTeachings() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'melao-teachings.json';
    a.click();
  }

  async function testBot() {
    setTestReply('...');
    const res = await fetch('/api/melao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testMsg }),
    });
    const data = await res.json();
    setTestReply(data.answer || data.error || 'No reply');
  }

  const inputCls = 'field h-12';
  const areaCls = 'field min-h-[104px] resize-y leading-relaxed';

  return (
    <div className="mx-auto max-w-[1100px] px-safe md:px-8 py-6 sm:py-10">
      {/* ── Header: centered over the lock card, left-aligned over the tools ── */}
      <header className={`mb-6 sm:mb-8 ${unlocked ? '' : 'text-center'}`}>
        <div className={`flex items-center gap-3 sm:gap-4 ${unlocked ? '' : 'justify-center'}`}>
          <span className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-brand flex items-center justify-center shadow-[0_10px_30px_rgba(233,30,140,0.3)]">
            <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
          </span>
          <h1 className="display text-white leading-[1.05] text-3xl sm:text-4xl lg:text-5xl">TRAIN <span className="text-brand">MELAO</span></h1>
        </div>
        <p className={`mt-4 text-fog text-sm sm:text-base leading-relaxed max-w-2xl ${unlocked ? '' : 'mx-auto'}`}>
          Teach the bot your knowledge — when someone asks <em>this</em>, Melao answers <em>that</em>.
          English y español. Tu conocimiento, tu bot.
        </p>
      </header>

      {!unlocked ? (
        <div className="relative max-w-md mx-auto sm:mt-10">
          <div className="brand-glow inset-x-0 -top-10 h-56 opacity-30" aria-hidden />
          <div className="relative panel-raised rounded-panel p-6 sm:p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <span className="w-14 h-14 rounded-full bg-melaos-orange/15 text-melaos-orange flex items-center justify-center">
                <Lock className="w-6 h-6" strokeWidth={2} />
              </span>
              <h2 className="mt-4 display text-white text-xl sm:text-2xl">Trainer Access</h2>
            </div>
            <input type="password" value={trainKey} onChange={e => setTrainKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              placeholder="Training key / Clave de entrenamiento" className={inputCls} />
            <button onClick={unlock}
              className="btn btn-primary mt-3 w-full !min-h-[48px]">
              Enter the Lab
            </button>
            {status && <p className="text-melaos-hot text-sm text-center mt-3">{status}</p>}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-12 items-start">
          {/* Add teaching */}
          <section className="lg:col-span-7 panel p-5 sm:p-6">
            <SectionHead icon={<Plus className="w-[18px] h-[18px] text-melaos-orange" strokeWidth={2.25} />} title="New Teaching / Nueva Enseñanza" />
            <div className="space-y-3">
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic — e.g. Reggaeton drums" className={inputCls} />
              <input value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder="Trigger words, comma separated — e.g. reggaeton drums, perreo, tambores de reggaeton" className={inputCls} />
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={3}
                placeholder="Melao's answer in English..." className={areaCls} />
              <textarea value={answerEs} onChange={e => setAnswerEs(e.target.value)} rows={3}
                placeholder="La respuesta de Melao en español..." className={areaCls} />
              <div className="pt-2 flex flex-col xs:flex-row xs:items-center gap-3">
                <button onClick={addTeaching}
                  className="btn btn-primary !min-h-[48px] !px-7">
                  Teach Melao
                </button>
                {status && <p className="text-melaos-cyan text-sm">{status}</p>}
              </div>
            </div>
          </section>

          {/* Test the bot */}
          <section className="lg:col-span-5 panel p-5 sm:p-6">
            <SectionHead icon={<Send className="w-[18px] h-[18px] text-melaos-pink" strokeWidth={2} />} title="Test Melao / Pruébalo" live />
            <div className="flex gap-2">
              <input value={testMsg} onChange={e => setTestMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && testBot()}
                placeholder="Ask Melao something..." className={`${inputCls} min-w-0`} />
              <button onClick={testBot} className="btn btn-ghost shrink-0 !min-h-[48px] !px-5">Ask</button>
            </div>
            {testReply && <p className="mt-4 rounded-2xl rounded-tl-md bg-ink-3 px-4 py-3 text-sm text-[#F4F4F6] leading-relaxed">{testReply}</p>}
          </section>

          {/* Live teachings */}
          <section className="lg:col-span-12 panel p-5 sm:p-6">
            <SectionHead
              title={<>Melao&apos;s Teachings <span className="text-fog tabular-nums">({entries.length})</span></>}
              action={
                <button onClick={exportTeachings} disabled={!entries.length}
                  className="btn btn-ghost shrink-0 !px-4 text-[13px]">
                  <Download className="w-4 h-4" strokeWidth={2} /> Export
                </button>
              }
            />
            {entries.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line-strong px-4 py-8 text-center text-fog text-sm">Nothing yet — teach him something above.</p>
            )}
            {entries.length > 0 && (
              <div className="grid gap-2.5 md:grid-cols-2">
                {entries.map(e => (
                  <div key={e.id} className="rounded-2xl bg-ink-3 pl-4 pr-1.5 py-3.5 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-white text-[15px] font-semibold">{e.topic}</p>
                      <p className="mt-1 text-[13px] font-medium text-melaos-orange break-words">{e.keywords.join(' · ')}</p>
                      <p className="mt-2 text-fog text-sm leading-relaxed line-clamp-2">{e.answer || e.answerEs}</p>
                    </div>
                    <button onClick={() => removeTeaching(e.id)} className="touch-target shrink-0 rounded-full text-fog transition-colors hoverable:hover:text-melaos-hot hoverable:hover:bg-white/[0.06]" aria-label="Delete teaching">
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-fog-dim text-xs mt-5 leading-relaxed max-w-3xl">
              Live teachings reset when the site redeploys — Export them and Fellito merges them into
              Melao&apos;s permanent brain (<span className="rounded-md bg-ink-3 px-1.5 py-0.5 font-mono text-[11px] text-fog">apps/web/brain/MEMORY.md</span>). Permanent brain topics currently loaded: {brainTopics.join(', ')}.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

function SectionHead({ icon, title, action, live }: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span className="relative w-10 h-10 shrink-0 rounded-full bg-ink-3 flex items-center justify-center" aria-hidden>
            {icon}
            {live && <span className="live-dot absolute top-0.5 right-0.5 ring-2 ring-ink-2" />}
          </span>
        )}
        <h2 className="display text-white text-lg sm:text-xl leading-snug min-w-0">{title}</h2>
      </div>
      {action}
    </div>
  );
}
