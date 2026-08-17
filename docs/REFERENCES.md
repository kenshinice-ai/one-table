# Research and Official References

These references informed the blueprint. They are not automatically approved content sources or production dependencies.

## Comparable open-source products

- [Mealie](https://github.com/mealie-recipes/mealie): self-hosted recipe manager and meal planner; useful reference for recipe import, collections and household use.
- [Tandoor Recipes](https://github.com/TandoorRecipes/recipes): self-hosted recipe management; useful reference for structured recipes, shopping and planning.
- [RecipeSage](https://github.com/julianpoy/RecipeSage): collaborative recipe keeper and meal planner; useful reference for sharing and recipe organization.

Our differentiator is not another recipe box. It is event-level, cross-filtered menu composition with deterministic allergen, budget, equipment, timing and serving-style checks.

## Cloudflare platform

- [Next.js on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Cloudflare D1 overview](https://developers.cloudflare.com/d1/)
- [Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

## Nutrition and allergens

- [FSANZ allergen labelling](https://www.foodstandards.gov.au/consumer/labelling/allergen-labelling)
- [FSANZ nutrition information panels](https://www.foodstandards.gov.au/consumer/labelling/panels)
- [Australian Food Composition Database](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd)
- [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide/)
- [Open Food Facts API and licensing](https://github.com/openfoodfacts/openfoodfacts-server/blob/main/docs/api/index.md)

Nutrition and balance outputs remain estimates and must not be presented as medical advice.

## Recipe APIs evaluated

- [Edamam Recipe API](https://developer.edamam.com/edamam-recipe-api): useful search/nutrition capability, but caching and content-reuse restrictions make it unsuitable as the local source of truth without a specific contract.
- [TheMealDB API](https://www.themealdb.com/api.php) and [terms](https://www.themealdb.com/terms_of_use.php): useful for prototypes or controlled source material subject to its production and attribution terms.

Every provider's current terms must be rechecked before an import connector is enabled.

