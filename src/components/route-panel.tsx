'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { IngredientDefinition, PlannerRecipe } from '@/domain/catalogue';
import { renderRouteCard, type RouteCardAisle } from '@/domain/share-card';
import { buildShoppingList } from '@/domain/shopping-list';
import { resolveStops, stopsForLevel, type TenantConfig } from '@/domain/venue';
import { copy, fill, type Locale } from '@/i18n/copy';

import { track } from './analytics';
import { CloseIcon, ImageIcon } from './icons';

/**
 * The venue route: the shopping list resolved into an ordered store walk, drawn
 * over the venue's schematic floor plans — or, when no floor has a plan, as a
 * generated aisle strip (the grocer case: zone numbers are aisle numbers, and
 * no venue should have to commission a floor plan to get navigation).
 *
 * Each item can be checked off as it lands in the basket. The state lives in
 * sessionStorage: it survives closing the panel and walking to the next aisle,
 * and clears itself when the shopping trip's browser session ends.
 */
export function RoutePanel({
  tenant,
  recipes,
  ingredients,
  ingredientNames,
  guests,
  locale,
  onClose,
}: {
  tenant: NonNullable<TenantConfig>;
  recipes: PlannerRecipe[];
  ingredients: IngredientDefinition[];
  ingredientNames: Map<string, string>;
  guests: number;
  locale: Locale;
  onClose: () => void;
}) {
  const t = copy[locale];
  const zh = locale === 'zh-CN';
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const route = useMemo(() => {
    const list = buildShoppingList(recipes, guests);
    return resolveStops(list, ingredients, tenant.venue);
  }, [recipes, guests, ingredients, tenant]);

  /** No floor has a schematic → the whole venue renders as an aisle strip. */
  const aisleMode = tenant.venue.floors.every((floor) => !floor.planSrc);

  // The panel only ever mounts on interaction, so reading storage in the
  // initializer cannot desynchronise server and client markup.
  const storageKey = `onetable.route.checked.${tenant.id}`;
  const [checked, setChecked] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]');
      return Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });

  function toggleItem(ingredientId: string) {
    setChecked((previous) => {
      const next = previous.includes(ingredientId)
        ? previous.filter((id) => id !== ingredientId)
        : [...previous, ingredientId];
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Private browsing: the ticks still work for as long as the panel lives.
      }
      return next;
    });
  }

  const allItems = useMemo(
    () => route.stops.flatMap((stop) => stop.items.map((item) => item.ingredientId)),
    [route],
  );
  const doneCount = useMemo(
    () => allItems.filter((id) => checked.includes(id)).length,
    [allItems, checked],
  );

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

  const aisleLabel = (stop: (typeof route.stops)[number]) =>
    stop.poi.kind === 'concierge'
      ? zh
        ? stop.poi.nameZh
        : stop.poi.nameEn
      : `${t.aisle} ${stop.poi.zone}`;

  async function saveCard() {
    if (saving || !route.stops.length) return;
    setSaving(true);
    try {
      const cardAisles: RouteCardAisle[] | undefined = aisleMode
        ? route.stops.map((stop, index) => ({
            index: index + 1,
            label: aisleLabel(stop),
            name: stop.poi.kind === 'concierge' ? '' : zh ? stop.poi.nameZh : stop.poi.nameEn,
            isConcierge: stop.poi.kind === 'concierge',
          }))
        : undefined;
      const blob = await renderRouteCard({
        venueName: zh ? tenant.brand.displayZh : tenant.brand.displayEn,
        brand: t.brand,
        title: t.route,
        summary: fill(t.routeSummary, { stops: route.stops.length, stores: route.storeCount }),
        floors: aisleMode
          ? []
          : tenant.venue.floors.map((floor) => ({
              nameShort: floor.level,
              name: zh ? floor.nameZh : floor.nameEn,
              planSrc: floor.planSrc,
              width: floor.width,
              height: floor.height,
              points: stopsForLevel(route, floor.level).map((stop) => ({
                index: stop.index + 1,
                x: stop.poi.x,
                y: stop.poi.y,
              })),
            })),
        aisles: cardAisles,
        stops: route.stops.map((stop, index) => ({
          index: index + 1,
          level: aisleMode ? String(stop.poi.zone) : stop.poi.level,
          name: zh ? stop.poi.nameZh : stop.poi.nameEn,
          isConcierge: stop.poi.kind === 'concierge',
          items: stop.items.map(
            (item) =>
              `${ingredientNames.get(item.ingredientId) ?? item.ingredientId} ${item.display}`,
          ),
        })),
        disclaimer: t.routeDisclaimer,
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `route-${tenant.id}.png`;
      link.click();
      URL.revokeObjectURL(url);
      track('route');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        aria-labelledby="route-title"
        aria-modal="true"
        className="route-panel"
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
        <p className="eyebrow">{zh ? tenant.brand.displayZh : tenant.brand.displayEn}</p>
        <h2 id="route-title">{t.route}</h2>
        <p className="route-summary">
          {fill(t.routeSummary, { stops: route.stops.length, stores: route.storeCount })}
          {doneCount > 0 && (
            <span className="route-progress">
              {' · '}
              {fill(t.routeProgress, { done: doneCount, total: allItems.length })}
            </span>
          )}
        </p>

        {aisleMode ? (
          <figure className="route-map">
            <figcaption>
              {zh ? tenant.venue.floors[0]?.nameZh : tenant.venue.floors[0]?.nameEn}
            </figcaption>
            <div className="aisle-strip">
              {route.stops.map((stop, index) => (
                <div
                  className={
                    stop.poi.kind === 'concierge' ? 'aisle-cell is-concierge' : 'aisle-cell'
                  }
                  key={stop.poi.poiId}
                >
                  <span className="aisle-cell-index">{index + 1}</span>
                  <b>{aisleLabel(stop)}</b>
                  {stop.poi.kind !== 'concierge' && (
                    <small>{zh ? stop.poi.nameZh : stop.poi.nameEn}</small>
                  )}
                </div>
              ))}
            </div>
          </figure>
        ) : (
          tenant.venue.floors.map((floor) => {
            const levelStops = stopsForLevel(route, floor.level);
            if (!levelStops.length || !floor.planSrc) return null;
            const path = levelStops.map((stop) => `${stop.poi.x},${stop.poi.y}`).join(' ');
            return (
              <figure className="route-map" key={floor.level}>
                <figcaption>{zh ? floor.nameZh : floor.nameEn}</figcaption>
                <svg viewBox={`0 0 ${floor.width} ${floor.height}`}>
                  <image height={floor.height} href={floor.planSrc} width={floor.width} />
                  {levelStops.length > 1 && (
                    <polyline
                      fill="none"
                      points={path}
                      stroke="var(--terracotta)"
                      strokeDasharray="10 8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="5"
                    />
                  )}
                  {levelStops.map((stop) => (
                    <g key={stop.poi.poiId}>
                      <circle
                        cx={stop.poi.x}
                        cy={stop.poi.y}
                        fill="var(--terracotta)"
                        r="17"
                        stroke="#fff"
                        strokeWidth="3"
                      />
                      <text
                        fill="#fff"
                        fontSize="17"
                        fontWeight="700"
                        textAnchor="middle"
                        x={stop.poi.x}
                        y={stop.poi.y + 6}
                      >
                        {stop.index + 1}
                      </text>
                    </g>
                  ))}
                </svg>
              </figure>
            );
          })
        )}

        <ol className="route-stops">
          {route.stops.map((stop, index) => {
            const stopDone =
              stop.items.length > 0 &&
              stop.items.every((item) => checked.includes(item.ingredientId));
            const classes = [
              stop.poi.kind === 'concierge' ? 'is-concierge' : '',
              stopDone ? 'is-done' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <li className={classes} key={stop.poi.poiId}>
                <span className="stop-index">{index + 1}</span>
                <div>
                  <b>
                    {zh ? stop.poi.nameZh : stop.poi.nameEn}
                    <small>
                      {' · '}
                      {aisleMode ? aisleLabel(stop) : `${zh ? '楼层' : 'Level'} ${stop.poi.level}`}
                    </small>
                  </b>
                  {stop.poi.kind === 'concierge' && (
                    // The same desk does two jobs. With items it is a question
                    // to ask; empty it is the end of the walk, and telling a
                    // shopper to ask about nothing reads as a broken screen.
                    <p className="stop-note">
                      {stop.items.length ? t.conciergeStop : t.conciergeFinishStop}
                    </p>
                  )}
                  <ul className="stop-checklist">
                    {stop.items.map((item) => {
                      const done = checked.includes(item.ingredientId);
                      return (
                        <li key={item.ingredientId}>
                          <label className={done ? 'is-done' : ''}>
                            <input
                              checked={done}
                              onChange={() => toggleItem(item.ingredientId)}
                              type="checkbox"
                            />
                            <span>
                              {ingredientNames.get(item.ingredientId) ?? item.ingredientId}{' '}
                              {item.display}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>

        <button
          className="primary-action"
          disabled={saving || !route.stops.length}
          onClick={saveCard}
          type="button"
        >
          <ImageIcon />
          <span>{saving ? t.saving : t.saveRouteCard}</span>
        </button>
        <p className="estimate-note">{t.routeDisclaimer}</p>
      </div>
    </div>
  );
}
