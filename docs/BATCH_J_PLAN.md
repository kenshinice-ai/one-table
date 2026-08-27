# 第 J 批清单 —— 60 食材 + 78 菜品图

> 这一批**由食材驱动,不是由菜品驱动**。原因见下面第 1 节:目录里有 38 道菜
> 是"绕着缺失食材写出来的",补齐食材,这 38 道立刻变成它们本来该是的样子。
> 单位投入的回报比再加 100 道新菜高得多。

---

## 1. 为什么这批要先补食材

用脚本扫了一遍 700 道菜的 slug,发现一个此前没人提过的模式:**38 个 slug 里带
`-free-`**,意思是"这道菜本来要用 X,但目录里没有 X,所以绕开了"。

```
french-coconut-chocolate-free-pots      cny-pineapple-free-sweet-sour-pork
japanese-tuna-free-avocado-tartare      xmas-cherry-free-berry-trifle
japanese-matcha-free-sesame-pudding     bbq-watermelon-free-peach-salad
midautumn-pomelo-free-citrus-duck       midautumn-five-kernel-free-nut-tart
…共 38 道
```

这套命名是**好纪律**(没有骗人,缺什么就不写什么),但它意味着**目录的形状是被
缺失食材决定的,不是被菜决定的**。

其中 **9 个绕道现在已经失效** —— 那些食材后来补上了(dark_chocolate、crab_meat、
abalone、turkey、lemongrass、ginger、ricotta、prosciutto、melon)。这 9 道可以直接
改回原样,**不需要新图**。

另外还有一类更直接的错误 —— **标题写了,清单里没有**:

| 菜 | 标题承诺 | 清单里实际 |
|---|---|---|
| Lotus Paste Mooncake **with Salted Yolk** | 咸蛋黄 | 无(图里明明有蛋黄) |
| midautumn-salted-yolk-pumpkin | 咸蛋黄 | 无 |
| 腊味煲仔饭 cny-claypot-cured-meat-rice | 腊肠 | ham + bacon |
| 麻婆豆腐 mapo-tofu | 豆瓣酱 | 无 |
| midautumn-pomelo-honey-jelly | 柚子 | orange |

和之前的"烩饭用长粒米"是同一类问题。补上食材就能一起修掉。

---

## 2. 食材清单(60)

### 2.1 修复类(27)—— 补上就能解锁已有菜品

| id | 中文 | 类别 | 解锁 |
|---|---|---|---|
| `tuna` | 金枪鱼 | protein | 3 道 |
| `matcha` | 抹茶 | pantry | 3 道 |
| `pineapple` | 菠萝 | fruit | 2 道 |
| `brie` | 布里奶酪 | dairy | 2 道 |
| `cardamom` | 小豆蔻 | spice | 1 |
| `squid` | 鱿鱼 | protein | 1 |
| `pomelo` | 柚子 | fruit | 2 |
| `duck_fat` | 鸭油 | pantry | 1 |
| `cherry` | 樱桃 | fruit | 1 |
| `watermelon` | 西瓜 | fruit | 1 |
| `mixed_nuts` | 五仁 / 混合坚果 | nut | 1 |
| `plum` | 李子 | fruit | 1 |
| `century_egg` | 皮蛋 | protein | 1 |
| `smoked_salmon` | 烟熏三文鱼 | protein | 1 |
| `chia_seed` | 奇亚籽 | staple | 1 |
| `turkish_bread` | 土耳其面包 | staple | 1 |
| `crumpet` | 英式煎饼 | staple | 1 |
| `strawberry` | 草莓 | fruit | 1 |
| `earl_grey_tea` | 伯爵红茶 | pantry | 2 |
| `pesto` | 香蒜酱 | pantry | 1 |
| `zaatar` | 扎塔香料 | spice | 1 |
| `sriracha` | 是拉差辣酱 | pantry | 1 |
| `cranberry` | 蔓越莓 | fruit | 1 |
| `parsnip` | 欧防风 | vegetable | 1 |
| `salted_egg_yolk` | 咸蛋黄 | protein | 2 |
| `chinese_sausage` | 腊肠 | protein | 2 |
| `doubanjiang` | 郫县豆瓣酱 | pantry | 1+ |

### 2.2 Market Pavilion 租户覆盖(14)—— 让路线经过更多专门店

**Amalfi Fresh Pasta**:`pasta_fresh_ribbon` 鲜切宽面 · `pasta_filled` 意式饺
· `gnocchi` 土豆团子 · `lasagne_sheet` 千层面皮

**Vic's Butcher & Deli**:`pancetta` 意式培根 · `salami` 萨拉米 · `anchovy` 凤尾鱼
· `capers` 酸豆 · `olives` 橄榄 · `mascarpone` 马斯卡彭 · `burrata` 布拉塔

**Ferguson Plarre / 烘焙**:`puff_pastry` 酥皮 · `filo_pastry` 薄脆酥皮

**Liquorland**:`sparkling_wine` 气泡酒

### 2.3 中式底子(10)—— 300 道中餐没有绍兴酒和香醋说不过去

`shaoxing_wine` 绍兴料酒 · `black_vinegar` 镇江香醋 · `dried_shrimp` 虾米
· `wood_ear` 木耳 · `goji` 枸杞 · `lily_bulb` 百合 · `tofu_skin` 腐竹
· `chinese_chives` 韭菜 · `preserved_mustard` 榨菜 · `chilli_oil` 辣椒油

### 2.4 海鲜与蔬果拓宽(9)—— Fishmonger 与 Colonial 两站

`mussels` 青口 · `clams` 蛤蜊 · `barramundi` 尖吻鲈 · `rocket` 芝麻菜
· `artichoke` 洋蓟 · `pine_nut` 松子 · `hazelnut` 榛子 · `witlof` 菊苣
· `currants` 无核小葡萄干

---

## 3. 菜品清单(78 张图)

### 3.1 修复(18 张)—— 菜变了,图要重拍

9 道失效绕道改回原样后**不需要新图**(食材换了,成品没变)。另外 18 道成品会变:

咸蛋黄月饼 · 咸蛋黄焗南瓜 · 腊味煲仔饭 · 麻婆豆腐 · 柚子蜂蜜冻 ·
金枪鱼牛油果挞挞 · 抹茶黑芝麻布丁 · 抹茶千层 · 菠萝咕咾肉 · 樱桃浆果乳脂松糕 ·
西瓜蜜桃沙拉 · 五仁月饼挞 · 布里烤奶酪 · 小豆蔻米布丁 · 皮蛋瘦肉粥 ·
烟熏三文鱼吐司 · 伯爵茶巧克力挞(现有图可留) · 鸭油烤土豆

### 3.2 新增(60 道)—— 按"紧迫 × 稀薄"分配

现状:`mid_autumn 26` · `easter 17` · `bbq 28` · `christmas 50` · `cny 74` ·
`feast 43` · `party 61` · `weeknight 71` · `afternoon_tea 43` · `brunch 39`

| 场合 | 现有 | 新增 | 之后 | 理由 |
|---|---|---|---|---|
| **mid_autumn** | 26 | **+20** | 46 | 9/25 就到,且只有 **7 道主菜**,两主菜的桌子马上重复 |
| **bbq** | 28 | **+16** | 44 | 南半球 11 月开季,现在做正好 |
| **easter** | 17 | **+14** | 31 | 全场最薄,但 4 月才用,排最后 |
| **意式 / Amalfi** | — | **+10** | — | 跨标 weeknight/feast/party,直接服务 Amalfi 这一站 |

**mid_autumn +20**(重点补主菜):蟹粉狮子头 · 桂花糖藕 · 荷叶粉蒸肉 · 板栗烧鸡 ·
八宝鸭 · 芋头扣肉煲 · 干贝冬瓜盅 · 蟹黄豆腐 · 秋梨炖排骨 · 五仁月饼 ·
豆沙月饼 · 冰皮月饼 · 桂花酒酿圆子 · 糖桂花南瓜饼 · 石榴汁烤鸭胸 ·
菱角炒虾仁 · 百合莲子羹 · 柚子沙拉 · 桂花米酒蒸鱼 · 栗子蓉小方

**bbq +16**:炭烤羊排配薄荷 · 香茅鸡腿串 · 蒜香黄油龙虾尾 · 烤青口配白酒 ·
炭烤鱿鱼配柠檬 · 蜂蜜芥末排骨 · 烤玉米配辣椒黄油 · 西瓜羊乳酪沙拉 ·
炭烤菠萝配朗姆 · 烟熏牛胸肉 · 烤全鲷鱼 · 烤茄子配芝麻酱 · 香肠热狗卷 ·
炭烤halloumi配西葫芦 · 烤桃配马斯卡彭 · 柠檬香草烤鸡

**easter +14**:慢烤羊腿配迷迭香 · 蜂蜜芥末火腿 · 复活节芝士挞 · 柠檬凝乳蛋糕 ·
春季豌豆浓汤 · 芦笋配荷兰酱 · 烤根菜配蜂蜜 · 巧克力鸟巢慕斯 · 十字面包布丁 ·
烟熏三文鱼贝果 · 春季蔬菜烩饭 · 柠檬烤新土豆 · 胡萝卜蛋糕 · 复活节羊肉派

**意式 +10**:手工宽面配野菌 · 意式饺配鼠尾草黄油 · 土豆团子配戈贡佐拉 ·
千层面 · 香蒜酱意面配四季豆 · 凤尾鱼酸豆意面 · 布拉塔配番茄罗勒 ·
萨拉米拼盘 · 意式培根蛋面 · 马斯卡彭提拉米苏

---

## 4. 顺序建议

1. **先做 60 张食材图** —— 无歧义、可立刻开工、能同时修掉 38 道菜的清单
2. **再做 18 张修复图** —— 成品变了的那些
3. **最后 60 道新菜** —— 需要你先确认上面的场合分配

如果 Mid-Autumn 前只来得及做一批,做 **mid_autumn 那 20 道 + 咸蛋黄/腊肠/豆瓣酱
三个食材**,其余往后排。
