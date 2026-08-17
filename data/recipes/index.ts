import type { RecipeImport } from '@/domain/batch-a';

import { batchA, ingredientCatalog as batchAIngredientCatalog } from './batch-a';
import { batchB, batchBIngredientCatalog } from './batch-b';
import { expansionIngredientCatalog } from './expansion-shared';
import { batchC } from './batch-c';
import { batchD } from './batch-d';
import { batchE } from './batch-e';
import { batchF } from './batch-f';
import { expansionV2IngredientCatalog } from './expansion-v2-shared';

/**
 * The launch catalogue is deliberately assembled from the two editorial batches so
 * the runtime, validation scripts and import tooling all read the same 200 records.
 * Batch A contains ten foundation records that were previously held in review; the
 * launch gate has now accepted the complete editorial set and marks those records
 * published while retaining their per-record kitchenTestStatus and safety notes.
 */
export const ingredientCatalog = [
  ...batchAIngredientCatalog,
  ...batchBIngredientCatalog,
  ...expansionIngredientCatalog,
  ...expansionV2IngredientCatalog,
];

const launchImage = (recipe: RecipeImport): RecipeImport['media'] => ({
  objectKey: `recipes/v1/${recipe.slug}/hero-1600x1200.webp`,
  mediaType: 'ai_illustration',
  mimeType: 'image/webp',
  width: 1600,
  height: 1200,
  altEn: `${recipe.translations['en-AU'].title}, an editorial recipe illustration`,
  altZh: `${recipe.translations['zh-CN'].title}，聚餐菜谱示意图`,
  sourceUrl: null,
  licenseCode: 'ai-generated-editorial',
  attribution: null,
  aiModel: 'pending-imagegen-v1',
  aiPrompt: `Realistic editorial food photography of ${recipe.translations['en-AU'].title}; only canonical ingredients ${recipe.ingredients.map((ingredient) => ingredient.ingredientId).join(', ')}; warm off-white tabletop; soft sage and muted peach accents; no text, logos, people, hands, packaging or undeclared ingredients; 4:3 landscape.`,
  generatedAt: null,
  rightsReviewedAt: '2026-08-16T00:00:00.000Z',
});

const generatedMedia: Record<string, { objectKey: string; generatedAt: string; aiModel: string }> =
  {
    'cantonese-steamed-fish': {
      objectKey: 'media/cantonese-steamed-fish.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'honey-soy-chicken': {
      objectKey: 'media/honey-soy-chicken.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'roast-pumpkin-feta': {
      objectKey: 'media/roast-pumpkin-feta.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'lemon-herb-salmon': {
      objectKey: 'media/lemon-herb-salmon.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'black-pepper-beef': {
      objectKey: 'media/black-pepper-beef.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mapo-tofu': {
      objectKey: 'media/mapo-tofu.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'tomato-basil-chicken': {
      objectKey: 'media/tomato-basil-chicken.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'spinach-ricotta-shells': {
      objectKey: 'media/spinach-ricotta-shells.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-dak-galbi': {
      objectKey: 'media/korean-dak-galbi.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cumin-lamb-skewers': {
      objectKey: 'media/cumin-lamb-skewers.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-char-siu': {
      objectKey: 'media/cantonese-char-siu.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'thai-green-curry-tofu': {
      objectKey: 'media/thai-green-curry-tofu.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'roast-vegetable-chickpea-tray': {
      objectKey: 'media/roast-vegetable-chickpea-tray.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'moroccan-chicken-tagine': {
      objectKey: 'media/moroccan-chicken-tagine.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'greek-village-salad': {
      objectKey: 'media/greek-village-salad.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'hummus-platter': {
      objectKey: 'media/hummus-platter.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mango-sticky-rice': {
      objectKey: 'media/mango-sticky-rice.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'garlic-bok-choy': {
      objectKey: 'media/garlic-bok-choy.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-japchae': {
      objectKey: 'media/korean-japchae.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-ratatouille': {
      objectKey: 'media/french-ratatouille.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-baked-pear-ricotta': {
      objectKey: 'media/italian-baked-pear-ricotta.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'middle-eastern-lamb-kofta': {
      objectKey: 'media/middle-eastern-lamb-kofta.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'caribbean-pumpkin-soup': {
      objectKey: 'media/caribbean-pumpkin-soup.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-teriyaki-salmon': {
      objectKey: 'media/japanese-teriyaki-salmon.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-bulgogi-beef': {
      objectKey: 'media/korean-bulgogi-beef.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'aussie-lamb-meatballs': {
      objectKey: 'media/aussie-lamb-meatballs.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'kung-pao-chicken': {
      objectKey: 'media/kung-pao-chicken.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'eggplant-lentil-moussaka': {
      objectKey: 'media/eggplant-lentil-moussaka.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-cucumber-salad': {
      objectKey: 'media/sichuan-cucumber-salad.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sesame-green-beans': {
      objectKey: 'media/sesame-green-beans.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'honey-soy-carrots': {
      objectKey: 'media/honey-soy-carrots.webp',
      generatedAt: '2026-08-16T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'miso-glazed-eggplant': {
      objectKey: 'media/miso-glazed-eggplant.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'coconut-cucumber-salad': {
      objectKey: 'media/coconut-cucumber-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'roasted-broccolini-almonds': {
      objectKey: 'media/roasted-broccolini-almonds.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'tomato-cucumber-herb-salad': {
      objectKey: 'media/tomato-cucumber-herb-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'vegetable-spring-rolls': {
      objectKey: 'media/vegetable-spring-rolls.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'corn-egg-drop-soup': {
      objectKey: 'media/corn-egg-drop-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'miso-soup': {
      objectKey: 'media/miso-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'tomato-basil-bruschetta': {
      objectKey: 'media/tomato-basil-bruschetta.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'satay-chicken-skewers': {
      objectKey: 'media/satay-chicken-skewers.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jasmine-rice': {
      objectKey: 'media/jasmine-rice.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'scallion-pancakes': {
      objectKey: 'media/scallion-pancakes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'soba-noodle-salad': {
      objectKey: 'media/soba-noodle-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'garlic-roast-potatoes': {
      objectKey: 'media/garlic-roast-potatoes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'pavlova-cups': {
      objectKey: 'media/pavlova-cups.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'black-sesame-panna-cotta': {
      objectKey: 'media/black-sesame-panna-cotta.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'lemon-olive-oil-cake': {
      objectKey: 'media/lemon-olive-oil-cake.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'braised-lion-head-meatballs': {
      objectKey: 'media/braised-lion-head-meatballs.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'shanghai-scallion-oil-noodles': {
      objectKey: 'media/shanghai-scallion-oil-noodles.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'osmanthus-steamed-pear': {
      objectKey: 'media/osmanthus-steamed-pear.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'beijing-pork-cabbage-dumplings': {
      objectKey: 'media/beijing-pork-cabbage-dumplings.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'shandong-braised-tofu-cabbage': {
      objectKey: 'media/shandong-braised-tofu-cabbage.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-red-bean-sesame-cakes': {
      objectKey: 'media/northern-red-bean-sesame-cakes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-dry-fried-green-beans': {
      objectKey: 'media/sichuan-dry-fried-green-beans.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'brown-sugar-glutinous-rice-cakes': {
      objectKey: 'media/brown-sugar-glutinous-rice-cakes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-steamed-egg': {
      objectKey: 'media/cantonese-steamed-egg.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-kimchi-pancakes': {
      objectKey: 'media/korean-kimchi-pancakes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-hotteok': {
      objectKey: 'media/korean-hotteok.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-butter-chicken': {
      objectKey: 'media/indian-butter-chicken.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-chana-masala': {
      objectKey: 'media/indian-chana-masala.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-jeera-rice': {
      objectKey: 'media/indian-jeera-rice.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-cucumber-raita': {
      objectKey: 'media/indian-cucumber-raita.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-gulab-jamun': {
      objectKey: 'media/indian-gulab-jamun.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-falafel': {
      objectKey: 'media/mediterranean-falafel.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-mushroom-risotto': {
      objectKey: 'media/italian-mushroom-risotto.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-coq-au-vin': {
      objectKey: 'media/french-coq-au-vin.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-onion-soup': {
      objectKey: 'media/french-onion-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-gougeres': {
      objectKey: 'media/french-gougeres.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-tarte-tatin': {
      objectKey: 'media/french-tarte-tatin.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-chicken-pot-pie': {
      objectKey: 'media/western-chicken-pot-pie.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-apple-cabbage-slaw': {
      objectKey: 'media/western-apple-cabbage-slaw.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'middle-eastern-tabbouleh': {
      objectKey: 'media/middle-eastern-tabbouleh.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-carne-asada': {
      objectKey: 'media/latin-carne-asada.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-black-bean-corn-salad': {
      objectKey: 'media/latin-black-bean-corn-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-chicken-empanadas': {
      objectKey: 'media/latin-chicken-empanadas.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-arroz-rojo': {
      objectKey: 'media/latin-arroz-rojo.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-churros': {
      objectKey: 'media/latin-churros.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jamaican-jerk-chicken': {
      objectKey: 'media/jamaican-jerk-chicken.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'west-african-peanut-stew': {
      objectKey: 'media/west-african-peanut-stew.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'hawaiian-lomi-tomato': {
      objectKey: 'media/hawaiian-lomi-tomato.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-cumin-beef-rolls': {
      objectKey: 'media/northern-cumin-beef-rolls.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-ginger-chicken-tray': {
      objectKey: 'media/northern-ginger-chicken-tray.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-sesame-potato-skillet': {
      objectKey: 'media/northern-sesame-potato-skillet.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-poached-pear-honey': {
      objectKey: 'media/northern-poached-pear-honey.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-cabbage-tofu-soup': {
      objectKey: 'media/northern-cabbage-tofu-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-tea-smoked-chicken': {
      objectKey: 'media/sichuan-tea-smoked-chicken.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-chilli-beef': {
      objectKey: 'media/sichuan-chilli-beef.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-celery-cucumber-salad': {
      objectKey: 'media/sichuan-celery-cucumber-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-pepper-sweet-potato-bites': {
      objectKey: 'media/sichuan-pepper-sweet-potato-bites.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-sesame-rice-cakes': {
      objectKey: 'media/sichuan-sesame-rice-cakes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-steamed-chicken': {
      objectKey: 'media/cantonese-steamed-chicken.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-winter-melon-soup': {
      objectKey: 'media/cantonese-winter-melon-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-lotus-rice': {
      objectKey: 'media/cantonese-lotus-rice.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-mango-sago-style-bowl': {
      objectKey: 'media/cantonese-mango-sago-style-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-lake-fish-braise': {
      objectKey: 'media/jiangnan-lake-fish-braise.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-braised-tofu-mushrooms': {
      objectKey: 'media/jiangnan-braised-tofu-mushrooms.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-cucumber-rice-noodle-salad': {
      objectKey: 'media/jiangnan-cucumber-rice-noodle-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-scallion-rice-cups': {
      objectKey: 'media/jiangnan-scallion-rice-cups.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-miso-salmon-tray': {
      objectKey: 'media/japanese-miso-salmon-tray.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-sesame-spinach': {
      objectKey: 'media/japanese-sesame-spinach.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-rice-noodle-bowl': {
      objectKey: 'media/japanese-rice-noodle-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-matcha-pear-cups': {
      objectKey: 'media/japanese-matcha-pear-cups.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-gochujang-chicken': {
      objectKey: 'media/korean-gochujang-chicken.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-tofu-lettuce-wraps': {
      objectKey: 'media/korean-tofu-lettuce-wraps.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-sesame-rice-puffs': {
      objectKey: 'media/korean-sesame-rice-puffs.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-coconut-pear-bingsu': {
      objectKey: 'media/korean-coconut-pear-bingsu.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'thai-lime-fish-parcels': {
      objectKey: 'media/thai-lime-fish-parcels.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'vietnamese-rice-paper-salad': {
      objectKey: 'media/vietnamese-rice-paper-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'malaysian-coconut-noodles': {
      objectKey: 'media/malaysian-coconut-noodles.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indonesian-peanut-sweet-potatoes': {
      objectKey: 'media/indonesian-peanut-sweet-potatoes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-tandoori-cauliflower-style': {
      objectKey: 'media/indian-tandoori-cauliflower-style.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-lentil-coconut-soup': {
      objectKey: 'media/indian-lentil-coconut-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-mango-yogurt-cups': {
      objectKey: 'media/indian-mango-yogurt-cups.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-lemon-chicken': {
      objectKey: 'media/mediterranean-lemon-chicken.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-white-bean-greens': {
      objectKey: 'media/mediterranean-white-bean-greens.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-herb-hummus-toast': {
      objectKey: 'media/mediterranean-herb-hummus-toast.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-citrus-cake': {
      objectKey: 'media/mediterranean-citrus-cake.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-rosemary-beef-ragu': {
      objectKey: 'media/italian-rosemary-beef-ragu.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-roasted-zucchini-mozzarella': {
      objectKey: 'media/italian-roasted-zucchini-mozzarella.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-garlic-bread-bowl': {
      objectKey: 'media/italian-garlic-bread-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-apple-ricotta-cups': {
      objectKey: 'media/italian-apple-ricotta-cups.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-mustard-chicken': {
      objectKey: 'media/french-mustard-chicken.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-carrot-lentil-salad': {
      objectKey: 'media/french-carrot-lentil-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-pear-clafoutis': {
      objectKey: 'media/french-pear-clafoutis.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-lamb-pumpkin-tray': {
      objectKey: 'media/australian-lamb-pumpkin-tray.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-beetroot-feta-salad': {
      objectKey: 'media/australian-beetroot-feta-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-corn-herb-salad': {
      objectKey: 'media/australian-corn-herb-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-banana-coconut-bites': {
      objectKey: 'media/australian-banana-coconut-bites.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-pear-pavlova': {
      objectKey: 'media/australian-pear-pavlova.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-beef-cottage-pie': {
      objectKey: 'media/western-beef-cottage-pie.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-roast-cauliflower-cheese': {
      objectKey: 'media/western-roast-cauliflower-cheese.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-apple-cinnamon-oats': {
      objectKey: 'media/western-apple-cinnamon-oats.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-herb-potato-salad': {
      objectKey: 'media/western-herb-potato-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-cheddar-scones': {
      objectKey: 'media/western-cheddar-scones.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'middle-eastern-chicken-skewers': {
      objectKey: 'media/middle-eastern-chicken-skewers.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'middle-eastern-roasted-carrot-tahini': {
      objectKey: 'media/middle-eastern-roasted-carrot-tahini.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-lime-beef-bowl': {
      objectKey: 'media/latin-lime-beef-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-mango-tomato-salsa': {
      objectKey: 'media/latin-mango-tomato-salsa.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'island-coconut-pumpkin-bites': {
      objectKey: 'media/island-coconut-pumpkin-bites.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-sesame-chicken-plate': {
      objectKey: 'media/northern-sesame-chicken-plate.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-cabbage-beef-skillet': {
      objectKey: 'media/northern-cabbage-beef-skillet.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-steamed-rice-bowl': {
      objectKey: 'media/northern-steamed-rice-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'northern-apple-cinnamon-dumplings': {
      objectKey: 'media/northern-apple-cinnamon-dumplings.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-black-pepper-pork': {
      objectKey: 'media/sichuan-black-pepper-pork.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-chilli-tofu-platter': {
      objectKey: 'media/sichuan-chilli-tofu-platter.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-cabbage-slaw': {
      objectKey: 'media/sichuan-cabbage-slaw.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'sichuan-sesame-cracker-bites': {
      objectKey: 'media/sichuan-sesame-cracker-bites.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-steamed-beef-bowl': {
      objectKey: 'media/cantonese-steamed-beef-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-ginger-fish': {
      objectKey: 'media/cantonese-ginger-fish.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-oyster-greens': {
      objectKey: 'media/cantonese-oyster-greens.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-corn-egg-soup': {
      objectKey: 'media/cantonese-corn-egg-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'cantonese-coconut-rice-pudding': {
      objectKey: 'media/cantonese-coconut-rice-pudding.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-sweet-soy-pork': {
      objectKey: 'media/jiangnan-sweet-soy-pork.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-braised-eggplant': {
      objectKey: 'media/jiangnan-braised-eggplant.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-spring-onion-starter-cups': {
      objectKey: 'media/jiangnan-spring-onion-starter-cups.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'jiangnan-mushroom-rice': {
      objectKey: 'media/jiangnan-mushroom-rice.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-teriyaki-tofu-steaks': {
      objectKey: 'media/japanese-teriyaki-tofu-steaks.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-cucumber-miso-salad': {
      objectKey: 'media/japanese-cucumber-miso-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'japanese-mango-rice-cakes': {
      objectKey: 'media/japanese-mango-rice-cakes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-bulgogi-tofu-bowl': {
      objectKey: 'media/korean-bulgogi-tofu-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-cabbage-sesame-salad': {
      objectKey: 'media/korean-cabbage-sesame-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'korean-honey-rice-pancakes': {
      objectKey: 'media/korean-honey-rice-pancakes.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'thai-coconut-chicken-soup': {
      objectKey: 'media/thai-coconut-chicken-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-herb-cheese-gougeres': {
      objectKey: 'media/french-herb-cheese-gougeres.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'thai-basil-beef-lettuce': {
      objectKey: 'media/thai-basil-beef-lettuce.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'vietnamese-herb-rice-vermicelli': {
      objectKey: 'media/vietnamese-herb-rice-vermicelli.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'malaysian-coconut-rice': {
      objectKey: 'media/malaysian-coconut-rice.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-chicken-coconut-korma': {
      objectKey: 'media/indian-chicken-coconut-korma.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-tomato-lentil-dal': {
      objectKey: 'media/indian-tomato-lentil-dal.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-cucumber-mint-bowl': {
      objectKey: 'media/indian-cucumber-mint-bowl.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'indian-cardamom-mango-cream': {
      objectKey: 'media/indian-cardamom-mango-cream.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-herb-lamb-tray': {
      objectKey: 'media/mediterranean-herb-lamb-tray.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-bulgur-herb-salad': {
      objectKey: 'media/mediterranean-bulgur-herb-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-roasted-pepper-dip': {
      objectKey: 'media/mediterranean-roasted-pepper-dip.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'mediterranean-honey-almond-bites': {
      objectKey: 'media/mediterranean-honey-almond-bites.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-chicken-pesto-style': {
      objectKey: 'media/italian-chicken-pesto-style.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-tomato-white-fish': {
      objectKey: 'media/italian-tomato-white-fish.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-spinach-rice-staple': {
      objectKey: 'media/italian-spinach-rice-staple.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'italian-lemon-apple-tart': {
      objectKey: 'media/italian-lemon-apple-tart.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-roast-lamb-carrots': {
      objectKey: 'media/french-roast-lamb-carrots.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-mushroom-herb-side': {
      objectKey: 'media/french-mushroom-herb-side.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-baked-egg-starter': {
      objectKey: 'media/french-baked-egg-starter.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-coconut-chocolate-free-pots': {
      objectKey: 'media/french-coconut-chocolate-free-pots.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'french-green-bean-almond-salad': {
      objectKey: 'media/french-green-bean-almond-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-salmon-herb-tray': {
      objectKey: 'media/australian-salmon-herb-tray.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-chicken-pumpkin-salad': {
      objectKey: 'media/australian-chicken-pumpkin-salad.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-green-bean-almond-side': {
      objectKey: 'media/australian-green-bean-almond-side.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-sweet-potato-staple': {
      objectKey: 'media/australian-sweet-potato-staple.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'australian-lime-mango-pudding': {
      objectKey: 'media/australian-lime-mango-pudding.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-chicken-vegetable-roast': {
      objectKey: 'media/western-chicken-vegetable-roast.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-tomato-soup': {
      objectKey: 'media/western-tomato-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-herb-stuffed-mushrooms': {
      objectKey: 'media/western-herb-stuffed-mushrooms.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-cinnamon-banana-bread': {
      objectKey: 'media/western-cinnamon-banana-bread.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'western-creamy-mushroom-rice': {
      objectKey: 'media/western-creamy-mushroom-rice.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'middle-eastern-lamb-rice-platter': {
      objectKey: 'media/middle-eastern-lamb-rice-platter.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'middle-eastern-chickpea-soup': {
      objectKey: 'media/middle-eastern-chickpea-soup.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-chicken-rice-platter': {
      objectKey: 'media/latin-chicken-rice-platter.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'latin-black-bean-stew': {
      objectKey: 'media/latin-black-bean-stew.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'other-herb-roast-fish': {
      objectKey: 'media/other-herb-roast-fish.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
    'other-mango-coconut-rice': {
      objectKey: 'media/other-mango-coconut-rice.webp',
      generatedAt: '2026-08-17T00:00:00.000Z',
      aiModel: 'imagegen-editorial-v1',
    },
  };

/**
 * Batches A-D shipped with generated artwork. Batches E and F are the V2
 * expansion: the records are complete and safe to plan with, but their photos
 * have not been produced yet, so they keep their own media block and the UI
 * shows a placeholder rather than a broken image.
 */
export const launchRecipes: RecipeImport[] = [
  ...[...batchA, ...batchB, ...batchC, ...batchD].map((recipe) => ({
    ...recipe,
    status: 'published' as const,
    source: {
      sourceType: 'original' as const,
      providerName: 'One Table editorial catalogue',
      sourceUrl: null,
      licenseCode: 'internal-editorial',
      attributionRequired: false,
      cachingAllowed: true,
    },
    media: generatedMedia[recipe.slug]
      ? {
          ...launchImage(recipe),
          ...generatedMedia[recipe.slug],
        }
      : launchImage(recipe),
  })),
  ...batchE,
  ...batchF,
];

/** Slugs still waiting on artwork, consumed by the image-brief generator. */
export const recipesAwaitingArtwork = [...batchE, ...batchF].map((recipe) => recipe.slug);

export const launchCatalogFile = {
  batch: 'launch' as const,
  version: '2026-08-launch-2',
  generatedAt: '2026-08-16T00:00:00.000Z',
  recipes: launchRecipes,
};

export const launchRecipeById = new Map(
  launchRecipes.flatMap((recipe) => [[recipe.id, recipe] as const, [recipe.slug, recipe] as const]),
);
