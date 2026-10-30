import { SiteDocument, siteViewport } from '@/components/site-document';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('id');
export const viewport = siteViewport;
export default function IndonesianLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="id">{children}</SiteDocument>;
}
