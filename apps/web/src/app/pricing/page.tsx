'use client';
import { useState } from 'react';
import { Check, Zap, Plus } from 'lucide-react';
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

  // Segmented control, built like the ES/EN toggle in the top bar.
  const segment = (active: boolean) =>
    `flex-1 sm:flex-none min-h-touch px-4 sm:px-5 flex items-center justify-center gap-2 touch-manipulation transition-colors ${
      active ? 'bg-ink-3 text-melaos-orange' : 'text-fog-dim hoverable:hover:text-white'
    }`;

  return (
    <div className="mx-auto max-w-[1440px] px-safe md:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
      {/* Header */}
      <header className="border-b border-line-soft pb-8 sm:pb-10">
        <div className="flex items-center justify-between gap-4 min-h-touch">
          <p className="label">01 — Plans</p>
          <Link href="/studio" className="hidden sm:inline-flex btn btn-ghost">
            <Plus className="w-4 h-4" strokeWidth={1.75} /> Create
          </Link>
        </div>

        <div className="mt-4 sm:mt-6 grid lg:grid-cols-12 gap-6 lg:gap-8 items-end">
          <h1 className="lg:col-span-7 display font-light text-white leading-[1.02] text-[clamp(2.1rem,6.4vw,4rem)]">
            Simple, <span className="font-medium text-melaos-orange">honest</span> pricing
          </h1>
          <div className="lg:col-span-5 flex flex-col items-start gap-6">
            <p className="text-fog text-base sm:text-[17px] leading-relaxed max-w-[34rem]">
              Start free, scale when you're ready. No hidden fees. Cancel anytime.
            </p>

            {/* Annual toggle */}
            <div className="flex w-full sm:w-auto border border-line rounded-xs overflow-hidden font-mono text-[11px] tracking-[0.14em] uppercase">
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
                className={`${segment(annual)} border-l border-line`}
              >
                Annual <span className={`text-[10px] tracking-[0.1em] ${annual ? 'text-melaos-orange/70' : 'text-fog-faint'}`}>save 20%</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tier sheet: stacked on phones, three ruled columns from md up */}
      <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-line-soft border border-line-soft">
        {tiers.map((tier, i) => (
          <div
            key={tier.name}
            className={`relative flex flex-col p-6 md:p-5 lg:p-8 ${tier.highlight ? 'bg-ink-1' : 'bg-ink-0'}`}
          >
            {/* Highlighted tier: an orange rule laid over the column's top edge */}
            {tier.highlight && <span className="absolute -top-px -inset-x-px h-[2px] bg-melaos-orange" aria-hidden />}

            <div className="flex items-center justify-between gap-3 h-4">
              <span className="font-mono text-[11px] text-fog-dim tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              {tier.badge && (
                <span className={`label flex items-center gap-2 ${tier.highlight ? '!text-melaos-orange' : ''}`}>
                  {tier.highlight && <span className="inline-block w-4 h-px bg-melaos-orange" aria-hidden />}
                  {tier.badge}
                </span>
              )}
            </div>

            <div className="mt-8">
              <h2 className="display font-light text-white text-2xl lg:text-[28px] leading-tight">{tier.name}</h2>
              {/* Min heights keep the price rows level across the three columns */}
              <p className="mt-2 text-fog text-sm leading-relaxed md:min-h-[68px] lg:min-h-[46px]">{tier.description}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-line-soft">
              <div className="flex items-baseline gap-2">
                <span className="display font-light text-white leading-none tabular-nums text-[clamp(2.75rem,5vw,3.75rem)]">
                  <span className="text-fog text-[0.5em] align-top mr-0.5">$</span>{annual ? tier.price.annual : tier.price.monthly}
                </span>
                {tier.price.monthly > 0 && (
                  <span className="label">/mo</span>
                )}
              </div>
              {/* Fixed-height line so the buttons below don't jump when billing changes */}
              <div className="mt-3 h-4">
                {annual && tier.price.monthly > 0 && (
                  <div className="label !text-melaos-orange tabular-nums">
                    Billed ${(annual ? tier.price.annual : tier.price.monthly) * 12}/year
                  </div>
                )}
              </div>
            </div>

            <Link
              href={tier.ctaHref}
              className={`btn w-full mt-6 !min-h-[48px] !px-4 ${tier.highlight ? 'btn-primary' : 'btn-ghost'}`}
            >
              {tier.cta}
            </Link>

            <ul className="mt-8 flex-1 border-t border-line-soft divide-y divide-line-soft">
              {tier.features.map(f => (
                <li key={f} className="flex items-start gap-3 py-3 text-sm leading-snug text-[#ECECF1]/90">
                  <Check className="w-4 h-4 text-melaos-orange mt-px shrink-0" strokeWidth={1.75} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ teaser */}
      <div className="mt-8 sm:mt-10">
        <p className="text-fog text-sm sm:text-[15px] leading-relaxed max-w-[68ch]">
          All plans include access to MELAOS STUDIOS web DAW, community features, and public profile.{' '}
          <Link href="/auth" className="text-melaos-orange underline underline-offset-4 decoration-melaos-orange/40 hoverable:hover:decoration-melaos-orange">Start for free today.</Link>
        </p>
      </div>
    </div>
  );
}
