'use client';

import type { PlannerRecipe, RecipeDetailRecord } from '@/domain/catalogue';
import type { MenuSummary } from '@/domain/planner';
import { scaleRecipeIngredients } from '@/domain/scaling';
import { buildShoppingList } from '@/domain/shopping-list';
import { copy, fill, roleLabel, type Locale } from '@/i18n/copy';

/**
 * The printable rendering of a menu: an overview page, one page per dish with
 * amounts already scaled to the table, and a merged shopping list to take to
 * the shops. It is always in the DOM and only visible to the print stylesheet,
 * which keeps export working offline with no service behind it.
 */
export function PrintView({
  menu,
  details,
  locale,
  guests,
  currency,
  ingredientNames,
}: {
  menu: MenuSummary;
  details: Map<string, RecipeDetailRecord> | null;
  locale: Locale;
  guests: number;
  currency: Intl.NumberFormat;
  ingredientNames: Map<string, string>;
}) {
  const t = copy[locale];
  const shopping = buildShoppingList(menu.recipes, guests);
  const perPersonCents = guests > 0 ? Math.round(menu.estimatedCostCents / guests) : 0;

  return (
    <div aria-hidden="true" className="print-view">
      <section className="print-page print-overview">
        <header>
          <h1>{t.brand}</h1>
          <p>{t.eyebrow}</p>
        </header>
        <p className="print-meta">
          {guests} {locale === 'zh-CN' ? '人' : 'guests'} · {menu.recipes.length}{' '}
          {locale === 'zh-CN' ? '道菜' : 'dishes'} ·{' '}
          {currency.format(menu.estimatedCostCents / 100)} ({t.perPerson}{' '}
          {currency.format(perPersonCents / 100)})
        </p>
        <ol className="print-menu-list">
          {menu.recipes.map((recipe) => (
            <li key={recipe.id}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the print
                  sheet needs one fixed-width file per dish, not a responsive set */}
              <img alt="" src={`/media/${recipe.slug}-320.webp`} />
              <div>
                <b>{recipe.translations[locale].title}</b>
                <span>{roleLabel(recipe.primaryRole, locale)}</span>
                <span>
                  {recipe.totalMinutes} {t.minutes} · ≈ {recipe.nutrition.energyKcal} kcal
                </span>
              </div>
            </li>
          ))}
        </ol>
        <p className="print-note">{t.estimated}</p>
      </section>

      {menu.recipes.map((recipe) => (
        <RecipePrintPage
          detail={details?.get(recipe.id) ?? null}
          guests={guests}
          ingredientNames={ingredientNames}
          key={recipe.id}
          locale={locale}
          recipe={recipe}
        />
      ))}

      <section className="print-page">
        <h2>{t.shoppingList}</h2>
        <p className="print-note">{fill(t.shoppingHint, { count: guests })}</p>
        {(['main', 'seasoning'] as const).map((group) => {
          const items = shopping.filter((line) => line.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              <h3>{group === 'main' ? t.groupMain : t.groupSeasoning}</h3>
              <ul className="print-shopping">
                {items.map((line) => (
                  <li key={line.ingredientId}>
                    <span>{ingredientNames.get(line.ingredientId) ?? line.ingredientId}</span>
                    <b>{line.display}</b>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function RecipePrintPage({
  recipe,
  detail,
  locale,
  guests,
  ingredientNames,
}: {
  recipe: PlannerRecipe;
  detail: RecipeDetailRecord | null;
  locale: Locale;
  guests: number;
  ingredientNames: Map<string, string>;
}) {
  const t = copy[locale];
  const translation = recipe.translations[locale];
  const ingredients = scaleRecipeIngredients(recipe, guests, true);
  const detailText = detail?.translations[locale];
  const steps = detailText?.structuredInstructions?.length
    ? detailText.structuredInstructions.map((step) => step.text)
    : (detailText?.instructions ?? []);

  return (
    <section className="print-page">
      <div className="print-dish-head">
        {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
        <img alt="" src={`/media/${recipe.slug}-640.webp`} />
        <div>
          <p className="print-role">{roleLabel(recipe.primaryRole, locale)}</p>
          <h2>{translation.title}</h2>
          <p>{translation.summary}</p>
        </div>
      </div>
      <p className="print-meta">
        {recipe.totalMinutes} {t.minutes} · ≈ {recipe.nutrition.energyKcal} kcal ·{' '}
        {fill(t.scaleTo, { count: guests })}
      </p>
      <h3>{t.ingredients}</h3>
      <ul className="print-ingredients">
        {ingredients.map((item) => (
          <li key={item.ingredientId}>
            <span>{ingredientNames.get(item.ingredientId) ?? item.ingredientId}</span>
            <b>{item.display}</b>
          </li>
        ))}
      </ul>
      <h3>{t.steps}</h3>
      <ol className="print-steps">
        {steps.map((step, index) => (
          <li key={`${recipe.id}-print-step-${index}`}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
