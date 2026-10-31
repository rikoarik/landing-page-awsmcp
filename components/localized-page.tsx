import { AwsmSite } from './awsm-site';
import { serializeJsonLd, structuredData } from '@/lib/seo';
import type { Locale } from '@/lib/site-config';

export function LocalizedPage({ locale }: { locale: Locale }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData(locale)) }} />
      <AwsmSite lang={locale} />
    </>
  );
}
