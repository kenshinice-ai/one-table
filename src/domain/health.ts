import type { PlannerRecipe } from './catalogue';

export type HealthScore = 1 | 2 | 3 | 4 | 5;
export type EnergyTarget = 'any' | 'light' | 'medium' | 'hearty';

/**
 * A deterministic 1–5 planning score derived from the nutrition panel each
 * published recipe already carries. It deliberately uses per-serve thresholds
 * from the same editorial data the rest of the planner trusts, so the score can
 * be recomputed anywhere (UI, tests, export) without a model in the loop.
 *
 * Desserts are judged on a wider sugar allowance: a dessert is expected to be
 * sweet, and penalising every one of them would make the filter useless for
 * building a complete menu.
 */
export function healthScore(recipe: PlannerRecipe): HealthScore {
  const { sodiumMg, fibreG, saturatedFatG, sugarsG } = recipe.nutrition;
  const sugarLimit = recipe.primaryRole === 'dessert' ? 30 : 20;
  let score = 3;
  if (sodiumMg < 600) score += 1;
  if (sodiumMg > 900) score -= 1;
  if (fibreG >= 6) score += 1;
  if (saturatedFatG > 8) score -= 1;
  if (sugarsG > sugarLimit) score -= 1;
  return Math.max(1, Math.min(5, score)) as HealthScore;
}

/** Inclusive kcal-per-person band for each target. `null` means no target. */
export function energyTargetBand(target: EnergyTarget): [number, number] | null {
  if (target === 'light') return [0, 900];
  if (target === 'medium') return [900, 1400];
  if (target === 'hearty') return [1400, Number.POSITIVE_INFINITY];
  return null;
}

/**
 * Scores how well a menu's energy per person sits inside the chosen band. This
 * feeds the composition score rather than a hard filter: a table should always
 * get a menu, with a visible warning when the target cannot be met.
 */
export function energyFit(energyKcalPerPerson: number, target: EnergyTarget) {
  const band = energyTargetBand(target);
  if (!band) return 1;
  const [low, high] = band;
  if (energyKcalPerPerson >= low && energyKcalPerPerson <= high) return 1;
  const distance =
    energyKcalPerPerson < low ? low - energyKcalPerPerson : energyKcalPerPerson - high;
  return Math.max(0, 1 - distance / 600);
}

export function isEnergyOnTarget(energyKcalPerPerson: number, target: EnergyTarget) {
  const band = energyTargetBand(target);
  if (!band) return true;
  return energyKcalPerPerson >= band[0] && energyKcalPerPerson <= band[1];
}
