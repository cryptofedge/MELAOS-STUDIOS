'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Emblem from '@/components/Emblem';
import { Sparkles, Compass, Mic2, Library, BookOpen, X } from 'lucide-react';

const STORAGE_KEY = 'melaos_onboarded_v1';

interface Step {
  icon: typeof Sparkles;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: 'Welcome to MELAOS STUDIOS',
    body: "Where Sound Meets Soul. This is a quick tour of how to get around — takes about 10 seconds, you can skip anytime.",
  },
  {
    icon: Mic2,
    title: 'Create',
    body: "The orange Create button — in the navbar, and on every page — takes you straight to the Studio. Describe a song, pick a genre and mood, write lyrics, and generate a real AI track.",
    cta: { label: 'Open Studio', href: '/studio' },
  },
  {
    icon: Compass,
    title: 'Explore',
    body: "Browse Staff Picks, Trending, and Fresh Drops from the MELAOS community. Tap any cover to play it instantly.",
    cta: { label: 'Go to Explore', href: '/explore' },
  },
  {
    icon: Library,
    title: 'Library & Dashboard',
    body: "Everything you generate lives in your Library — songs, playlists, liked tracks. Your Dashboard tracks your monthly quota and account.",
    cta: { label: 'Go to Library', href: '/library' },
  },
  {
    icon: BookOpen,
    title: 'Learn before you drop',
    body: "AI-generated music has real rules around copyright and royalties. The Learn page breaks down what you need to know to actually get paid for what you make.",
    cta: { label: 'Go to Learn', href: '/learn' },
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function finish() {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 px-safe pb-safe"
      style={{ WebkitBackdropFilter: 'blur(6px)', backdropFilter: 'blur(6px)' }}
    >
      <div className="w-full max-w-md bg-ink-2 border border-line-strong rounded-[26px] overflow-hidden relative mb-3 sm:mb-0 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="brand-rule" />
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <Emblem variant="wordmark" alt="MELAOS STUDIOS" className="h-6 w-auto" />
            <button
              onClick={finish}
              style={{ touchAction: 'manipulation' }}
              className="touch-target -mt-3 -mr-3 text-fog hoverable:hover:text-white transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-[12px] font-semibold text-fog tabular-nums">{step + 1} / {STEPS.length}</p>
            <Icon className="w-5 h-5 text-melaos-orange" strokeWidth={1.5} />
          </div>

          <h2 className="mt-4 display text-white text-2xl leading-tight">{current.title}</h2>
          <p className="mt-3 text-fog text-sm leading-relaxed">{current.body}</p>

          {/* Progress */}
          <div className="mt-6 grid gap-1" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-colors ${i <= step ? "bg-brand" : "bg-ink-4"}`} />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button onClick={finish} style={{ touchAction: 'manipulation' }} className="btn btn-quiet !px-2">
              Skip
            </button>
            <div className="flex-1" />
            {current.cta && (
              <Link href={current.cta.href} onClick={finish} className="btn btn-ghost">
                {current.cta.label}
              </Link>
            )}
            <button onClick={() => (isLast ? finish() : setStep(s => s + 1))} className="btn btn-primary">
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
