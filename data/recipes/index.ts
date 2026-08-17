import type { RecipeImport } from '@/domain/batch-a';

/**
 * Artwork registry. A slug listed here has produced, adopted artwork; anything
 * absent renders the placeholder. Kept as JSON so the adoption script
 * (scripts/media/adopt-art.ts) can write it without editing code — the image
 * producer only commits image files.
 */
import generatedMediaJson from './generated-media.json';

import { batchA, ingredientCatalog as batchAIngredientCatalog } from './batch-a';
import { batchB, batchBIngredientCatalog } from './batch-b';
import { expansionIngredientCatalog } from './expansion-shared';
import { batchC } from './batch-c';
import { batchD } from './batch-d';
import { batchE } from './batch-e';
import { batchF } from './batch-f';
import { expansionV2IngredientCatalog } from './expansion-v2-shared';

/**
 * The launch catalogue is deliberately assembled from the two editorial batches so
 * the runtime, validation scripts and import tooling all read the same 200 records.
 * Batch A contains ten foundation records that were previously held in review; the
 * launch gate has now accepted the complete editorial set and marks those records
 * published while retaining their per-record kitchenTestStatus and safety notes.
 */
export const ingredientCatalog = [
  ...batchAIngredientCatalog,
  ...batchBIngredientCatalog,
  ...expansionIngredientCatalog,
  ...expansionV2IngredientCatalog,
];

const launchImage = (recipe: RecipeImport): RecipeImport['media'] => ({
  objectKey: `recipes/v1/${recipe.slug}/hero-1600x1200.webp`,
  mediaType: 'ai_illustration',
  mimeType: 'image/webp',
  width: 1600,
  height: 1200,
  altEn: `${recipe.translations['en-AU'].title}, an editorial recipe illustration`,
  altZh: `${recipe.translations['zh-CN'].title}，聚餐菜谱示意图`,
  sourceUrl: null,
  licenseCode: 'ai-generated-editorial',
  attribution: null,
  aiModel: 'pending-imagegen-v1',
  aiPrompt: `Realistic editorial food photography of ${recipe.translations['en-AU'].title}; only canonical ingredients ${recipe.ingredients.map((ingredient) => ingredient.ingredientId).join(', ')}; warm off-white tabletop; soft sage and muted peach accents; no text, logos, people, hands, packaging or undeclared ingredients; 4:3 landscape.`,
  generatedAt: null,
  rightsReviewedAt: '2026-08-16T00:00:00.000Z',
});

const generatedMedia = generatedMediaJson as Record<
  string,
  { objectKey: string; generatedAt: string; aiModel: string }
>;

/**
 * Batches A-D shipped with generated artwork. Batches E and F are the V2
 * expansion: the records are complete and safe to plan with, but their photos
 * have not been produced yet, so they keep their own media block and the UI
 * shows a placeholder rather than a broken image.
 */
export const launchRecipes: RecipeImport[] = [
  ...[...batchA, ...batchB, ...batchC, ...batchD].map((recipe) => ({
    ...recipe,
    status: 'published' as const,
    source: {
      sourceType: 'original' as const,
      providerName: 'One Table editorial catalogue',
      sourceUrl: null,
      licenseCode: 'internal-editorial',
      attributionRequired: false,
      cachingAllowed: true,
    },
    media: generatedMedia[recipe.slug]
      ? {
          ...launchImage(recipe),
          ...generatedMedia[recipe.slug],
        }
      : launchImage(recipe),
  })),
  ...[...batchE, ...batchF].map((recipe) => {
    const produced = generatedMedia[recipe.slug];
    return produced
      ? { ...recipe, media: { ...recipe.media, ...produced } }
      : recipe;
  }),
];

/** Slugs still waiting on artwork, consumed by the image-brief generator. */
export const recipesAwaitingArtwork = [...batchE, ...batchF].map((recipe) => recipe.slug);

export const launchCatalogFile = {
  batch: 'launch' as const,
  version: '2026-08-launch-2',
  generatedAt: '2026-08-16T00:00:00.000Z',
  recipes: launchRecipes,
};

export const launchRecipeById = new Map(
  launchRecipes.flatMap((recipe) => [[recipe.id, recipe] as const, [recipe.slug, recipe] as const]),
);
