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
};

const expectedRoles = {
  main: 65,
  side: 23,
  salad: 22,
  starter: 12,
  soup: 12,
  snack: 11,
  staple: 25,
  dessert: 30,
};
const expectedCuisines = {
  chinese_northern: 14,
  chinese_sichuan: 14,
  chinese_cantonese: 14,
  chinese_jiangnan: 13,
  japanese: 12,
  korean: 12,
  southeast_asian: 14,
  indian: 12,
  mediterranean: 13,
  italian: 13,
  french: 14,
  australian_modern: 15,
  western_home: 15,
  middle_eastern: 9,
  latin_american: 9,
  other: 7,
};
const expectedMethods = {
  braise: 23,
  grill: 10,
  stir_fry: 15,
  roast: 26,
  pan_fry: 14,
  steam: 15,
  bake: 31,
  raw: 28,
  boil: 32,
  deep_fry: 6,
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

if (batch.recipes.length !== 200 || mismatches.length) {
  console.error({ recipeCount: batch.recipes.length, mismatches });
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
