import { NextRequest, NextResponse } from 'next/server';

import { listLaunchRecipes } from '@/domain/launch-catalog';
import { getRuntimeEnv } from '@/server/cloudflare/context';
import { D1RecipeRepository } from '@/server/repositories/d1/recipe-repository';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const env = await getRuntimeEnv();
  const locale = request.nextUrl.searchParams.get('locale') === 'en-AU' ? 'en-AU' : 'zh-CN';
  const query = request.nextUrl.searchParams.get('q')?.trim();
  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') ?? 24);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 24;

  if (!env.DB) {
    return NextResponse.json({ data: listLaunchRecipes(locale, limit, query) });
  }

  const repository = new D1RecipeRepository(env.DB);
  const recipes = query
    ? await repository.searchPublished(query, locale, limit)
    : await repository.listPublished(locale, limit);

  return NextResponse.json({ data: recipes });
}
