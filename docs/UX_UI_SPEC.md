# UX/UI Specification

## 1. Interaction model

The core is a faceted filter workspace, not a wizard.

- Every filter remains reachable at any time.
- Multiple options can be selected before a popover closes.
- Selections appear both inside their section and in a removable global chip strip.
- A filter change immediately updates eligible count, conflicts and estimated range.
- The current menu remains stable until recomposition finishes.
- `Undo` restores the most recent facet transaction.
- `Reset` is always visible but requires confirmation.

### Recomposition policy

- Local deterministic eligibility: immediate.
- Menu score preview: debounced approximately 400–600ms.
- Current menu status: `up_to_date`, `conditions_changed`, `recomposing`, or `error`.
- AI explanation: async enhancement after deterministic completion.
- Manual `Recompose` is always available; an account preference may enable automatic recomposition.

## 2. Landscape iPad

Target canvas begins at 1024×768 landscape and scales upward.

- Header: title, locale, units, account.
- Quick controls: guest count, dish count, serving style, budget.
- Main grid: 61.8% filters / 38.2% live menu.
- Filters use a two-column card grid.
- One filter popover may remain open while the other cards stay visible.
- Live menu is sticky within the viewport.
- Global selection strip and undo/reset sit near the bottom of the filter pane.

Do not force the golden ratio into small components; it only governs the main landscape split.

## 3. Mobile

- Single scroll column.
- Quick controls appear as four compact tappable cards.
- Facets are independent accordions, not numbered steps.
- Only one facet is open by default, but users can open any section.
- Each collapsed section shows its selection count and top selections.
- Sticky bottom bar shows eligible count and opens the live-menu sheet/page.
- Returning from menu to filters preserves scroll position and all selections.
- No hidden swipe-only replacement action.

## 4. Multi-select field behaviour

- Trigger height: minimum 48px.
- Expanded item height: minimum 48px.
- Search appears for lists longer than eight items.
- Selected state uses checkbox, border and text; not color alone.
- `Clear section` is separate from `Reset all`.
- Tapping outside closes the popover but does not discard selection.
- Escape closes; arrow keys navigate; Space toggles; Enter applies where applicable.
- Screen readers receive label, expanded state, count and selected state.

## 5. Visual system

| Token       | Value     | Use                                        |
| ----------- | --------- | ------------------------------------------ |
| Primary     | `#9A3412` | Main actions and selected culinary accents |
| Secondary   | `#C2410C` | Secondary emphasis                         |
| Positive    | `#059669` | Valid, safe, in-budget status              |
| Background  | `#FFFBEB` | Warm app canvas                            |
| Card        | `#FFFFFF` | Cards and popovers                         |
| Foreground  | `#0F172A` | Main text                                  |
| Muted       | `#F8F2F0` | Secondary surfaces                         |
| Border      | `#F2E6E2` | Dividers and inactive controls             |
| Destructive | `#DC2626` | Reset confirmation and safety failures     |

Typography:

- Display: Source Serif 4 with Noto Serif SC / system Chinese serif fallback.
- UI/body: Inter with PingFang SC / Noto Sans SC / system sans fallback.
- Base body: 16px, line-height at least 1.5.
- Do not use Playfair Display SC as a Chinese font; “SC” in that family means small caps.

## 6. Spacing and shape

- 8px spacing grid.
- Page padding: mobile 16px; tablet 24–32px.
- Card radius: 12–16px.
- Control radius: 8–12px.
- Primary action height: 56px.
- General touch target: at least 48×48px; absolute minimum 44×44px.
- Focus ring: 2px visible ring with adequate offset.

## 7. Motion

- Standard duration: 150–240ms.
- Popovers anchor spatially to their trigger.
- Accordion animation uses opacity/transform or grid techniques without content jank.
- Current menu does not blank during recomposition; use a subtle updating state.
- Respect `prefers-reduced-motion`.

## 8. Image rules

- Recipe cards: 4:3 source crop with reserved aspect-ratio space.
- Ingredient thumbnails: 1:1.
- Prefer AVIF/WebP variants and lazy-load non-primary images.
- All images need locale-appropriate alt text.
- AI images show a persistent `AI 示意图 / AI illustration` badge in app and PDF.
- Do not represent an AI illustration as evidence of exact finished appearance.

## 9. Required states

Every major surface needs:

- Loading.
- Empty catalogue/filter result.
- No safe recipe result.
- Stale menu after filter change.
- Recomposition in progress.
- AI explanation unavailable.
- Partial nutrition data.
- Price data out of date.
- Offline/retry state.
- Share link expired/revoked.
- PDF queued/rendering/failed/ready.

## 10. Accessibility and acceptance

- WCAG 2.2 AA target.
- Text contrast at least 4.5:1.
- Full keyboard navigation.
- Visible labels; placeholders are not labels.
- No horizontal page scroll at 375, 390, 430, 768, 1024 and 1440px widths.
- Test iPad Safari landscape, iPhone Safari, Android Chrome, laptop keyboard/mouse and 1080p touch display.
- Browser zoom must remain enabled.
- Safe-area insets protect fixed mobile actions.
