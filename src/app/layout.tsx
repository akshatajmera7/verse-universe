import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport = {
  themeColor: '#030712',
};

export const metadata: Metadata = {
  title: 'Verse Universe — 3D YouTube & YouTube Music Listening Universe',
  description:
    'Transform your YouTube and YouTube Music history into an interactive, navigable 3D galaxy of artist planets and song stars.',
  keywords: [
    'YouTube Music',
    '3D visualization',
    'Three.js',
    'Music Universe',
    'Google Takeout',
    'Listening History',
  ],
  authors: [{ name: 'Verse Universe Team' }],
  openGraph: {
    title: 'Verse Universe — 3D YouTube & YouTube Music Universe',
    description:
      'Transform your YouTube and YouTube Music history into an interactive 3D universe of artist planets and song stars.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#030712] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
