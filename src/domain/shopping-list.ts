import type { PlannerRecipe } from './catalogue';
import { formatAmount, scaleQuantity } from './scaling';

export type ShoppingLine = {
  ingredientId: string;
  /** Merged amount when every contribution shares one unit, otherwise null. */
  quantity: number | null;
  unit: 'g' | 'ml' | 'count' | null;
  display: string;
  /** Recipe ids the line came from, so the UI can show where an item is used. */
  recipeIds: string[];
  optional: boolean;
  group: 'main' | 'seasoning';
};

type Accumulator = {
  quantity: number | null;
  unit: 'g' | 'ml' | 'count' | null;
  fallbacks: string[];
  recipeIds: string[];
  optional: boolean;
  mergeable: boolean;
};

/**
 * Merges the ingredients of a whole menu into one shopping list. Amounts only
 * add up when every contribution scales and shares a unit; anything else is
 * listed as separate amounts so a cook is never handed an invented number.
 */
export function buildShoppingList(recipes: PlannerRecipe[], guests: number): ShoppingLine[] {
  const byIngredient = new Map<string, Accumulator>();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const { quantity, scaled } = scaleQuantity(ingredient, recipe.baseServings, guests);
      const entry = byIngredient.get(ingredient.ingredientId) ?? {
        quantity: 0,
        unit: ingredient.unit,
        fallbacks: [],
        recipeIds: [],
        optional: true,
        mergeable: true,
      };
      entry.recipeIds.push(recipe.id);
      entry.optional = entry.optional && ingredient.optional;
      const canMerge = quantity !== null && ingredient.unit !== null && entry.unit === ingredient.unit;
      if (canMerge && entry.mergeable && entry.quantity !== null) {
        entry.quantity += quantity;
        if (!scaled) entry.fallbacks.push(ingredient.displayQuantity);
      } else {
        entry.mergeable = false;
        entry.quantity = null;
        entry.fallbacks.push(
          quantity !== null && scaled
            ? formatAmount(quantity, ingredient.unit)
            : ingredient.displayQuantity,
        );
      }
      byIngredient.set(ingredient.ingredientId, entry);
    });
  });

  return [...byIngredient.entries()]
    .map(([ingredientId, entry]) => {
      const merged = entry.mergeable && entry.quantity !== null;
      const display = merged
        ? formatAmount(entry.quantity, entry.unit)
        : [...new Set(entry.fallbacks)].join(' + ');
      const group: 'main' | 'seasoning' =
        merged && entry.unit !== 'count' && (entry.quantity ?? 0) < 50 ? 'seasoning' : 'main';
      return {
        ingredientId,
        quantity: merged ? entry.quantity : null,
        unit: entry.unit,
        display: display || '—',
        recipeIds: [...new Set(entry.recipeIds)],
        optional: entry.optional,
        group,
      };
    })
    .sort(
      (a, b) =>
        Number(a.group === 'seasoning') - Number(b.group === 'seasoning') ||
        b.recipeIds.length - a.recipeIds.length ||
        a.ingredientId.localeCompare(b.ingredientId),
    );
}
