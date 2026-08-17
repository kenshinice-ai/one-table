import { launchCatalogFileSchema } from '@/domain/recipe-catalog';
import { ingredientCatalog, launchCatalogFile } from '../../data/recipes';

const result = launchCatalogFileSchema.safeParse(launchCatalogFile);

if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}

const ids = result.data.recipes.map((recipe) => recipe.id);
const slugs = result.data.recipes.map((recipe) => recipe.slug);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
const ingredientIds = new Set(ingredientCatalog.map((ingredient) => ingredient.id));
const missingIngredientReferences = result.data.recipes.flatMap((recipe) => [
  ...recipe.ingredients
    .filter((ingredient) => !ingredientIds.has(ingredient.ingredientId))
    .map((ingredient) => `${recipe.slug}:${ingredient.ingredientId}`),
  ...recipe.substitutions
    .flatMap((substitution) => [substitution.ingredientId, substitution.replacementIngredientId])
    .filter((ingredientId) => !ingredientIds.has(ingredientId))
    .map((ingredientId) => `${recipe.slug}:${ingredientId}`),
]);

if (duplicateIds.length || duplicateSlugs.length || missingIngredientReferences.length) {
  console.error({ duplicateIds, duplicateSlugs, missingIngredientReferences });
  process.exit(1);
}

const invalidOrder = result.data.recipes.some(
  (recipe) => recipe.totalMinutes < recipe.activeMinutes,
);
if (invalidOrder) {
  console.error('totalMinutes must be greater than or equal to activeMinutes');
  process.exit(1);
}

const unknownAllergenRows = result.data.recipes.flatMap((recipe) =>
  recipe.allergens.filter((allergen) => allergen.presence === 'unknown'),
);
const statusCounts = result.data.recipes.reduce<Record<string, number>>((counts, recipe) => {
  counts[recipe.status] = (counts[recipe.status] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      batch: result.data.batch,
      recipeCount: result.data.recipes.length,
      statusCounts,
      unknownAllergenRows: unknownAllergenRows.length,
      note: 'Launch records are editorial estimates; verify packaged labels and kitchen-test status before service.',
    },
    null,
    2,
  ),
);
