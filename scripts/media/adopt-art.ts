import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { launchRecipes } from '../../data/recipes';

/**
 * Adopts produced artwork into the live registry.
 *
 * The image producer's job ends at committing master files; this script owns
 * everything after: skip rejected slugs, re-encode oversized masters, generate
 * the responsive size ladder, and write the registry entries that switch a
 * recipe from placeholder to photograph. Run per delivery batch:
 *
 *   npm run art:adopt
 */
const ROOT = process.cwd();
const MEDIA = join(ROOT, 'public', 'media');
const REGISTRY = join(ROOT, 'data', 'recipes', 'generated-media.json');
const REJECTS = join(ROOT, 'scripts', 'media', 'art-rejects.json');
const MAX_BYTES = 300 * 1024;

const rejects = new Set<string>(
  (JSON.parse(readFileSync(REJECTS, 'utf8')).rejects as Array<{ slug: string }>).map(
    (entry) => entry.slug,
  ),
);
const registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) as Record<
  string,
  { objectKey: string; generatedAt: string; aiModel: string }
>;

const candidates = launchRecipes.filter(
  (recipe) =>
    !registry[recipe.slug] &&
    !rejects.has(recipe.slug) &&
    existsSync(join(MEDIA, `${recipe.slug}.webp`)),
);

const reencoded: string[] = [];
for (const recipe of candidates) {
  const file = join(MEDIA, `${recipe.slug}.webp`);
  if (statSync(file).size > MAX_BYTES) {
    // Master over budget: decode and re-encode at a slightly lower quality.
    const png = `${file}.tmp.png`;
    execFileSync('dwebp', ['-quiet', file, '-o', png]);
    execFileSync('cwebp', ['-quiet', '-q', '80', png, '-o', file]);
    execFileSync('rm', [png]);
    reencoded.push(recipe.slug);
  }
}

if (candidates.length) {
  // Incremental: the script skips targets newer than their source.
  execSync('bash scripts/media/generate-sizes.sh', { stdio: 'pipe' });
}

const now = new Date().toISOString();
for (const recipe of candidates) {
  registry[recipe.slug] = {
    objectKey: `media/${recipe.slug}.webp`,
    generatedAt: now,
    aiModel: 'imagegen-editorial-v2',
  };
}
writeFileSync(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`);

const stillPending = launchRecipes.filter(
  (recipe) => !registry[recipe.slug] && !rejects.has(recipe.slug),
).length;

console.log(
  JSON.stringify(
    {
      adopted: candidates.length,
      reencoded,
      skippedAsRejected: [...rejects].filter((slug) =>
        existsSync(join(MEDIA, `${slug}.webp`)),
      ),
      registryTotal: Object.keys(registry).length,
      stillAwaitingArt: stillPending,
    },
    null,
    2,
  ),
);
