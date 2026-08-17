import type { PlannerRecipe } from './catalogue';
import { energyFit, healthScore, isEnergyOnTarget, type EnergyTarget } from './health';

export type DishCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PlannerServingStyle = 'family' | 'plated' | 'buffet';
export type CompositionMode = 'balanced' | 'budget' | 'easy';
export type PrimaryRole = PlannerRecipe['primaryRole'];

export type PlannerFilters = {
  cuisines: string[];
  methods: string[];
  mustIncludeIngredientIds: string[];
  excludedIngredientIds: string[];
  dietTags: string[];
  excludedAllergens: string[];
  maxTotalMinutes: number | null;
  availableEquipmentIds: string[];
  maxSpiceLevel: number;
  childFriendlyOnly: boolean;
  /** Lowest acceptable deterministic health score; 1 accepts every recipe. */
  minHealthScore: number;
};

export type PlannerPreferences = {
  guests: number;
  dishCount: DishCount;
  servingStyle: PlannerServingStyle;
  budgetCents: number;
  compositionMode: CompositionMode;
  /** Energy band for the whole table; scored, never used as a hard filter. */
  energyTarget: EnergyTarget;
  /**
   * Explicit course counts. `null` keeps the suggested template derived from
   * dish count and serving style.
   */
  roleOverrides: Partial<Record<PrimaryRole, number>> | null;
};

export type ExclusionReasonCode =
  | 'not_published'
  | 'missing_required_data'
  | 'allergen_conflict'
  | 'allergen_unknown'
  | 'excluded_ingredient'
  | 'diet_mismatch'
  | 'cuisine_mismatch'
  | 'method_mismatch'
  | 'time_exceeded'
  | 'equipment_unavailable'
  | 'spice_exceeded'
  | 'not_child_friendly'
  | 'health_below_min'
  | 'serving_style_unsuitable';

export type MenuConflictCode =
  | 'insufficient_role_coverage'
  | 'must_include_not_covered'
  | 'equipment_collision'
  | 'scaling_requires_review'
  | 'over_budget'
  | 'kcal_out_of_target'
  | 'insufficient_safe_recipes';

export type MenuConflict = {
  code: MenuConflictCode;
  message: string;
  affectedIds?: string[];
};

export type EligibilitySummary = {
  eligibleRecipeCount: number;
  eligibleByRole: Record<PrimaryRole, number>;
  excludedByReason: Partial<Record<ExclusionReasonCode, number>>;
  feasibleMenuCountEstimate: number;
  canBuildRequestedMenu: boolean;
  coveredMustIncludeIngredientIds: string[];
  uncoveredMustIncludeIngredientIds: string[];
  conflicts: MenuConflict[];
};

export type ScoreBreakdown = {
  preferenceMatch: number;
  operationalFeasibility: number;
  budgetFit: number;
  nutritionDataCompleteness: number;
  menuVariety: number;
  kcalFit: number;
};

export type MenuCandidate = {
  candidateId: string;
  recipes: PlannerRecipe[];
  estimatedCostCents: number;
  energyKcalPerPerson: number;
  proteinGPerPerson: number;
  activeMinutes: number;
  maxTotalMinutes: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  hardChecksPassed: true;
  coveredMustIncludeIngredientIds: string[];
  isOverBudget: boolean;
};

export type MenuSummary = MenuCandidate & {
  conflicts: MenuConflict[];
  isPartial: boolean;
  candidateMenus: MenuCandidate[];
  eligibility?: EligibilitySummary;
};

export const defaultPlannerFilters: PlannerFilters = {
  cuisines: [],
  methods: [],
  mustIncludeIngredientIds: [],
  excludedIngredientIds: [],
  dietTags: [],
  excludedAllergens: [],
  maxTotalMinutes: null,
  availableEquipmentIds: [],
  maxSpiceLevel: 5,
  childFriendlyOnly: false,
  minHealthScore: 1,
};

export const defaultPlannerPreferences: PlannerPreferences = {
  guests: 6,
  dishCount: 4,
  servingStyle: 'family',
  budgetCents: 12000,
  compositionMode: 'balanced',
  energyTarget: 'any',
  roleOverrides: null,
};

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

function countByRole(): Record<PrimaryRole, number> {
  return Object.fromEntries(roles.map((role) => [role, 0])) as Record<PrimaryRole, number>;
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

export function normalizePlannerFilters(filters: PlannerFilters): PlannerFilters {
  const included = uniqueSorted(filters.mustIncludeIngredientIds);
  const excluded = uniqueSorted(filters.excludedIngredientIds).filter(
    (ingredientId) => !included.includes(ingredientId),
  );
  return {
    ...filters,
    cuisines: uniqueSorted(filters.cuisines),
    methods: uniqueSorted(filters.methods),
    mustIncludeIngredientIds: included,
    excludedIngredientIds: excluded,
    dietTags: uniqueSorted(filters.dietTags),
    excludedAllergens: uniqueSorted(filters.excludedAllergens),
    availableEquipmentIds: uniqueSorted(filters.availableEquipmentIds),
    maxTotalMinutes:
      filters.maxTotalMinutes === null
        ? null
        : Math.max(1, Math.min(240, Math.round(filters.maxTotalMinutes))),
    maxSpiceLevel: Math.max(0, Math.min(5, Math.round(filters.maxSpiceLevel))),
    childFriendlyOnly: Boolean(filters.childFriendlyOnly),
    minHealthScore: Math.max(1, Math.min(5, Math.round(filters.minHealthScore ?? 1))),
  };
}

function hasRequiredData(recipe: PlannerRecipe) {
  return Boolean(
    recipe.translations['zh-CN'].title &&
    recipe.translations['en-AU'].title &&
    recipe.ingredients.length &&
    recipe.cost &&
    recipe.nutrition &&
    recipe.media.objectKey,
  );
}

export function getRecipeExclusionReasons(
  recipe: PlannerRecipe,
  rawFilters: PlannerFilters,
): ExclusionReasonCode[] {
  const filters = normalizePlannerFilters(rawFilters);
  const reasons: ExclusionReasonCode[] = [];
  if (recipe.status !== 'published') reasons.push('not_published');
  if (!hasRequiredData(recipe)) reasons.push('missing_required_data');
  const excludedAllergenRows = recipe.allergens.filter((allergen) =>
    filters.excludedAllergens.includes(allergen.allergenCode),
  );
  if (excludedAllergenRows.some((allergen) => allergen.presence === 'unknown')) {
    reasons.push('allergen_unknown');
  }
  if (
    excludedAllergenRows.some((allergen) =>
      ['contains', 'derived_from', 'may_contain', 'unknown'].includes(allergen.presence),
    )
  ) {
    reasons.push('allergen_conflict');
  }
  const ingredientIds = recipe.ingredients.map((ingredient) => ingredient.ingredientId);
  if (ingredientIds.some((ingredientId) => filters.excludedIngredientIds.includes(ingredientId))) {
    reasons.push('excluded_ingredient');
  }
  if (
    filters.dietTags.length &&
    !filters.dietTags.every((code) => recipe.dietTags.some((tag) => tag.code === code))
  ) {
    reasons.push('diet_mismatch');
  }
  if (
    filters.cuisines.length &&
    !recipe.cuisines.some((cuisine) => filters.cuisines.includes(cuisine))
  ) {
    reasons.push('cuisine_mismatch');
  }
  if (
    filters.methods.length &&
    !recipe.methods.some((method) => filters.methods.includes(method))
  ) {
    reasons.push('method_mismatch');
  }
  if (filters.maxTotalMinutes !== null && recipe.totalMinutes > filters.maxTotalMinutes) {
    reasons.push('time_exceeded');
  }
  if (
    filters.availableEquipmentIds.length &&
    recipe.equipment.some(
      (equipment) => equipment.required && !filters.availableEquipmentIds.includes(equipment.id),
    )
  ) {
    reasons.push('equipment_unavailable');
  }
  if (recipe.spiceLevel > filters.maxSpiceLevel) reasons.push('spice_exceeded');
  if (filters.childFriendlyOnly && !recipe.childFriendly) reasons.push('not_child_friendly');
  if (healthScore(recipe) < filters.minHealthScore) reasons.push('health_below_min');
  return reasons;
}

export function getEligibleRecipes(recipes: PlannerRecipe[], filters: PlannerFilters) {
  return recipes.filter((recipe) => getRecipeExclusionReasons(recipe, filters).length === 0);
}

function roleTemplate(count: DishCount, style: PlannerServingStyle): PrimaryRole[] {
  const exact: Record<PlannerServingStyle, Record<number, PrimaryRole[]>> = {
    family: {
      1: ['main'],
      2: ['main', 'side'],
      3: ['main', 'side', 'staple'],
      4: ['main', 'side', 'staple', 'dessert'],
      5: ['main', 'main', 'side', 'staple', 'dessert'],
      6: ['main', 'main', 'side', 'side', 'staple', 'dessert'],
    },
    plated: {
      1: ['main'],
      2: ['main', 'starter'],
      3: ['starter', 'main', 'dessert'],
      4: ['starter', 'main', 'side', 'dessert'],
      5: ['starter', 'main', 'side', 'staple', 'dessert'],
      6: ['snack', 'starter', 'main', 'side', 'staple', 'dessert'],
    },
    buffet: {
      1: ['main'],
      2: ['main', 'side'],
      3: ['main', 'side', 'staple'],
      4: ['main', 'side', 'staple', 'dessert'],
      5: ['main', 'main', 'side', 'staple', 'dessert'],
      6: ['main', 'main', 'side', 'side', 'staple', 'dessert'],
    },
  };
  if (count <= 6) return exact[style][count];
  const result = [...exact[style][6]];
  const additions: PrimaryRole[] = ['side', 'salad', 'starter', 'soup', 'snack', 'staple', 'main'];
  let index = 0;
  while (result.length < count) {
    const next = additions[index % additions.length];
    if (next === 'main' && result.filter((role) => role === 'main').length >= 3) {
      index += 1;
      continue;
    }
    result.splice(Math.max(result.length - 1, 0), 0, next);
    index += 1;
  }
  return result;
}

/** Course order used whenever a menu is laid out for a reader or a cook. */
export const courseOrder: PrimaryRole[] = [
  'snack',
  'starter',
  'soup',
  'salad',
  'main',
  'side',
  'staple',
  'dessert',
];

/**
 * The course list a menu is built from. Explicit overrides win; otherwise the
 * suggested template for the requested dish count and serving style applies.
 */
export function resolveRoleTemplate(preferences: PlannerPreferences): PrimaryRole[] {
  const overrides = preferences.roleOverrides;
  if (!overrides) return roleTemplate(preferences.dishCount, preferences.servingStyle);
  const expanded = courseOrder.flatMap((role) =>
    Array.from({ length: Math.max(0, Math.min(4, overrides[role] ?? 0)) }, () => role),
  );
  return expanded.length ? expanded : roleTemplate(preferences.dishCount, preferences.servingStyle);
}

/** Counts per course for a preference set, used to seed the structure editor. */
export function roleCountsFor(preferences: PlannerPreferences): Record<PrimaryRole, number> {
  const counts = countByRole();
  resolveRoleTemplate(preferences).forEach((role) => {
    counts[role] += 1;
  });
  return counts;
}

function compatibleRoles(role: PrimaryRole): PrimaryRole[] {
  if (role === 'starter') return ['starter', 'soup', 'snack'];
  if (role === 'side') return ['side', 'salad', 'soup'];
  return [role];
}

function matchesRole(recipe: PlannerRecipe, role: PrimaryRole) {
  return compatibleRoles(role).some(
    (candidateRole) =>
      recipe.primaryRole === candidateRole || recipe.secondaryRoles.includes(candidateRole),
  );
}

export function getRoleTemplate(count: DishCount, style: PlannerServingStyle) {
  return roleTemplate(count, style);
}

function recipeCostForGuests(recipe: PlannerRecipe, guests: number) {
  return Math.round(recipe.cost.totalCents * (Math.max(1, guests) / recipe.baseServings));
}

function ingredientIds(recipe: PlannerRecipe) {
  return new Set(recipe.ingredients.map((ingredient) => ingredient.ingredientId));
}

/**
 * The launch planner assumes one shared station for each equipment id. A menu
 * can be cooked in sequence, but a station cannot be occupied beyond the
 * four-hour planning window. This gives `occupiedMinutes` a deterministic
 * menu-level meaning without inventing equipment quantities in the UI.
 */
const EQUIPMENT_WINDOW_MINUTES = 240;

export function getMenuEquipmentCollisionIds(recipes: PlannerRecipe[]) {
  const occupied = new Map<string, number>();
  recipes.forEach((recipe) =>
    recipe.equipment
      .filter((equipment) => equipment.required)
      .forEach((equipment) => {
        occupied.set(
          equipment.id,
          (occupied.get(equipment.id) ?? 0) + equipment.occupiedMinutes * equipment.quantity,
        );
      }),
  );
  return [...occupied.entries()]
    .filter(([, minutes]) => minutes > EQUIPMENT_WINDOW_MINUTES)
    .map(([id]) => id)
    .sort();
}

function baseRecipeScore(recipe: PlannerRecipe, preferences: PlannerPreferences) {
  const style = recipe.servingStyles[preferences.servingStyle];
  const time = 1 - Math.min(recipe.activeMinutes, 120) / 120;
  const prep = Math.min(recipe.advanceMinutes / 60, 1);
  const cost =
    1 -
    Math.min(recipeCostForGuests(recipe, preferences.guests), preferences.budgetCents) /
      Math.max(preferences.budgetCents, 1);
  const modeFactor =
    preferences.compositionMode === 'budget'
      ? cost
      : preferences.compositionMode === 'easy'
        ? time * 0.8 + prep * 0.2
        : style / 100;
  return style * 0.45 + modeFactor * 40 + (recipe.nutrition.confidence / 100) * 20;
}

type PartialCandidate = {
  recipes: PlannerRecipe[];
  coveredMustIncludeIngredientIds: string[];
  cost: number;
};

function partialSort(
  a: PartialCandidate,
  b: PartialCandidate,
  preferences: PlannerPreferences,
  mustInclude: string[],
) {
  const aCovered = a.coveredMustIncludeIngredientIds.length / Math.max(mustInclude.length, 1);
  const bCovered = b.coveredMustIncludeIngredientIds.length / Math.max(mustInclude.length, 1);
  if (aCovered !== bCovered) return bCovered - aCovered;
  const aBase = a.recipes.reduce((sum, recipe) => sum + baseRecipeScore(recipe, preferences), 0);
  const bBase = b.recipes.reduce((sum, recipe) => sum + baseRecipeScore(recipe, preferences), 0);
  if (aBase !== bBase) return bBase - aBase;
  if (a.cost !== b.cost) return a.cost - b.cost;
  return a.recipes
    .map((recipe) => recipe.id)
    .join('|')
    .localeCompare(b.recipes.map((recipe) => recipe.id).join('|'));
}

function normalizeDimension(value: number) {
  return Math.max(0, Math.min(1, value));
}

function scoreCandidate(
  recipes: PlannerRecipe[],
  preferences: PlannerPreferences,
  filters: PlannerFilters,
): ScoreBreakdown {
  const selectedCuisines = new Set(filters.cuisines);
  const selectedMethods = new Set(filters.methods);
  const cuisineCoverage = selectedCuisines.size
    ? new Set(recipes.flatMap((recipe) => recipe.cuisines)).size / selectedCuisines.size
    : 1;
  const methodCoverage = selectedMethods.size
    ? new Set(recipes.flatMap((recipe) => recipe.methods)).size / selectedMethods.size
    : 1;
  const selectedIngredients = new Set(filters.mustIncludeIngredientIds);
  const foundIngredients = new Set(
    recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.ingredientId)),
  );
  const includeCoverage = selectedIngredients.size
    ? [...selectedIngredients].filter((id) => foundIngredients.has(id)).length /
      selectedIngredients.size
    : 1;
  const prepScore =
    recipes.reduce((sum, recipe) => sum + Math.min(recipe.advanceMinutes / 60, 1), 0) /
    Math.max(recipes.length, 1);
  const preferenceWeight =
    (filters.cuisines.length ? 0.3 : 0) +
    (filters.methods.length ? 0.2 : 0) +
    (filters.mustIncludeIngredientIds.length ? 0.35 : 0) +
    0.15;
  const preferenceMatch = normalizeDimension(
    ((filters.cuisines.length ? cuisineCoverage * 0.3 : 0) +
      (filters.methods.length ? methodCoverage * 0.2 : 0) +
      (filters.mustIncludeIngredientIds.length ? includeCoverage * 0.35 : 0) +
      prepScore * 0.15) /
      preferenceWeight,
  );
  const serving =
    recipes.reduce((sum, recipe) => sum + recipe.servingStyles[preferences.servingStyle], 0) /
    Math.max(recipes.length * 100, 1);
  const activeScore =
    1 -
    Math.min(
      recipes.reduce((sum, recipe) => sum + recipe.activeMinutes, 0),
      240,
    ) /
      240;
  const holdScore =
    recipes.reduce((sum, recipe) => sum + (recipe.holdQuality + recipe.reheatingQuality) / 10, 0) /
    Math.max(recipes.length, 1);
  const equipmentUsage = recipes.reduce((usage, recipe) => {
    recipe.equipment
      .filter((equipment) => equipment.required)
      .forEach((equipment) => {
        usage.set(
          equipment.id,
          (usage.get(equipment.id) ?? 0) + equipment.occupiedMinutes * equipment.quantity,
        );
      });
    return usage;
  }, new Map<string, number>());
  const equipmentSlack = equipmentUsage.size
    ? [...equipmentUsage.values()].reduce(
        (sum, minutes) => sum + Math.max(0, 1 - minutes / EQUIPMENT_WINDOW_MINUTES),
        0,
      ) / equipmentUsage.size
    : 1;
  const operationalFeasibility = normalizeDimension(
    serving * 0.35 + activeScore * 0.25 + equipmentSlack * 0.2 + holdScore * 0.2,
  );
  const estimatedCost = recipes.reduce(
    (sum, recipe) => sum + recipeCostForGuests(recipe, preferences.guests),
    0,
  );
  const budgetRatio = estimatedCost / Math.max(preferences.budgetCents, 1);
  const budgetFit = normalizeDimension(
    budgetRatio <= 1
      ? 0.75 + (1 - budgetRatio) * 0.25
      : budgetRatio <= 1.1
        ? 0.75 - (budgetRatio - 1) * 2.5
        : 0,
  );
  const nutritionCompleteness = normalizeDimension(
    (recipes.reduce((sum, recipe) => sum + recipe.nutrition.confidence / 100, 0) /
      Math.max(recipes.length, 1)) *
      0.5 +
      (recipes.some((recipe) => ['side', 'salad', 'soup'].includes(recipe.primaryRole)) ? 1 : 0) *
        0.25 +
      (new Set(
        recipes.flatMap((recipe) =>
          recipe.ingredients.slice(0, 2).map((ingredient) => ingredient.ingredientId),
        ),
      ).size >= Math.min(recipes.length, 3)
        ? 1
        : 0.5) *
        0.25,
  );
  const cuisineVariety =
    new Set(recipes.flatMap((recipe) => recipe.cuisines)).size / Math.max(recipes.length, 1);
  const methodVariety =
    new Set(recipes.flatMap((recipe) => recipe.methods)).size / Math.max(recipes.length, 1);
  const ingredientVariety =
    new Set(
      recipes.flatMap((recipe) =>
        recipe.ingredients.slice(0, 2).map((ingredient) => ingredient.ingredientId),
      ),
    ).size / Math.max(recipes.length * 2, 1);
  const menuVariety = normalizeDimension(
    cuisineVariety * 0.35 + methodVariety * 0.3 + ingredientVariety * 0.25 + 0.1,
  );
  const energyPerPerson = recipes.reduce((sum, recipe) => sum + recipe.nutrition.energyKcal, 0);
  return {
    preferenceMatch,
    operationalFeasibility,
    budgetFit,
    nutritionDataCompleteness: nutritionCompleteness,
    menuVariety,
    kcalFit: normalizeDimension(energyFit(energyPerPerson, preferences.energyTarget)),
  };
}

function weightedScore(breakdown: ScoreBreakdown, mode: CompositionMode) {
  const weights = {
    balanced: [25, 25, 20, 15, 15],
    budget: [15, 25, 40, 10, 10],
    easy: [15, 45, 20, 5, 15],
  }[mode];
  return Math.round(
    breakdown.preferenceMatch * weights[0] +
      breakdown.operationalFeasibility * weights[1] +
      breakdown.budgetFit * weights[2] +
      breakdown.nutritionDataCompleteness * weights[3] +
      breakdown.menuVariety * weights[4] +
      // The energy target is additive so it can reorder candidates without
      // diluting the weights a composition mode was tuned with.
      breakdown.kcalFit * 20,
  );
}

function buildCandidate(
  recipes: PlannerRecipe[],
  preferences: PlannerPreferences,
  filters: PlannerFilters,
  candidateId: string,
): MenuCandidate {
  const estimatedCostCents = recipes.reduce(
    (sum, recipe) => sum + recipeCostForGuests(recipe, preferences.guests),
    0,
  );
  const covered = uniqueSorted(
    filters.mustIncludeIngredientIds.filter((id) =>
      recipes.some((recipe) => ingredientIds(recipe).has(id)),
    ),
  );
  const scoreBreakdown = scoreCandidate(recipes, preferences, filters);
  return {
    candidateId,
    recipes,
    estimatedCostCents,
    energyKcalPerPerson: Math.round(
      recipes.reduce((sum, recipe) => sum + recipe.nutrition.energyKcal, 0),
    ),
    proteinGPerPerson: Math.round(
      recipes.reduce((sum, recipe) => sum + recipe.nutrition.proteinG, 0),
    ),
    activeMinutes: recipes.reduce((sum, recipe) => sum + recipe.activeMinutes, 0),
    maxTotalMinutes: recipes.reduce((max, recipe) => Math.max(max, recipe.totalMinutes), 0),
    score: weightedScore(scoreBreakdown, preferences.compositionMode),
    scoreBreakdown,
    hardChecksPassed: true,
    coveredMustIncludeIngredientIds: covered,
    isOverBudget: estimatedCostCents > Math.round(preferences.budgetCents * 1.1),
  };
}

function candidateSort(a: MenuCandidate, b: MenuCandidate) {
  if (a.isOverBudget !== b.isOverBudget) return a.isOverBudget ? 1 : -1;
  if (a.score !== b.score) return b.score - a.score;
  if (a.estimatedCostCents !== b.estimatedCostCents)
    return a.estimatedCostCents - b.estimatedCostCents;
  return a.candidateId.localeCompare(b.candidateId);
}

function hasMenuHardConstraints(
  candidate: MenuCandidate,
  preferences: PlannerPreferences,
  filters: PlannerFilters,
) {
  const template = resolveRoleTemplate(preferences);
  if (
    new Set(filters.mustIncludeIngredientIds).size !==
    new Set(candidate.coveredMustIncludeIngredientIds).size
  )
    return false;
  if (candidate.recipes.some((recipe) => recipe.servingStyles[preferences.servingStyle] < 40))
    return false;
  if (getMenuEquipmentCollisionIds(candidate.recipes).length) return false;
  return candidate.recipes.length === template.length;
}

export function summarizeEligibility(
  recipes: PlannerRecipe[],
  filters: PlannerFilters,
  preferences: PlannerPreferences = defaultPlannerPreferences,
): EligibilitySummary {
  const normalized = normalizePlannerFilters(filters);
  const eligible = getEligibleRecipes(recipes, normalized);
  const eligibleByRole = countByRole();
  eligible.forEach((recipe) => {
    eligibleByRole[recipe.primaryRole] += 1;
  });
  const excludedByReason: Partial<Record<ExclusionReasonCode, number>> = {};
  recipes.forEach((recipe) =>
    getRecipeExclusionReasons(recipe, normalized).forEach((reason) => {
      excludedByReason[reason] = (excludedByReason[reason] ?? 0) + 1;
    }),
  );
  const found = new Set(
    eligible.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.ingredientId)),
  );
  const covered = normalized.mustIncludeIngredientIds.filter((id) => found.has(id));
  const uncovered = normalized.mustIncludeIngredientIds.filter((id) => !found.has(id));
  const template = resolveRoleTemplate(preferences);
  const canRoleBuild = template.every((role) =>
    eligible.some((recipe) => matchesRole(recipe, role)),
  );
  const conflicts: MenuConflict[] = [];
  if (!canRoleBuild)
    conflicts.push({
      code: 'insufficient_role_coverage',
      message: 'At least one requested menu role has no safe recipe.',
    });
  if (uncovered.length)
    conflicts.push({
      code: 'must_include_not_covered',
      message: 'Some must-include ingredients cannot be covered by the safe recipe set.',
      affectedIds: uncovered,
    });
  if (eligible.length < preferences.dishCount)
    conflicts.push({
      code: 'insufficient_safe_recipes',
      message: 'There are not enough distinct safe recipes to fill the requested count.',
    });
  return {
    eligibleRecipeCount: eligible.length,
    eligibleByRole,
    excludedByReason,
    feasibleMenuCountEstimate:
      canRoleBuild && !uncovered.length ? Math.min(24, eligible.length) : 0,
    canBuildRequestedMenu:
      canRoleBuild && !uncovered.length && eligible.length >= preferences.dishCount,
    coveredMustIncludeIngredientIds: covered,
    uncoveredMustIncludeIngredientIds: uncovered,
    conflicts,
  };
}

export function generateMenuCandidates(
  recipes: PlannerRecipe[],
  preferences: PlannerPreferences,
  rawFilters: PlannerFilters = defaultPlannerFilters,
): { candidates: MenuCandidate[]; partial: MenuCandidate | null; conflicts: MenuConflict[] } {
  const filters = normalizePlannerFilters(rawFilters);
  const eligible = getEligibleRecipes(recipes, filters);
  const template = resolveRoleTemplate(preferences);
  const buckets = template.map((role) =>
    eligible
      .filter(
        (recipe) =>
          matchesRole(recipe, role) && recipe.servingStyles[preferences.servingStyle] >= 40,
      )
      .sort(
        (a, b) =>
          baseRecipeScore(b, preferences) - baseRecipeScore(a, preferences) ||
          a.id.localeCompare(b.id),
      )
      .slice(0, 12),
  );
  let partials: PartialCandidate[] = [
    { recipes: [], coveredMustIncludeIngredientIds: [], cost: 0 },
  ];
  let sawEquipmentCollision = false;
  for (const bucket of buckets) {
    const next: PartialCandidate[] = [];
    for (const partial of partials) {
      for (const recipe of bucket) {
        if (partial.recipes.some((item) => item.id === recipe.id)) continue;
        if (getMenuEquipmentCollisionIds([...partial.recipes, recipe]).length) {
          sawEquipmentCollision = true;
          continue;
        }
        next.push({
          recipes: [...partial.recipes, recipe],
          coveredMustIncludeIngredientIds: uniqueSorted([
            ...partial.coveredMustIncludeIngredientIds,
            ...filters.mustIncludeIngredientIds.filter((id) => ingredientIds(recipe).has(id)),
          ]),
          cost: partial.cost + recipeCostForGuests(recipe, preferences.guests),
        });
      }
    }
    partials = next
      .sort((a, b) => partialSort(a, b, preferences, filters.mustIncludeIngredientIds))
      .slice(0, 160);
    if (!partials.length) break;
  }
  const complete = partials
    .map((partial, index) =>
      buildCandidate(
        partial.recipes,
        preferences,
        filters,
        `candidate-${String(index + 1).padStart(2, '0')}`,
      ),
    )
    .filter((candidate) => hasMenuHardConstraints(candidate, preferences, filters));
  complete.sort(candidateSort);
  const withinTolerance = complete.filter((candidate) => !candidate.isOverBudget);
  const selectedPool = (withinTolerance.length ? withinTolerance : complete).slice(0, 24);
  const conflicts: MenuConflict[] = [];
  if (!selectedPool.length) {
    conflicts.push({
      code: 'insufficient_role_coverage',
      message: 'No complete role-compatible safe menu was found.',
    });
    if (filters.mustIncludeIngredientIds.length)
      conflicts.push({
        code: 'must_include_not_covered',
        message: 'No complete candidate covers every must-include ingredient.',
      });
    if (eligible.length < preferences.dishCount)
      conflicts.push({
        code: 'insufficient_safe_recipes',
        message: 'The safe recipe set is smaller than the requested menu.',
      });
    if (sawEquipmentCollision)
      conflicts.push({
        code: 'equipment_collision',
        message: 'The requested combination would exceed the shared equipment planning window.',
      });
  } else if (!withinTolerance.length)
    conflicts.push({
      code: 'over_budget',
      message: 'Every complete safe menu exceeds the budget tolerance.',
    });
  const partial = partials.length
    ? buildCandidate(partials[0].recipes, preferences, filters, 'partial-01')
    : null;
  if (partial && partial.recipes.length < preferences.dishCount)
    conflicts.push({
      code: 'insufficient_safe_recipes',
      message: 'Only a partial safe menu can be shown under these conditions.',
    });
  return { candidates: selectedPool, partial, conflicts };
}

export function composeMenu(
  recipes: PlannerRecipe[],
  preferences: PlannerPreferences,
  variation = 0,
  rawFilters: PlannerFilters = defaultPlannerFilters,
  substitutions: Record<number, string> = {},
): MenuSummary {
  const filters = normalizePlannerFilters(rawFilters);
  const { candidates, partial, conflicts } = generateMenuCandidates(recipes, preferences, filters);
  const choicePool = candidates.length ? candidates : partial ? [partial] : [];
  const base = choicePool.length
    ? choicePool[variation % choicePool.length]
    : buildCandidate([], preferences, filters, 'empty-01');
  const chosen = applySubstitutions(base, recipes, preferences, filters, substitutions);
  const eligibility = summarizeEligibility(recipes, filters, preferences);
  const mergedConflicts = [
    ...conflicts,
    ...eligibility.conflicts.filter(
      (item) => !conflicts.some((existing) => existing.code === item.code),
    ),
  ];
  if (
    chosen.recipes.length &&
    !isEnergyOnTarget(chosen.energyKcalPerPerson, preferences.energyTarget)
  ) {
    mergedConflicts.push({
      code: 'kcal_out_of_target',
      message: 'Energy per person sits outside the requested target band.',
    });
  }
  const template = resolveRoleTemplate(preferences);
  return {
    ...chosen,
    conflicts: mergedConflicts,
    isPartial: chosen.recipes.length < template.length,
    candidateMenus: candidates.slice(0, 12),
    eligibility,
  };
}

/**
 * Replaces individual courses in a composed menu. Substitutions come from the
 * course-level swap control and are re-scored as a whole menu, so totals and
 * budget warnings always describe what the reader actually sees.
 */
function applySubstitutions(
  candidate: MenuCandidate,
  recipes: PlannerRecipe[],
  preferences: PlannerPreferences,
  filters: PlannerFilters,
  substitutions: Record<number, string>,
): MenuCandidate {
  const entries = Object.entries(substitutions);
  if (!entries.length || !candidate.recipes.length) return candidate;
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  let changed = false;
  const next = candidate.recipes.map((recipe, index) => {
    const replacementId = substitutions[index];
    if (!replacementId) return recipe;
    const replacement = byId.get(replacementId);
    if (!replacement || replacement.id === recipe.id) return recipe;
    // A substitution that duplicates another course would silently shorten the
    // menu, so it is ignored rather than applied.
    if (candidate.recipes.some((item, position) => position !== index && item.id === replacementId))
      return recipe;
    changed = true;
    return replacement;
  });
  if (!changed) return candidate;
  return buildCandidate(next, preferences, filters, `${candidate.candidateId}-swap`);
}

/**
 * Alternatives for one course under the current conditions, ordered the same
 * way the composer ranks them and excluding what is already on the table.
 */
export function getRoleAlternatives(
  recipes: PlannerRecipe[],
  preferences: PlannerPreferences,
  rawFilters: PlannerFilters,
  role: PrimaryRole,
  excludeIds: string[],
  limit = 8,
): PlannerRecipe[] {
  const filters = normalizePlannerFilters(rawFilters);
  const excluded = new Set(excludeIds);
  return getEligibleRecipes(recipes, filters)
    .filter(
      (recipe) =>
        !excluded.has(recipe.id) &&
        matchesRole(recipe, role) &&
        recipe.servingStyles[preferences.servingStyle] >= 40,
    )
    .sort(
      (a, b) =>
        baseRecipeScore(b, preferences) - baseRecipeScore(a, preferences) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}

export function activeFilterCount(filters: PlannerFilters) {
  return (
    filters.cuisines.length +
    filters.methods.length +
    filters.mustIncludeIngredientIds.length +
    filters.excludedIngredientIds.length +
    filters.dietTags.length +
    filters.excludedAllergens.length +
    filters.availableEquipmentIds.length +
    (filters.maxTotalMinutes === null ? 0 : 1) +
    (filters.maxSpiceLevel === 5 ? 0 : 1) +
    (filters.childFriendlyOnly ? 1 : 0) +
    (filters.minHealthScore > 1 ? 1 : 0)
  );
}

export function toggleArrayValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
