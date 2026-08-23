# The Market Pavilion — 概念演示与提案

> 独立概念演示，与 Chadstone / Vicinity 无任何隶属或合作关系。
> 店名、店铺位置均取自该中心公开的楼层导览，平面图为**示意图**，
> 不是建筑图纸。真实位置需以对方提供的数据为准。
> An independent concept demonstration. Not affiliated with, endorsed by, or
> produced for Chadstone. Trading names and positions come from the centre's
> own public directory; the plan is schematic.

---

## 1. 他们已经有什么

Market Pavilion 的 **Food Concierge** 现在提供两件事：

|             | 内容                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| 冷藏寄存    | 买完的生鲜寄存最多 4 小时，手机号注册 + 短信确认，Car Park C P1 可预约路边取货，每天 9:00–18:00 |
| AI 食谱工具 | 输入口味偏好、饮食要求、人数，返回**食谱建议**                                                  |

他们对自己的定位：「a place to shop, share, learn and indulge」，
「fresh ingredients from Australia's most-celebrated providores」。
馆内还有 **The Kitchen** —— 现场烹饪示范区。

## 2. 差距在哪里

他们的 AI 工具止步于**一道食谱**。真正的缺口在食谱之后：

```
他们:  偏好 → 食谱                    ← 然后呢？
我们:  开屏即有一桌 → 换菜 → 购物清单 → 馆内路线 → 扫码带走 → 寄存
```

具体到可以当面演示的五点：

1. **一桌，不是一道。** 6 人 4 道菜，前菜到甜品，份量按人数缩放，
   预算、热量、饮食禁忌一起满足。一道食谱不是一顿饭。
2. **开屏就有菜单。** 不需要先回答问题。屏幕亮着就已经是一桌可以做的菜，
   不满意再换 —— 橱窗前的人不会为了看一眼先填表。
3. **清单落到脚下。** 购物清单自动拆分到馆内**具体店铺**并排出行走顺序。
   这是 Market Pavilion 独有的价值：一桌菜天然分散在 5–6 家专门店。
4. **终点是他们的冰箱。** 路线最后一站永远是 Food Concierge ——
   「买齐后可寄存在这里，先逛后取」。他们已经建好的服务，
   第一次有了一个把顾客送过去的理由。
5. **中英双语，无需注册。** 无 cookie、无账号、无个人数据。
   扫码把菜单和清单带走，不留下任何东西。

## 3. 演示路线（已实现，可现场跑）

租户 ID `market-pavilion`，与超市/商场两个演示同一套代码，只多了两个 JSON
和一张 SVG。

**默认一桌（开屏即见，6 人 4 道）→ 6 站 5 家店：**

| #   | 店铺                  | 买什么                                |
| --- | --------------------- | ------------------------------------- |
| 1   | Maita Asian Grocer    | 酱油 · 糯米 · 香菇 · 芝麻油           |
| 2   | Gewurzhaus            | 肉桂粉                                |
| 3   | Coles                 | 红糖 · 黄油 · 面粉 · 蜂蜜             |
| 4   | Vic's Butcher & Deli  | 鸡腿肉                                |
| 5   | Colonial Fresh Market | 大蒜 · 苹果 · 黄瓜 · 葱 · 辣椒 · 生姜 |
| 6   | **Food Concierge**    | 买齐后寄存                            |

**「宴请大菜」一桌 → 同样 5 家店**，但换成 Fishmonger 的蟹肉海参、
Vic's 的熟成牛肉与羊腿。**意式一桌**会把第一站换成 **Amalfi Fresh Pasta**。
换句话说：不同的一桌，把客人送进不同的专门店。

平面图：`tenants/market-pavilion/floor.svg`（800×500 示意图）
截图：`.generated/shots-pavilion/`（10 张，1080×1920 / 1512×982 / 390×844）

## 4. 对着他们的店铺盘点目录

### 4.1 已经修掉的三类错误

对着 Market Pavilion 的店铺逐条核对目录时，发现的不是「缺什么」，
而是**清单会让人在柜台买错东西**：

| 菜                                                                                    | 清单原本写                           | 现在写                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- |
| 意式蘑菇烩饭 / 黑松露野菌烩饭 / 藏红花海鲜饭                                          | 长粒米                               | **意式烩饭米 arborio**                       |
| 火腿卷蜜瓜（Prosciutto and Melon）                                                    | 火腿 ham                             | **意式生火腿 prosciutto**                    |
| 柠檬虾扁面 linguine · 焗通心粉 macaroni · 米形面 orzo ×3 · 培根豌豆 carbonara 等 9 道 | 贝壳面 conchiglie（10 道菜共用一种） | **长意面 / 短意面 / 米形面**，按菜名各归各位 |

烩饭用长粒米、写着 linguine 却让人买贝壳面 —— 在一个把
**Amalfi Fresh Pasta** 当招牌的美食馆里演示，柜台后面的人第一眼就会看出来。
这三类是**错误**，不是缺口，已经改完。新增 5 个食材：
`arborio_rice` `prosciutto` `pasta_long` `pasta_short` `orzo`。

### 4.2 目录覆盖度（按他们的店）

| 店铺                      | 食材数 | 被菜谱引用次数 | 判断                 |
| ------------------------- | ------ | -------------- | -------------------- |
| Colonial Fresh Market     | 55     | 1297           | 充足                 |
| Coles / Woolworths / Aldi | 45     | 934            | 充足                 |
| Maita Asian Grocer        | 37     | 551            | 充足                 |
| Vic's Butcher & Deli      | 26     | 249            | 充足                 |
| Gewurzhaus                | 13     | 151            | 充足                 |
| Fishmonger                | 13     | 84             | 充足                 |
| Amalfi Fresh Pasta        | 5      | 30             | 修复后可用，仍可加深 |
| Ferguson Plarre Bakehouse | 2      | 31             | 偏薄                 |
| Liquorland Cellars        | 2      | 13             | 偏薄                 |

### 4.3 建议补充的食材（提案，未执行 —— 需要你的配额决定）

约 14 个，可解锁一批地中海 / 意式菜，正好对上这个馆的气质：

- **Amalfi Fresh Pasta**：鲜切宽面、意式馄饨（ravioli）、土豆团子、千层面皮
- **Vic's Butcher & Deli**：pancetta、萨拉米、凤尾鱼、酸豆、橄榄、马斯卡彭、布拉塔
- **Ferguson Plarre / 烘焙**：酥皮、薄脆酥皮
- **Liquorland**：气泡酒（庆祝一桌配一瓶）

配套约 20–24 道菜。这是新配额，等你决定再做。

### 4.4 目录**不该**去覆盖的店，才是真正的机会

馆内这些店卖的不是食材，是**成品的一道菜**：

> Breadtop · Little Sister Bakery · Croissant Bar by Laurent · Casa Nata ·
> Cannoleria · The Cupcake Queens · The Confectionist · Mork Chocolate ·
> Koko Black · Brunetti Oro · Champagne & Oyster Bar · Hanks Bagelry ·
> JSY Tea · Green Cup · Flowers Vasette

给它们加食材是错的。正确的做法是新增一种「**这道菜可以买，不用做**」——
甜品那一道，可以是自己烤的挞，也可以是 Cannoleria 的甜卷；
下午茶那一桌，可以直接把 Koko Black 写进去；一桌花，来自 Flowers Vasette。

对中心的意义很直接：路线从 **5 家店变成 8–10 家店**，
而且把之前完全够不着的甜品、烘焙、饮品、花店都拉进了同一条动线。
这是我能给这个提案加的最有价值的一条，也是他们现在的 AI 工具做不到的。

（`features.restaurants` 和 `kind: 'restaurant'` 已经在数据模型里，
但目前**没有任何界面读它** —— 「吃完再逛」的餐饮推荐是同一个位置的下一步。）

## 5. 找他们谈，需要你提供什么

**你来准备：**

1. **对接人。** Chadstone 是 **Vicinity Centres 与 Gandel Group 的 50/50 合资**，
   由 **Vicinity 运营** —— 而且 **Vicinity 的总部就设在 Chadstone 内**。
   决策的人就在楼里，这是个便宜。要找的是 Centre Management 里管
   Market Pavilion 的人，或 Vicinity 的 Retail Media / Customer Experience /
   Innovation 条线。领英或中心管理处前台都能问到。
   （来源：[Vicinity Centres](https://en.wikipedia.org/wiki/Vicinity_Centres)、
   [Chadstone Shopping Centre](https://en.wikipedia.org/wiki/Chadstone_Shopping_Centre)）
2. **公司主体与保险。** 提案会问：谁签合同、有没有 public liability、
   屏幕是谁的资产、谁维护。先想好一句话答案。
3. **演示硬件的决定。** 是我们带一台竖屏去，还是用他们现有的屏。
   带自己的更稳（离线也能跑）。
4. **商业模式的底线。** 中心付费？品牌赞助？还是按引流的店铺分摊？
   我不替你定价，但见面前要有一个数。
5. **是否公开部署。** 见下。

**我来准备（已完成或随时可做）：**

- 可现场跑的演示（离线可用，联网打开一次即可）
- 10 张截图 + 一页平面图
- 这份文档的英文单页版（要的话我写）
- 数据与隐私说明：无 cookie、无账号、无个人数据、无行为追踪 ——
  这条在跟商场谈的时候是加分项，因为它绕开了他们的隐私合规审查

**需要他们提供（第二次会面再要，第一次不要问）：**

- Market Pavilion 的真实店铺清单与位置（我们的平面图就能换成真的）
- Food Concierge 服务台的准确位置
- 各店的品类范围（谁卖什么，决定路线准不准）

## 6. 怎么演示

**线上（已部署）：** <https://demo-pavilion.pwestudio.site>

三层防护都在，不用再操心：

- **`robots.txt` 是 `Disallow: /`** —— 读 robots 就掉头的爬虫直接挡掉
- **`<meta name="robots" content="noindex, nofollow, nocache">`** —— 会渲染页面的爬虫也挡掉
- **页面最顶上一条常驻横幅**（不是 footer，中英双语跟着界面语言走）：

  > `DEMO` 独立概念演示 · 与 Chadstone 无隶属关系，店名与位置取自其公开导览，平面图为示意图

  横幅在**品牌抬头之上**——链接是会被转发的，下一个打开的人必须先读到这句，
  再读到店名。竖屏 kiosk 模式下字号会放大，一米外看得清。

链接只私下发给对接人。不进搜索引擎，不公开传播。

**当场带电脑演示：** 同一个网址就行。

- **出发前在有网的地方打开一次**，Service Worker 会把整站缓存下来，
  之后现场没网也能跑（菜单、图片、路线、二维码全都是静态的）。
- 全屏（`⌘ + Ctrl + F` 或 F11），横屏演示直接用；
  想演示橱窗形态就加 `?kiosk=1`，会切成竖屏大字 + 吸引屏轮播。
- 演示动线建议:开屏那一桌 → 点「宴请大菜」换一桌 → 购物清单 →
  **馆内路线**(这一步是重点,停在平面图上讲) → 二维码,让对方用自己手机扫走。

**要撤下来随时说一声** —— 删一个 Cloudflare Worker 的事。
