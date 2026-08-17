import { launchCatalogFileSchema } from '@/domain/recipe-catalog';
import { launchCatalogFile } from '../../data/recipes';

const batch = launchCatalogFileSchema.parse(launchCatalogFile);
const countBy = (values: string[]) =>
  values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});

const report = {
  recipeCount: batch.recipes.length,
  byPrimaryRole: countBy(batch.recipes.map((recipe) => recipe.primaryRole)),
  byCuisine: countBy(batch.recipes.flatMap((recipe) => recipe.cuisines)),
  byMethod: countBy(batch.recipes.flatMap((recipe) => recipe.methods)),
  byDietTag: countBy(batch.recipes.flatMap((recipe) => recipe.dietTags.map((tag) => tag.code))),
  activeUnder30Minutes: batch.recipes.filter((recipe) => recipe.activeMinutes <= 30).length,
  advancePrepAtLeast15Minutes: batch.recipes.filter((recipe) => recipe.advanceMinutes >= 15).length,
  buffetSuitableAtLeast75: batch.recipes.filter((recipe) => recipe.servingStyles.buffet >= 75)
    .length,
  unknownAllergenRows: batch.recipes.reduce(
    (count, recipe) =>
      count + recipe.allergens.filter((allergen) => allergen.presence === 'unknown').length,
    0,
  ),
  recipesWithSubstitutions: batch.recipes.filter((recipe) => recipe.substitutions.length > 0)
    .length,
  mediaTypes: countBy(batch.recipes.map((recipe) => recipe.media.mediaType)),
  generatedMedia: batch.recipes.filter((recipe) => recipe.media.generatedAt !== null).length,
  pendingMedia: batch.recipes.filter((recipe) => recipe.media.generatedAt === null).length,
  publicationStatus: countBy(batch.recipes.map((recipe) => recipe.status)),
  totalUnder30Minutes: batch.recipes.filter((recipe) => recipe.totalMinutes <= 30).length,
  withStructuredSteps: batch.recipes.filter(
    (recipe) => (recipe.translations['zh-CN'].structuredInstructions?.length ?? 0) > 0,
  ).length,
};

// Quotas for the 400-recipe catalogue. Batches E and F deliberately weight the
// courses the launch set was thin in, so starters, soups and salads roughly
// triple while mains grow by less than double.
const expectedRoles = {
  main: 125,
  side: 43,
  salad: 47,
  starter: 42,
  soup: 37,
  snack: 21,
  staple: 40,
  dessert: 45,
};
const expectedCuisines = {
  chinese_northern: 22,
  chinese_sichuan: 23,
  chinese_cantonese: 26,
  chinese_jiangnan: 20,
  japanese: 28,
  korean: 24,
  southeast_asian: 27,
  indian: 29,
  mediterranean: 29,
  italian: 28,
  french: 28,
  australian_modern: 26,
  western_home: 29,
  middle_eastern: 21,
  latin_american: 20,
  other: 20,
};
const expectedMethods = {
  braise: 38,
  grill: 17,
  stir_fry: 27,
  roast: 52,
  pan_fry: 27,
  steam: 20,
  bake: 54,
  raw: 62,
  boil: 52,
  deep_fry: 7,
  chill: 7,
  simmer: 37,
};

const mismatches = [
  ['role', expectedRoles, report.byPrimaryRole],
  ['cuisine', expectedCuisines, report.byCuisine],
  ['method', expectedMethods, report.byMethod],
].flatMap(([dimension, expected, actual]) =>
  Object.entries(expected as Record<string, number>)
    .filter(([key, value]) => (actual as Record<string, number>)[key] !== value)
    .map(([key, value]) => ({
      dimension,
      key,
      expected: value,
      actual: (actual as Record<string, number>)[key] ?? 0,
    })),
);

if (batch.recipes.length !== 400 || mismatches.length) {
  console.error({ recipeCount: batch.recipes.length, mismatches });
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
