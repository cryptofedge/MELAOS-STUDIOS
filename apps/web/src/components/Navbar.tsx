'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, Music2 } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 border-b border-[#1A1A1A]" style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}>
        {/* Main nav row */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F28C28] to-[#E91E8C] flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm md:text-base hidden xs:block">
              MELAOS <span className="text-[#F28C28]">STUDIOS</span>
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search songs, artists..."
                style={{ fontSize: '16px' }}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#F28C28] transition-colors"
              />
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/explore" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Explore
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/studio" className="btn-orange text-white text-sm font-semibold px-4 py-2 rounded-full transition-all hover:scale-105">
              Create
            </Link>
            <Link href="/auth" className="text-gray-400 hover:text-white text-sm font-medium">
              Sign In
            </Link>
          </div>

          {/* Mobile: search icon + hamburger */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="touch-target text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="touch-target text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar (toggled) */}
        <div className={`md:hidden px-4 pb-3 ${searchOpen ? 'block' : 'hidden'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              style={{ fontSize: '16px' }}
              className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2 pl-10 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#F28C28] transition-colors"
            />
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#0A0A0A] z-40 overflow-y-auto">
          <div className="flex flex-col p-6 gap-6">
            {[
              ['Explore', '/explore'],
              ['Pricing', '/pricing'],
              ['Dashboard', '/dashboard'],
              ['Sign In', '/auth'],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-xl font-semibold text-gray-200 hover:text-[#F28C28] transition-colors py-1"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/studio"
              onClick={() => setMenuOpen(false)}
              className="btn-orange text-white font-bold text-base px-6 py-4 rounded-full text-center mt-2"
            >
              Create Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
