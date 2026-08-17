# Menu Planning Companion Design System

This file is the persisted implementation source for the launch planner. The automated search result was intentionally overridden where it conflicted with the approved product specification in `docs/UX_UI_SPEC.md`.

## Product pattern

- Touch-first bilingual planning workspace, not an event landing page and not a sequential wizard.
- Free-form facet cards with immediate eligible-count feedback.
- Landscape layout uses an approximately 61.8/38.2 filter/menu split.
- Mobile uses one scroll column and a safe-area-aware bottom action bar.

## Colour tokens

| Role           | Light     | Dark      |
| -------------- | --------- | --------- |
| Primary        | `#9A3412` | `#FB923C` |
| Primary strong | `#7C2D12` | `#FDBA74` |
| Positive       | `#047857` | `#34D399` |
| Background     | `#FFFBEB` | `#17120F` |
| Surface        | `#FFFFFF` | `#211A17` |
| Foreground     | `#0F172A` | `#FFF7ED` |
| Muted text     | `#52606D` | `#D6C8BF` |
| Border         | `#E7D8D1` | `#4A3931` |
| Destructive    | `#B91C1C` | `#FCA5A5` |

Functional states always include text or shape in addition to colour.

## Typography

- Display: Source Serif 4, then Noto Serif SC / Songti SC / Georgia.
- Interface: Inter, then PingFang SC / Noto Sans SC / system sans-serif.
- Base body is 16px with at least 1.5 line height.
- Do not use Playfair Display SC for Chinese; `SC` in that family means small caps.

## Interaction and layout

- 8px spacing rhythm; mobile gutter 16px, tablet 24px, desktop 32px.
- General controls are at least 48px tall; absolute minimum target is 44px.
- Visible 3px keyboard focus ring with offset.
- Interaction transitions use 150–240ms and respect reduced motion.
- Cards use 10/16/24px radius tiers and restrained culinary-toned shadows.
- No structural emoji; SVG icons use consistent two-pixel outline strokes.
- Fixed mobile actions reserve content and device safe-area space.
- Required checks: 375, 768, 1024 and 1440px; no horizontal page scroll.

## Content and safety

- Allergen results must explain that packaging still requires verification.
- Unknown and `may contain` relations never silently pass an active exclusion.
- Price and nutrition are labelled as estimates, not promises or medical advice.
- A constrained partial menu is shown honestly; unsafe/ineligible dishes are never used as filler.
