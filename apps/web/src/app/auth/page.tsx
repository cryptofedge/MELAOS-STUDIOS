'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Music2, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F28C28] to-[#E91E8C] flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg text-white">MELAOS <span className="text-[#F28C28]">STUDIOS</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">
            {mode === 'signin' ? 'Welcome back' : 'Start creating'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'signin' ? 'Sign in to your MELAOS account' : 'Create your free account today'}
          </p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl p-6 sm:p-8">
          {/* Toggle */}
          <div className="flex bg-[#111] rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('signin')}
              style={{ minHeight: '44px', touchAction: 'manipulation' }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-[#F28C28] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >Sign In</button>
            <button
              onClick={() => setMode('signup')}
              style={{ minHeight: '44px', touchAction: 'manipulation' }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-[#F28C28] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >Sign Up</button>
          </div>

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button
              style={{ minHeight: '48px', touchAction: 'manipulation' }}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 transition-colors"
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
              style={{ minHeight: '48px', touchAction: 'manipulation' }}
              className="w-full flex items-center justify-center gap-3 bg-black text-white border border-[#444] font-semibold text-sm py-3 rounded-xl hover:bg-[#111] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.5-57-155.5-127.4C46.8 680.6 0 555.6 0 435.6c0-219.5 141.9-335.6 281.6-335.6 74.5 0 136.7 49.4 184.6 49.4 45.7 0 117.4-52.4 207.1-52.4zm-120.2-293.9c-36.9 17.4-92.8 46.9-92.8 104.4 0 63.5 54.8 97.4 55.9 97.4 2.6 0 57-19.5 99.5-67.4 25.2-28.8 44.6-66.8 44.6-105.1 0-5.2-.6-10.4-1.3-14.3-3.2.6-47.7 2.6-105.9 84.4z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#1A1A1A] px-3 text-xs text-gray-600">or continue with email</span>
            </div>
          </div>

          <form onSubmit={e => e.preventDefault()} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{ fontSize: '16px' }}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-[#F28C28] transition-colors"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ fontSize: '16px' }}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-[#F28C28] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ fontSize: '16px' }}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 pr-12 text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-[#F28C28] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ minWidth: '44px', minHeight: '44px', touchAction: 'manipulation' }}
                  className="absolute right-0 top-0 h-full flex items-center justify-center text-gray-600 hover:text-gray-400"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{ minHeight: '48px', touchAction: 'manipulation' }}
              className="w-full btn-orange text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform text-sm"
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
            By continuing, you agree to MELAOS STUDIOS{' '}
            <span className="text-gray-500 cursor-pointer hover:text-gray-300">Terms of Service</span>
            {' '}and{' '}
            <span className="text-gray-500 cursor-pointer hover:text-gray-300">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
