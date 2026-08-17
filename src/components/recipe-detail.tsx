'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { PlannerRecipe, RecipeDetailRecord } from '@/domain/catalogue';
import { healthScore } from '@/domain/health';
import { scaleRecipeIngredients } from '@/domain/scaling';
import { copy, fill, roleLabel, type Locale } from '@/i18n/copy';

import { CloseIcon, LeafScore } from './icons';
import { IngredientImage, RecipeImage } from './images';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function RecipeDetail({
  recipe,
  detail,
  locale,
  guests,
  ingredientNames,
  onClose,
}: {
  recipe: PlannerRecipe;
  /** Cooking text, fetched on demand; null while the payload is still loading. */
  detail: RecipeDetailRecord | null;
  locale: Locale;
  guests: number;
  ingredientNames: Map<string, string>;
  onClose: () => void;
}) {
  const t = copy[locale];
  const [scaled, setScaled] = useState(true);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const translation = recipe.translations[locale];
  const score = healthScore(recipe);
  const ingredients = useMemo(
    () => scaleRecipeIngredients(recipe, guests, scaled),
    [recipe, guests, scaled],
  );
  const mainIngredients = ingredients.filter((item) => item.group === 'main');
  const seasoning = ingredients.filter((item) => item.group === 'seasoning');
  const detailText = detail?.translations[locale];
  const steps = detailText?.structuredInstructions?.length
    ? detailText.structuredInstructions
    : (detailText?.instructions ?? []).map((text) => ({
        text,
        minutes: undefined,
        phase: undefined,
        tip: undefined,
      }));
  const phaseLabel = { prep: t.phasePrep, cook: t.phaseCook, plate: t.phasePlate } as const;

  // The dialog owns focus while it is open and hands it straight back on close,
  // so keyboard users are never dropped at the top of the page.
  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    const node = dialogRef.current;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const focusable = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [onClose]);

  function renderIngredients(items: typeof ingredients, title: string) {
    if (!items.length) return null;
    return (
      <div className="ingredient-group">
        <h4>{title}</h4>
        <ul className="ingredient-list">
          {items.map((item) => {
            const name = ingredientNames.get(item.ingredientId) ?? item.ingredientId;
            const note = locale === 'zh-CN' ? item.preparationNoteZh : item.preparationNoteEn;
            return (
              <li className={item.optional ? 'is-optional' : ''} key={item.ingredientId}>
                <span className="ingredient-thumb">
                  <IngredientImage ingredientId={item.ingredientId} name={name} />
                </span>
                <span className="ingredient-name">
                  <b>{name}</b>
                  {note && <small>{note}</small>}
                  {item.optional && <em>{t.optional}</em>}
                </span>
                <span className="ingredient-amount">{item.display}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

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
        ref={dialogRef}
        role="dialog"
      >
        <button aria-label={t.close} className="icon-button close-detail" onClick={onClose} type="button">
          <CloseIcon />
        </button>
        <div className="detail-hero">
          <RecipeImage locale={locale} preload recipe={recipe} sizes="(max-width: 900px) 100vw, 640px" />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{roleLabel(recipe.primaryRole, locale)}</p>
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
            <span className="detail-health">
              <LeafScore score={score} title={fill(t.healthScore, { score })} />
            </span>
          </div>

          <div className="section-head">
            <h3>{t.ingredients}</h3>
            <label className="scale-toggle">
              <input
                checked={scaled}
                onChange={(event) => setScaled(event.target.checked)}
                type="checkbox"
              />
              <span>{fill(t.scaleTo, { count: guests })}</span>
            </label>
          </div>
          <p className="scale-note">{fill(t.baseServing, { count: recipe.baseServings })}</p>
          {renderIngredients(mainIngredients, t.groupMain)}
          {renderIngredients(seasoning, t.groupSeasoning)}

          <div className="section-head">
            <h3>{t.steps}</h3>
            <span className="method-total">
              {fill(t.activeTime, { active: recipe.activeMinutes, total: recipe.totalMinutes })}
            </span>
          </div>
          {recipe.advanceMinutes > 0 && (
            <p className="advance-note">{fill(t.advancePrep, { count: recipe.advanceMinutes })}</p>
          )}
          {!detail && <p className="step-loading">{t.loadingSteps}</p>}
          <ol className="step-list">
            {steps.map((step, index) => (
              <li key={`${recipe.id}-step-${index}`}>
                <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="step-body">
                  {(step.phase || step.minutes !== undefined) && (
                    <p className="step-meta">
                      {step.phase && <b>{phaseLabel[step.phase]}</b>}
                      {step.minutes !== undefined && (
                        <span>
                          {step.minutes} {t.minutes}
                        </span>
                      )}
                    </p>
                  )}
                  <p>{step.text}</p>
                  {step.tip && <p className="step-tip">{step.tip}</p>}
                </div>
              </li>
            ))}
          </ol>
          {detail?.safetyNotes && <p className="safety-note">{detail.safetyNotes}</p>}
          <p className="estimate-note">{t.estimated}</p>
        </div>
      </article>
    </div>
  );
}
