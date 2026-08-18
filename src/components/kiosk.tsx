'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import type { Occasion, SeasonalChip } from '@/config/seasonal';
import type { PlannerRecipe } from '@/domain/catalogue';
import { copy, label, type Locale } from '@/i18n/copy';
import { encodeQr, qrPath } from '@/vendor/qr';

import { recipeImageUrl } from './images';

/** Idle time before the screen goes back to inviting the next customer. */
const ATTRACT_AFTER_MS = 90_000;
/** Dishes in one loop of the reel: two minutes of screen before it repeats. */
const REEL_LENGTH = 15;
/** How long each dish holds the screen. */
const SLIDE_MS = 8_000;

/**
 * Whether this page is running as a shop-window kiosk.
 *
 * The flag is stamped on `<html>` by a one-line script in the document head, so
 * the chrome is already correct on the first paint rather than rearranging
 * itself after hydration. Reading it back here keeps behaviour and appearance
 * on the same switch.
 */
export function useKioskMode() {
  return useSyncExternalStore(subscribeToNothing, readKioskFlag, () => false);
}

/** The flag is written once, before hydration, and never changes after. */
function subscribeToNothing() {
  return () => {};
}

function readKioskFlag() {
  return document.documentElement.dataset.kiosk === '1';
}

/**
 * Calls `onIdle` after 90 seconds without a touch. Any interaction anywhere on
 * the page restarts the clock, including scrolling a long menu, which a naive
 * click listener would miss.
 */
export function useIdleTimer(enabled: boolean, onIdle: () => void) {
  const callback = useRef(onIdle);
  // Kept current without restarting the clock every time the parent re-renders.
  useEffect(() => {
    callback.current = onIdle;
  });
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    const restart = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback.current(), ATTRACT_AFTER_MS);
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
    for (const event of events) window.addEventListener(event, restart, { passive: true });
    restart();
    return () => {
      window.clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, restart);
    };
  }, [enabled]);
}

/**
 * The invitation. One dish fills the screen at a time, drawn from whatever the
 * chip row is currently offering, and touching it starts a table built around
 * that dish — a customer walks up to a photograph and walks away with the menu
 * it belongs to, which is a shorter journey than starting from an empty form.
 */
export function AttractScreen({
  recipes,
  chips,
  locale,
  onPick,
}: {
  recipes: PlannerRecipe[];
  chips: SeasonalChip[];
  locale: Locale;
  onPick: (recipe: PlannerRecipe, occasion: Occasion) => void;
}) {
  const t = copy[locale];
  const featured = useMemo(() => {
    const wanted = chips.map((chip) => chip.occasion);
    const pool = recipes.filter((recipe) =>
      (recipe.occasions ?? []).some((occasion) => wanted.includes(occasion as Occasion)),
    );
    // Round-robin by occasion so the reel keeps showing all three, and stable
    // by slug so the same screen shows the same reel after a refresh.
    const byOccasion = wanted.map((occasion) =>
      pool
        .filter((recipe) => recipe.occasions?.includes(occasion))
        .sort((a, b) => a.slug.localeCompare(b.slug)),
    );
    const reel: Array<{ recipe: PlannerRecipe; occasion: Occasion }> = [];
    // A dish can carry two of the offered occasions — plenty of brunch dishes
    // are also weeknight dishes — and showing it twice in one reel would be a
    // thin selection pretending to be a wide one.
    const seen = new Set<string>();
    for (let index = 0; index < 8; index += 1)
      wanted.forEach((occasion, position) => {
        const recipe = byOccasion[position][index];
        if (!recipe || seen.has(recipe.slug)) return;
        seen.add(recipe.slug);
        reel.push({ recipe, occasion });
      });
    return reel.slice(0, REEL_LENGTH);
  }, [recipes, chips]);

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(
      () => setSlide((current) => (current + 1) % featured.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, [featured.length]);

  const current = featured[slide % Math.max(featured.length, 1)];
  if (!current) return null;

  return (
    <button
      className="attract-screen"
      onClick={() => onPick(current.recipe, current.occasion)}
      type="button"
    >
      {featured.map((item, index) => {
        // Every frame stays mounted so the crossfade has something to fade
        // from, but only the neighbours carry a source: fifteen full-size
        // photographs at once would be five megabytes for one visible dish.
        const distance = Math.min(
          Math.abs(index - slide),
          featured.length - Math.abs(index - slide),
        );
        if (distance > 1) return null;
        return (
          <Image
            alt=""
            aria-hidden="true"
            className={index === slide ? 'attract-frame is-current' : 'attract-frame'}
            fill
            key={item.recipe.slug}
            priority={distance === 0}
            sizes="100vw"
            src={recipeImageUrl(item.recipe.slug, 1280)}
            unoptimized
          />
        );
      })}
      <span className="attract-shade" />
      <span className="attract-copy">
        <span className="attract-occasion">{label(current.occasion, locale)}</span>
        <span className="attract-dish">{current.recipe.translations[locale].title}</span>
        <span className="attract-cta">{t.kioskStart}</span>
        <span className="attract-hint">{t.kioskStartHint}</span>
      </span>
    </button>
  );
}

/**
 * The handoff. The code carries the same link the share button copies, plus a
 * marker that says it arrived from a screen — which is what turns "people
 * looked at the window" into a number the centre can act on.
 */
export function HandoffDialog({
  url,
  locale,
  onClose,
}: {
  url: string;
  locale: Locale;
  onClose: () => void;
}) {
  const t = copy[locale];
  const code = useMemo(() => {
    try {
      return encodeQr(url);
    } catch {
      return null;
    }
  }, [url]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        aria-labelledby="handoff-title"
        aria-modal="true"
        className="handoff-dialog"
        role="dialog"
      >
        <h2 id="handoff-title">{t.kioskTake}</h2>
        <p>{t.kioskTakeHint}</p>
        {code ? (
          <svg
            aria-label={t.kioskTake}
            className="handoff-qr"
            role="img"
            viewBox={`-2 -2 ${code.size + 4} ${code.size + 4}`}
          >
            <rect fill="#fff" height={code.size + 4} width={code.size + 4} x="-2" y="-2" />
            <path d={qrPath(code)} fill="#241f1c" shapeRendering="crispEdges" />
          </svg>
        ) : (
          <p className="handoff-fallback">{t.qrFallback}</p>
        )}
        <p className="handoff-note">{t.qrFallback}</p>
        <button className="primary-button" onClick={onClose} type="button">
          {t.close}
        </button>
      </div>
    </div>
  );
}
