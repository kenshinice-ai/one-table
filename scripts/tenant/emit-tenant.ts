import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { z } from 'zod';

import { ingredientCatalog } from '../../data/recipes';

/**
 * Compiles a tenant into the build.
 *
 * `TENANT=<id> npm run build` produces a white-label deployment; with no TENANT
 * the generated config is null and the public site is byte-for-byte the same
 * behaviour as before multi-tenancy existed. Validation runs here, at build
 * time, so a broken venue mapping fails the build instead of a shopper's route.
 */
const id = z.string().regex(/^[a-z0-9-]+$/);

const tenantSchema = z.object({
  id,
  venueType: z.enum(['mall', 'grocer']),
  brand: z.object({ displayZh: z.string().min(1), displayEn: z.string().min(1) }),
  defaultLocale: z.enum(['zh-CN', 'en-AU']),
  features: z.object({ navigation: z.boolean(), restaurants: z.boolean() }),
  // Optional: absent means the shared seasonal calendar decides the chip row.
  seasonal: z
    .array(
      z.enum([
        'cny',
        'mid_autumn',
        'christmas',
        'easter',
        'brunch',
        'afternoon_tea',
        'bbq',
        'weeknight',
        'party',
        'feast',
      ]),
    )
    .optional(),
});

const venueSchema = z.object({
  floors: z
    .array(
      z.object({
        level: z.string().min(1),
        nameZh: z.string().min(1),
        nameEn: z.string().min(1),
        planSrc: z.string().startsWith('/venue/').nullable(),
        width: z.number().positive(),
        height: z.number().positive(),
      }),
    )
    .min(1),
  pois: z
    .array(
      z.object({
        poiId: id,
        nameZh: z.string().min(1),
        nameEn: z.string().min(1),
        level: z.string().min(1),
        zone: z.number().int().nonnegative(),
        kind: z.enum(['store', 'restaurant', 'concierge']),
        x: z.number(),
        y: z.number(),
      }),
    )
    .min(1),
  ingredientMap: z.record(z.string(), z.string()),
  categoryFallback: z.record(z.string(), z.string()),
  conciergePoiId: z.string(),
});

const ROOT = process.cwd();
const OUT = join(ROOT, 'src', 'generated', 'tenant-config.json');
const PUBLIC_VENUE = join(ROOT, 'public', 'venue');

const tenantId = process.env.TENANT ?? process.argv[2] ?? '';

if (!tenantId) {
  writeFileSync(OUT, 'null\n');
  rmSync(PUBLIC_VENUE, { recursive: true, force: true });
  console.log('tenant: none (public build)');
  process.exit(0);
}

const dir = join(ROOT, 'tenants', tenantId);
if (!existsSync(dir)) {
  console.error(`Unknown tenant: ${tenantId} (no ${dir})`);
  process.exit(1);
}

const tenant = tenantSchema.parse(JSON.parse(readFileSync(join(dir, 'tenant.json'), 'utf8')));
if (tenant.id !== tenantId) {
  console.error(`tenant.json id "${tenant.id}" does not match folder "${tenantId}"`);
  process.exit(1);
}
const venue = venueSchema.parse(JSON.parse(readFileSync(join(dir, 'venue.json'), 'utf8')));

// --- Referential checks: a broken mapping must fail here, not on a phone. ---
const errors: string[] = [];
const poiIds = new Set(venue.pois.map((poi) => poi.poiId));
const levels = new Set(venue.floors.map((floor) => floor.level));

for (const poi of venue.pois) {
  if (!levels.has(poi.level)) errors.push(`poi ${poi.poiId} references unknown level ${poi.level}`);
}
if (!poiIds.has(venue.conciergePoiId))
  errors.push(`conciergePoiId ${venue.conciergePoiId} not found`);
for (const [key, poiId] of Object.entries({ ...venue.ingredientMap, ...venue.categoryFallback })) {
  if (!poiIds.has(poiId)) errors.push(`${key} maps to unknown poi ${poiId}`);
}

const knownIngredientIds = new Set(ingredientCatalog.map((item) => item.id));
for (const ingredientId of Object.keys(venue.ingredientMap)) {
  if (!knownIngredientIds.has(ingredientId))
    errors.push(`ingredientMap key ${ingredientId} is not in the catalogue`);
}

// Every catalogue ingredient must land somewhere (directly or via category).
const unreachable = ingredientCatalog.filter(
  (item) => !venue.ingredientMap[item.id] && !venue.categoryFallback[item.category],
);
if (unreachable.length) {
  errors.push(
    `unmappable ingredients (no direct entry, no category fallback): ${unreachable
      .map((item) => `${item.id}(${item.category})`)
      .slice(0, 10)
      .join(', ')}${unreachable.length > 10 ? ` …+${unreachable.length - 10}` : ''}`,
  );
}

for (const floor of venue.floors) {
  if (!floor.planSrc) continue; // aisle mode: no schematic to check or copy
  const svg = join(dir, basename(floor.planSrc));
  if (!existsSync(svg)) errors.push(`floor ${floor.level} plan missing: ${svg}`);
}

if (errors.length) {
  console.error(`tenant ${tenantId} failed validation:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

// --- Emit ---
rmSync(PUBLIC_VENUE, { recursive: true, force: true });
const assetDir = join(PUBLIC_VENUE, tenantId);
mkdirSync(assetDir, { recursive: true });
for (const floor of venue.floors) {
  if (!floor.planSrc) continue;
  copyFileSync(join(dir, basename(floor.planSrc)), join(assetDir, basename(floor.planSrc)));
}

writeFileSync(OUT, `${JSON.stringify({ ...tenant, venue }, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      tenant: tenantId,
      floors: venue.floors.length,
      pois: venue.pois.length,
      directMappings: Object.keys(venue.ingredientMap).length,
      categoryFallbacks: Object.keys(venue.categoryFallback).length,
    },
    null,
    2,
  ),
);
