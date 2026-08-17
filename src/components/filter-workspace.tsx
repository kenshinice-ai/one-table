'use client';

import type { EligibilitySummary, PlannerFilters } from '@/domain/planner';
import { activeFilterCount } from '@/domain/planner';
import { copy, label, names, type Choice, type Locale } from '@/i18n/copy';

import { Dropdown } from './dropdown';
import {
  AllergenIcon,
  ChildIcon,
  CuisineIcon,
  DietIcon,
  EquipmentIcon,
  ExcludeIcon,
  FilterIcon,
  HealthIcon,
  IncludeIcon,
  MethodIcon,
  SpiceIcon,
  TimeIcon,
} from './icons';

export type FacetOptions = {
  cuisines: string[];
  methods: string[];
  diets: string[];
  allergens: string[];
  ingredients: Choice[];
  equipment: string[];
};

const reasonLabel: Record<string, { zh: string; en: string }> = {
  allergen_conflict: { zh: '过敏原冲突', en: 'allergen conflict' },
  excluded_ingredient: { zh: '排除食材', en: 'excluded ingredient' },
  diet_mismatch: { zh: '饮食标签不符', en: 'diet mismatch' },
  cuisine_mismatch: { zh: '菜系不符', en: 'cuisine mismatch' },
  method_mismatch: { zh: '烹饪方式不符', en: 'method mismatch' },
  time_exceeded: { zh: '超出时间', en: 'time exceeded' },
  equipment_unavailable: { zh: '设备不可用', en: 'equipment unavailable' },
  spice_exceeded: { zh: '辣度超出', en: 'spice exceeded' },
  not_child_friendly: { zh: '非儿童友好', en: 'not child-friendly' },
  health_below_min: { zh: '健康指数不足', en: 'health score below minimum' },
};

function choice(values: string[]): Choice[] {
  return values.map((value) => ({
    value,
    zh: names[value]?.zh ?? value.replaceAll('_', ' '),
    en: names[value]?.en ?? value.replaceAll('_', ' '),
  }));
}

export function FilterWorkspace({
  filters,
  facets,
  locale,
  eligibleCount,
  eligibility,
  canUndo,
  onChange,
  onUndo,
  onRequestReset,
}: {
  filters: PlannerFilters;
  facets: FacetOptions;
  locale: Locale;
  eligibleCount: number;
  eligibility: EligibilitySummary;
  canUndo: boolean;
  onChange: (next: PlannerFilters) => void;
  onUndo: () => void;
  onRequestReset: () => void;
}) {
  const t = copy[locale];
  const en = copy['en-AU'];
  const languageKey = locale === 'zh-CN' ? 'zh' : 'en';
  const selectedChips = [
    ...filters.cuisines,
    ...filters.methods,
    ...filters.mustIncludeIngredientIds,
    ...filters.excludedIngredientIds,
    ...filters.dietTags,
    ...filters.excludedAllergens,
    ...filters.availableEquipmentIds,
  ].map((value) => ({ value, text: label(value, locale) }));
  const reasonEntries = Object.entries(eligibility.excludedByReason)
    .filter(([, count]) => count)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3);

  return (
    <section aria-labelledby="filters-title" className="filter-workspace" id="planner-filters">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">
            <FilterIcon /> {activeFilterCount(filters)} {t.selected}
          </p>
          <h2 id="filters-title">{t.filters}</h2>
          <p>{t.filtersHint}</p>
        </div>
        <div className="history-actions">
          <button disabled={!canUndo} onClick={onUndo} type="button">
            {locale === 'zh-CN' ? '撤销' : 'Undo'}
          </button>
          <button className="danger-link" onClick={onRequestReset} type="button">
            {t.reset}
          </button>
        </div>
      </div>
      <p className="filter-group-label">{t.groupFlavour}</p>
      <div className="filter-grid">
        <Dropdown
          icon={CuisineIcon}
          active={filters.cuisines.length > 0}
          id="cuisine"
          labelText={t.cuisine}
          locale={locale}
          onChange={(next) => onChange({ ...filters, cuisines: next })}
          options={choice(facets.cuisines)}
          searchable
          selected={filters.cuisines}
        />
        <Dropdown
          active={filters.methods.length > 0}
          icon={MethodIcon}
          id="method"
          labelText={t.method}
          locale={locale}
          onChange={(next) => onChange({ ...filters, methods: next })}
          options={choice(facets.methods)}
          selected={filters.methods}
        />
        <Dropdown
          active={filters.minHealthScore > 1}
          icon={HealthIcon}
          id="health"
          labelText={t.health}
          locale={locale}
          multiple={false}
          onChange={(next) => onChange({ ...filters, minHealthScore: Number(next[0] ?? 1) })}
          options={[
            { value: '1', zh: copy['zh-CN'].healthAny, en: en.healthAny },
            { value: '3', zh: copy['zh-CN'].healthGood, en: en.healthGood },
            { value: '4', zh: copy['zh-CN'].healthBetter, en: en.healthBetter },
            { value: '5', zh: copy['zh-CN'].healthBest, en: en.healthBest },
          ]}
          selected={[String(filters.minHealthScore)]}
        />
        <Dropdown
          active={filters.maxSpiceLevel < 5}
          icon={SpiceIcon}
          id="spice"
          labelText={t.spice}
          locale={locale}
          multiple={false}
          onChange={(next) => onChange({ ...filters, maxSpiceLevel: Number(next[0] ?? 5) })}
          options={[
            { value: '5', zh: copy['zh-CN'].any, en: en.any },
            { value: '0', zh: '0 · 不辣', en: '0 · No heat' },
            { value: '1', zh: '1 · 微辣', en: '1 · Mild' },
            { value: '2', zh: '2 · 中辣', en: '2 · Medium' },
            { value: '3', zh: '3 · 辣', en: '3 · Hot' },
          ]}
          selected={[String(filters.maxSpiceLevel)]}
        />
      </div>

      <p className="filter-group-label">{t.groupIngredients}</p>
      <div className="filter-grid">
        <Dropdown
          active={filters.mustIncludeIngredientIds.length > 0}
          icon={IncludeIcon}
          id="include"
          labelText={t.include}
          locale={locale}
          onChange={(next) =>
            onChange({
              ...filters,
              mustIncludeIngredientIds: next,
              excludedIngredientIds: filters.excludedIngredientIds.filter(
                (id) => !next.includes(id),
              ),
            })
          }
          options={facets.ingredients}
          searchable
          selected={filters.mustIncludeIngredientIds}
        />
        <Dropdown
          active={filters.excludedIngredientIds.length > 0}
          icon={ExcludeIcon}
          id="exclude-ingredient"
          labelText={t.excludeIngredient}
          locale={locale}
          onChange={(next) =>
            onChange({
              ...filters,
              excludedIngredientIds: next.filter(
                (id) => !filters.mustIncludeIngredientIds.includes(id),
              ),
            })
          }
          options={facets.ingredients}
          searchable
          selected={filters.excludedIngredientIds}
        />
        <Dropdown
          active={filters.dietTags.length > 0}
          icon={DietIcon}
          id="diet"
          labelText={t.diet}
          locale={locale}
          onChange={(next) => onChange({ ...filters, dietTags: next })}
          options={choice(facets.diets)}
          selected={filters.dietTags}
        />
        <Dropdown
          active={filters.excludedAllergens.length > 0}
          icon={AllergenIcon}
          id="allergens"
          labelText={t.allergens}
          locale={locale}
          onChange={(next) => onChange({ ...filters, excludedAllergens: next })}
          options={choice(facets.allergens)}
          selected={filters.excludedAllergens}
        />
      </div>

      <p className="filter-group-label">{t.groupConditions}</p>
      <div className="filter-grid">
        <Dropdown
          active={filters.availableEquipmentIds.length > 0}
          icon={EquipmentIcon}
          id="equipment"
          labelText={t.equipment}
          locale={locale}
          onChange={(next) => onChange({ ...filters, availableEquipmentIds: next })}
          options={choice(facets.equipment)}
          selected={filters.availableEquipmentIds}
        />
        <Dropdown
          active={filters.maxTotalMinutes !== null}
          icon={TimeIcon}
          id="time"
          labelText={t.time}
          locale={locale}
          multiple={false}
          onChange={(next) =>
            onChange({ ...filters, maxTotalMinutes: next[0] ? Number(next[0]) : null })
          }
          options={[
            { value: '', zh: copy['zh-CN'].any, en: en.any },
            ...[30, 45, 60, 90].map((value) => ({
              value: String(value),
              zh: `≤ ${value} 分钟`,
              en: `≤ ${value} min`,
            })),
          ]}
          selected={[filters.maxTotalMinutes ? String(filters.maxTotalMinutes) : '']}
        />
        <Dropdown
          active={filters.childFriendlyOnly}
          icon={ChildIcon}
          id="child"
          labelText={t.child}
          locale={locale}
          multiple={false}
          onChange={(next) => onChange({ ...filters, childFriendlyOnly: next[0] === 'child' })}
          options={[
            { value: 'all', zh: copy['zh-CN'].any, en: en.any },
            { value: 'child', zh: '仅儿童友好', en: 'Child-friendly only' },
          ]}
          selected={[filters.childFriendlyOnly ? 'child' : 'all']}
        />
      </div>
      <div aria-live="polite" className="selection-strip">
        <div className="eligible-count">
          <strong>{eligibleCount}</strong>
          <span>{t.eligible}</span>
        </div>
        <div className="chips">
          {selectedChips.length ? (
            selectedChips.slice(0, 10).map((chip) => (
              <span className="chip" key={chip.value}>
                {chip.text}
              </span>
            ))
          ) : (
            <span className="no-filters">{t.noFilter}</span>
          )}
          {selectedChips.length > 10 && (
            <span className="chip more-chip">+{selectedChips.length - 10}</span>
          )}
        </div>
      </div>
      <div className="feedback-row">
        <span className="coverage-meter">
          <b>{t.coverage}</b> {eligibility.coveredMustIncludeIngredientIds.length}/
          {filters.mustIncludeIngredientIds.length || 0}
        </span>
        {reasonEntries.length > 0 && (
          <span className="reason-summary">
            <b>{t.reason}</b>{' '}
            {reasonEntries
              .map(([code, count]) => `${reasonLabel[code]?.[languageKey] ?? code} ${count}`)
              .join(' · ')}
          </span>
        )}
      </div>
    </section>
  );
}
