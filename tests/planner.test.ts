import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { batchA } from '../data/recipes/batch-a';
import { launchRecipes } from '../data/recipes';
import {
  composeMenu,
  defaultPlannerFilters,
  defaultPlannerPreferences,
  getMenuEquipmentCollisionIds,
  getEligibleRecipes,
  getRecipeExclusionReasons,
  summarizeEligibility,
} from '../src/domain/planner';

describe('planner rules', () => {
  it('only exposes published recipes', () => {
    const eligible = getEligibleRecipes(batchA, defaultPlannerFilters);
    assert.equal(eligible.length, 30);
    assert.equal(
      eligible.every((recipe) => recipe.status === 'published'),
      true,
    );
  });

  it('excludes every selected allergen relationship, including unknown data', () => {
    const eligible = getEligibleRecipes(batchA, {
      ...defaultPlannerFilters,
      excludedAllergens: ['soy'],
    });
    assert.equal(
      eligible.some((recipe) => recipe.slug === 'thai-green-curry-tofu'),
      false,
    );
    assert.equal(
      eligible.every((recipe) =>
        recipe.allergens.every((allergen) => allergen.allergenCode !== 'soy'),
      ),
      true,
    );
  });

  it('composes a deterministic four-dish family menu', () => {
    const eligible = getEligibleRecipes(batchA, defaultPlannerFilters);
    const first = composeMenu(eligible, defaultPlannerPreferences);
    const second = composeMenu(eligible, defaultPlannerPreferences);
    assert.equal(first.recipes.length, 4);
    assert.deepEqual(
      first.recipes.map((recipe) => recipe.id),
      second.recipes.map((recipe) => recipe.id),
    );
    assert.equal(
      first.recipes.some((recipe) => recipe.primaryRole === 'main'),
      true,
    );
    assert.equal(
      first.recipes.some((recipe) => recipe.primaryRole === 'dessert'),
      true,
    );
  });

  it('returns a partial menu instead of unsafe fallbacks when constraints are too narrow', () => {
    const eligible = getEligibleRecipes(batchA, {
      ...defaultPlannerFilters,
      cuisines: ['japanese'],
      dietTags: ['vegan'],
      maxTotalMinutes: 20,
    });
    const menu = composeMenu(eligible, { ...defaultPlannerPreferences, dishCount: 6 });
    assert.ok(menu.recipes.length < 6);
    assert.equal(
      menu.recipes.every((recipe) => eligible.includes(recipe)),
      true,
    );
  });

  it('exposes the complete 700-recipe catalogue with exact role quotas', () => {
    assert.equal(launchRecipes.length, 700);
    const counts = launchRecipes.reduce<Record<string, number>>((result, recipe) => {
      result[recipe.primaryRole] = (result[recipe.primaryRole] ?? 0) + 1;
      return result;
    }, {});
    assert.deepEqual(counts, {
      main: 249,
      side: 62,
      salad: 55,
      starter: 64,
      soup: 57,
      snack: 69,
      staple: 51,
      dessert: 93,
    });
  });

  it('treats methods, ingredients and equipment as hard constraints while keeping include menu-level', () => {
    const filters = {
      ...defaultPlannerFilters,
      methods: ['deep_fry'],
      excludedIngredientIds: ['peanuts'],
      availableEquipmentIds: ['equip_stovetop'],
      mustIncludeIngredientIds: ['flour'],
    };
    const eligible = getEligibleRecipes(launchRecipes, filters);
    assert.equal(
      eligible.every((recipe) => recipe.methods.includes('deep_fry')),
      true,
    );
    assert.equal(
      eligible.every(
        (recipe) => !recipe.ingredients.some((ingredient) => ingredient.ingredientId === 'peanuts'),
      ),
      true,
    );
    assert.equal(
      eligible.every((recipe) =>
        recipe.equipment.every((item) => !item.required || item.id === 'equip_stovetop'),
      ),
      true,
    );
    const summary = summarizeEligibility(launchRecipes, filters, {
      ...defaultPlannerPreferences,
      dishCount: 1,
    });
    assert.equal(summary.coveredMustIncludeIngredientIds.includes('flour'), true);
  });

  it('blocks an allergen relationship even when the source marks it unknown', () => {
    const kimchiRecipe = launchRecipes.find((recipe) => recipe.slug === 'korean-kimchi-pancakes');
    assert.ok(kimchiRecipe);
    assert.deepEqual(
      getRecipeExclusionReasons(kimchiRecipe, {
        ...defaultPlannerFilters,
        excludedAllergens: ['fish'],
      }),
      ['allergen_unknown', 'allergen_conflict'],
    );
  });

  it('rejects shared equipment that exceeds the four-hour planning window', () => {
    const stovetopRecipes = launchRecipes.filter((recipe) =>
      recipe.equipment.some((item) => item.id === 'equip_stovetop' && item.required),
    );
    const longStation = stovetopRecipes.find(
      (recipe) => recipe.slug === 'black-sesame-panna-cotta',
    );
    const secondStation = stovetopRecipes.find((recipe) => recipe.slug === 'honey-soy-chicken');
    assert.ok(longStation && secondStation);
    assert.deepEqual(getMenuEquipmentCollisionIds([longStation, secondStation]), [
      'equip_stovetop',
    ]);
  });
});
