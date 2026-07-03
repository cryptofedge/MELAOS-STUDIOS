import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import AudioPlayer from '@/components/AudioPlayer';
import MelaoAgent from '@/components/MelaoAgent';
import OnboardingTour from '@/components/OnboardingTour';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0A',
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
      <body className="bg-[#0A0A0A] text-white font-sans antialiased">
        <Navbar />
        <main className="pt-16 pb-20 min-h-screen">
          {children}
        </main>
        <AudioPlayer />
        <MelaoAgent />
        <OnboardingTour />
      </body>
    </html>
  );
}
