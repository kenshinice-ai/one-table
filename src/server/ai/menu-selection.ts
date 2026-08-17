import { z } from 'zod';

import type { Locale } from '@/domain/recipe';
import type {
  CompositionMode,
  MenuCandidate,
  PlannerFilters,
  PlannerPreferences,
} from '@/domain/planner';

export const AI_RULESET_VERSION = 'planner-rules-2026-08-16.1';
export const AI_PROMPT_VERSION = 'menu-curation-2026-08-16.1';

export const aiMenuSelectionSchema = z.object({
  candidateId: z.string().min(1),
  confidence: z.number().min(0).max(1),
  rationaleZh: z.string().min(1).max(320),
  rationaleEn: z.string().min(1).max(420),
  highlights: z
    .array(
      z.object({
        code: z.enum(['flavour', 'texture', 'colour', 'temperature', 'workflow', 'budget']),
        noteZh: z.string().min(1).max(120),
        noteEn: z.string().min(1).max(160),
      }),
    )
    .max(4),
});

export type AiMenuSelection = z.infer<typeof aiMenuSelectionSchema>;

export type AiMenuSelectionInput = {
  promptVersion: string;
  catalogueVersion: string;
  rulesetVersion: string;
  filterRevision: number;
  locale: Locale;
  compositionMode: CompositionMode;
  event: Pick<PlannerPreferences, 'guests' | 'dishCount' | 'servingStyle' | 'budgetCents'>;
  selectedPreferenceCodes: Pick<
    PlannerFilters,
    'cuisines' | 'methods' | 'mustIncludeIngredientIds'
  >;
  candidates: Array<{
    candidateId: string;
    recipeIds: string[];
    dishes: Array<{
      recipeId: string;
      titleZh: string;
      titleEn: string;
      primaryRole: string;
      cuisines: string[];
      methods: string[];
      focusIngredientIds: string[];
    }>;
    estimatedCostCents: number;
    energyKcalPerPerson: number | null;
    activeMinutes: number;
    longestDishMinutes: number;
    preferenceCoverage: Record<string, number>;
    score: number;
    scoreBreakdown: Record<string, number>;
    hardChecksPassed: true;
  }>;
};

export const AI_SYSTEM_PROMPT = `You are a menu curation layer, not a food-safety authority and not a recipe generator.
Choose exactly one candidateId from the supplied candidate menus. Every candidate has already
passed deterministic safety and feasibility checks. Never invent a candidate, recipe, ingredient,
quantity, allergen claim, nutrition value or price. Compare only the supplied facts. Prefer a
coherent gathering menu with complementary flavours, textures, colours, temperatures and a
practical cooking workflow, while respecting the requested composition mode. Return only the
required structured JSON. If candidates are effectively tied, select the higher deterministic
score; if still tied, select the lexicographically smaller candidateId.`;

export function toAiMenuSelectionInput(
  candidates: MenuCandidate[],
  filters: PlannerFilters,
  preferences: PlannerPreferences,
  locale: Locale,
  filterRevision: number,
): AiMenuSelectionInput {
  return {
    promptVersion: AI_PROMPT_VERSION,
    catalogueVersion: '2026-08-launch-1',
    rulesetVersion: AI_RULESET_VERSION,
    filterRevision,
    locale,
    compositionMode: preferences.compositionMode,
    event: {
      guests: preferences.guests,
      dishCount: preferences.dishCount,
      servingStyle: preferences.servingStyle,
      budgetCents: preferences.budgetCents,
    },
    selectedPreferenceCodes: {
      cuisines: filters.cuisines,
      methods: filters.methods,
      mustIncludeIngredientIds: filters.mustIncludeIngredientIds,
    },
    candidates: candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      recipeIds: candidate.recipes.map((recipe) => recipe.id),
      dishes: candidate.recipes.map((recipe) => ({
        recipeId: recipe.id,
        titleZh: recipe.translations['zh-CN'].title,
        titleEn: recipe.translations['en-AU'].title,
        primaryRole: recipe.primaryRole,
        cuisines: recipe.cuisines,
        methods: recipe.methods,
        focusIngredientIds: recipe.ingredients
          .slice(0, 3)
          .map((ingredient) => ingredient.ingredientId),
      })),
      estimatedCostCents: candidate.estimatedCostCents,
      energyKcalPerPerson: candidate.energyKcalPerPerson,
      activeMinutes: candidate.activeMinutes,
      longestDishMinutes: candidate.maxTotalMinutes,
      preferenceCoverage: candidate.coveredMustIncludeIngredientIds.reduce<Record<string, number>>(
        (result, id) => {
          result[id] = 1;
          return result;
        },
        {},
      ),
      score: candidate.score,
      scoreBreakdown: candidate.scoreBreakdown,
      hardChecksPassed: true,
    })),
  };
}

export function selectDeterministicCandidate(candidates: MenuCandidate[]): AiMenuSelection | null {
  const first = [...candidates].sort(
    (a, b) => b.score - a.score || a.candidateId.localeCompare(b.candidateId),
  )[0];
  if (!first) return null;
  return {
    candidateId: first.candidateId,
    confidence: 1,
    rationaleZh: '已使用确定性规则选择最高分安全候选；AI 搭配说明暂不可用。',
    rationaleEn:
      'The highest-scoring safe candidate was selected deterministically; AI curation is currently unavailable.',
    highlights: [
      {
        code: 'workflow',
        noteZh: '候选已通过发布、过敏原、饮食、设备与预算规则复核。',
        noteEn: 'The candidate passed publication, allergen, diet, equipment and budget checks.',
      },
    ],
  };
}

export function validateAiSelection(
  raw: unknown,
  candidates: MenuCandidate[],
  expectedRevision: number,
  responseRevision: number,
):
  | { ok: true; selection: AiMenuSelection; candidate: MenuCandidate }
  | { ok: false; reason: string } {
  if (responseRevision !== expectedRevision) return { ok: false, reason: 'stale_filter_revision' };
  const parsed = aiMenuSelectionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: 'invalid_structured_output' };
  const candidate = candidates.find((item) => item.candidateId === parsed.data.candidateId);
  if (!candidate) return { ok: false, reason: 'candidate_not_in_allow_list' };
  if (!candidate.hardChecksPassed) return { ok: false, reason: 'candidate_hard_check_failed' };
  return { ok: true, selection: parsed.data, candidate };
}
