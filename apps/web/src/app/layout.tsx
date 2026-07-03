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
  title: 'MELAOS STUDIOS — Where Sound Meets Soul',
  description: 'Create, discover, and share AI-powered music with MELAOS STUDIOS. Make any song you can imagine.',
  keywords: ['AI music', 'music generator', 'beats', 'MELAOS', 'create music'],
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
    title: 'MELAOS STUDIOS — Where Sound Meets Soul',
    description: 'Create, discover, and share AI-powered music. Make any song you can imagine.',
    type: 'website',
    url: 'https://melaosstudios.com',
    siteName: 'MELAOS STUDIOS',
    images: [{ url: '/og-image.png', width: 2400, height: 1339, alt: 'MELAOS STUDIOS — Where Sound Meets Soul' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MELAOS STUDIOS — Where Sound Meets Soul',
    description: 'Create, discover, and share AI-powered music. Make any song you can imagine.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
