import localFont from 'next/font/local';
import type { Viewport } from 'next';
import { absoluteUrl, type Locale } from '@/lib/site-config';
import '@/app/globals.css';

/**
 * Archivo carries the frame's Helvetica Neue Condensed Black via its `wdth`
 * axis; IBM Plex Mono stands in for Menlo. Both are self-hosted (OFL), so the
 * page makes no third-party font request.
 */
const sans = localFont({
  src: '../app/fonts/archivo-latin.woff2',
  weight: '100 900',
  variable: '--font-archivo',
  display: 'swap',
  adjustFontFallback: false,
});
const mono = localFont({
  src: [
    { path: '../app/fonts/plexmono-latin-400.woff2', weight: '400', style: 'normal' },
    { path: '../app/fonts/plexmono-latin-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-plex',
  display: 'swap',
  adjustFontFallback: false,
});

export const siteViewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F2EFE6' };

export function SiteDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`}>
      <head>
        <link rel="ard" type="application/json" href={absoluteUrl('/.well-known/ard.json')} />
      </head>
      <body>{children}</body>
    </html>
  );
}
