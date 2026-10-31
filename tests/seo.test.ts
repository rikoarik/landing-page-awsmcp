import test from 'node:test';
import assert from 'node:assert/strict';
import { getSiteConfig, absoluteUrl, languageAlternates, legacyLocaleRedirect, PRODUCTION_ORIGIN } from '../lib/site-config.ts';
import { pageMetadata, structuredData, serializeJsonLd } from '../lib/seo.ts';
import { seoCopy, sources } from '../lib/seo-content.ts';
import { ardManifest } from '../lib/agent-discovery.ts';

test('confirmed apex origin and strict config validation', () => {
  assert.equal(PRODUCTION_ORIGIN, 'https://useawsm.web.id');
  assert.equal(getSiteConfig({}).origin, PRODUCTION_ORIGIN);
  for (const SITE_URL of ['ftp://example.com', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com/?x=1', 'https://example.com/#x', 'https://localhost:3001', 'http://127.0.0.1', 'not-a-url', ' https://example.com', 'https://example.com?']) assert.throws(() => getSiteConfig({ SITE_URL }));
  assert.equal(getSiteConfig({ SITE_URL: 'https://example.org/' }).origin, 'https://example.org');
  assert.equal(getSiteConfig({ SITE_URL: 'http://example.org' }).origin, 'http://example.org');
  assert.throws(() => getSiteConfig({ SITE_INDEXABLE: 'yes' }));
});
test('preview indexing is opt-out and cannot be overridden on Vercel preview', () => {
  assert.equal(getSiteConfig({}).indexable, true);
  assert.equal(getSiteConfig({ SITE_INDEXABLE: 'false' }).indexable, false);
  assert.equal(getSiteConfig({ VERCEL_ENV: 'preview', SITE_INDEXABLE: 'true' }).indexable, false);
  assert.equal(getSiteConfig({}).bingVerification, undefined);
  assert.equal(getSiteConfig({ GOOGLE_SITE_VERIFICATION: 'custom', BING_SITE_VERIFICATION: 'bing' }).googleVerification, 'custom');
  assert.equal(getSiteConfig({ BING_SITE_VERIFICATION: 'bing' }).bingVerification, 'bing');
  assert.equal(getSiteConfig({}).googleVerification, 'SkWS9P140S5JIylgkVzrSNzP3s4OgZo-XN8DSd0OZAY');
});
test('reciprocal URLs and canonical metadata', () => {
  assert.deepEqual(languageAlternates(), { en: `${PRODUCTION_ORIGIN}/`, id: `${PRODUCTION_ORIGIN}/id`, 'x-default': `${PRODUCTION_ORIGIN}/` });
  assert.equal(absoluteUrl('/social/awsm-id.png'), `${PRODUCTION_ORIGIN}/social/awsm-id.png`);
  for (const locale of ['en', 'id'] as const) {
    const meta = pageMetadata(locale);
    assert.equal(meta.title, seoCopy[locale].title);
    assert.equal(meta.description, seoCopy[locale].description);
    assert.equal(meta.alternates?.canonical, `${PRODUCTION_ORIGIN}${locale === 'en' ? '/' : '/id'}`);
    assert.deepEqual(meta.alternates?.languages, languageAlternates());
  }
});
test('legacy redirects strip lang, preserve other query/hash, never loop', () => {
  for (const path of ['/', '/id']) for (const lang of ['en', 'id', 'bogus']) {
    const result = legacyLocaleRedirect(`https://example.com${path}?lang=${lang}&utm_source=test#install`)!;
    assert.equal(result.pathname, lang === 'en' ? '/' : lang === 'id' ? '/id' : path);
    assert.equal(result.search, '?utm_source=test');
    assert.equal(result.hash, '#install');
    assert.equal(legacyLocaleRedirect(result.href), null);
  }
  assert.equal(legacyLocaleRedirect('https://example.com/missing?lang=id'), null);
});
test('localized connected JSON-LD uses visible FAQ data and honest product identity', () => {
  for (const locale of ['en', 'id'] as const) {
    const graph = structuredData(locale)['@graph'];
    const ids = new Set(graph.map(node => node['@id']));
    assert.equal(ids.size, graph.length);
    const source = graph.find(node => node['@type'] === 'SoftwareSourceCode')!;
    assert.equal(source.codeRepository, sources.repository);
    assert.equal(source.runtimePlatform, 'Node.js 18+');
    const application = graph.find(node => node['@type'] === 'SoftwareApplication')!;
    assert.equal(application.applicationCategory, 'DeveloperApplication');
    assert.equal(application.softwareRequirements, 'Node.js 18+, npx and an MCP-compatible coding agent');
    assert.equal(application.installUrl, sources.install);
    assert.equal(application.description, seoCopy[locale].definition);
    assert.equal(application.isAccessibleForFree, true);
    assert.deepEqual(source.targetProduct, { '@id': application['@id'] });
    assert.ok(!('softwareVersion' in application) && !('offers' in application) && !('requirements' in application) && !('downloadUrl' in application));
    const faq = graph.find(node => node['@type'] === 'FAQPage')!;
    assert.equal(faq.mainEntity!.length, seoCopy[locale].faqs.length);
    assert.deepEqual(faq.mainEntity!.map(item => [item.name, item.acceptedAnswer.text]), seoCopy[locale].faqs.map(item => [item.question, item.answer]));
    const encoded = JSON.stringify(graph);
    assert.ok(!/aggregateRating|SearchAction|LocalBusiness|geocoordinates|landing-page-awsmcp/.test(encoded));
    // All internal @id references point to nodes in this graph.
    const visit = (value: unknown): void => {
      if (!value || typeof value !== 'object') return;
      if ('@id' in value) assert.ok(ids.has((value as { '@id': string })['@id']));
      for (const child of Object.values(value)) if (Array.isArray(child)) child.forEach(visit); else visit(child);
    };
    graph.forEach(visit);
  }
});
test('ARD advertises only the actual upstream Markdown skill, not execution or trust', () => {
  const entry = ardManifest().entries[0];
  assert.equal(entry.identifier, 'urn:air:useawsm.web.id:skill:awsm-design');
  assert.equal(entry.type, 'application/agent-skills+md');
  assert.equal(entry.url, 'https://raw.githubusercontent.com/rikoarik/artcraft-mcp-awsm/main/skills/awsm-design/SKILL.md');
  assert.ok(!('data' in entry) && !('trustManifest' in entry));
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
});
test('JSON-LD serialization cannot close its script element', () => {
  const input = { text: '</script><script>alert(1)</script>' };
  const serialized = serializeJsonLd(input);
  assert.ok(!serialized.includes('<'));
  assert.deepEqual(JSON.parse(serialized), input);
});
