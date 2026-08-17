import { NextResponse } from 'next/server';

import { getCloudflareContext } from '@opennextjs/cloudflare';

import tenantConfig from '@/generated/tenant-config.json';

export const runtime = 'nodejs';

/**
 * Anonymous usage beacon — the approved exception to the dormant-API red line.
 *
 * It is a stateless counter and nothing more: no cookies, no identifiers, no
 * reads, no D1. Each accepted event becomes one Analytics Engine data point,
 * which is what a campaign closing report aggregates. The event vocabulary is a
 * closed set so the endpoint cannot be repurposed as a data channel.
 */
const EVENTS = new Set(['scan', 'compose', 'list', 'route']);

const tenantId = (tenantConfig as { id?: string } | null)?.id ?? 'public';

type EventsDataset = {
  writeDataPoint: (point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }) => void;
};

export async function POST(request: Request) {
  let event = '';
  try {
    const body = (await request.json()) as { event?: unknown };
    event = String(body.event ?? '');
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!EVENTS.has(event)) return new NextResponse(null, { status: 400 });

  const { env } = await getCloudflareContext({ async: true });
  const runtimeEnv = env as { ONETABLE_EVENTS?: EventsDataset; APP_ENV?: string };
  // Local dev runs without the binding; counting is best-effort by design.
  runtimeEnv.ONETABLE_EVENTS?.writeDataPoint({
    blobs: [event, tenantId, runtimeEnv.APP_ENV ?? 'development'],
    doubles: [1],
    indexes: [tenantId],
  });

  return new NextResponse(null, { status: 204 });
}
