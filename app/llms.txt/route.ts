import { site } from '@/lib/site-config';
import { llmsText } from '@/lib/llms';
export const dynamic = 'force-static';
export function GET() {
  return new Response(llmsText(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...(!site.indexable ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}) } });
}
