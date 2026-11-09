'use client';
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for exploring AI music creation',
    highlight: false,
    badge: null,
    cta: 'Get Started Free',
    ctaHref: '/auth',
    features: [
      '1 song per day',
      'Standard quality (128kbps)',
      'Watermarked tracks',
      'No commercial rights',
      'Community access',
      'Basic genre selection',
    ],
    missing: ['Stem separation', 'MIDI export', 'Priority generation', 'Commercial rights'],
  },
  {
    name: 'Pro',
    price: { monthly: 10, annual: 8 },
    description: 'For serious Eclat Universe artists ready to go professional',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Pro',
    ctaHref: '/auth',
    features: [
      '500 songs per month',
      'MELAOS v5.5 model',
      'High quality (320kbps)',
      'Full commercial rights',
      'Priority generation queue',
      'Stem separation (7 stems)',
      'Download in WAV / MP3',
      'No watermarks',
      'Advanced DAW studio',
    ],
    missing: ['MIDI export', 'Persona voices'],
  },
  {
    name: 'Premier',
    price: { monthly: 30, annual: 24 },
    description: 'The ultimate studio experience — no limits',
    highlight: false,
    badge: 'Power Users',
    cta: 'Go Premier',
    ctaHref: '/auth',
    features: [
      '2,000 songs per month',
      'MELAOS v5.5 + early access',
      'Lossless quality (FLAC)',
      'Full commercial rights',
      'Instant generation (no queue)',
      'Full DAW studio',
      'MIDI export',
      'Custom persona voices',
      'Stem separation (12 stems)',
      'API access (1,000 req/mo)',
      'Priority support',
    ],
    missing: [],
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  // Pill segmented control, like the ES/EN toggle in the menu: active = white.
  const segment = (active: boolean) =>
    `min-h-touch px-5 rounded-full flex items-center justify-center gap-2 text-sm font-semibold touch-manipulation transition-colors ${
      active ? 'bg-white text-[#08080A]' : 'text-fog hoverable:hover:text-white'
    }`;

  return (
    <div className="relative">
      {/* Soft brand light behind the title */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[440px] overflow-hidden">
        <div className="brand-glow left-1/2 -translate-x-1/2 -top-56 w-[min(900px,140vw)] h-[460px] opacity-50" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-safe md:px-8 py-6 sm:py-10">
        <div className="hidden sm:flex justify-end">
          <Link href="/studio" className="btn btn-ghost">
            <Plus className="w-4 h-4" strokeWidth={2} /> Create
          </Link>
        </div>

        {/* Header */}
        <header className="text-center sm:mt-2">
          <h1 className="display text-white text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
            Simple, <span className="text-brand">honest</span> pricing
          </h1>
          <p className="mt-4 mx-auto max-w-[34rem] text-fog text-base sm:text-[17px] leading-relaxed">
            Start free, scale when you're ready. No hidden fees. Cancel anytime.
          </p>

          {/* Annual toggle */}
          <div
            role="group"
            aria-label="Billing"
            className="mt-7 inline-flex items-center gap-1 rounded-full bg-ink-2 border border-line-soft p-1"
          >
            <button
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={segment(!annual)}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={segment(annual)}
            >
              Annual <span className={`tag ${annual ? 'bg-brand text-white' : 'tag-pink'}`}>save 20%</span>
            </button>
          </div>
        </header>

        {/* Plans: stacked on phones, three cards side by side from md up */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`flex flex-col ${
                tier.highlight
                  ? 'rounded-[20px] bg-brand p-[1.5px] shadow-[0_24px_60px_-24px_rgba(233,30,140,0.6)]'
                  : 'panel'
              }`}
            >
              <div
                className={`flex-1 flex flex-col p-6 md:p-5 lg:p-7 ${
                  tier.highlight
                    ? 'rounded-[18.5px] bg-ink-2 bg-[radial-gradient(120%_60%_at_50%_0%,rgba(233,30,140,0.14),transparent_70%)]'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 min-h-[28px]">
                  <h2 className="display text-white text-xl lg:text-2xl leading-tight">{tier.name}</h2>
                  {tier.badge && (
                    <span className={`tag ${tier.highlight ? 'tag-white' : 'tag-orange'}`}>{tier.badge}</span>
                  )}
                </div>
                {/* Min heights keep the prices level across the three cards */}
                <p className="mt-2 text-fog text-sm leading-relaxed md:min-h-[68px] xl:min-h-[46px]">{tier.description}</p>

                <div className="mt-6 flex items-end gap-1.5">
                  <p className="display flex items-start text-white leading-none tabular-nums">
                    <span className="mt-1 mr-0.5 text-2xl text-fog">$</span>
                    <span className="text-5xl lg:text-[56px]">{annual ? tier.price.annual : tier.price.monthly}</span>
                  </p>
                  {tier.price.monthly > 0 && (
                    <span className="pb-1 text-fog text-sm font-medium">/mo</span>
                  )}
                </div>
                {/* Fixed-height line so the buttons below don't jump when billing changes */}
                <div className="mt-2 h-5">
                  {annual && tier.price.monthly > 0 && (
                    <p className="text-sm font-medium text-melaos-orange tabular-nums">
                      Billed ${(annual ? tier.price.annual : tier.price.monthly) * 12}/year
                    </p>
                  )}
                </div>

                <Link
                  href={tier.ctaHref}
                  className={`btn w-full mt-5 !min-h-[48px] !px-4 ${tier.highlight ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {tier.cta}
                </Link>

                <ul className="mt-6 pt-6 flex-1 space-y-3 border-t border-line-soft">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm leading-snug text-[#E4E4EA]">
                      <span
                        aria-hidden
                        className={`mt-px w-[18px] h-[18px] shrink-0 rounded-full flex items-center justify-center ${
                          tier.highlight ? 'bg-brand text-white' : 'bg-white/10 text-white'
                        }`}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ teaser */}
        <p className="mt-8 sm:mt-10 mx-auto max-w-[60ch] text-center text-fog text-sm sm:text-[15px] leading-relaxed">
          All plans include access to MELAOS STUDIOS web DAW, community features, and public profile.{' '}
          <Link
            href="/auth"
            className="font-semibold text-[#ff7cc0] underline underline-offset-4 decoration-[#ff7cc0]/40 hoverable:hover:decoration-[#ff7cc0]"
          >
            Start for free today.
          </Link>
        </p>
      </div>
    </div>
  );
}
