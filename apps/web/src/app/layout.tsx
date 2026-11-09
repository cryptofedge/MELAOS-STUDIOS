import type { Metadata, Viewport } from 'next';
// Fonts ship inside the app (Fontsource packages), so neither the build nor
// a visitor's device ever has to reach Google Fonts. Each file covers one
// script; browsers download only the ones a page actually uses.
import '@fontsource-variable/unbounded';
import '@fontsource/ibm-plex-sans/300.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import AudioPlayer from '@/components/AudioPlayer';
import MelaoAgent from '@/components/MelaoAgent';
import OnboardingTour from '@/components/OnboardingTour';
import Footer from '@/components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // Draw under the notch / Dynamic Island / Android cutout and the home
  // indicator; the layout pads itself with the safe-area insets instead.
  viewportFit: 'cover',
  themeColor: '#050507',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  // Absolute base URL — without this Next emits relative og:image paths,
  // which WhatsApp/iMessage/X silently ignore, so shared links showed no
  // logo preview at all.
  metadataBase: new URL('https://melaosstudios.com'),
  title: 'MELAOS STUDIOS — Donde el Sonido Encuentra el Alma',
  description: 'Crea, descubre y comparte música hecha con IA. Crea cualquier canción que imagines. Make any song you can imagine.',
  keywords: ['música IA', 'generador de música', 'AI music', 'beats', 'MELAOS', 'crear música', 'dembow', 'bachata'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MELAOS STUDIOS',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'MELAOS STUDIOS — Donde el Sonido Encuentra el Alma',
    description: 'Crea, descubre y comparte música hecha con IA. Crea cualquier canción que imagines.',
    type: 'website',
    url: 'https://melaosstudios.com',
    siteName: 'MELAOS STUDIOS',
    locale: 'es_US',
    images: [{ url: '/og-image.png', width: 2400, height: 1339, alt: 'MELAOS STUDIOS — Donde el Sonido Encuentra el Alma' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MELAOS STUDIOS — Donde el Sonido Encuentra el Alma',
    description: 'Crea, descubre y comparte música hecha con IA. Crea cualquier canción que imagines.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-ink-0 text-[#ECECF1] font-sans antialiased">
        <Navbar />
        <main className="min-h-dvh-safe" style={{ paddingTop: 'var(--nav-h)', paddingBottom: 'var(--player-h)' }}>
          {children}
          <Footer />
        </main>
        <AudioPlayer />
        <MelaoAgent />
        <OnboardingTour />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
