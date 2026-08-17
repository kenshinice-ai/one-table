# ADR 0001: Curated local recipe data with controlled online enrichment

- Status: Accepted
- Date: 2026-08-16

## Context

The product requires stable bilingual recipes, reproducible nutrition and cost calculations, source provenance, image rights, allergen review, and predictable performance. Third-party recipe APIs vary in caching rights, instructions, attribution and availability.

## Decision

Use Cloudflare D1 as the runtime source of truth for published recipes. Use online APIs and websites only through an administrative import/enrichment workflow:

`source -> staging -> normalization -> enrichment -> human review -> publish`

Nutrition sources may enrich canonical ingredients. Imported recipe text and images are stored or republished only when rights allow it.

## Consequences

### Positive

- Stable latency and availability.
- Reproducible menu generation.
- Auditable source and review history.
- Consistent Chinese and English content.
- Shared API for the future Swift client.
- No runtime dependency on a recipe provider's response shape.

### Costs

- A 200-recipe catalogue must be curated.
- Nutrition and prices need scheduled recalculation.
- Rights and translation reviews add operational work.
- Admin tooling is part of the MVP foundation.

## Rejected alternatives

- Live third-party recipe search as the main catalogue: rejected because runtime reliability, caching, rights and bilingual review cannot be guaranteed.
- AI-generated recipes with no local record: rejected because the result is not reproducible or sufficiently safe.
- Recipe content embedded in frontend code: rejected because versioning, review and future native clients require an API-backed data layer.

