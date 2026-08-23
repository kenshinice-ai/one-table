import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';

import tenantConfig from './src/generated/tenant-config.json';

initOpenNextCloudflareForDev();

/**
 * Whether this build is one nobody should find by searching.
 *
 * Read at build time from the compiled tenant, the same source the layout and
 * robots.txt read, so the three can never disagree.
 */
const unlisted = (tenantConfig as { unlisted?: boolean } | null)?.unlisted === true;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    if (!unlisted) return [];
    return [
      {
        source: '/:path*',
        headers: [
          /*
           * The header, not robots.txt, is what actually keeps an unlisted
           * build out of search. Cloudflare prepends its own managed robots.txt
           * ahead of ours, and its `User-agent: * / Allow: /` group merges with
           * our Disallow — where Google's rule is that the least restrictive
           * match wins, so our line alone cannot be relied on. X-Robots-Tag has
           * no such conflict, applies to every response rather than only
           * rendered HTML, and says the stronger thing: not "do not crawl" but
           * "do not index".
           */
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ];
  },
};

export default nextConfig;
