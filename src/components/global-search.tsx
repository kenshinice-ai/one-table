'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { RecipeImport } from '@/domain/batch-a';
import { copy, label, roleLabel, type Locale } from '@/i18n/copy';

import { SearchIcon } from './icons';

export type SearchHit =
  | { kind: 'recipe'; id: string; title: string; detail: string; recipe: RecipeImport }
  | { kind: 'ingredient'; id: string; title: string; detail: string }
  | { kind: 'cuisine'; id: string; title: string; detail: string };

type IngredientDefinition = { id: string; nameZh: string; nameEn: string };

function normalize(value: string) {
  return value.toLocaleLowerCase().trim();
}

/**
 * Builds the client-side index once per catalogue. Everything searchable is
 * already in memory, so there is no request behind the search box.
 */
function buildIndex(
  recipes: RecipeImport[],
  ingredients: IngredientDefinition[],
  locale: Locale,
) {
  const usedIngredientIds = new Set(
    recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.ingredientId)),
  );
  const cuisines = [...new Set(recipes.flatMap((recipe) => recipe.cuisines))].sort();
  return {
    recipes: recipes.map((recipe) => ({
      hit: {
        kind: 'recipe' as const,
        id: recipe.id,
        title: recipe.translations[locale].title,
        detail: roleLabel(recipe.primaryRole, locale),
        recipe,
      },
      haystack: normalize(
        `${recipe.translations['zh-CN'].title} ${recipe.translations['en-AU'].title} ${recipe.slug}`,
      ),
    })),
    ingredients: ingredients
      .filter((ingredient) => usedIngredientIds.has(ingredient.id))
      .map((ingredient) => ({
        hit: {
          kind: 'ingredient' as const,
          id: ingredient.id,
          title: locale === 'zh-CN' ? ingredient.nameZh : ingredient.nameEn,
          detail: copy[locale].searchHintIngredient,
        },
        haystack: normalize(`${ingredient.nameZh} ${ingredient.nameEn} ${ingredient.id}`),
      })),
    cuisines: cuisines.map((cuisine) => ({
      hit: {
        kind: 'cuisine' as const,
        id: cuisine,
        title: label(cuisine, locale),
        detail: copy[locale].searchHintCuisine,
      },
      haystack: normalize(`${label(cuisine, 'zh-CN')} ${label(cuisine, 'en-AU')} ${cuisine}`),
    })),
  };
}

function rank<T extends { haystack: string }>(entries: T[], query: string, limit: number) {
  const matches = entries.filter((entry) => entry.haystack.includes(query));
  // A prefix match is almost always what the reader meant, so it sorts first.
  return matches
    .sort((a, b) => Number(b.haystack.startsWith(query)) - Number(a.haystack.startsWith(query)))
    .slice(0, limit);
}

export function GlobalSearch({
  recipes,
  ingredients,
  locale,
  onSelect,
}: {
  recipes: RecipeImport[];
  ingredients: IngredientDefinition[];
  locale: Locale;
  onSelect: (hit: SearchHit) => void;
}) {
  const t = copy[locale];
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(
    () => buildIndex(recipes, ingredients, locale),
    [recipes, ingredients, locale],
  );

  const groups = useMemo<Array<{ title: string; items: SearchHit[] }>>(() => {
    const normalized = normalize(query);
    if (normalized.length < 1) return [];
    return [
      {
        title: t.searchRecipes,
        items: rank(index.recipes, normalized, 6).map((entry): SearchHit => entry.hit),
      },
      {
        title: t.searchIngredients,
        items: rank(index.ingredients, normalized, 4).map((entry): SearchHit => entry.hit),
      },
      {
        title: t.searchCuisines,
        items: rank(index.cuisines, normalized, 3).map((entry): SearchHit => entry.hit),
      },
    ].filter((group) => group.items.length > 0);
  }, [query, index, t]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  // Focus stays in the field after a pick so a second search needs no click.
  const choose = useCallback(
    (hit: SearchHit) => {
      onSelect(hit);
      setQuery('');
      setOpen(false);
    },
    [onSelect],
  );

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
      return;
    }
    if (!flat.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % flat.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + flat.length) % flat.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(flat[activeIndex]);
    }
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div className="global-search" ref={rootRef}>
      <div className="search-field">
        <SearchIcon />
        <input
          aria-autocomplete="list"
          aria-controls="global-search-results"
          aria-expanded={showPanel}
          aria-label={t.searchLabel}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t.search}
          ref={inputRef}
          role="combobox"
          type="search"
          value={query}
        />
        <kbd aria-hidden="true">⌘K</kbd>
      </div>
      {showPanel && (
        <div className="search-results" id="global-search-results" role="listbox">
          {groups.length === 0 ? (
            <p className="search-empty">{t.searchEmpty}</p>
          ) : (
            groups.map((group) => (
              <section key={group.title}>
                <h3>{group.title}</h3>
                {group.items.map((hit) => {
                  const position = flat.indexOf(hit);
                  return (
                    <button
                      aria-selected={position === activeIndex}
                      className={`search-hit ${position === activeIndex ? 'is-active' : ''}`}
                      key={`${hit.kind}-${hit.id}`}
                      onClick={() => choose(hit)}
                      onMouseEnter={() => setActiveIndex(position)}
                      role="option"
                      type="button"
                    >
                      <span>{hit.title}</span>
                      <small>{hit.detail}</small>
                    </button>
                  );
                })}
              </section>
            ))
          )}
        </div>
      )}
    </div>
  );
}
