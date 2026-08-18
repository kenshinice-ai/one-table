import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { launchRecipes } from '@/../data/recipes';
import {
  composeMenu,
  defaultPlannerFilters,
  defaultPlannerPreferences,
  type PlannerFilters,
  type PlannerPreferences,
} from '@/domain/planner';
import {
  AI_RULESET_VERSION,
  selectDeterministicCandidate,
  toAiMenuSelectionInput,
} from '@/server/ai/menu-selection';

export const runtime = 'nodejs';

const requestSchema = z.object({
  filters: z
    .object({
      cuisines: z.array(z.string()).default([]),
      methods: z.array(z.string()).default([]),
      mustIncludeIngredientIds: z.array(z.string()).default([]),
      excludedIngredientIds: z.array(z.string()).default([]),
      dietTags: z.array(z.string()).default([]),
      excludedAllergens: z.array(z.string()).default([]),
      maxTotalMinutes: z.number().nullable().default(null),
      availableEquipmentIds: z.array(z.string()).default([]),
      maxSpiceLevel: z.number().default(5),
      childFriendlyOnly: z.boolean().default(false),
    })
    .default(defaultPlannerFilters),
  preferences: z
    .object({
      guests: z.number().int().min(1).max(30).default(6),
      dishCount: z.number().int().min(1).max(10).default(4),
      servingStyle: z.enum(['family', 'plated', 'buffet']).default('family'),
      budgetCents: z.number().int().min(2000).max(100000).nullable().default(null),
      compositionMode: z.enum(['balanced', 'budget', 'easy']).default('balanced'),
    })
    .default(defaultPlannerPreferences),
  locale: z.enum(['zh-CN', 'en-AU']).default('zh-CN'),
  filterRevision: z.number().int().nonnegative().default(0),
  variation: z.number().int().nonnegative().default(0),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.issues },
      { status: 400 },
    );
  const body = parsed.data as {
    filters: PlannerFilters;
    preferences: PlannerPreferences;
    locale: 'zh-CN' | 'en-AU';
    filterRevision: number;
    variation: number;
  };
  const menu = composeMenu(launchRecipes, body.preferences, body.variation, body.filters);
  const aiInput = toAiMenuSelectionInput(
    menu.candidateMenus,
    body.filters,
    body.preferences,
    body.locale,
    body.filterRevision,
  );
  const fallbackSelection = selectDeterministicCandidate(menu.candidateMenus);
  return NextResponse.json({
    data: menu,
    ai: {
      status: 'unavailable',
      rulesetVersion: AI_RULESET_VERSION,
      selection: fallbackSelection,
      input: aiInput,
      message: 'AI curation is optional; the deterministic safe menu remains authoritative.',
    },
  });
}
