import { ingredientCatalog, launchRecipes } from '../../data/recipes';
import { PlannerApp } from '@/components/planner-app';
import { OCCASIONS, seasonalChips, type Occasion } from '@/config/seasonal';
import tenantConfig from '@/generated/tenant-config.json';
import type { PlannerRecipe } from '@/domain/catalogue';
import { composeMenu, defaultPlannerFilters, defaultPlannerPreferences } from '@/domain/planner';
import type { TenantConfig } from '@/domain/venue';

/**
 * The default table is composed here, at build time, and rendered into the
 * document. Opening the page therefore shows a real menu immediately instead of
 * a placeholder waiting on a request; the full catalogue arrives in parallel and
 * takes over as soon as the reader changes anything.
 *
 * Only the handful of dishes on that table crosses to the client, so this costs
 * a few kilobytes rather than the whole 400-recipe catalogue.
 */
function trim(recipe: PlannerRecipe): PlannerRecipe {
  // Fields are listed rather than spread: serialisation follows the runtime
  // object, so an omitted field is what actually keeps it out of the document.
  return {
    id: recipe.id,
    slug: recipe.slug,
    status: recipe.status,
    primaryRole: recipe.primaryRole,
    secondaryRoles: recipe.secondaryRoles,
    cuisines: recipe.cuisines,
    methods: recipe.methods,
    equipment: recipe.equipment,
    servingStyles: recipe.servingStyles,
    baseServings: recipe.baseServings,
    activeMinutes: recipe.activeMinutes,
    totalMinutes: recipe.totalMinutes,
    advanceMinutes: recipe.advanceMinutes,
    difficulty: recipe.difficulty,
    spiceLevel: recipe.spiceLevel,
    holdQuality: recipe.holdQuality,
    reheatingQuality: recipe.reheatingQuality,
    childFriendly: recipe.childFriendly,
    kitchenTestStatus: recipe.kitchenTestStatus,
    safetyNotes: recipe.safetyNotes,
    ingredients: recipe.ingredients,
    allergens: recipe.allergens,
    dietTags: recipe.dietTags,
    nutrition: recipe.nutrition,
    cost: recipe.cost,
    review: recipe.review,
    translations: {
      'zh-CN': {
        title: recipe.translations['zh-CN'].title,
        summary: recipe.translations['zh-CN'].summary,
      },
      'en-AU': {
        title: recipe.translations['en-AU'].title,
        summary: recipe.translations['en-AU'].summary,
      },
    },
    media: {
      objectKey: recipe.media.objectKey,
      altEn: recipe.media.altEn,
      altZh: recipe.media.altZh,
    },
  };
}

export default function HomePage() {
  const menu = composeMenu(launchRecipes, defaultPlannerPreferences, 0, defaultPlannerFilters);
  const initialRecipes = menu.recipes.map(trim);
  const initialIngredientIds = new Set(
    initialRecipes.flatMap((recipe) => recipe.ingredients.map((item) => item.ingredientId)),
  );
  const tenant = tenantConfig as TenantConfig | null;
  // Only occasions with dishes behind them; Easter is in the schema and not yet
  // in the catalogue, and an empty chip would be a promise the data cannot keep.
  const servedOccasions = OCCASIONS.filter((occasion) =>
    launchRecipes.some((recipe) => recipe.occasions?.includes(occasion)),
  ) as Occasion[];
  return (
    <PlannerApp
      initialChips={seasonalChips(new Date(), {
        available: servedOccasions,
        featured: tenant?.seasonal,
      })}
      initialIngredients={ingredientCatalog.filter((item) => initialIngredientIds.has(item.id))}
      initialRecipes={initialRecipes}
      servedOccasions={servedOccasions}
    />
  );
}
