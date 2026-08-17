import type { IngredientDefinition } from './catalogue';
import type { ShoppingLine } from './shopping-list';

/**
 * White-label tenant and venue model.
 *
 * A tenant is compiled in at build time (scripts/tenant/emit-tenant.ts) — the
 * default build carries `null` and behaves exactly like the public site. The
 * venue turns a merged shopping list into an ordered walk through real stores,
 * which is the product's core commercial promise: the menu ends in footsteps,
 * not a recipe.
 */
export type VenueFloor = {
  level: string;
  nameZh: string;
  nameEn: string;
  /** Public path of the schematic SVG, drawn in brand style (never the raw architectural plan). */
  planSrc: string;
  /** SVG viewBox size; POI coordinates share this space. */
  width: number;
  height: number;
};

export type VenuePoi = {
  poiId: string;
  nameZh: string;
  nameEn: string;
  level: string;
  /** Walk order inside a level; lower first. */
  zone: number;
  kind: 'store' | 'restaurant' | 'concierge';
  x: number;
  y: number;
};

export type VenueConfig = {
  floors: VenueFloor[];
  pois: VenuePoi[];
  /** Explicit ingredient placements; anything else falls back by category. */
  ingredientMap: Record<string, string>;
  categoryFallback: Record<string, string>;
  conciergePoiId: string;
};

export type TenantConfig = {
  id: string;
  venueType: 'mall' | 'grocer';
  brand: { displayZh: string; displayEn: string };
  defaultLocale: 'zh-CN' | 'en-AU';
  features: { navigation: boolean; restaurants: boolean };
  venue: VenueConfig;
};

export type RouteStop = {
  poi: VenuePoi;
  items: ShoppingLine[];
};

export type VenueRoute = {
  /** Stops in walking order: floors in configured order, zones ascending. */
  stops: RouteStop[];
  /**
   * Items no mapping could place. They surface as a concierge stop rather than
   * silently disappearing — a dropped ingredient would quietly break the
   * product's "buy the whole table" promise.
   */
  unmapped: ShoppingLine[];
  /** Distinct non-concierge stores visited — the number the sales pitch cites. */
  storeCount: number;
};

export function resolvePoi(
  ingredientId: string,
  category: string | undefined,
  venue: VenueConfig,
): VenuePoi | null {
  const poiId = venue.ingredientMap[ingredientId] ?? (category ? venue.categoryFallback[category] : undefined);
  if (!poiId) return null;
  return venue.pois.find((poi) => poi.poiId === poiId) ?? null;
}

/**
 * Turns a merged shopping list into an ordered store walk. Ordering is
 * deliberately simple — floors in configured order, zones ascending — because a
 * venue's own zone numbering already encodes its natural walking line, and a
 * pathfinding algorithm would add failure modes without adding trust.
 */
export function resolveStops(
  lines: ShoppingLine[],
  ingredients: IngredientDefinition[],
  venue: VenueConfig,
): VenueRoute {
  const categoryById = new Map(ingredients.map((item) => [item.id, item.category]));
  const byPoi = new Map<string, RouteStop>();
  const unmapped: ShoppingLine[] = [];

  for (const line of lines) {
    const poi = resolvePoi(line.ingredientId, categoryById.get(line.ingredientId), venue);
    if (!poi) {
      unmapped.push(line);
      continue;
    }
    const stop = byPoi.get(poi.poiId) ?? { poi, items: [] };
    stop.items.push(line);
    byPoi.set(poi.poiId, stop);
  }

  const floorOrder = new Map(venue.floors.map((floor, index) => [floor.level, index]));
  const stops = [...byPoi.values()].sort(
    (a, b) =>
      (floorOrder.get(a.poi.level) ?? 99) - (floorOrder.get(b.poi.level) ?? 99) ||
      a.poi.zone - b.poi.zone ||
      a.poi.poiId.localeCompare(b.poi.poiId),
  );

  if (unmapped.length) {
    const concierge = venue.pois.find((poi) => poi.poiId === venue.conciergePoiId);
    if (concierge) stops.push({ poi: concierge, items: unmapped });
  }

  return {
    stops,
    unmapped,
    storeCount: stops.filter((stop) => stop.poi.kind !== 'concierge').length,
  };
}

/** Stops on one floor, in walking order — what a single schematic draws. */
export function stopsForLevel(route: VenueRoute, level: string): Array<RouteStop & { index: number }> {
  return route.stops
    .map((stop, index) => ({ ...stop, index }))
    .filter((stop) => stop.poi.level === level);
}
