'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Plus } from 'lucide-react';

interface Lesson {
  id: string;
  icon: string;
  title: string;
  tag: string;
  body: string;
}

const LESSONS: Lesson[] = [
  {
    id: 'ai_music',
    icon: '🤖',
    title: 'AI Music & PRO Royalty Eligibility',
    tag: 'Most important for MELAOS users',
    body: `<p>On October 28, 2025, ASCAP, BMI, and SOCAN (Canada) released a joint policy statement on AI-generated music and PRO royalty eligibility.</p>
    <div class="law-box">📜 <strong>The Joint Policy:</strong><br/><br/>• <strong>Partially AI-generated music:</strong> ELIGIBLE for PRO registration and royalties — as long as there is meaningful human creative contribution<br/>• <strong>Fully AI-generated music:</strong> NOT ELIGIBLE for PRO royalties — no human authorship = no copyright protection</div>
    <p>This means: if you use MELAOS STUDIOS to help write or produce, but <strong>you</strong> are the creative force — writing lyrics, shaping the arrangement, directing the sound — your music can still be registered. But if you just type a prompt and call it your song, you can't register it and can't collect PRO royalties.</p>
    <div class="law-box">⚠️ <strong>What this means for you:</strong> Use MELAOS as an instrument, not a vending machine. The more of your own creative decisions are in a track, the stronger your copyright claim.</div>`,
  },
  {
    id: 'copyright',
    icon: '©️',
    title: 'Copyright Act of 1976 — The Basics',
    tag: 'Foundation',
    body: `<p>The Copyright Act of 1976 (17 U.S.C.) is the bedrock of US music law. Your song is automatically protected the moment it's "fixed in tangible form" — recorded, written down, or saved to a file.</p>
    <div class="law-box">📜 <strong>Your 6 Exclusive Rights (Section 106):</strong><br/><br/>1. Reproduce the work<br/>2. Prepare derivative works<br/>3. Distribute copies<br/>4. Perform publicly<br/>5. Display publicly<br/>6. Digital audio transmission</div>
    <p>You have TWO copyrights in every song: the <strong>composition</strong> (melody + lyrics) and the <strong>sound recording</strong> (the master). They're separate — and both are valuable.</p>
    <div class="law-box">💡 <strong>Pro Tip:</strong> Register with the US Copyright Office (copyright.gov) for $35–$65. Without registration, you can't sue for statutory damages ($750–$150,000 per infringement).</div>`,
  },
  {
    id: 'pro',
    icon: '📋',
    title: 'Registering With a PRO',
    tag: 'Get paid',
    body: `<p>A Performance Rights Organization (PRO) collects royalties when your music is played publicly — radio, streaming, venues, TV. You must register to get paid.</p>
    <div class="law-box">📜 <strong>Main US Options:</strong><br/><br/>• <strong>ASCAP</strong> — non-profit, founded 1914, rates set by court consent decree<br/>• <strong>BMI</strong> — went for-profit in 2022, largest by catalog, free for writers<br/>• <strong>SESAC</strong> — invite-only, smaller curated roster<br/>• <strong>The MLC</strong> — separate from the above, handles mechanical royalties from streaming</div>
    <div class="law-box">⚠️ <strong>One PRO Rule:</strong> You can only register with ONE PRO in the US at a time (ASCAP, BMI, or SESAC) — but you need The MLC separately for mechanical royalties. For releases outside the US, register with the local PRO in each country.</div>`,
  },
  {
    id: 'mma',
    icon: '🎵',
    title: 'Music Modernization Act (2018)',
    tag: 'Streaming royalties',
    body: `<p>The Music Modernization Act (MMA) of 2018 was the most significant update to US music copyright law since 1976. It created <strong>The MLC (Mechanical Licensing Collective)</strong> to handle streaming mechanical royalties.</p>
    <div class="law-box">📜 <strong>3 Key Titles of the MMA:</strong><br/><br/><strong>Title I</strong> — Created The MLC. Streaming services pay blanket mechanical licenses; MLC distributes to rights holders.<br/><br/><strong>Title II</strong> — SoundExchange now pays pre-1972 recordings.<br/><br/><strong>Title III</strong> — Producers, mixers, and sound engineers can register for royalties directly.</div>
    <p>Before the MMA, streaming services had billions in unclaimed mechanical royalties sitting in "black boxes." The MLC exists to fix that — make sure your tracks are registered there too, not just with a PRO.</p>`,
  },
  {
    id: 'dmca',
    icon: '🛡️',
    title: 'DMCA & Platform Takedowns',
    tag: 'Protecting your work',
    body: `<p>The Digital Millennium Copyright Act (1998) created the Safe Harbor provision protecting platforms like YouTube, TikTok, and Instagram from liability — as long as they respond to takedown notices.</p>
    <div class="law-box">📜 <strong>How It Works:</strong><br/><br/>• Platform receives a DMCA notice → must take down infringing content<br/>• Platform gets a counter-notice → must restore if no lawsuit is filed within 10 days</div>
    <p>For you as an artist: most platforms automatically scan uploads and can <strong>Monetize, Track, or Block</strong> content that matches your registered catalog. Register your works with a Content ID partner (e.g. DistroKid, TuneCore) to claim that automatically instead of disputing it after the fact.</p>`,
  },
  {
    id: '360',
    icon: '💿',
    title: '360 Deals — Read Before You Sign',
    tag: 'Know your contracts',
    body: `<p>A 360 Deal (Multi-Rights Deal) means a label takes a percentage of EVERYTHING — not just record sales, but touring income, merchandise, endorsements, even your YouTube channel.</p>
    <div class="law-box">📜 <strong>Typical 360 Cut:</strong><br/><br/>• Tours/concerts: 10–15%<br/>• Merchandise: 10–25%<br/>• Endorsements: 10–25%<br/>• Publishing: up to 50% of publishing split<br/>• YouTube/social: 10–25%</div>
    <div class="law-box">💡 <strong>Negotiation Tips:</strong><br/>• Limit 360 participation to income streams the label actively helps generate<br/>• Add a sunset clause<br/>• Keep your publishing separate if possible<br/>• Never sign without an entertainment attorney</div>`,
  },
];

export default function LearnPage() {
  const [openId, setOpenId] = useState<string | null>('ai_music');

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            📚 Learn
          </h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Real laws, real rights, real money. MELAOS STUDIOS makes it easy to create —
            this is what you need to know to actually own and get paid for what you make.
          </p>
        </div>
        <Link href="/studio"
          className="hidden sm:flex items-center gap-2 btn-orange text-white text-sm font-semibold px-4 py-2 rounded-full hover:scale-105 transition-transform shrink-0">
          <Plus className="w-4 h-4" /> Create
        </Link>
      </div>

      <div className="space-y-3">
        {LESSONS.map(lesson => {
          const open = openId === lesson.id;
          return (
            <div
              key={lesson.id}
              className="bg-[#1A1A1A] border border-[#2a2a2a] rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenId(open ? null : lesson.id)}
                style={{ minHeight: '56px', touchAction: 'manipulation' }}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#222] transition-colors"
              >
                <span className="text-2xl shrink-0">{lesson.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{lesson.title}</p>
                  <p className="text-[#F28C28] text-xs font-medium mt-0.5">{lesson.tag}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <div
                  className="lesson-body px-4 pb-5 pt-1 text-gray-300 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lesson.body }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .lesson-body p { margin-bottom: 12px; }
        .lesson-body strong { color: #fff; }
        .law-box {
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 14px;
          margin: 12px 0;
          font-size: 13px;
          color: #ccc;
        }
      `}</style>
    </div>
  );
}
