'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import type { Occasion, SeasonalChip } from '@/config/seasonal';
import type { PlannerRecipe } from '@/domain/catalogue';
import { copy, label, type Locale } from '@/i18n/copy';
import { encodeQr, qrPath } from '@/vendor/qr';

import { hasRecipeArt, recipeImageUrl } from './images';

/** Idle time before the screen goes back to inviting the next customer. */
const ATTRACT_AFTER_MS = 90_000;
/** Dishes in one loop of the reel: two minutes of screen before it repeats. */
const REEL_LENGTH = 15;
/** How long each dish holds the screen. */
const SLIDE_MS = 8_000;

/**
 * Dishes that keep their photograph but stay out of the shop window.
 *
 * The reel plays two metres tall facing a public walkway, where a picture is
 * seen by everyone who passes rather than by someone who chose to look at it.
 * A whole spit-roast lamb, head and all, is an honest photograph of that dish
 * and belongs on its card; leading a family shopping centre's window with it
 * is a different decision. Nothing is hidden — the dish is still in the
 * catalogue, still searchable, still fully illustrated. It just does not open.
 */
const NOT_FOR_THE_WINDOW = new Set(['feast-whole-spit-roast-lamb']);

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
 * Keeps the display awake while the kiosk is on screen.
 *
 * A shop window that has dimmed itself is not a demonstration of anything, and
 * the attract screen is deliberately motionless for eight seconds at a time,
 * which is exactly what a screen saver waits for. The lock is dropped and
 * retaken when the tab is hidden and shown again, because the browser releases
 * it on its own and never restores it.
 */
export function useScreenWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        // Refused on battery saver, or unsupported. The screen may dim; the
        // kiosk still works, so this is never worth an error on the glass.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void lock?.release().catch(() => undefined);
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
    // Photographed only. A dish whose artwork has not been produced yet shows
    // an honest placeholder on a card; filling the whole window with one would
    // just look like a screen that failed to load.
    const photographed = recipes.filter(
      (recipe) => hasRecipeArt(recipe) && !NOT_FOR_THE_WINDOW.has(recipe.slug),
    );
    const pool = photographed.filter((recipe) =>
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
    // An occasion whose photographs are still being produced contributes
    // nothing rather than blanks; if that leaves the reel empty, the screen
    // falls back to the catalogue at large rather than showing nothing at all.
    if (reel.length) return reel.slice(0, REEL_LENGTH);
    return photographed
      .slice(0, REEL_LENGTH)
      .map((recipe) => ({ recipe, occasion: (recipe.occasions?.[0] ?? 'weeknight') as Occasion }));
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
