import type { PlannerRecipe } from '@/domain/catalogue';

import { ingredientImageUrl, recipeImageUrl } from './images';

/** Files already requested this session, so a warm-up never asks twice. */
const requested = new Set<string>();

function warm(url: string) {
  if (typeof window === 'undefined' || requested.has(url)) return;
  requested.add(url);
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
}

/**
 * Fetches everything the recipe dialog will show, before it is opened.
 *
 * Called on pointer-enter and touch-start: the couple of hundred milliseconds
 * between reaching for a dish card and pressing it is enough to have the large
 * photo and its ingredient thumbnails decoded, so the dialog opens complete.
 */
export function warmRecipeMedia(recipe: PlannerRecipe, heroWidth = 640) {
  warm(recipeImageUrl(recipe.slug, heroWidth));
  recipe.ingredients.forEach((ingredient) => {
    warm(ingredientImageUrl(ingredient.ingredientId));
  });
}

/**
 * Warms the whole current table once the page is idle. Only the dishes actually
 * on the menu are warmed — never the full catalogue — so this stays a handful
 * of files rather than a background download of everything.
 */
export function warmMenuMedia(recipes: PlannerRecipe[]) {
  if (typeof window === 'undefined') return () => undefined;
  const run = () => recipes.forEach((recipe) => warmRecipeMedia(recipe));
  const handle = window.requestIdleCallback?.(run, { timeout: 2500 });
  if (handle === undefined) {
    const timer = window.setTimeout(run, 400);
    return () => window.clearTimeout(timer);
  }
  return () => window.cancelIdleCallback?.(handle);
}
