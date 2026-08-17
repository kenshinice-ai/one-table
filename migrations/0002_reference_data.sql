-- Initial reference data. Application-generated ULIDs can replace these stable seed IDs later.
INSERT OR IGNORE INTO allergens (id, code, name_en, name_zh, fsanz_declaration_name, display_order) VALUES
('alg_wheat', 'wheat', 'Wheat', '小麦', 'wheat', 10),
('alg_fish', 'fish', 'Fish', '鱼类', 'fish', 20),
('alg_crustacean', 'crustacean', 'Crustacean', '甲壳类', 'crustacean', 30),
('alg_mollusc', 'mollusc', 'Mollusc', '软体动物', 'mollusc', 40),
('alg_egg', 'egg', 'Egg', '鸡蛋', 'egg', 50),
('alg_milk', 'milk', 'Milk', '牛奶', 'milk', 60),
('alg_lupin', 'lupin', 'Lupin', '羽扇豆', 'lupin', 70),
('alg_peanut', 'peanut', 'Peanut', '花生', 'peanut', 80),
('alg_soy', 'soy', 'Soy', '大豆', 'soy', 90),
('alg_sesame', 'sesame', 'Sesame', '芝麻', 'sesame', 100),
('alg_almond', 'almond', 'Almond', '杏仁', 'almond', 110),
('alg_brazil_nut', 'brazil_nut', 'Brazil nut', '巴西坚果', 'Brazil nut', 120),
('alg_cashew', 'cashew', 'Cashew', '腰果', 'cashew', 130),
('alg_hazelnut', 'hazelnut', 'Hazelnut', '榛子', 'hazelnut', 140),
('alg_macadamia', 'macadamia', 'Macadamia', '夏威夷果', 'macadamia', 150),
('alg_pecan', 'pecan', 'Pecan', '碧根果', 'pecan', 160),
('alg_pistachio', 'pistachio', 'Pistachio', '开心果', 'pistachio', 170),
('alg_pine_nut', 'pine_nut', 'Pine nut', '松子', 'pine nut', 180),
('alg_walnut', 'walnut', 'Walnut', '核桃', 'walnut', 190),
('alg_barley', 'barley', 'Barley containing gluten', '含麸质大麦', 'barley', 200),
('alg_oats', 'oats', 'Oats containing gluten', '含麸质燕麦', 'oats', 210),
('alg_rye', 'rye', 'Rye containing gluten', '含麸质黑麦', 'rye', 220),
('alg_sulphites', 'sulphites', 'Sulphites', '亚硫酸盐', 'sulphites', 230);

INSERT OR IGNORE INTO recipe_roles (id, code, name_en, name_zh, display_order) VALUES
('role_snack', 'snack', 'Snack', '小食', 10),
('role_starter', 'starter', 'Starter', '前菜', 20),
('role_soup', 'soup', 'Soup', '汤', 30),
('role_main', 'main', 'Main', '主菜', 40),
('role_side', 'side', 'Side', '配菜', 50),
('role_staple', 'staple', 'Staple', '主食', 60),
('role_salad', 'salad', 'Salad', '沙拉', 70),
('role_dessert', 'dessert', 'Dessert', '甜品', 80);

INSERT OR IGNORE INTO cooking_methods (id, code, name_en, name_zh, display_order) VALUES
('method_raw', 'raw', 'No-cook', '生食/免烹饪', 10),
('method_steam', 'steam', 'Steam', '蒸', 20),
('method_boil', 'boil', 'Boil', '煮', 30),
('method_braise', 'braise', 'Braise', '炖/焖', 40),
('method_stir_fry', 'stir_fry', 'Stir-fry', '炒', 50),
('method_pan_fry', 'pan_fry', 'Pan-fry', '煎', 60),
('method_deep_fry', 'deep_fry', 'Deep-fry', '炸', 70),
('method_roast', 'roast', 'Roast', '烤', 80),
('method_grill', 'grill', 'Grill or BBQ', '烧烤/BBQ', 90),
('method_bake', 'bake', 'Bake', '烘焙', 100);

INSERT OR IGNORE INTO equipment (id, code, name_en, name_zh) VALUES
('equip_stovetop', 'stovetop', 'Stovetop', '炉灶'),
('equip_oven', 'oven', 'Oven', '烤箱'),
('equip_bbq', 'bbq', 'BBQ', '烧烤炉'),
('equip_air_fryer', 'air_fryer', 'Air fryer', '空气炸锅'),
('equip_rice_cooker', 'rice_cooker', 'Rice cooker', '电饭煲'),
('equip_blender', 'blender', 'Blender', '搅拌机'),
('equip_pressure_cooker', 'pressure_cooker', 'Pressure cooker', '压力锅');


INSERT OR IGNORE INTO cuisines (id, code, name_en, name_zh, display_order) VALUES
('cuisine_chinese_northern', 'chinese_northern', 'Northern Chinese', '中国北方菜', 10),
('cuisine_chinese_sichuan', 'chinese_sichuan', 'Sichuan Chinese', '川菜', 20),
('cuisine_chinese_cantonese', 'chinese_cantonese', 'Cantonese Chinese', '粤菜', 30),
('cuisine_chinese_jiangnan', 'chinese_jiangnan', 'Jiangnan Chinese', '江南菜', 40),
('cuisine_japanese', 'japanese', 'Japanese', '日本料理', 50),
('cuisine_korean', 'korean', 'Korean', '韩国料理', 60),
('cuisine_southeast_asian', 'southeast_asian', 'Southeast Asian', '东南亚料理', 70),
('cuisine_indian', 'indian', 'Indian', '印度料理', 80),
('cuisine_mediterranean', 'mediterranean', 'Mediterranean', '地中海料理', 90),
('cuisine_italian', 'italian', 'Italian', '意大利料理', 100),
('cuisine_french', 'french', 'French', '法国料理', 110),
('cuisine_australian_modern', 'australian_modern', 'Modern Australian', '现代澳大利亚料理', 120),
('cuisine_western_home', 'western_home', 'Western home cooking', '西式家常菜', 130),
('cuisine_middle_eastern', 'middle_eastern', 'Middle Eastern', '中东料理', 140),
('cuisine_latin_american', 'latin_american', 'Latin American', '拉丁美洲料理', 150),
('cuisine_other', 'other', 'Other', '其他', 160);

INSERT OR IGNORE INTO diet_tags (id, code, name_en, name_zh, rule_json, is_medical) VALUES
('diet_vegetarian', 'vegetarian', 'Vegetarian', '素食', '{"excludes":["meat","fish","shellfish"]}', 0),
('diet_vegan', 'vegan', 'Vegan', '纯素', '{"excludes":["animal_products"]}', 0),
('diet_gluten_free_adaptable', 'gluten_free_adaptable', 'Gluten-free adaptable', '可调整为无麸质', '{"adaptable":true}', 0),
('diet_dairy_free_adaptable', 'dairy_free_adaptable', 'Dairy-free adaptable', '可调整为无乳制品', '{"adaptable":true}', 0);
