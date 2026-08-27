# 生图任务 ⑦:菜品图 78 张

> **交付物只有图片文件。不要改任何注册表 / JSON / 代码。**
> 与任务 ⑥(食材)是两条独立流水线,可并行。
> 项目根目录:`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`
> 输出路径:`public/media/<slug>.webp` —— 文件名用下表 slug 原文。

## 硬规格(与已上线 700 张完全一致)

- **4:3 · 1600×1200 · WebP · ≤300KB**
- **同一张桌子**:中性暖白／米白哑光台面,单侧柔和窗光,右下方向柔和落影
- 45° 俯拍(汤羹、平盘类可正俯拍);**单一主菜居中,占画面 60–80%**
- 器皿:素色哑光白瓷或米白陶,一件为主;可有一件极简配件(一把木勺、一只小碟蘸料)
- 真实食物质感,不过度油亮、不喷胶感
- **绝对禁止**:文字、logo、水印、包装、餐牌、人物、手、品牌餐具、第二道成品菜

对照已上线参考图:`public/media/feast-red-wine-short-ribs.webp`(炖菜)、
`public/media/cny-steamed-coral-trout-whole.webp`(整鱼)、
`public/media/tea-scones-cream-jam.webp`(烘焙)。

---

## A. 修复重拍(18 张)—— 菜的内容变了,旧图不再准确

这些菜的食材清单被修正,成品外观随之改变。**沿用原 slug 覆盖同名文件。**

| #   | slug                                  | 中文             | 这次必须画对的地方                         |
| --- | ------------------------------------- | ---------------- | ------------------------------------------ |
| 1   | `midautumn-lotus-paste-mooncake`      | 莲蓉蛋黄月饼     | **切开一只,露出完整橙红咸蛋黄**            |
| 2   | `midautumn-salted-yolk-pumpkin`       | 咸蛋黄焗南瓜     | 南瓜条裹金沙咸蛋黄,颗粒感明显              |
| 3   | `cny-claypot-cured-meat-rice`         | 腊味煲仔饭       | **腊肠斜切片**铺面,不是火腿片;砂锅边有锅巴 |
| 4   | `mapo-tofu`                           | 麻婆豆腐         | 红油厚重、见豆瓣酱碎,撒花椒粉与葱花        |
| 5   | `midautumn-pomelo-honey-jelly`        | 柚子蜂蜜冻       | **柚子粗粒果肉**悬在琥珀冻里,不是橙瓣      |
| 6   | `japanese-tuna-free-avocado-tartare`  | 金枪鱼牛油果挞挞 | 生金枪鱼丁与牛油果丁分层堆叠               |
| 7   | `japanese-matcha-free-sesame-pudding` | 抹茶黑芝麻布丁   | 抹茶绿与芝麻灰双层                         |
| 8   | `cny-pineapple-free-sweet-sour-pork`  | 菠萝咕咾肉       | 见菠萝块,糖醋芡亮不糊                      |
| 9   | `xmas-cherry-free-berry-trifle`       | 樱桃浆果乳脂松糕 | 玻璃杯分层,顶部整颗樱桃                    |
| 10  | `bbq-watermelon-free-peach-salad`     | 西瓜蜜桃沙拉     | 西瓜块 + 烤桃 + 羊乳酪 + 薄荷              |
| 11  | `midautumn-five-kernel-free-nut-tart` | 五仁挞           | 表面五种坚果仁清晰可辨                     |
| 12  | `xmas-brie-free-baked-ricotta`        | 布里烤奶酪       | 整轮布里烤至中心流心                       |
| 13  | `indian-cardamom-free-rice-pudding`   | 小豆蔻米布丁     | 表面点缀绿豆蔻荚与开心果碎                 |
| 14  | `century-egg-congee`(如已存在则沿用)  | 皮蛋瘦肉粥       | 皮蛋切瓣墨绿溏心清晰                       |
| 15  | `smoked-salmon-toast`(沿用现 slug)    | 烟熏三文鱼吐司   | 橙红鱼片卷褶,配酸奶油与莳萝                |
| 16  | `xmas-roast-potatoes-duck-fat-free`   | 鸭油烤土豆       | 表皮极脆起壳,边角焦金                      |
| 17  | `french-coconut-chocolate-free-pots`  | 椰香巧克力盅     | 小陶盅装深色慕斯,顶部椰丝                  |
| 18  | `cny-crab-free-sweetcorn-fritters`    | 蟹肉玉米饼       | 见蟹肉丝与玉米粒                           |

> slug 若与仓库现有文件名不符,**以仓库现有为准**,不要新建。

---

## B. 新增菜品(60 张)

### B1 · 中秋 mid_autumn(20)

| slug                                     | 中文         | 要点                          |
| ---------------------------------------- | ------------ | ----------------------------- |
| `midautumn-crab-lion-head-meatball`      | 蟹粉狮子头   | 大肉圆浸清汤,顶部蟹黄         |
| `midautumn-osmanthus-candied-lotus`      | 桂花糖藕     | 藕片见糯米孔,淋桂花糖浆       |
| `midautumn-lotus-leaf-steamed-pork`      | 荷叶粉蒸肉   | 荷叶半开,内见米粉裹肉         |
| `midautumn-chestnut-braised-chicken-pot` | 板栗烧鸡煲   | 砂锅,栗子完整不散             |
| `midautumn-eight-treasure-duck`          | 八宝鸭       | 整鸭油亮,盘边露糯米馅         |
| `midautumn-taro-pork-claypot`            | 芋头扣肉煲   | 芋片与五花相间码放            |
| `midautumn-scallop-winter-melon-soup`    | 干贝冬瓜盅   | 冬瓜盅盛清汤,见干贝丝         |
| `midautumn-crab-roe-tofu`                | 蟹黄豆腐     | 橙黄蟹黄芡裹白豆腐            |
| `midautumn-pear-pork-rib-soup`           | 秋梨炖排骨   | 清汤见梨块与排骨              |
| `midautumn-five-kernel-mooncake`         | 五仁月饼     | 切开见五种坚果断面            |
| `midautumn-red-bean-mooncake`            | 豆沙月饼     | 切开见细腻豆沙                |
| `midautumn-snowskin-mooncake`            | 冰皮月饼     | 粉白半透明皮,3–4 只           |
| `midautumn-osmanthus-rice-wine-balls`    | 桂花酒酿圆子 | 小圆子浮酒酿,撒桂花           |
| `midautumn-osmanthus-pumpkin-cake`       | 糖桂花南瓜饼 | 金黄圆饼,表面桂花             |
| `midautumn-pomegranate-duck-breast`      | 石榴汁烤鸭胸 | 鸭胸斜切见粉红中心,石榴籽点缀 |
| `midautumn-water-chestnut-prawn`         | 菱角炒虾仁   | 虾仁弹白,菱角脆白             |
| `midautumn-lily-lotus-seed-soup`         | 百合莲子羹   | 清甜羹汤,见百合瓣与莲子       |
| `midautumn-pomelo-salad`                 | 柚子沙拉     | 柚子粗粒果肉 + 叶菜           |
| `midautumn-osmanthus-wine-steamed-fish`  | 桂花米酒蒸鱼 | 整鱼,酒酿汁,撒桂花            |
| `midautumn-chestnut-cream-square`        | 栗子蓉小方   | 栗子蓉裱花小方块              |

### B2 · 烧烤 bbq(16)

`bbq-charcoal-lamb-cutlets-mint` 炭烤羊排配薄荷 ·
`bbq-lemongrass-chicken-skewers` 香茅鸡腿串 ·
`bbq-garlic-butter-lobster-tail` 蒜香黄油龙虾尾 ·
`bbq-mussels-white-wine` 烤青口配白酒 ·
`bbq-grilled-squid-lemon` 炭烤鱿鱼配柠檬 ·
`bbq-honey-mustard-ribs` 蜂蜜芥末排骨 ·
`bbq-corn-chilli-butter` 烤玉米配辣椒黄油 ·
`bbq-watermelon-feta-salad` 西瓜羊乳酪沙拉 ·
`bbq-grilled-pineapple-rum` 炭烤菠萝配朗姆 ·
`bbq-smoked-beef-brisket` 烟熏牛胸肉 ·
`bbq-whole-snapper-grilled` 烤全鲷鱼 ·
`bbq-eggplant-tahini` 烤茄子配芝麻酱 ·
`bbq-sausage-roll-onion` 香肠热狗卷 ·
`bbq-halloumi-zucchini` 炭烤 halloumi 配西葫芦 ·
`bbq-peach-mascarpone` 烤桃配马斯卡彭 ·
`bbq-lemon-herb-chicken` 柠檬香草烤鸡

### B3 · 复活节 easter(14)

`easter-slow-lamb-leg-rosemary` 慢烤羊腿配迷迭香 ·
`easter-honey-mustard-ham` 蜂蜜芥末火腿 ·
`easter-cheese-tart` 复活节芝士挞 ·
`easter-lemon-curd-cake` 柠檬凝乳蛋糕 ·
`easter-spring-pea-veloute` 春季豌豆浓汤 ·
`easter-asparagus-hollandaise-plate` 芦笋配荷兰酱 ·
`easter-honey-roast-roots` 烤根菜配蜂蜜 ·
`easter-chocolate-nest-mousse-cup` 巧克力鸟巢慕斯 ·
`easter-hot-cross-bread-pudding` 十字面包布丁 ·
`easter-smoked-salmon-bagel` 烟熏三文鱼贝果 ·
`easter-spring-vegetable-risotto` 春季蔬菜烩饭 ·
`easter-lemon-new-potatoes` 柠檬烤新土豆 ·
`easter-carrot-cake` 胡萝卜蛋糕 ·
`easter-lamb-pie` 复活节羊肉派

### B4 · 意式 / Amalfi Fresh Pasta(10)

`italian-ribbon-pasta-wild-mushroom` 手工宽面配野菌 ·
`italian-filled-pasta-sage-butter` 意式饺配鼠尾草黄油 ·
`italian-gnocchi-gorgonzola` 土豆团子配戈贡佐拉 ·
`italian-lasagne-classic` 千层面 ·
`italian-pesto-beans-pasta` 香蒜酱意面配四季豆 ·
`italian-anchovy-caper-pasta` 凤尾鱼酸豆意面 ·
`italian-burrata-tomato-basil` 布拉塔配番茄罗勒 ·
`italian-salami-antipasto` 萨拉米拼盘 ·
`italian-pancetta-carbonara` 意式培根蛋面 ·
`italian-tiramisu-mascarpone` 马斯卡彭提拉米苏

---

## 最容易出错的地方

1. **月饼一定要切开一只**,不切开看不出馅,四款月饼会长得一模一样
2. **中秋那 20 道里有 6 道是砂锅/盅**,不要全用平盘,层次会闷
3. **烧烤类不要出现明火与烤架**(整只烤羊那张是唯一例外,已上线) —— 保持同一张桌子
4. **意面四款形状必须不同**:宽面 / 饺 / 团子 / 千层,不要都画成一团面
5. 78 张里有 **20 道甜品**,注意不要全是棕色圆形
