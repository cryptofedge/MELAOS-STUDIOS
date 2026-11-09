import type { Metadata, Viewport } from 'next';
// The font ships inside the app (Fontsource), so neither the build nor a
// visitor's device ever has to reach Google Fonts. Sora is variable: one
// file per script covers every weight.
import '@fontsource-variable/sora';
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
  themeColor: '#08080A',
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
      <body className="bg-ink-0 text-[#F4F4F6] font-sans antialiased">
        {/* Phones/tablets: top bar + bottom tab bar. Computers: side menu. */}
        <Navbar />
        <main
          className="min-h-dvh-safe"
          style={{ paddingTop: 'var(--nav-h)', paddingBottom: 'var(--chrome-bottom)', paddingLeft: 'var(--side-w)' }}
        >
          {/* On computers the page sits on a rounded panel beside the menu. */}
          <div className="relative overflow-clip lg:my-2.5 lg:mr-2.5 lg:rounded-panel lg:bg-ink-1 lg:min-h-[calc(100dvh_-_20px_-_var(--chrome-bottom))]">
            {children}
            <Footer />
          </div>
        </main>
        <AudioPlayer />
        <MelaoAgent />
        <OnboardingTour />
      </body>
    </html>
  );
}
