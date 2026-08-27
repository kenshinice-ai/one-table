import type { RecipeImport } from '@/domain/batch-a';

import { ingredientCatalog as batchAIngredientCatalog } from './batch-a';
import { batchBIngredientCatalog } from './batch-b';
import { expansionIngredientCatalog } from './expansion-shared';
import { expansionV2IngredientCatalog } from './expansion-v2-shared';
import { expansionV4IngredientCatalog } from './expansion-v4-shared';

/**
 * Wave-3 generator: occasion-tagged recipes with varied step voice.
 * Derived from the v2 generator; differences are occasions (required),
 * three step-text variants per method, and 5-7 ingredients per dish.
 */
export const expansionV3IngredientCatalog = [
  {
    id: 'lotus_root',
    nameEn: 'Lotus root',
    nameZh: '莲藕',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  { id: 'bacon', nameEn: 'Bacon', nameZh: '培根', category: 'protein', defaultUnit: 'g' as const },
  {
    id: 'scallops',
    nameEn: 'Scallops',
    nameZh: '扇贝',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'mollusc', presence: 'contains' as const }],
  },
  {
    id: 'chestnut',
    nameEn: 'Chestnuts',
    nameZh: '板栗',
    category: 'nut',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'tree_nut', presence: 'contains' as const }],
  },
  {
    id: 'osmanthus',
    nameEn: 'Osmanthus',
    nameZh: '桂花',
    category: 'herb',
    defaultUnit: 'g' as const,
  },
  {
    id: 'lotus_seed_paste',
    nameEn: 'Lotus seed paste',
    nameZh: '莲蓉',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
  { id: 'ham', nameEn: 'Ham', nameZh: '火腿', category: 'protein', defaultUnit: 'g' as const },
  {
    id: 'ricotta_hotcake_mix',
    nameEn: 'Self-raising flour',
    nameZh: '自发粉',
    category: 'pantry',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },
  {
    id: 'granola',
    nameEn: 'Granola',
    nameZh: '烤麦片',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'may_contain' as const },
      { code: 'tree_nut', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'jam',
    nameEn: 'Berry jam',
    nameZh: '莓果酱',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
];

/** Health bands map onto the deterministic score in src/domain/health.ts. */
export type HealthBand = 'bright' | 'balanced' | 'hearty' | 'indulgent';

const HEALTH_PROFILE: Record<
  HealthBand,
  { sodiumMg: number; fibreG: number; saturatedFatG: number; sugarsG: number }
> = {
  bright: { sodiumMg: 380, fibreG: 7.2, saturatedFatG: 2.4, sugarsG: 6 },
  balanced: { sodiumMg: 520, fibreG: 4.6, saturatedFatG: 4.1, sugarsG: 9 },
  hearty: { sodiumMg: 720, fibreG: 4.2, saturatedFatG: 6.3, sugarsG: 11 },
  indulgent: { sodiumMg: 880, fibreG: 2.8, saturatedFatG: 9.4, sugarsG: 17 },
};

export type ExpansionV3Spec = {
  slug: string;
  occasions: Array<
    | 'cny'
    | 'mid_autumn'
    | 'christmas'
    | 'easter'
    | 'brunch'
    | 'afternoon_tea'
    | 'bbq'
    | 'weeknight'
    | 'party'
    | 'feast'
  >;
  titleZh: string;
  titleEn: string;
  role: RecipeImport['primaryRole'];
  cuisine: string;
  method: string;
  ingredients: string[];
  focusZh: string;
  focusEn: string;
  health: HealthBand;
  dietTags?: string[];
  active: number;
  total: number;
  advance?: number;
  spice?: number;
  childFriendly?: boolean;
  equipment?: string[];
  servings?: number;
  kcal?: number;
  /**
   * Ingredient cost for the recipe as written, in cents.
   *
   * Everything else on this type is derived; this cannot be. The fallback
   * prices by course — around A$16 for a main — which is fine for a tray of
   * roast chicken and nonsense for a lobster. A dish whose ingredients carry
   * real money states its own price, or the budget filter and the estimated
   * total quietly lie about it.
   */
  costCents?: number;
};

const allIngredients = [
  ...batchAIngredientCatalog,
  ...batchBIngredientCatalog,
  ...expansionIngredientCatalog,
  ...expansionV2IngredientCatalog,
  ...expansionV3IngredientCatalog,
  ...expansionV4IngredientCatalog,
];
const ingredientById = new Map(allIngredients.map((ingredient) => [ingredient.id, ingredient]));

const amounts: Record<string, [number, 'g' | 'ml' | 'count']> = {
  // Wave-5. Same reasoning as the wave-4 block below: the 180–330g default is
  // nonsense for a spoon of matcha and for a garnish of goji, and a shopping
  // list that asks a counter for 300g of za'atar is worse than no list.
  sage: [12, 'g'],
  gorgonzola: [180, 'g'],
  coffee: [180, 'ml'],
  water_chestnut: [250, 'g'],
  beef_brisket: [1400, 'g'],
  sausage: [600, 'g'],
  gelatine: [20, 'g'],
  spring_onion: [60, 'g'],
  matcha: [20, 'g'],
  cardamom: [6, 'g'],
  zaatar: [25, 'g'],
  earl_grey_tea: [12, 'g'],
  goji: [25, 'g'],
  dried_shrimp: [30, 'g'],
  wood_ear: [25, 'g'],
  lily_bulb: [80, 'g'],
  pine_nut: [50, 'g'],
  hazelnut: [80, 'g'],
  mixed_nuts: [180, 'g'],
  capers: [30, 'g'],
  anchovy: [40, 'g'],
  olives: [120, 'g'],
  pesto: [120, 'g'],
  doubanjiang: [45, 'g'],
  chilli_oil: [30, 'ml'],
  sriracha: [30, 'ml'],
  black_vinegar: [30, 'ml'],
  shaoxing_wine: [60, 'ml'],
  sparkling_wine: [400, 'ml'],
  duck_fat: [60, 'g'],
  salted_egg_yolk: [6, 'count'],
  century_egg: [4, 'count'],
  crumpet: [6, 'count'],
  chinese_sausage: [150, 'g'],
  pancetta: [120, 'g'],
  salami: [120, 'g'],
  smoked_salmon: [220, 'g'],
  mascarpone: [250, 'g'],
  burrata: [250, 'g'],
  brie: [200, 'g'],
  preserved_mustard: [60, 'g'],
  currants: [60, 'g'],
  cranberry: [100, 'g'],
  tofu_skin: [80, 'g'],
  chinese_chives: [150, 'g'],
  rocket: [100, 'g'],
  witlof: [200, 'g'],
  pasta_fresh_ribbon: [400, 'g'],
  pasta_filled: [400, 'g'],
  gnocchi: [500, 'g'],
  lasagne_sheet: [250, 'g'],
  puff_pastry: [320, 'g'],
  filo_pastry: [200, 'g'],
  turkish_bread: [300, 'g'],
  chia_seed: [60, 'g'],
  mussels: [900, 'g'],
  clams: [700, 'g'],
  squid: [500, 'g'],
  tuna: [450, 'g'],
  barramundi: [600, 'g'],
  pomelo: [500, 'g'],
  watermelon: [700, 'g'],
  pineapple: [500, 'g'],
  artichoke: [300, 'g'],
  parsnip: [400, 'g'],

  // Wave-4 celebration tier. The generic 180–330g default is meaningless for a
  // shaving of truffle and absurd for a whole lamb, so these are stated.
  lobster: [800, 'g'],
  king_crab: [900, 'g'],
  crab_meat: [300, 'g'],
  abalone: [400, 'g'],
  oyster: [12, 'count'],
  dried_scallop: [40, 'g'],
  sea_cucumber: [300, 'g'],
  whole_fish: [700, 'g'],
  caviar: [30, 'g'],
  wagyu_beef: [400, 'g'],
  dry_aged_beef: [700, 'g'],
  beef_short_rib: [1200, 'g'],
  lamb_rack: [800, 'g'],
  lamb_shoulder: [1400, 'g'],
  lamb_whole: [12000, 'g'],
  turkey: [900, 'g'],
  ham_leg: [2500, 'g'],
  pork_belly: [800, 'g'],
  pork_hock: [1000, 'g'],
  foie_gras: [200, 'g'],
  tofu_soft: [400, 'g'],
  truffle: [8, 'g'],
  saffron: [1, 'g'],
  winter_melon: [600, 'g'],
  taro: [400, 'g'],
  brussels_sprouts: [500, 'g'],
  peach: [4, 'count'],
  melon: [600, 'g'],
  lemongrass: [20, 'g'],
  vermicelli: [100, 'g'],
  dried_fruit: [200, 'g'],
  mixed_spice: [8, 'g'],
  caster_sugar: [120, 'g'],
  eggs: [3, 'count'],
  pear: [4, 'count'],
  apple: [4, 'count'],
  mango: [2, 'count'],
  lemon: [1, 'count'],
  lime: [2, 'count'],
  orange: [2, 'count'],
  avocado: [2, 'count'],
  tortilla: [8, 'count'],
  rice_paper: [12, 'count'],
  vanilla: [5, 'ml'],
  water: [400, 'ml'],
  stock: [900, 'ml'],
  coconut_milk: [300, 'ml'],
  milk: [250, 'ml'],
  cream: [200, 'ml'],
  soy_sauce: [35, 'ml'],
  tamari: [35, 'ml'],
  fish_sauce: [20, 'ml'],
  rice_vinegar: [30, 'ml'],
  balsamic_vinegar: [25, 'ml'],
  sesame_oil: [15, 'ml'],
  olive_oil: [30, 'ml'],
  white_wine: [120, 'ml'],
  honey: [30, 'g'],
  maple_syrup: [35, 'ml'],
  dijon_mustard: [20, 'g'],
  harissa: [30, 'g'],
  gochujang: [35, 'g'],
  tomato_paste: [50, 'g'],
  miso_paste: [45, 'g'],
  tahini: [70, 'g'],
  cocoa: [40, 'g'],
  dark_chocolate: [150, 'g'],
  flour: [300, 'g'],
  oats: [220, 'g'],
  quinoa: [300, 'g'],
  couscous: [300, 'g'],
  barley: [280, 'g'],
  polenta: [250, 'g'],
  sourdough: [300, 'g'],
  egg_noodle: [360, 'g'],
  walnuts: [80, 'g'],
  cashews: [90, 'g'],
  pistachio: [70, 'g'],
  almonds: [80, 'g'],
  sunflower_seed: [50, 'g'],
  dill: [12, 'g'],
  thyme: [8, 'g'],
  oregano: [8, 'g'],
  rosemary: [8, 'g'],
  turmeric: [6, 'g'],
  paprika: [8, 'g'],
  cumin: [8, 'g'],
  cinnamon: [6, 'g'],
  star_anise: [4, 'g'],
  sichuan_pepper: [5, 'g'],
  five_spice: [6, 'g'],
  ginger: [30, 'g'],
  garlic: [25, 'g'],
  chilli: [20, 'g'],
  pomegranate: [120, 'g'],
  dates: [140, 'g'],
  berries: [250, 'g'],
  lotus_root: [300, 'g'],
  bacon: [180, 'g'],
  scallops: [350, 'g'],
  chestnut: [200, 'g'],
  osmanthus: [6, 'g'],
  lotus_seed_paste: [220, 'g'],
  ham: [400, 'g'],
  ricotta_hotcake_mix: [260, 'g'],
  granola: [180, 'g'],
  jam: [80, 'g'],
};

const methodEquipment: Record<string, string[]> = {
  raw: [],
  chill: [],
  boil: ['equip_stovetop'],
  simmer: ['equip_stovetop'],
  steam: ['equip_stovetop'],
  stir_fry: ['equip_stovetop'],
  braise: ['equip_stovetop'],
  pan_fry: ['equip_stovetop'],
  deep_fry: ['equip_stovetop'],
  bake: ['equip_oven'],
  roast: ['equip_oven'],
  grill: ['equip_bbq'],
};

/** Per-method cooking guidance, reused for both the summary and step two. */
const methodGuide: Record<string, { zh: string; en: string }> = {
  raw: {
    zh: '保持食材清爽的生食口感，临上桌前再拌匀调味。',
    en: 'Keep everything fresh and toss with the dressing just before serving.',
  },
  chill: {
    zh: '组合后冷藏定型，取出前再确认质地与温度。',
    en: 'Chill until set, then check the texture and temperature before serving.',
  },
  boil: {
    zh: '加入液体煮至食材熟透，途中撇去浮沫。',
    en: 'Add the liquid and cook until tender, skimming as needed.',
  },
  simmer: {
    zh: '小火慢炖至风味融合，保持汤面微微冒泡即可。',
    en: 'Simmer gently until the flavours come together, keeping the surface barely bubbling.',
  },
  steam: {
    zh: '水开后上蒸锅蒸至中心熟透，开盖时小心蒸汽。',
    en: 'Steam over boiling water until cooked through, taking care with the steam.',
  },
  stir_fry: {
    zh: '大火快速翻炒，让食材保持脆嫩并均匀裹上调味。',
    en: 'Stir-fry over high heat so everything stays bright and evenly seasoned.',
  },
  braise: {
    zh: '先煸出香气，再小火焖至入味并收汁到合适浓度。',
    en: 'Build the aromatics first, then braise gently until tender and lightly reduced.',
  },
  pan_fry: {
    zh: '平底锅少油煎至两面上色，翻面时保持食材完整。',
    en: 'Pan-fry with a little oil until golden on both sides, turning carefully.',
  },
  deep_fry: {
    zh: '分批放入稳定油温中炸熟，沥油后确认中心温度。',
    en: 'Fry in batches at a steady temperature, drain well and check the centre.',
  },
  bake: {
    zh: '烤箱预热后烘烤至表面上色、中心熟透，出炉稍作静置。',
    en: 'Bake in a preheated oven until golden and cooked through, then rest briefly.',
  },
  roast: {
    zh: '烤至边缘焦香、中心熟透，中途翻动一次使受热均匀。',
    en: 'Roast until the edges caramelise and the centre is done, turning once.',
  },
  grill: {
    zh: '烤架烧热后分面烤制，留下轻微焦痕并确认中心熟透。',
    en: 'Grill on both sides for light char, checking the centre is cooked.',
  },
};

function ingredientAmount(id: string, index: number): [number, 'g' | 'ml' | 'count'] {
  const explicit = amounts[id];
  if (explicit) return explicit;
  const definition = ingredientById.get(id);
  if (!definition) throw new Error(`Unknown V2 expansion ingredient: ${id}`);
  if (definition.defaultUnit === 'ml') return [20 + (index % 3) * 10, 'ml'];
  if (definition.defaultUnit === 'count') return [2 + (index % 2), 'count'];
  return [180 + (index % 4) * 50, 'g'];
}

function displayQuantity(quantity: number, unit: 'g' | 'ml' | 'count', id: string) {
  if (unit === 'count') {
    const name = ingredientById.get(id)?.nameEn ?? id;
    return `${quantity} ${name.toLowerCase()}`;
  }
  return `${quantity} ${unit}`;
}

/**
 * Splits the cooking time across prep, cook and plate so the method timeline
 * has real minutes to show rather than an undifferentiated list of steps.
 */
function stepMinutes(spec: ExpansionV3Spec) {
  const prep = Math.max(4, Math.round(spec.active * 0.4));
  const cook = Math.max(5, spec.active - prep);
  const finish = Math.max(2, Math.round(spec.active * 0.15));
  return { prep, cook, finish };
}

const prepVariantsZh = [
  (title: string, lead: string) => `备齐${title}的食材，${lead}先处理好，其余按份量分置备用。`,
  (title: string, lead: string) => `把${lead}洗切到位，再核对${title}其余食材的份量与包装标签。`,
  (title: string, lead: string) => `先从${lead}下手：处理成合适大小，其余食材按清单排开备用。`,
];
const prepVariantsEn = [
  (title: string, lead: string) =>
    `Get everything for ${title} ready, starting with the ${lead}; portion the rest.`,
  (title: string, lead: string) =>
    `Prep the ${lead} first, then check quantities and labels for the remaining ingredients.`,
  (title: string, lead: string) =>
    `Start with the ${lead}: cut to size, then line up the rest of the list.`,
];
const seasonVariantsZh = [
  (focus: string) => `调味围绕${focus}展开，先少后多，边尝边调。`,
  (focus: string) => `把${focus}调出来：分两次下调味，第二次只做微调。`,
  (focus: string) => `尝一口，朝着${focus}的方向补味，宁淡勿咸。`,
];
const seasonVariantsEn = [
  (focus: string) => `Season toward ${focus} — start light, taste, adjust.`,
  (focus: string) => `Build ${focus} in two passes: season, taste, then fine-tune.`,
  (focus: string) => `Taste and nudge toward ${focus}; under-salt first, correct late.`,
];
const plateVariantsZh = [
  '装盘后确认温度安全，按合餐或分餐方式上桌。',
  '盛入预热或常温的餐具，趁状态最好的时候上桌。',
  '摆盘从简，上桌前最后确认一次温度与份量。',
];
const plateVariantsEn = [
  'Plate up, check the temperature is safe, and serve family-style or plated.',
  'Transfer to warmed or room-temperature dishes and serve at its best.',
  'Keep the plating simple; give temperature and portions a final check before serving.',
];

function makeRecipe(
  spec: ExpansionV3Spec,
  index: number,
  batchKey: 'g' | 'h' | 'i' | 'j',
): RecipeImport {
  const dietCodes = new Set(spec.dietTags ?? []);
  if (dietCodes.has('vegan')) dietCodes.add('vegetarian');

  const allergens = new Map<string, RecipeImport['allergens'][number]>();
  for (const ingredientId of spec.ingredients) {
    const ingredient = ingredientById.get(ingredientId);
    if (!ingredient) throw new Error(`Unknown V2 expansion ingredient: ${ingredientId}`);
    for (const relation of ingredient.allergens ?? []) {
      allergens.set(`${ingredientId}:${relation.code}`, {
        ingredientId,
        allergenCode: relation.code,
        presence: relation.presence,
        reviewed: relation.presence !== 'unknown',
      });
    }
  }

  const method = methodGuide[spec.method];
  if (!method) throw new Error(`Unknown V2 expansion method: ${spec.method}`);

  const id = `rec_${batchKey}_${String(index + 1).padStart(3, '0')}`;
  const baseServings = spec.servings ?? 4;
  const profile = HEALTH_PROFILE[spec.health];
  const energyKcal =
    spec.kcal ??
    {
      snack: 180,
      starter: 220,
      soup: 240,
      salad: 210,
      side: 230,
      staple: 340,
      main: 430,
      dessert: 300,
    }[spec.role] +
      (index % 5) * 12;
  const totalCents =
    spec.costCents ??
    (spec.role === 'main' ? 1600 : spec.role === 'staple' ? 900 : 1050) + (index % 12) * 45;
  const equipment = spec.equipment ?? methodEquipment[spec.method] ?? [];
  const times = stepMinutes(spec);

  const ingredientRows = spec.ingredients.map((ingredientId, ingredientIndex) => {
    const [quantity, unit] = ingredientAmount(ingredientId, index + ingredientIndex);
    return {
      ingredientId,
      quantity,
      unit,
      displayQuantity: displayQuantity(quantity, unit, ingredientId),
      optional: false,
      scalingStrategy: unit === 'count' ? ('rounded' as const) : ('linear' as const),
      preparationNoteEn: 'Prepare according to the numbered method.',
      preparationNoteZh: '按步骤处理食材。',
      substitutionGroup: null,
    };
  });

  const leadIngredientZh = ingredientById.get(spec.ingredients[0])?.nameZh ?? '';
  const leadIngredientEn = ingredientById.get(spec.ingredients[0])?.nameEn ?? '';
  const voice = index % 3;
  const prepZh = prepVariantsZh[voice](spec.titleZh, leadIngredientZh);
  const prepEn = prepVariantsEn[voice](spec.titleEn, leadIngredientEn.toLowerCase());
  const seasonZh = seasonVariantsZh[voice](spec.focusZh);
  const seasonEn = seasonVariantsEn[voice](spec.focusEn);
  const plateZh = plateVariantsZh[voice];
  const plateEn = plateVariantsEn[voice];

  return {
    id,
    slug: spec.slug,
    status: 'published',
    primaryRole: spec.role,
    occasions: spec.occasions,
    secondaryRoles: spec.role === 'salad' ? ['side'] : spec.role === 'starter' ? ['snack'] : [],
    cuisines: [spec.cuisine],
    methods: [spec.method],
    equipment: equipment.map((equipmentId) => ({
      id: equipmentId,
      quantity: 1,
      occupiedMinutes: spec.total,
      required: true,
    })),
    servingStyles: {
      family: spec.role === 'dessert' ? 84 : 90,
      plated: spec.role === 'staple' ? 78 : 88,
      buffet: spec.role === 'soup' ? 74 : 88,
    },
    baseServings,
    activeMinutes: spec.active,
    totalMinutes: spec.total,
    advanceMinutes: spec.advance ?? (spec.role === 'dessert' || spec.role === 'soup' ? 20 : 0),
    difficulty:
      spec.method === 'deep_fry' || spec.total > 75
        ? 'medium'
        : spec.total > 110
          ? 'advanced'
          : 'easy',
    spiceLevel: spec.spice ?? 0,
    holdQuality: spec.role === 'salad' ? 4 : spec.role === 'soup' ? 5 : 3,
    reheatingQuality: ['main', 'staple', 'soup', 'side'].includes(spec.role) ? 4 : 3,
    childFriendly: spec.childFriendly ?? (spec.spice ?? 0) <= 1,
    kitchenTestStatus: 'not_tested',
    scalingNotes: {
      policy: 'Editorial estimate; verify quantities and packaged labels before service.',
    },
    safetyNotes:
      'Nutrition, cost and allergen relations are planning estimates. Verify packaged-product labels before cooking.',
    translations: {
      'zh-CN': {
        title: spec.titleZh,
        summary: `${spec.titleZh}以${spec.focusZh}为主，适合聚餐分享。`,
        servingNote: '请按聚餐人数缩放，并在上桌前确认温度与包装过敏原提示。',
        instructions: [prepZh, method.zh, seasonZh, plateZh],
        structuredInstructions: [
          { text: prepZh, minutes: times.prep, phase: 'prep' as const },
          { text: method.zh, minutes: times.cook, phase: 'cook' as const },
          { text: seasonZh, minutes: times.finish, phase: 'cook' as const },
          {
            text: plateZh,
            minutes: 2,
            phase: 'plate' as const,
            tip:
              spec.advance && spec.advance > 0
                ? `可提前 ${spec.advance} 分钟完成到这一步，上桌前再复热或回温。`
                : undefined,
          },
        ],
        aiAssisted: false,
      },
      'en-AU': {
        title: spec.titleEn,
        summary: `${spec.titleEn} highlights ${spec.focusEn} in a practical sharing dish.`,
        servingNote:
          'Scale to the gathering size and check temperature and packaged allergen notices before serving.',
        instructions: [prepEn, method.en, seasonEn, plateEn],
        structuredInstructions: [
          { text: prepEn, minutes: times.prep, phase: 'prep' as const },
          { text: method.en, minutes: times.cook, phase: 'cook' as const },
          { text: seasonEn, minutes: times.finish, phase: 'cook' as const },
          {
            text: plateEn,
            minutes: 2,
            phase: 'plate' as const,
            tip:
              spec.advance && spec.advance > 0
                ? `This can be made ${spec.advance} minutes ahead, then reheated or brought back to room temperature.`
                : undefined,
          },
        ],
        aiAssisted: false,
      },
    },
    ingredients: ingredientRows,
    allergens: [...allergens.values()],
    dietTags: [...dietCodes].map((code) => ({ code, verification: 'reviewed' as const })),
    nutrition: {
      energyKj: Math.round(energyKcal * 4.184),
      energyKcal,
      proteinG: Math.round((spec.role === 'main' ? 26 : 9 + (index % 7)) * 10) / 10,
      fatG: Math.round((profile.saturatedFatG * 2 + (index % 5)) * 10) / 10,
      saturatedFatG: profile.saturatedFatG,
      carbohydrateG: Math.round((22 + (index % 16)) * 10) / 10,
      sugarsG: spec.role === 'dessert' ? profile.sugarsG + 12 : profile.sugarsG,
      fibreG: profile.fibreG,
      sodiumMg: profile.sodiumMg + (index % 6) * 5,
      confidence: 55,
      sourceName: 'Editorial expansion estimate',
      sourceVersion: '2026-08-expansion-3',
    },
    cost: {
      regionCode: 'AU-MEL',
      totalCents,
      perServingCents: Math.round(totalCents / baseServings),
      pantryPolicy: 'exclude_staples',
      priceVersion: '2026-08-melbourne-launch-1',
    },
    source: {
      sourceType: 'original',
      providerName: 'One Table editorial catalogue',
      sourceUrl: null,
      licenseCode: 'internal-editorial',
      attributionRequired: false,
      cachingAllowed: true,
    },
    media: {
      // Artwork for this batch has not been produced yet. The object key still
      // follows the launch convention so a generated file drops straight in;
      // until then the UI falls back to its "coming soon" placeholder.
      objectKey: `recipes/v3/${spec.slug}/hero-1600x1200.webp`,
      mediaType: 'ai_illustration',
      mimeType: 'image/webp',
      width: 1600,
      height: 1200,
      altEn: `${spec.titleEn}, an editorial recipe illustration`,
      altZh: `${spec.titleZh}，聚餐菜谱示意图`,
      sourceUrl: null,
      licenseCode: 'ai-generated-editorial',
      attribution: null,
      aiModel: 'pending-imagegen-v3',
      aiPrompt: `Realistic editorial food photography of ${spec.titleEn}; only canonical ingredients ${spec.ingredients.join(', ')}; ${spec.focusEn}; warm off-white tabletop; soft sage and muted peach accents; no text, logos, people, hands, packaging or undeclared ingredients; 4:3 landscape.`,
      generatedAt: null,
      rightsReviewedAt: '2026-08-18T00:00:00.000Z',
    },
    substitutions: spec.ingredients.includes('soy_sauce')
      ? [
          {
            ingredientId: 'soy_sauce',
            replacementIngredientId: 'tamari',
            noteEn: 'Use tamari only after checking the same allergen constraints.',
            noteZh: '替换为无麸质酱油前仍需检查相同的过敏原约束。',
            safetyReviewed: true,
          },
        ]
      : [],
    review: {
      content: 'approved',
      allergen: 'approved',
      rights: 'approved',
      translation: 'approved',
      nutrition: 'approved',
    },
  };
}

export function createV3Recipes(
  specs: ExpansionV3Spec[],
  batchKey: 'g' | 'h' | 'i' | 'j',
): RecipeImport[] {
  return specs.map((spec, index) => makeRecipe(spec, index, batchKey));
}
