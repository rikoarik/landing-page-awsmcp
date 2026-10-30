export const PRODUCTION_ORIGIN = 'https://useawsm.web.id';

/** Canonicals are configured, never inferred from an untrusted request host. */
export function getSiteConfig(env: Record<string, string | undefined> = process.env) {
  const raw = env.SITE_URL ?? PRODUCTION_ORIGIN;
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error('SITE_URL must be an absolute HTTP(S) origin.'); }
  if (!/^https?:\/\/[^/?#]+\/?$/i.test(raw) || !['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash || raw.trim() !== raw || /[?#\\\s]/.test(raw) || /^(localhost|127\.|0\.|\[::1\]$)/i.test(url.hostname) || url.hostname.endsWith('.localhost')) {
    throw new Error('SITE_URL must be a public HTTP(S) origin without credentials, path, query or fragment; localhost canonicals are not allowed.');
  }
  if (env.SITE_INDEXABLE && !['true', 'false'].includes(env.SITE_INDEXABLE)) throw new Error('SITE_INDEXABLE must be true or false.');
  return {
    origin: url.origin,
    indexable: env.VERCEL_ENV !== 'preview' && env.SITE_INDEXABLE !== 'false',
    googleVerification: env.GOOGLE_SITE_VERIFICATION?.trim() || 'SkWS9P140S5JIylgkVzrSNzP3s4OgZo-XN8DSd0OZAY',
    bingVerification: env.BING_SITE_VERIFICATION?.trim() || undefined,
  };
}
export const site = getSiteConfig();
export type Locale = 'en' | 'id';
export const localePath = (locale: Locale) => locale === 'id' ? '/id' : '/';
export const absoluteUrl = (path: string, origin = site.origin) => new URL(path, `${origin}/`).href;
export const languageAlternates = (origin = site.origin) => ({ en: absoluteUrl('/', origin), id: absoluteUrl('/id', origin), 'x-default': absoluteUrl('/', origin) });

/** A pure helper shared by the narrow proxy and regression tests. */
export function legacyLocaleRedirect(input: string): URL | null {
  const url = new URL(input);
  if (!['/', '/id'].includes(url.pathname) || !url.searchParams.has('lang')) return null;
  const locale = url.searchParams.get('lang');
  if (locale === 'en' || locale === 'id') url.pathname = localePath(locale);
  // Unknown lang values also canonicalize to the current route, without a loop.
  url.searchParams.delete('lang');
  return url;
}
