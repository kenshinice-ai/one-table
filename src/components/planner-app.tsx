'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ingredientCatalog } from '../../data/recipes';
import type { RecipeImport } from '@/domain/batch-a';
import {
  activeFilterCount,
  composeMenu,
  defaultPlannerFilters,
  defaultPlannerPreferences,
  getEligibleRecipes,
  summarizeEligibility,
  toggleArrayValue,
  type DishCount,
  type PlannerFilters,
  type PlannerPreferences,
  type PlannerServingStyle,
} from '@/domain/planner';

type Locale = 'zh-CN' | 'en-AU';
type Copy = (typeof copy)[Locale];
type Snapshot = { filters: PlannerFilters; preferences: PlannerPreferences };
type Choice = { value: string; zh: string; en: string };

const names: Record<string, { zh: string; en: string }> = {
  chinese_northern: { zh: '中国北方菜', en: 'Northern Chinese' },
  chinese_sichuan: { zh: '川菜', en: 'Sichuan Chinese' },
  chinese_cantonese: { zh: '粤菜', en: 'Cantonese Chinese' },
  chinese_jiangnan: { zh: '江南菜', en: 'Jiangnan Chinese' },
  japanese: { zh: '日本料理', en: 'Japanese' },
  korean: { zh: '韩国料理', en: 'Korean' },
  southeast_asian: { zh: '东南亚料理', en: 'Southeast Asian' },
  indian: { zh: '印度料理', en: 'Indian' },
  mediterranean: { zh: '地中海料理', en: 'Mediterranean' },
  italian: { zh: '意大利料理', en: 'Italian' },
  french: { zh: '法国料理', en: 'French' },
  australian_modern: { zh: '现代澳大利亚料理', en: 'Modern Australian' },
  western_home: { zh: '西式家常菜', en: 'Western home' },
  middle_eastern: { zh: '中东料理', en: 'Middle Eastern' },
  latin_american: { zh: '拉美料理', en: 'Latin American' },
  other: { zh: '其他地区', en: 'Other regions' },
  vegetarian: { zh: '素食', en: 'Vegetarian' },
  vegan: { zh: '纯素', en: 'Vegan' },
  gluten_free_adaptable: { zh: '可调整无麸质', en: 'Gluten-free adaptable' },
  dairy_free_adaptable: { zh: '可调整无乳制品', en: 'Dairy-free adaptable' },
  wheat: { zh: '小麦', en: 'Wheat' },
  fish: { zh: '鱼类', en: 'Fish' },
  egg: { zh: '鸡蛋', en: 'Egg' },
  milk: { zh: '牛奶', en: 'Milk' },
  peanut: { zh: '花生', en: 'Peanut' },
  soy: { zh: '大豆', en: 'Soy' },
  sesame: { zh: '芝麻', en: 'Sesame' },
  almond: { zh: '杏仁', en: 'Almond' },
  sulphites: { zh: '亚硫酸盐', en: 'Sulphites' },
  mollusc: { zh: '软体动物', en: 'Mollusc' },
  braise: { zh: '焖煮', en: 'Braise' },
  grill: { zh: '烧烤', en: 'Grill' },
  stir_fry: { zh: '快炒', en: 'Stir-fry' },
  roast: { zh: '烤制', en: 'Roast' },
  pan_fry: { zh: '煎制', en: 'Pan-fry' },
  steam: { zh: '蒸制', en: 'Steam' },
  bake: { zh: '烘焙', en: 'Bake' },
  raw: { zh: '拌制', en: 'No-cook' },
  boil: { zh: '煮制', en: 'Boil' },
  deep_fry: { zh: '炸制', en: 'Deep-fry' },
  equip_oven: { zh: '烤箱', en: 'Oven' },
  equip_stovetop: { zh: '炉灶', en: 'Stovetop' },
  equip_bbq: { zh: '烧烤炉', en: 'Barbecue' },
  equip_blender: { zh: '搅拌机', en: 'Blender' },
};

const roleNames: Record<string, { zh: string; en: string }> = {
  snack: { zh: '小食', en: 'Snack' },
  starter: { zh: '前菜', en: 'Starter' },
  soup: { zh: '汤', en: 'Soup' },
  main: { zh: '主菜', en: 'Main' },
  side: { zh: '配菜', en: 'Side' },
  staple: { zh: '主食', en: 'Staple' },
  salad: { zh: '沙拉', en: 'Salad' },
  dessert: { zh: '甜品', en: 'Dessert' },
};

const copy = {
  'zh-CN': {
    brand: '聚餐菜单',
    eyebrow: '为一桌人，配一桌好菜',
    title: '轻松组合一桌清新菜单',
    intro: '选择人数、预算与餐桌条件，立即从 {count} 道双语菜谱中得到可执行组合。',
    catalogue: '首发内容',
    recipes: '{count} 道菜谱',
    settings: '餐桌设置',
    guests: '用餐人数',
    dishes: '菜品数量',
    style: '上菜方式',
    budget: '总预算',
    mode: '组合重点',
    family: '合餐分享',
    plated: '分餐上菜',
    buffet: '自助餐台',
    balanced: '均衡搭配',
    budgetMode: '精打细算',
    easy: '轻松执行',
    filters: '条件筛选',
    filtersHint: '所有选择都在下拉框中完成；多选会保留在面板内。',
    cuisine: '菜系与地区',
    method: '烹饪方式',
    include: '希望包含食材',
    excludeIngredient: '不希望出现食材',
    diet: '饮食偏好',
    allergens: '排除过敏原',
    equipment: '可用设备',
    time: '单道最长时间',
    spice: '最高辣度',
    child: '儿童友好',
    any: '不限',
    complete: '完成',
    clear: '清除',
    selected: '已选',
    eligible: '道菜符合条件',
    noFilter: '尚未添加条件',
    menu: '本桌菜单',
    fresh: '条件已同步',
    stale: '已按当前条件更新',
    recompose: '换一组',
    partial: '当前条件只能安全组合部分菜品，没有用不符合条件的菜谱补足。',
    empty: '没有菜谱同时满足这些条件，请减少一个限制。',
    total: '预计总价',
    perPerson: '人均',
    active: '合计动手时间',
    longest: '最长单道',
    calories: '人均热量',
    protein: '人均蛋白质',
    minutes: '分钟',
    details: '查看详情',
    ingredients: '食材',
    steps: '烹饪过程',
    close: '关闭',
    estimated: '价格、热量和过敏原为澳大利亚地区的规划估算；下厨前请核对包装标签。',
    safety: '排除过敏原会同时拦截 contains、derived_from、may_contain 和 unknown。',
    reset: '重置',
    confirmReset: '重置所有条件？',
    confirmBody: '人数、预算、上菜方式和筛选都会回到默认值。',
    confirm: '确认重置',
    local: '确定性安全规则即时生成 · AI 仅做候选策展',
    overBudget: '已超预算容差',
    coverage: '希望食材覆盖',
    reason: '主要影响',
  },
  'en-AU': {
    brand: 'Gathering Menu',
    eyebrow: 'A considered menu for your table',
    title: 'Build a fresh, practical spread',
    intro:
      'Set your guests, budget and table conditions, then compose from {count} bilingual recipes.',
    catalogue: 'Launch content',
    recipes: '{count} recipes',
    settings: 'Table settings',
    guests: 'Guests',
    dishes: 'Dishes',
    style: 'Serving style',
    budget: 'Total budget',
    mode: 'Composition focus',
    family: 'Family sharing',
    plated: 'Plated courses',
    buffet: 'Buffet',
    balanced: 'Balanced',
    budgetMode: 'Budget-first',
    easy: 'Easy workflow',
    filters: 'Filter conditions',
    filtersHint:
      'Every choice uses the same accessible dropdown; multi-select stays open until done.',
    cuisine: 'Cuisine and region',
    method: 'Cooking method',
    include: 'Must-include ingredients',
    excludeIngredient: 'Exclude ingredients',
    diet: 'Diet preferences',
    allergens: 'Exclude allergens',
    equipment: 'Available equipment',
    time: 'Maximum dish time',
    spice: 'Maximum spice',
    child: 'Child-friendly',
    any: 'Any',
    complete: 'Done',
    clear: 'Clear',
    selected: 'selected',
    eligible: 'recipes eligible',
    noFilter: 'No conditions selected',
    menu: 'Your menu',
    fresh: 'Conditions synced',
    stale: 'Updated for current conditions',
    recompose: 'Show another',
    partial: 'Only a partial safe menu fits these conditions. No ineligible recipes were added.',
    empty: 'No recipe meets every condition. Remove one restriction to continue.',
    total: 'Estimated total',
    perPerson: 'Per person',
    active: 'Combined active time',
    longest: 'Longest dish',
    calories: 'Energy per person',
    protein: 'Protein per person',
    minutes: 'min',
    details: 'View details',
    ingredients: 'Ingredients',
    steps: 'Method',
    close: 'Close',
    estimated:
      'Prices, energy and allergens are Australian planning estimates. Check package labels before cooking.',
    safety:
      'Allergen exclusions block contains, derived_from, may_contain and unknown relationships.',
    reset: 'Reset',
    confirmReset: 'Reset all conditions?',
    confirmBody: 'Guests, budget, serving style and filters will return to their defaults.',
    confirm: 'Reset everything',
    local: 'Deterministic safe rules · AI only curates the allow-list',
    overBudget: 'Over budget tolerance',
    coverage: 'Must-include coverage',
    reason: 'Main impact',
  },
} as const;

function label(value: string, locale: Locale) {
  return names[value]?.[locale === 'zh-CN' ? 'zh' : 'en'] ?? value.replaceAll('_', ' ');
}

function Chevron() {
  return (
    <svg aria-hidden="true" className="icon chevron-icon" viewBox="0 0 24 24">
      <path
        d="m7 9 5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="M4 5h16M7 12h10M10 19h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"
        fill="currentColor"
      />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="M20 7v5h-5M4 17v-5h5M6.1 9A7 7 0 0 1 18 6.5L20 9M4 15l2 2.5A7 7 0 0 0 17.9 15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function Dropdown({
  id,
  labelText,
  options,
  selected,
  onChange,
  locale,
  multiple = true,
  searchable = false,
  emptyText,
  customInput,
}: {
  id: string;
  labelText: string;
  options: Choice[];
  selected: string[];
  onChange: (next: string[]) => void;
  locale: Locale;
  multiple?: boolean;
  searchable?: boolean;
  emptyText?: string;
  customInput?: { label: string; value: number; onChange: (value: number) => void };
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const visible = options.filter((option) =>
    `${option.zh} ${option.en}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const selectedLabels = selected
    .map((value) => options.find((option) => option.value === value))
    .filter(Boolean)
    .map((option) => option![locale === 'zh-CN' ? 'zh' : 'en']);
  const summary =
    selectedLabels.length === 0
      ? (emptyText ?? (locale === 'zh-CN' ? '不限' : 'Any'))
      : multiple
        ? `${selectedLabels.slice(0, 2).join('、')}${selectedLabels.length > 2 ? ` +${selectedLabels.length - 2}` : ''}`
        : selectedLabels[0];
  function choose(value: string) {
    const next = multiple ? toggleArrayValue(selected, value) : [value];
    onChange(next);
    if (!multiple) setOpen(false);
  }
  return (
    <div className="dropdown" ref={rootRef}>
      <button
        aria-controls={`${id}-panel`}
        aria-expanded={open}
        className="dropdown-trigger"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="dropdown-label">
          <span>{labelText}</span>
          <strong>{summary}</strong>
        </span>
        <Chevron />
        {selected.length > 0 && (
          <span className="selection-count" aria-label={`${selected.length} selected`}>
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div
          className="dropdown-panel"
          id={`${id}-panel`}
          role="listbox"
          aria-label={labelText}
          aria-multiselectable={multiple}
        >
          {(searchable || options.length > 8) && (
            <label className="dropdown-search">
              <span className="sr-only">{locale === 'zh-CN' ? '搜索' : 'Search'}</span>
              <input
                autoFocus
                onChange={(event) => setQuery(event.target.value)}
                placeholder={locale === 'zh-CN' ? '搜索…' : 'Search…'}
                type="search"
                value={query}
              />
            </label>
          )}
          <div className="dropdown-options">
            {visible.length ? (
              visible.map((option) => (
                <label
                  className={`dropdown-option ${selected.includes(option.value) ? 'is-selected' : ''}`}
                  key={option.value}
                >
                  <input
                    checked={selected.includes(option.value)}
                    onChange={() => choose(option.value)}
                    type={multiple ? 'checkbox' : 'radio'}
                  />
                  <span>{locale === 'zh-CN' ? option.zh : option.en}</span>
                  <span className="option-check" aria-hidden="true">
                    {selected.includes(option.value) ? '✓' : ''}
                  </span>
                </label>
              ))
            ) : (
              <p className="dropdown-empty">{locale === 'zh-CN' ? '没有匹配选项' : 'No matches'}</p>
            )}
          </div>
          {customInput && (
            <label className="dropdown-custom-input">
              <span>{customInput.label}</span>
              <span className="custom-amount">
                <b>A$</b>
                <input
                  inputMode="decimal"
                  min="20"
                  onChange={(event) =>
                    customInput.onChange(Math.max(20, Number(event.target.value) || 20))
                  }
                  type="number"
                  value={customInput.value}
                />
              </span>
            </label>
          )}
          {multiple && (
            <div className="dropdown-footer">
              <button onClick={() => onChange([])} type="button">
                {locale === 'zh-CN' ? '清除' : 'Clear'}
              </button>
              <button className="dropdown-done" onClick={() => setOpen(false)} type="button">
                {locale === 'zh-CN' ? '完成' : 'Done'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecipeImage({ recipe, className = '' }: { recipe: RecipeImport; className?: string }) {
  const [src, setSrc] = useState(`/media/${recipe.slug}.webp`);
  return (
    <Image
      alt={recipe.media.altZh}
      className={className}
      fill
      onError={() => setSrc('/media/recipe-placeholder.svg')}
      sizes="(max-width: 900px) 100vw, 30vw"
      src={src}
      unoptimized
    />
  );
}

function IngredientImage({ ingredientId, name }: { ingredientId: string; name: string }) {
  const [src, setSrc] = useState(`/media/ingredients/${ingredientId}.webp`);
  return (
    <Image
      alt={name}
      className="ingredient-image"
      fill
      onError={() => setSrc('/media/ingredient-placeholder.svg')}
      sizes="48px"
      src={src}
      unoptimized
    />
  );
}

function RecipeDetail({
  recipe,
  locale,
  onClose,
  t,
}: {
  recipe: RecipeImport;
  locale: Locale;
  onClose: () => void;
  t: Copy;
}) {
  const translation = recipe.translations[locale];
  const ingredientNames = new Map(
    ingredientCatalog.map((ingredient) => [
      ingredient.id,
      locale === 'zh-CN' ? ingredient.nameZh : ingredient.nameEn,
    ]),
  );
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <article
        aria-labelledby="recipe-detail-title"
        aria-modal="true"
        className="recipe-detail"
        role="dialog"
      >
        <button
          aria-label={t.close}
          className="icon-button close-detail"
          onClick={onClose}
          type="button"
        >
          <CloseIcon />
        </button>
        <div className="detail-hero">
          <RecipeImage recipe={recipe} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {roleNames[recipe.primaryRole]?.[locale === 'zh-CN' ? 'zh' : 'en']}
          </p>
          <h2 id="recipe-detail-title">{translation.title}</h2>
          <p className="detail-summary">{translation.summary}</p>
          <div className="detail-stats">
            <span>
              {recipe.totalMinutes} {t.minutes}
            </span>
            <span>
              ≈ {recipe.nutrition.energyKcal} kcal / {locale === 'zh-CN' ? '份' : 'serve'}
            </span>
            <span>{recipe.difficulty}</span>
          </div>
          <h3>{t.ingredients}</h3>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ingredient) => {
              const itemName =
                ingredientNames.get(ingredient.ingredientId) ?? ingredient.ingredientId;
              return (
                <li key={ingredient.ingredientId}>
                  <span className="ingredient-thumb">
                    <IngredientImage ingredientId={ingredient.ingredientId} name={itemName} />
                  </span>
                  <span>
                    <b>{itemName}</b>
                    <small>
                      {ingredient.displayQuantity} ·{' '}
                      {locale === 'zh-CN'
                        ? ingredient.preparationNoteZh
                        : ingredient.preparationNoteEn}
                    </small>
                  </span>
                </li>
              );
            })}
          </ul>
          <h3>{t.steps}</h3>
          <ol className="step-list">
            {translation.instructions.map((step, index) => (
              <li key={`${recipe.id}-step-${index}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <p className="safety-note">{recipe.safetyNotes}</p>
        </div>
      </article>
    </div>
  );
}

export function PlannerApp({ recipes }: { recipes: RecipeImport[] }) {
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [filters, setFilters] = useState<PlannerFilters>(defaultPlannerFilters);
  const [preferences, setPreferences] = useState<PlannerPreferences>(defaultPlannerPreferences);
  const [undoSnapshot, setUndoSnapshot] = useState<Snapshot | null>(null);
  const [variation, setVariation] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<RecipeImport | null>(null);
  const eligible = useMemo(() => getEligibleRecipes(recipes, filters), [recipes, filters]);
  const menu = useMemo(
    () => composeMenu(recipes, preferences, variation, filters),
    [recipes, preferences, variation, filters],
  );
  const t = copy[locale];
  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const languageKey = locale === 'zh-CN' ? 'zh' : 'en';
  const cuisines = useMemo(
    () => [...new Set(recipes.flatMap((recipe) => recipe.cuisines))].sort(),
    [recipes],
  );
  const methods = useMemo(
    () => [...new Set(recipes.flatMap((recipe) => recipe.methods))].sort(),
    [recipes],
  );
  const diets = useMemo(
    () => [...new Set(recipes.flatMap((recipe) => recipe.dietTags.map((tag) => tag.code)))].sort(),
    [recipes],
  );
  const allergens = useMemo(
    () =>
      [
        ...new Set(recipes.flatMap((recipe) => recipe.allergens.map((item) => item.allergenCode))),
      ].sort(),
    [recipes],
  );
  const ingredients = useMemo(
    () =>
      [
        ...new Set(
          recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.ingredientId)),
        ),
      ].sort(),
    [recipes],
  );
  const equipment = useMemo(
    () => [...new Set(recipes.flatMap((recipe) => recipe.equipment.map((item) => item.id)))].sort(),
    [recipes],
  );
  const eligibility = useMemo(
    () => summarizeEligibility(recipes, filters, preferences),
    [recipes, filters, preferences],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  function remember() {
    setUndoSnapshot({ filters, preferences });
  }
  function updateFilters(next: PlannerFilters) {
    remember();
    setVariation(0);
    setFilters(next);
  }
  function updatePreferences(next: PlannerPreferences) {
    remember();
    setVariation(0);
    setPreferences(next);
  }
  function undo() {
    if (!undoSnapshot) return;
    const current = { filters, preferences };
    setFilters(undoSnapshot.filters);
    setPreferences(undoSnapshot.preferences);
    setUndoSnapshot(current);
    setVariation(0);
  }
  function recompose() {
    setVariation((current) => current + 1);
  }
  function reset() {
    remember();
    setFilters(defaultPlannerFilters);
    setPreferences(defaultPlannerPreferences);
    setVariation(0);
    setResetOpen(false);
  }
  const stale = false;
  const countText = (text: string) => text.replace('{count}', String(recipes.length));
  const perPersonCents =
    preferences.guests > 0 ? Math.round(menu.estimatedCostCents / preferences.guests) : 0;
  const choice = (values: string[], map = names): Choice[] =>
    values.map((value) => ({
      value,
      zh: map[value]?.zh ?? value.replaceAll('_', ' '),
      en: map[value]?.en ?? value.replaceAll('_', ' '),
    }));
  const ingredientChoice = choice(ingredients).map((item) => {
    const definition = ingredientCatalog.find((ingredient) => ingredient.id === item.value);
    return { ...item, zh: definition?.nameZh ?? item.zh, en: definition?.nameEn ?? item.en };
  });
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
  };
  const budgetPresets = [6000, 8000, 10000, 12000, 15000, 20000];
  const budgetSelection = budgetPresets.includes(preferences.budgetCents)
    ? String(preferences.budgetCents)
    : 'custom';
  return (
    <main className="planner-shell" id="main-content">
      <a className="skip-link" href="#planner-filters">
        {locale === 'zh-CN' ? '跳到条件筛选' : 'Skip to filters'}
      </a>
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path
                d="M24 43V12M24 24c-7-5-11-4-14-2m14-5c6-6 11-7 15-6M24 32c-6-3-10-2-13 1m13-4c5-5 9-5 13-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <circle cx="10" cy="20" fill="currentColor" r="2" />
              <circle cx="38" cy="10" fill="currentColor" r="2" />
            </svg>
          </span>
          <span>{t.brand}</span>
        </div>
        <div className="header-actions">
          <span className="catalogue-pill">
            <b>{countText(t.recipes)}</b>
            <small>{t.local}</small>
          </span>
          <div aria-label={locale === 'zh-CN' ? '语言' : 'Language'} className="locale-switch">
            <button
              aria-pressed={locale === 'zh-CN'}
              onClick={() => setLocale('zh-CN')}
              type="button"
            >
              中文
            </button>
            <button
              aria-pressed={locale === 'en-AU'}
              onClick={() => setLocale('en-AU')}
              type="button"
            >
              EN
            </button>
          </div>
        </div>
      </header>
      <section className="intro-block">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{countText(t.intro)}</p>
        </div>
        <div className="intro-badge">
          <SparkleIcon />
          <span>{t.catalogue}</span>
          <strong>{recipes.length}</strong>
          <small>
            {locale === 'zh-CN' ? '道已覆盖角色配额的菜谱' : 'recipes across every launch quota'}
          </small>
        </div>
      </section>
      <section className="settings-row" aria-label={t.settings}>
        <div className="section-kicker">
          <span className="kicker-dot" />
          {t.settings}
        </div>
        <Dropdown
          id="guests"
          labelText={t.guests}
          locale={locale}
          multiple={false}
          options={Array.from({ length: 30 }, (_, index) => ({
            value: String(index + 1),
            zh: `${index + 1} 人`,
            en: `${index + 1} guests`,
          }))}
          selected={[String(preferences.guests)]}
          onChange={(next) => updatePreferences({ ...preferences, guests: Number(next[0] ?? 6) })}
        />
        <Dropdown
          id="dishes"
          labelText={t.dishes}
          locale={locale}
          multiple={false}
          options={Array.from({ length: 10 }, (_, index) => ({
            value: String(index + 1),
            zh: `${index + 1} 道`,
            en: `${index + 1} dishes`,
          }))}
          selected={[String(preferences.dishCount)]}
          onChange={(next) =>
            updatePreferences({ ...preferences, dishCount: Number(next[0] ?? 4) as DishCount })
          }
        />
        <Dropdown
          id="style"
          labelText={t.style}
          locale={locale}
          multiple={false}
          options={[
            { value: 'family', zh: t.family, en: copy['en-AU'].family },
            { value: 'plated', zh: t.plated, en: copy['en-AU'].plated },
            { value: 'buffet', zh: t.buffet, en: copy['en-AU'].buffet },
          ]}
          selected={[preferences.servingStyle]}
          onChange={(next) =>
            updatePreferences({
              ...preferences,
              servingStyle: (next[0] ?? 'family') as PlannerServingStyle,
            })
          }
        />
        <Dropdown
          id="budget"
          labelText={t.budget}
          locale={locale}
          multiple={false}
          options={[60, 80, 100, 120, 150, 200]
            .map((amount) => ({
              value: String(amount * 100),
              zh: `A$${amount}`,
              en: `A$${amount}`,
            }))
            .concat([{ value: 'custom', zh: '自定义金额', en: 'Custom amount' }])}
          selected={[budgetSelection]}
          customInput={{
            label: locale === 'zh-CN' ? '自定义预算（A$）' : 'Custom budget (A$)',
            value: Math.round(preferences.budgetCents / 100),
            onChange: (value) =>
              updatePreferences({ ...preferences, budgetCents: Math.round(value * 100) }),
          }}
          onChange={(next) =>
            updatePreferences({
              ...preferences,
              budgetCents:
                next[0] === 'custom' ? preferences.budgetCents : Number(next[0] ?? 12000),
            })
          }
        />
        <Dropdown
          id="mode"
          labelText={t.mode}
          locale={locale}
          multiple={false}
          options={[
            { value: 'balanced', zh: t.balanced, en: copy['en-AU'].balanced },
            { value: 'budget', zh: t.budgetMode, en: copy['en-AU'].budgetMode },
            { value: 'easy', zh: t.easy, en: copy['en-AU'].easy },
          ]}
          selected={[preferences.compositionMode]}
          onChange={(next) =>
            updatePreferences({
              ...preferences,
              compositionMode: (next[0] ?? 'balanced') as PlannerPreferences['compositionMode'],
            })
          }
        />
      </section>
      <div className="planner-grid">
        <section className="filter-workspace" id="planner-filters" aria-labelledby="filters-title">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">
                <FilterIcon /> {activeFilterCount(filters)} {t.selected}
              </p>
              <h2 id="filters-title">{t.filters}</h2>
              <p>{t.filtersHint}</p>
            </div>
            <div className="history-actions">
              <button disabled={!undoSnapshot} onClick={undo} type="button">
                {locale === 'zh-CN' ? '撤销' : 'Undo'}
              </button>
              <button className="danger-link" onClick={() => setResetOpen(true)} type="button">
                {t.reset}
              </button>
            </div>
          </div>
          <div className="filter-grid">
            <Dropdown
              id="cuisine"
              labelText={t.cuisine}
              options={choice(cuisines)}
              selected={filters.cuisines}
              onChange={(next) => updateFilters({ ...filters, cuisines: next })}
              locale={locale}
              searchable
            />
            <Dropdown
              id="method"
              labelText={t.method}
              options={choice(methods)}
              selected={filters.methods}
              onChange={(next) => updateFilters({ ...filters, methods: next })}
              locale={locale}
            />
            <Dropdown
              id="include"
              labelText={t.include}
              options={ingredientChoice}
              selected={filters.mustIncludeIngredientIds}
              onChange={(next) =>
                updateFilters({
                  ...filters,
                  mustIncludeIngredientIds: next,
                  excludedIngredientIds: filters.excludedIngredientIds.filter(
                    (id) => !next.includes(id),
                  ),
                })
              }
              locale={locale}
              searchable
            />
            <Dropdown
              id="exclude-ingredient"
              labelText={t.excludeIngredient}
              options={ingredientChoice}
              selected={filters.excludedIngredientIds}
              onChange={(next) =>
                updateFilters({
                  ...filters,
                  excludedIngredientIds: next.filter(
                    (id) => !filters.mustIncludeIngredientIds.includes(id),
                  ),
                })
              }
              locale={locale}
              searchable
            />
            <Dropdown
              id="diet"
              labelText={t.diet}
              options={choice(diets)}
              selected={filters.dietTags}
              onChange={(next) => updateFilters({ ...filters, dietTags: next })}
              locale={locale}
            />
            <Dropdown
              id="allergens"
              labelText={t.allergens}
              options={choice(allergens)}
              selected={filters.excludedAllergens}
              onChange={(next) => updateFilters({ ...filters, excludedAllergens: next })}
              locale={locale}
            />
            <Dropdown
              id="equipment"
              labelText={t.equipment}
              options={choice(equipment)}
              selected={filters.availableEquipmentIds}
              onChange={(next) => updateFilters({ ...filters, availableEquipmentIds: next })}
              locale={locale}
            />
            <Dropdown
              id="time"
              labelText={t.time}
              options={[
                { value: '', zh: t.any, en: t.any },
                ...[30, 45, 60, 90].map((value) => ({
                  value: String(value),
                  zh: `≤ ${value} 分钟`,
                  en: `≤ ${value} min`,
                })),
              ]}
              selected={[filters.maxTotalMinutes ? String(filters.maxTotalMinutes) : '']}
              onChange={(next) =>
                updateFilters({ ...filters, maxTotalMinutes: next[0] ? Number(next[0]) : null })
              }
              locale={locale}
              multiple={false}
            />
            <Dropdown
              id="spice"
              labelText={t.spice}
              options={[
                { value: '5', zh: t.any, en: t.any },
                { value: '0', zh: '0 · 不辣', en: '0 · No heat' },
                { value: '1', zh: '1 · 微辣', en: '1 · Mild' },
                { value: '2', zh: '2 · 中辣', en: '2 · Medium' },
                { value: '3', zh: '3 · 辣', en: '3 · Hot' },
              ]}
              selected={[String(filters.maxSpiceLevel)]}
              onChange={(next) =>
                updateFilters({ ...filters, maxSpiceLevel: Number(next[0] ?? 5) })
              }
              locale={locale}
              multiple={false}
            />
            <Dropdown
              id="child"
              labelText={t.child}
              options={[
                { value: 'all', zh: t.any, en: t.any },
                { value: 'child', zh: '仅儿童友好', en: 'Child-friendly only' },
              ]}
              selected={[filters.childFriendlyOnly ? 'child' : 'all']}
              onChange={(next) =>
                updateFilters({ ...filters, childFriendlyOnly: next[0] === 'child' })
              }
              locale={locale}
              multiple={false}
            />
          </div>
          <div className="selection-strip" aria-live="polite">
            <div className="eligible-count">
              <strong>{eligible.length}</strong>
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
        <aside aria-busy="false" className="menu-panel" aria-labelledby="menu-title">
          <div className="menu-heading">
            <div>
              <p className="eyebrow">
                {preferences.guests} {locale === 'zh-CN' ? '人' : 'guests'} ·{' '}
                {preferences.dishCount} {locale === 'zh-CN' ? '道菜' : 'dishes'}
              </p>
              <h2 id="menu-title">{t.menu}</h2>
            </div>
            <span aria-live="polite" className={stale ? 'menu-status stale' : 'menu-status'}>
              {stale ? t.stale : t.fresh}
            </span>
          </div>
          {menu.recipes.length === 0 ? (
            <div className="empty-state">
              <strong>0</strong>
              <p>{t.empty}</p>
            </div>
          ) : (
            <>
              {menu.isPartial && <p className="inline-warning">{t.partial}</p>}
              <div className="menu-list">
                {menu.recipes.map((recipe, index) => (
                  <button
                    className="dish-card"
                    key={recipe.id}
                    onClick={() => setDetailRecipe(recipe)}
                    type="button"
                  >
                    <span className={`dish-number role-${recipe.primaryRole}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="dish-image">
                      <RecipeImage recipe={recipe} />
                    </span>
                    <span className="dish-copy">
                      <span className="dish-role">
                        {roleNames[recipe.primaryRole]?.[languageKey] ?? recipe.primaryRole}
                      </span>
                      <strong>{recipe.translations[locale].title}</strong>
                      <small>{recipe.translations[locale].summary}</small>
                      <span className="dish-meta">
                        <span>
                          {recipe.totalMinutes} {t.minutes}
                        </span>
                        <span>≈ {recipe.nutrition.energyKcal} kcal</span>
                        <b>{currency.format(recipe.cost.totalCents / 100)}</b>
                      </span>
                    </span>
                    <span className="detail-arrow" aria-hidden="true">
                      ›
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          <dl className="menu-summary">
            <div>
              <dt>{t.total}</dt>
              <dd className={menu.isOverBudget ? 'over-budget' : ''}>
                {currency.format(menu.estimatedCostCents / 100)}
              </dd>
              <small>
                {t.perPerson} {currency.format(perPersonCents / 100)}
              </small>
            </div>
            <div>
              <dt>{t.active}</dt>
              <dd>
                {menu.activeMinutes} {t.minutes}
              </dd>
              <small>
                {t.longest} {menu.maxTotalMinutes} {t.minutes}
              </small>
            </div>
            <div>
              <dt>{t.calories}</dt>
              <dd>{Math.round(menu.energyKcalPerPerson)} kcal</dd>
              <small>
                {t.protein} {Math.round(menu.proteinGPerPerson)} g
              </small>
            </div>
          </dl>
          {menu.isOverBudget && <p className="budget-warning">{t.overBudget}</p>}
          <button
            className="primary-action"
            disabled={eligible.length === 0}
            onClick={recompose}
            type="button"
          >
            <RefreshIcon />
            <span>{t.recompose}</span>
          </button>
          <p className="estimate-note">{t.estimated}</p>
        </aside>
      </div>
      <footer className="app-footer">
        <span>{t.local}</span>
        <span>{t.safety}</span>
      </footer>
      {resetOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setResetOpen(false);
          }}
        >
          <div
            aria-describedby="reset-description"
            aria-labelledby="reset-title"
            aria-modal="true"
            className="confirm-dialog"
            role="dialog"
          >
            <h2 id="reset-title">{t.confirmReset}</h2>
            <p id="reset-description">{t.confirmBody}</p>
            <div>
              <button onClick={() => setResetOpen(false)} type="button">
                {t.close}
              </button>
              <button className="danger-button" onClick={reset} type="button">
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
      {detailRecipe && (
        <RecipeDetail
          recipe={detailRecipe}
          locale={locale}
          onClose={() => setDetailRecipe(null)}
          t={t}
        />
      )}
    </main>
  );
}
