'use client';

import { occasionPresets, type Occasion, type SeasonalChip } from '@/config/seasonal';
import { copy, label, type Locale } from '@/i18n/copy';

import { OccasionIcon } from './icons';

/**
 * The fastest path to a finished table.
 *
 * Every other control narrows a catalogue; a chip states what the evening is
 * and lets the table follow from it — the occasion filter and the course shape
 * land together, because the shapes in `occasionPresets` are the ones that
 * occasion's dishes can actually fill.
 */
export function OccasionChips({
  chips,
  active,
  locale,
  onToggle,
}: {
  chips: SeasonalChip[];
  active: Occasion | null;
  locale: Locale;
  onToggle: (occasion: Occasion) => void;
}) {
  if (!chips.length) return null;
  const t = copy[locale];
  // A campaign link can land on an occasion the calendar is not currently
  // offering — a Lunar New Year poster read in August. The row leads with it
  // anyway, so what is switched on is visible, and one tap switches it off.
  const shown =
    active && !chips.some((chip) => chip.occasion === active)
      ? [{ occasion: active, inSeason: false }, ...chips.slice(0, chips.length - 1)]
      : chips;
  return (
    <section aria-describedby="seasonal-hint" aria-label={t.seasonal} className="seasonal-row">
      <div className="section-kicker">
        <span className="kicker-dot" />
        {t.seasonal}
      </div>
      <div className="seasonal-chips">
        {shown.map((chip) => {
          const preset = occasionPresets[chip.occasion];
          return (
            <button
              aria-pressed={active === chip.occasion}
              className="seasonal-chip"
              key={chip.occasion}
              onClick={() => onToggle(chip.occasion)}
              type="button"
            >
              <OccasionIcon className="control-icon" />
              <span className="seasonal-chip-text">
                <span className="seasonal-chip-label">
                  {label(chip.occasion, locale)}
                  {chip.inSeason && <span className="seasonal-flag">{t.inSeason}</span>}
                </span>
                <span className="seasonal-chip-note">
                  {locale === 'zh-CN' ? preset.noteZh : preset.noteEn}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" id="seasonal-hint">
        {t.seasonalHint}
      </p>
    </section>
  );
}
