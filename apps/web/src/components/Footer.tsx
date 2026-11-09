'use client';
import Link from 'next/link';
import { useT } from '@/lib/i18n';
import Emblem from '@/components/Emblem';

// Site-wide footer — rendered from the root layout so every page carries
// the brand and ownership credits.
export default function Footer() {
  const { t, lang } = useT();
  const es = lang === 'es';
  return (
    <footer className="mt-10 border-t border-line-soft">
      <div className="mx-auto max-w-[1280px] px-safe md:px-8 py-10 flex flex-col md:flex-row md:items-start gap-8">
        <div className="flex-1">
          <Emblem variant="wordmark" alt="MELAOS STUDIOS" className="h-8 w-auto" />
          <p className="mt-4 display text-lg sm:text-xl text-white max-w-sm leading-snug">{t('home.footer.tagline')}</p>
        </div>
        <div className="flex gap-10 text-sm">
          <div>
            <p className="label mb-2">{es ? 'Créditos' : 'Credits'}</p>
            <p className="leading-relaxed">
              <span className="text-melaos-pink font-medium">Milciades "Melao" Holguin</span><br />
              <span className="text-fog">Rafael Fellito Rodriguez</span>
            </p>
          </div>
          <div>
            <p className="label mb-2">Legal</p>
            {/* Google Play requires the privacy policy to be reachable from inside the app. */}
            <Link href="/privacy" className="text-fog underline underline-offset-4 decoration-white/20 hoverable:hover:text-white">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
      <p className="mx-auto max-w-[1280px] px-safe md:px-8 pb-8 text-[12px] text-fog-dim">
        © 2026 <span className="text-melaos-orange font-semibold">MELAOS STUDIOS</span> · An <span className="text-melaos-magenta font-semibold">Eclat Universe</span> Brand · FEDGE 2.O
      </p>
    </footer>
  );
}
