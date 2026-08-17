import { NextResponse } from 'next/server';

import { findLaunchRecipe } from '@/domain/launch-catalog';
import { getRuntimeEnv } from '@/server/cloudflare/context';
import { D1RecipeRepository } from '@/server/repositories/d1/recipe-repository';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await context.params;
  const env = await getRuntimeEnv();
  const recipe = env.DB
    ? await new D1RecipeRepository(env.DB).findById(recipeId, 'zh-CN')
    : findLaunchRecipe(recipeId, 'zh-CN');

  if (!recipe) {
    return NextResponse.json({ error: 'recipe_not_found' }, { status: 404 });
  }

  return NextResponse.json({ data: recipe });
}
