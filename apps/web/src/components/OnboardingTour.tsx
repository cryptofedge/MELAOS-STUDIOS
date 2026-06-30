'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70" style={{ WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm bg-[#15151f] border border-[#333] rounded-2xl p-6 relative shadow-2xl">
        <button
          onClick={finish}
          style={{ minWidth: '36px', minHeight: '36px', touchAction: 'manipulation' }}
          className="absolute top-3 right-3 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>

        <img src="/melaos-logo-3.png" alt="MELAOS STUDIOS" className="h-10 w-auto mb-4" />

        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #F28C28, #E91E8C)' }}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-white font-black text-lg mb-2">{current.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{current.body}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-[#F28C28]' : 'w-1.5 bg-[#333]'}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={finish}
            style={{ minHeight: '44px', touchAction: 'manipulation' }}
            className="text-gray-500 hover:text-gray-300 text-sm font-medium px-3 transition-colors"
          >
            Skip
          </button>
          <div className="flex-1" />
          {current.cta && (
            <Link
              href={current.cta.href}
              onClick={finish}
              style={{ minHeight: '44px', touchAction: 'manipulation' }}
              className="flex items-center px-4 rounded-full text-sm font-semibold border border-[#333] text-gray-300 hover:border-[#555] hover:text-white transition-colors"
            >
              {current.cta.label}
            </Link>
          )}
          <button
            onClick={() => (isLast ? finish() : setStep(s => s + 1))}
            style={{ minHeight: '44px', touchAction: 'manipulation' }}
            className="btn-orange text-white text-sm font-bold px-5 rounded-full hover:scale-105 transition-transform"
          >
            {isLast ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
