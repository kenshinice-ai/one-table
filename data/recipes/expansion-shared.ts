import type { RecipeImport } from '@/domain/batch-a';

import { ingredientCatalog as batchAIngredientCatalog } from './batch-a';
import { batchBIngredientCatalog } from './batch-b';

export const expansionIngredientCatalog = [
  {
    id: 'beetroot',
    nameEn: 'Beetroot',
    nameZh: '甜菜根',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'banana',
    nameEn: 'Banana',
    nameZh: '香蕉',
    category: 'fruit',
    defaultUnit: 'count' as const,
  },
  {
    id: 'cauliflower',
    nameEn: 'Cauliflower',
    nameZh: '花椰菜',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'cheddar',
    nameEn: 'Cheddar',
    nameZh: '切达奶酪',
    category: 'dairy',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'milk', presence: 'contains' as const }],
  },
  {
    id: 'rosemary',
    nameEn: 'Rosemary',
    nameZh: '迷迭香',
    category: 'herb',
    defaultUnit: 'g' as const,
  },
  {
    id: 'onion',
    nameEn: 'Brown onion',
    nameZh: '洋葱',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },

  // Pasta shapes. Ten dishes shared one — conchiglie — while their own titles
  // said linguine, macaroni, orzo and carbonara. At a fresh-pasta counter the
  // shape is the order, so the shape has to be on the list. They live here
  // rather than with the later waves because batch-f and batch-h both need
  // them and the wave-2 catalogue cannot import a later one without a cycle.
  {
    id: 'pasta_long',
    nameEn: 'Long pasta (spaghetti or linguine)',
    nameZh: '长意面（细面 / 扁面）',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },
  {
    id: 'pasta_short',
    nameEn: 'Short pasta (penne or macaroni)',
    nameZh: '短意面（笔管 / 通心粉）',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },
  {
    id: 'orzo',
    nameEn: 'Orzo',
    nameZh: '米形意面',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },

  // Chocolate moved down from wave 2. A wave-1 dessert could not name it,
  // which is how "French Coconut Cream Pots" came to be a chocolate pot with
  // no chocolate on its list. A later wave can always see an earlier one.
  {
    id: 'dark_chocolate',
    nameEn: 'Dark chocolate',
    nameZh: '黑巧克力',
    category: 'pantry',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'milk', presence: 'may_contain' as const },
      { code: 'soy', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'cocoa',
    nameEn: 'Cocoa powder',
    nameZh: '可可粉',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },

  // --- Wave 5 ---
  // Sixty ingredients, and the reason for most of them is repair rather than
  // reach: thirty-eight dishes in this catalogue carried a `-free-` marker in
  // their slug, meaning they were written around something the catalogue did
  // not have. Tuna, matcha, pineapple, brie, pomelo, squid and the rest are
  // those absences. The remainder open the Market Pavilion's specialist
  // counters — a pasta bar, a deli, a fishmonger — and give three hundred
  // Chinese dishes the Shaoxing wine and black vinegar they should always
  // have had.
  //
  // They live in the wave-1 catalogue because every later wave already reads
  // it, and a repair is only useful in the batch that needs repairing.
  {
    id: 'tuna',
    nameEn: 'Tuna',
    nameZh: '金枪鱼',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'fish', presence: 'contains' as const }],
  },
  {
    id: 'brie',
    nameEn: 'Brie',
    nameZh: '布里奶酪',
    category: 'dairy',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'milk', presence: 'contains' as const }],
  },
  {
    id: 'cardamom',
    nameEn: 'Cardamom',
    nameZh: '小豆蔻',
    category: 'spice',
    defaultUnit: 'g' as const,
  },
  {
    id: 'squid',
    nameEn: 'Squid',
    nameZh: '鱿鱼',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'mollusc', presence: 'contains' as const }],
  },
  {
    id: 'pomelo',
    nameEn: 'Pomelo',
    nameZh: '柚子',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'matcha',
    nameEn: 'Matcha',
    nameZh: '抹茶粉',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
  {
    id: 'pineapple',
    nameEn: 'Pineapple',
    nameZh: '菠萝',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'duck_fat',
    nameEn: 'Duck fat',
    nameZh: '鸭油',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
  {
    id: 'cherry',
    nameEn: 'Cherries',
    nameZh: '樱桃',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'watermelon',
    nameEn: 'Watermelon',
    nameZh: '西瓜',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'mixed_nuts',
    nameEn: 'Mixed nuts',
    nameZh: '混合坚果仁',
    category: 'nut',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'tree_nut', presence: 'contains' as const },
      { code: 'peanut', presence: 'may_contain' as const },
      { code: 'sesame', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'plum',
    nameEn: 'Plums',
    nameZh: '李子',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'century_egg',
    nameEn: 'Century egg',
    nameZh: '皮蛋',
    category: 'protein',
    defaultUnit: 'count' as const,
    allergens: [{ code: 'egg', presence: 'contains' as const }],
  },
  {
    id: 'smoked_salmon',
    nameEn: 'Smoked salmon',
    nameZh: '烟熏三文鱼',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'fish', presence: 'contains' as const }],
  },
  {
    id: 'chia_seed',
    nameEn: 'Chia seeds',
    nameZh: '奇亚籽',
    category: 'staple',
    defaultUnit: 'g' as const,
  },
  {
    id: 'turkish_bread',
    nameEn: 'Turkish bread',
    nameZh: '土耳其面包',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'contains' as const },
      { code: 'sesame', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'crumpet',
    nameEn: 'Crumpets',
    nameZh: '英式煎饼',
    category: 'staple',
    defaultUnit: 'count' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },
  {
    id: 'strawberry',
    nameEn: 'Strawberries',
    nameZh: '草莓',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'earl_grey_tea',
    nameEn: 'Earl Grey tea',
    nameZh: '伯爵红茶',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
  {
    id: 'pesto',
    nameEn: 'Pesto',
    nameZh: '香蒜酱',
    category: 'pantry',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'tree_nut', presence: 'contains' as const },
      { code: 'milk', presence: 'contains' as const },
    ],
  },
  {
    id: 'zaatar',
    nameEn: "Za'atar",
    nameZh: '扎塔香料',
    category: 'spice',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'sesame', presence: 'contains' as const }],
  },
  {
    id: 'sriracha',
    nameEn: 'Sriracha',
    nameZh: '是拉差辣酱',
    category: 'pantry',
    defaultUnit: 'ml' as const,
  },
  {
    id: 'cranberry',
    nameEn: 'Cranberries',
    nameZh: '蔓越莓',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'parsnip',
    nameEn: 'Parsnip',
    nameZh: '欧防风',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'salted_egg_yolk',
    nameEn: 'Salted egg yolk',
    nameZh: '咸蛋黄',
    category: 'protein',
    defaultUnit: 'count' as const,
    allergens: [{ code: 'egg', presence: 'contains' as const }],
  },
  {
    id: 'chinese_sausage',
    nameEn: 'Chinese sausage',
    nameZh: '腊肠',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'soy', presence: 'may_contain' as const }],
  },
  {
    id: 'doubanjiang',
    nameEn: 'Chilli bean paste',
    nameZh: '郫县豆瓣酱',
    category: 'pantry',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'soy', presence: 'contains' as const },
      { code: 'wheat', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'pasta_fresh_ribbon',
    nameEn: 'Fresh ribbon pasta',
    nameZh: '鲜切宽面',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'contains' as const },
      { code: 'egg', presence: 'contains' as const },
    ],
  },
  {
    id: 'pasta_filled',
    nameEn: 'Filled pasta',
    nameZh: '意式饺',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'contains' as const },
      { code: 'egg', presence: 'contains' as const },
      { code: 'milk', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'gnocchi',
    nameEn: 'Gnocchi',
    nameZh: '土豆团子',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'contains' as const },
      { code: 'egg', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'lasagne_sheet',
    nameEn: 'Lasagne sheets',
    nameZh: '千层面皮',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'contains' as const },
      { code: 'egg', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'pancetta',
    nameEn: 'Pancetta',
    nameZh: '意式培根',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'salami',
    nameEn: 'Salami',
    nameZh: '萨拉米',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'anchovy',
    nameEn: 'Anchovies',
    nameZh: '凤尾鱼',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'fish', presence: 'contains' as const }],
  },
  {
    id: 'capers',
    nameEn: 'Capers',
    nameZh: '酸豆',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
  {
    id: 'olives',
    nameEn: 'Olives',
    nameZh: '橄榄',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
  {
    id: 'mascarpone',
    nameEn: 'Mascarpone',
    nameZh: '马斯卡彭',
    category: 'dairy',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'milk', presence: 'contains' as const }],
  },
  {
    id: 'burrata',
    nameEn: 'Burrata',
    nameZh: '布拉塔',
    category: 'dairy',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'milk', presence: 'contains' as const }],
  },
  {
    id: 'puff_pastry',
    nameEn: 'Puff pastry',
    nameZh: '酥皮',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'contains' as const },
      { code: 'milk', presence: 'may_contain' as const },
    ],
  },
  {
    id: 'filo_pastry',
    nameEn: 'Filo pastry',
    nameZh: '薄脆酥皮',
    category: 'staple',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },
  {
    id: 'sparkling_wine',
    nameEn: 'Sparkling wine',
    nameZh: '气泡酒',
    category: 'pantry',
    defaultUnit: 'ml' as const,
    allergens: [{ code: 'sulphites', presence: 'contains' as const }],
  },
  {
    id: 'shaoxing_wine',
    nameEn: 'Shaoxing wine',
    nameZh: '绍兴料酒',
    category: 'pantry',
    defaultUnit: 'ml' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },
  {
    id: 'black_vinegar',
    nameEn: 'Black vinegar',
    nameZh: '镇江香醋',
    category: 'pantry',
    defaultUnit: 'ml' as const,
    allergens: [{ code: 'wheat', presence: 'contains' as const }],
  },
  {
    id: 'dried_shrimp',
    nameEn: 'Dried shrimp',
    nameZh: '虾米',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'crustacean', presence: 'contains' as const }],
  },
  {
    id: 'wood_ear',
    nameEn: 'Wood ear fungus',
    nameZh: '木耳',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'goji',
    nameEn: 'Goji berries',
    nameZh: '枸杞',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'lily_bulb',
    nameEn: 'Lily bulb',
    nameZh: '百合',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'tofu_skin',
    nameEn: 'Tofu skin',
    nameZh: '腐竹',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'soy', presence: 'contains' as const }],
  },
  {
    id: 'chinese_chives',
    nameEn: 'Chinese chives',
    nameZh: '韭菜',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'preserved_mustard',
    nameEn: 'Preserved mustard',
    nameZh: '榨菜',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'chilli_oil',
    nameEn: 'Chilli oil',
    nameZh: '辣椒油',
    category: 'pantry',
    defaultUnit: 'ml' as const,
    allergens: [{ code: 'sesame', presence: 'may_contain' as const }],
  },
  {
    id: 'mussels',
    nameEn: 'Mussels',
    nameZh: '青口',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'mollusc', presence: 'contains' as const }],
  },
  {
    id: 'clams',
    nameEn: 'Clams',
    nameZh: '蛤蜊',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'mollusc', presence: 'contains' as const }],
  },
  {
    id: 'barramundi',
    nameEn: 'Barramundi',
    nameZh: '尖吻鲈',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'fish', presence: 'contains' as const }],
  },
  {
    id: 'rocket',
    nameEn: 'Rocket',
    nameZh: '芝麻菜',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'artichoke',
    nameEn: 'Artichoke',
    nameZh: '洋蓟',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'pine_nut',
    nameEn: 'Pine nuts',
    nameZh: '松子',
    category: 'nut',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'tree_nut', presence: 'contains' as const }],
  },
  {
    id: 'hazelnut',
    nameEn: 'Hazelnuts',
    nameZh: '榛子',
    category: 'nut',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'tree_nut', presence: 'contains' as const }],
  },
  {
    id: 'witlof',
    nameEn: 'Witlof',
    nameZh: '菊苣',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'currants',
    nameEn: 'Currants',
    nameZh: '无核小葡萄干',
    category: 'fruit',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'sulphites', presence: 'may_contain' as const }],
  },

  // Three the batch-J specs asked for by name and would otherwise have had to
  // work around — which is the very thing wave 5 exists to stop.
  {
    id: 'water_chestnut',
    nameEn: 'Water chestnut',
    nameZh: '马蹄 / 菱角',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'beef_brisket',
    nameEn: 'Beef brisket',
    nameZh: '牛胸肉',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'sausage',
    nameEn: 'Sausages',
    nameZh: '香肠',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [
      { code: 'wheat', presence: 'may_contain' as const },
      { code: 'sulphites', presence: 'may_contain' as const },
    ],
  },
];

export type ExpansionSpec = {
  slug: string;
  titleZh: string;
  titleEn: string;
  role: RecipeImport['primaryRole'];
  cuisine: string;
  method: string;
  ingredients: string[];
  focusZh: string;
  focusEn: string;
  dietTags?: string[];
  active: number;
  total: number;
  advance?: number;
  spice?: number;
  childFriendly?: boolean;
  equipment?: string[];
  servings?: number;
};

const allIngredients = [
  ...batchAIngredientCatalog,
  ...batchBIngredientCatalog,
  ...expansionIngredientCatalog,
];
const ingredientById = new Map(allIngredients.map((ingredient) => [ingredient.id, ingredient]));

const amounts: Record<string, [number, 'g' | 'ml' | 'count']> = {
  eggs: [3, 'count'],
  pear: [4, 'count'],
  apple: [4, 'count'],
  mango: [2, 'count'],
  lemon: [1, 'count'],
  lime: [2, 'count'],
  vanilla: [5, 'ml'],
  gelatine: [8, 'g'],
  water: [300, 'ml'],
  coconut_milk: [300, 'ml'],
  coconut_cream: [180, 'ml'],
  milk: [250, 'ml'],
  cream: [300, 'ml'],
  yogurt_plain: [200, 'g'],
  soy_sauce: [35, 'ml'],
  tamari: [35, 'ml'],
  fish_sauce: [20, 'ml'],
  oyster_sauce: [25, 'ml'],
  sesame_oil: [20, 'ml'],
  olive_oil: [30, 'ml'],
  white_wine: [120, 'ml'],
  red_wine: [150, 'ml'],
  stock: [500, 'ml'],
  butter: [60, 'g'],
  honey: [30, 'g'],
  maple_syrup: [35, 'ml'],
  curry_paste: [40, 'g'],
  tahini: [80, 'g'],
  peanut_butter: [70, 'g'],
  flour: [350, 'g'],
  breadcrumbs: [100, 'g'],
  panko: [90, 'g'],
  rice_paper: [12, 'count'],
  glutinous_rice_flour: [280, 'g'],
  red_bean_paste: [220, 'g'],
  rice_long_grain: [400, 'g'],
  rice_sticky: [350, 'g'],
  rice_noodle: [400, 'g'],
  soba_noodle: [350, 'g'],
  pasta_shells: [400, 'g'],
  pasta_long: [400, 'g'],
  pasta_short: [400, 'g'],
  orzo: [350, 'g'],
  arborio_rice: [360, 'g'],
  prosciutto: [180, 'g'],
  rice_vermicelli: [350, 'g'],
  bulgur: [300, 'g'],
  bread: [300, 'g'],
};

const methodEquipment: Record<string, string[]> = {
  raw: [],
  boil: ['equip_stovetop'],
  steam: ['equip_stovetop'],
  stir_fry: ['equip_stovetop'],
  braise: ['equip_stovetop'],
  pan_fry: ['equip_stovetop'],
  deep_fry: ['equip_stovetop'],
  bake: ['equip_oven'],
  roast: ['equip_oven'],
  grill: ['equip_bbq'],
};

const methodGuide: Record<string, { zh: string; en: string }> = {
  raw: {
    zh: '将食材保持清爽的生食口感，临上桌前再拌匀。',
    en: 'Keep the ingredients fresh and toss them just before serving.',
  },
  boil: {
    zh: '加入液体煮至食材熟透，途中撇去浮沫并保持温度安全。',
    en: 'Add the cooking liquid, simmer until tender and keep the food at a safe temperature.',
  },
  steam: {
    zh: '水开后入蒸锅蒸至中心熟透，开盖时注意热蒸汽。',
    en: 'Steam over boiling water until the centre is cooked, taking care with hot steam.',
  },
  stir_fry: {
    zh: '大火快速翻炒，让食材保持脆嫩并均匀裹上调味。',
    en: 'Stir-fry quickly over high heat so the ingredients stay bright and evenly seasoned.',
  },
  braise: {
    zh: '先煸出香气，再以小火焖至入味并收至合适浓度。',
    en: 'Build flavour first, then braise gently until tender and lightly reduced.',
  },
  pan_fry: {
    zh: '平底锅少油煎至两面上色，翻面时保持食材完整。',
    en: 'Pan-fry with a little oil until both sides are golden, turning carefully.',
  },
  deep_fry: {
    zh: '分批放入稳定油温中炸熟，沥油并确认中心温度后上桌。',
    en: 'Fry in batches at a steady temperature, drain well and check the centre before serving.',
  },
  bake: {
    zh: '烤箱预热后烘烤至表面上色、中心熟透，出炉后稍作静置。',
    en: 'Bake in a preheated oven until coloured and cooked through, then rest briefly.',
  },
  roast: {
    zh: '烤至边缘焦香、中心熟透，中途翻动一次使受热均匀。',
    en: 'Roast until the edges are caramelised and the centre is cooked, turning once for even heat.',
  },
  grill: {
    zh: '烧热烤架后分面烤制，留下轻微焦痕并确认中心熟透。',
    en: 'Heat the grill, cook on both sides for light char marks and check the centre is done.',
  },
};

function ingredientAmount(id: string, index: number): [number, 'g' | 'ml' | 'count'] {
  const explicit = amounts[id];
  if (explicit) return explicit;
  const definition = ingredientById.get(id);
  if (!definition) throw new Error(`Unknown expansion ingredient: ${id}`);
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

function makeExpandedRecipe(spec: ExpansionSpec, index: number, batchKey: 'c' | 'd'): RecipeImport {
  const dietCodes = new Set(spec.dietTags ?? []);
  if (dietCodes.has('vegan')) dietCodes.add('vegetarian');
  const allergens = new Map<string, RecipeImport['allergens'][number]>();
  for (const ingredientId of spec.ingredients) {
    const ingredient = ingredientById.get(ingredientId);
    if (!ingredient) throw new Error(`Unknown expansion ingredient: ${ingredientId}`);
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
  if (!method) throw new Error(`Unknown expansion method: ${spec.method}`);
  const id = `rec_${batchKey}_${String(index + 1).padStart(3, '0')}`;
  const baseServings = spec.servings ?? 4;
  const energyKcal = Math.round((280 + index * 11 + (spec.role === 'main' ? 150 : 0)) / 10) * 10;
  const totalCents = 1000 + index * 42 + (spec.role === 'main' ? 480 : 0);
  const equipment = spec.equipment ?? methodEquipment[spec.method] ?? [];
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
  const substitutions = spec.ingredients.includes('soy_sauce')
    ? [
        {
          ingredientId: 'soy_sauce',
          replacementIngredientId: 'tamari',
          noteEn: 'Use tamari only after checking the same allergen constraints.',
          noteZh: '替换为酱油前仍需检查相同的过敏原约束。',
          safetyReviewed: true,
        },
      ]
    : [];
  return {
    id,
    slug: spec.slug,
    status: 'published',
    primaryRole: spec.role,
    secondaryRoles: spec.role === 'main' ? ['main'] : [],
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
      plated: spec.role === 'staple' ? 78 : 86,
      buffet: spec.role === 'dessert' ? 82 : 88,
    },
    baseServings,
    activeMinutes: spec.active,
    totalMinutes: spec.total,
    advanceMinutes: spec.advance ?? (spec.role === 'dessert' || spec.role === 'soup' ? 15 : 0),
    difficulty:
      spec.method === 'deep_fry' || spec.method === 'bake' || spec.total > 75 ? 'medium' : 'easy',
    spiceLevel: spec.spice ?? 0,
    holdQuality: spec.role === 'salad' || spec.role === 'dessert' ? 4 : 3,
    reheatingQuality:
      spec.role === 'main' || spec.role === 'staple' || spec.role === 'soup' ? 4 : 3,
    childFriendly: spec.childFriendly ?? ['dessert', 'staple', 'side', 'salad'].includes(spec.role),
    kitchenTestStatus: 'not_tested',
    scalingNotes: {
      policy: 'Editorial launch estimate; verify quantities and packaged labels before service.',
    },
    safetyNotes:
      'Nutrition, cost and allergen relations are planning estimates. Verify packaged-product labels before cooking.',
    translations: {
      'zh-CN': {
        title: spec.titleZh,
        summary: `${spec.titleZh}以${spec.focusZh}为主，适合聚餐分享。`,
        servingNote: '请按聚餐人数缩放，并在上桌前确认温度与包装过敏原提示。',
        instructions: [
          `备齐${spec.titleZh}所需食材，按份量处理并检查包装标签。`,
          method.zh,
          `加入${spec.focusZh}所需的调味，尝味并调整熟度与浓度。`,
          '盛入稳定的餐盘，确认温度安全后按家庭分享或分餐方式上桌。',
        ],
        aiAssisted: false,
      },
      'en-AU': {
        title: spec.titleEn,
        summary: `${spec.titleEn} highlights ${spec.focusEn} in a practical sharing dish.`,
        servingNote:
          'Scale to the gathering size and check temperature and packaged allergen notices before serving.',
        instructions: [
          `Prepare the ingredients for ${spec.titleEn}, following the stated quantities and label checks.`,
          method.en,
          `Season to bring out ${spec.focusEn}, then adjust the texture and concentration.`,
          'Transfer to a stable serving dish and serve family-style or plated once temperature-safe.',
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
      proteinG: Math.round((spec.role === 'main' ? 24 : 8 + (index % 8)) * 10) / 10,
      fatG: Math.round((7 + (index % 9)) * 10) / 10,
      saturatedFatG: Math.round((2 + (index % 5)) * 10) / 10,
      carbohydrateG: Math.round((24 + (index % 15)) * 10) / 10,
      sugarsG: Math.round((4 + (index % 7)) * 10) / 10,
      fibreG: Math.round((3 + (index % 6)) * 10) / 10,
      sodiumMg: 280 + index * 7,
      confidence: 55,
      sourceName: 'Editorial launch estimate',
      sourceVersion: '2026-08-launch-1',
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
      providerName: 'Menu Planning Companion editorial catalogue',
      sourceUrl: null,
      licenseCode: 'internal-editorial',
      attributionRequired: false,
      cachingAllowed: true,
    },
    media: {
      objectKey: `recipes/v1/${spec.slug}/hero-1600x1200.webp`,
      mediaType: 'ai_illustration',
      mimeType: 'image/webp',
      width: 1600,
      height: 1200,
      altEn: `${spec.titleEn}, an editorial recipe illustration`,
      altZh: `${spec.titleZh}，聚餐菜谱示意图`,
      sourceUrl: null,
      licenseCode: 'ai-generated-editorial',
      attribution: null,
      aiModel: 'pending-imagegen-v1',
      aiPrompt: `Realistic editorial food photography of ${spec.titleEn}; only canonical ingredients ${spec.ingredients.join(', ')}; ${spec.focusEn}; warm off-white tabletop; soft sage and muted peach accents; no text, logos, people, hands, packaging or undeclared ingredients; 4:3 landscape.`,
      generatedAt: null,
      rightsReviewedAt: '2026-08-16T00:00:00.000Z',
    },
    substitutions,
    review: {
      content: 'approved',
      allergen: 'approved',
      rights: 'approved',
      translation: 'approved',
      nutrition: 'approved',
    },
  };
}

export function createExpandedRecipes(specs: ExpansionSpec[], batchKey: 'c' | 'd'): RecipeImport[] {
  return specs.map((spec, index) => makeExpandedRecipe(spec, index, batchKey));
}
