import { SiteDocument, siteViewport } from '@/components/site-document';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('en');
export const viewport = siteViewport;
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
