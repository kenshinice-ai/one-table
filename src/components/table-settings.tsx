'use client';

import type { EnergyTarget } from '@/domain/health';
import {
  roleCountsFor,
  courseOrder,
  type PlannerPreferences,
  type PlannerServingStyle,
} from '@/domain/planner';
import { copy, fill, roleLabel, type Locale } from '@/i18n/copy';

import { Dropdown } from './dropdown';
import { BudgetIcon, CoursesIcon, EnergyIcon, FocusIcon, GuestsIcon, ServingIcon } from './icons';
import { MenuStructureEditor } from './menu-structure';

const BUDGET_PRESETS = [60, 80, 100, 120, 150, 200];

export function TableSettings({
  preferences,
  locale,
  onChange,
}: {
  preferences: PlannerPreferences;
  locale: Locale;
  onChange: (next: PlannerPreferences) => void;
}) {
  const t = copy[locale];
  const en = copy['en-AU'];
  const counts = roleCountsFor(preferences);
  const present = courseOrder.filter((role) => counts[role] > 0);
  const total = present.reduce((sum, role) => sum + counts[role], 0);
  // The trigger states the shape in one line; the full breakdown lives in the
  // panel, which is where a host goes to change it anyway.
  const lead = present
    .slice(0, 2)
    .map((role) => `${roleLabel(role, locale)}${counts[role] > 1 ? `×${counts[role]}` : ''}`)
    .join(locale === 'zh-CN' ? '、' : ', ');
  const structureSummary =
    present.length > 2
      ? `${fill(t.dishTotal, { count: total })} · ${lead}…`
      : `${fill(t.dishTotal, { count: total })} · ${lead}`;
  const budgetSelection = BUDGET_PRESETS.includes(preferences.budgetCents / 100)
    ? String(preferences.budgetCents)
    : 'custom';

  return (
    <section aria-label={t.settings} className="settings-row">
      <div className="section-kicker">
        <span className="kicker-dot" />
        {t.settings}
      </div>
      <Dropdown
        icon={GuestsIcon}
        id="guests"
        labelText={t.guests}
        locale={locale}
        multiple={false}
        onChange={(next) => onChange({ ...preferences, guests: Number(next[0] ?? 6) })}
        options={Array.from({ length: 30 }, (_, index) => ({
          value: String(index + 1),
          zh: `${index + 1} 人`,
          en: `${index + 1} guests`,
        }))}
        selected={[String(preferences.guests)]}
      />
      <Dropdown
        emptyText={structureSummary}
        active={preferences.roleOverrides !== null}
        icon={CoursesIcon}
        id="dishes"
        labelText={t.dishes}
        locale={locale}
        multiple={false}
        onChange={() => undefined}
        options={[]}
        selected={[]}
      >
        <MenuStructureEditor locale={locale} onChange={onChange} preferences={preferences} />
      </Dropdown>
      <Dropdown
        icon={ServingIcon}
        id="style"
        labelText={t.style}
        locale={locale}
        multiple={false}
        onChange={(next) =>
          onChange({ ...preferences, servingStyle: (next[0] ?? 'family') as PlannerServingStyle })
        }
        options={[
          { value: 'family', zh: copy['zh-CN'].family, en: en.family },
          { value: 'plated', zh: copy['zh-CN'].plated, en: en.plated },
          { value: 'buffet', zh: copy['zh-CN'].buffet, en: en.buffet },
        ]}
        selected={[preferences.servingStyle]}
      />
      <Dropdown
        customInput={{
          label: locale === 'zh-CN' ? '自定义预算（A$）' : 'Custom budget (A$)',
          value: Math.round(preferences.budgetCents / 100),
          onChange: (value) => onChange({ ...preferences, budgetCents: Math.round(value * 100) }),
        }}
        icon={BudgetIcon}
        id="budget"
        labelText={t.budget}
        locale={locale}
        multiple={false}
        onChange={(next) =>
          onChange({
            ...preferences,
            budgetCents: next[0] === 'custom' ? preferences.budgetCents : Number(next[0] ?? 12000),
          })
        }
        options={BUDGET_PRESETS.map((amount) => ({
          value: String(amount * 100),
          zh: `A$${amount}`,
          en: `A$${amount}`,
        })).concat([{ value: 'custom', zh: '自定义金额', en: 'Custom amount' }])}
        selected={[budgetSelection]}
      />
      <Dropdown
        active={preferences.energyTarget !== 'any'}
        icon={EnergyIcon}
        id="energy"
        labelText={t.energy}
        locale={locale}
        multiple={false}
        onChange={(next) =>
          onChange({ ...preferences, energyTarget: (next[0] ?? 'any') as EnergyTarget })
        }
        options={[
          { value: 'any', zh: copy['zh-CN'].kcalAny, en: en.kcalAny },
          { value: 'light', zh: copy['zh-CN'].kcalLight, en: en.kcalLight },
          { value: 'medium', zh: copy['zh-CN'].kcalMedium, en: en.kcalMedium },
          { value: 'hearty', zh: copy['zh-CN'].kcalHearty, en: en.kcalHearty },
        ]}
        selected={[preferences.energyTarget]}
      />
      <Dropdown
        icon={FocusIcon}
        id="mode"
        labelText={t.mode}
        locale={locale}
        multiple={false}
        onChange={(next) =>
          onChange({
            ...preferences,
            compositionMode: (next[0] ?? 'balanced') as PlannerPreferences['compositionMode'],
          })
        }
        options={[
          { value: 'balanced', zh: copy['zh-CN'].balanced, en: en.balanced },
          { value: 'budget', zh: copy['zh-CN'].budgetMode, en: en.budgetMode },
          { value: 'easy', zh: copy['zh-CN'].easy, en: en.easy },
        ]}
        selected={[preferences.compositionMode]}
      />
      <p className="sr-only">{fill(t.dishTotal, { count: preferences.dishCount })}</p>
    </section>
  );
}
