# 生图任务 ①：节庆大菜 100 张菜品图

> 整份交给产图方。**交付物只有图片文件；不改任何代码、数据、脚本、配置。** 尺寸档、注册、部署全部由主线接管。
> 项目根目录：`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`
> 输出路径：`public/media/<slug>.webp` —— slug 用下表原文，一个字符都不要改。

---

## 1. 硬规格（与已上线 600 张完全一致，不得因为是「大菜」而改动）

- **4:3 · 1600×1200 · WebP · ≤300KB**（质量 82–88 内调，落盘前自检）
- 45° 俯拍为主，汤类可更俯；单侧柔和窗光；素色哑光陶瓷器皿
- 构图留 15–25% 呼吸空间；1–2 件极简道具；家常可食的真实状态
- **台面色硬规格**：中性暖白／米白。对照已上线的 `sichuan-cold-noodle-cups.webp`、`french-onion-thyme-soup.webp`、`cantonese-winter-melon-soup.webp`。**禁止桃色／陶土色调，禁止黑色反光台面。**
- **绝对禁止**：文字、logo、水印、人物、手、包装，以及「允许出现的全部食材」之外的任何可辨识食材

## 2. 这一批的五条增量要求

**① 画面主角就是「主角」列那一项。** 已经踩过一次坑：五张图画成了别的菜（菌菇汤画成牛油果沙拉、扁豆汤画成芒果酸奶杯），共同原因是没先看主料。**每张开画前先读该行的「画面主角」，那就是占据画面的东西。** 第 1 张的主角是那块熟成肋眼，不是配菜；第 7 张的主角是整只羊。

**② 贵价食材要看得出贵，但靠食材本身，不靠特效。**

- 熟成牛排：干式熟成的深色外缘、切面大理石纹、粉红芯
- 和牛：细密油花清晰可见，切片薄
- 龙虾／帝王蟹：整只或规整开边，壳色鲜红，肉质饱满
- 鱼子酱：小勺或贝壳勺盛放，颗粒分明有光泽
- 鹅肝：焦褐脆壳与内里粉嫩的对比
- 松露：现刨的薄片，边缘不规则
- **禁止**：金箔、烟雾机效果、喷枪火焰、黑色反光台面、任何「高级感滤镜」。台面和光线与家常菜完全一致 —— 让食材本身说话。

**③ 生食红线。** 以下四张必须是明确的生食呈现，不能画成半熟或全熟：

- `feast-oysters-shallot-vinegar` 生蚝 —— 碎冰床上的带壳生蚝
- `feast-wagyu-tartare` 和牛他他 —— 手切生牛肉塔，顶部生蛋黄
- `feast-dry-aged-beef-carpaccio` 熟成牛肉薄切 —— 铺满盘底的生牛肉薄片
- `cny-prosperity-yusheng-salad` 捞起 —— 生三文鱼片与各色蔬菜丝分区平铺

**④ 节庆道具克制到近乎没有。**

- 圣诞组：最多一枝松针或几颗石榴籽。禁止圣诞树、袜子、彩球、蜡烛。
- 中秋组：最多一枝桂花。禁止灯笼、玉兔、月亮道具。
- 春节组：**禁止红包、福字、灯笼、对联、中国结** —— 这些会被判定为 logo 类元素，违反禁止条款。年味靠菜本身（整鱼、盆菜式摆盘）。
- 复活节组：禁止彩蛋、兔子。`easter-chocolate-nest-mousse` 例外 —— 巧克力脆丝围成的巢是这道菜的形态本身，不是道具。

**⑤ 份量按 `role` 与人份。** 绝大多数按 4 人份出餐；下表标注人份的按标注来。特别是：

- `feast-whole-spit-roast-lamb`（**20 人份**）：唯一一张需要更宽取景。仍是 4:3 · 1600×1200，但主体占比降到 55–65%，可露出炭火转炉一角与长桌边缘。这是全批唯一允许出现「设备」的一张。
- `christmas-glazed-ham`（12 人份）、`christmas-seafood-platter-ice`（8 人份）、`feast-slow-roast-lamb-leg`（8 人份）、`easter-honey-glazed-lamb-shoulder`（8 人份）、`christmas-roast-turkey-breast`（8 人份）、`christmas-steamed-pudding`（8 人份）：整只／整块上桌的大件，画整器。
- 标 6 人份的按 6 人份。

## 3. 形态词就是规格

菜名里出现的形态必须与画面一致（这是上一轮退回的主要原因）：「开边」就是纵向剖开、「薄切」就是能透光的薄片、「串」就是穿在扦子上、「卷」就是卷起、「丝／片／块／粒」按字面、「小塔／船／指」是一口量的小件。**产前对一眼 `菜名` 与 `English`。**

## 4. 交付协议

- **每批 25 张**，完成即提交，不攒（共 4 批）
- **只提交 `public/media/<slug>.webp` 主图**。不跑 `media:sizes`、不跑 `art:adopt`、**不动 `data/recipes/generated-media.json`** —— 注册表是「照片上线」的开关，写进去等于跳过质检直接发布；主线已加防呆，外部写入会直接中止并列出 slug
- commit message：`art: batch <序号> (<张数> images)`，序号接着现有批次排，张数写实际数
- 每张自检清单：食材 ⊆ 允许列表；无文字/人物/手/包装；4:3 · 1600×1200；≤300KB；台面色对照参考图；形态与菜名一致；**主角是「画面主角」列那一项**

---

## 5. 任务清单（100 张）

### A. 宴请大菜 feast（24 张）

| #   | slug                                 | 菜名                     | English                             | 课别    | 画面主角（第一项） | 允许出现的全部食材                       |
| --- | ------------------------------------ | ------------------------ | ----------------------------------- | ------- | ------------------ | ---------------------------------------- |
| 1   | `feast-dry-aged-ribeye-red-wine`     | 熟成肋眼配红酒汁         | Dry-Aged Rib-Eye with Red Wine Jus  | main    | **熟成牛排**       | 熟成牛排、黄油、迷迭香、红葡萄酒、大蒜   |
| 2   | `feast-grilled-wagyu-sirloin`        | 炭烤和牛西冷             | Grilled Wagyu Sirloin               | main    | **和牛**           | 和牛、酱油、葱、芝麻油                   |
| 3   | `feast-butter-garlic-lobster`        | 蒜香黄油烤龙虾           | Butter-Garlic Grilled Lobster       | main    | **龙虾**           | 龙虾、黄油、大蒜、欧芹、柠檬             |
| 4   | `feast-baked-lobster-cheese`         | 芝士焗龙虾               | Baked Lobster with Cheese           | main    | **龙虾**           | 龙虾、淡奶油、帕玛森奶酪、第戎芥末、黄油 |
| 5   | `feast-slow-roast-lamb-leg`          | 迷迭香慢烤羊腿 · 8 人份  | Slow-Roast Lamb Leg with Rosemary   | main    | **羊腿肉**         | 羊腿肉、迷迭香、大蒜、土豆、橄榄油       |
| 6   | `feast-herb-crusted-lamb-rack`       | 香草脆皮羊排             | Herb-Crusted Rack of Lamb           | main    | **羊排**           | 羊排、欧芹、第戎芥末、大蒜、黄油         |
| 7   | `feast-whole-spit-roast-lamb`        | 炭火烤全羊 · **20 人份** | Whole Spit-Roast Lamb               | main    | **整只羔羊**       | 整只羔羊、孜然粉、大蒜、柠檬、橄榄油     |
| 8   | `feast-red-wine-short-ribs`          | 红酒炖牛肋条 · 6 人份    | Red-Wine Braised Beef Short Ribs    | main    | **牛肋条**         | 牛肋条、红葡萄酒、胡萝卜、洋葱、百里香   |
| 9   | `feast-king-crab-lemon-butter`       | 帝王蟹脚配柠檬黄油       | King Crab Legs with Lemon Butter    | main    | **帝王蟹脚**       | 帝王蟹脚、黄油、柠檬、欧芹               |
| 10  | `feast-truffle-mushroom-risotto`     | 黑松露野菌烩饭           | Truffle and Mushroom Risotto        | main    | **长粒米**         | 长粒米、黑松露、白蘑菇、帕玛森奶酪、黄油 |
| 11  | `feast-oysters-shallot-vinegar`      | 生蚝配红葱醋汁           | Oysters with Shallot Vinegar        | starter | **生蚝**           | 生蚝、黑醋、洋葱、柠檬                   |
| 12  | `feast-wagyu-tartare`                | 和牛他他                 | Wagyu Tartare                       | starter | **和牛**           | 和牛、鸡蛋、第戎芥末、洋葱、欧芹         |
| 13  | `feast-caviar-blini`                 | 鱼子酱薄饼               | Caviar on Blini                     | starter | **鱼子酱**         | 鱼子酱、普通面粉、淡奶油、鸡蛋、黄油     |
| 14  | `feast-scallops-garlic-butter`       | 蒜香黄油焗扇贝           | Scallops Baked in Garlic Butter     | starter | **扇贝**           | 扇贝、黄油、大蒜、欧芹、柠檬             |
| 15  | `feast-braised-abalone-oyster-sauce` | 蚝油扒鲍鱼               | Braised Abalone in Oyster Sauce     | starter | **鲍鱼**           | 鲍鱼、蚝油、生姜、葱                     |
| 16  | `feast-dry-aged-beef-carpaccio`      | 熟成牛肉薄切             | Dry-Aged Beef Carpaccio             | starter | **熟成牛排**       | 熟成牛排、橄榄油、柠檬、帕玛森奶酪、菠菜 |
| 17  | `feast-winter-melon-scallop-soup`    | 瑶柱冬瓜盅               | Winter Melon and Dried Scallop Soup | soup    | **瑶柱**           | 瑶柱、冬瓜、鸡胸肉、生姜、蔬菜或鸡高汤   |
| 18  | `feast-sea-cucumber-chicken-soup`    | 海参鸡汤                 | Sea Cucumber and Chicken Soup       | soup    | **海参**           | 海参、鸡腿肉、生姜、葱、蔬菜或鸡高汤     |
| 19  | `feast-lobster-bisque`               | 龙虾浓汤                 | Lobster Bisque                      | soup    | **龙虾**           | 龙虾、淡奶油、番茄膏、黄油、洋葱         |
| 20  | `feast-truffle-mashed-potato`        | 黑松露薯泥               | Truffle Mashed Potato               | side    | **土豆**           | 土豆、黑松露、黄油、淡奶油               |
| 21  | `feast-saffron-seafood-rice`         | 藏红花海鲜饭 · 6 人份    | Saffron Seafood Rice                | staple  | **长粒米**         | 长粒米、藏红花、虾、扇贝、甜椒           |
| 22  | `feast-pomegranate-orange-salad`     | 石榴橙香沙拉             | Pomegranate and Orange Salad        | salad   | **石榴**           | 石榴、橙子、菠菜、开心果、橄榄油         |
| 23  | `feast-dark-chocolate-mousse`        | 黑巧慕斯                 | Dark Chocolate Mousse               | dessert | **黑巧克力**       | 黑巧克力、淡奶油、鸡蛋、细砂糖           |
| 24  | `feast-creme-brulee-tart`            | 焦糖布蕾塔               | Crème Brûlée Tart                   | dessert | **淡奶油**         | 淡奶油、鸡蛋、细砂糖、普通面粉、黄油     |

### B. 复活节 easter（14 张）

| #   | slug                                | 菜名                | English                      | 课别    | 画面主角（第一项） | 允许出现的全部食材                       |
| --- | ----------------------------------- | ------------------- | ---------------------------- | ------- | ------------------ | ---------------------------------------- |
| 25  | `easter-honey-glazed-lamb-shoulder` | 蜜汁烤羊肩 · 8 人份 | Honey-Glazed Lamb Shoulder   | main    | **羊肩肉**         | 羊肩肉、蜂蜜、大蒜、迷迭香、橄榄油       |
| 26  | `easter-lamb-cutlets-mint-sauce`    | 薄荷酱烤羊排        | Lamb Cutlets with Mint Sauce | main    | **羊排**           | 羊排、薄荷、黑醋、蜂蜜、橄榄油           |
| 27  | `easter-lemon-herb-roast-chicken`   | 柠檬香草烤鸡        | Lemon Herb Roast Chicken     | main    | **鸡腿肉**         | 鸡腿肉、百里香、柠檬、黄油、大蒜         |
| 28  | `easter-smoked-salmon-platter`      | 烟熏三文鱼盘        | Smoked Salmon Platter        | starter | **三文鱼排**       | 三文鱼排、淡奶油、柠檬、莳萝、洋葱       |
| 29  | `easter-hot-cross-buns`             | 复活节十字包        | Hot Cross Buns               | snack   | **普通面粉**       | 普通面粉、混合果干、混合香料、黄油、牛奶 |
| 30  | `easter-chocolate-nest-mousse`      | 巧克力鸟巢慕斯      | Chocolate Nest Mousse        | dessert | **黑巧克力**       | 黑巧克力、淡奶油、鸡蛋、细砂糖           |
| 31  | `easter-sugar-cookies`              | 复活节糖霜曲奇      | Easter Sugar Cookies         | snack   | **普通面粉**       | 普通面粉、黄油、细砂糖、鸡蛋             |
| 32  | `easter-spring-pea-soup`            | 春日豌豆浓汤        | Spring Pea Soup              | soup    | **青豆**           | 青豆、薄荷、淡奶油、蔬菜或鸡高汤、洋葱   |
| 33  | `easter-roast-root-vegetables`      | 烤根菜拼盘          | Roast Root Vegetables        | side    | **胡萝卜**         | 胡萝卜、南瓜、土豆、百里香、橄榄油       |
| 34  | `easter-asparagus-hollandaise`      | 芦笋配荷兰酱        | Asparagus with Hollandaise   | side    | **芦笋**           | 芦笋、黄油、鸡蛋、柠檬                   |
| 35  | `easter-apple-walnut-salad`         | 苹果核桃沙拉        | Apple and Walnut Salad       | salad   | **苹果**           | 苹果、核桃、菠菜、橄榄油、柠檬           |
| 36  | `easter-rosemary-roast-potatoes`    | 迷迭香烤土豆        | Rosemary Roast Potatoes      | staple  | **土豆**           | 土豆、迷迭香、橄榄油、大蒜               |
| 37  | `easter-lemon-curd-tart`            | 柠檬凝乳挞          | Lemon Curd Tart              | dessert | **柠檬**           | 柠檬、鸡蛋、黄油、细砂糖、普通面粉       |
| 38  | `easter-ham-mustard-rolls`          | 火腿芥末卷          | Ham and Mustard Rolls        | snack   | **火腿**           | 火腿、第戎芥末、普通面粉、黄油、切达奶酪 |

### C. 中秋 midautumn（14 张）

| #   | slug                                   | 菜名              | English                                   | 课别    | 画面主角（第一项） | 允许出现的全部食材                   |
| --- | -------------------------------------- | ----------------- | ----------------------------------------- | ------- | ------------------ | ------------------------------------ |
| 39  | `midautumn-osmanthus-lotus-root`       | 桂花糯米藕        | Osmanthus Lotus Root with Sticky Rice     | snack   | **莲藕**           | 莲藕、糯米、桂花、红糖               |
| 40  | `midautumn-lotus-paste-mooncake`       | 蛋黄莲蓉月饼      | Lotus Paste Mooncake with Salted Yolk     | snack   | **莲蓉**           | 莲蓉、鸡蛋、普通面粉、蜂蜜           |
| 41  | `midautumn-salted-yolk-pumpkin`        | 咸蛋黄焗南瓜      | Salted-Yolk Pumpkin                       | side    | **南瓜**           | 南瓜、鸡蛋、普通面粉、黄油           |
| 42  | `midautumn-osmanthus-rice-ball-soup`   | 桂花酒酿圆子羹    | Osmanthus Rice Ball Soup                  | soup    | **糯米**           | 糯米、桂花、红糖、鸡蛋               |
| 43  | `midautumn-winter-melon-ham-soup`      | 冬瓜火腿汤        | Winter Melon and Ham Soup                 | soup    | **冬瓜**           | 冬瓜、火腿、生姜、蔬菜或鸡高汤、葱   |
| 44  | `midautumn-crab-silken-tofu`           | 蟹粉豆腐          | Crab Meat with Silken Tofu                | main    | **蟹肉**           | 蟹肉、嫩豆腐、生姜、蔬菜或鸡高汤、葱 |
| 45  | `midautumn-steamed-crab-ginger`        | 姜葱蒸大蟹        | Steamed Crab with Ginger and Spring Onion | main    | **蟹肉**           | 蟹肉、生姜、米醋、葱、芝麻油         |
| 46  | `midautumn-chestnut-braised-chicken`   | 板栗烧鸡          | Chestnut Braised Chicken                  | main    | **鸡腿肉**         | 鸡腿肉、板栗、酱油、生姜、葱         |
| 47  | `midautumn-taro-pork-belly`            | 芋头扣肉 · 6 人份 | Steamed Taro and Pork Belly               | main    | **五花肉**         | 五花肉、芋头、酱油、八角、生姜       |
| 48  | `midautumn-scallops-garlic-vermicelli` | 蒜蓉粉丝蒸扇贝    | Steamed Scallops with Garlic Vermicelli   | starter | **扇贝**           | 扇贝、粉丝、大蒜、葱、酱油           |
| 49  | `midautumn-pomelo-honey-jelly`         | 蜜柚蜂蜜冻        | Pomelo Honey Jelly                        | dessert | **橙子**           | 橙子、蜂蜜、明胶                     |
| 50  | `midautumn-black-sesame-tangyuan`      | 黑芝麻汤圆        | Black Sesame Tangyuan                     | dessert | **糯米**           | 糯米、黑芝麻、细砂糖、黄油           |
| 51  | `midautumn-osmanthus-sticky-rice`      | 桂花糯米饭        | Osmanthus Sticky Rice                     | staple  | **糯米**           | 糯米、桂花、混合果干、红糖           |
| 52  | `midautumn-pomelo-chicken-salad`       | 柚香鸡丝沙拉      | Pomelo and Chicken Salad                  | salad   | **橙子**           | 橙子、鸡胸肉、薄荷、芝麻油、葱       |

### D. 圣诞 christmas（16 张）

| #   | slug                                | 菜名                  | English                        | 课别    | 画面主角（第一项） | 允许出现的全部食材                       |
| --- | ----------------------------------- | --------------------- | ------------------------------ | ------- | ------------------ | ---------------------------------------- |
| 53  | `christmas-roast-turkey-breast`     | 香草烤火鸡胸 · 8 人份 | Herb Roast Turkey Breast       | main    | **火鸡胸**         | 火鸡胸、黄油、百里香、大蒜、柠檬         |
| 54  | `christmas-glazed-ham`              | 蜜糖烤火腿 · 12 人份  | Glazed Christmas Ham           | main    | **带骨火腿**       | 带骨火腿、蜂蜜、第戎芥末、橙子、八角     |
| 55  | `christmas-prawn-cocktail-platter`  | 冷盘大虾配鸡尾酒汁    | Prawn Cocktail Platter         | starter | **虾**             | 虾、番茄膏、淡奶油、柠檬、欧芹           |
| 56  | `christmas-seafood-platter-ice`     | 冰镇海鲜冷盘 · 8 人份 | Seafood Platter on Ice         | starter | **虾**             | 虾、生蚝、扇贝、柠檬、莳萝               |
| 57  | `christmas-duck-breast-berries`     | 莓果酱汁烤鸭胸        | Duck Breast with Berry Sauce   | main    | **鸭胸**           | 鸭胸、莓果、红葡萄酒、黄油、百里香       |
| 58  | `christmas-chestnut-ham-soup`       | 栗子火腿浓汤          | Chestnut and Ham Soup          | soup    | **板栗**           | 板栗、火腿、淡奶油、蔬菜或鸡高汤、洋葱   |
| 59  | `christmas-pomegranate-salad`       | 石榴圣诞沙拉          | Christmas Pomegranate Salad    | salad   | **菠菜**           | 菠菜、石榴、核桃、橄榄油、菲达奶酪       |
| 60  | `christmas-mango-avocado-salad`     | 芒果牛油果沙拉        | Mango and Avocado Salad        | salad   | **芒果**           | 芒果、牛油果、柠檬、薄荷、橄榄油         |
| 61  | `christmas-garlic-pull-apart-bread` | 蒜香黄油手撕包        | Garlic Butter Pull-Apart Bread | staple  | **普通面粉**       | 普通面粉、黄油、大蒜、欧芹、牛奶         |
| 62  | `christmas-herb-butter-mash`        | 香草黄油土豆泥        | Herb Butter Mash               | staple  | **土豆**           | 土豆、黄油、淡奶油、百里香               |
| 63  | `christmas-honey-mustard-carrots`   | 蜂蜜芥末烤胡萝卜      | Honey Mustard Carrots          | side    | **胡萝卜**         | 胡萝卜、蜂蜜、第戎芥末、百里香、橄榄油   |
| 64  | `christmas-brussels-sprouts-bacon`  | 培根球芽甘蓝          | Brussels Sprouts with Bacon    | side    | **球芽甘蓝**       | 球芽甘蓝、培根、黄油、大蒜               |
| 65  | `christmas-pavlova-summer-berries`  | 澳式帕芙洛娃          | Pavlova with Summer Berries    | dessert | **鸡蛋**           | 鸡蛋、细砂糖、淡奶油、莓果               |
| 66  | `christmas-steamed-pudding`         | 圣诞蒸布丁 · 8 人份   | Christmas Pudding              | dessert | **混合果干**       | 混合果干、普通面粉、黄油、红糖、混合香料 |
| 67  | `christmas-gingerbread-people`      | 姜饼人                | Gingerbread People             | snack   | **普通面粉**       | 普通面粉、生姜、蜂蜜、黄油、混合香料     |
| 68  | `christmas-berry-cheese-tartlets`   | 莓果芝士小塔          | Berry Cheese Tartlets          | snack   | **普通面粉**       | 普通面粉、淡奶油、莓果、细砂糖、黄油     |

### E. 春节 cny（12 张）

| #   | slug                            | 菜名                | English                             | 课别    | 画面主角（第一项） | 允许出现的全部食材                     |
| --- | ------------------------------- | ------------------- | ----------------------------------- | ------- | ------------------ | -------------------------------------- |
| 69  | `cny-braised-abalone-greens`    | 鲍鱼扒时蔬          | Braised Abalone with Greens         | main    | **鲍鱼**           | 鲍鱼、蚝油、大白菜、生姜、葱           |
| 70  | `cny-steamed-coral-trout-whole` | 清蒸全鱼            | Steamed Whole Fish                  | main    | **整条鲜鱼**       | 整条鲜鱼、生姜、葱、酱油、芝麻油       |
| 71  | `cny-garlic-lobster-split`      | 蒜蓉开边龙虾        | Split Lobster with Garlic           | main    | **龙虾**           | 龙虾、大蒜、粉丝、葱、酱油             |
| 72  | `cny-braised-sea-cucumber`      | 红烧海参            | Braised Sea Cucumber                | main    | **海参**           | 海参、蚝油、葱、生姜、蔬菜或鸡高汤     |
| 73  | `cny-steamed-egg-dried-scallop` | 瑶柱蒸蛋            | Steamed Egg with Dried Scallop      | starter | **鸡蛋**           | 鸡蛋、瑶柱、葱、蔬菜或鸡高汤           |
| 74  | `cny-seafood-treasure-soup`     | 金汤海味羹          | Seafood Treasure Soup               | soup    | **瑶柱**           | 瑶柱、虾、鸡胸肉、生姜、蔬菜或鸡高汤   |
| 75  | `cny-claypot-cured-meat-rice`   | 腊味煲仔饭          | Claypot Rice with Cured Meats       | staple  | **长粒米**         | 长粒米、火腿、培根、酱油、葱           |
| 76  | `cny-pork-hock-dried-oyster`    | 蚝豉焖猪手 · 6 人份 | Braised Pork Hock with Dried Oyster | main    | **猪手**           | 猪手、生蚝、酱油、生姜、八角           |
| 77  | `cny-sweet-sour-whole-fish`     | 糖醋全鱼            | Sweet and Sour Whole Fish           | main    | **整条鲜鱼**       | 整条鲜鱼、细砂糖、米醋、番茄膏、生姜   |
| 78  | `cny-golden-prawn-balls`        | 黄金虾球            | Golden Prawn Balls                  | starter | **虾**             | 虾、普通面粉、鸡蛋、葱                 |
| 79  | `cny-eight-treasure-rice`       | 八宝饭              | Eight-Treasure Sticky Rice          | dessert | **糯米**           | 糯米、混合果干、莲蓉、红糖             |
| 80  | `cny-prosperity-yusheng-salad`  | 年年有余捞起        | Prosperity Yusheng Salad            | salad   | **三文鱼排**       | 三文鱼排、胡萝卜、白萝卜、芝麻油、花生 |

### F. 烧烤 bbq（8 张）

| #   | slug                              | 菜名               | English                       | 课别    | 画面主角（第一项） | 允许出现的全部食材                 |
| --- | --------------------------------- | ------------------ | ----------------------------- | ------- | ------------------ | ---------------------------------- |
| 81  | `bbq-wagyu-skewers`               | 炭烤和牛串         | Wagyu Skewers                 | main    | **和牛**           | 和牛、酱油、葱、芝麻油             |
| 82  | `bbq-lemongrass-lamb-cutlets`     | 香茅烤羊排         | Lemongrass Lamb Cutlets       | main    | **羊排**           | 羊排、香茅、鱼露、大蒜、鲜辣椒     |
| 83  | `bbq-garlic-butter-prawn-skewers` | 蒜香黄油虾串       | Garlic Butter Prawn Skewers   | main    | **虾**             | 虾、黄油、大蒜、柠檬、欧芹         |
| 84  | `bbq-grilled-corn-herb-butter`    | 炭烤玉米配香草黄油 | Grilled Corn with Herb Butter | side    | **玉米粒**         | 玉米粒、黄油、欧芹、鲜辣椒、柠檬   |
| 85  | `bbq-grilled-vegetable-couscous`  | 烤蔬菜古斯米       | Grilled Vegetable Couscous    | staple  | **古斯米**         | 古斯米、甜椒、西葫芦、橄榄油、薄荷 |
| 86  | `bbq-gazpacho-chilled-soup`       | 西班牙冷汤         | Gazpacho                      | soup    | **番茄**           | 番茄、黄瓜、甜椒、橄榄油、大蒜     |
| 87  | `bbq-smoky-chilli-chicken-wings`  | 烟熏辣味鸡翅       | Smoky Chilli Chicken Wings    | snack   | **鸡腿肉**         | 鸡腿肉、甜椒粉、蜂蜜、大蒜、鲜辣椒 |
| 88  | `bbq-grilled-peaches-cream`       | 炭烤桃配奶油       | Grilled Peaches with Cream    | dessert | **桃子**           | 桃子、蜂蜜、淡奶油                 |

### G. 派对 party（7 张）

| #   | slug                           | 菜名           | English                     | 课别    | 画面主角（第一项） | 允许出现的全部食材                   |
| --- | ------------------------------ | -------------- | --------------------------- | ------- | ------------------ | ------------------------------------ |
| 89  | `party-mini-wagyu-sliders`     | 迷你和牛汉堡   | Mini Wagyu Sliders          | main    | **和牛**           | 和牛、普通面粉、切达奶酪、洋葱、黄油 |
| 90  | `party-lobster-rolls`          | 龙虾卷         | Lobster Rolls               | main    | **龙虾**           | 龙虾、黄油、面包、柠檬、欧芹         |
| 91  | `party-seared-foie-gras-apple` | 香煎鹅肝配苹果 | Seared Foie Gras with Apple | starter | **鹅肝**           | 鹅肝、苹果、黄油、红葡萄酒           |
| 92  | `party-prosciutto-melon`       | 火腿卷蜜瓜     | Prosciutto and Melon        | starter | **火腿**           | 火腿、蜜瓜、橄榄油、薄荷             |
| 93  | `party-truffle-fries`          | 松露薯条       | Truffle Fries               | snack   | **土豆**           | 土豆、黑松露、帕玛森奶酪、欧芹       |
| 94  | `party-caviar-potato-bites`    | 鱼子酱土豆船   | Caviar Potato Bites         | snack   | **土豆**           | 土豆、鱼子酱、淡奶油、莳萝           |
| 95  | `party-crab-meat-tartlets`     | 蟹肉小塔       | Crab Meat Tartlets          | snack   | **蟹肉**           | 蟹肉、淡奶油、普通面粉、黄油、莳萝   |

### H. 下午茶 tea（5 张）

| #   | slug                           | 菜名                 | English                         | 课别    | 画面主角（第一项） | 允许出现的全部食材                     |
| --- | ------------------------------ | -------------------- | ------------------------------- | ------- | ------------------ | -------------------------------------- |
| 96  | `tea-smoked-salmon-fingers`    | 烟熏三文鱼手指三明治 | Smoked Salmon Finger Sandwiches | snack   | **三文鱼排**       | 三文鱼排、面包、黄油、莳萝、柠檬       |
| 97  | `tea-scones-cream-jam`         | 司康配凝脂奶油       | Scones with Cream and Jam       | snack   | **普通面粉**       | 普通面粉、黄油、淡奶油、莓果酱、牛奶   |
| 98  | `tea-cucumber-sandwiches`      | 黄瓜三明治           | Cucumber Sandwiches             | snack   | **黄瓜**           | 黄瓜、面包、黄油、薄荷                 |
| 99  | `tea-cheese-gougeres-savoury`  | 咸味芝士泡芙         | Cheese Gougères                 | snack   | **普通面粉**       | 普通面粉、帕玛森奶酪、鸡蛋、黄油、牛奶 |
| 100 | `tea-earl-grey-chocolate-tart` | 伯爵茶巧克力挞       | Earl Grey Chocolate Tart        | dessert | **黑巧克力**       | 黑巧克力、淡奶油、普通面粉、黄油、鸡蛋 |
