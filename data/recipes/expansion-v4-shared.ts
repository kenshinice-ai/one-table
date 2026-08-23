/**
 * Wave-4 ingredients: the celebration tier.
 *
 * Everything here is something a host buys for one particular evening — a
 * lobster, a rack of lamb, a tin of caviar — plus the handful of supporting
 * items those dishes need and the catalogue did not yet have. Prices are not
 * modelled here; each recipe states its own cost, because these ingredients are
 * exactly the ones the course-based fallback gets wrong by an order of
 * magnitude.
 */
export const expansionV4IngredientCatalog = [
  // --- Celebration proteins ---
  {
    id: 'lobster',
    nameEn: 'Lobster',
    nameZh: '龙虾',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'crustacean', presence: 'contains' as const }],
  },
  {
    id: 'king_crab',
    nameEn: 'King crab legs',
    nameZh: '帝王蟹脚',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'crustacean', presence: 'contains' as const }],
  },
  {
    id: 'crab_meat',
    nameEn: 'Crab meat',
    nameZh: '蟹肉',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'crustacean', presence: 'contains' as const }],
  },
  {
    id: 'abalone',
    nameEn: 'Abalone',
    nameZh: '鲍鱼',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'mollusc', presence: 'contains' as const }],
  },
  {
    id: 'oyster',
    nameEn: 'Oysters',
    nameZh: '生蚝',
    category: 'protein',
    defaultUnit: 'count' as const,
    allergens: [{ code: 'mollusc', presence: 'contains' as const }],
  },
  {
    id: 'dried_scallop',
    nameEn: 'Dried scallop',
    nameZh: '瑶柱',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'mollusc', presence: 'contains' as const }],
  },
  {
    id: 'sea_cucumber',
    nameEn: 'Sea cucumber',
    nameZh: '海参',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'whole_fish',
    nameEn: 'Whole fish',
    nameZh: '整条鲜鱼',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'fish', presence: 'contains' as const }],
  },
  {
    id: 'caviar',
    nameEn: 'Caviar',
    nameZh: '鱼子酱',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'fish', presence: 'contains' as const }],
  },
  {
    id: 'wagyu_beef',
    nameEn: 'Wagyu beef',
    nameZh: '和牛',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'dry_aged_beef',
    nameEn: 'Dry-aged beef',
    nameZh: '熟成牛排',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'beef_short_rib',
    nameEn: 'Beef short rib',
    nameZh: '牛肋条',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'lamb_rack',
    nameEn: 'Rack of lamb',
    nameZh: '羊排',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'lamb_shoulder',
    nameEn: 'Lamb shoulder',
    nameZh: '羊肩肉',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'lamb_whole',
    nameEn: 'Whole lamb',
    nameZh: '整只羔羊',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'turkey',
    nameEn: 'Turkey breast',
    nameZh: '火鸡胸',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'ham_leg',
    nameEn: 'Bone-in ham',
    nameZh: '带骨火腿',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'pork_belly',
    nameEn: 'Pork belly',
    nameZh: '五花肉',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'pork_hock',
    nameEn: 'Pork hock',
    nameZh: '猪手',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'foie_gras',
    nameEn: 'Foie gras',
    nameZh: '鹅肝',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
  {
    id: 'tofu_soft',
    nameEn: 'Silken tofu',
    nameZh: '嫩豆腐',
    category: 'protein',
    defaultUnit: 'g' as const,
    allergens: [{ code: 'soy', presence: 'contains' as const }],
  },

  // --- Luxury pantry ---
  {
    id: 'truffle',
    nameEn: 'Black truffle',
    nameZh: '黑松露',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },
  {
    id: 'saffron',
    nameEn: 'Saffron',
    nameZh: '藏红花',
    category: 'spice',
    defaultUnit: 'g' as const,
  },

  // --- Produce ---
  {
    id: 'winter_melon',
    nameEn: 'Winter melon',
    nameZh: '冬瓜',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  { id: 'taro', nameEn: 'Taro', nameZh: '芋头', category: 'vegetable', defaultUnit: 'g' as const },
  {
    id: 'brussels_sprouts',
    nameEn: 'Brussels sprouts',
    nameZh: '球芽甘蓝',
    category: 'vegetable',
    defaultUnit: 'g' as const,
  },
  {
    id: 'peach',
    nameEn: 'Peaches',
    nameZh: '桃子',
    category: 'fruit',
    defaultUnit: 'count' as const,
  },
  {
    id: 'melon',
    nameEn: 'Rockmelon',
    nameZh: '蜜瓜',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'lemongrass',
    nameEn: 'Lemongrass',
    nameZh: '香茅',
    category: 'herb',
    defaultUnit: 'g' as const,
  },

  // --- Pantry ---
  {
    id: 'vermicelli',
    nameEn: 'Mung bean vermicelli',
    nameZh: '粉丝',
    category: 'staple',
    defaultUnit: 'g' as const,
  },
  {
    id: 'dried_fruit',
    nameEn: 'Mixed dried fruit',
    nameZh: '混合果干',
    category: 'fruit',
    defaultUnit: 'g' as const,
  },
  {
    id: 'mixed_spice',
    nameEn: 'Mixed spice',
    nameZh: '混合香料',
    category: 'spice',
    defaultUnit: 'g' as const,
  },
  {
    id: 'caster_sugar',
    nameEn: 'Caster sugar',
    nameZh: '细砂糖',
    category: 'pantry',
    defaultUnit: 'g' as const,
  },

  // --- Named on the plate, so named on the list ---
  // A shopping list is read at a counter. "Rice" in front of a risotto and
  // "Ham" in front of a prosciutto both send someone home with the wrong thing
  // and the dish fails in their kitchen, not in ours.
  {
    id: 'arborio_rice',
    nameEn: 'Arborio rice',
    nameZh: '意式烩饭米',
    category: 'staple',
    defaultUnit: 'g' as const,
  },
  {
    id: 'prosciutto',
    nameEn: 'Prosciutto',
    nameZh: '意式生火腿',
    category: 'protein',
    defaultUnit: 'g' as const,
  },
];
