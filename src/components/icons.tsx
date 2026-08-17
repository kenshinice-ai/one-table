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
      <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
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
