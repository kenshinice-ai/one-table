'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { ingredientCatalog } from '../../data/recipes';
import type { RecipeImport } from '@/domain/batch-a';
import {
  composeMenu,
  defaultPlannerFilters,
  defaultPlannerPreferences,
  getEligibleRecipes,
  getRoleAlternatives,
  summarizeEligibility,
  type PlannerFilters,
  type PlannerPreferences,
} from '@/domain/planner';
import { parsePlannerState, serializePlannerState, type PlannerState } from '@/domain/url-state';
import { renderShareCard, shareCardDishes } from '@/domain/share-card';
import { copy, roleLabel, type Choice, type Locale } from '@/i18n/copy';

import { AppHeader } from './app-header';
import { FilterWorkspace, type FacetOptions } from './filter-workspace';
import type { SearchHit } from './global-search';
import { MenuBoard, type CourseSlot } from './menu-board';
import { PrintView } from './print-view';
import { RecipeDetail } from './recipe-detail';
import { ShoppingListPanel } from './shopping-list-panel';
import { TableSettings } from './table-settings';

type Snapshot = { filters: PlannerFilters; preferences: PlannerPreferences };

const defaultState: PlannerState = {
  locale: 'zh-CN',
  filters: defaultPlannerFilters,
  preferences: defaultPlannerPreferences,
  variation: 0,
  substitutions: {},
};

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

/**
 * The address bar is an external mutable source: it holds a shared link on the
 * first paint and changes again whenever the reader uses the back button.
 * Reading it through a store subscription keeps the prerendered markup and the
 * hydrated markup identical, which a lazy initial state could not do.
 */
function subscribeToHistory(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

function readSearch() {
  return window.location.search;
}

function readServerSearch() {
  return '';
}

export function PlannerApp({ recipes }: { recipes: RecipeImport[] }) {
  const [edits, setEdits] = useState<PlannerState | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<Snapshot | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<RecipeImport | null>(null);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  const search = useSyncExternalStore(subscribeToHistory, readSearch, readServerSearch);
  const linkedState = useMemo(
    () => (search ? parsePlannerState(search) : defaultState),
    [search],
  );
  const state = edits ?? linkedState;
  const { locale, filters, preferences, variation, substitutions } = state;
  const t = copy[locale];

  const setLocale = useCallback(
    (next: Locale) => setEdits((current) => ({ ...(current ?? linkedState), locale: next })),
    [linkedState],
  );

  // A back navigation restores the link's own state, so local edits are dropped
  // rather than shadowing the entry the reader just returned to.
  useEffect(() => {
    const onPopState = () => setEdits(null);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const menu = useMemo(
    () => composeMenu(recipes, preferences, variation, filters, substitutions),
    [recipes, preferences, variation, filters, substitutions],
  );
  const eligible = useMemo(() => getEligibleRecipes(recipes, filters), [recipes, filters]);
  const eligibility = useMemo(
    () => summarizeEligibility(recipes, filters, preferences),
    [recipes, filters, preferences],
  );

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const ingredientNames = useMemo(
    () =>
      new Map(
        ingredientCatalog.map((ingredient) => [
          ingredient.id,
          locale === 'zh-CN' ? ingredient.nameZh : ingredient.nameEn,
        ]),
      ),
    [locale],
  );

  const facets = useMemo<FacetOptions>(() => {
    const ingredientIds = unique(
      recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.ingredientId)),
    );
    const byId = new Map(ingredientCatalog.map((item) => [item.id, item]));
    const ingredients: Choice[] = ingredientIds.map((id) => {
      const definition = byId.get(id);
      return {
        value: id,
        zh: definition?.nameZh ?? id.replaceAll('_', ' '),
        en: definition?.nameEn ?? id.replaceAll('_', ' '),
      };
    });
    return {
      cuisines: unique(recipes.flatMap((recipe) => recipe.cuisines)),
      methods: unique(recipes.flatMap((recipe) => recipe.methods)),
      diets: unique(recipes.flatMap((recipe) => recipe.dietTags.map((tag) => tag.code))),
      allergens: unique(recipes.flatMap((recipe) => recipe.allergens.map((a) => a.allergenCode))),
      equipment: unique(recipes.flatMap((recipe) => recipe.equipment.map((item) => item.id))),
      ingredients,
    };
  }, [recipes]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Writing the state back to the address bar keeps the browser's own history
  // and the copy-link action in step without adding a navigation.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = serializePlannerState(state);
      window.history.replaceState(null, '', `${window.location.pathname}?${query}`);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [state]);

  // Any change to conditions invalidates the current pick, so the variation
  // index and per-course swaps reset together with it.
  const updateFilters = useCallback(
    (next: PlannerFilters) => {
      setUndoSnapshot({ filters, preferences });
      setEdits({ locale, filters: next, preferences, variation: 0, substitutions: {} });
    },
    [locale, filters, preferences],
  );

  const updatePreferences = useCallback(
    (next: PlannerPreferences) => {
      setUndoSnapshot({ filters, preferences });
      setEdits({ locale, filters, preferences: next, variation: 0, substitutions: {} });
    },
    [locale, filters, preferences],
  );

  function undo() {
    if (!undoSnapshot) return;
    setUndoSnapshot({ filters, preferences });
    setEdits({
      locale,
      filters: undoSnapshot.filters,
      preferences: undoSnapshot.preferences,
      variation: 0,
      substitutions: {},
    });
  }

  function reset() {
    setUndoSnapshot({ filters, preferences });
    setEdits({ ...defaultState, locale });
    setResetOpen(false);
  }

  function onSearchSelect(hit: SearchHit) {
    if (hit.kind === 'recipe') {
      setDetailRecipe(hit.recipe);
      return;
    }
    if (hit.kind === 'ingredient') {
      if (filters.mustIncludeIngredientIds.includes(hit.id)) return;
      updateFilters({
        ...filters,
        mustIncludeIngredientIds: [...filters.mustIncludeIngredientIds, hit.id],
        excludedIngredientIds: filters.excludedIngredientIds.filter((id) => id !== hit.id),
      });
      return;
    }
    if (filters.cuisines.includes(hit.id)) return;
    updateFilters({ ...filters, cuisines: [...filters.cuisines, hit.id] });
  }

  const alternativesFor = useCallback(
    (slot: CourseSlot) =>
      getRoleAlternatives(
        recipes,
        preferences,
        filters,
        slot.role,
        menu.recipes.map((recipe) => recipe.id),
      ),
    [recipes, preferences, filters, menu.recipes],
  );

  // The card is drawn on a canvas from the same artwork the page shows, so the
  // saved image needs no screen capture and works the same on every platform.
  async function saveImage() {
    if (!menu.recipes.length || savingImage) return;
    setSavingImage(true);
    try {
      const blob = await renderShareCard({
        brand: t.brand,
        tagline: t.eyebrow,
        headline: `${preferences.guests} ${locale === 'zh-CN' ? '人' : 'guests'} · ${menu.recipes.length} ${locale === 'zh-CN' ? '道菜' : 'dishes'}`,
        dishes: shareCardDishes(menu.recipes, locale, (role) => roleLabel(role, locale), currency),
        totals: [
          { label: t.total, value: currency.format(menu.estimatedCostCents / 100) },
          { label: t.active, value: `${menu.activeMinutes} ${t.minutes}` },
          { label: t.calories, value: `${Math.round(menu.energyKcalPerPerson)} kcal` },
        ],
        footer: '© 2026 PWE Group Pty Ltd · PWE Studio · 天域文创出品',
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `one-table-${preferences.guests}-${menu.recipes.length}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setSavingImage(false);
    }
  }

  async function share() {
    const query = serializePlannerState(state);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2400);
    } catch {
      // Clipboard access can be refused; the address bar already holds the link.
      window.history.replaceState(null, '', `${window.location.pathname}?${query}`);
    }
  }

  return (
    <main className="planner-shell" id="main-content">
      <a className="skip-link" href="#planner-filters">
        {locale === 'zh-CN' ? '跳到条件筛选' : 'Skip to filters'}
      </a>
      <AppHeader
        ingredients={ingredientCatalog}
        locale={locale}
        onLocaleChange={setLocale}
        onSearchSelect={onSearchSelect}
        recipes={recipes}
        seats={preferences.guests}
      />
      <TableSettings locale={locale} onChange={updatePreferences} preferences={preferences} />
      <div className="planner-grid">
        <FilterWorkspace
          canUndo={Boolean(undoSnapshot)}
          eligibility={eligibility}
          eligibleCount={eligible.length}
          facets={facets}
          filters={filters}
          locale={locale}
          onChange={updateFilters}
          onRequestReset={() => setResetOpen(true)}
          onUndo={undo}
        />
        <MenuBoard
          alternativesFor={alternativesFor}
          currency={currency}
          disabled={eligible.length === 0}
          guests={preferences.guests}
          locale={locale}
          menu={menu}
          onOpenRecipe={setDetailRecipe}
          onPrint={() => window.print()}
          onRecompose={() =>
            setEdits({ ...state, variation: variation + 1, substitutions: {} })
          }
          onShare={share}
          onSaveImage={saveImage}
          onShoppingList={() => setShoppingOpen(true)}
          onSubstitute={(slotIndex, recipeId) =>
            setEdits({
              ...state,
              substitutions: { ...substitutions, [slotIndex]: recipeId },
            })
          }
          imageLabel={savingImage ? t.saving : t.saveImage}
          shareLabel={shareCopied ? t.copied : t.copyLink}
        />
      </div>
      <footer className="app-footer">
        <div className="footer-notes">
          <span>{t.local}</span>
          <span>{t.safety}</span>
          <span>{t.healthDisclaimer}</span>
        </div>
        <div className="footer-credit">
          <span>
            © 2026 PWE Group Pty Ltd ·{' '}
            <a href="https://pwestudio.online/" rel="noopener" target="_blank">
              PWE Studio
            </a>
          </span>
          <span>A Paradise Production · 天域文创出品</span>
        </div>
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
          guests={preferences.guests}
          ingredientNames={ingredientNames}
          locale={locale}
          onClose={() => setDetailRecipe(null)}
          recipe={detailRecipe}
        />
      )}

      {shoppingOpen && (
        <ShoppingListPanel
          guests={preferences.guests}
          ingredientNames={ingredientNames}
          locale={locale}
          onClose={() => setShoppingOpen(false)}
          onPrint={() => window.print()}
          recipes={menu.recipes}
        />
      )}

      <PrintView
        currency={currency}
        guests={preferences.guests}
        ingredientNames={ingredientNames}
        locale={locale}
        menu={menu}
      />
    </main>
  );
}
