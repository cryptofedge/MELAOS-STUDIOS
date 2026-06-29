'use client';
import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
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
      '10 songs per day',
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

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4">
          Simple, <span className="gradient-text">honest</span> pricing
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-8">
          Start free, scale when you're ready. No hidden fees. Cancel anytime.
        </p>

        {/* Annual toggle */}
        <div className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#333] rounded-full p-1">
          <button
            onClick={() => setAnnual(false)}
            style={{ minHeight: '44px', touchAction: 'manipulation' }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? 'bg-[#F28C28] text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{ minHeight: '44px', touchAction: 'manipulation' }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? 'bg-[#F28C28] text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Annual <span className="text-xs font-normal opacity-80">save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards — stacked on mobile, 3-col on md+ */}
      <div className="flex flex-col md:flex-row gap-6">
        {tiers.map(tier => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-6 sm:p-7 flex flex-col transition-all flex-1 ${
              tier.highlight
                ? 'border-2 border-[#F28C28] bg-gradient-to-b from-[#F28C28]/10 to-[#1A1A1A] shadow-[0_0_40px_rgba(242,140,40,0.2)]'
                : 'border border-[#333] bg-[#1A1A1A]'
            }`}
          >
            {tier.badge && (
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                tier.highlight ? 'bg-[#F28C28] text-white' : 'bg-[#333] text-gray-300'
              }`}>
                {tier.badge}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-black text-white mb-1">{tier.name}</h2>
              <p className="text-gray-500 text-sm">{tier.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-black text-white">
                ${annual ? tier.price.annual : tier.price.monthly}
              </span>
              {tier.price.monthly > 0 && (
                <span className="text-gray-500 text-sm ml-1">/mo</span>
              )}
              {annual && tier.price.monthly > 0 && (
                <div className="text-xs text-[#F28C28] mt-1">
                  Billed ${(annual ? tier.price.annual : tier.price.monthly) * 12}/year
                </div>
              )}
            </div>

            <Link
              href={tier.ctaHref}
              style={{ minHeight: '48px', touchAction: 'manipulation' }}
              className={`w-full py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center mb-6 transition-all hover:scale-105 ${
                tier.highlight
                  ? 'btn-orange text-white'
                  : 'border border-[#333] text-gray-300 hover:border-[#555] hover:text-white'
              }`}
            >
              {tier.cta}
            </Link>

            <ul className="space-y-3 flex-1">
              {tier.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ teaser */}
      <div className="mt-12 sm:mt-16 text-center">
        <p className="text-gray-500 text-sm">
          All plans include access to MELAOS STUDIOS web DAW, community features, and public profile.{' '}
          <Link href="/auth" className="text-[#F28C28] hover:underline">Start for free today.</Link>
        </p>
      </div>
    </div>
  );
}
