import { absoluteUrl, site } from '@/lib/site-config';
import { seoCopy, sources } from '@/lib/seo-content';
export const dynamic = 'force-static';
export function GET() {
  const copy = seoCopy.en;
  const text = `# AWSM\n\n> ${copy.definition}\n\n${copy.facts.map(([label, value]) => `- ${label}: ${value}`).join('\n')}\n\nThis file is an optional inference discovery aid using an emerging convention. It is not a requirement for indexing, a training or crawl permission policy, or a guarantee of search visibility or AI citations.\n\n## Pages and sources\n- [English](${absoluteUrl('/')})\n- [Bahasa Indonesia](${absoluteUrl('/id')})\n- [Product README](${sources.readme})\n- [Installation](${sources.install})\n- [Source code](${sources.repository})\n- [MIT license](${sources.license})\n- [FigCraft app](${sources.figcraft})\n\n## Product limits and guidance\n- [FigCraft handoff boundaries](${sources.readme}): AWSM does not edit the canvas; native FigCraft MCP editing is separate.\n- [Browser QA requirements](${sources.readme}): Local Playwright and Chromium provide evidence, not WCAG certification.\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...(!site.indexable ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}) } });
}
