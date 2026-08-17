# 200-Recipe Content Plan

## 1. Target matrix

Primary-role totals:

| Role | Count |
|---|---:|
| Main | 65 |
| Side / vegetable / salad | 45 |
| Starter / soup / snack | 35 |
| Rice / noodle / grain / potato staple | 25 |
| Dessert | 30 |
| Total | 200 |

Cuisine totals:

| Cuisine group | Count |
|---|---:|
| Chinese regional | 55 |
| Japanese, Korean, Southeast Asian and Indian | 50 |
| Mediterranean and European | 40 |
| Australian modern and Western home cooking | 30 |
| Middle Eastern, Latin American and other | 25 |
| Total | 200 |

Cross-cutting coverage, with overlapping tags:

- Vegetarian: at least 50.
- Vegan: at least 25.
- Gluten-free adaptable: at least 60.
- Dairy-free adaptable: at least 60.
- Child-friendly: at least 40.
- Active time no more than 30 minutes: at least 70.
- Good for advance preparation: at least 70.
- Buffet-suitable: at least 60.
- Family-sharing suitable: at least 100.

## 2. Production batches

### Batch A — 40 foundation recipes

Purpose: prove schema, import, filtering, menu generation, scaling and exports.

- Cover every primary role.
- Cover all three serving styles.
- Include at least ten recipes with meaningful substitution options.
- Include real, licensed and AI-labelled image paths.
- Include representative allergen and unknown-data cases.

### Batch B — 80 coverage recipes

Purpose: fill cuisine, dietary, method, equipment and budget gaps.

- Run automated coverage report after every 20 recipes.
- Prevent over-concentration in oven-based or meat-centred recipes.
- Add paired alternatives for common exclusions.

### Batch C — 80 launch recipes

Purpose: improve diversity and menu coherence based on generated-menu audits.

- Generate the full preset matrix for 1, 3, 4, 6 and 10 dishes.
- Test all three serving styles.
- Find repeated recipes and weak role combinations.
- Add recipes specifically to close uncovered cells.

## 3. Per-recipe completion checklist

- [ ] Canonical English and Chinese title.
- [ ] Original summary in both locales.
- [ ] Primary and secondary roles.
- [ ] Cuisine and cooking methods.
- [ ] Family/plated/buffet suitability scores.
- [ ] Base yield and normalized metric quantities.
- [ ] Display measures for metric and US presentation.
- [ ] Scaling rule for every ingredient.
- [ ] Active, total and advance-prep time.
- [ ] Equipment and occupied time.
- [ ] Holding and reheating quality.
- [ ] Difficulty, spice and child-friendly state.
- [ ] Canonical ingredient matching complete.
- [ ] Compound ingredients expanded where safety-relevant.
- [ ] Allergen states reviewed.
- [ ] Nutrition snapshot calculated with confidence.
- [ ] Melbourne/Australia price snapshot calculated.
- [ ] Substitutions reviewed for role and safety.
- [ ] Source, licence and attribution stored.
- [ ] Image alt text and media type stored.
- [ ] AI illustration visibly labelled where applicable.
- [ ] Translation review completed.
- [ ] Editorial review outcome recorded.
- [ ] Kitchen-test status stated truthfully.

## 4. Review gates

AI-assisted drafts never move directly to `published`.

Required approvals:

1. Content structure.
2. Allergen mapping.
3. Rights/source.
4. Translation.

Nutrition review is required when confidence is below the release threshold. Kitchen testing is encouraged for flagship recipes and recorded independently rather than implied.

## 5. Image acquisition

Priority:

1. Owned real photography.
2. Clearly licensed photography with attribution metadata.
3. AI illustration when no suitable finished-dish or ingredient image exists.

An AI asset is acceptable only when the UI and PDF label it automatically from `media_type`. Prompt, model and generation date remain in metadata.

## 6. Coverage QA queries

Before launch, report:

- Count by primary role and cuisine.
- Count by serving style and suitability band.
- Count by dietary tag and allergen completeness.
- Count by active-time band and equipment.
- Count by budget band.
- Recipes lacking both translations.
- Recipes with unknown allergen relations.
- Published recipes without a rights-reviewed image.
- Recipes never appearing in a valid generated menu.

