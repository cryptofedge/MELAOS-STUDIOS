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

  const inputCls = 'w-full bg-black/60 border border-[#F28C28]/30 rounded-lg p-3 text-sm text-[#E0E0FF] placeholder:text-gray-600 focus:outline-none focus:border-[#F28C28] transition-all';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Brain className="w-7 h-7 text-[#E91E8C]" style={{ filter: 'drop-shadow(0 0 6px #E91E8C)' }} />
        <h1 className="text-2xl font-black text-white tracking-wide">TRAIN MELAO</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Teach the bot your knowledge — when someone asks <em>this</em>, Melao answers <em>that</em>.
        English y español. Tu conocimiento, tu bot.
      </p>

      {!unlocked ? (
        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 max-w-md">
          <div className="flex items-center gap-2 mb-3 text-[#F28C28] text-sm font-bold uppercase tracking-widest">
            <Lock className="w-4 h-4" /> Trainer Access
          </div>
          <input type="password" value={trainKey} onChange={e => setTrainKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && unlock()}
            placeholder="Training key / Clave de entrenamiento" className={inputCls} />
          <button onClick={unlock}
            className="mt-3 w-full py-2.5 rounded-lg font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #F28C28, #E91E8C)' }}>
            Enter the Lab
          </button>
          {status && <p className="text-[#FF2D78] text-xs mt-2">{status}</p>}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Add teaching */}
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 text-[#E91E8C] text-sm font-bold uppercase tracking-widest">
              <Plus className="w-4 h-4" /> New Teaching / Nueva Enseñanza
            </div>
            <div className="space-y-3">
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic — e.g. Reggaeton drums" className={inputCls} />
              <input value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder="Trigger words, comma separated — e.g. reggaeton drums, perreo, tambores de reggaeton" className={inputCls} />
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={3}
                placeholder="Melao's answer in English..." className={inputCls} />
              <textarea value={answerEs} onChange={e => setAnswerEs(e.target.value)} rows={3}
                placeholder="La respuesta de Melao en español..." className={inputCls} />
              <button onClick={addTeaching}
                className="px-6 py-2.5 rounded-lg font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #F28C28, #E91E8C)' }}>
                Teach Melao
              </button>
              {status && <p className="text-[#00FFD1] text-xs">{status}</p>}
            </div>
          </div>

          {/* Test the bot */}
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 text-[#00FFD1] text-sm font-bold uppercase tracking-widest">
              <Send className="w-4 h-4" /> Test Melao / Pruébalo
            </div>
            <div className="flex gap-2">
              <input value={testMsg} onChange={e => setTestMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && testBot()}
                placeholder="Ask Melao something..." className={inputCls} />
              <button onClick={testBot} className="px-5 rounded-lg border border-[#00FFD1] text-[#00FFD1] text-sm font-bold hover:bg-[#00FFD1]/10">Ask</button>
            </div>
            {testReply && <p className="mt-3 text-sm text-gray-200 bg-black/40 border border-[#222] rounded-lg p-3">{testReply}</p>}
          </div>

          {/* Live teachings */}
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#F28C28] text-sm font-bold uppercase tracking-widest">Melao's Teachings ({entries.length})</span>
              <button onClick={exportTeachings} disabled={!entries.length}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-30">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            {entries.length === 0 && <p className="text-gray-600 text-sm">Nothing yet — teach him something above.</p>}
            <div className="space-y-3">
              {entries.map(e => (
                <div key={e.id} className="border border-[#222] rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold">{e.topic}</p>
                    <p className="text-[#F28C28] text-xs mt-0.5">{e.keywords.join(' · ')}</p>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{e.answer || e.answerEs}</p>
                  </div>
                  <button onClick={() => removeTeaching(e.id)} className="text-gray-600 hover:text-[#FF2D78] shrink-0" aria-label="Delete teaching">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-[11px] mt-4 leading-relaxed">
              Live teachings reset when the site redeploys — Export them and Fellito merges them into
              Melao's permanent brain (apps/web/brain/MEMORY.md). Permanent brain topics currently loaded: {brainTopics.join(', ')}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
