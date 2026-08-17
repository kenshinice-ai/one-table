import type { RecipeImport } from './batch-a';

/**
 * The subset of a recipe the planner and the menu board actually read.
 *
 * `RecipeImport` is structurally assignable to this, so the editorial data and
 * the fetched payload share one code path. Keeping the type narrow is what lets
 * the long-form cooking text stay out of the first load.
 */
export type PlannerRecipe = Omit<
  RecipeImport,
  'translations' | 'source' | 'substitutions' | 'media' | 'scalingNotes'
> & {
  translations: {
    'zh-CN': { title: string; summary: string };
    'en-AU': { title: string; summary: string };
  };
  media: { objectKey: string; altEn: string; altZh: string };
};

export type IngredientDefinition = {
  id: string;
  nameEn: string;
  nameZh: string;
  category: string;
};

export type RecipeStep = {
  text: string;
  minutes?: number;
  phase?: 'prep' | 'cook' | 'plate';
  tip?: string;
};

export type RecipeDetailRecord = {
  id: string;
  safetyNotes: string | null;
  translations: Record<
    'zh-CN' | 'en-AU',
    {
      instructions: string[];
      structuredInstructions: RecipeStep[] | null;
      servingNote: string | null;
    }
  >;
};

export type PlanningPayload = {
  version: string;
  ingredients: IngredientDefinition[];
  recipes: PlannerRecipe[];
};

export async function fetchPlanningCatalogue(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Catalogue request failed with ${response.status}`);
  return (await response.json()) as PlanningPayload;
}

export async function fetchRecipeDetails(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Recipe detail request failed with ${response.status}`);
  const payload = (await response.json()) as { recipes: RecipeDetailRecord[] };
  return new Map(payload.recipes.map((record) => [record.id, record]));
}
