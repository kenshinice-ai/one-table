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
  byOccasion: countBy(batch.recipes.flatMap((recipe) => recipe.occasions ?? [])),
  withStructuredSteps: batch.recipes.filter(
    (recipe) => (recipe.translations['zh-CN'].structuredInstructions?.length ?? 0) > 0,
  ).length,
};

// Quotas for the 400-recipe catalogue. Batches E and F deliberately weight the
// courses the launch set was thin in, so starters, soups and salads roughly
// triple while mains grow by less than double.
// Wave three follows the commercial calendar; roles shift accordingly.
// Seven dishes were filed under the wrong course (a cauliflower bake as a
// soup, a tomato soup as a salad); the counts follow the corrected roles.
const expectedRoles = {
  main: 218,
  side: 55,
  salad: 49,
  starter: 50,
  soup: 48,
  snack: 54,
  staple: 44,
  dessert: 82,
};
const expectedCuisines = {
  chinese_northern: 46,
  chinese_sichuan: 27,
  chinese_cantonese: 72,
  chinese_jiangnan: 30,
  japanese: 37,
  korean: 30,
  southeast_asian: 34,
  indian: 29,
  mediterranean: 39,
  italian: 40,
  french: 37,
  australian_modern: 45,
  western_home: 51,
  middle_eastern: 27,
  latin_american: 24,
  other: 32,
};
const expectedMethods = {
  braise: 52,
  grill: 28,
  stir_fry: 43,
  roast: 65,
  pan_fry: 55,
  steam: 26,
  bake: 86,
  raw: 71,
  boil: 69,
  deep_fry: 15,
  chill: 21,
  simmer: 69,
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

if (batch.recipes.length !== 600 || mismatches.length) {
  console.error({ recipeCount: batch.recipes.length, mismatches });
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
