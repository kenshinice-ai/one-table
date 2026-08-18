import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { launchRecipes } from '../data/recipes';
import {
  OCCASIONS,
  applyOccasion,
  clearOccasion,
  occasionPresets,
  seasonalChips,
  SEASONAL_CHIP_COUNT,
  type Occasion,
} from '../src/config/seasonal';
import {
  composeMenu,
  defaultPlannerFilters,
  defaultPlannerPreferences,
  getEligibleRecipes,
  getRecipeExclusionReasons,
  resolveRoleTemplate,
} from '../src/domain/planner';
import { parsePlannerState, serializePlannerState } from '../src/domain/url-state';

/** Occasions the catalogue can actually serve today. */
const served = OCCASIONS.filter((occasion) =>
  launchRecipes.some((recipe) => recipe.occasions?.includes(occasion)),
);

describe('occasion filter', () => {
  it('keeps a recipe that carries any one of the selected occasions', () => {
    const eligible = getEligibleRecipes(launchRecipes, {
      ...defaultPlannerFilters,
      occasions: ['cny', 'party'],
    });
    assert.equal(eligible.length > 0, true);
    assert.equal(
      eligible.every(
        (recipe) => recipe.occasions?.includes('cny') || recipe.occasions?.includes('party'),
      ),
      true,
    );
  });

  it('names the occasion as the reason an untagged recipe drops out', () => {
    const untagged = launchRecipes.find((recipe) => !recipe.occasions?.length);
    assert.ok(untagged, 'the catalogue still has untagged recipes');
    assert.deepEqual(
      getRecipeExclusionReasons(untagged, { ...defaultPlannerFilters, occasions: ['cny'] }),
      ['occasion_mismatch'],
    );
  });

  it('survives a round trip through the share link', () => {
    const query = serializePlannerState({
      locale: 'zh-CN',
      filters: { ...defaultPlannerFilters, occasions: ['mid_autumn'] },
      preferences: defaultPlannerPreferences,
      variation: 0,
      substitutions: {},
    });
    assert.equal(query.includes('occasion=mid_autumn'), true);
    assert.deepEqual(parsePlannerState(query).filters.occasions, ['mid_autumn']);
  });

  it('reads a hand-written campaign link', () => {
    assert.deepEqual(parsePlannerState('?occasion=cny,party').filters.occasions, ['cny', 'party']);
  });

  /**
   * A poster carries `?occasion=cny` and nothing else. Landing on a generic
   * four-course template would ask several occasions for a staple they have no
   * dish for, so the link has to arrive at a table that can be laid.
   */
  for (const occasion of served) {
    it(`lays a full table from the bare link ?occasion=${occasion}`, () => {
      const state = parsePlannerState(`?occasion=${occasion}`);
      const menu = composeMenu(launchRecipes, state.preferences, 0, state.filters);
      assert.equal(menu.recipes.length, resolveRoleTemplate(state.preferences).length);
      assert.equal(menu.isPartial, false);
    });
  }

  it('lets the first occasion set the shape when a link names several', () => {
    const state = parsePlannerState('?occasion=mid_autumn,cny');
    assert.deepEqual(state.preferences.roleOverrides, occasionPresets.mid_autumn.roleOverrides);
    const menu = composeMenu(launchRecipes, state.preferences, 0, state.filters);
    assert.equal(menu.recipes.length, 3);
    assert.equal(menu.isPartial, false);
  });

  it('keeps an explicit course count written in the link', () => {
    const state = parsePlannerState('?occasion=cny&roles=main:2,dessert:1');
    assert.deepEqual(state.preferences.roleOverrides, { main: 2, dessert: 1 });
  });
});

describe('occasion presets', () => {
  /**
   * The guarantee the whole feature rests on: every occasion offered on screen
   * composes a complete table from its own tagged dishes. The tags are uneven —
   * afternoon tea is nearly all sweets — so a shape that reads well on paper can
   * still be unbuildable. This is the test that says which.
   */
  for (const occasion of OCCASIONS) {
    it(`composes a full table for ${occasion}`, function () {
      if (!served.includes(occasion)) {
        // Tagged in the schema, unwritten in the data: the chip row hides it.
        assert.equal(
          seasonalChips(new Date('2026-04-01'), { available: served }).some(
            (chip) => chip.occasion === occasion,
          ),
          false,
        );
        return;
      }
      const { filters, preferences } = applyOccasion(
        occasion,
        defaultPlannerFilters,
        defaultPlannerPreferences,
      );
      const template = resolveRoleTemplate(preferences);
      const menu = composeMenu(launchRecipes, preferences, 0, filters);
      assert.equal(
        menu.recipes.length,
        template.length,
        `${occasion} composed ${menu.recipes.length} of ${template.length} courses`,
      );
      assert.equal(menu.isPartial, false);
      assert.deepEqual(
        menu.conflicts.map((conflict) => conflict.code),
        [],
      );
      assert.equal(
        menu.recipes.every((recipe) => recipe.occasions?.includes(occasion)),
        true,
      );
    });
  }

  it('offers at least four alternative tables per occasion, so "another set" works', () => {
    for (const occasion of served) {
      const { filters, preferences } = applyOccasion(
        occasion,
        defaultPlannerFilters,
        defaultPlannerPreferences,
      );
      const menu = composeMenu(launchRecipes, preferences, 0, filters);
      assert.equal(
        menu.candidateMenus.length >= 4,
        true,
        `${occasion} only has ${menu.candidateMenus.length} candidate tables`,
      );
    }
  });

  it('restores the host’s own table when the chip is cleared', () => {
    const before = {
      filters: { ...defaultPlannerFilters, cuisines: ['japanese'] },
      preferences: { ...defaultPlannerPreferences, guests: 9 },
    };
    const applied = applyOccasion('party', before.filters, before.preferences);
    assert.deepEqual(clearOccasion(applied.filters, applied.preferences, before), before);
  });

  it('falls back to the suggested table for a reader who arrived on a link', () => {
    const linked = parsePlannerState('?occasion=party');
    const cleared = clearOccasion(linked.filters, linked.preferences);
    assert.deepEqual(cleared.filters.occasions, []);
    assert.equal(cleared.preferences.roleOverrides, null);
    assert.deepEqual(
      resolveRoleTemplate(cleared.preferences),
      resolveRoleTemplate(defaultPlannerPreferences),
    );
  });

  it('sets a dish count that matches the course shape', () => {
    for (const occasion of OCCASIONS) {
      const { preferences } = applyOccasion(
        occasion,
        defaultPlannerFilters,
        defaultPlannerPreferences,
      );
      assert.equal(preferences.dishCount, resolveRoleTemplate(preferences).length);
      assert.equal(
        Object.values(occasionPresets[occasion].roleOverrides).every(
          (count) => (count ?? 0) >= 1 && (count ?? 0) <= 4,
        ),
        true,
      );
    }
  });
});

describe('seasonal chips', () => {
  const dates: Array<[string, Occasion]> = [
    ['2026-01-20', 'cny'],
    ['2026-02-14', 'cny'],
    ['2026-09-20', 'mid_autumn'],
    ['2026-12-10', 'christmas'],
    ['2026-01-05', 'bbq'],
  ];

  for (const [date, expected] of dates) {
    it(`leads with ${expected} on ${date}`, () => {
      const chips = seasonalChips(new Date(`${date}T09:00:00`), { available: served });
      assert.equal(chips[0].occasion, expected);
      assert.equal(chips[0].inSeason, true);
    });
  }

  it('always fills the row, whatever the date', () => {
    for (let day = 0; day < 366; day += 1) {
      const date = new Date(2026, 0, 1 + day);
      const chips = seasonalChips(date, { available: served });
      assert.equal(
        chips.length,
        SEASONAL_CHIP_COUNT,
        `${date.toDateString()} produced a short row`,
      );
      assert.equal(new Set(chips.map((chip) => chip.occasion)).size, SEASONAL_CHIP_COUNT);
      assert.equal(
        chips.every((chip) => served.includes(chip.occasion)),
        true,
      );
    }
  });

  it('never offers an occasion the catalogue cannot serve', () => {
    assert.equal(served.includes('easter'), false);
    for (let day = 0; day < 366; day += 1) {
      const chips = seasonalChips(new Date(2026, 0, 1 + day), { available: served });
      assert.equal(
        chips.some((chip) => chip.occasion === 'easter'),
        false,
      );
    }
  });

  it('lets a tenant pin its own line-up', () => {
    const chips = seasonalChips(new Date('2026-06-01T09:00:00'), {
      available: served,
      featured: ['cny', 'party'],
    });
    assert.deepEqual(
      chips.map((chip) => chip.occasion),
      ['cny', 'party'],
    );
  });
});
