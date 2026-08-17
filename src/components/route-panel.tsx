'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { IngredientDefinition, PlannerRecipe } from '@/domain/catalogue';
import { renderRouteCard } from '@/domain/share-card';
import { buildShoppingList } from '@/domain/shopping-list';
import { resolveStops, stopsForLevel, type TenantConfig } from '@/domain/venue';
import { copy, fill, type Locale } from '@/i18n/copy';

import { CloseIcon, ImageIcon } from './icons';

/**
 * The venue route: the shopping list resolved into an ordered store walk, drawn
 * over the venue's schematic floor plans. This is the white-label product's
 * core promise made visible — the menu ends in footsteps, not a recipe.
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

  async function saveCard() {
    if (saving || !route.stops.length) return;
    setSaving(true);
    try {
      const blob = await renderRouteCard({
        venueName: zh ? tenant.brand.displayZh : tenant.brand.displayEn,
        brand: t.brand,
        title: t.route,
        summary: fill(t.routeSummary, { stops: route.stops.length, stores: route.storeCount }),
        floors: tenant.venue.floors.map((floor) => ({
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
        stops: route.stops.map((stop, index) => ({
          index: index + 1,
          level: stop.poi.level,
          name: zh ? stop.poi.nameZh : stop.poi.nameEn,
          isConcierge: stop.poi.kind === 'concierge',
          items: stop.items.map(
            (item) => `${ingredientNames.get(item.ingredientId) ?? item.ingredientId} ${item.display}`,
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
      <div aria-labelledby="route-title" aria-modal="true" className="route-panel" ref={dialogRef} role="dialog">
        <button aria-label={t.close} className="icon-button close-detail" onClick={onClose} type="button">
          <CloseIcon />
        </button>
        <p className="eyebrow">{zh ? tenant.brand.displayZh : tenant.brand.displayEn}</p>
        <h2 id="route-title">{t.route}</h2>
        <p className="route-summary">
          {fill(t.routeSummary, { stops: route.stops.length, stores: route.storeCount })}
        </p>

        {tenant.venue.floors.map((floor) => {
          const levelStops = stopsForLevel(route, floor.level);
          if (!levelStops.length) return null;
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
                    <circle cx={stop.poi.x} cy={stop.poi.y} fill="var(--terracotta)" r="17" stroke="#fff" strokeWidth="3" />
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
        })}

        <ol className="route-stops">
          {route.stops.map((stop, index) => (
            <li className={stop.poi.kind === 'concierge' ? 'is-concierge' : ''} key={stop.poi.poiId}>
              <span className="stop-index">{index + 1}</span>
              <div>
                <b>
                  {zh ? stop.poi.nameZh : stop.poi.nameEn}
                  <small> · {zh ? '楼层' : 'Level'} {stop.poi.level}</small>
                </b>
                {stop.poi.kind === 'concierge' && <p className="stop-note">{t.conciergeStop}</p>}
                <p className="stop-items">
                  {stop.items
                    .map((item) => `${ingredientNames.get(item.ingredientId) ?? item.ingredientId} ${item.display}`)
                    .join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <button className="primary-action" disabled={saving || !route.stops.length} onClick={saveCard} type="button">
          <ImageIcon />
          <span>{saving ? t.saving : t.saveRouteCard}</span>
        </button>
        <p className="estimate-note">{t.routeDisclaimer}</p>
      </div>
    </div>
  );
}
