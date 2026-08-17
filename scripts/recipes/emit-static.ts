import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ingredientCatalog, launchRecipes } from '../../data/recipes';
import type { RecipeImport } from '../../src/domain/batch-a';

/**
 * Splits the catalogue into two static payloads.
 *
 * Everything the planner needs to rank and filter a menu goes in the planning
 * payload; the long-form cooking text only a reader of one recipe ever sees
 * goes in the detail payload and is fetched when the first recipe is opened.
 * Serialising all 400 complete records into the page instead pushed the first
 * load well past its budget.
 */
const OUT_DIR = join(process.cwd(), 'public', 'data');

type PlanningRecipe = Omit<
  RecipeImport,
  'translations' | 'source' | 'substitutions' | 'media' | 'scalingNotes'
> & {
  translations: {
    'zh-CN': { title: string; summary: string };
    'en-AU': { title: string; summary: string };
  };
  media: Pick<RecipeImport['media'], 'objectKey' | 'altEn' | 'altZh'>;
};

function toPlanning(recipe: RecipeImport): PlanningRecipe {
  // Long-form editorial text, provenance and substitution notes are only read
  // on a recipe page, so they travel in the detail payload instead.
  const { translations, media, ...rest } = recipe;
  const planning = rest as Omit<
    RecipeImport,
    'translations' | 'media' | 'source' | 'substitutions' | 'scalingNotes'
  >;
  return {
    ...planning,
    translations: {
      'zh-CN': {
        title: translations['zh-CN'].title,
        summary: translations['zh-CN'].summary,
      },
      'en-AU': {
        title: translations['en-AU'].title,
        summary: translations['en-AU'].summary,
      },
    },
    media: { objectKey: media.objectKey, altEn: media.altEn, altZh: media.altZh },
  };
}

function toDetail(recipe: RecipeImport) {
  return {
    id: recipe.id,
    safetyNotes: recipe.safetyNotes,
    translations: {
      'zh-CN': {
        instructions: recipe.translations['zh-CN'].instructions,
        structuredInstructions: recipe.translations['zh-CN'].structuredInstructions ?? null,
        servingNote: recipe.translations['zh-CN'].servingNote,
      },
      'en-AU': {
        instructions: recipe.translations['en-AU'].instructions,
        structuredInstructions: recipe.translations['en-AU'].structuredInstructions ?? null,
        servingNote: recipe.translations['en-AU'].servingNote,
      },
    },
  };
}

function hash(content: string) {
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

function writeHashed(prefix: string, content: string) {
  const digest = hash(content);
  const name = `${prefix}-${digest}.json`;
  writeFileSync(join(OUT_DIR, name), content);
  return { name, bytes: Buffer.byteLength(content) };
}

mkdirSync(OUT_DIR, { recursive: true });
// Stale hashed payloads would otherwise accumulate in the deployed assets.
readdirSync(OUT_DIR)
  .filter((file) => file.endsWith('.json'))
  .forEach((file) => rmSync(join(OUT_DIR, file)));

const planning = writeHashed(
  'planning',
  JSON.stringify({
    version: '2026-08-launch-2',
    ingredients: ingredientCatalog,
    recipes: launchRecipes.map(toPlanning),
  }),
);
const details = writeHashed('details', JSON.stringify({ recipes: launchRecipes.map(toDetail) }));

const manifest = {
  planning: `/data/${planning.name}`,
  details: `/data/${details.name}`,
  recipeCount: launchRecipes.length,
};
writeFileSync(
  join(process.cwd(), 'src', 'generated', 'catalogue-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      ...manifest,
      planningKB: Math.round(planning.bytes / 1024),
      detailsKB: Math.round(details.bytes / 1024),
    },
    null,
    2,
  ),
);
