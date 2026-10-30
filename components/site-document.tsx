import localFont from 'next/font/local';
import type { Viewport } from 'next';
import { absoluteUrl, type Locale } from '@/lib/site-config';
import '@/app/globals.css';

const display = localFont({ src: '../app/fonts/Montserrat.woff2', weight: '100 900', variable: '--font-display', display: 'swap' });
const body = localFont({ src: '../app/fonts/SourceSans3.woff2', weight: '200 900', variable: '--font-body', display: 'swap' });
export const siteViewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F4F34C' };
export function SiteDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <html lang={locale} className={`${display.variable} ${body.variable}`}><head><link rel="ard" type="application/json" href={absoluteUrl('/.well-known/ard.json')}/></head><body>{children}</body></html>;
}
