# 生图任务 ⑥:食材图 60 张

> **交付物只有图片文件。不要改任何注册表 / JSON / 代码。**
> 项目根目录:`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`
> 输出路径:`public/media/ingredients/<id>.webp` —— 文件名用下表 id 原文,不要改。

## 硬规格(与已上线 199 张完全一致,一个字都不要改)

- **4:3 · 1600×1200 · WebP · ≤200KB**
- 中性暖白／米白台面(与全部已上线食材图同一张桌子),单侧柔和窗光,柔和落影
- 45° 俯拍或正俯拍;主体居中,占画面 55–75%
- 会被缩到 **28×28 像素**显示 —— 粉状/细小/液体类**必须盛在素色哑光浅碟或小玻璃碗里**,靠容器给轮廓
- 器皿最多一件
- **绝对禁止**:文字、logo、水印、包装、标签、人物、手、第二种食材

参考已上线图:`tomato.webp`(整颗无容器)、`butter.webp`(浅碟)、`saffron.webp`(浅碟盛细料)、`prosciutto.webp`(薄片叠放)。

## 分类画法

| 类型      | 画法                                         |
| --------- | -------------------------------------------- |
| 整只蔬果  | 整只 + 一个切面,露出内部                     |
| 生蛋白    | 生的原状,不烹饪不摆盘;切块类给一个切面露纹理 |
| 贝类甲壳  | 带壳,2–4 只成组                              |
| 粉状/香料 | 浅碟堆成小丘,可带一小撮散落                  |
| 酱料/液体 | 小玻璃碗或浅碟,表面平整有光                  |
| 干货      | 干燥原状堆在浅碟里                           |
| 面食      | 干的成束或成堆;鲜面盘成松散一团              |

## 清单

### A. 修复类(27)

| #   | 文件名                 | 中文 / English                 | 画法要点                                             |
| --- | ---------------------- | ------------------------------ | ---------------------------------------------------- |
| 1   | `tuna.webp`            | 金枪鱼 / Tuna                  | 生金枪鱼块,深红色,一个切面见肌理;不是罐头            |
| 2   | `matcha.webp`          | 抹茶粉 / Matcha                | 浅碟盛鲜绿细粉,堆成小丘                              |
| 3   | `pineapple.webp`       | 菠萝 / Pineapple               | 整只带冠 + 一片厚切                                  |
| 4   | `brie.webp`            | 布里奶酪 / Brie                | 圆轮切一角,露出内部软芯                              |
| 5   | `cardamom.webp`        | 小豆蔻 / Cardamom              | 浅碟盛绿色豆蔻荚,可有一颗剖开                        |
| 6   | `squid.webp`           | 鱿鱼 / Squid                   | 生鱿鱼筒 + 触须,整只                                 |
| 7   | `pomelo.webp`          | 柚子 / Pomelo                  | 整只 + 剥开一瓣露出粗粒果肉;**比葡萄柚大、皮厚**     |
| 8   | `duck_fat.webp`        | 鸭油 / Duck fat                | 小玻璃罐/浅碟盛半凝固乳白色油脂                      |
| 9   | `cherry.webp`          | 樱桃 / Cherries                | 一小堆带梗深红樱桃                                   |
| 10  | `watermelon.webp`      | 西瓜 / Watermelon              | 一角三角形切块,红瓤绿皮                              |
| 11  | `mixed_nuts.webp`      | 五仁 / Mixed nuts              | 浅碟盛混合坚果仁(杏仁核桃瓜子芝麻花生)               |
| 12  | `plum.webp`            | 李子 / Plums                   | 2–3 颗整只 + 一个切面见果核                          |
| 13  | `century_egg.webp`     | 皮蛋 / Century egg             | 剥壳整只 + 一个纵切面,**琥珀色蛋白、墨绿溏心**       |
| 14  | `smoked_salmon.webp`   | 烟熏三文鱼 / Smoked salmon     | 橙红薄片 3–4 片自然叠放                              |
| 15  | `chia_seed.webp`       | 奇亚籽 / Chia seeds            | 浅碟盛灰黑细籽小丘                                   |
| 16  | `turkish_bread.webp`   | 土耳其面包 / Turkish bread     | 一整块扁长面包,表面有芝麻与压纹                      |
| 17  | `crumpet.webp`         | 英式煎饼 / Crumpet             | 2–3 片叠放,**正面必须见蜂窝孔**                      |
| 18  | `strawberry.webp`      | 草莓 / Strawberries            | 一小堆带蒂,可有一颗对半切                            |
| 19  | `earl_grey_tea.webp`   | 伯爵红茶 / Earl Grey           | 浅碟盛干茶叶,可见佛手柑皮屑                          |
| 20  | `pesto.webp`           | 香蒜酱 / Pesto                 | 小碗盛浓绿酱,表面见坚果与叶碎颗粒                    |
| 21  | `zaatar.webp`          | 扎塔香料 / Za'atar             | 浅碟盛橄榄绿混合香料,见芝麻与漆树粉红点              |
| 22  | `sriracha.webp`        | 是拉差辣酱 / Sriracha          | 小碗盛亮橙红顺滑辣酱;**不要瓶子**                    |
| 23  | `cranberry.webp`       | 蔓越莓 / Cranberries           | 一小堆新鲜整颗,深红                                  |
| 24  | `parsnip.webp`         | 欧防风 / Parsnip               | 2–3 根整根,米白色,**比胡萝卜粗且顶端更宽**           |
| 25  | `salted_egg_yolk.webp` | 咸蛋黄 / Salted egg yolk       | 浅碟盛 3–4 颗煮熟咸蛋黄,**橙红、表面微油、有沙质感** |
| 26  | `chinese_sausage.webp` | 腊肠 / Chinese sausage         | 2–3 根整根,深红油亮,可见肥丁                         |
| 27  | `doubanjiang.webp`     | 郫县豆瓣酱 / Chilli bean paste | 小碗盛深红褐色粗粒酱,见蚕豆瓣与辣椒碎                |

### B. Market Pavilion 租户覆盖(14)

| #   | 文件名                    | 中文 / English                | 画法要点                                    |
| --- | ------------------------- | ----------------------------- | ------------------------------------------- |
| 28  | `pasta_fresh_ribbon.webp` | 鲜切宽面 / Fresh ribbon pasta | 蛋黄色鲜面松散盘成一团,微撒面粉             |
| 29  | `pasta_filled.webp`       | 意式饺 / Filled pasta         | 6–8 只 ravioli 或 tortellini,浅碟或直接台面 |
| 30  | `gnocchi.webp`            | 土豆团子 / Gnocchi            | 浅碟盛一堆,**表面必须有叉痕纹路**           |
| 31  | `lasagne_sheet.webp`      | 千层面皮 / Lasagne sheets     | 干面皮 4–5 张叠放,边缘波浪                  |
| 32  | `pancetta.webp`           | 意式培根 / Pancetta           | 卷状切片或厚丁,粉白相间                     |
| 33  | `salami.webp`             | 萨拉米 / Salami               | 薄片扇形排开,见白色脂肪斑点                 |
| 34  | `anchovy.webp`            | 凤尾鱼 / Anchovies            | 浅碟盛油浸鱼柳 4–6 条                       |
| 35  | `capers.webp`             | 酸豆 / Capers                 | 小碗盛盐渍酸豆                              |
| 36  | `olives.webp`             | 橄榄 / Olives                 | 浅碟盛混合橄榄(绿与紫黑)                    |
| 37  | `mascarpone.webp`         | 马斯卡彭 / Mascarpone         | 小碗盛象牙白浓稠奶酪,表面一道勺痕           |
| 38  | `burrata.webp`            | 布拉塔 / Burrata              | 整只白色球状,浅碟,顶部微开露出内芯          |
| 39  | `puff_pastry.webp`        | 酥皮 / Puff pastry            | 生酥皮一叠或卷起,见层次边缘                 |
| 40  | `filo_pastry.webp`        | 薄脆酥皮 / Filo pastry        | 极薄面皮数张半透明叠放                      |
| 41  | `sparkling_wine.webp`     | 气泡酒 / Sparkling wine       | 一只斟满的笛型杯,见气泡柱;**无瓶、无标签**  |

### C. 中式底子(10)

| #   | 文件名                   | 中文 / English           | 画法要点                        |
| --- | ------------------------ | ------------------------ | ------------------------------- |
| 42  | `shaoxing_wine.webp`     | 绍兴料酒 / Shaoxing wine | 小玻璃碗盛琥珀色清酒液          |
| 43  | `black_vinegar.webp`     | 镇江香醋 / Black vinegar | 小玻璃碗盛深褐近黑醋液,表面反光 |
| 44  | `dried_shrimp.webp`      | 虾米 / Dried shrimp      | 浅碟盛橙粉色小干虾一堆          |
| 45  | `wood_ear.webp`          | 木耳 / Wood ear          | 泡发后黑褐色卷片,浅碟盛         |
| 46  | `goji.webp`              | 枸杞 / Goji berries      | 浅碟盛橙红干果一堆              |
| 47  | `lily_bulb.webp`         | 百合 / Lily bulb         | 新鲜白色鳞片散开,浅碟           |
| 48  | `tofu_skin.webp`         | 腐竹 / Tofu skin         | 干腐竹棒 3–4 根,浅米黄          |
| 49  | `chinese_chives.webp`    | 韭菜 / Chinese chives    | 一小束扁叶韭菜,扎起             |
| 50  | `preserved_mustard.webp` | 榨菜 / Preserved mustard | 浅碟盛切丝榨菜,红褐带辣椒粉     |
| 51  | `chilli_oil.webp`        | 辣椒油 / Chilli oil      | 小碗盛红油,底部见辣椒碎沉淀     |

### D. 海鲜与蔬果(9)

| #   | 文件名            | 中文 / English          | 画法要点                         |
| --- | ----------------- | ----------------------- | -------------------------------- |
| 52  | `mussels.webp`    | 青口 / Mussels          | 带壳生青口 4–6 只成组,壳黑蓝有光 |
| 53  | `clams.webp`      | 蛤蜊 / Clams            | 带壳生蛤蜊一小堆,壳灰白带纹      |
| 54  | `barramundi.webp` | 尖吻鲈 / Barramundi     | 生鱼柳带皮一块,银皮白肉          |
| 55  | `rocket.webp`     | 芝麻菜 / Rocket         | 一小把新鲜叶,深绿锯齿边          |
| 56  | `artichoke.webp`  | 洋蓟 / Artichoke        | 整只带梗 + 可选一只对半切        |
| 57  | `pine_nut.webp`   | 松子 / Pine nuts        | 浅碟盛象牙色长粒松子仁           |
| 58  | `hazelnut.webp`   | 榛子 / Hazelnuts        | 带壳与去壳各几颗混放             |
| 59  | `witlof.webp`     | 菊苣 / Witlof           | 2 只整只,米白带浅黄叶尖          |
| 60  | `currants.webp`   | 无核小葡萄干 / Currants | 浅碟盛深紫黑小粒干果             |

## 最容易画错的 6 个,重点检查

1. **`pomelo` 不是葡萄柚** —— 更大、皮更厚、果肉粗粒不出汁
2. **`century_egg` 不是普通水煮蛋** —— 蛋白必须是半透明琥珀色,蛋黄墨绿
3. **`parsnip` 不是白胡萝卜** —— 顶端明显更宽,表面更粗糙
4. **`crumpet` 不是松饼/pancake** —— 正面必须密布蜂窝孔
5. **`gnocchi` 不是白色小丸子** —— 必须有叉子压出的纹路
6. **`salted_egg_yolk` 不是生蛋黄** —— 熟的、橙红、沙质、微微出油
