import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { launchRecipes } from '../../data/recipes';

/**
 * Measures tabletop colour drift across the artwork library.
 *
 * The house style calls for a warm off-white surface. Generated batches can
 * drift toward peach/terracotta without any single image looking wrong — the
 * drift only shows when old and new cards sit side by side in the menu list.
 * This script decodes each master, samples the four corner patches, takes the
 * brightest patch as "tabletop" (food is centred; napkins are darker), and
 * scores warmth as R−B. Images beyond the reference band are listed for redo.
 */
const PATCH_W = 160;
const PATCH_H = 120;

function decodeToPpm(webpPath: string, ppmPath: string) {
  execFileSync('dwebp', ['-quiet', webpPath, '-ppm', '-o', ppmPath]);
}

function patchAverages(ppmPath: string) {
  const buffer = readFileSync(ppmPath);
  // P6 header: "P6\n<w> <h>\n255\n"
  let offset = 0;
  const readToken = () => {
    while (buffer[offset] === 0x20 || buffer[offset] === 0x0a || buffer[offset] === 0x0d) offset++;
    let start = offset;
    while (offset < buffer.length && ![0x20, 0x0a, 0x0d].includes(buffer[offset])) offset++;
    return buffer.subarray(start, offset).toString();
  };
  const magic = readToken();
  if (magic !== 'P6') throw new Error(`not a P6 ppm: ${magic}`);
  const width = Number(readToken());
  const height = Number(readToken());
  readToken(); // maxval
  offset++; // single whitespace after header
  const pixels = buffer.subarray(offset);

  const average = (x0: number, y0: number) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y0 + PATCH_H; y++) {
      for (let x = x0; x < x0 + PATCH_W; x++) {
        const index = (y * width + x) * 3;
        r += pixels[index];
        g += pixels[index + 1];
        b += pixels[index + 2];
        n++;
      }
    }
    return { r: r / n, g: g / n, b: b / n };
  };

  return [
    average(0, 0),
    average(width - PATCH_W, 0),
    average(0, height - PATCH_H),
    average(width - PATCH_W, height - PATCH_H),
  ];
}

function tabletop(webpPath: string) {
  const ppm = join(tmpdir(), `audit-${Math.random().toString(36).slice(2)}.ppm`);
  try {
    decodeToPpm(webpPath, ppm);
    const patches = patchAverages(ppm);
    // Brightest corner is the most likely bare tabletop.
    const best = patches.reduce((a, b) => (a.r + a.g + a.b > b.r + b.g + b.b ? a : b));
    return { warmth: best.r - best.b, luma: (best.r + best.g + best.b) / 3, rgb: best };
  } finally {
    rmSync(ppm, { force: true });
  }
}

const registered = launchRecipes.filter((recipe) => recipe.media.generatedAt !== null);
const pendingWithArt = launchRecipes.filter(
  (recipe) =>
    recipe.media.generatedAt === null && existsSync(`public/media/${recipe.slug}.webp`),
);

// Reference band from the adopted, style-approved library.
const referenceSample = registered.filter((_, index) => index % 10 === 0).slice(0, 20);
const referenceWarmths = referenceSample.map((recipe) =>
  tabletop(`public/media/${recipe.slug}.webp`).warmth,
);
const mean = referenceWarmths.reduce((a, b) => a + b, 0) / referenceWarmths.length;
const sd = Math.sqrt(
  referenceWarmths.reduce((sum, w) => sum + (w - mean) ** 2, 0) / referenceWarmths.length,
);
const limit = mean + Math.max(3 * sd, 12);

const results = pendingWithArt.map((recipe) => {
  const measured = tabletop(`public/media/${recipe.slug}.webp`);
  return { slug: recipe.slug, warmth: Math.round(measured.warmth * 10) / 10 };
});
results.sort((a, b) => b.warmth - a.warmth);

const fail = results.filter((entry) => entry.warmth > limit);
const pass = results.filter((entry) => entry.warmth <= limit);

console.log(
  JSON.stringify(
    {
      reference: { sampled: referenceWarmths.length, meanWarmth: Math.round(mean * 10) / 10, sd: Math.round(sd * 10) / 10, limit: Math.round(limit * 10) / 10 },
      audited: results.length,
      pass: pass.length,
      fail: fail.map((entry) => entry),
    },
    null,
    2,
  ),
);
