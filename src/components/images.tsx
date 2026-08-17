'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { PlannerRecipe } from '@/domain/catalogue';
import type { Locale } from '@/i18n/copy';

/** Widths written to disk by scripts/media/generate-sizes.sh. */
const RECIPE_WIDTHS = [320, 640, 1280];
const INGREDIENT_WIDTHS = [64, 128];

function nearestWidth(available: number[], requested: number) {
  return available.find((width) => width >= requested) ?? available[available.length - 1];
}

/**
 * Maps a requested width onto the pre-generated size ladder. The Worker serves
 * static assets with no image optimiser, so this is what lets `<Image>` emit a
 * real srcset instead of shipping one full-size file to every viewport.
 */
function sizeLadderLoader(available: number[]) {
  return ({ src, width }: { src: string; width: number }) => {
    const base = src.replace(/\.webp$/, '');
    if (!src.endsWith('.webp')) return src;
    return `${base}-${nearestWidth(available, width)}.webp`;
  };
}

const recipeLoader = sizeLadderLoader(RECIPE_WIDTHS);
const ingredientLoader = sizeLadderLoader(INGREDIENT_WIDTHS);

export function RecipeImage({
  recipe,
  locale,
  sizes = '(max-width: 900px) 100vw, 320px',
  preload = false,
}: {
  recipe: PlannerRecipe;
  locale: Locale;
  sizes?: string;
  preload?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const alt = locale === 'zh-CN' ? recipe.media.altZh : recipe.media.altEn;
  if (failed) {
    return <ComingSoon label={alt} />;
  }
  return (
    <Image
      alt={alt}
      fill
      loader={recipeLoader}
      onError={() => setFailed(true)}
      preload={preload}
      sizes={sizes}
      src={`/media/${recipe.slug}.webp`}
    />
  );
}

export function IngredientImage({ ingredientId, name }: { ingredientId: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span aria-hidden="true" className="ingredient-fallback">
        {name.slice(0, 1)}
      </span>
    );
  }
  return (
    <Image
      alt=""
      className="ingredient-image"
      fill
      loader={ingredientLoader}
      onError={() => setFailed(true)}
      sizes="64px"
      src={`/media/ingredients/${ingredientId}.webp`}
    />
  );
}

/**
 * Shown for recipes whose artwork has not been produced yet. It is a real
 * placeholder rather than a broken image, so a dish without a photo still reads
 * as finished on the page.
 */
export function ComingSoon({ label }: { label: string }) {
  return (
    <span aria-label={label} className="coming-soon" role="img">
      <svg aria-hidden="true" viewBox="0 0 64 48">
        <rect fill="var(--surface-soft)" height="48" width="64" />
        <circle cx="32" cy="21" fill="none" r="10" stroke="var(--line)" strokeWidth="2" />
        <path
          d="M18 34h28"
          fill="none"
          stroke="var(--line)"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    </span>
  );
}
