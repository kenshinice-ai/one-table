# Concrete Execution Checklist

This is the ordered MVP delivery plan. A phase is complete only when its exit criteria pass.

## Phase 0 — Repository and delivery foundation

- [ ] Initialise Next.js + TypeScript project using the package manager selected by the generated project.
- [ ] Configure Cloudflare Workers build and local development.
- [ ] Add formatting, linting, type checking and test commands.
- [ ] Add environment validation without committing secrets.
- [ ] Create staging and production environment conventions.
- [ ] Add CI for type check, unit tests, lint and build.
- [ ] Add `src/domain`, `src/server`, `src/components`, `src/i18n` and `src/styles` boundaries.
- [ ] Keep business rules independent of Next.js components and Cloudflare bindings.

Exit criteria:

- [ ] Clean install and build from a fresh checkout.
- [ ] Local Worker starts without production credentials.
- [ ] CI reports a deterministic pass/fail result.

## Phase 1 — D1 schema, migrations and repositories

- [ ] Convert [`db/schema.sql`](../db/schema.sql) into numbered migrations.
- [ ] Apply [`db/seed_reference.sql`](../db/seed_reference.sql) to local D1.
- [ ] Implement typed repositories for users, recipes, events, menus and reviews.
- [ ] Add transaction boundaries for recipe publication and menu selection.
- [ ] Add FTS update/rebuild function.
- [ ] Add snapshot creation for recipe versions and generation runs.
- [ ] Add migration rollback/recovery documentation.
- [ ] Add synthetic test fixtures; never use real guest health data.

Exit criteria:

- [ ] Empty database migrates successfully.
- [ ] Seeds are idempotent or guarded.
- [ ] Foreign-key violation tests fail correctly.
- [ ] Published recipe can be searched and reconstructed from repositories.

## Phase 2 — Authentication, roles and retention

- [ ] Implement anonymous event draft storage.
- [ ] Implement email magic-link account flow.
- [ ] Add host, reviewer and administrator authorization checks at server boundaries.
- [ ] Add optional Apple identity field without shipping Apple login yet.
- [ ] Hash guest/share tokens at rest.
- [ ] Add rate limits to guest forms and magic-link requests.
- [ ] Add guest-link expiry and revocation.
- [ ] Add scheduled deletion for guest responses after 90 days.
- [ ] Add privacy copy and explicit submit consent on guest form.

Exit criteria:

- [ ] Anonymous user completes the core flow.
- [ ] Anonymous draft can be claimed after sign-in.
- [ ] Guest cannot read another guest's response.
- [ ] Expired/revoked links return safe, understandable states.

## Phase 3 — Recipe admin and review workflow

- [ ] Recipe list with status, missing-field and review filters.
- [ ] Bilingual recipe editor.
- [ ] Canonical ingredient search and alias creation.
- [ ] Ingredient quantity normalization and scaling strategy editor.
- [ ] Compound-ingredient and allergen editor.
- [ ] Cuisine, role, method, equipment and serving-style editor.
- [ ] Nutrition and price snapshot panels.
- [ ] Source, licence, attribution and caching-rights fields.
- [ ] Image upload to R2 with original/licensed/AI type.
- [ ] Automatic “AI illustration” label derived from media type.
- [ ] Review tasks for content, allergen, rights, translation and nutrition.
- [ ] Publication gate enforcing required approvals.
- [ ] Recipe version diff and audit record.

Exit criteria:

- [ ] Reviewer can take a recipe from draft to published without database access.
- [ ] Missing allergen/rights data blocks publication.
- [ ] Archived recipes disappear from generation but remain auditable.

## Phase 4 — Deterministic filter and constraint engine

- [ ] Define versioned filter input schema.
- [ ] Implement publication-state filter.
- [ ] Implement ingredient include/exclude filters.
- [ ] Implement allergen evaluation with `unknown` handling.
- [ ] Implement cuisine and cooking-method multi-select.
- [ ] Implement time, difficulty and equipment filters.
- [ ] Implement serving-style suitability.
- [ ] Implement guest-count and quantity scaling.
- [ ] Implement recipe-role templates for 1, 3, 4, 6 and custom 1–10 dishes.
- [ ] Implement equipment/time collision detection across the menu.
- [ ] Implement regional budget calculation and ±10% default tolerance.
- [ ] Implement nutrition aggregation per person.
- [ ] Return eligible count, exclusions by reason and actionable conflicts.

Required tests:

- [ ] Every hard allergen exclusion test.
- [ ] Unknown allergen data does not pass silently.
- [ ] Compound ingredient propagates allergens.
- [ ] Metric scaling is deterministic.
- [ ] Manual/nonlinear scaling requires a warning.
- [ ] All three serving styles produce valid role coverage.
- [ ] 1, 3, 4, 6 and 10 dish templates produce the requested count.
- [ ] No equipment schedule exceeds configured capacity.

Exit criteria:

- [ ] With 200 recipes, eligibility feedback completes within 100ms at the service layer under representative local load.
- [ ] Same input and ruleset version produce the same candidate ranking.

## Phase 5 — Menu composer and AI boundary

- [ ] Implement soft scoring weights from the blueprint.
- [ ] Generate balanced, budget and easy candidates.
- [ ] Store full generation input snapshot and ruleset version.
- [ ] Mark current menu stale when `filter_revision` changes.
- [ ] Implement full-menu recomposition.
- [ ] Implement role-preserving single-dish substitution.
- [ ] Revalidate the complete menu after substitution.
- [ ] Add AI provider interface with structured output validation.
- [ ] Add menu explanation prompt versioning.
- [ ] Add substitution explanation limited to pre-approved candidates.
- [ ] Redact unnecessary guest notes before AI calls.
- [ ] Add timeout/failure fallback that leaves deterministic results usable.

Exit criteria:

- [ ] AI cannot introduce an unapproved recipe ID.
- [ ] AI failure does not block menu creation.
- [ ] Every explanation is linked to model and prompt versions.

## Phase 6 — Free-form touch UI

### Shared shell

- [ ] Implement warm culinary tokens from [`UX_UI_SPEC.md`](UX_UI_SPEC.md).
- [ ] Add Chinese/English and metric/US switches.
- [ ] Add visible focus states and reduced-motion support.
- [ ] Add confirmed reset and one-step undo.
- [ ] Keep active filters when navigating between filters and menu.

### Landscape iPad

- [ ] Implement 61.8/38.2 main split.
- [ ] Add four always-visible quick controls.
- [ ] Add two-column facet card grid.
- [ ] Build persistent multi-select popover with search.
- [ ] Keep live menu sticky without trapping page scroll.
- [ ] Add selected-condition strip and scoped clear actions.

### Mobile

- [ ] Add compact quick-control cards.
- [ ] Implement arbitrary-order facet accordions.
- [ ] Preserve scroll position after viewing menu.
- [ ] Add safe-area-aware bottom eligible-count/menu bar.
- [ ] Keep substitution and filter editing as visible controls.

### Feedback

- [ ] Update eligible count and hard conflicts immediately.
- [ ] Debounce score/menu preview updates approximately 400–600ms.
- [ ] Show `conditions changed` without blanking the menu.
- [ ] Provide manual recompose; add auto-recompose as a saved preference later.
- [ ] Add empty, no-safe-result, stale, loading, error and offline states.

Exit criteria:

- [ ] No forced stepper or Next action exists in the core planner.
- [ ] All controls are usable by touch, mouse and keyboard.
- [ ] General targets are at least 48px; none below 44px.

## Phase 7 — Guest collection, QR and PDF

- [ ] Host creates guest-response link and QR code.
- [ ] Guest submits attendance, allergens, diets, dislikes and spice preference.
- [ ] Host reviews an aggregated safety summary before generation.
- [ ] Host creates/revokes a menu-view link.
- [ ] Generate host PDF with shopping, timing, recipes, cost and nutrition.
- [ ] Generate guest PDF with menu, description and allergen summary.
- [ ] Generate Chinese, English and bilingual variants.
- [ ] Preserve AI illustration labels in every export.
- [ ] Add queued/rendering/ready/failed export states.

Exit criteria:

- [ ] QR continues to point to the latest permitted menu revision.
- [ ] Revocation takes effect without regenerating the QR image.
- [ ] PDF matches the selected locale and unit system.

## Phase 8 — Produce and load 200 recipes

- [ ] Complete Batch A: 40 foundation recipes.
- [ ] Run schema and generation coverage report.
- [ ] Complete Batch B: 80 coverage recipes; cumulative 120.
- [ ] Run role/cuisine/diet/equipment gap analysis.
- [ ] Complete Batch C: 80 launch recipes; cumulative 200.
- [ ] Complete required review gates for all published recipes.
- [ ] Ensure every published recipe has an approved or labelled image.
- [ ] Generate preset/style matrix and identify recipes never selected.
- [ ] Correct overrepresented cuisines, proteins and methods.

Exit criteria:

- [ ] All targets in [`CONTENT_PLAN_200_RECIPES.md`](CONTENT_PLAN_200_RECIPES.md) are met or exceptions are documented.
- [ ] No published recipe lacks source, allergen review or bilingual content.

## Phase 9 — Quality, performance and deployment

- [ ] Unit tests for rules, scaling, money and unit conversion.
- [ ] D1 integration tests for repositories and migrations.
- [ ] API contract tests for `/api/v1`.
- [ ] Browser tests for anonymous host, registered host, guest and reviewer.
- [ ] Automated accessibility scan plus keyboard manual pass.
- [ ] Visual regression screenshots for required viewports.
- [ ] Test 375, 390, 430, 768, 1024 and 1440px widths.
- [ ] Test iPad Safari landscape, iPhone Safari and Android Chrome.
- [ ] Test laptop keyboard/mouse and 1080p touch display.
- [ ] Verify no horizontal page scroll.
- [ ] Verify image aspect-ratio reservation and lazy loading.
- [ ] Configure D1 migrations, R2 buckets and production secrets.
- [ ] Configure logging for generation, export and review failures without storing sensitive guest text.
- [ ] Add backup/recovery runbook and retention job monitoring.
- [ ] Deploy staging, complete acceptance run, then deploy production.

Release criteria:

- [ ] Zero known hard-allergen rule violations.
- [ ] Core flow works without AI.
- [ ] All required devices pass the acceptance checklist.
- [ ] 200 reviewed recipes are available.
- [ ] QR, PDF and deletion schedules pass.
- [ ] Known limitations are visible in product copy and release notes.

## Recommended first implementation sprint

1. Project scaffold and Cloudflare local runtime.
2. Numbered D1 migrations from the supplied schema.
3. Forty-recipe import template and ten synthetic fixtures.
4. Pure TypeScript filter input and eligible-count service.
5. Landscape iPad shell and mobile accordion shell.
6. Cuisine multi-select, selected chip strip, undo and reset.
7. Static live-menu panel wired to deterministic fixture results.
8. Automated tests for free-form filter persistence and hard allergen exclusion.
