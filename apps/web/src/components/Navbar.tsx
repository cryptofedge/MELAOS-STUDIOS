'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, Music2 } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] flex items-center px-4 md:px-6 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F28C28] to-[#E91E8C] flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm md:text-base hidden sm:block">
            MELAOS <span className="text-[#F28C28]">STUDIOS</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[#F28C28] transition-colors"
            />
          </div>
        </div>

        {/* Right nav */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <Link href="/explore" className="text-gray-400 hover:text-white text-sm font-medium transition-colors hidden md:block">
            Explore
          </Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white text-sm font-medium transition-colors hidden md:block">
            Pricing
          </Link>
          <Link href="/studio" className="btn-orange text-white text-sm font-semibold px-4 py-2 rounded-full transition-all hover:scale-105">
            Create
          </Link>
          <Link href="/auth" className="text-gray-400 hover:text-white text-sm font-medium hidden md:block">
            Sign In
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 p-1">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A0A0A] pt-16 px-6 flex flex-col gap-6 md:hidden">
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input placeholder="Search..." className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none" />
          </div>
          {[['Explore', '/explore'], ['Pricing', '/pricing'], ['Dashboard', '/dashboard'], ['Sign In', '/auth']].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="text-lg font-medium text-gray-200 hover:text-[#F28C28] transition-colors">
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
