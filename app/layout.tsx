import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const display = localFont({ src: './fonts/Montserrat.woff2', weight: '100 900', variable: '--font-display', display: 'swap' });
const body = localFont({ src: './fonts/SourceSans3.woff2', weight: '200 900', variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'AWSM — Good code. Great taste.',
  description: 'Give your coding agent design context, real assets, FigCraft handoff, and a second look at the UI. 23 typed tools. One local MCP.',
  openGraph: { title: 'AWSM — Good code. Great taste.', description: 'A toolkit for design-minded agents. Open source. Local-first.', type: 'website' },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>;
}
