export function Chevron() {
  return (
    <svg aria-hidden="true" className="icon chevron-icon" viewBox="0 0 24 24">
      <path
        d="m7 9 5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="M4 5h16M7 12h10M10 19h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function RefreshIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="M20 7v5h-5M4 17v-5h5M6.1 9A7 7 0 0 1 18 6.5L20 9M4 15l2 2.5A7 7 0 0 0 17.9 15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <circle cx="11" cy="11" fill="none" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="m16 16 4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function PrintIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="M7 9V4h10v5M7 18H5a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M7 15h10v5H7z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.3 1.3M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.3-1.3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <rect
        fill="none"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        width="18"
        x="3"
        y="5"
      />
      <circle cx="9" cy="10.5" fill="currentColor" r="1.6" />
      <path
        d="m4 17 4.5-4.5 3 3 3-2.5L20 17"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function BasketIcon() {
  return (
    <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
      <path
        d="M4 9h16l-1.4 9.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 9ZM9 9 12 3l3 6M9.5 13v3M14.5 13v3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/** A leaf per point, filled up to `score`, used for the deterministic health score. */
export function LeafScore({ score, title }: { score: number; title: string }) {
  return (
    <span className="leaf-score" role="img" aria-label={title} title={title}>
      {[1, 2, 3, 4, 5].map((point) => (
        <svg
          aria-hidden="true"
          className={point <= score ? 'leaf is-on' : 'leaf'}
          key={point}
          viewBox="0 0 16 16"
        >
          <path
            d="M13 3c0 5.5-3 8.5-7.5 8.5C4 11.5 3 10.2 3 8.5 3 5 6.5 3 13 3Z"
            fill="currentColor"
          />
          <path d="M11 5 4.5 12.5" fill="none" stroke="currentColor" strokeLinecap="round" />
        </svg>
      ))}
    </span>
  );
}

/**
 * The One Table mark: the outer ring is the table, the centre is the shared
 * main, and the ring of dots are the seats. Seat count follows the guest
 * setting so the mark quietly reflects the table being planned.
 */
export function TableMark({ seats = 6 }: { seats?: number }) {
  const count = Math.max(3, Math.min(10, seats));
  return (
    <svg aria-hidden="true" className="table-mark" viewBox="0 0 48 48">
      <circle cx="24" cy="24" fill="none" r="19" stroke="var(--terracotta)" strokeWidth="2.6" />
      <circle cx="24" cy="24" fill="var(--terracotta)" r="6.5" />
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle
            cx={24 + Math.cos(angle) * 14.6}
            cy={24 + Math.sin(angle) * 14.6}
            fill="var(--sage)"
            key={index}
            r="2.5"
          />
        );
      })}
    </svg>
  );
}

/*
 * Control glyphs for the table settings and filter panels.
 *
 * Drawn here rather than pulled from an icon package: seventeen glyphs do not
 * justify a dependency, and hand-drawing them is what keeps the stroke identical
 * to the round-table mark the brand is built on. All share a 24px grid, 2px
 * strokes and round caps, and inherit `currentColor` so an active control can
 * tint its own icon.
 */
type GlyphProps = { className?: string };

function glyph(paths: React.ReactNode, extra?: React.ReactNode) {
  return function Glyph({ className = '' }: GlyphProps) {
    return (
      <svg
        aria-hidden="true"
        className={`icon control-icon ${className}`.trim()}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        {paths}
        {extra}
      </svg>
    );
  };
}

/** Two people side by side — how many are eating. */
export const GuestsIcon = glyph(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14.4c2 .7 3.4 2.4 3.4 4.6" />
  </>,
);

/** Stacked plates — the shape of the menu. */
export const CoursesIcon = glyph(
  <>
    <ellipse cx="12" cy="6.5" rx="7.5" ry="3" />
    <path d="M4.5 11.5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    <path d="M4.5 16.5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
  </>,
);

/** A cloche being served. */
export const ServingIcon = glyph(
  <>
    <path d="M3.5 16.5h17" />
    <path d="M5.5 16.5a6.5 6.5 0 0 1 13 0" />
    <path d="M12 10V7.5" />
    <circle cx="12" cy="6" r="1.2" />
  </>,
);

/** A coin — the budget. */
export const BudgetIcon = glyph(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v8M14.2 9.8c-.5-.7-1.3-1.1-2.2-1.1-1.3 0-2.2.7-2.2 1.7 0 2.3 4.4 1 4.4 3.3 0 1-1 1.7-2.2 1.7-.9 0-1.7-.4-2.2-1.1" />
  </>,
);

/** A flame — energy per person. */
export const EnergyIcon = glyph(
  <>
    <path d="M12 3.5c3.2 3 4.8 5.5 4.8 8.3a4.8 4.8 0 0 1-9.6 0c0-1.4.5-2.6 1.5-3.8.5 1 1.1 1.6 1.9 1.8-.3-2.3.2-4.4 1.4-6.3Z" />
  </>,
);

/** Concentric target — what the composition optimises for. */
export const FocusIcon = glyph(
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </>,
);

/** Bowl and chopsticks — cuisine. */
export const CuisineIcon = glyph(
  <>
    <path d="M3.5 12.5h11a5.5 5.5 0 0 1-11 0Z" />
    <path d="M2.5 12.5h13" />
    <path d="M17.5 4.5 20 5 16 12M20.5 6.5 21 9l-5 3.5" />
  </>,
);

/** A pan over heat — cooking method. */
export const MethodIcon = glyph(
  <>
    <path d="M3 10.5h12v1.8a6 6 0 0 1-12 0Z" />
    <path d="M15 11.5h5" />
    <path d="M6 7.5c0-1 1-1.4 1-2.4M9.5 7.5c0-1 1-1.4 1-2.4M13 7.5c0-1 1-1.4 1-2.4" />
  </>,
);

/** A single leaf — the deterministic health score. */
export const HealthIcon = glyph(
  <>
    <path d="M19 5c0 7.5-4 11.5-9.6 11.5C7.2 16.5 5 14.5 5 11.8 5 7 10 5 19 5Z" />
    <path d="M15.5 8.5 6.5 19" />
  </>,
);

/** A basket with a plus — ingredients to include. */
export const IncludeIcon = glyph(
  <>
    <path d="M4 9.5h16l-1.3 8.3a2 2 0 0 1-2 1.7H7.3a2 2 0 0 1-2-1.7L4 9.5Z" />
    <path d="M8.5 9.5 12 4l3.5 5.5" />
    <path d="M12 12.5v4M10 14.5h4" />
  </>,
);

/** The same basket, struck through — ingredients to avoid. */
export const ExcludeIcon = glyph(
  <>
    <path d="M4 9.5h16l-1.3 8.3a2 2 0 0 1-2 1.7H7.3a2 2 0 0 1-2-1.7L4 9.5Z" />
    <path d="M8.5 9.5 12 4l3.5 5.5" />
    <path d="M9.5 17 15 11.5" />
  </>,
);

/** A ring of leaves — diet preferences. */
export const DietIcon = glyph(
  <>
    <path d="M12 20c-4 0-7-2.8-7-6.6C5 8.6 8.2 5 12 3c3.8 2 7 5.6 7 10.4 0 3.8-3 6.6-7 6.6Z" />
    <path d="M12 20V9M12 13l3-2.6M12 15.5l-3-2.6" />
  </>,
);

/** A shield with a tick — allergen exclusions. */
export const AllergenIcon = glyph(
  <>
    <path d="M12 3.5 19 6v5.4c0 4-2.8 7.6-7 9.1-4.2-1.5-7-5.1-7-9.1V6l7-2.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </>,
);

/** An oven front — equipment on hand. */
export const EquipmentIcon = glyph(
  <>
    <rect height="16" rx="2.5" width="17" x="3.5" y="4" />
    <path d="M3.5 9.5h17" />
    <path d="M7 7h2" />
    <rect height="6" rx="1.5" width="9" x="7.5" y="12" />
  </>,
);

/** A clock — the longest single dish. */
export const TimeIcon = glyph(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5V12l3 1.8" />
  </>,
);

/** A chilli — maximum heat. */
export const SpiceIcon = glyph(
  <>
    <path d="M16.5 7c0 6-4 12-8.5 12-2 0-3.5-1.4-3.5-3.3C4.5 11.5 9.5 7 16.5 7Z" />
    <path d="M16.5 7c0-1.8 1-3 2.5-3.5M16.5 7c-1 0-1.8-.6-2.2-1.5" />
  </>,
);

/** A smiling face — child-friendly. */
export const ChildIcon = glyph(
  <>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M9 14.2c.8.9 1.8 1.4 3 1.4s2.2-.5 3-1.4" />
    <path d="M9.3 9.8v.6M14.7 9.8v.6" />
  </>,
);
