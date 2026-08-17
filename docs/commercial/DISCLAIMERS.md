# 免责声明与合规文案包（草案 · 律师审阅前不得商用签约）

> 双语文案草案，供 W4 接入界面与合同附件。**这是工作草案，不构成法律意见**；商用签约前必须由澳大利亚执业律师（消费者法 + 食品信息方向）审阅定稿，并确认与 Australian Consumer Law 的适配（免责声明不能排除 ACL 下不可排除的消费者保障，措辞须避免「排除一切责任」式的无效条款）。

---

## 1 · 通用（footer 常驻，现有文案的商用加强版）

**中文**：一桌提供的菜谱、营养、热量、价格与过敏原信息均为**规划参考估算**，并非营养学或医学建议。下厨与采购前，请务必核对商品包装上的成分与过敏原标签。

**English**: Recipes, nutrition, energy, pricing and allergen information on One Table are **planning estimates only** and do not constitute nutritional or medical advice. Always check the ingredient and allergen labels on product packaging before purchasing and cooking.

## 2 · 过敏原（详情页与筛选面板已有，商用版补充第二句）

**中文**：排除某过敏原时，系统会以确定性规则同时拦截「含有、衍生自、可能含有、来源不明」四类关系。但食材数据为编辑估算，商品配方可能变更——**最终请以包装标签为准；严重过敏者请谨慎依赖任何规划工具**。

**English**: When an allergen is excluded, deterministic rules block _contains, derived-from, may-contain and unknown_ relations alike. Ingredient data is editorial, however, and product formulations change — **the packaged label is final. Those with severe allergies should not rely solely on any planning tool.**

## 3 · 店内路线 / 导航（路线卡底部、打印页脚 —— 新增，核心）

**中文**：路线与店铺位置为**指引性示意**，按场地方提供的信息制作，实际以场内标识与店铺现状为准。店铺位置、货架陈列与营业时间可能变更。请遵守场内通行与安全指引；无障碍路线请咨询服务台。

**English**: Routes and store locations are **indicative guidance** prepared from information supplied by the venue. In-centre signage and actual store conditions prevail. Store locations, shelf layouts and trading hours may change. Please follow venue safety directions; for accessible routes, ask the concierge.

## 4 · 第三方与价格（mall 版菜单/餐厅推荐处）

**中文**：店铺与餐厅信息由场地方提供并可能变更；显示价格为区域性规划估算，**不构成任何商家的报价或要约**。餐厅供应以商家当日菜单为准。

**English**: Store and restaurant information is supplied by the venue and subject to change. Displayed prices are regional planning estimates and **do not constitute an offer or quote by any merchant**. Restaurant availability is per the merchant's menu on the day.

## 5 · 白标关系（footer 第二行，联合品牌场景）

**中文**：本服务由 PWE Group Pty Ltd（「一桌 One Table」）开发运营，经授权以〔场地名〕品牌联合呈现。〔场地名〕商标归其权利人所有。服务反馈请联系：〔联系方式槽位〕。

**English**: This service is developed and operated by PWE Group Pty Ltd ("One Table") and presented in partnership with [Venue] under licence. [Venue] trademarks belong to their respective owners. Service feedback: [contact slot].

## 6 · 隐私（`/privacy` 静态页）

**中文**：一桌不设账号、不收集姓名/电话/邮箱等任何个人信息、不使用跟踪 Cookie。为改进服务与向场地方汇报效果，我们仅统计匿名的聚合次数（如扫码次数、菜单生成次数）。分享链接中仅包含您选择的筛选条件，不包含身份信息。

**English**: One Table has no accounts and collects no personal information — no names, phone numbers or emails, and no tracking cookies. We count only anonymous, aggregate events (e.g. scans, menus composed) to improve the service and report campaign results to the venue. Share links carry only your chosen filters, never identity.

## 7 · 知识产权（合同附件用）

- 菜谱文本、结构化数据、界面与菜品示意图均为 PWE Group 原创/AI 辅助编辑内容，授权场地方在合同期内于约定渠道使用；**不含转授权**。
- 场地平面示意图由我方基于场地方提供的资料**重绘**为品牌风格示意图；场地方保证其有权提供该资料。
- 双 logo 联合展示为授权条件；任一方商标不得用于对方未批准的场景。

## 8 · 竞争合规（内部纪律，不进合同）

- 对外书面材料**不点名**任何第三方系统或其商标（含 Chadstone / The Market Pavilion）；对比仅用「existing AI menu kiosks」等品类表述，且仅陈述可验证事实（是否有店内路线、是否人工审核菜谱、是否双语）。
- Demo 与宣传物料只使用虚构场地（Sample Centre）；`ideas/` 目录中的实拍参考照片**仅限内部研究**，不出现在任何对外材料中。
- 我方功能为独立实现，无对第三方系统的代码、文案或视觉复制；本仓库的提交历史即开发过程证据。

## 9 · 待办（签约前硬性）

- [ ] 律师审阅本包全部文案（ACL 适配 + 免责有效性）。
- [ ] Public Liability + Professional Indemnity 保险报价与投保。
- [ ] 合同模板：服务范围 / SLA / 数据与隐私 / IP / 终止与数据交接。
- [ ] tenant.json 的 disclaimers 槽位与本包版本号挂钩（文案改版可追溯到具体部署）。
