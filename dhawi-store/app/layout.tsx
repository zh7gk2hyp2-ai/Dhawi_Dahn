import type { Metadata } from 'next';
import { Cormorant_Garamond, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// Cormorant Garamond — display/headings
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

// IBM Plex Mono — barcodes, codes, technical labels
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

// Alexandria is loaded via CSS @import (Google Fonts CDN) because
// next/font doesn't yet expose the Arabic subset for Alexandria.
// See globals.css for the @import rule.

export const metadata: Metadata = {
  title: {
    default: 'أتيلييه ضاوي | عطور العود الفاخرة',
    template: '%s | أتيلييه ضاوي',
  },
  description:
    'أتيلييه ضاوي — بيت عطور فاخر متخصص في عطور العود الأصيلة. ' +
    'تركيبات عربية راقية تجمع بين الموروث العطري والحساسية المعاصرة.',
  keywords: ['عطور', 'عود', 'بخور', 'أتيلييه ضاوي', 'عطور فاخرة', 'Saudi oud', 'perfume'],
  authors: [{ name: 'Atelier Dhawi' }],
  creator: 'Atelier Dhawi',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'أتيلييه ضاوي',
    title: 'أتيلييه ضاوي | عطور العود الفاخرة',
    description: 'بيت عطور فاخر متخصص في عطور العود الأصيلة.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#06040C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cormorant.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        {/* Alexandria — Arabic body font via Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-obsidian text-cream font-body antialiased min-h-screen">
        {/* Subtle noise texture overlay for depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
