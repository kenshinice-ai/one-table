# 节庆大菜 100 道 — 内容方案与生图任务

> **状态：已实现并上线（700 道）。** 四项判断均获批：逐道成本按墨尔本零售估、新增 `feast` 场合、烤全羊按 20 人份入库、配额按本方案。
> 生图任务已拆成两份独立 prompt：[菜品 100 张](IMAGE_PROMPT_1_BATCH_I_DISHES.md) 与 [食材 88 张](IMAGE_PROMPT_2_INGREDIENTS.md)。

> 目标：把「节庆桌」从能配出来，做到值得配。现有 600 道里 200 道带场合标签，分布见下；这 100 道按缺口投放，并新开一层大菜。

## 1. 先说三个判断

**判断一：成本必须逐道给，不能沿用角色估价。** 现有生成器按角色定价（`main` 约 A$16、其余 A$10.5）。一只龙虾按 A$16 入库，会让预算筛选和「预计总价」当场说谎——而这两处正是商场投放最看重的数字。新批次的 spec 增加 `costCents` 必填项，按墨尔本零售价逐道估，并在文档里标明**为规划估值、非报价**（沿用现有 disclaimer 口径）。这是这批内容里最容易被忽略、后果最严重的一处。

**判断二：大菜需要自己的场合，不能硬塞进某个节日。** 熟成牛排、和牛、龙虾、烤全羊不属于春节也不属于圣诞，它属于「今晚有正事」。新增场合 `feast`（宴请／盛宴），可与节日标签并存——一道蒜蓉开边龙虾同时挂 `feast` 和 `cny`，在两处都出现。九个场合扩到十个，其余机制（筛选、chips、租户覆盖、海报链接）不改一行。

**判断三：烤全羊按真实份量入库，不假装它能配六人桌。** 全羊 `servings: 20`，成本 A$450。planner 支持到 30 人，20 人以下选它会按比例缩放——物理上讲不通，但这是目录的诚实表达：**它就是给 20 人桌的**。同时提供烤羊腿（8 人）、烤羊肩（8 人）、香草羊排（4 人）三档降级，让六人桌也有硬菜可上。

## 2. 配额分配（按缺口，不按平均）

当前分布：

| 场合          | 小食 | 前菜 | 汤  | 沙拉 | 主菜 | 配菜 | 主食 | 甜品 | 合计 |
| ------------- | ---- | ---- | --- | ---- | ---- | ---- | ---- | ---- | ---- |
| cny           | 10   | 4    | 3   | 1    | 17   | 5    | 3    | 10   | 53   |
| mid_autumn    | 0    | 0    | 0   | 0    | 3    | 1    | 0    | 7    | 11   |
| christmas     | 4    | 3    | 1   | 0    | 5    | 3    | 0    | 5    | 21   |
| easter        | 0    | 0    | 0   | 0    | 0    | 0    | 0    | 0    | 0    |
| bbq           | 5    | 2    | 0   | 3    | 5    | 2    | 1    | 2    | 20   |
| party         | 29   | 3    | 0   | 1    | 7    | 3    | 1    | 0    | 44   |
| afternoon_tea | 8    | 0    | 0   | 0    | 1    | 0    | 0    | 27   | 36   |

投放：**feast 24 · easter 14 · mid_autumn 14 · christmas 16 · cny 12 · 跨场合补位 20 = 100**

理由：easter 为零（澳洲复活节是四天长周末，家宴刚需）；mid_autumn 只有主菜和甜品，配不出一桌；christmas 汤 1、主食 0、沙拉 0，而澳洲圣诞在盛夏，冷盘沙拉才是主角；cny 数量够但缺硬菜；party 有 29 道小食却只有 7 道主菜。

## 3. 一百道清单

成本为 4 人份规划估值（澳元，墨尔本零售），另注份数者除外。

### A. feast 宴请大菜（24）

| #   | 中文               | English                         | role    | 菜系      | 方式    | 主料                                        | 估价 |
| --- | ------------------ | ------------------------------- | ------- | --------- | ------- | ------------------------------------------- | ---- |
| 1   | 熟成肋眼配红酒汁   | Dry-Aged Rib-Eye, Red Wine Jus  | main    | french    | pan_fry | dry_aged_beef, butter, rosemary, red_wine   | 95   |
| 2   | 炭烤和牛西冷       | Grilled Wagyu Sirloin           | main    | japanese  | grill   | wagyu_beef, soy_sauce, spring_onion         | 120  |
| 3   | 蒜香黄油烤龙虾     | Butter-Garlic Grilled Lobster   | main    | french    | grill   | lobster, butter, garlic, parsley, lemon     | 110  |
| 4   | 芝士焗龙虾         | Baked Lobster with Cheese       | main    | french    | bake    | lobster, cream, parmesan, dijon_mustard     | 125  |
| 5   | 迷迭香慢烤羊腿     | Slow-Roast Lamb Leg             | main    | mediter.  | roast   | lamb_leg, rosemary, garlic, potato          | 62   |
| 6   | 香草脆皮羊排       | Herb-Crusted Rack of Lamb       | main    | french    | roast   | lamb_rack, parsley, dijon_mustard, garlic   | 78   |
| 7   | 炭火烤全羊         | Whole Spit-Roast Lamb (20 人)   | main    | middle_e. | grill   | lamb_whole, cumin, garlic, lemon            | 450  |
| 8   | 红酒炖牛肋条       | Red-Wine Braised Short Ribs     | main    | french    | braise  | beef_short_rib, red_wine, carrot, thyme     | 58   |
| 9   | 帝王蟹脚配柠檬黄油 | King Crab Legs, Lemon Butter    | main    | other     | steam   | king_crab, butter, lemon, parsley           | 135  |
| 10  | 黑松露野菌烩饭     | Truffle Mushroom Risotto        | main    | italian   | simmer  | rice_long_grain, truffle, button_mushrooms  | 68   |
| 11  | 生蚝配红葱醋汁     | Oysters, Shallot Vinegar        | starter | french    | raw     | oyster, balsamic_vinegar, onion, lemon      | 48   |
| 12  | 和牛他他           | Wagyu Tartare                   | starter | french    | raw     | wagyu_beef, eggs, dijon_mustard, onion      | 65   |
| 13  | 鱼子酱薄饼         | Caviar on Blini                 | starter | other     | pan_fry | caviar, flour, cream, eggs                  | 150  |
| 14  | 蒜香黄油焗扇贝     | Scallops Baked in Garlic Butter | starter | french    | bake    | scallops, butter, garlic, parsley           | 42   |
| 15  | 蚝油扒鲍鱼         | Braised Abalone, Oyster Sauce   | starter | cantonese | braise  | abalone, oyster_sauce, ginger, spring_onion | 95   |
| 16  | 熟成牛肉薄切       | Dry-Aged Beef Carpaccio         | starter | italian   | raw     | dry_aged_beef, olive_oil, lemon, parmesan   | 55   |
| 17  | 瑶柱冬瓜盅         | Winter Melon & Dried Scallop    | soup    | cantonese | simmer  | dried_scallop, winter_melon, chicken_breast | 36   |
| 18  | 海参鸡汤           | Sea Cucumber Chicken Soup       | soup    | northern  | simmer  | sea_cucumber, chicken_thigh, ginger         | 58   |
| 19  | 龙虾浓汤           | Lobster Bisque                  | soup    | french    | simmer  | lobster, cream, tomato_paste, butter        | 52   |
| 20  | 黑松露薯泥         | Truffle Mashed Potato           | side    | french    | boil    | potato, truffle, butter, cream              | 34   |
| 21  | 藏红花海鲜饭       | Saffron Seafood Rice            | staple  | mediter.  | simmer  | rice_long_grain, saffron, prawns, scallops  | 56   |
| 22  | 石榴橙香沙拉       | Pomegranate & Orange Salad      | salad   | middle_e. | raw     | pomegranate, orange, spinach, pistachio     | 22   |
| 23  | 黑巧慕斯           | Dark Chocolate Mousse           | dessert | french    | chill   | dark_chocolate, cream, eggs, caster_sugar   | 28   |
| 24  | 焦糖布蕾塔         | Crème Brûlée Tart               | dessert | french    | bake    | cream, eggs, caster_sugar, flour, butter    | 26   |

### B. easter 复活节（14 · 澳洲四月长周末）

| #   | 中文           | English                      | role    | 菜系      | 方式   | 主料                                          | 估价 |
| --- | -------------- | ---------------------------- | ------- | --------- | ------ | --------------------------------------------- | ---- |
| 25  | 蜜汁烤羊肩     | Honey-Glazed Lamb Shoulder   | main    | aus_mod   | roast  | lamb_shoulder, honey, garlic, rosemary        | 54   |
| 26  | 薄荷酱烤羊排   | Lamb Cutlets with Mint Sauce | main    | west_home | grill  | lamb_rack, mint, balsamic_vinegar, honey      | 68   |
| 27  | 柠檬香草烤鸡   | Lemon Herb Roast Chicken     | main    | french    | roast  | chicken_thigh, thyme, lemon, butter, garlic   | 26   |
| 28  | 烟熏三文鱼盘   | Smoked Salmon Platter        | starter | west_home | raw    | salmon_fillet, cream, lemon, dill, onion      | 38   |
| 29  | 复活节十字包   | Hot Cross Buns               | snack   | west_home | bake   | flour, dried_fruit, mixed_spice, butter, milk | 14   |
| 30  | 巧克力鸟巢慕斯 | Chocolate Nest Mousse        | dessert | west_home | chill  | dark_chocolate, cream, eggs                   | 22   |
| 31  | 复活节糖霜曲奇 | Easter Sugar Cookies         | snack   | west_home | bake   | flour, butter, caster_sugar, eggs             | 11   |
| 32  | 春日豌豆浓汤   | Spring Pea Soup              | soup    | french    | simmer | peas, mint, cream, stock                      | 16   |
| 33  | 烤根菜拼盘     | Roast Root Vegetables        | side    | west_home | roast  | carrot, pumpkin, potato, thyme                | 14   |
| 34  | 芦笋配荷兰酱   | Asparagus with Hollandaise   | side    | french    | boil   | asparagus, butter, eggs, lemon                | 24   |
| 35  | 苹果核桃沙拉   | Apple & Walnut Salad         | salad   | west_home | raw    | apple, walnuts, spinach, olive_oil            | 16   |
| 36  | 迷迭香烤土豆   | Rosemary Roast Potatoes      | staple  | mediter.  | roast  | potato, rosemary, olive_oil, garlic           | 10   |
| 37  | 柠檬凝乳挞     | Lemon Curd Tart              | dessert | french    | bake   | lemon, eggs, butter, caster_sugar, flour      | 18   |
| 38  | 火腿芥末卷     | Ham & Mustard Rolls          | snack   | west_home | bake   | ham, dijon_mustard, flour, butter             | 16   |

### C. mid_autumn 中秋（14 · 补齐小食/前菜/汤/主食/沙拉）

| #   | 中文           | English                             | role    | 菜系      | 方式     | 主料                                          | 估价 |
| --- | -------------- | ----------------------------------- | ------- | --------- | -------- | --------------------------------------------- | ---- |
| 39  | 桂花糯米藕     | Osmanthus Lotus Root                | snack   | jiangnan  | steam    | lotus_root, rice_sticky, osmanthus            | 16   |
| 40  | 蛋黄莲蓉月饼   | Lotus Paste & Salted Yolk Mooncake  | snack   | cantonese | bake     | lotus_seed_paste, eggs, flour, honey          | 22   |
| 41  | 咸蛋黄焗南瓜   | Salted-Yolk Pumpkin                 | side    | cantonese | deep_fry | pumpkin, eggs, flour, butter                  | 14   |
| 42  | 桂花酒酿圆子羹 | Osmanthus Rice Ball Soup            | soup    | jiangnan  | boil     | rice_sticky, osmanthus, brown_sugar           | 12   |
| 43  | 冬瓜火腿汤     | Winter Melon & Ham Soup             | soup    | cantonese | simmer   | winter_melon, ham, ginger, stock              | 18   |
| 44  | 蟹粉豆腐       | Crab Meat with Soft Tofu            | main    | jiangnan  | braise   | crab_meat, tofu_soft, ginger, stock           | 46   |
| 45  | 姜葱蒸大蟹     | Steamed Crab, Ginger & Spring Onion | main    | jiangnan  | steam    | crab_meat, ginger, rice_vinegar, spring_onion | 68   |
| 46  | 板栗烧鸡       | Chestnut Braised Chicken            | main    | northern  | braise   | chicken_thigh, chestnut, soy_sauce, ginger    | 28   |
| 47  | 芋头扣肉       | Taro & Pork Belly                   | main    | cantonese | steam    | pork_belly, taro, soy_sauce, star_anise       | 34   |
| 48  | 蒜蓉粉丝蒸扇贝 | Steamed Scallops, Garlic Vermicelli | starter | cantonese | steam    | scallops, vermicelli, garlic, spring_onion    | 32   |
| 49  | 蜜柚蜂蜜冻     | Pomelo Honey Jelly                  | dessert | cantonese | chill    | orange, honey, gelatine                       | 14   |
| 50  | 黑芝麻汤圆     | Black Sesame Tangyuan               | dessert | jiangnan  | boil     | rice_sticky, black_sesame, caster_sugar       | 10   |
| 51  | 桂花糯米饭     | Osmanthus Sticky Rice               | staple  | jiangnan  | steam    | rice_sticky, osmanthus, dried_fruit           | 14   |
| 52  | 柚香鸡丝沙拉   | Pomelo & Chicken Salad              | salad   | cantonese | raw      | orange, chicken_breast, mint, sesame_oil      | 18   |

### D. christmas 圣诞（16 · 南半球盛夏版）

| #   | 中文               | English                     | role    | 菜系      | 方式    | 主料                                     | 估价 |
| --- | ------------------ | --------------------------- | ------- | --------- | ------- | ---------------------------------------- | ---- |
| 53  | 香草烤火鸡胸       | Roast Turkey Breast         | main    | west_home | roast   | turkey, butter, thyme, garlic            | 52   |
| 54  | 蜜糖烤火腿         | Glazed Christmas Ham        | main    | aus_mod   | roast   | ham_leg, honey, dijon_mustard, orange    | 68   |
| 55  | 冷盘大虾配鸡尾酒汁 | Prawn Cocktail Platter      | starter | aus_mod   | boil    | prawns, tomato_paste, cream, lemon       | 44   |
| 56  | 冰镇海鲜冷盘       | Seafood Platter on Ice      | starter | aus_mod   | chill   | prawns, oyster, scallops, lemon          | 88   |
| 57  | 莓果酱汁烤鸭胸     | Duck Breast with Berries    | main    | french    | pan_fry | duck_breast, berries, red_wine, butter   | 48   |
| 58  | 栗子火腿浓汤       | Chestnut & Ham Soup         | soup    | french    | simmer  | chestnut, ham, cream, stock              | 24   |
| 59  | 石榴圣诞沙拉       | Christmas Pomegranate Salad | salad   | aus_mod   | raw     | spinach, pomegranate, walnuts, olive_oil | 18   |
| 60  | 芒果牛油果沙拉     | Mango & Avocado Salad       | salad   | aus_mod   | raw     | mango, avocado, lemon, mint              | 16   |
| 61  | 蒜香黄油手撕包     | Garlic Butter Pull-Apart    | staple  | west_home | bake    | flour, butter, garlic, parsley           | 12   |
| 62  | 香草黄油土豆泥     | Herb Butter Mash            | staple  | west_home | boil    | potato, butter, cream, thyme             | 12   |
| 63  | 蜂蜜芥末烤胡萝卜   | Honey Mustard Carrots       | side    | west_home | roast   | carrot, honey, dijon_mustard, thyme      | 10   |
| 64  | 培根球芽甘蓝       | Brussels Sprouts with Bacon | side    | west_home | pan_fry | brussels_sprouts, bacon, butter          | 16   |
| 65  | 澳式帕芙洛娃       | Pavlova with Summer Berries | dessert | aus_mod   | bake    | eggs, caster_sugar, cream, berries       | 22   |
| 66  | 圣诞蒸布丁         | Christmas Pudding           | dessert | west_home | steam   | dried_fruit, flour, butter, mixed_spice  | 20   |
| 67  | 姜饼人             | Gingerbread People          | snack   | west_home | bake    | flour, ginger, honey, butter             | 12   |
| 68  | 莓果芝士小塔       | Berry Cheese Tartlets       | snack   | west_home | bake    | flour, cream, berries, caster_sugar      | 16   |

### E. cny 春节硬菜（12）

| #   | 中文         | English                        | role    | 菜系      | 方式     | 主料                                        | 估价 |
| --- | ------------ | ------------------------------ | ------- | --------- | -------- | ------------------------------------------- | ---- |
| 69  | 鲍鱼扒时蔬   | Braised Abalone with Greens    | main    | cantonese | braise   | abalone, oyster_sauce, napa_cabbage, ginger | 120  |
| 70  | 清蒸全鱼     | Steamed Whole Fish             | main    | cantonese | steam    | whole_fish, ginger, spring_onion, soy_sauce | 78   |
| 71  | 蒜蓉开边龙虾 | Garlic Lobster, Split          | main    | cantonese | steam    | lobster, garlic, vermicelli, spring_onion   | 115  |
| 72  | 红烧海参     | Braised Sea Cucumber           | main    | northern  | braise   | sea_cucumber, oyster_sauce, spring_onion    | 88   |
| 73  | 瑶柱蒸蛋     | Steamed Egg with Dried Scallop | starter | cantonese | steam    | eggs, dried_scallop, spring_onion           | 24   |
| 74  | 金汤海味羹   | Seafood Treasure Soup          | soup    | cantonese | simmer   | dried_scallop, prawns, chicken_breast       | 62   |
| 75  | 腊味煲仔饭   | Claypot Rice with Cured Meats  | staple  | cantonese | steam    | rice_long_grain, ham, bacon, soy_sauce      | 28   |
| 76  | 蚝豉焖猪手   | Pork Hock with Dried Oyster    | main    | cantonese | braise   | pork_hock, oyster, soy_sauce, ginger        | 38   |
| 77  | 糖醋全鱼     | Sweet & Sour Whole Fish        | main    | jiangnan  | deep_fry | whole_fish, caster_sugar, rice_vinegar      | 46   |
| 78  | 黄金虾球     | Golden Prawn Balls             | starter | cantonese | deep_fry | prawns, flour, eggs, spring_onion           | 36   |
| 79  | 八宝饭       | Eight-Treasure Sticky Rice     | dessert | jiangnan  | steam    | rice_sticky, dried_fruit, lotus_seed_paste  | 16   |
| 80  | 年年有余捞起 | Prosperity Yusheng Salad       | salad   | cantonese | raw      | salmon_fillet, carrot, radish, sesame_oil   | 42   |

### F. 跨场合补位（20 · bbq 8 / party 7 / afternoon_tea 5）

| #   | 中文                 | English                     | 场合  | role    | 菜系      | 方式     | 主料                                | 估价 |
| --- | -------------------- | --------------------------- | ----- | ------- | --------- | -------- | ----------------------------------- | ---- |
| 81  | 炭烤和牛串           | Wagyu Skewers               | bbq   | main    | japanese  | grill    | wagyu_beef, soy_sauce, spring_onion | 72   |
| 82  | 香茅烤羊排           | Lemongrass Lamb Cutlets     | bbq   | main    | seasia    | grill    | lamb_rack, lemongrass, fish_sauce   | 62   |
| 83  | 蒜香黄油虾串         | Garlic Butter Prawn Skewers | bbq   | main    | aus_mod   | grill    | prawns, butter, garlic, lemon       | 38   |
| 84  | 炭烤玉米配香草黄油   | Grilled Corn, Herb Butter   | bbq   | side    | latin     | grill    | corn, butter, parsley, chilli       | 10   |
| 85  | 烤蔬菜古斯米         | Grilled Vegetable Couscous  | bbq   | staple  | middle_e. | grill    | couscous, capsicum, zucchini        | 14   |
| 86  | 西班牙冷汤           | Gazpacho                    | bbq   | soup    | mediter.  | raw      | tomato, cucumber, capsicum          | 12   |
| 87  | 烟熏辣味鸡翅         | Smoky Chilli Chicken Wings  | bbq   | snack   | aus_mod   | grill    | chicken_thigh, paprika, honey       | 18   |
| 88  | 炭烤桃配奶油         | Grilled Peaches with Cream  | bbq   | dessert | aus_mod   | grill    | peach, honey, cream                 | 14   |
| 89  | 迷你和牛汉堡         | Mini Wagyu Sliders          | party | main    | west_home | pan_fry  | wagyu_beef, flour, cheddar, onion   | 58   |
| 90  | 龙虾卷               | Lobster Rolls               | party | main    | west_home | raw      | lobster, butter, flour, lemon       | 88   |
| 91  | 香煎鹅肝配苹果       | Seared Foie Gras with Apple | party | starter | french    | pan_fry  | foie_gras, apple, butter, red_wine  | 78   |
| 92  | 火腿卷蜜瓜           | Prosciutto & Melon          | party | starter | italian   | raw      | ham, melon, olive_oil, mint         | 26   |
| 93  | 松露薯条             | Truffle Fries               | party | snack   | french    | deep_fry | potato, truffle, parmesan, parsley  | 22   |
| 94  | 鱼子酱土豆船         | Caviar Potato Bites         | party | snack   | other     | bake     | potato, caviar, cream               | 85   |
| 95  | 蟹肉小塔             | Crab Meat Tartlets          | party | snack   | french    | bake     | crab_meat, cream, flour, butter     | 44   |
| 96  | 烟熏三文鱼手指三明治 | Smoked Salmon Fingers       | tea   | snack   | west_home | raw      | salmon_fillet, bread, butter, dill  | 26   |
| 97  | 司康配凝脂奶油       | Scones with Cream & Jam     | tea   | snack   | west_home | bake     | flour, butter, cream, jam           | 14   |
| 98  | 黄瓜三明治           | Cucumber Sandwiches         | tea   | snack   | west_home | raw      | cucumber, bread, butter, mint       | 8    |
| 99  | 咸味芝士泡芙         | Cheese Gougères             | tea   | snack   | french    | bake     | flour, parmesan, eggs, butter       | 12   |
| 100 | 伯爵茶巧克力挞       | Earl Grey Chocolate Tart    | tea   | dessert | french    | chill    | dark_chocolate, cream, flour        | 22   |

## 4. 需要新增的目录条目

**食材 33 项**（其余 72 项已在库，直接复用）：

- 高端蛋白 14：`lobster` 龙虾（甲壳）、`wagyu_beef` 和牛、`dry_aged_beef` 熟成牛排、`beef_short_rib` 牛肋条、`lamb_rack` 羊排、`lamb_shoulder` 羊肩、`lamb_whole` 全羊、`king_crab` 帝王蟹（甲壳）、`crab_meat` 蟹肉（甲壳）、`abalone` 鲍鱼（软体）、`oyster` 生蚝（软体）、`sea_cucumber` 海参、`dried_scallop` 瑶柱（软体）、`whole_fish` 全鱼（鱼）
- 其他蛋白 5：`turkey` 火鸡、`ham_leg` 带骨火腿、`pork_belly` 五花肉、`pork_hock` 猪手、`foie_gras` 鹅肝
- 高端干货 3：`caviar` 鱼子酱（鱼）、`truffle` 黑松露、`saffron` 藏红花
- 蔬果 5：`winter_melon` 冬瓜、`taro` 芋头、`brussels_sprouts` 球芽甘蓝、`peach` 桃、`melon` 蜜瓜
- 干货杂项 6：`vermicelli` 粉丝、`dried_fruit` 混合果干、`mixed_spice` 混合香料、`caster_sugar` 细砂糖、`tofu_soft` 嫩豆腐、`lemongrass` 香茅

**设备 1 项**：`equip_spit` 炭火转炉（仅烤全羊）。

**场合 1 项**：`feast`（宴请）。zod enum、`src/config/seasonal.ts` 预置、`copy.ts` 名称、seasonal 日期窗口（全年常青，不绑定日期）同步加。

## 5. 生图任务（交给 ChatGPT 的部分）

沿用 `LUNA_MAX_UNIFIED_IMAGE_PROMPT.md` 的全部制式，**不因为是大菜就改风格**——同一张桌子、同一种光，只是菜不同。以下是这批的增量要求：

1. **主角规则不变且更重要**：画面主体必须是清单「主料」列的第一项。第 1 道画面主角是那块熟成肋眼，不是配菜；第 7 道画面主角是整只羊。
2. **份量按 role 与 servings**：多数 4 人份；第 7 道烤全羊为 20 人份，需要更宽的取景（可用 3:2 之外仍保持 4:3 画幅，但主体占比降到 55–65%，露出炭火转炉与长桌一角）。
3. **贵价食材要看得出贵**：熟成牛排要有干式熟成的深色外缘与大理石纹；和牛要看到细密油花；龙虾要整只或开边、壳色鲜红；鱼子酱用小勺盛放、颗粒分明。**但不要加金箔、不要加烟雾机效果、不要黑色反光台面**——台面色硬规格照旧（中性暖白/米白，禁止桃色/陶土色）。
4. **生食红线**：第 11 生蚝、第 12 和牛他他、第 16 熟成牛肉薄切、第 80 捞起 属于生食菜，画面必须是明确的生食呈现（冰床/薄切/摆盘），不要画成半熟。
5. **节庆道具克制**：圣诞组最多一枝松针或一颗石榴籽，中秋组最多一枝桂花，春节组不用红包/福字/灯笼（会变成 logo 类元素，违反禁止条款）。
6. 交付：仍是 `public/media/<slug>.webp`，4:3 · 1600×1200，≤300KB，每批 25 张，commit `art: batch <序号> (<张数> images)`。**不写注册表、不跑 `art:adopt`、不跑 `media:sizes`** —— `art:adopt` 已有防呆，外部写入注册表会直接中止。

slug 由主线在录入时确定并回传（命名规则：`<occasion|cuisine>-<主料>-<形态>`），生图任务清单以主线产出的 `npm run recipes:briefs` 为准。

## 6. 落地顺序

| 步骤 | 内容                                                         | 体量   |
| ---- | ------------------------------------------------------------ | ------ |
| 1    | 33 项食材 + 1 设备 + `feast` 场合 + spec 增加 `costCents`    | 0.5 天 |
| 2    | batch-i.ts 100 条 spec + 索引接入 + 配额与测试更新           | 1 天   |
| 3    | `feast` 桌型预置 + chips/文案 + 目录断言（新场合能配满一桌） | 0.5 天 |
| 4    | 生图 100 张（外部）→ 主线审查收编 → 三端部署                 | 随图   |

**验收**：600 → 700 道；场合标签 200 → 300；easter 从 0 到能配出完整一桌；mid_autumn 具备小食/前菜/汤/主食/沙拉；`feast` 预置能配满且候选 ≥4 组；每道大菜的「预计总价」与真实零售价同量级（抽查 10 道）；预算筛选打开 A$120 时大菜自动落选而不是被强行凑进桌。
