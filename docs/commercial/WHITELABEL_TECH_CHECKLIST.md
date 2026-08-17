# 白标技术准备执行清单（多租户 + 店内导航 + 路线卡）

> 内部执行文档。原则沿用产品红线：纯静态客户端、确定性规则、始终亮色、不引入重依赖、「打开即有内容」不得退化。
> **导航是本产品的核心卖点**——W1/W2 是这份清单的重心；多租户只是让它可以按客户复制的外壳。
> 预估总量：W0–W2 约 1.5–2 周；W3 三四天；W4 两天（法务在外部并行）；W5 两三天。

---

## W0 · 多租户外壳（约 2 天）

- [ ] **租户配置 schema**（`tenants/<id>/tenant.json`，zod 校验）：
  ```
  { id, displayName: {zh, en}, venueType: 'mall' | 'grocer',
    brand: { logoSvg, primary, accent, ogImage },
    locale: 'zh-CN' | 'en-AU',            // 默认语言
    features: { navigation, restaurants, kiosk },
    disclaimers: { extraZh?, extraEn? },   // 租户附加条款
    contact: { name, phone } }
  ```
- [ ] **构建期注入**：`npm run build -- --tenant=<id>` 走静态每租户构建（复用现有 emit-static 管线），品牌色映射到现有 CSS token，logo 替换 TableMark 位、favicon、OG 图模板化生成。
- [ ] **域名**：`<tenant>.onetable.app` 每租户一个 Worker 静态部署；主站不变。
- [ ] **联合品牌 footer**：`<租户 logo> × 一桌 One Table · Powered by PWE Studio`——合同里写明双 logo 并列展示是授权条件。
- [ ] **默认租户回归**：无租户构建 = 现有主站，逐字节不变（快照对比）。

**出口标准**：用虚构租户「Sample Centre」出一个完整白标部署；主站构建无 diff。

## W1 · 地点数据模型与采集（约 3 天）

- [ ] **场地 schema**（`tenants/<id>/venue.json`）：
  ```
  { floors: [{ level, nameZh, nameEn, planSvg }],
    pois: [{ poiId, nameZh, nameEn, level, zone, kind: 'store'|'restaurant'|'facility' }],
    ingredientMap: { [ingredientId]: poiId },
    categoryFallback: { [category]: poiId },   // 未映射食材落到品类默认店
    dishMap?: { [cuisine|role]: poiId[] } }    // 餐厅推荐（mall 版）
  ```
- [ ] **映射解析器**（domain 纯函数）：`resolveStops(shoppingList, venue)` → 按 `level → zone` 排序的站点清单，每站列出该店要买的食材；未命中 → categoryFallback → 显式「请询问服务台」条目，**绝不静默丢食材**。
- [ ] **校验脚本** `npm run venue:validate -- --tenant=<id>`：目录全部 ingredientId 可解析（直配或回退）；poiId 均存在；楼层引用均有平面图。
- [ ] **采集工作流**：半天现场用一张表格（食材 → 店/通道）录入；亚超版 zone 即通道号，无楼层概念（single floor）。
- [ ] **餐厅模式**（mall 版）：按当前菜单的菜系/课程给出 2–3 家租户餐厅推荐，同样走 poi 数据，不做菜品级匹配（那是虚假精度）。

**出口标准**：Sample Centre（2 层 12 店）与 Sample Grocer（单层 8 通道）两套示例数据全部通过校验。

## W2 · 路线卡（核心交付物，约 4 天）

**明确不做**：实时定位、蓝牙信标、寻路算法。V1 的「导航」= **有序站点清单 + 楼层示意图上的高亮路径**，生成一张可保存的路线卡。这是确定性、离线可用、成本为零的版本，也是商场场景的正确形态。

- [ ] **平面图约定**：每层一个简化示意 SVG（我们按租户平面图重绘为品牌风格示意图，非建筑图——重绘也规避了原图版权问题）；POI 在 SVG 里用 `data-poi` 锚点标注。
- [ ] **路径绘制**：按站点顺序连接 POI 锚点的折线 + 序号圆点（复用圆桌 logo 的视觉语言：站点=餐位点）。跨层用「电梯/扶梯」图标衔接。
- [ ] **界面**：购物清单面板新增「生成路线 Route」动作（feature-gated：`features.navigation`）——展示分层站点清单，每站含店名、该店购物项、勾选框。
- [ ] **路线卡导出**：复用 canvas 分享卡管线新增 `renderRouteCard`——租户 logo 头、站点清单、楼层示意路径、底部双语免责（见 DISCLAIMERS）。竖版 3:4，「存为图片」交互与现有一致；同时进打印视图（A4 一页）。
- [ ] **离线**：平面图 SVG 与租户配置进 SW 预缓存清单——地下层无信号照常可用（这是 demo 时的杀手锏，现场关掉 WiFi 演示）。
- [ ] **单测**：resolveStops 排序不变量（层内 zone 有序、跨层最少往返）、未映射食材回退、空清单安全。

**出口标准**：Sample Centre 里配一桌 8 道菜 → 生成路线卡 → 站点覆盖两层、未映射食材出现在服务台条目；飞行模式下重复全流程成功。

## W3 · Kiosk 模式（约 3 天）

- [ ] `?kiosk=1`：触控目标放大（≥56px）、隐藏外链与 footer 链接、闲置 90 秒自动重置回吸引屏。
- [ ] **吸引屏**：全屏轮播（本季菜单卡 + 「碰一下开始」），品牌联合展示。
- [ ] **手机交接**：kiosk 上配好的一桌 → 屏幕生成二维码（编码现有分享 URL）→ 顾客扫走，清单和路线在自己手机上。需一个极小的 QR 编码器（纯前端、零依赖或 ~10KB 单文件 MIT 实现，**作为例外在 PR 里说明理由**——这是 kiosk 闭环的必要件）。
- [ ] kiosk 硬件建议文档：任意安卓/Windows 触屏一体机 + 全屏浏览器即可，无专用硬件（这直接压低商场侧成本）。

**出口标准**：kiosk 流程「吸引屏 → 配菜 → 扫码带走」全触控走通；闲置自动复位。

## W4 · 免责声明与合规接入（约 2 天 + 法务外部并行）

- [ ] DISCLAIMERS.md 的文案接入五个位置：footer（常驻）、路线卡底部、打印页脚、分享卡底部、kiosk 吸引屏角标。
- [ ] 租户附加条款槽位（tenant.json → disclaimers）渲染在 footer 第二行。
- [ ] 隐私声明页（静态路由 `/privacy`）：无账号、无个人数据、匿名聚合计数——这是对商场法务的强卖点，写清楚。
- [ ] 周报计数实现约定：Cloudflare Workers 请求级聚合（scan/compose/list/route 四个计数器），无 cookie、无指纹。
- [ ] 全部免责文本交律师审阅（预算项，签约前完成）；商业责任险报价（Public Liability + Professional Indemnity）。

## W5 · 商务物料（约 2 天）

- [ ] **Demo 租户**：Sample Centre（虚构名、虚构平面图）完整部署在 `demo.onetable.app`——拜访时现场演示用，**绝不使用任何真实商场的名称、商标或平面图**。
- [ ] Pitch 一页纸排版成 PDF（用现有 OG 模板视觉），亚超版双面 A4 同理。
- [ ] **Campaign 报告模板**：扫码数 / 配菜数 / 清单导出数 / 路线卡保存数，周对比 + 热门菜系食材榜——试点结束交付的就是这份。
- [ ] 合同附件清单：服务范围、双 logo 条款、数据与隐私、免责、维护 SLA（通道变更 5 个工作日内同步）、case study 授权（创始价的对价）。

---

## 决策留档

| 决策       | 选择                   | 理由                                             |
| ---------- | ---------------------- | ------------------------------------------------ |
| 实时定位   | 不做                   | 重资产、高维护；静态路线卡离线可用且够用         |
| 多租户实现 | 构建期静态注入         | 复用整条静态管线，隔离好、故障面小               |
| 平面图     | 品牌风格重绘示意图     | 规避原图版权、视觉统一、文件小                   |
| 寻路       | 层内 zone 排序，无算法 | 商场动线简单，有序清单已解决问题                 |
| QR 编码器  | 允许一个微型依赖       | kiosk→手机交接是闭环必要件，红线例外需在 PR 说明 |
