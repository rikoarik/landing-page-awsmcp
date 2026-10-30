import type { NextConfig } from 'next';
import { site } from './lib/site-config.ts';
const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: { globalNotFound: true },
  async headers() {
    return site.indexable ? [] : [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};
export default nextConfig;
