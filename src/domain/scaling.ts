import type { RecipeImport } from './batch-a';

export type ScaledIngredient = {
  ingredientId: string;
  quantity: number | null;
  unit: 'g' | 'ml' | 'count' | null;
  /** Display text for the scaled amount, or the recipe's own text when it cannot scale. */
  display: string;
  optional: boolean;
  scaled: boolean;
  group: 'main' | 'seasoning';
  preparationNoteZh: string;
  preparationNoteEn: string;
};

function roundTo(value: number, step: number) {
  return Math.max(step, Math.round(value / step) * step);
}

/**
 * Applies a recipe's own scaling strategy to reach the requested guest count.
 * `linear` amounts snap to a step a cook can actually measure, `rounded` items
 * go up to whole units, and `constant`/`manual` amounts are left alone because
 * the editorial data says they do not scale with the table.
 */
export function scaleQuantity(
  ingredient: RecipeImport['ingredients'][number],
  baseServings: number,
  guests: number,
): { quantity: number | null; scaled: boolean } {
  if (ingredient.quantity === null) return { quantity: null, scaled: false };
  if (ingredient.scalingStrategy === 'constant' || ingredient.scalingStrategy === 'manual') {
    return { quantity: ingredient.quantity, scaled: false };
  }
  const factor = Math.max(1, guests) / Math.max(1, baseServings);
  const raw = ingredient.quantity * factor;
  if (ingredient.scalingStrategy === 'rounded' || ingredient.unit === 'count') {
    return { quantity: Math.max(1, Math.ceil(raw)), scaled: true };
  }
  const step = ingredient.unit === 'ml' ? 10 : 5;
  return { quantity: roundTo(raw, step), scaled: true };
}

export function formatAmount(quantity: number | null, unit: 'g' | 'ml' | 'count' | null) {
  if (quantity === null) return '';
  if (unit === 'count') return String(quantity);
  if (unit === null) return String(quantity);
  return `${quantity} ${unit}`;
}

/**
 * Splits ingredients into what a cook shops for in bulk versus what they reach
 * for from the shelf. Weight and volume amounts above a household threshold are
 * treated as main ingredients; everything smaller reads as seasoning.
 */
function ingredientGroup(
  quantity: number | null,
  unit: 'g' | 'ml' | 'count' | null,
): 'main' | 'seasoning' {
  if (unit === 'count') return 'main';
  if (quantity === null) return 'seasoning';
  if (unit === 'g') return quantity >= 50 ? 'main' : 'seasoning';
  if (unit === 'ml') return quantity >= 50 ? 'main' : 'seasoning';
  return 'seasoning';
}

export function scaleRecipeIngredients(
  recipe: RecipeImport,
  guests: number,
  enabled = true,
): ScaledIngredient[] {
  return recipe.ingredients.map((ingredient) => {
    const { quantity, scaled } = enabled
      ? scaleQuantity(ingredient, recipe.baseServings, guests)
      : { quantity: ingredient.quantity, scaled: false };
    const amount = formatAmount(quantity, ingredient.unit);
    return {
      ingredientId: ingredient.ingredientId,
      quantity,
      unit: ingredient.unit,
      display: scaled && amount ? amount : ingredient.displayQuantity,
      optional: ingredient.optional,
      scaled,
      group: ingredientGroup(quantity, ingredient.unit),
      preparationNoteZh: ingredient.preparationNoteZh,
      preparationNoteEn: ingredient.preparationNoteEn,
    };
  });
}
