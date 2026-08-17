import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { readFileSync } from 'node:fs';

import { ingredientCatalog, launchRecipes } from '../../data/recipes';

const rejects = new Map<string, string>(
  (
    JSON.parse(readFileSync(join(process.cwd(), 'scripts/media/art-rejects.json'), 'utf8'))
      .rejects as Array<{ slug: string; reason: string }>
  ).map((entry) => [entry.slug, entry.reason]),
);

/**
 * Writes the artwork brief for every recipe whose photo has not been produced.
 *
 * The brief is generated rather than written by hand so the ingredient list in
 * the prompt can never drift from the ingredient list in the recipe — an image
 * showing something the record does not declare would undermine the allergen
 * guarantees the whole planner rests on.
 */
const OUT_DIR = join(process.cwd(), '.generated');
const names = new Map(ingredientCatalog.map((item) => [item.id, item.nameEn]));

const pending = launchRecipes.filter((recipe) => recipe.media.generatedAt === null);

const briefs = pending.map((recipe) => ({
  slug: recipe.slug,
  /** 'redo' = a previous file exists but failed QC; overwrite it. */
  status: rejects.has(recipe.slug) ? ('redo' as const) : ('new' as const),
  redoReason: rejects.get(recipe.slug) ?? null,
  outputFile: `public/media/${recipe.slug}.webp`,
  titleEn: recipe.translations['en-AU'].title,
  titleZh: recipe.translations['zh-CN'].title,
  role: recipe.primaryRole,
  cuisine: recipe.cuisines[0],
  method: recipe.methods[0],
  ingredients: recipe.ingredients.map((item) => names.get(item.ingredientId) ?? item.ingredientId),
  altEn: recipe.media.altEn,
  altZh: recipe.media.altZh,
  prompt: recipe.media.aiPrompt,
}));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, 'image-briefs.json'),
  `${JSON.stringify({ count: briefs.length, briefs }, null, 2)}\n`,
);

const byCuisine = briefs.reduce<Record<string, number>>((counts, brief) => {
  counts[brief.cuisine] = (counts[brief.cuisine] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    { pending: briefs.length, byCuisine, output: '.generated/image-briefs.json' },
    null,
    2,
  ),
);
