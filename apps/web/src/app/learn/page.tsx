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

// Reading styles for the lesson HTML (injected below). Body copy in fog at
// 16–17px with relaxed leading; the "law-box" notes become ruled callouts
// with an orange left edge.
const LESSON_PROSE = [
  'text-fog text-base sm:text-[17px] leading-relaxed',
  '[&_p]:mb-5',
  '[&_strong]:text-white [&_strong]:font-medium',
  '[&_a]:text-melaos-orange [&_a]:underline [&_a]:underline-offset-4',
  '[&_.law-box]:my-6 [&_.law-box]:bg-ink-1 [&_.law-box]:border [&_.law-box]:border-line [&_.law-box]:border-l-2 [&_.law-box]:border-l-melaos-orange',
  '[&_.law-box]:px-4 sm:[&_.law-box]:px-5 [&_.law-box]:py-4 sm:[&_.law-box]:py-5',
  '[&_.law-box]:text-[15px] sm:[&_.law-box]:text-base [&_.law-box]:leading-relaxed [&_.law-box]:text-[#ECECF1]/85',
  '[&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0',
].join(' ');

export default function LearnPage() {
  const [openId, setOpenId] = useState<string | null>('ai_music');

  return (
    <div className="mx-auto max-w-[1440px] px-safe md:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-8">
        {/* Intro: stacked on phones and tablets, a sticky left rail on desktop */}
        <header className="lg:col-span-4 lg:self-start lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)] lg:border-t lg:border-line-soft lg:pt-6">
          <div>
            <p className="label mb-4">01 — Lessons</p>
            <h1 className="display font-light text-white leading-[1] text-[clamp(2.4rem,7vw,4rem)]">
              Learn
            </h1>
            <p className="mt-5 text-fog text-base sm:text-[17px] leading-relaxed max-w-[34rem]">
              Real laws, real rights, real money. MELAOS STUDIOS makes it easy to create —
              this is what you need to know to actually own and get paid for what you make.
            </p>
          </div>
          <Link href="/studio"
            className="hidden sm:inline-flex mt-8 btn btn-primary">
            <Plus className="w-4 h-4" strokeWidth={1.75} /> Create
          </Link>
        </header>

        {/* Lessons: a ruled index; each row opens into the reading column */}
        <div className="lg:col-span-8 border-t border-line-soft">
          {LESSONS.map((lesson, i) => {
            const open = openId === lesson.id;
            return (
              <div
                key={lesson.id}
                className="border-b border-line-soft"
              >
                <button
                  onClick={() => setOpenId(open ? null : lesson.id)}
                  aria-expanded={open}
                  className="group w-full min-h-[56px] flex items-start gap-4 sm:gap-6 py-5 sm:py-6 text-left touch-manipulation"
                >
                  <span className={`w-6 shrink-0 pt-[7px] font-mono text-[11px] tabular-nums transition-colors ${open ? 'text-melaos-orange' : 'text-fog-dim hoverable:group-hover:text-white'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block display font-light text-white text-[17px] sm:text-[22px] leading-snug">{lesson.title}</span>
                    <span className="block mt-2.5 label !text-melaos-orange">{lesson.tag}</span>
                  </span>
                  <ChevronDown
                    className={`w-[18px] h-[18px] mt-1 shrink-0 transition-[transform,color] ${open ? 'rotate-180 text-melaos-orange' : 'text-fog-dim hoverable:group-hover:text-white'}`}
                    strokeWidth={1.5}
                  />
                </button>
                {open && (
                  <div className="pb-10 sm:pl-12">
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
    </div>
  );
}
