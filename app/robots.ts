import type { MetadataRoute } from 'next';
import { site, absoluteUrl } from '@/lib/site-config';
export default function robots(): MetadataRoute.Robots {
  return site.indexable ? { rules: { userAgent: '*', allow: '/' }, sitemap: absoluteUrl('/sitemap.xml') } : { rules: { userAgent: '*', disallow: '/' } };
}
