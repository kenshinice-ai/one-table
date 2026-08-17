'use client';

import { useState } from 'react';

import type { PlannerRecipe } from '@/domain/catalogue';
import { healthScore } from '@/domain/health';
import { courseOrder, type MenuSummary, type PrimaryRole } from '@/domain/planner';
import { copy, fill, roleLabel, type Locale } from '@/i18n/copy';

import { BasketIcon, ImageIcon, LeafScore, LinkIcon, PrintIcon, RefreshIcon } from './icons';
import { RecipeImage } from './images';
import { warmRecipeMedia } from './warm-images';

export type CourseSlot = { slotIndex: number; role: PrimaryRole; recipe: PlannerRecipe };

/**
 * Groups the composed menu into the courses it was built from. The planner has
 * always worked to a course template; showing those headings is what makes the
 * shape of the meal legible instead of a flat list of dishes.
 */
function groupByCourse(menu: MenuSummary): Array<{ role: PrimaryRole; slots: CourseSlot[] }> {
  const slots: CourseSlot[] = menu.recipes.map((recipe, slotIndex) => ({
    slotIndex,
    role: recipe.primaryRole,
    recipe,
  }));
  return courseOrder
    .map((role) => ({ role, slots: slots.filter((slot) => slot.role === role) }))
    .filter((group) => group.slots.length > 0);
}

export function MenuBoard({
  menu,
  locale,
  guests,
  currency,
  alternativesFor,
  onOpenRecipe,
  onSubstitute,
  onRecompose,
  onPrint,
  onShare,
  onShoppingList,
  onSaveImage,
  shareLabel,
  imageLabel,
  disabled,
  loading,
}: {
  menu: MenuSummary;
  locale: Locale;
  guests: number;
  currency: Intl.NumberFormat;
  alternativesFor: (slot: CourseSlot) => PlannerRecipe[];
  onOpenRecipe: (recipe: PlannerRecipe) => void;
  onSubstitute: (slotIndex: number, recipeId: string) => void;
  onRecompose: () => void;
  onPrint: () => void;
  onShare: () => void;
  onShoppingList: () => void;
  onSaveImage: () => void;
  shareLabel: string;
  imageLabel: string;
  disabled: boolean;
  /** True until the catalogue payload lands, so the panel can hold its shape. */
  loading: boolean;
}) {
  const t = copy[locale];
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const groups = groupByCourse(menu);
  const perPersonCents = guests > 0 ? Math.round(menu.estimatedCostCents / guests) : 0;
  const offTarget = menu.conflicts.some((conflict) => conflict.code === 'kcal_out_of_target');

  return (
    <aside aria-labelledby="menu-title" className="menu-panel">
      <div className="menu-heading">
        <div>
          <p className="eyebrow">
            {guests} {locale === 'zh-CN' ? '人' : 'guests'} · {menu.recipes.length}{' '}
            {locale === 'zh-CN' ? '道菜' : 'dishes'}
          </p>
          <h2 id="menu-title">{t.menu}</h2>
        </div>
        <span aria-live="polite" className="menu-status">
          {loading ? t.loadingMenu : t.fresh}
        </span>
      </div>

      <div className="menu-scroll">
        {loading ? (
          <div aria-hidden="true" className="menu-skeleton">
            {[0, 1, 2, 3].map((row) => (
              <div className="skeleton-row" key={row}>
                <span className="skeleton-thumb" />
                <span className="skeleton-lines">
                  <span />
                  <span />
                </span>
              </div>
            ))}
          </div>
        ) : menu.recipes.length === 0 ? (
          <div className="empty-state">
            <strong>0</strong>
            <p>{t.empty}</p>
          </div>
        ) : (
          <>
            {menu.isPartial && <p className="inline-warning">{t.partial}</p>}
            <div className="menu-courses">
              {groups.map((group) => (
                <section className="course-group" key={group.role}>
                  <h3 className="course-heading">
                    <span className={`course-dot role-${group.role}`} aria-hidden="true" />
                    {roleLabel(group.role, locale)}
                    {group.slots.length > 1 && <small>×{group.slots.length}</small>}
                  </h3>
                  {group.slots.map((slot) => {
                    const { recipe } = slot;
                    const score = healthScore(recipe);
                    const alternatives = openSlot === slot.slotIndex ? alternativesFor(slot) : [];
                    return (
                      <div className="dish-row" key={`${recipe.id}-${slot.slotIndex}`}>
                        <button
                          className="dish-card"
                          onClick={() => onOpenRecipe(recipe)}
                          onPointerEnter={() => warmRecipeMedia(recipe)}
                          onTouchStart={() => warmRecipeMedia(recipe)}
                          type="button"
                        >
                          <span className="dish-image">
                            <RecipeImage locale={locale} recipe={recipe} />
                          </span>
                          <span className="dish-copy">
                            <strong>{recipe.translations[locale].title}</strong>
                            <small>{recipe.translations[locale].summary}</small>
                            <span className="dish-meta">
                              <span>
                                {recipe.totalMinutes} {t.minutes}
                              </span>
                              <span>≈ {recipe.nutrition.energyKcal} kcal</span>
                              <LeafScore score={score} title={fill(t.healthScore, { score })} />
                              <b>{currency.format(recipe.cost.totalCents / 100)}</b>
                            </span>
                          </span>
                          <span className="detail-arrow" aria-hidden="true">
                            ›
                          </span>
                        </button>
                        <button
                          aria-expanded={openSlot === slot.slotIndex}
                          className="swap-button"
                          onClick={() =>
                            setOpenSlot(openSlot === slot.slotIndex ? null : slot.slotIndex)
                          }
                          type="button"
                        >
                          <RefreshIcon />
                          <span>{t.swapCourse}</span>
                        </button>
                        {openSlot === slot.slotIndex && (
                          <div className="swap-panel">
                            {alternatives.length === 0 ? (
                              <p className="swap-empty">{t.swapNone}</p>
                            ) : (
                              alternatives.map((option) => {
                                const costDelta =
                                  (option.cost.totalCents - recipe.cost.totalCents) / 100;
                                const kcalDelta =
                                  option.nutrition.energyKcal - recipe.nutrition.energyKcal;
                                return (
                                  <button
                                    className="swap-option"
                                    key={option.id}
                                    onClick={() => {
                                      onSubstitute(slot.slotIndex, option.id);
                                      setOpenSlot(null);
                                    }}
                                    type="button"
                                  >
                                    <span>{option.translations[locale].title}</span>
                                    <small>
                                      <span
                                        className={costDelta <= 0 ? 'delta-good' : 'delta-warn'}
                                      >
                                        {costDelta >= 0 ? '+' : '−'}
                                        {currency.format(Math.abs(costDelta))}
                                      </span>
                                      <span
                                        className={kcalDelta <= 0 ? 'delta-good' : 'delta-warn'}
                                      >
                                        {kcalDelta >= 0 ? '+' : '−'}
                                        {Math.abs(kcalDelta)} kcal
                                      </span>
                                      <span>
                                        {option.totalMinutes} {t.minutes}
                                      </span>
                                    </small>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="menu-footer">
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
            <dd className={offTarget ? 'off-target' : ''}>
              {Math.round(menu.energyKcalPerPerson)} kcal
            </dd>
            <small>
              {t.protein} {Math.round(menu.proteinGPerPerson)} g
            </small>
          </div>
        </dl>
        {menu.isOverBudget && <p className="budget-warning">{t.overBudget}</p>}
        {offTarget && <p className="budget-warning">{t.kcalOutOfTarget}</p>}

        <button className="primary-action" disabled={disabled} onClick={onRecompose} type="button">
          <RefreshIcon />
          <span>{t.recompose}</span>
        </button>
        <div className="menu-actions">
          <button disabled={!menu.recipes.length} onClick={onShoppingList} type="button">
            <BasketIcon />
            <span>{t.shoppingList}</span>
          </button>
          <button disabled={!menu.recipes.length} onClick={onPrint} type="button">
            <PrintIcon />
            <span>{t.exportMenu}</span>
          </button>
          <button disabled={!menu.recipes.length} onClick={onSaveImage} type="button">
            <ImageIcon />
            <span>{imageLabel}</span>
          </button>
          <button onClick={onShare} type="button">
            <LinkIcon />
            <span>{shareLabel}</span>
          </button>
        </div>
        <p className="estimate-note">{t.estimated}</p>
      </div>
    </aside>
  );
}
