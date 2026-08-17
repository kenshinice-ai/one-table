export type Locale = 'zh-CN' | 'en-AU';
export type RecipeStatus = 'draft' | 'review' | 'published' | 'archived';
export type RecipeDifficulty = 'easy' | 'medium' | 'advanced';
export type ServingStyle = 'family' | 'plated' | 'buffet';

export interface RecipeSummary {
  id: string;
  slug: string;
  status: RecipeStatus;
  title: string;
  summary: string;
  primaryRoleCode: string;
  activeMinutes: number;
  totalMinutes: number;
  difficulty: RecipeDifficulty;
  spiceLevel: number;
}

export interface RecipeRecord extends RecipeSummary {
  baseServings: number;
  advanceMinutes: number;
  childFriendly: boolean;
  instructions: string[];
  servingStyles: Array<{
    style: ServingStyle;
    suitabilityScore: number;
  }>;
  ingredients: Array<{
    id: string;
    canonicalName: string;
    normalizedQuantity: number | null;
    normalizedUnit: 'g' | 'ml' | 'count' | null;
    displayQuantity: string;
    optional: boolean;
    scalingStrategy: 'linear' | 'rounded' | 'constant' | 'manual';
  }>;
}

