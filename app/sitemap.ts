import type { MetadataRoute } from 'next';
import { site, absoluteUrl, languageAlternates } from '@/lib/site-config';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.indexable) return [];
  return ['/', '/id'].map(path => ({ url: absoluteUrl(path), alternates: { languages: languageAlternates() } }));
}
