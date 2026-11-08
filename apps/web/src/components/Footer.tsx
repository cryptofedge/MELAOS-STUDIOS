'use client';
import Link from 'next/link';
import { useT } from '@/lib/i18n';

// Site-wide footer — rendered from the root layout so every page carries
// the brand and ownership credits.
export default function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-[#1A1A1A] py-8 px-4 text-center text-gray-600 text-sm">
      <p>© 2026 <span className="text-[#F28C28]">MELAOS STUDIOS</span> · An <span className="text-[#AE06ED]">Eclat Universe</span> Brand · FEDGE 2.O</p>
      <p className="mt-2 text-gray-500">
        <span className="text-[#E91E8C]">Milciades "Melao" Holguin</span> · Rafael Fellito Rodriguez
      </p>
      <p className="mt-2 text-gray-700">{t('home.footer.tagline')}</p>
      {/* Google Play requires the privacy policy to be reachable from inside the app. */}
      <p className="mt-3">
        <Link href="/privacy" className="text-gray-500 hover:text-[#F28C28] underline underline-offset-2">
          {t('footer.privacy')}
        </Link>
      </p>
    </footer>
  );
}
