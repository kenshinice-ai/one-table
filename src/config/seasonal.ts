import type { PlannerFilters, PlannerPreferences, PrimaryRole } from '../domain/planner';

/**
 * The commercial calendar: which occasions the front page offers, and what a
 * table for each one looks like.
 *
 * This file is the single source of truth shared by the occasion filter, the
 * seasonal chip row and the kiosk attract screen. A tenant can name a different
 * set of occasions in `tenant.json`; the table shapes stay shared, because they
 * are the part that has to remain composable against the catalogue.
 */
export const OCCASIONS = [
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
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export type OccasionPreset = {
  /** Course counts this occasion's tagged recipes can actually fill. */
  roleOverrides: Partial<Record<PrimaryRole, number>>;
  /** Short reason the chip exists, shown under the label. */
  noteZh: string;
  noteEn: string;
};

/**
 * Table shapes, sized to the catalogue rather than to an ideal.
 *
 * The occasion tags cover 300 of the 700 dishes and are far from evenly spread
 * — afternoon tea is nearly all sweets, a weeknight is nearly all mains — so a
 * generic four-course template would ask for courses that occasion cannot
 * serve and hand the reader a half-empty table. Each shape below is asserted
 * against the real catalogue in tests/seasonal.test.ts: change one and the test
 * tells you whether it still composes.
 */
export const occasionPresets: Record<Occasion, OccasionPreset> = {
  cny: {
    roleOverrides: { snack: 1, starter: 1, soup: 1, main: 2, dessert: 1 },
    noteZh: '团圆六道，有汤有甜',
    noteEn: 'Six courses, soup and sweet included',
  },
  mid_autumn: {
    roleOverrides: { snack: 1, soup: 1, main: 2, dessert: 1 },
    noteZh: '一汤两菜，配月饼赏月',
    noteEn: 'Soup, two dishes and something sweet for the moon',
  },
  christmas: {
    roleOverrides: { starter: 1, main: 2, side: 1, dessert: 1 },
    noteZh: '前菜到甜品的完整五道',
    noteEn: 'Starter through to pudding',
  },
  easter: {
    roleOverrides: { main: 2, side: 1, dessert: 1 },
    noteZh: '春日午后的四道',
    noteEn: 'A four-course spring lunch',
  },
  brunch: {
    roleOverrides: { snack: 1, main: 2, dessert: 1 },
    noteZh: '两道主食加甜点',
    noteEn: 'Two plates and something sweet',
  },
  afternoon_tea: {
    roleOverrides: { snack: 2, dessert: 2 },
    noteZh: '咸甜各两道',
    noteEn: 'Two savoury, two sweet',
  },
  bbq: {
    roleOverrides: { snack: 1, main: 2, side: 1, salad: 1 },
    noteZh: '烤两道，配沙拉',
    noteEn: 'Two off the grill, salad alongside',
  },
  weeknight: {
    roleOverrides: { soup: 1, main: 2 },
    noteZh: '一汤两菜，下班做得完',
    noteEn: 'Soup and two dishes after work',
  },
  party: {
    roleOverrides: { snack: 3, starter: 1, main: 1 },
    noteZh: '手拿为主，站着吃',
    noteEn: 'Mostly finger food, eaten standing',
  },
  feast: {
    roleOverrides: { starter: 1, soup: 1, main: 2, dessert: 1 },
    noteZh: '前菜到甜品的五道大菜',
    noteEn: 'Five courses, starter through to dessert',
  },
};

export type SeasonalChip = {
  occasion: Occasion;
  /** True while the occasion's own window is open, false for the evergreen fill. */
  inSeason: boolean;
};

/**
 * Date windows, in local months and days.
 *
 * Chinese New Year and Mid-Autumn move with the lunar calendar, so the windows
 * span every date each festival can fall on (CNY lands between 21 January and
 * 21 February; Mid-Autumn between 8 September and 8 October) plus the weeks of
 * shopping before it. Bounding the window this way keeps the feature correct
 * for good without shipping an almanac that would need re-checking each year.
 * Months are 1-based; a window may wrap the end of the year.
 */
const windows: Array<{ occasion: Occasion; from: [number, number]; to: [number, number] }> = [
  { occasion: 'cny', from: [1, 8], to: [2, 24] },
  { occasion: 'mid_autumn', from: [8, 25], to: [10, 8] },
  { occasion: 'christmas', from: [11, 25], to: [12, 26] },
  // Southern-hemisphere summer: the barbecue season here is Christmas to Easter.
  { occasion: 'bbq', from: [11, 1], to: [3, 15] },
  { occasion: 'easter', from: [3, 15], to: [4, 26] },
];

/** Filler order once the season's own chips are placed. */
const evergreen: Occasion[] = ['weeknight', 'feast', 'party', 'brunch', 'afternoon_tea'];

export const SEASONAL_CHIP_COUNT = 3;

function dayOfYear(month: number, day: number) {
  return month * 100 + day;
}

function inWindow(from: [number, number], to: [number, number], month: number, day: number) {
  const start = dayOfYear(...from);
  const end = dayOfYear(...to);
  const today = dayOfYear(month, day);
  // A window that wraps December into January is two ranges, not one.
  return start <= end ? today >= start && today <= end : today >= start || today <= end;
}

/**
 * The chips to offer on a given day: whatever is in season first, then the
 * evergreen tables, always the same number so the row never changes height.
 *
 * `available` filters the result to occasions the catalogue can actually serve,
 * which is what keeps Easter — tagged in the schema, unwritten in the data —
 * off the screen until the recipes exist.
 */
export function seasonalChips(
  date: Date,
  options: { available?: readonly string[]; featured?: readonly Occasion[] } = {},
): SeasonalChip[] {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const canServe = (occasion: Occasion) =>
    !options.available || options.available.includes(occasion);
  const pool = options.featured?.length ? options.featured : OCCASIONS;
  const inSeason = windows
    .filter((window) => pool.includes(window.occasion))
    .filter((window) => inWindow(window.from, window.to, month, day))
    .map((window) => window.occasion)
    .filter(canServe);
  const filler = (options.featured?.length ? pool : evergreen).filter(
    (occasion) => canServe(occasion) && !inSeason.includes(occasion),
  );
  return [
    ...inSeason.map((occasion) => ({ occasion, inSeason: true })),
    ...filler.map((occasion) => ({ occasion, inSeason: false })),
  ].slice(0, SEASONAL_CHIP_COUNT);
}

let cachedChips: SeasonalChip[] = [];
let cachedKey = '';

/**
 * Today's chip row, returning the *same array* until the row actually changes.
 *
 * The clock is an external source React cannot subscribe to, so the row is read
 * through `useSyncExternalStore`, and that requires a snapshot whose identity is
 * stable between reads or the component re-renders forever. Caching the last
 * answer here is what makes the read safe — and it means a kiosk left running
 * across New Year's Eve picks up the new season on its own.
 */
export function currentChips(options: {
  available?: readonly string[];
  featured?: readonly Occasion[];
}) {
  const next = seasonalChips(new Date(), options);
  const key = next.map((chip) => `${chip.occasion}:${chip.inSeason}`).join(',');
  if (key !== cachedKey) {
    cachedKey = key;
    cachedChips = next;
  }
  return cachedChips;
}

/** The filters and preferences a chip applies, leaving everything else alone. */
export function applyOccasion(
  occasion: Occasion,
  filters: PlannerFilters,
  preferences: PlannerPreferences,
) {
  const preset = occasionPresets[occasion];
  const roleOverrides = preset.roleOverrides;
  const dishCount = Object.values(roleOverrides).reduce((sum, count) => sum + (count ?? 0), 0);
  return {
    filters: { ...filters, occasions: [occasion] },
    preferences: {
      ...preferences,
      roleOverrides,
      dishCount: Math.max(1, Math.min(10, dishCount)) as PlannerPreferences['dishCount'],
    },
  };
}

/**
 * Undoing a chip. The caller passes the table the host had before the chip was
 * applied; a reader who arrived on an `?occasion=` link never had one, so the
 * course count returns to the suggested template instead.
 */
export function clearOccasion(
  filters: PlannerFilters,
  preferences: PlannerPreferences,
  previous?: { filters: PlannerFilters; preferences: PlannerPreferences },
) {
  if (previous) return previous;
  return {
    filters: { ...filters, occasions: [] },
    preferences: { ...preferences, roleOverrides: null, dishCount: 4 as const },
  };
}

/**
 * The table shape a link's occasions imply.
 *
 * A campaign link is hand-written — `?occasion=cny` on a poster — and carries
 * no course counts, so without this it would land on the generic four-course
 * template and ask for a staple no Mid-Autumn dish can serve. The first
 * occasion sets the shape; any others only widen the pool it draws from.
 */
export function presetForOccasions(occasions: string[]) {
  const first = occasions.find((occasion): occasion is Occasion =>
    (OCCASIONS as readonly string[]).includes(occasion),
  );
  return first ? occasionPresets[first].roleOverrides : null;
}
