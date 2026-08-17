import { z } from 'zod';

const id = z.string().regex(/^[a-z0-9_]+$/);
const quantity = z.number().positive();

export const recipeIngredientSchema = z.object({
  ingredientId: id,
  quantity: quantity.nullable(),
  unit: z.enum(['g', 'ml', 'count']).nullable(),
  displayQuantity: z.string().min(1),
  optional: z.boolean().default(false),
  scalingStrategy: z.enum(['linear', 'rounded', 'constant', 'manual']),
  preparationNoteEn: z.string().default(''),
  preparationNoteZh: z.string().default(''),
  substitutionGroup: z.string().nullable().default(null),
});

export const structuredStepSchema = z.object({
  text: z.string().min(1),
  /** Estimated hands-on minutes for this step, used by the method timeline. */
  minutes: z.number().int().nonnegative().optional(),
  phase: z.enum(['prep', 'cook', 'plate']).optional(),
  tip: z.string().optional(),
});

export const recipeSchema = z.object({
  id,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(['review', 'published']),
  primaryRole: z.enum(['snack', 'starter', 'soup', 'main', 'side', 'staple', 'salad', 'dessert']),
  secondaryRoles: z.array(
    z.enum(['snack', 'starter', 'soup', 'main', 'side', 'staple', 'salad', 'dessert']),
  ),
  cuisines: z.array(id).min(1),
  methods: z.array(id).min(1),
  equipment: z.array(
    z.object({
      id,
      quantity: z.number().int().positive(),
      occupiedMinutes: z.number().int().nonnegative(),
      required: z.boolean().default(true),
    }),
  ),
  servingStyles: z.record(z.enum(['family', 'plated', 'buffet']), z.number().int().min(0).max(100)),
  baseServings: quantity,
  activeMinutes: z.number().int().nonnegative(),
  totalMinutes: z.number().int().nonnegative(),
  advanceMinutes: z.number().int().nonnegative(),
  difficulty: z.enum(['easy', 'medium', 'advanced']),
  spiceLevel: z.number().int().min(0).max(5),
  holdQuality: z.number().int().min(1).max(5),
  reheatingQuality: z.number().int().min(1).max(5),
  childFriendly: z.boolean(),
  kitchenTestStatus: z.enum(['not_tested', 'editor_tested', 'kitchen_tested']),
  scalingNotes: z.record(z.string(), z.unknown()).default({}),
  safetyNotes: z.string().nullable().default(null),
  translations: z.object({
    'zh-CN': z.object({
      title: z.string().min(1),
      summary: z.string().min(1),
      servingNote: z.string().nullable().default(null),
      instructions: z.array(z.string().min(1)).min(2),
      /**
       * Timed, phased steps. Optional so records written before the structured
       * format keep validating; the UI falls back to `instructions`.
       */
      structuredInstructions: z.array(structuredStepSchema).optional(),
      aiAssisted: z.boolean().default(false),
    }),
    'en-AU': z.object({
      title: z.string().min(1),
      summary: z.string().min(1),
      servingNote: z.string().nullable().default(null),
      instructions: z.array(z.string().min(1)).min(2),
      /**
       * Timed, phased steps. Optional so records written before the structured
       * format keep validating; the UI falls back to `instructions`.
       */
      structuredInstructions: z.array(structuredStepSchema).optional(),
      aiAssisted: z.boolean().default(false),
    }),
  }),
  ingredients: z.array(recipeIngredientSchema).min(2),
  allergens: z.array(
    z.object({
      ingredientId: id,
      allergenCode: id,
      presence: z.enum(['contains', 'derived_from', 'may_contain', 'unknown']),
      reviewed: z.boolean(),
    }),
  ),
  dietTags: z.array(
    z.object({
      code: id,
      verification: z.enum(['computed', 'reviewed', 'unknown']),
    }),
  ),
  nutrition: z.object({
    energyKj: z.number().int().nonnegative(),
    energyKcal: z.number().int().nonnegative(),
    proteinG: z.number().nonnegative(),
    fatG: z.number().nonnegative(),
    saturatedFatG: z.number().nonnegative(),
    carbohydrateG: z.number().nonnegative(),
    sugarsG: z.number().nonnegative(),
    fibreG: z.number().nonnegative(),
    sodiumMg: z.number().nonnegative(),
    confidence: z.number().int().min(0).max(100),
    sourceName: z.string().min(1),
    sourceVersion: z.string().min(1),
  }),
  cost: z.object({
    regionCode: z.string().min(2),
    totalCents: z.number().int().nonnegative(),
    perServingCents: z.number().int().nonnegative(),
    pantryPolicy: z.enum(['include_all', 'exclude_staples']),
    priceVersion: z.string().min(1),
  }),
  source: z.object({
    sourceType: z.enum(['original', 'licensed', 'api', 'public_domain', 'user_private']),
    providerName: z.string().min(1),
    sourceUrl: z.string().url().nullable(),
    licenseCode: z.string().min(1),
    attributionRequired: z.boolean(),
    cachingAllowed: z.boolean(),
  }),
  media: z.object({
    objectKey: z.string().min(1),
    mediaType: z.enum(['original_photo', 'licensed_photo', 'ai_illustration']),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    altEn: z.string().min(1),
    altZh: z.string().min(1),
    sourceUrl: z.string().url().nullable(),
    licenseCode: z.string().min(1),
    attribution: z.string().nullable(),
    aiModel: z.string().nullable(),
    aiPrompt: z.string().nullable(),
    generatedAt: z.string().datetime().nullable(),
    rightsReviewedAt: z.string().datetime(),
  }),
  substitutions: z.array(
    z.object({
      ingredientId: id,
      replacementIngredientId: id,
      noteEn: z.string().min(1),
      noteZh: z.string().min(1),
      safetyReviewed: z.boolean(),
    }),
  ),
  review: z.object({
    content: z.literal('approved'),
    allergen: z.literal('approved'),
    rights: z.literal('approved'),
    translation: z.literal('approved'),
    nutrition: z.literal('approved'),
  }),
});

export const batchAFileSchema = z.object({
  batch: z.literal('A'),
  version: z.string().min(1),
  generatedAt: z.string().datetime(),
  recipes: z.array(recipeSchema).length(40),
});

export type BatchA = z.infer<typeof batchAFileSchema>;
export type RecipeImport = z.infer<typeof recipeSchema>;
