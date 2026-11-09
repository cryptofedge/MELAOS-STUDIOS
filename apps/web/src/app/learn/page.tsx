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

// Reading styles for the lesson HTML (injected below): body copy in fog at
// 16–17px with relaxed leading; the "law-box" notes become rounded callout
// cards with a soft brand tint.
const LESSON_PROSE = [
  'text-fog text-base sm:text-[17px] leading-relaxed',
  '[&_p]:mb-4',
  '[&_strong]:text-white [&_strong]:font-semibold',
  '[&_a]:text-[#ff7cc0] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#ff7cc0]/40',
  '[&_.law-box]:my-5 [&_.law-box]:rounded-2xl [&_.law-box]:border [&_.law-box]:border-line',
  '[&_.law-box]:bg-ink-3 [&_.law-box]:bg-[linear-gradient(135deg,rgba(242,140,40,0.10),rgba(233,30,140,0.07)_50%,rgba(174,6,237,0.10))]',
  '[&_.law-box]:p-4 sm:[&_.law-box]:p-5',
  '[&_.law-box]:text-[15px] sm:[&_.law-box]:text-base [&_.law-box]:leading-relaxed [&_.law-box]:text-[#E4E4EA]',
  '[&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0',
].join(' ');

// Tag colors for the lesson chips, in turn.
const TAG_COLORS = ['tag-pink', 'tag-orange', 'tag-cyan'];

export default function LearnPage() {
  const [openId, setOpenId] = useState<string | null>('ai_music');

  return (
    <div className="mx-auto max-w-[880px] px-safe md:px-8 py-6 sm:py-10">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="display text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
            <span className="text-brand pr-[0.04em]">Learn</span>
          </h1>
          <p className="mt-4 max-w-[60ch] text-fog text-base sm:text-[17px] leading-relaxed">
            Real laws, real rights, real money. MELAOS STUDIOS makes it easy to create —
            this is what you need to know to actually own and get paid for what you make.
          </p>
        </div>
        <Link href="/studio"
          className="hidden sm:inline-flex shrink-0 btn btn-primary">
          <Plus className="w-4 h-4" strokeWidth={2} /> Create
        </Link>
      </header>

      {/* Lessons: rounded cards that open in place */}
      <div className="mt-8 sm:mt-10 space-y-3">
        {LESSONS.map((lesson, i) => {
          const open = openId === lesson.id;
          return (
            <div
              key={lesson.id}
              className={`panel overflow-hidden transition-colors ${open ? 'border-line-strong' : ''}`}
            >
              <button
                onClick={() => setOpenId(open ? null : lesson.id)}
                aria-expanded={open}
                className="group w-full min-h-[64px] flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-[17px] text-left touch-manipulation transition-colors hoverable:hover:bg-white/[0.03] focus-visible:outline-offset-[-3px]"
              >
                <span aria-hidden className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[14px] bg-ink-3 flex items-center justify-center text-xl sm:text-[22px] leading-none">
                  {lesson.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block display text-white text-base sm:text-lg leading-snug">{lesson.title}</span>
                  <span className="mt-2 flex">
                    <span className={`tag normal-case tracking-normal text-[11px] ${TAG_COLORS[i % TAG_COLORS.length]}`}>{lesson.tag}</span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                    open ? 'bg-white text-[#08080A]' : 'bg-white/[0.06] text-fog hoverable:group-hover:text-white'
                  }`}
                >
                  <ChevronDown
                    className={`w-[18px] h-[18px] transition-transform ${open ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                  />
                </span>
              </button>
              {open && (
                <div className="px-4 pb-6 sm:pl-[84px] sm:pr-6 sm:pb-7">
                  <div
                    className={`lesson-body max-w-[68ch] ${LESSON_PROSE}`}
                    dangerouslySetInnerHTML={{ __html: lesson.body }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
