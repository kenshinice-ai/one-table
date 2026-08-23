import type { MetadataRoute } from 'next';

import tenantConfig from '@/generated/tenant-config.json';
import type { TenantConfig } from '@/domain/venue';

/**
 * Keeps an unlisted build out of search results.
 *
 * The weakest of the three signals, and deliberately still here. Cloudflare
 * prepends its own managed robots.txt with a `User-agent: * / Allow: /` group,
 * and a crawler merging both groups may take the least restrictive match — so
 * this line asks, it does not enforce. The noindex meta tag in the layout and
 * the X-Robots-Tag header in next.config.ts are what actually keep an unlisted
 * build out of search results; a header cannot be overridden by a file the CDN
 * wrote first, and it covers responses that are never rendered.
 */
export default function robots(): MetadataRoute.Robots {
  const tenant = tenantConfig as TenantConfig | null;
  if (tenant?.unlisted) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' } };
}
