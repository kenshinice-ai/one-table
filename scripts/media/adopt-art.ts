import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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
const REGISTRY_PATH_IN_GIT = 'data/recipes/generated-media.json';
const REJECTS = join(ROOT, 'scripts', 'media', 'art-rejects.json');
/** Slugs this script registered but that are not committed yet. */
const OWN_PENDING = join(ROOT, '.generated', 'adopted-pending.json');
const MAX_BYTES = 300 * 1024;

/**
 * Names registry entries that appeared without passing through this script.
 *
 * Registering artwork is the step that puts a photograph in front of readers,
 * so it has to stay behind the quality gate. An image producer once wrote the
 * registry directly; that time the pictures happened to be good, but the same
 * move would have published unreviewed ones. Anything present on disk, absent
 * from the last commit, and not recorded as this script's own pending work
 * came from somewhere else.
 */
function entriesWrittenElsewhere(current: Record<string, unknown>) {
  let committed: Record<string, unknown>;
  try {
    committed = JSON.parse(
      execFileSync('git', ['show', `HEAD:${REGISTRY_PATH_IN_GIT}`], { encoding: 'utf8' }),
    );
  } catch {
    return []; // No git history to compare against; nothing to say.
  }
  let own: string[] = [];
  try {
    own = JSON.parse(readFileSync(OWN_PENDING, 'utf8')).slugs ?? [];
  } catch {
    // First run on this checkout.
  }
  return Object.keys(current).filter((slug) => !(slug in committed) && !own.includes(slug));
}

function rememberOwnPending(committedNow: string[]) {
  let committed: Record<string, unknown> = {};
  try {
    committed = JSON.parse(
      execFileSync('git', ['show', `HEAD:${REGISTRY_PATH_IN_GIT}`], { encoding: 'utf8' }),
    );
  } catch {
    // Without git the list is still useful within this checkout.
  }
  let own: string[] = [];
  try {
    own = JSON.parse(readFileSync(OWN_PENDING, 'utf8')).slugs ?? [];
  } catch {
    // First run.
  }
  // Once a slug lands in a commit it needs no further tracking.
  const slugs = [...new Set([...own, ...committedNow])].filter((slug) => !(slug in committed));
  mkdirSync(join(ROOT, '.generated'), { recursive: true });
  writeFileSync(OWN_PENDING, `${JSON.stringify({ slugs }, null, 2)}\n`);
}

const rejects = new Set<string>(
  (JSON.parse(readFileSync(REJECTS, 'utf8')).rejects as Array<{ slug: string }>).map(
    (entry) => entry.slug,
  ),
);
const registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) as Record<
  string,
  { objectKey: string; generatedAt: string; aiModel: string }
>;

const outsiders = entriesWrittenElsewhere(registry);
if (outsiders.length && !process.env.ART_ADOPT_ACCEPT_EXTERNAL) {
  console.error(
    [
      outsiders.length === 1
        ? '1 registry entry was added outside this script:'
        : `${outsiders.length} registry entries were added outside this script:`,
      ...outsiders.map((slug) => `  - ${slug}`),
      '',
      'These pictures are live without passing the quality gate. Look at each one',
      '(and run `npm run art:audit`) before accepting it. Then either:',
      '  ART_ADOPT_ACCEPT_EXTERNAL=1 npm run art:adopt   # they are good, keep them',
      '  git checkout data/recipes/generated-media.json  # drop them, re-adopt here',
    ].join('\n'),
  );
  process.exit(1);
}

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
rememberOwnPending(candidates.map((recipe) => recipe.slug));

const stillPending = launchRecipes.filter(
  (recipe) => !registry[recipe.slug] && !rejects.has(recipe.slug),
).length;

// A registered recipe whose file or size ladder is missing renders a broken
// image rather than the honest placeholder, so it is worth naming here.
const brokenEntries = Object.keys(registry).filter(
  (slug) =>
    !existsSync(join(MEDIA, `${slug}.webp`)) || !existsSync(join(MEDIA, `${slug}-640.webp`)),
);

console.log(
  JSON.stringify(
    {
      adopted: candidates.length,
      reencoded,
      skippedAsRejected: [...rejects].filter((slug) => existsSync(join(MEDIA, `${slug}.webp`))),
      acceptedFromOutside: process.env.ART_ADOPT_ACCEPT_EXTERNAL ? outsiders : [],
      registryTotal: Object.keys(registry).length,
      stillAwaitingArt: stillPending,
      brokenEntries,
    },
    null,
    2,
  ),
);
