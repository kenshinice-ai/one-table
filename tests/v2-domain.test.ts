import assert from 'node:assert/strict';
import test from 'node:test';

import { launchRecipes } from '../data/recipes';
import type { RecipeImport } from '../src/domain/batch-a';
import { energyFit, healthScore, isEnergyOnTarget } from '../src/domain/health';
import {
  composeMenu,
  defaultPlannerFilters,
  defaultPlannerPreferences,
  getEligibleRecipes,
  getRoleAlternatives,
  resolveRoleTemplate,
  roleCountsFor,
} from '../src/domain/planner';
import { scaleRecipeIngredients } from '../src/domain/scaling';
import { buildShoppingList } from '../src/domain/shopping-list';
import {
  buildRecipeCardInput,
  recipeHasArtwork,
  RECIPE_CARD_INGREDIENT_LIMIT,
  RECIPE_CARD_STEP_LIMIT,
} from '../src/domain/share-card';
import { parsePlannerState, serializePlannerState } from '../src/domain/url-state';

const sample = launchRecipes[0];

function withNutrition(overrides: Partial<RecipeImport['nutrition']>, role = sample.primaryRole) {
  return {
    ...sample,
    primaryRole: role,
    nutrition: {
      ...sample.nutrition,
      sodiumMg: 700,
      fibreG: 3,
      saturatedFatG: 4,
      sugarsG: 5,
      ...overrides,
    },
  } as RecipeImport;
}

test('health score', async (t) => {
  await t.test('starts from a neutral three when nothing stands out', () => {
    assert.equal(healthScore(withNutrition({})), 3);
  });

  await t.test('rewards low sodium and high fibre, and punishes the reverse', () => {
    assert.equal(healthScore(withNutrition({ sodiumMg: 599 })), 4);
    assert.equal(healthScore(withNutrition({ sodiumMg: 901 })), 2);
    assert.equal(healthScore(withNutrition({ fibreG: 6 })), 4);
    assert.equal(healthScore(withNutrition({ sodiumMg: 500, fibreG: 8 })), 5);
  });

  await t.test('applies each threshold at its exact boundary', () => {
    assert.equal(healthScore(withNutrition({ sodiumMg: 600 })), 3, '600mg is not below 600');
    assert.equal(healthScore(withNutrition({ sodiumMg: 900 })), 3, '900mg is not above 900');
    assert.equal(healthScore(withNutrition({ saturatedFatG: 8 })), 3);
    assert.equal(healthScore(withNutrition({ saturatedFatG: 8.1 })), 2);
  });

  await t.test('gives desserts a wider sugar allowance', () => {
    assert.equal(healthScore(withNutrition({ sugarsG: 25 })), 2, 'savoury dish is penalised');
    assert.equal(healthScore(withNutrition({ sugarsG: 25 }, 'dessert')), 3, 'dessert is not');
    assert.equal(healthScore(withNutrition({ sugarsG: 31 }, 'dessert')), 2);
  });

  await t.test('never leaves the one to five range', () => {
    const worst = healthScore(
      withNutrition({ sodiumMg: 2000, saturatedFatG: 30, sugarsG: 60, fibreG: 0 }),
    );
    assert.ok(worst >= 1 && worst <= 5);
  });
});

test('energy target', async (t) => {
  await t.test('scores a perfect fit inside the band', () => {
    assert.equal(energyFit(1000, 'medium'), 1);
    assert.equal(energyFit(2000, 'any'), 1);
  });

  await t.test('decays with distance instead of dropping to zero', () => {
    const near = energyFit(1000, 'light');
    const far = energyFit(1400, 'light');
    assert.ok(near > far, 'closer menus score higher');
    assert.ok(far >= 0);
  });

  await t.test('reports whether a menu sits on target', () => {
    assert.equal(isEnergyOnTarget(850, 'light'), true);
    assert.equal(isEnergyOnTarget(1500, 'light'), false);
    assert.equal(isEnergyOnTarget(1500, 'any'), true);
  });
});

test('course structure', async (t) => {
  await t.test('falls back to the suggested template without overrides', () => {
    const template = resolveRoleTemplate(defaultPlannerPreferences);
    assert.equal(template.length, defaultPlannerPreferences.dishCount);
  });

  await t.test('expands explicit overrides in reading order', () => {
    const template = resolveRoleTemplate({
      ...defaultPlannerPreferences,
      dishCount: 4,
      roleOverrides: { main: 2, dessert: 1, starter: 1 },
    });
    assert.deepEqual(template, ['starter', 'main', 'main', 'dessert']);
  });

  await t.test('counts courses for the structure editor', () => {
    const counts = roleCountsFor({
      ...defaultPlannerPreferences,
      roleOverrides: { main: 2, side: 1 },
    });
    assert.equal(counts.main, 2);
    assert.equal(counts.side, 1);
    assert.equal(counts.dessert, 0);
  });

  await t.test('composes a menu that matches an explicit structure', () => {
    const preferences = {
      ...defaultPlannerPreferences,
      dishCount: 3 as const,
      roleOverrides: { main: 1, staple: 1, dessert: 1 },
    };
    const menu = composeMenu(launchRecipes, preferences, 0, defaultPlannerFilters);
    assert.equal(menu.recipes.length, 3);
    assert.ok(menu.recipes.some((recipe) => recipe.primaryRole === 'dessert'));
  });
});

test('health filter narrows the eligible set', () => {
  const strict = { ...defaultPlannerFilters, minHealthScore: 5 };
  const eligible = getEligibleRecipes(launchRecipes, strict);
  assert.ok(eligible.length > 0, 'the catalogue still offers top-scoring dishes');
  assert.ok(eligible.length < launchRecipes.length, 'and the filter actually excludes some');
  assert.ok(eligible.every((recipe) => healthScore(recipe) === 5));
});

test('course substitution', async (t) => {
  const preferences = defaultPlannerPreferences;
  const base = composeMenu(launchRecipes, preferences, 0, defaultPlannerFilters);

  await t.test('offers alternatives that are not already on the table', () => {
    const alternatives = getRoleAlternatives(
      launchRecipes,
      preferences,
      defaultPlannerFilters,
      base.recipes[0].primaryRole,
      base.recipes.map((recipe) => recipe.id),
    );
    assert.ok(alternatives.length > 0);
    assert.ok(alternatives.every((option) => !base.recipes.some((r) => r.id === option.id)));
  });

  await t.test('replaces only the chosen course and re-scores the menu', () => {
    const replacement = getRoleAlternatives(
      launchRecipes,
      preferences,
      defaultPlannerFilters,
      base.recipes[0].primaryRole,
      base.recipes.map((recipe) => recipe.id),
    )[0];
    const swapped = composeMenu(launchRecipes, preferences, 0, defaultPlannerFilters, {
      0: replacement.id,
    });
    assert.equal(swapped.recipes[0].id, replacement.id);
    assert.deepEqual(
      swapped.recipes.slice(1).map((recipe) => recipe.id),
      base.recipes.slice(1).map((recipe) => recipe.id),
      'the other courses are untouched',
    );
    assert.equal(swapped.recipes.length, base.recipes.length);
  });

  await t.test('ignores a substitution that would duplicate another course', () => {
    const duplicate = composeMenu(launchRecipes, preferences, 0, defaultPlannerFilters, {
      0: base.recipes[1].id,
    });
    assert.equal(duplicate.recipes[0].id, base.recipes[0].id);
    assert.equal(new Set(duplicate.recipes.map((r) => r.id)).size, duplicate.recipes.length);
  });

  await t.test('ignores an unknown recipe id', () => {
    const unknown = composeMenu(launchRecipes, preferences, 0, defaultPlannerFilters, {
      0: 'not_a_recipe',
    });
    assert.equal(unknown.recipes[0].id, base.recipes[0].id);
  });
});

test('ingredient scaling', async (t) => {
  const recipe = launchRecipes.find((item) =>
    item.ingredients.some((i) => i.scalingStrategy === 'linear' && i.unit === 'g'),
  )!;

  await t.test('leaves amounts alone when scaling is switched off', () => {
    const scaled = scaleRecipeIngredients(recipe, 12, false);
    assert.ok(scaled.every((item) => !item.scaled));
  });

  await t.test('scales linear amounts with the guest count', () => {
    const single = scaleRecipeIngredients(recipe, recipe.baseServings, true);
    const double = scaleRecipeIngredients(recipe, recipe.baseServings * 2, true);
    const index = recipe.ingredients.findIndex(
      (i) => i.scalingStrategy === 'linear' && i.unit === 'g',
    );
    assert.ok(double[index].quantity! > single[index].quantity!);
  });

  await t.test('never scales constant or manual amounts', () => {
    const scaled = scaleRecipeIngredients(recipe, recipe.baseServings * 3, true);
    recipe.ingredients.forEach((ingredient, index) => {
      if (ingredient.scalingStrategy === 'constant' || ingredient.scalingStrategy === 'manual') {
        assert.equal(scaled[index].quantity, ingredient.quantity);
        assert.equal(scaled[index].scaled, false);
      }
    });
  });
});

test('shopping list', async (t) => {
  const menu = composeMenu(launchRecipes, defaultPlannerPreferences, 0, defaultPlannerFilters);

  await t.test('lists every distinct ingredient exactly once', () => {
    const lines = buildShoppingList(menu.recipes, 6);
    const distinct = new Set(
      menu.recipes.flatMap((recipe) => recipe.ingredients.map((i) => i.ingredientId)),
    );
    assert.equal(lines.length, distinct.size);
    assert.equal(new Set(lines.map((line) => line.ingredientId)).size, lines.length);
  });

  await t.test('adds up amounts shared across dishes', () => {
    const first = launchRecipes.find((r) =>
      r.ingredients.some((i) => i.unit === 'g' && i.scalingStrategy === 'linear'),
    )!;
    const shared = first.ingredients.find((i) => i.unit === 'g' && i.scalingStrategy === 'linear')!;
    const one = buildShoppingList([first], first.baseServings);
    const two = buildShoppingList(
      [first, { ...first, id: `${first.id}_copy` }],
      first.baseServings,
    );
    const lineOne = one.find((line) => line.ingredientId === shared.ingredientId)!;
    const lineTwo = two.find((line) => line.ingredientId === shared.ingredientId)!;
    assert.equal(lineTwo.quantity, lineOne.quantity! * 2);
    assert.equal(lineTwo.recipeIds.length, 2);
  });

  await t.test('handles an empty menu', () => {
    assert.deepEqual(buildShoppingList([], 6), []);
  });
});

test('shareable links', async (t) => {
  await t.test('round-trips a full state', () => {
    const original = {
      locale: 'en-AU' as const,
      filters: {
        ...defaultPlannerFilters,
        cuisines: ['french', 'italian'],
        excludedAllergens: ['peanut'],
        maxTotalMinutes: 45,
        maxSpiceLevel: 2,
        childFriendlyOnly: true,
        minHealthScore: 4,
      },
      preferences: {
        ...defaultPlannerPreferences,
        guests: 9,
        dishCount: 5 as const,
        servingStyle: 'plated' as const,
        budgetCents: 18000,
        energyTarget: 'light' as const,
        roleOverrides: { starter: 1, main: 2, dessert: 2 },
      },
      variation: 3,
      substitutions: { 0: 'recipe_one', 2: 'recipe_two' },
    };
    const parsed = parsePlannerState(serializePlannerState(original));
    assert.deepEqual(parsed, original);
  });

  await t.test('produces a short link for the default state', () => {
    const query = serializePlannerState({
      locale: 'zh-CN',
      filters: defaultPlannerFilters,
      preferences: defaultPlannerPreferences,
      variation: 0,
      substitutions: {},
    });
    assert.equal(query, 'v=1');
  });

  await t.test('falls back to defaults for malformed input', () => {
    const parsed = parsePlannerState('?g=nine&d=99&style=banquet&spice=12&health=0&n=-4&sub=x:y');
    assert.equal(parsed.preferences.guests, defaultPlannerPreferences.guests);
    assert.equal(parsed.preferences.dishCount, 10, 'out-of-range dish counts clamp');
    assert.equal(parsed.preferences.servingStyle, 'family');
    assert.equal(parsed.filters.maxSpiceLevel, 5);
    assert.equal(parsed.filters.minHealthScore, 1);
    assert.equal(parsed.variation, 0);
    assert.deepEqual(parsed.substitutions, {});
  });

  await t.test('reproduces the same menu from the same link', () => {
    const state = parsePlannerState('?v=1&g=8&d=4&kcal=light&n=2');
    const first = composeMenu(
      launchRecipes,
      state.preferences,
      state.variation,
      state.filters,
      state.substitutions,
    );
    const second = composeMenu(
      launchRecipes,
      state.preferences,
      state.variation,
      state.filters,
      state.substitutions,
    );
    assert.deepEqual(
      first.recipes.map((recipe) => recipe.id),
      second.recipes.map((recipe) => recipe.id),
    );
  });
});

test('recipe share card content', async (t) => {
  const base = {
    title: '示例菜',
    summary: '示例说明',
    role: '主菜',
    facts: ['30 分钟', '≈ 400 kcal'],
    ingredientsHeading: '食材',
    stepsHeading: '烹饪过程',
    brand: '一桌',
    tagline: '为一桌人，配一桌好菜',
    footer: 'PWE Studio',
    moreIngredientsLabel: (count: number) => `另有 ${count} 种食材`,
    imageUrl: '/media/demo-dish-1280.webp',
  };
  const ingredient = (index: number) => ({ name: `食材${index}`, amount: `${index * 10} g` });

  await t.test('keeps every ingredient when the list fits', () => {
    const input = buildRecipeCardInput({
      ...base,
      ingredients: [1, 2, 3].map(ingredient),
      steps: ['一', '二'],
    });
    assert.equal(input.ingredients.length, 3);
    assert.equal(input.moreIngredients, null);
  });

  await t.test('truncates a long list and says how many were dropped', () => {
    const input = buildRecipeCardInput({
      ...base,
      ingredients: Array.from({ length: 12 }, (_, index) => ingredient(index + 1)),
      steps: ['一'],
    });
    assert.equal(input.ingredients.length, RECIPE_CARD_INGREDIENT_LIMIT);
    assert.equal(input.moreIngredients, '另有 4 种食材');
  });

  await t.test('caps the method at four steps', () => {
    const input = buildRecipeCardInput({
      ...base,
      ingredients: [ingredient(1)],
      steps: ['一', '二', '三', '四', '五', '六'],
    });
    assert.equal(input.steps.length, RECIPE_CARD_STEP_LIMIT);
    assert.deepEqual(input.steps, ['一', '二', '三', '四']);
  });

  await t.test('carries a null image through for recipes without artwork', () => {
    const input = buildRecipeCardInput({
      ...base,
      imageUrl: null,
      ingredients: [ingredient(1)],
      steps: ['一'],
    });
    assert.equal(input.imageUrl, null);
  });

  await t.test('only treats produced artwork as available', () => {
    assert.equal(recipeHasArtwork('media/honey-soy-chicken.webp'), true);
    assert.equal(recipeHasArtwork('recipes/v2/some-dish/hero-1600x1200.webp'), false);
  });
});
