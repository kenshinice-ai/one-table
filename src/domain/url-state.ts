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
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
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
  if (preferences.budgetCents !== defaultPlannerPreferences.budgetCents)
    set('b', String(preferences.budgetCents));
  if (preferences.compositionMode !== defaultPlannerPreferences.compositionMode)
    set('m', preferences.compositionMode);
  if (preferences.energyTarget !== defaultPlannerPreferences.energyTarget)
    set('kcal', preferences.energyTarget);
  set('roles', serializeRoles(preferences.roleOverrides));
  set('cuisine', list(filters.cuisines));
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
 * Reads a planner state back from a query string. Every field falls back to its
 * default when missing or malformed, so a hand-edited link can never leave the
 * planner in an impossible state.
 */
export function parsePlannerState(query: string): PlannerState {
  const params = new URLSearchParams(query);
  const preferences: PlannerPreferences = {
    guests: parseInteger(params.get('g'), defaultPlannerPreferences.guests, 1, 30),
    dishCount: parseInteger(
      params.get('d'),
      defaultPlannerPreferences.dishCount,
      1,
      10,
    ) as DishCount,
    servingStyle: parseEnum(
      params.get('style'),
      servingStyles,
      defaultPlannerPreferences.servingStyle,
    ),
    budgetCents: parseInteger(
      params.get('b'),
      defaultPlannerPreferences.budgetCents,
      2000,
      1000000,
    ),
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
    roleOverrides: parseRoles(params.get('roles')),
  };
  const filters: PlannerFilters = {
    cuisines: parseList(params.get('cuisine')),
    methods: parseList(params.get('method')),
    mustIncludeIngredientIds: parseList(params.get('inc')),
    excludedIngredientIds: parseList(params.get('exc')),
    dietTags: parseList(params.get('diet')),
    excludedAllergens: parseList(params.get('allergen')),
    availableEquipmentIds: parseList(params.get('equip')),
    maxTotalMinutes: params.get('time') ? parseInteger(params.get('time'), 60, 1, 240) : null,
    maxSpiceLevel: parseInteger(params.get('spice'), defaultPlannerFilters.maxSpiceLevel, 0, 5),
    childFriendlyOnly: params.get('child') === '1',
    minHealthScore: parseInteger(
      params.get('health'),
      defaultPlannerFilters.minHealthScore,
      1,
      5,
    ),
  };
  return {
    locale: parseEnum(params.get('lang'), locales, 'zh-CN'),
    filters,
    preferences,
    variation: parseInteger(params.get('n'), 0, 0, 999),
    substitutions: parseSubstitutions(params.get('sub')),
  };
}
