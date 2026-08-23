import type { MetadataRoute } from 'next';

import tenantConfig from '@/generated/tenant-config.json';
import type { TenantConfig } from '@/domain/venue';

/**
 * Keeps an unlisted build out of search results.
 *
 * The meta tag in the layout only reaches crawlers that render the page; this
 * reaches the ones that read robots.txt and stop. A demo that names a real
 * venue should be findable by the person holding the link and by nobody else,
 * so both doors are shut rather than one.
 */
export default function robots(): MetadataRoute.Robots {
  const tenant = tenantConfig as TenantConfig | null;
  if (tenant?.unlisted) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' } };
}
