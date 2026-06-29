import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import AudioPlayer from '@/components/AudioPlayer';
import MelaoAgent from '@/components/MelaoAgent';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0A',
};

export const metadata: Metadata = {
  title: 'MELAOS STUDIOS — Where Sound Meets Soul',
  description: 'Create, discover, and share AI-powered music with MELAOS STUDIOS. Make any song you can imagine.',
  keywords: ['AI music', 'music generator', 'beats', 'MELAOS', 'create music'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MELAOS STUDIOS',
  },
  openGraph: {
    title: 'MELAOS STUDIOS',
    description: 'Where Sound Meets Soul',
    type: 'website',
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
      </body>
    </html>
  );
}
