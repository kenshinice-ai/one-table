# Menu Planning Companion / 聚餐菜单

Touch-first, bilingual menu planning for a single dinner or gathering. The product combines a curated local recipe catalogue, deterministic safety and feasibility rules, and AI-assisted menu composition and explanation.

This repository currently contains the product blueprint, data model, responsive wireframes, concept renders, and the implementation checklist.

## Start here

- [Product blueprint](docs/PRODUCT_BLUEPRINT.md)
- [System architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [UX/UI specification](docs/UX_UI_SPEC.md)
- [200-recipe content plan](docs/CONTENT_PLAN_200_RECIPES.md)
- [Implementation checklist](docs/EXECUTION_CHECKLIST.md)
- [Luna-Max execution runbook](docs/LUNA_MAX_EXECUTION_RUNBOOK.md)
- [Skill routing](docs/SKILL_ROUTING.md)
- [Wireframes](docs/wireframes/README.md)
- [Concept render notes](docs/RENDER_NOTES.md)
- [Research and official references](docs/REFERENCES.md)
- [Architecture decision: hybrid recipe data](docs/adr/0001-hybrid-recipe-data.md)
- [Initial D1 schema](db/schema.sql)
- [Reference seeds](db/seed_reference.sql)

## Locked MVP decisions

- Primary devices: landscape iPad and personal mobile phones.
- Secondary devices: touch tablets, laptops, and large touch displays.
- Dish presets: 1, 3, 4, 6, or custom up to 10.
- Serving styles: family sharing, plated courses, and buffet.
- Locale: Simplified Chinese and Australian English.
- Currency: AUD. Storage units: metric; UI can display metric or US units.
- Recipe source: 200 curated local recipes; online sources are used only for controlled import or enrichment.
- AI role: combination, substitution, explanation, translation assistance, and import normalization. AI cannot override allergen or feasibility rules.
- Export: live QR link plus Chinese, English, or bilingual PDF.
- Imagery: original, licensed, or clearly labelled AI illustration.
- Navigation model: free-form faceted filtering, not a sequential wizard.
