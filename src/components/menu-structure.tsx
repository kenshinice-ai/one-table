'use client';

import {
  courseOrder,
  roleCountsFor,
  type DishCount,
  type PlannerPreferences,
  type PrimaryRole,
} from '@/domain/planner';
import { copy, fill, roleLabel, type Locale } from '@/i18n/copy';

const PRESETS: Record<
  string,
  { style: PlannerPreferences['servingStyle']; roles: Partial<Record<PrimaryRole, number>> }
> = {
  family: { style: 'family', roles: { main: 2, side: 1, staple: 1 } },
  plated: { style: 'plated', roles: { starter: 1, main: 1, dessert: 1 } },
  buffet: { style: 'buffet', roles: { main: 1, salad: 1, side: 1, staple: 1 } },
};

/**
 * Turns the dish-count control into a course editor. The planner has always
 * built menus from a course template; this makes that template visible and
 * lets a host set it directly instead of inferring it from a number.
 */
export function MenuStructureEditor({
  preferences,
  locale,
  onChange,
}: {
  preferences: PlannerPreferences;
  locale: Locale;
  onChange: (next: PlannerPreferences) => void;
}) {
  const t = copy[locale];
  const counts = roleCountsFor(preferences);
  const total = courseOrder.reduce((sum, role) => sum + counts[role], 0);
  const isCustom = preferences.roleOverrides !== null;

  function setRole(role: PrimaryRole, value: number) {
    const next = { ...counts, [role]: Math.max(0, Math.min(4, value)) };
    const overrides = courseOrder.reduce<Partial<Record<PrimaryRole, number>>>((result, key) => {
      if (next[key] > 0) result[key] = next[key];
      return result;
    }, {});
    const dishCount = courseOrder.reduce((sum, key) => sum + (overrides[key] ?? 0), 0);
    if (dishCount < 1 || dishCount > 10) return;
    onChange({
      ...preferences,
      roleOverrides: overrides,
      dishCount: dishCount as DishCount,
    });
  }

  function applyPreset(key: keyof typeof PRESETS) {
    const preset = PRESETS[key];
    const dishCount = Object.values(preset.roles).reduce((sum, value) => sum + value, 0);
    onChange({
      ...preferences,
      servingStyle: preset.style,
      roleOverrides: preset.roles,
      dishCount: dishCount as DishCount,
    });
  }

  return (
    <div className="structure-editor">
      <p className="structure-hint">{t.structureHint}</p>
      <div className="structure-presets" role="group" aria-label={t.structurePresets}>
        <button onClick={() => applyPreset('family')} type="button">
          {t.presetFamily}
        </button>
        <button onClick={() => applyPreset('plated')} type="button">
          {t.presetPlated}
        </button>
        <button onClick={() => applyPreset('buffet')} type="button">
          {t.presetBuffet}
        </button>
      </div>
      <ul className="structure-roles">
        {courseOrder.map((role) => (
          <li className={counts[role] > 0 ? 'is-on' : ''} key={role}>
            <span>{roleLabel(role, locale)}</span>
            <span className="stepper">
              <button
                aria-label={`${roleLabel(role, locale)} −`}
                disabled={counts[role] === 0 || total <= 1}
                onClick={() => setRole(role, counts[role] - 1)}
                type="button"
              >
                −
              </button>
              <b>{counts[role]}</b>
              <button
                aria-label={`${roleLabel(role, locale)} +`}
                disabled={counts[role] >= 4 || total >= 10}
                onClick={() => setRole(role, counts[role] + 1)}
                type="button"
              >
                +
              </button>
            </span>
          </li>
        ))}
      </ul>
      <div className="structure-footer">
        <span>
          {fill(t.dishTotal, { count: total })}
          {isCustom ? ` · ${t.structureCustom}` : ''}
        </span>
        {isCustom && (
          <button
            className="structure-restore"
            onClick={() => onChange({ ...preferences, roleOverrides: null })}
            type="button"
          >
            {t.structureRestore}
          </button>
        )}
      </div>
    </div>
  );
}
