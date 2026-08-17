# Product Blueprint v1.0

## 1. Product outcome

Help a frequent host design a coherent multi-dish menu for one gathering by combining guest needs, ingredients, cuisine, cooking methods, serving style, time, equipment, budget, and nutrition.

The system must answer three questions:

1. Is this menu safe and feasible?
2. Does it fit the event and the host's preferences?
3. Why is this combination better than the alternatives?

## 2. Product boundaries

### MVP includes

- One event and one multi-dish menu at a time.
- Dish presets 1, 3, 4, 6, and custom 1–10.
- Guest count 1–30; larger events are shown as unsupported catering mode.
- Family sharing, plated courses, and buffet.
- Chinese and English.
- AUD, metric storage, metric/US display.
- Curated 200-recipe catalogue.
- Optional guest-preference collection.
- Three menu variants: balanced, budget, and easy.
- Single-dish substitution and whole-menu recomposition.
- Budget, nutrition, allergen, equipment, and timing summaries.
- QR sharing and PDF export.

### Explicitly deferred

- Weekly meal planning.
- Cocktail/canapé serving mode.
- Live retailer stock and checkout integration.
- Medical advice or personalised clinical nutrition.
- Public community recipe publishing.
- Events larger than 30 guests.
- Native Swift application; the API is prepared for it.

## 3. Users and permissions

| Role             | Authentication                | Capabilities                                                                |
| ---------------- | ----------------------------- | --------------------------------------------------------------------------- |
| Anonymous host   | None                          | Create, filter, generate, view and export a temporary menu                  |
| Registered host  | Email magic link; Apple later | Save events, household profiles, favourites, history and guest links        |
| Guest respondent | Secret event link             | Submit only their own attendance and food needs                             |
| Reviewer         | Authenticated role            | Review recipes, translations, allergens, nutrition, rights and imagery      |
| Administrator    | Authenticated role            | Publish/archive recipes, configure reference data and inspect audit history |

Guest respondents cannot see another guest's responses. Anonymous drafts are device-local until an account is created.

## 4. Free-form planning flow

There is no required sequence and no repeated “Next” action.

### Always-visible event controls

- Guest count.
- Dish count.
- Serving style.
- Total budget.

### Independently editable facets

- Cuisine and region.
- Cooking methods.
- Must-include ingredients.
- Avoid ingredients.
- Dietary patterns and allergens.
- Time and equipment.
- Difficulty and advance-prep preference.
- Nutrition emphasis.

### Feedback model

1. A filter interaction updates the eligible recipe count, hard conflicts, and budget indicators immediately.
2. The current menu remains visible rather than disappearing.
3. A changed menu is marked `conditions_changed` until recomposed.
4. Deterministic recomposition can run automatically after a short debounce or from the `Recompose` action.
5. AI explanation refreshes asynchronously and never blocks the rule result.
6. The last filter change can be undone; a full reset requires confirmation.

## 5. Menu templates

Templates vary by dish count and serving style. Roles are defaults, not immutable labels.

|     Dishes | Family sharing                               | Plated                                       | Buffet                            |
| ---------: | -------------------------------------------- | -------------------------------------------- | --------------------------------- |
|          1 | Complete main                                | Main                                         | Complete main                     |
|          3 | Main + vegetable + staple                    | Starter + main + dessert                     | Main + two supporting dishes      |
|          4 | Main + two sides + dessert                   | Starter + main + side + dessert              | Main + two sides + dessert        |
|          6 | Two mains + three supports + dessert         | Snack + starter + main + two sides + dessert | Two mains + three sides + dessert |
| 2, 5, 7–10 | Role solver fills a balanced custom template | Role solver                                  | Role solver                       |

## 6. Rules and AI boundary

Evaluation order is fixed:

1. Allergen and hard exclusions.
2. Recipe publication and data-confidence requirements.
3. Serving-style and role coverage.
4. Guest count and scaling safety.
5. Equipment and time collisions.
6. Budget tolerance.
7. Preference match.
8. Nutrition and variety.

AI receives only candidates that have passed hard rules. The server sends at most twelve
candidate menus and treats the model as a curation layer. AI may:

- Select exactly one candidate ID from that allow-list.
- Explain a selected combination using only supplied facts.
- Suggest a substitute from an eligible list.
- Describe trade-offs.
- Assist translation and import normalization in a review queue.

The server validates structured output, checks the candidate ID against the allow-list, checks
recipe IDs and re-runs the complete deterministic ruleset using the current filter revision.
Any failure falls back to the deterministic first candidate.

AI may not:

- Declare a recipe allergen-safe.
- Invent missing ingredient quantities.
- Add or remove recipes, ingredients, prices, nutrition values or allergen relationships.
- Relax publication, allergen, diet, equipment, budget or exclusion rules.
- Publish imported content.
- Replace an unavailable recipe with an unchecked external recipe.
- Override a failed safety or feasibility rule.

## 7. Menu scoring

Hard rules pass or fail before scoring. Initial soft weights are admin-configurable:

| Dimension               | Weight |
| ----------------------- | -----: |
| Preference match        |    25% |
| Operational feasibility |    25% |
| Budget fit              |    20% |
| Nutrition balance       |    15% |
| Menu variety            |    15% |

The visible balance score must expose its components. It is a planning aid, not a medical assessment.

## 8. Budget behaviour

- User enters total AUD budget; per-person budget is derived.
- Pantry staples can be included or excluded.
- Default tolerance is ±10%.
- Prices are regional snapshots with source date and confidence.
- The result identifies the highest-cost ingredients and budget substitutions.
- MVP uses regional estimates, not retailer-specific promises.

## 9. Nutrition behaviour

Per-person display includes:

- Energy in kJ and kcal.
- Protein.
- Fat and saturated fat.
- Carbohydrate and sugars.
- Fibre.
- Sodium.

Every value includes source, calculation timestamp, and confidence. Unknown data remains unknown; it is not silently treated as zero.

## 10. Sharing and retention

- Guest response links expire 30 days after the event.
- Guest personal responses are scheduled for deletion 90 days after the event.
- Menu links can be revoked and regenerated.
- QR codes point to a short live link, not embedded menu data.
- Host PDF contains recipes, shopping, timing, cost and nutrition.
- Guest PDF contains menu, description and allergen information.

## 11. Technical direction

- Next.js and TypeScript on Cloudflare Workers.
- Cloudflare D1 for relational data and audit history.
- Cloudflare R2 for images and generated PDFs.
- Background jobs for imports, nutrition calculations, images and PDF rendering.
- Versioned `/api/v1` JSON API shared by web and future Swift clients.
- Stable repository/service boundary around D1 so storage can migrate later.
- PWA metadata and installability after the core responsive flow is stable.

## 12. MVP success criteria

- A first-time anonymous user can create a four-dish menu without registration.
- A frequent user can alter any filter without restarting a flow.
- Hard allergen exclusions produce zero knowingly conflicting recipes.
- A stale menu is visibly marked after conditions change.
- A single substitution revalidates the full menu.
- The app remains usable when AI explanation is unavailable.
- Chinese/English and metric/US changes do not corrupt stored values.
- iPad landscape and phone layouts have no horizontal page scroll.
