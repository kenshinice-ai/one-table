import { z } from 'zod';

import { recipeSchema } from './batch-a';

export const launchCatalogFileSchema = z.object({
  batch: z.literal('launch'),
  version: z.string().min(1),
  generatedAt: z.string().datetime(),
  recipes: z.array(recipeSchema).length(600),
});

export type LaunchCatalogFile = z.infer<typeof launchCatalogFileSchema>;
