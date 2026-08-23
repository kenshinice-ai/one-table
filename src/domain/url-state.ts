import { presetForOccasions } from '../config/seasonal';

import type { EnergyTarget } from './health';
import {
  defaultPlannerFilters,
  defaultPlannerPreferences,
  type CompositionMode,
  type DishCount,
  type PlannerFilters,
  type PlannerPreferences,
  type PlannerServingStyle,
  type PrimaryRole,
} from './planner';

export type PlannerState = {
  /** Reading language, so a shared link opens the way the host left it. */
  locale: 'zh-CN' | 'en-AU';
  filters: PlannerFilters;
  preferences: PlannerPreferences;
  /**
   * Index into the deterministic candidate pool. The planner never uses a
   * random source, so this index alone reproduces an exact menu.
   */
  variation: number;
  /** Slot index → recipe id, recorded when a single course is swapped. */
  substitutions: Record<number, string>;
};

const STATE_VERSION = '1';
const roles: PrimaryRole[] = [
  'snack',
  'starter',
  'soup',
  'main',
  'side',
  'staple',
  'salad',
  'dessert',
];
const servingStyles: PlannerServingStyle[] = ['family', 'plated', 'buffet'];
const compositionModes: CompositionMode[] = ['balanced', 'budget', 'easy'];
const energyTargets: EnergyTarget[] = ['any', 'light', 'medium', 'hearty'];
const locales: PlannerState['locale'][] = ['zh-CN', 'en-AU'];

function list(values: string[]) {
  return values.length ? values.join(',') : null;
}

function parseList(value: string | null) {
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function parseInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!value || !Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function parseEnum<T extends string>(value: string | null, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function serializeRoles(overrides: PlannerPreferences['roleOverrides']) {
  if (!overrides) return null;
  const entries = roles
    .filter((role) => (overrides[role] ?? 0) > 0)
    .map((role) => `${role}:${overrides[role]}`);
  return entries.length ? entries.join(',') : null;
}

function parseRoles(value: string | null): PlannerPreferences['roleOverrides'] {
  if (!value) return null;
  const overrides: Partial<Record<PrimaryRole, number>> = {};
  value.split(',').forEach((entry) => {
    const [role, rawCount] = entry.split(':');
    const count = Number(rawCount);
    if (!roles.includes(role as PrimaryRole) || !Number.isFinite(count)) return;
    const clamped = Math.max(0, Math.min(4, Math.round(count)));
    if (clamped > 0) overrides[role as PrimaryRole] = clamped;
  });
  return Object.keys(overrides).length ? overrides : null;
}

function serializeSubstitutions(substitutions: Record<number, string>) {
  const entries = Object.entries(substitutions)
    .filter(([, recipeId]) => Boolean(recipeId))
    .map(([slot, recipeId]) => `${slot}:${recipeId}`);
  return entries.length ? entries.join(',') : null;
}

function parseSubstitutions(value: string | null): Record<number, string> {
  if (!value) return {};
  const result: Record<number, string> = {};
  value.split(',').forEach((entry) => {
    const [rawSlot, recipeId] = entry.split(':');
    const slot = Number(rawSlot);
    if (!Number.isInteger(slot) || slot < 0 || slot > 19 || !recipeId) return;
    if (!/^[a-z0-9_]+$/.test(recipeId)) return;
    result[slot] = recipeId;
  });
  return result;
}

/** Builds the shareable query string for a planner state. Defaults are omitted. */
export function serializePlannerState(state: PlannerState) {
  const { filters, preferences } = state;
  const params = new URLSearchParams();
  const set = (key: string, value: string | null) => {
    if (value !== null && value !== '') params.set(key, value);
  };
  params.set('v', STATE_VERSION);
  if (state.locale !== 'zh-CN') set('lang', state.locale);
  if (preferences.guests !== defaultPlannerPreferences.guests) set('g', String(preferences.guests));
  if (preferences.dishCount !== defaultPlannerPreferences.dishCount)
    set('d', String(preferences.dishCount));
  if (preferences.servingStyle !== defaultPlannerPreferences.servingStyle)
    set('style', preferences.servingStyle);
  if (preferences.budgetCents !== null) set('b', String(preferences.budgetCents));
  if (preferences.compositionMode !== defaultPlannerPreferences.compositionMode)
    set('m', preferences.compositionMode);
  if (preferences.energyTarget !== defaultPlannerPreferences.energyTarget)
    set('kcal', preferences.energyTarget);
  set('roles', serializeRoles(preferences.roleOverrides));
  set('cuisine', list(filters.cuisines));
  set('occasion', list(filters.occasions));
  set('method', list(filters.methods));
  set('inc', list(filters.mustIncludeIngredientIds));
  set('exc', list(filters.excludedIngredientIds));
  set('diet', list(filters.dietTags));
  set('allergen', list(filters.excludedAllergens));
  set('equip', list(filters.availableEquipmentIds));
  if (filters.maxTotalMinutes !== null) set('time', String(filters.maxTotalMinutes));
  if (filters.maxSpiceLevel !== defaultPlannerFilters.maxSpiceLevel)
    set('spice', String(filters.maxSpiceLevel));
  if (filters.childFriendlyOnly) set('child', '1');
  if (filters.minHealthScore !== defaultPlannerFilters.minHealthScore)
    set('health', String(filters.minHealthScore));
  if (state.variation !== 0) set('n', String(state.variation));
  set('sub', serializeSubstitutions(state.substitutions));
  return params.toString();
}

/**
 * Query keys the planner does not own and must not drop when it rewrites the
 * address bar. `kiosk` is the mode itself: lose it and the shop-window screen
 * quietly turns back into a website the first time the state is saved. `src`
 * deliberately is not on this list — it marks how one visit arrived, it has
 * already been counted by then, and carrying it into a re-shared link would
 * credit the wrong channel.
 */
const PRESERVED_KEYS = ['kiosk'];

export function withPreservedParams(query: string, currentSearch: string) {
  const current = new URLSearchParams(currentSearch);
  const next = new URLSearchParams(query);
  for (const key of PRESERVED_KEYS) {
    const value = current.get(key);
    if (value) next.set(key, value);
  }
  return next.toString();
}

/**
 * Reads a planner state back from a query string. Every field falls back to its
 * default when missing or malformed, so a hand-edited link can never leave the
 * planner in an impossible state.
 */
/**
 * Reads a shared link back into planner state.
 *
 * `fallbackLocale` is the language to use when the link does not name one —
 * the tenant's own default, not the product's. Without it any query string at
 * all, including a bare `?kiosk=1`, silently reset an Australian centre's
 * screen to Chinese one frame after the server had rendered it in English.
 */
export function parsePlannerState(
  query: string,
  fallbackLocale: PlannerState['locale'] = 'zh-CN',
): PlannerState {
  const params = new URLSearchParams(query);
  const occasions = parseList(params.get('occasion'));
  // A poster link names an occasion and nothing else; the occasion's own table
  // shape stands in for the course counts it never carried.
  const impliedRoles =
    occasions.length && !params.get('roles') ? presetForOccasions(occasions) : null;
  const preferences: PlannerPreferences = {
    guests: parseInteger(params.get('g'), defaultPlannerPreferences.guests, 1, 30),
    dishCount: parseInteger(
      params.get('d'),
      impliedRoles
        ? (Object.values(impliedRoles).reduce((sum, count) => sum + (count ?? 0), 0) as DishCount)
        : defaultPlannerPreferences.dishCount,
      1,
      10,
    ) as DishCount,
    servingStyle: parseEnum(
      params.get('style'),
      servingStyles,
      defaultPlannerPreferences.servingStyle,
    ),
    // Absent means no ceiling, which is also the default.
    budgetCents: params.get('b') ? parseInteger(params.get('b'), 12000, 2000, 1000000) : null,
    compositionMode: parseEnum(
      params.get('m'),
      compositionModes,
      defaultPlannerPreferences.compositionMode,
    ),
    energyTarget: parseEnum(
      params.get('kcal'),
      energyTargets,
      defaultPlannerPreferences.energyTarget,
    ),
    roleOverrides: parseRoles(params.get('roles')) ?? impliedRoles,
  };
  const filters: PlannerFilters = {
    cuisines: parseList(params.get('cuisine')),
    occasions,
    methods: parseList(params.get('method')),
    mustIncludeIngredientIds: parseList(params.get('inc')),
    excludedIngredientIds: parseList(params.get('exc')),
    dietTags: parseList(params.get('diet')),
    excludedAllergens: parseList(params.get('allergen')),
    availableEquipmentIds: parseList(params.get('equip')),
    maxTotalMinutes: params.get('time') ? parseInteger(params.get('time'), 60, 1, 240) : null,
    maxSpiceLevel: parseInteger(params.get('spice'), defaultPlannerFilters.maxSpiceLevel, 0, 5),
    childFriendlyOnly: params.get('child') === '1',
    minHealthScore: parseInteger(params.get('health'), defaultPlannerFilters.minHealthScore, 1, 5),
  };
  return {
    locale: parseEnum(params.get('lang'), locales, fallbackLocale),
    filters,
    preferences,
    variation: parseInteger(params.get('n'), 0, 0, 999),
    substitutions: parseSubstitutions(params.get('sub')),
  };
}
