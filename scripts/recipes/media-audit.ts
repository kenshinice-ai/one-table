import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { launchCatalogFile } from '../../data/recipes';

const publicRoot = join(process.cwd(), 'public');
const recipes = launchCatalogFile.recipes;
const recipeRows = recipes.map((recipe) => {
  const localPath = join(publicRoot, 'media', `${recipe.slug}.webp`);
  return {
    slug: recipe.slug,
    generatedAt: recipe.media.generatedAt,
    objectKey: recipe.media.objectKey,
    localPath,
    exists: existsSync(localPath),
    ideasReference:
      recipe.media.objectKey.includes('ideas/') ||
      recipe.media.sourceUrl?.includes('ideas/') ||
      false,
  };
});

const ingredientIds = [
  ...new Set(
    recipes.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.ingredientId)),
  ),
].sort();
const ingredientRows = ingredientIds.map((ingredientId) => {
  const localPath = join(publicRoot, 'media', 'ingredients', `${ingredientId}.webp`);
  return { ingredientId, localPath, exists: existsSync(localPath) };
});

const report = {
  recipeCount: recipes.length,
  recipeGeneratedMetadata: recipeRows.filter((row) => row.generatedAt !== null).length,
  recipeFiles: recipeRows.filter((row) => row.exists).length,
  recipeMissing: recipeRows.filter((row) => !row.exists).map((row) => row.slug),
  ideasReferences: recipeRows.filter((row) => row.ideasReference).map((row) => row.slug),
  ingredientCount: ingredientRows.length,
  ingredientFiles: ingredientRows.filter((row) => row.exists).length,
  ingredientMissing: ingredientRows.filter((row) => !row.exists).map((row) => row.ingredientId),
};

console.log(JSON.stringify(report, null, 2));

if (
  report.recipeCount !== 200 ||
  report.recipeGeneratedMetadata !== 200 ||
  report.recipeMissing.length ||
  report.ideasReferences.length ||
  report.ingredientMissing.length
) {
  process.exit(1);
}
