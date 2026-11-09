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
  const areaCls = 'field min-h-[96px] resize-y leading-relaxed';
  const iconCls = 'w-4 h-4 text-melaos-orange';

  return (
    <div className="mx-auto max-w-[1200px] px-safe md:px-8 py-10 sm:py-14">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="grid lg:grid-cols-12 gap-4 lg:gap-8 items-end border-b border-line-soft pb-6 mb-8 sm:mb-10">
        <div className="lg:col-span-6">
          <span className="block w-6 h-px bg-melaos-orange mb-5" aria-hidden />
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-melaos-orange shrink-0" strokeWidth={1.5} />
            <h1 className="display font-light text-white leading-[1.02] text-[clamp(1.8rem,5vw,3rem)]">TRAIN MELAO</h1>
          </div>
        </div>
        <p className="lg:col-span-6 text-fog text-sm sm:text-[15px] leading-relaxed">
          Teach the bot your knowledge — when someone asks <em>this</em>, Melao answers <em>that</em>.
          English y español. Tu conocimiento, tu bot.
        </p>
      </header>

      {!unlocked ? (
        <div className="panel hud p-6 sm:p-7 max-w-md">
          <div className="flex items-center gap-2 mb-5 label !text-melaos-orange">
            <Lock className="w-3.5 h-3.5" strokeWidth={1.75} /> Trainer Access
          </div>
          <input type="password" value={trainKey} onChange={e => setTrainKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && unlock()}
            placeholder="Training key / Clave de entrenamiento" className={inputCls} />
          <button onClick={unlock}
            className="btn btn-primary mt-3 w-full !min-h-[48px]">
            Enter the Lab
          </button>
          {status && <p className="text-melaos-hot font-mono text-xs mt-3">{status}</p>}
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-px bg-line-soft border border-line-soft">
          {/* 01 Add teaching */}
          <section className="lg:col-span-7 bg-ink-0 p-5 sm:p-7">
            <SectionHead index="01" icon={<Plus className={iconCls} strokeWidth={1.75} />} title="New Teaching / Nueva Enseñanza" />
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
                {status && <p className="text-melaos-cyan font-mono text-xs">{status}</p>}
              </div>
            </div>
          </section>

          {/* 02 Test the bot */}
          <section className="lg:col-span-5 bg-ink-0 p-5 sm:p-7">
            <SectionHead index="02" icon={<Send className={iconCls} strokeWidth={1.75} />} title="Test Melao / Pruébalo" live />
            <div className="flex gap-2">
              <input value={testMsg} onChange={e => setTestMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && testBot()}
                placeholder="Ask Melao something..." className={inputCls} />
              <button onClick={testBot} className="btn btn-ghost shrink-0 !min-h-[48px]">Ask</button>
            </div>
            {testReply && <p className="mt-4 border-l-2 border-melaos-orange/70 bg-ink-1 pl-4 pr-3 py-3 text-sm text-[#ECECF1] leading-relaxed">{testReply}</p>}
          </section>

          {/* 03 Live teachings */}
          <section className="lg:col-span-12 bg-ink-0 p-5 sm:p-7">
            <SectionHead
              index="03"
              title={<>Melao&apos;s Teachings <span className="text-fog tabular-nums">({entries.length})</span></>}
              action={
                <button onClick={exportTeachings} disabled={!entries.length}
                  className="btn btn-quiet !px-2 -mr-2 disabled:!opacity-30">
                  <Download className="w-4 h-4" strokeWidth={1.5} /> Export
                </button>
              }
            />
            {entries.length === 0 && <p className="text-fog-dim text-sm">Nothing yet — teach him something above.</p>}
            {entries.length > 0 && (
              <div className="border-t border-line-soft">
                {entries.map((e, i) => (
                  <div key={e.id} className="py-4 border-b border-line-soft flex items-start justify-between gap-3 sm:gap-4">
                    <span className="hidden xs:block w-6 shrink-0 pt-0.5 font-mono text-[11px] text-fog-dim tabular-nums" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium">{e.topic}</p>
                      <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-melaos-orange break-words">{e.keywords.join(' · ')}</p>
                      <p className="mt-2 text-fog text-sm leading-relaxed line-clamp-2">{e.answer || e.answerEs}</p>
                    </div>
                    <button onClick={() => removeTeaching(e.id)} className="touch-target -mr-3 -mt-2.5 shrink-0 text-fog-dim hoverable:hover:text-melaos-hot transition-colors" aria-label="Delete teaching">
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-fog-dim text-xs mt-5 leading-relaxed max-w-3xl">
              Live teachings reset when the site redeploys — Export them and Fellito merges them into
              Melao&apos;s permanent brain (<span className="font-mono text-fog">apps/web/brain/MEMORY.md</span>). Permanent brain topics currently loaded: {brainTopics.join(', ')}.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

function SectionHead({ index, icon, title, action, live }: {
  index: string;
  icon?: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line-soft pb-4 mb-5">
      <div className="min-w-0">
        <p className="label mb-2.5 flex items-center gap-2.5 tabular-nums" aria-hidden>
          <span>{index}</span>
          <span className="w-5 h-px bg-line-strong" />
          {icon}
          {live && <span className="live-dot" />}
        </p>
        <h2 className="display font-light text-white text-lg sm:text-xl leading-snug">{title}</h2>
      </div>
      {action}
    </div>
  );
}
