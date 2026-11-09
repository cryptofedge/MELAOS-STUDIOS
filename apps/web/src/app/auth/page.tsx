'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Emblem from '@/components/Emblem';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    setTimeout(() => router.push('/dashboard'), 600);
  };

  const segment = (active: boolean) =>
    `flex-1 h-full touch-manipulation transition-colors ${active ? 'bg-ink-3 text-melaos-orange' : 'text-fog-dim hoverable:hover:text-white'}`;

  return (
    <div className="relative overflow-hidden min-h-[calc(100dvh-var(--nav-h)-var(--player-h))] flex items-center justify-center px-safe md:px-8 py-12 sm:py-16">
      {/* Faint measuring grid behind the panel */}
      <div className="absolute inset-0 rule-grid [mask-image:radial-gradient(ellipse_50%_55%_at_50%_45%,black,transparent_75%)]" aria-hidden />

      <div className="relative w-full max-w-md mx-auto">
        {/* Logo */}
        <Link href="/" className="block w-fit mx-auto mb-8">
          <Emblem variant="mark" alt="MELAOS STUDIOS" className="w-40 mx-auto" />
        </Link>

        <div className="panel hud">
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-6 border-b border-line">
            <h1 className="display font-light text-white text-[1.6rem] sm:text-[1.9rem] leading-[1.1]">
              {mode === 'signin' ? 'Welcome back' : 'Start creating'}
            </h1>
            <p className="text-fog text-sm mt-2">
              {mode === 'signin' ? 'Sign in to your MELAOS account' : 'Create your free account today'}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Toggle: segmented, like the ES/EN switch in the top bar */}
            <div className="flex h-11 mb-6 border border-line rounded-xs overflow-hidden font-mono text-[11px] tracking-[0.16em] uppercase">
              <button
                onClick={() => setMode('signin')}
                aria-pressed={mode === 'signin'}
                className={segment(mode === 'signin')}
              >Sign In</button>
              <button
                onClick={() => setMode('signup')}
                aria-pressed={mode === 'signup'}
                className={`border-l border-line ${segment(mode === 'signup')}`}
              >Sign Up</button>
            </div>

            {/* Social buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => { setSubmitting(true); setTimeout(() => router.push('/dashboard'), 600); }}
                className="btn btn-ghost w-full !min-h-[48px] !gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>
              <button
                onClick={() => { setSubmitting(true); setTimeout(() => router.push('/dashboard'), 600); }}
                className="btn btn-ghost w-full !min-h-[48px] !gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.5-57-155.5-127.4C46.8 680.6 0 555.6 0 435.6c0-219.5 141.9-335.6 281.6-335.6 74.5 0 136.7 49.4 184.6 49.4 45.7 0 117.4-52.4 207.1-52.4zm-120.2-293.9c-36.9 17.4-92.8 46.9-92.8 104.4 0 63.5 54.8 97.4 55.9 97.4 2.6 0 57-19.5 99.5-67.4 25.2-28.8 44.6-66.8 44.6-105.1 0-5.2-.6-10.4-1.3-14.3-3.2.6-47.7 2.6-105.9 84.4z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-line" aria-hidden />
              <span className="label shrink-0">or continue with email</span>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="label block mb-2">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="field h-12"
                  />
                </div>
              )}
              <div>
                <label className="label block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field h-12"
                />
              </div>
              <div>
                <label className="label block mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field h-12 !pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="touch-target absolute right-0 top-0 h-full w-12 text-fog-dim hoverable:hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full !min-h-[52px] !mt-7 disabled:opacity-70"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />}
                {submitting ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-xs text-fog-dim text-center mt-6 leading-relaxed">
              By continuing, you agree to MELAOS STUDIOS{' '}
              <span className="text-fog underline decoration-line-strong underline-offset-2 cursor-pointer hoverable:hover:text-white">Terms of Service</span>
              {' '}and{' '}
              <span className="text-fog underline decoration-line-strong underline-offset-2 cursor-pointer hoverable:hover:text-white">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
