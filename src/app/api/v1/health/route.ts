import { NextResponse } from 'next/server';

import { getRuntimeEnv } from '@/server/cloudflare/context';

export const runtime = 'nodejs';

export async function GET() {
  const env = await getRuntimeEnv();

  return NextResponse.json({
    ok: true,
    service: 'menu-planning-companion',
    environment: env.APP_ENV,
    database: Boolean(env.DB),
    mediaBucket: Boolean(env.MEDIA_BUCKET),
  });
}

