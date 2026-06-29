import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import AudioPlayer from '@/components/AudioPlayer';

export const metadata: Metadata = {
  title: 'MELAOS STUDIOS — Where Sound Meets Soul',
  description: 'Create, discover, and share AI-powered music with MELAOS STUDIOS. Make any song you can imagine.',
  keywords: ['AI music', 'music generator', 'beats', 'MELAOS', 'create music'],
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
      </body>
    </html>
  );
}
