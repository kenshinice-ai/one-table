import type { RecipeImport } from '@/domain/batch-a';

import { ingredientCatalog as batchAIngredientCatalog } from './batch-a';
import { batchBIngredientCatalog } from './batch-b';
import { expansionIngredientCatalog } from './expansion-shared';

/**
 * Ingredients introduced by the second expansion. The V2 catalogue leans on
 * starters, soups and salads, which the launch palette could not cover without
 * repeating itself.
 */
export const expansionV2IngredientCatalog = [
  { id: 'peas', nameEn: 'Peas', nameZh: '青豆', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'capsicum', nameEn: 'Capsicum', nameZh: '甜椒', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'asparagus', nameEn: 'Asparagus', nameZh: '芦笋', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'leek', nameEn: 'Leek', nameZh: '韭葱', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'celery', nameEn: 'Celery', nameZh: '西芹', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'radish', nameEn: 'Radish', nameZh: '白萝卜', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'avocado', nameEn: 'Avocado', nameZh: '牛油果', category: 'fruit', defaultUnit: 'count' as const },
  { id: 'fennel', nameEn: 'Fennel', nameZh: '茴香球', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'snow_pea', nameEn: 'Snow peas', nameZh: '荷兰豆', category: 'vegetable', defaultUnit: 'g' as const },
  { id: 'edamame', nameEn: 'Edamame', nameZh: '毛豆', category: 'legume', defaultUnit: 'g' as const,
    allergens: [{ code: 'soy', presence: 'contains' as const }] },
  { id: 'tempeh', nameEn: 'Tempeh', nameZh: '天贝', category: 'protein', defaultUnit: 'g' as const,
    allergens: [{ code: 'soy', presence: 'contains' as const }] },
  { id: 'prawns', nameEn: 'Prawns', nameZh: '虾', category: 'protein', defaultUnit: 'g' as const,
    allergens: [{ code: 'crustacean', presence: 'contains' as const }] },
  { id: 'duck_breast', nameEn: 'Duck breast', nameZh: '鸭胸', category: 'protein', defaultUnit: 'g' as const },
  { id: 'quinoa', nameEn: 'Quinoa', nameZh: '藜麦', category: 'staple', defaultUnit: 'g' as const },
  { id: 'couscous', nameEn: 'Couscous', nameZh: '古斯米', category: 'staple', defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }] },
  { id: 'barley', nameEn: 'Pearl barley', nameZh: '珍珠大麦', category: 'staple', defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }] },
  { id: 'oats', nameEn: 'Rolled oats', nameZh: '燕麦片', category: 'staple', defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'may_contain' as const }] },
  { id: 'polenta', nameEn: 'Polenta', nameZh: '玉米糊', category: 'staple', defaultUnit: 'g' as const },
  { id: 'tortilla', nameEn: 'Tortilla', nameZh: '墨西哥薄饼', category: 'staple', defaultUnit: 'count' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }] },
  { id: 'walnuts', nameEn: 'Walnuts', nameZh: '核桃', category: 'nut', defaultUnit: 'g' as const,
    allergens: [{ code: 'tree_nut', presence: 'contains' as const }] },
  { id: 'cashews', nameEn: 'Cashews', nameZh: '腰果', category: 'nut', defaultUnit: 'g' as const,
    allergens: [{ code: 'tree_nut', presence: 'contains' as const }] },
  { id: 'pistachio', nameEn: 'Pistachios', nameZh: '开心果', category: 'nut', defaultUnit: 'g' as const,
    allergens: [{ code: 'tree_nut', presence: 'contains' as const }] },
  { id: 'sunflower_seed', nameEn: 'Sunflower seeds', nameZh: '葵花籽', category: 'pantry', defaultUnit: 'g' as const },
  { id: 'dill', nameEn: 'Dill', nameZh: '莳萝', category: 'herb', defaultUnit: 'g' as const },
  { id: 'thyme', nameEn: 'Thyme', nameZh: '百里香', category: 'herb', defaultUnit: 'g' as const },
  { id: 'oregano', nameEn: 'Oregano', nameZh: '牛至', category: 'herb', defaultUnit: 'g' as const },
  { id: 'turmeric', nameEn: 'Turmeric', nameZh: '姜黄', category: 'spice', defaultUnit: 'g' as const },
  { id: 'paprika', nameEn: 'Paprika', nameZh: '甜椒粉', category: 'spice', defaultUnit: 'g' as const },
  { id: 'star_anise', nameEn: 'Star anise', nameZh: '八角', category: 'spice', defaultUnit: 'g' as const },
  { id: 'sichuan_pepper', nameEn: 'Sichuan pepper', nameZh: '花椒', category: 'spice', defaultUnit: 'g' as const },
  { id: 'rice_vinegar', nameEn: 'Rice vinegar', nameZh: '米醋', category: 'pantry', defaultUnit: 'ml' as const },
  { id: 'balsamic_vinegar', nameEn: 'Balsamic vinegar', nameZh: '黑醋', category: 'pantry', defaultUnit: 'ml' as const,
    allergens: [{ code: 'sulphites', presence: 'may_contain' as const }] },
  { id: 'dijon_mustard', nameEn: 'Dijon mustard', nameZh: '第戎芥末', category: 'pantry', defaultUnit: 'g' as const },
  { id: 'harissa', nameEn: 'Harissa', nameZh: '哈里萨辣酱', category: 'pantry', defaultUnit: 'g' as const },
  { id: 'gochujang', nameEn: 'Gochujang', nameZh: '韩式辣酱', category: 'pantry', defaultUnit: 'g' as const,
    allergens: [{ code: 'soy', presence: 'contains' as const }] },
  { id: 'tomato_paste', nameEn: 'Tomato paste', nameZh: '番茄膏', category: 'pantry', defaultUnit: 'g' as const },
  { id: 'orange', nameEn: 'Orange', nameZh: '橙子', category: 'fruit', defaultUnit: 'count' as const },
  { id: 'berries', nameEn: 'Mixed berries', nameZh: '莓果', category: 'fruit', defaultUnit: 'g' as const },
  { id: 'dates', nameEn: 'Dates', nameZh: '椰枣', category: 'fruit', defaultUnit: 'g' as const },
  { id: 'dark_chocolate', nameEn: 'Dark chocolate', nameZh: '黑巧克力', category: 'pantry', defaultUnit: 'g' as const,
    allergens: [{ code: 'milk', presence: 'may_contain' as const }, { code: 'soy', presence: 'may_contain' as const }] },
  { id: 'cocoa', nameEn: 'Cocoa powder', nameZh: '可可粉', category: 'pantry', defaultUnit: 'g' as const },
  { id: 'halloumi', nameEn: 'Halloumi', nameZh: '哈罗米奶酪', category: 'dairy', defaultUnit: 'g' as const,
    allergens: [{ code: 'milk', presence: 'contains' as const }] },
  { id: 'sourdough', nameEn: 'Sourdough', nameZh: '酸种面包', category: 'staple', defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }] },
  { id: 'egg_noodle', nameEn: 'Egg noodles', nameZh: '鸡蛋面', category: 'staple', defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }, { code: 'egg', presence: 'contains' as const }] },
  { id: 'pomegranate', nameEn: 'Pomegranate', nameZh: '石榴', category: 'fruit', defaultUnit: 'g' as const },
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

export type ExpansionV2Spec = {
  slug: string;
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
};

const allIngredients = [
  ...batchAIngredientCatalog,
  ...batchBIngredientCatalog,
  ...expansionIngredientCatalog,
  ...expansionV2IngredientCatalog,
];
const ingredientById = new Map(allIngredients.map((ingredient) => [ingredient.id, ingredient]));

const amounts: Record<string, [number, 'g' | 'ml' | 'count']> = {
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
function stepMinutes(spec: ExpansionV2Spec) {
  const prep = Math.max(4, Math.round(spec.active * 0.4));
  const cook = Math.max(5, spec.active - prep);
  const finish = Math.max(2, Math.round(spec.active * 0.15));
  return { prep, cook, finish };
}

function makeRecipe(spec: ExpansionV2Spec, index: number, batchKey: 'e' | 'f'): RecipeImport {
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
    ({ snack: 180, starter: 220, soup: 240, salad: 210, side: 230, staple: 340, main: 430, dessert: 300 }[
      spec.role
    ] +
      (index % 5) * 12);
  const totalCents =
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

  return {
    id,
    slug: spec.slug,
    status: 'published',
    primaryRole: spec.role,
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
      spec.method === 'deep_fry' || spec.total > 75 ? 'medium' : spec.total > 110 ? 'advanced' : 'easy',
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
        instructions: [
          `备齐${spec.titleZh}所需食材，${leadIngredientZh}按份量处理并核对包装标签。`,
          method.zh,
          `补上${spec.focusZh}所需的调味，尝味后调整咸淡与浓度。`,
          '盛入稳定的餐盘，确认温度安全后按合餐或分餐方式上桌。',
        ],
        structuredInstructions: [
          {
            text: `备齐${spec.titleZh}所需食材，${leadIngredientZh}按份量处理并核对包装标签。`,
            minutes: times.prep,
            phase: 'prep' as const,
          },
          { text: method.zh, minutes: times.cook, phase: 'cook' as const },
          {
            text: `补上${spec.focusZh}所需的调味，尝味后调整咸淡与浓度。`,
            minutes: times.finish,
            phase: 'cook' as const,
          },
          {
            text: '盛入稳定的餐盘，确认温度安全后按合餐或分餐方式上桌。',
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
        instructions: [
          `Prepare everything for ${spec.titleEn}, cutting the ${leadIngredientEn.toLowerCase()} to size and checking labels.`,
          method.en,
          `Season to bring out ${spec.focusEn}, then taste and adjust.`,
          'Transfer to a stable serving dish and serve family-style or plated once temperature-safe.',
        ],
        structuredInstructions: [
          {
            text: `Prepare everything for ${spec.titleEn}, cutting the ${leadIngredientEn.toLowerCase()} to size and checking labels.`,
            minutes: times.prep,
            phase: 'prep' as const,
          },
          { text: method.en, minutes: times.cook, phase: 'cook' as const },
          {
            text: `Season to bring out ${spec.focusEn}, then taste and adjust.`,
            minutes: times.finish,
            phase: 'cook' as const,
          },
          {
            text: 'Transfer to a stable serving dish and serve family-style or plated once temperature-safe.',
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
      sourceVersion: '2026-08-expansion-2',
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
      objectKey: `recipes/v2/${spec.slug}/hero-1600x1200.webp`,
      mediaType: 'ai_illustration',
      mimeType: 'image/webp',
      width: 1600,
      height: 1200,
      altEn: `${spec.titleEn}, an editorial recipe illustration`,
      altZh: `${spec.titleZh}，聚餐菜谱示意图`,
      sourceUrl: null,
      licenseCode: 'ai-generated-editorial',
      attribution: null,
      aiModel: 'pending-imagegen-v2',
      aiPrompt: `Realistic editorial food photography of ${spec.titleEn}; only canonical ingredients ${spec.ingredients.join(', ')}; ${spec.focusEn}; warm off-white tabletop; soft sage and muted peach accents; no text, logos, people, hands, packaging or undeclared ingredients; 4:3 landscape.`,
      generatedAt: null,
      rightsReviewedAt: '2026-08-17T00:00:00.000Z',
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

export function createV2Recipes(specs: ExpansionV2Spec[], batchKey: 'e' | 'f'): RecipeImport[] {
  return specs.map((spec, index) => makeRecipe(spec, index, batchKey));
}
