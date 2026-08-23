'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import manifest from '@/generated/catalogue-manifest.json';
import tenantConfig from '@/generated/tenant-config.json';
import {
  applyOccasion,
  clearOccasion,
  currentChips,
  type Occasion,
  type SeasonalChip,
} from '@/config/seasonal';
import {
  fetchPlanningCatalogue,
  fetchRecipeDetails,
  type IngredientDefinition,
  type PlannerRecipe,
  type RecipeDetailRecord,
} from '@/domain/catalogue';
import {
  buildMenuFromRecipes,
  composeMenu,
  defaultPlannerFilters,
  defaultPlannerPreferences,
  getEligibleRecipes,
  getRoleAlternatives,
  resolveRoleTemplate,
  summarizeEligibility,
  type PlannerFilters,
  type PlannerPreferences,
} from '@/domain/planner';
import {
  parsePlannerState,
  serializePlannerState,
  withPreservedParams,
  type PlannerState,
} from '@/domain/url-state';
import type { TenantConfig } from '@/domain/venue';
import { renderShareCard, shareCardDishes } from '@/domain/share-card';
import { copy, roleLabel, type Choice, type Locale } from '@/i18n/copy';

import { resetSession, track } from './analytics';
import { AppHeader } from './app-header';
import {
  AttractScreen,
  HandoffDialog,
  useIdleTimer,
  useKioskMode,
  useScreenWakeLock,
} from './kiosk';
import { FilterWorkspace, type FacetOptions } from './filter-workspace';
import type { SearchHit } from './global-search';
import { MenuBoard, type CourseSlot } from './menu-board';
import { OccasionChips } from './occasion-chips';
import { PrintView } from './print-view';
import { RecipeDetail } from './recipe-detail';
import { RoutePanel } from './route-panel';
import { ShoppingListPanel } from './shopping-list-panel';
import { TableSettings } from './table-settings';
import { warmMenuMedia } from './warm-images';

type Snapshot = { filters: PlannerFilters; preferences: PlannerPreferences };

// Compiled in at build time; null on the public site.
const tenant = tenantConfig as TenantConfig | null;

const defaultState: PlannerState = {
  locale: tenant?.defaultLocale ?? 'zh-CN',
  filters: defaultPlannerFilters,
  preferences: defaultPlannerPreferences,
  variation: 0,
  substitutions: {},
};

const EMPTY_RECIPES: PlannerRecipe[] = [];

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

const CHIP_RECHECK_MS = 3_600_000;

function subscribeToClock(onChange: () => void) {
  const timer = window.setInterval(onChange, CHIP_RECHECK_MS);
  return () => window.clearInterval(timer);
}

export function PlannerApp({
  initialRecipes,
  initialIngredients,
  initialChips,
  servedOccasions,
}: {
  /** The default table, composed at build time so the first paint has food on it. */
  initialRecipes: PlannerRecipe[];
  initialIngredients: IngredientDefinition[];
  /**
   * The chip row for the build date. Computing it on the server and again on
   * the client is what keeps the first paint identical to the hydrated markup;
   * an effect below re-reads the reader's own date and corrects the row if the
   * deployment has outlived the season it was built in.
   */
  initialChips: SeasonalChip[];
  servedOccasions: Occasion[];
}) {
  const [catalogue, setCatalogue] = useState<{
    recipes: PlannerRecipe[];
    ingredients: IngredientDefinition[];
  } | null>(null);
  const [details, setDetails] = useState<Map<string, RecipeDetailRecord> | null>(null);
  const [edits, setEdits] = useState<PlannerState | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<Snapshot | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<PlannerRecipe | null>(null);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [attracting, setAttracting] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  /** The table the host had before a chip took it over, restored on cancel. */
  const [occasionSnapshot, setOccasionSnapshot] = useState<Snapshot | null>(null);

  const kiosk = useKioskMode();
  /*
   * The chip row is a reading of the calendar, and the calendar is outside
   * React: a build made in September would still be offering Mid-Autumn the
   * following June, and a kiosk screen stays open for weeks at a time. The
   * prerendered row comes from the build date so the first paint matches the
   * markup; from hydration on, the reader's own clock decides, re-checked
   * hourly so a screen left running crosses into the new season by itself.
   */
  const chips = useSyncExternalStore(
    subscribeToClock,
    () => currentChips({ available: servedOccasions, featured: tenant?.seasonal }),
    () => initialChips,
  );
  const search = useSyncExternalStore(subscribeToHistory, readSearch, readServerSearch);
  const linkedState = useMemo(() => (search ? parsePlannerState(search) : defaultState), [search]);
  const state = edits ?? linkedState;
  const { locale, filters, preferences, variation, substitutions } = state;
  const t = copy[locale];

  const setLocale = useCallback(
    (next: Locale) => setEdits((current) => ({ ...(current ?? linkedState), locale: next })),
    [linkedState],
  );

  // The catalogue is a hashed static asset rather than part of the page payload:
  // 400 complete records serialised into the document pushed the first load
  // several times over its budget.
  useEffect(() => {
    const controller = new AbortController();
    fetchPlanningCatalogue(manifest.planning, controller.signal)
      .then((payload) =>
        setCatalogue({ recipes: payload.recipes, ingredients: payload.ingredients }),
      )
      .catch((error) => {
        if (!controller.signal.aborted) console.error(error);
      });
    return () => controller.abort();
  }, []);

  // Cooking text is fetched immediately alongside the catalogue rather than on
  // first open. Waiting would trade a spinner for bytes nobody is short of.
  useEffect(() => {
    const controller = new AbortController();
    fetchRecipeDetails(manifest.details, controller.signal)
      .then(setDetails)
      .catch((error) => {
        if (!controller.signal.aborted) console.error(error);
      });
    return () => controller.abort();
  }, []);

  // Ninety seconds untouched and the screen goes back to inviting the next
  // person. Never while the invitation is already up.
  useIdleTimer(kiosk && !attracting, enterAttract);
  useScreenWakeLock(kiosk);

  // A poster QR carries ?src=qr; counting it before the URL is rewritten with
  // planner state is what turns printed material into a measurable channel.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('src') === 'qr') track('scan');
  }, []);

  // A back navigation restores the link's own state, so local edits are dropped
  // rather than shadowing the entry the reader just returned to.
  useEffect(() => {
    const onPopState = () => setEdits(null);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const recipes = catalogue?.recipes ?? EMPTY_RECIPES;
  const ingredientCatalog = catalogue?.ingredients ?? initialIngredients;

  // Before the catalogue lands the prerendered table stands in for a composed
  // one. A link that carries its own conditions describes a different table, so
  // that case waits rather than showing a menu the link did not ask for.
  const usePrerendered = catalogue === null && !search;

  const menu = useMemo(
    () =>
      usePrerendered
        ? buildMenuFromRecipes(initialRecipes, preferences, filters)
        : composeMenu(recipes, preferences, variation, filters, substitutions),
    [usePrerendered, initialRecipes, recipes, preferences, variation, filters, substitutions],
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
    [locale, ingredientCatalog],
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
      // Derived, not listed: an occasion with no dish behind it never appears.
      occasions: unique(recipes.flatMap((recipe) => recipe.occasions ?? [])),
      methods: unique(recipes.flatMap((recipe) => recipe.methods)),
      diets: unique(recipes.flatMap((recipe) => recipe.dietTags.map((tag) => tag.code))),
      allergens: unique(recipes.flatMap((recipe) => recipe.allergens.map((a) => a.allergenCode))),
      equipment: unique(recipes.flatMap((recipe) => recipe.equipment.map((item) => item.id))),
      ingredients,
    };
  }, [recipes, ingredientCatalog]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // The dishes on the table are the ones a reader is most likely to open, so
  // their full-size photos are decoded during the first idle moment.
  useEffect(() => warmMenuMedia(menu.recipes), [menu.recipes]);

  // Writing the state back to the address bar keeps the browser's own history
  // and the copy-link action in step without adding a navigation.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = withPreservedParams(serializePlannerState(state), window.location.search);
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
      track('compose');
    },
    [locale, filters, preferences],
  );

  const updatePreferences = useCallback(
    (next: PlannerPreferences) => {
      setUndoSnapshot({ filters, preferences });
      setEdits({ locale, filters, preferences: next, variation: 0, substitutions: {} });
      track('compose');
    },
    [locale, filters, preferences],
  );

  /**
   * A chip is one gesture in both directions: it lays the occasion's table, and
   * pressing it again hands back the table the host had before it.
   */
  function toggleOccasion(occasion: Occasion) {
    const active = filters.occasions.length === 1 && filters.occasions[0] === occasion;
    const next = active
      ? clearOccasion(filters, preferences, occasionSnapshot ?? undefined)
      : applyOccasion(occasion, filters, preferences);
    if (active) setOccasionSnapshot(null);
    else if (!occasionSnapshot) setOccasionSnapshot({ filters, preferences });
    setUndoSnapshot({ filters, preferences });
    setEdits({
      locale,
      filters: next.filters,
      preferences: next.preferences,
      variation: 0,
      substitutions: {},
    });
    track('compose');
  }

  /**
   * Back to the invitation. A kiosk shares one browser session with everyone
   * who walks past, so the next customer must not inherit the last one's
   * filters — or be counted as the same visit.
   */
  function enterAttract() {
    resetSession();
    setEdits({ ...defaultState });
    setUndoSnapshot(null);
    setOccasionSnapshot(null);
    setDetailRecipe(null);
    setShoppingOpen(false);
    setRouteOpen(false);
    setResetOpen(false);
    setHandoffUrl(null);
    setAttracting(true);
  }

  /** From one photograph to the whole table it belongs to. */
  function startFromDish(recipe: PlannerRecipe, occasion: Occasion) {
    const applied = applyOccasion(occasion, defaultPlannerFilters, defaultPlannerPreferences);
    const slot = resolveRoleTemplate(applied.preferences).indexOf(recipe.primaryRole);
    setEdits({
      locale,
      filters: applied.filters,
      preferences: applied.preferences,
      variation: 0,
      substitutions: slot >= 0 ? { [slot]: recipe.id } : {},
    });
    setAttracting(false);
    track('kiosk');
  }

  function openHandoff() {
    setHandoffUrl(shareUrl({ src: 'qr' }));
    track('handoff');
  }

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

  function openRecipe(recipe: PlannerRecipe) {
    setDetailRecipe(recipe);
  }

  function onSearchSelect(hit: SearchHit) {
    if (hit.kind === 'recipe') {
      openRecipe(hit.recipe);
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

  /**
   * The link that reproduces this exact table. It never carries `kiosk`: the
   * phone that scans the code should get the website, not a shop-window screen
   * that hides its own controls.
   */
  function shareUrl(extra?: Record<string, string>) {
    const params = new URLSearchParams(serializePlannerState(state));
    for (const [key, value] of Object.entries(extra ?? {})) params.set(key, value);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
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
      {tenant?.notice && (
        // Above the masthead, not in the footer: a link gets forwarded, and
        // whoever opens it next has to read this before they read the brand.
        <p className="tenant-notice" role="note">
          <span className="tenant-notice-tag">DEMO</span>
          {locale === 'zh-CN' ? tenant.notice.zh : tenant.notice.en}
        </p>
      )}
      <AppHeader
        coBrand={
          tenant ? (locale === 'zh-CN' ? tenant.brand.displayZh : tenant.brand.displayEn) : null
        }
        ingredients={ingredientCatalog}
        locale={locale}
        onLocaleChange={setLocale}
        onSearchSelect={onSearchSelect}
        recipes={recipes}
        seats={preferences.guests}
      />
      {/*
        One card, two bands. Both answer the same question — what kind of table
        is this — and the chips write into the very preferences the settings
        above them expose, so a hairline between them says more than a gap.
      */}
      <div className="table-setup">
        <TableSettings locale={locale} onChange={updatePreferences} preferences={preferences} />
        <OccasionChips
          active={filters.occasions.length === 1 ? (filters.occasions[0] as Occasion) : null}
          chips={chips}
          locale={locale}
          onToggle={toggleOccasion}
        />
      </div>
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
          loading={catalogue === null && !usePrerendered}
          guests={preferences.guests}
          locale={locale}
          menu={menu}
          onOpenRecipe={openRecipe}
          onPrint={() => window.print()}
          onRecompose={() => {
            setEdits({ ...state, variation: variation + 1, substitutions: {} });
            track('compose');
          }}
          onShare={share}
          onHandoff={kiosk ? openHandoff : undefined}
          onSaveImage={saveImage}
          onShoppingList={() => {
            setShoppingOpen(true);
            track('list');
          }}
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
          <span>{t.analyticsNote}</span>
        </div>
        <div className="footer-credit">
          {tenant && (
            <span>
              {locale === 'zh-CN' ? tenant.brand.displayZh : tenant.brand.displayEn} × {t.brand}
            </span>
          )}
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
          detail={details?.get(detailRecipe.id) ?? null}
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
          onRoute={
            tenant?.features.navigation
              ? () => {
                  setShoppingOpen(false);
                  setRouteOpen(true);
                }
              : undefined
          }
          recipes={menu.recipes}
        />
      )}

      {routeOpen && tenant && (
        <RoutePanel
          guests={preferences.guests}
          ingredientNames={ingredientNames}
          ingredients={ingredientCatalog}
          locale={locale}
          onClose={() => setRouteOpen(false)}
          recipes={menu.recipes}
          tenant={tenant}
        />
      )}

      {handoffUrl && (
        <HandoffDialog locale={locale} onClose={() => setHandoffUrl(null)} url={handoffUrl} />
      )}

      {attracting && (
        <AttractScreen
          chips={chips}
          locale={locale}
          onPick={startFromDish}
          recipes={recipes.length ? recipes : initialRecipes}
        />
      )}

      <PrintView
        currency={currency}
        details={details}
        guests={preferences.guests}
        ingredientNames={ingredientNames}
        locale={locale}
        menu={menu}
      />
    </main>
  );
}
