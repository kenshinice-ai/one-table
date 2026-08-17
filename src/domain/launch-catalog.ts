import { ingredientCatalog, launchRecipes } from '../../data/recipes';
import type { Locale, RecipeRecord, RecipeSummary } from './recipe';

const ingredientNames = new Map(
  ingredientCatalog.map((ingredient) => [ingredient.id, ingredient.nameEn]),
);

function toSummary(recipe: (typeof launchRecipes)[number], locale: Locale): RecipeSummary {
  const translation = recipe.translations[locale];
  return {
    id: recipe.id,
    slug: recipe.slug,
    status: recipe.status,
    title: translation.title,
    summary: translation.summary,
    primaryRoleCode: recipe.primaryRole,
    activeMinutes: recipe.activeMinutes,
    totalMinutes: recipe.totalMinutes,
    difficulty: recipe.difficulty,
    spiceLevel: recipe.spiceLevel,
  };
}

export function listLaunchRecipes(locale: Locale, limit = 24, query?: string) {
  const normalizedQuery = query?.trim().toLocaleLowerCase(locale);
  return launchRecipes
    .filter((recipe) => recipe.status === 'published')
    .filter((recipe) => {
      if (!normalizedQuery) return true;
      const translation = recipe.translations[locale];
      return `${translation.title} ${translation.summary}`
        .toLocaleLowerCase(locale)
        .includes(normalizedQuery);
    })
    .slice(0, limit)
    .map((recipe) => toSummary(recipe, locale));
}

export function findLaunchRecipe(id: string, locale: Locale): RecipeRecord | null {
  const recipe = launchRecipes.find(
    (candidate) =>
      candidate.status === 'published' && (candidate.id === id || candidate.slug === id),
  );
  if (!recipe) return null;

  return {
    ...toSummary(recipe, locale),
    baseServings: recipe.baseServings,
    advanceMinutes: recipe.advanceMinutes,
    childFriendly: recipe.childFriendly,
    instructions: recipe.translations[locale].instructions,
    servingStyles: Object.entries(recipe.servingStyles).map(([style, suitabilityScore]) => ({
      style: style as RecipeRecord['servingStyles'][number]['style'],
      suitabilityScore,
    })),
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.ingredientId,
      canonicalName: ingredientNames.get(ingredient.ingredientId) ?? ingredient.ingredientId,
      normalizedQuantity: ingredient.quantity,
      normalizedUnit: ingredient.unit,
      displayQuantity: ingredient.displayQuantity,
      optional: ingredient.optional,
      scalingStrategy: ingredient.scalingStrategy,
    })),
  };
}
