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

// Quotas for the 762-recipe catalogue. Batches E and F weighted the courses the
// launch set was thin in; wave three follows the commercial calendar; batch I
// adds the celebration tier, which is why Cantonese and French move most — a
// festive table leans on banquet Cantonese and on classical French technique.
// Batch J goes back to the seasons that could not lay a table: Mid-Autumn had
// seven mains, Easter seventeen dishes altogether, and a southern-hemisphere
// barbecue summer had twenty-eight.
const expectedRoles = {
  main: 277,
  side: 67,
  salad: 57,
  starter: 69,
  soup: 61,
  snack: 73,
  staple: 52,
  dessert: 106,
};
const expectedCuisines = {
  chinese_northern: 50,
  chinese_sichuan: 27,
  chinese_cantonese: 99,
  chinese_jiangnan: 46,
  japanese: 39,
  korean: 30,
  southeast_asian: 37,
  indian: 29,
  mediterranean: 50,
  italian: 56,
  french: 64,
  australian_modern: 60,
  western_home: 80,
  middle_eastern: 31,
  latin_american: 28,
  other: 36,
};
const expectedMethods = {
  bake: 110,
  boil: 80,
  braise: 64,
  chill: 30,
  deep_fry: 19,
  grill: 52,
  pan_fry: 64,
  raw: 92,
  roast: 81,
  simmer: 86,
  steam: 40,
  stir_fry: 44,
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

if (batch.recipes.length !== 762 || mismatches.length) {
  console.error({ recipeCount: batch.recipes.length, mismatches });
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
