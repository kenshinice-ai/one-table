'use client';

import { useEffect, useRef } from 'react';

import type { PlannerRecipe } from '@/domain/catalogue';
import { buildShoppingList } from '@/domain/shopping-list';
import { copy, fill, type Locale } from '@/i18n/copy';

import { CloseIcon, PrintIcon } from './icons';

export function ShoppingListPanel({
  recipes,
  guests,
  locale,
  ingredientNames,
  onClose,
  onPrint,
}: {
  recipes: PlannerRecipe[];
  guests: number;
  locale: Locale;
  ingredientNames: Map<string, string>;
  onClose: () => void;
  onPrint: () => void;
}) {
  const t = copy[locale];
  const lines = buildShoppingList(recipes, guests);
  const main = lines.filter((line) => line.group === 'main');
  const seasoning = lines.filter((line) => line.group === 'seasoning');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  function renderSection(title: string, items: typeof lines) {
    if (!items.length) return null;
    return (
      <section>
        <h3>{title}</h3>
        <ul className="shopping-lines">
          {items.map((line) => (
            <li key={line.ingredientId}>
              <label>
                <input type="checkbox" />
                <span>{ingredientNames.get(line.ingredientId) ?? line.ingredientId}</span>
              </label>
              <b>{line.display}</b>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        aria-labelledby="shopping-title"
        aria-modal="true"
        className="shopping-panel"
        ref={dialogRef}
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
        <h2 id="shopping-title">{t.shoppingList}</h2>
        <p className="shopping-hint">{fill(t.shoppingHint, { count: guests })}</p>
        {renderSection(t.groupMain, main)}
        {renderSection(t.groupSeasoning, seasoning)}
        <button className="primary-action" onClick={onPrint} type="button">
          <PrintIcon />
          <span>{t.printMenu}</span>
        </button>
      </div>
    </div>
  );
}
