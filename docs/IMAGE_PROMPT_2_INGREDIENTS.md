# 生图任务 ②：食材图 88 张

> ✅ **已完成并上线。不要重做。**

> 与任务 ① 是两条独立流水线，可并行。**交付物只有图片文件。**
> 项目根目录：`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`
> 输出路径：`public/media/ingredients/<id>.webp` —— 文件名用下表原文。

---

## 1. 这批图会被用在哪里（决定了它必须怎么画）

食材图只在食谱详情页的食材行里出现，**渲染尺寸是 28×28 像素的小方块**（源文件下采样到 64 与 128 两档）。也就是说：

- **主体必须占满画面并居中。** 缩到 28px 之后，任何小于画面 1/3 的东西都会消失。
- **形状要在极小尺寸下可辨。** 一整颗番茄可辨；一堆碎末不可辨 —— 粉状／碎末类请盛在浅口小碟或小玻璃碗里，靠容器给出轮廓。
- **背景必须干净。** 台面之外不要任何东西。
- 这不是产品目录摄影：**保持和菜品图同一种光、同一张桌子**，只是主体换成单一食材。

目前 193 种在用食材里有 88 种没有图，页面上显示的是首字母字符牌。这批补完，食材行就全是真图。

## 2. 硬规格（与已上线的 105 张食材图一致）

- **4:3 · 1600×1200 · WebP · ≤200KB**
- 中性暖白／米白台面（与菜品图同一张桌子），单侧柔和窗光，柔和落影
- 45° 俯拍或正俯拍；主体居中，占画面 55–75%
- 器皿：需要容器时用素色哑光浅碟、小玻璃碗，或木勺；**最多一件**
- **绝对禁止**：文字、logo、水印、包装、标签、人物、手、第二种食材

对照已上线的参考图：`public/media/ingredients/tomato.webp`（整颗，无容器）、`butter.webp`（浅碟）、`ginger.webp`（整块+切面）、`honey.webp`（小玻璃碗+木勺）。

## 3. 分类画法

| 类型           | 画法                                     | 例                            |
| -------------- | ---------------------------------------- | ----------------------------- |
| 整只／整块蛋白 | 生的原状，不烹饪、不摆盘、不调味         | 龙虾、整鱼、羊排、和牛        |
| 切块蛋白       | 生的整块 + 一个切面，露出纹理            | 熟成牛排、五花肉、火鸡胸      |
| 贝类甲壳       | 带壳，1–3 只成组                         | 生蚝、扇贝、帝王蟹脚          |
| 干货           | 干燥原状堆放在浅碟中                     | 瑶柱、海参（干）、混合果干    |
| 粉状／细小香料 | 浅碟或小碗盛放，堆成小丘，可带一小撮散落 | 藏红花、混合香料、细砂糖      |
| 蔬果           | 整只 + 一个切面／切片，展示内部          | 冬瓜、芋头、蜜瓜、桃          |
| 香草           | 一小束新鲜的，带茎叶                     | 香茅                          |
| 面／粉／米     | 浅碟或小碗盛放                           | 粉丝（干，成束）              |
| 高价小量       | 少量精致呈现，符合真实用量               | 鱼子酱（小勺）、松露（整+片） |

**几个容易画错的**：

- `lamb_whole` 整只羔羊 —— 画**生的整只羔羊胴体**放在大砧板上（不是烤好的，不要转炉、不要炭火）。这张是食材图，不是菜品图。
- `sea_cucumber` 海参 —— 画**泡发好的深色海参**，2–3 只，湿润有光泽（不是干货状态）。
- `dried_scallop` 瑶柱 —— 干货，浅金色小圆柱，浅碟盛放。
- `caviar` 鱼子酱 —— 小玻璃碗或贝壳勺，颗粒分明。禁止金属勺（会反光过曝）。
- `foie_gras` 鹅肝 —— **生的整叶鹅肝**，浅粉米色，不是煎好的。
- `mixed_spice` 混合香料 —— 浅碟里的褐色粉末小丘。
- `caster_sugar` 细砂糖 —— 浅碟里的白色细砂糖，注意别过曝成一片白，用侧光带出颗粒。
- `whole_fish` 整条鲜鱼 —— 生的整条鱼，鱼眼清亮。
- `ham_leg` 带骨火腿 —— 整只带骨生火腿。
- `crab_meat` 蟹肉 —— 拆好的白色蟹肉，浅碟盛放。

## 4. 交付协议

- **每批 25 张**，完成即提交
- 只提交 `public/media/ingredients/<id>.webp`。**不跑 `media:sizes`、不跑任何脚本、不动 `data/`** —— 64/128 两档由主线生成
- commit message：`art: ingredients batch <序号> (<张数> images)`
- 每张自检：主体居中且占 55–75%；**缩到 64px 后仍能认出是什么**（自己缩一下看）；无文字/包装/人物/手；无第二种食材；台面色对照参考图

---

## 5. 任务清单（88 张）

### 第一优先：本次新增的 33 种（大菜层，占位符最刺眼）

| #   | 文件名                  | 中文     | English              | 类别     |
| --- | ----------------------- | -------- | -------------------- | -------- |
| 1   | `lobster.webp`          | 龙虾     | Lobster              | 蛋白     |
| 2   | `king_crab.webp`        | 帝王蟹脚 | King crab legs       | 蛋白     |
| 3   | `crab_meat.webp`        | 蟹肉     | Crab meat            | 蛋白     |
| 4   | `abalone.webp`          | 鲍鱼     | Abalone              | 蛋白     |
| 5   | `oyster.webp`           | 生蚝     | Oysters              | 蛋白     |
| 6   | `dried_scallop.webp`    | 瑶柱     | Dried scallop        | 蛋白     |
| 7   | `sea_cucumber.webp`     | 海参     | Sea cucumber         | 蛋白     |
| 8   | `whole_fish.webp`       | 整条鲜鱼 | Whole fish           | 蛋白     |
| 9   | `caviar.webp`           | 鱼子酱   | Caviar               | 蛋白     |
| 10  | `wagyu_beef.webp`       | 和牛     | Wagyu beef           | 蛋白     |
| 11  | `dry_aged_beef.webp`    | 熟成牛排 | Dry-aged beef        | 蛋白     |
| 12  | `beef_short_rib.webp`   | 牛肋条   | Beef short rib       | 蛋白     |
| 13  | `lamb_rack.webp`        | 羊排     | Rack of lamb         | 蛋白     |
| 14  | `lamb_shoulder.webp`    | 羊肩肉   | Lamb shoulder        | 蛋白     |
| 15  | `lamb_whole.webp`       | 整只羔羊 | Whole lamb           | 蛋白     |
| 16  | `turkey.webp`           | 火鸡胸   | Turkey breast        | 蛋白     |
| 17  | `ham_leg.webp`          | 带骨火腿 | Bone-in ham          | 蛋白     |
| 18  | `pork_belly.webp`       | 五花肉   | Pork belly           | 蛋白     |
| 19  | `pork_hock.webp`        | 猪手     | Pork hock            | 蛋白     |
| 20  | `foie_gras.webp`        | 鹅肝     | Foie gras            | 蛋白     |
| 21  | `tofu_soft.webp`        | 嫩豆腐   | Silken tofu          | 蛋白     |
| 22  | `truffle.webp`          | 黑松露   | Black truffle        | 干货调味 |
| 23  | `saffron.webp`          | 藏红花   | Saffron              | 香料     |
| 24  | `winter_melon.webp`     | 冬瓜     | Winter melon         | 蔬菜     |
| 25  | `taro.webp`             | 芋头     | Taro                 | 蔬菜     |
| 26  | `brussels_sprouts.webp` | 球芽甘蓝 | Brussels sprouts     | 蔬菜     |
| 27  | `peach.webp`            | 桃子     | Peaches              | 水果     |
| 28  | `melon.webp`            | 蜜瓜     | Rockmelon            | 水果     |
| 29  | `lemongrass.webp`       | 香茅     | Lemongrass           | 香草     |
| 30  | `vermicelli.webp`       | 粉丝     | Mung bean vermicelli | 主食     |
| 31  | `dried_fruit.webp`      | 混合果干 | Mixed dried fruit    | 水果     |
| 32  | `mixed_spice.webp`      | 混合香料 | Mixed spice          | 香料     |
| 33  | `caster_sugar.webp`     | 细砂糖   | Caster sugar         | 干货调味 |

### 第二优先：既有目录里仍缺图的 55 种

| #   | 文件名                     | 中文       | English            | 类别     |
| --- | -------------------------- | ---------- | ------------------ | -------- |
| 34  | `peas.webp`                | 青豆       | Peas               | 蔬菜     |
| 35  | `capsicum.webp`            | 甜椒       | Capsicum           | 蔬菜     |
| 36  | `asparagus.webp`           | 芦笋       | Asparagus          | 蔬菜     |
| 37  | `leek.webp`                | 韭葱       | Leek               | 蔬菜     |
| 38  | `celery.webp`              | 西芹       | Celery             | 蔬菜     |
| 39  | `radish.webp`              | 白萝卜     | Radish             | 蔬菜     |
| 40  | `avocado.webp`             | 牛油果     | Avocado            | 水果     |
| 41  | `fennel.webp`              | 茴香球     | Fennel             | 蔬菜     |
| 42  | `snow_pea.webp`            | 荷兰豆     | Snow peas          | 蔬菜     |
| 43  | `edamame.webp`             | 毛豆       | Edamame            | legume   |
| 44  | `tempeh.webp`              | 天贝       | Tempeh             | 蛋白     |
| 45  | `prawns.webp`              | 虾         | Prawns             | 蛋白     |
| 46  | `duck_breast.webp`         | 鸭胸       | Duck breast        | 蛋白     |
| 47  | `quinoa.webp`              | 藜麦       | Quinoa             | 主食     |
| 48  | `couscous.webp`            | 古斯米     | Couscous           | 主食     |
| 49  | `barley.webp`              | 珍珠大麦   | Pearl barley       | 主食     |
| 50  | `oats.webp`                | 燕麦片     | Rolled oats        | 主食     |
| 51  | `polenta.webp`             | 玉米糊     | Polenta            | 主食     |
| 52  | `tortilla.webp`            | 墨西哥薄饼 | Tortilla           | 主食     |
| 53  | `walnuts.webp`             | 核桃       | Walnuts            | 坚果     |
| 54  | `cashews.webp`             | 腰果       | Cashews            | 坚果     |
| 55  | `pistachio.webp`           | 开心果     | Pistachios         | 坚果     |
| 56  | `sunflower_seed.webp`      | 葵花籽     | Sunflower seeds    | 干货调味 |
| 57  | `dill.webp`                | 莳萝       | Dill               | 香草     |
| 58  | `thyme.webp`               | 百里香     | Thyme              | 香草     |
| 59  | `oregano.webp`             | 牛至       | Oregano            | 香草     |
| 60  | `turmeric.webp`            | 姜黄       | Turmeric           | 香料     |
| 61  | `paprika.webp`             | 甜椒粉     | Paprika            | 香料     |
| 62  | `star_anise.webp`          | 八角       | Star anise         | 香料     |
| 63  | `sichuan_pepper.webp`      | 花椒       | Sichuan pepper     | 香料     |
| 64  | `rice_vinegar.webp`        | 米醋       | Rice vinegar       | 干货调味 |
| 65  | `balsamic_vinegar.webp`    | 黑醋       | Balsamic vinegar   | 干货调味 |
| 66  | `dijon_mustard.webp`       | 第戎芥末   | Dijon mustard      | 干货调味 |
| 67  | `harissa.webp`             | 哈里萨辣酱 | Harissa            | 干货调味 |
| 68  | `gochujang.webp`           | 韩式辣酱   | Gochujang          | 干货调味 |
| 69  | `tomato_paste.webp`        | 番茄膏     | Tomato paste       | 干货调味 |
| 70  | `orange.webp`              | 橙子       | Orange             | 水果     |
| 71  | `berries.webp`             | 莓果       | Mixed berries      | 水果     |
| 72  | `dates.webp`               | 椰枣       | Dates              | 水果     |
| 73  | `dark_chocolate.webp`      | 黑巧克力   | Dark chocolate     | 干货调味 |
| 74  | `cocoa.webp`               | 可可粉     | Cocoa powder       | 干货调味 |
| 75  | `halloumi.webp`            | 哈罗米奶酪 | Halloumi           | 乳制品   |
| 76  | `sourdough.webp`           | 酸种面包   | Sourdough          | 主食     |
| 77  | `egg_noodle.webp`          | 鸡蛋面     | Egg noodles        | 主食     |
| 78  | `pomegranate.webp`         | 石榴       | Pomegranate        | 水果     |
| 79  | `lotus_root.webp`          | 莲藕       | Lotus root         | 蔬菜     |
| 80  | `bacon.webp`               | 培根       | Bacon              | 蛋白     |
| 81  | `scallops.webp`            | 扇贝       | Scallops           | 蛋白     |
| 82  | `chestnut.webp`            | 板栗       | Chestnuts          | 坚果     |
| 83  | `osmanthus.webp`           | 桂花       | Osmanthus          | 香草     |
| 84  | `lotus_seed_paste.webp`    | 莲蓉       | Lotus seed paste   | 干货调味 |
| 85  | `ham.webp`                 | 火腿       | Ham                | 蛋白     |
| 86  | `ricotta_hotcake_mix.webp` | 自发粉     | Self-raising flour | 干货调味 |
| 87  | `granola.webp`             | 烤麦片     | Granola            | 主食     |
| 88  | `jam.webp`                 | 莓果酱     | Berry jam          | 干货调味 |
