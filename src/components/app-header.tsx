'use client';

import type { PlannerRecipe } from '@/domain/catalogue';
import { copy, type Locale } from '@/i18n/copy';

import { GlobalSearch, type SearchHit } from './global-search';
import { TableMark } from './icons';

export function AppHeader({
  recipes,
  ingredients,
  locale,
  seats,
  onLocaleChange,
  onSearchSelect,
}: {
  recipes: PlannerRecipe[];
  ingredients: Array<{ id: string; nameZh: string; nameEn: string }>;
  locale: Locale;
  seats: number;
  onLocaleChange: (locale: Locale) => void;
  onSearchSelect: (hit: SearchHit) => void;
}) {
  const t = copy[locale];
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <TableMark seats={seats} />
        </span>
        <span className="brand-text">
          <b>{t.brand}</b>
          <small>{t.eyebrow}</small>
        </span>
      </div>
      <GlobalSearch
        ingredients={ingredients}
        locale={locale}
        onSelect={onSearchSelect}
        recipes={recipes}
      />
      <div className="header-actions">
        <div aria-label={locale === 'zh-CN' ? '语言' : 'Language'} className="locale-switch">
          <button
            aria-pressed={locale === 'zh-CN'}
            onClick={() => onLocaleChange('zh-CN')}
            type="button"
          >
            中文
          </button>
          <button
            aria-pressed={locale === 'en-AU'}
            onClick={() => onLocaleChange('en-AU')}
            type="button"
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
