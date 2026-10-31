import type { Metadata } from 'next';
import { absoluteUrl, languageAlternates, localePath, site, type Locale } from './site-config.ts';
import { seoCopy, sources, supportedClients } from './seo-content.ts';

export function pageMetadata(locale: Locale): Metadata {
  const copy = seoCopy[locale];
  const url = absoluteUrl(localePath(locale));
  const image = { url: absoluteUrl(`/social/awsm-${locale}.png`), width: 1200, height: 630, type: 'image/png', alt: locale === 'en' ? 'AWSM: local MCP, design context to interface. 24 typed tools, SolidCraft 3D.' : 'AWSM: MCP lokal, dari konteks desain ke antarmuka. 24 tool bertipe, 3D SolidCraft.' };
  return {
    metadataBase: new URL(site.origin), title: copy.title, description: copy.description, applicationName: 'AWSM',
    alternates: { canonical: url, languages: languageAlternates() },
    robots: { index: site.indexable, follow: site.indexable },
    verification: { google: site.googleVerification, other: site.bingVerification ? { 'msvalidate.01': site.bingVerification } : undefined },
    openGraph: { type: 'website', title: copy.title, description: copy.description, url, siteName: 'AWSM', locale: locale === 'en' ? 'en_US' : 'id_ID', alternateLocale: locale === 'en' ? ['id_ID'] : ['en_US'], images: [image] },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description, images: [{ url: image.url, alt: image.alt }] },
  };
}

export function structuredData(locale: Locale) {
  const copy = seoCopy[locale];
  const url = absoluteUrl(localePath(locale));
  const website = absoluteUrl('/#website');
  const software = absoluteUrl('/#software');
  const application = absoluteUrl('/#application');
  const author = absoluteUrl('/#author');
  const webpage = `${url}#webpage`;
  const faq = `${url}#faq`;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': website, name: 'AWSM', url: absoluteUrl('/'), inLanguage: ['en', 'id'], about: { '@id': software }, author: { '@id': author } },
    { '@type': 'Person', '@id': author, name: 'rikoarik', url: 'https://github.com/rikoarik' },
    { '@type': 'SoftwareSourceCode', '@id': software, name: 'AWSM', description: copy.definition, codeRepository: sources.repository, url: sources.repository, sameAs: [sources.repository], license: sources.license, runtimePlatform: 'Node.js 18+', isAccessibleForFree: true, author: { '@id': author }, targetProduct: { '@id': application }, keywords: supportedClients.join(', ') },
    { '@type': 'SoftwareApplication', '@id': application, name: 'AWSM', description: copy.definition, applicationCategory: 'DeveloperApplication', softwareRequirements: 'Node.js 18+, npx and an MCP-compatible coding agent', runtimePlatform: 'Node.js 18+', url: absoluteUrl('/'), installUrl: sources.install, sameAs: [sources.repository], license: sources.license, isAccessibleForFree: true, author: { '@id': author }, subjectOf: { '@id': webpage } },
    { '@type': 'WebPage', '@id': webpage, name: copy.title, description: copy.description, url, inLanguage: locale, isPartOf: { '@id': website }, about: { '@id': software }, hasPart: { '@id': faq }, isAccessibleForFree: true },
    { '@type': 'FAQPage', '@id': faq, url: `${url}#faq`, inLanguage: locale, isPartOf: { '@id': webpage }, about: { '@id': software }, mainEntity: copy.faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer, citation: item.source } })) },
  ] };
}
export const serializeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
