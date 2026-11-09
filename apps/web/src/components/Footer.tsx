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
    <footer className="border-t border-line-soft">
      <div className="mx-auto max-w-[1440px] px-safe md:px-8 py-12 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <Emblem variant="wordmark" alt="MELAOS STUDIOS" className="h-8 w-auto" />
          <p className="mt-5 display font-light text-xl sm:text-2xl text-white max-w-md leading-snug">{t('home.footer.tagline')}</p>
        </div>
        <div className="md:col-span-4">
          <p className="label mb-3">{es ? 'Créditos' : 'Credits'}</p>
          <p className="text-sm leading-relaxed">
            <span className="text-melaos-pink">Milciades "Melao" Holguin</span><br />
            <span className="text-fog">Rafael Fellito Rodriguez</span>
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="label mb-3">Legal</p>
          {/* Google Play requires the privacy policy to be reachable from inside the app. */}
          <Link href="/privacy" className="text-sm text-fog underline underline-offset-4 decoration-line-strong hoverable:hover:text-melaos-orange hoverable:hover:decoration-melaos-orange">
            {t('footer.privacy')}
          </Link>
        </div>
      </div>
      <div className="border-t border-line-soft">
        <p className="mx-auto max-w-[1440px] px-safe md:px-8 py-4 label normal-case tracking-[0.06em] !text-[11px]">
          © 2026 <span className="text-melaos-orange">MELAOS STUDIOS</span> · An <span className="text-melaos-magenta">Eclat Universe</span> Brand · FEDGE 2.O
        </p>
      </div>
    </footer>
  );
}
