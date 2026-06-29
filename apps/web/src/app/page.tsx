import Link from 'next/link';
import { Music2, Sparkles, Share2, SlidersHorizontal, Shield, LayoutGrid, Layers, Infinity } from 'lucide-react';

const features = [
  { icon: Music2, title: '10 free songs, daily', desc: 'Generate up to 10 tracks every day at no cost. Full quality, no strings attached.' },
  { icon: Sparkles, title: 'Free AI music generator', desc: 'Powered by MELAOS v5 — our most advanced generation model to date.' },
  { icon: Share2, title: 'Share it with the world', desc: 'Publish instantly to your profile. Let fans discover your sound from anywhere.' },
  { icon: SlidersHorizontal, title: 'Granular creation controls', desc: 'Dial in BPM, genre, mood, vocal style, and more with our pro parameter suite.' },
  { icon: Shield, title: 'Commercial rights to your songs', desc: 'Pro and Premier subscribers own full commercial rights to every song they create.' },
  { icon: LayoutGrid, title: 'Your complete creative workspace', desc: 'Multitrack DAW, lyrics editor, stem mixer — everything in one place.' },
  { icon: Layers, title: 'Extract stems. Drop into your DAW.', desc: 'Separate vocals, drums, bass, and more. Export to Ableton, FL, Logic seamlessly.' },
  { icon: Infinity, title: 'Create everyday. Keep it all.', desc: 'Your entire library lives in the cloud. Unlimited storage on Pro and Premier.' },
];

const heroSongs = [
  { title: 'Midnight Frequencies', artist: 'NovaSynth', gradient: 'from-blue-600 to-purple-800', delay: '0s' },
  { title: 'Golden Hour Lagos', artist: 'AfroWave', gradient: 'from-orange-500 to-pink-600', delay: '1.3s' },
  { title: 'Trap Cathedral', artist: 'DeepVault', gradient: 'from-gray-900 to-purple-900', delay: '2.6s' },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 hero-gradient overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#F28C28]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#7C3AED]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#E91E8C]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#1A1A1A]/80 border border-[#333] rounded-full px-4 py-1.5 mb-8 text-sm text-gray-400 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
            Introducing MELAOS v5 — Our most powerful model
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-6 tracking-tight">
            Make any song<br />
            <span className="gradient-text">you can imagine</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Start with a simple prompt or dive into our pro editing tools. Your next track is just a step away.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/studio"
              className="btn-orange text-white font-bold text-lg px-10 py-4 rounded-full hover:scale-105 transition-transform inline-block"
            >
              Create
            </Link>
            <Link
              href="/explore"
              className="border border-[#333] text-gray-300 hover:text-white hover:border-[#555] font-semibold text-lg px-8 py-4 rounded-full transition-all"
            >
              Explore Music
            </Link>
          </div>

          <p className="text-gray-600 text-sm mt-4">No credit card required · 10 free songs daily</p>
        </div>

        {/* Floating song cards */}
        <div className="relative z-10 mt-20 flex gap-4 md:gap-6 justify-center flex-wrap md:flex-nowrap">
          {heroSongs.map((song, i) => (
            <div
              key={i}
              className={`float-card bg-[#1A1A1A] border border-[#333] rounded-2xl p-3 w-44 md:w-52 cursor-pointer hover:border-[#555] transition-all`}
              style={{ animationDelay: song.delay }}
            >
              <div className={`h-32 rounded-xl bg-gradient-to-br ${song.gradient} mb-3 relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
              <p className="text-white text-sm font-semibold truncate">{song.title}</p>
              <p className="text-gray-500 text-xs">{song.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Everything you need to make music{' '}
            <span className="gradient-text">your way</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From instant generation to professional-grade editing tools, MELAOS has it all.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card-hover bg-[#1A1A1A] border border-[#333] rounded-2xl p-5 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F28C28]/20 to-[#E91E8C]/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#F28C28]" />
              </div>
              <h3 className="text-white font-bold text-sm md:text-base mb-2">{title}</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-[#333] rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to start creating?</h2>
          <p className="text-gray-400 mb-8">Join 500,000+ creators making music with MELAOS STUDIOS.</p>
          <Link href="/studio" className="btn-orange text-white font-bold text-base px-8 py-3 rounded-full hover:scale-105 transition-transform inline-block">
            Start for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] py-8 px-4 text-center text-gray-600 text-sm">
        <p>© 2026 MELAOS STUDIOS · FEDGE 2.O / Eclat Universe · Rafael Fellito Rodriguez</p>
        <p className="mt-2">Where Sound Meets Soul</p>
      </footer>
    </div>
  );
}
