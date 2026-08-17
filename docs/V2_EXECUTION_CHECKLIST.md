# One Table V2 执行清单（详细版）

> 依据 2026-08-17 改版提案评审结论。已锁定的决策：
>
> 1. **品牌**：一桌 · One Table（GitHub 仓库 `kenshinice-ai/one-table` 已建，main 分支现仅含 README）。
> 2. **架构**：继续纯静态客户端。D1 仓储、`/api/v1` 路由、AI 适配层保持休眠，本轮不接线、不删除。
> 3. **性能**：按本文 Phase 3 的预算与动作执行。
> 4. 其余按提案：顶栏搜索、Hero 移除、健康双控件、课程结构、详情页改版、打印 PDF + 购物清单、URL 分享、footer 版权、+200 道内容。
>
> 阶段必须按序完成；每阶段以「出口标准」全部通过为完成。

---

## Phase 0 — 工程基线（动 UI 前必须完成）

### 0.1 Git 接入
- [ ] 在项目根目录 `git init`，默认分支 `main`。
- [ ] `git remote add origin https://github.com/kenshinice-ai/one-table.git`，`git fetch origin`。
- [ ] 基于 `origin/main`（保留远端 README）合入本地工作树，首个提交为「V1 baseline」。
- [ ] `.gitignore` 覆盖：`node_modules/`、`.next/`、`.open-next/`、`.wrangler/`、`.dev.vars`、`*.tsbuildinfo`、`.DS_Store`、`.node_modules.backup-*/`、`.generated/`（若含可再生成物）。
- [ ] 推送 baseline 到 `origin/main`，打 tag `v1-baseline`。

### 0.2 iCloud 与副本清理
- [ ] 删除 iCloud 同步产生的副本文件：`src/components/planner-app 2.tsx`、`package-lock 2.json`、`.node_modules.backup-20260816/` 及其它 `* 2.*` 文件（先确认与正本无差异再删）。
- [ ] （强烈建议）把工作副本迁到非 iCloud 目录（如 `~/dev/one-table`）克隆自 GitHub；iCloud 目录仅作归档。若暂不迁移，至少确认以上副本不再被提交。

### 0.3 组件拆分（重构不改行为）
- [ ] 将 `planner-app.tsx`（1181 行）拆为：`AppHeader` / `TableSettings` / `FilterWorkspace` / `MenuBoard` / `RecipeDetail` / `Dropdown` / 共享 icons，状态仍集中在 `PlannerApp`。
- [ ] 拆分后 `npm run typecheck`、`npm test`、`npm run build` 全绿，页面行为与拆分前一致（手动走查中/EN 两语言态）。

### 0.4 CI 与基线数据
- [ ] GitHub Actions：push/PR 触发 `npm ci` → `recipes:validate` → `typecheck` → `test` → `build`。
- [ ] 记录性能基线：生产构建的首屏 JS 体积（gzip）、`launchRecipes` 数据体积、线上 Lighthouse（Performance/A11y/SEO）分数，写入 `docs/PERF_BASELINE.md`。

**出口标准**：远端 main 有 baseline tag；CI 绿；副本文件清零；组件拆分合入且无行为回归；性能基线数字落档。

---

## Phase 1 — P0 界面改版（一次上线形成 V2 感）

### 1.1 品牌更名「一桌 · One Table」
- [ ] `layout.tsx` metadata：title `一桌 · One Table`，description 双语更新。
- [ ] 顶栏 wordmark：衬线体「一桌」+ 小字 tagline「为一桌人，配一桌好菜」；EN 态显示 One Table。
- [ ] 圆桌俯视 logo（外环=桌、中心=主菜、六点=餐位）落为 `public/logo.svg` + `favicon.svg`/`apple-touch-icon.png`；餐位点数量随「用餐人数」联动为可选彩蛋，默认 6 点静态即可。
- [ ] `package.json` name 改 `one-table`；README 补品牌与线上地址。
- [ ] 全站文案将「聚餐菜单 / Menu Planning Companion」替换为新品牌（含 alt 文案模板）。

### 1.2 顶栏合并 + 全局搜索，删除 Hero
- [ ] 单行顶栏：logo + 品牌名（含 tagline 小字）｜中央搜索框｜「200 道」徽章｜中/EN 切换。删除「确定性安全规则即时生成…」副文（移入 footer）。
- [ ] Hero 区（kicker、大标题、副文、「首发内容 200」卡片）整块删除；首屏第一个区块即「餐桌设置」。
- [ ] 全局搜索（纯客户端索引）：范围 = 菜名中英、食材名、菜系名；前缀 + 子串匹配；`⌘K / Ctrl+K` 唤起、`Esc` 关闭；结果分组「菜谱 / 食材 / 菜系」。菜谱项 → 打开详情弹层；食材项 → 写入「希望包含食材」；菜系项 → 写入「菜系与地区」。
- [ ] 移动端（<768px）：搜索折叠为放大镜图标，点击展开覆盖层。

### 1.3 健康双控件
- [ ] **人均热量目标**（餐桌设置行新增下拉）：不限 / 轻盈 ≤900 / 适中 900–1400 / 丰盛 1400+ kcal·人。
- [ ] 引擎：`ScoreBreakdown` 增加 `kcalFit`（与 `budgetFit` 同构，带宽内 100 分，偏离线性衰减）；超带宽出黄色提示（复用 conflicts 机制，新增 `kcal_out_of_target`），**不做硬过滤**。
- [ ] **健康指数**（条件筛选面板新增）：domain 纯函数 `healthScore(recipe): 1–5`。规则：基础 3 分；钠/份 <600mg +1、>900mg −1；纤维 ≥6g +1；饱和脂肪 >8g −1；糖 >20g −1（`primaryRole === 'dessert'` 时糖阈值放宽到 30g）；结果 clamp 到 1–5。
- [ ] 筛选控件：不限 / ≥3 / ≥4 / 仅 5（与「最高辣度」同构）；菜卡与详情页展示叶子图标分值。
- [ ] Footer 免责声明补一句：健康指数为规划参考，非营养医学建议（双语）。
- [ ] 单测：`healthScore` 边界值、`kcalFit` 带宽衰减、甜品糖阈值特例。

### 1.4 课程结构显性化
- [ ] `PlannerPreferences` 增加 `roleOverrides: Partial<Record<PrimaryRole, number>> | null`（null = 沿用 `roleTemplate()` 推导）。
- [ ] 「菜品数量」下拉升级为「菜单结构」：上半保留数量快捷选择；下半为角色 chips 步进器（主菜/副菜/主食/甜品/汤/前菜/沙拉/小食 各 0–4），总数即菜品数量；任一修改进入自定义态，提供「恢复推荐结构」。
- [ ] 预设模板三个：家常合餐（现 family 模板）/ 西式三道（starter–main–dessert）/ 自助冷餐（优先 `holdQuality ≥ 4` 的角色组合）。
- [ ] 本桌菜单按课程分组渲染，节头顺序：小食→前菜→汤→沙拉→主菜→副菜→主食→甜品（仅渲染出现的课程）。
- [ ] 每个节头加「换这道 ↻」：仅重选该角色，其余菜固定，汇总重算；无替补时 toast 说明原因。
- [ ] 单测：roleOverrides 与模板推导的解析、分组渲染顺序、单课程重选不动其它菜。

### 1.5 URL 即状态（分享链接）
- [ ] 餐桌设置 + 筛选 + 组合种子序列化进 query（示例：`?v=1&g=6&d=4&style=family&budget=12000&kcal=mid&roles=main:2,side:1,staple:1,dessert:1&seed=8f3a`）。
- [ ] 载入时解析并恢复；变更 debounce 后 `replaceState`；无参数 = 现默认行为。
- [ ] 组合引擎的随机源改为以 `seed` 驱动的确定性 PRNG（同链接必得同一桌菜）；「换一组」= 换 seed。
- [ ] 单测：serialize/parse 往返一致、非法参数安全回退默认值。

### 1.6 Footer 版权
- [ ] 右下角两行：`© 2026 PWE Group Pty Ltd · PWE Studio`（链接 https://pwestudio.online/，`target="_blank" rel="noopener"`）/ `A Paradise Production · 天域文创出品`。EN 态照排不翻译。

**出口标准**：以上全部合入并部署；中/EN 走查通过；键盘可完成搜索→选菜全流程；分享链接在无痕窗口复现同一桌菜；CI 绿；Lighthouse 不低于基线。

---

## Phase 2 — P1 详情页与导出

### 2.1 食谱详情改版
- [ ] 食材两栏网格：缩略图 28px、名称左对齐、分量右对齐（`tabular-nums`）；`optional` 食材灰显 +「可选」角标。
- [ ] **按人数换算**开关（默认开，取当前用餐人数）：`normalizedQuantity × guests / baseServings`；`linear` 取整到 5g/10ml、`rounded` 向上取整数个、`constant` 不变、`manual` 显示基准量 + 「按口味调整」注记；`normalizedQuantity` 为 null 时回退 `displayQuantity`。
- [ ] 主料/调味分组：单位启发式（g/ml 大分量为主料，tbsp/tsp/少量为调味）；数据层可加 `group` 字段留作后续覆盖。
- [ ] 每行 checkbox（为购物清单铺垫）。
- [ ] 步骤结构化：translations 增可选 `structuredInstructions: Array<{ text; minutes?; phase?: 'prep'|'cook'|'plate'; tip? }>`；UI 有则渲染时间轴（左竖线 + 每步分钟数 + 顶部「动手 X · 总计 Y」），无则回退现有列表。`advanceMinutes > 0` 渲染「可提前 N 分钟准备」绿色 callout。
- [ ] 弹层 a11y：focus trap、`Esc` 关闭、恢复触发元素焦点。

### 2.2 打印 PDF + 合并购物清单
- [ ] 「导出 / 打印」入口（本桌菜单汇总区）：打开打印视图 → `window.print()`。
- [ ] 打印样式：第 1 页菜单总览（品牌、人数、四道菜、汇总）；每道菜一页（食材已按人数换算 + 步骤）；末页购物清单。
- [ ] 购物清单合并（domain 纯函数）：按 `ingredientId` 聚合，单位一致且 strategy 为 linear/rounded 的数量按人数换算后求和；无法合并的分行列出；按主料/调味（或后续 category）分区；界面上同时提供独立入口。
- [ ] 单测：跨菜合并求和、单位不一致不合并、manual/constant 不缩放。

### 2.3 SEO / 分享 meta
- [ ] OG image 静态资产（1200×630，品牌模板）；`openGraph`/`twitter` meta、双语 `alternates.languages`、`themeColor`、favicon 全套。

**出口标准**：macOS/iOS Safari 与 Chrome「存为 PDF」输出版式正确；购物清单数字抽查无误；详情弹层键盘走查通过。

---

## Phase 3 — 性能规划（预算 + 动作）

**预算（生产环境，桌面 & 中端手机 4G）**

| 指标 | 目标 |
| --- | --- |
| 首屏 JS（gzip） | ≤ 250 KB |
| 首视口总传输（冷缓存） | ≤ 1 MB |
| LCP | 桌面 ≤ 2.0s · 移动 ≤ 2.5s |
| CLS | < 0.1 |
| Lighthouse Performance | ≥ 90（中/EN 两态） |

**动作（按收益排序）**
- [ ] **图片（最大头）**：构建脚本预生成 3 档尺寸（320/640/1280）WebP + AVIF；`srcset/sizes` 输出；非首屏 `loading="lazy"`；所有图显式宽高防 CLS；占位图内联 SVG。
- [ ] **数据出包**：`data/recipes` 不再打进 JS bundle——构建期导出为带内容哈希的静态 JSON（当前 200 道约一份文件即可），客户端 fetch + `Cache-Control: immutable`；首屏出骨架；400 道后拆 summary/detail 两级按需加载。
- [ ] **静态资产缓存**：`/media/*`、数据 JSON、logo 走长缓存 + 哈希文件名（wrangler assets 配置）。
- [ ] **渲染**：菜卡 `memo` 化；筛选变更只重算受影响集合；搜索索引构建一次复用。
- [ ] 每阶段部署后重跑 Lighthouse 记入 `docs/PERF_BASELINE.md`，预算不达标视为该阶段未完成。
- [ ] 明确不做（当前规模）：列表虚拟化、SW 预缓存（随 Phase 4 PWA）、SSR 流式改造。

---

## Phase 4 — P2 内容扩充与增强

### 4.1 Batch E/F：+200 道（配额向课程短板倾斜）
| 角色 | 新增 | 说明 |
| --- | --- | --- |
| 前菜 starter | 30 | 课程结构上线后的第一瓶颈 |
| 汤 soup | 25 | 中西各半 |
| 沙拉 salad | 25 | 高健康指数密度 |
| 小食 snack | 10 | 自助/儿童场景 |
| 主菜 main | 60 | 补东南亚/中东/墨西哥/日韩菜系 |
| 副菜 side | 20 | — |
| 主食 staple | 15 | — |
| 甜品 dessert | 15 | — |

- [ ] 附加约束：≥40% 菜品 healthScore ≥4；≥50 道 totalMinutes ≤30；辣度与儿童友好分布均衡；全部带 `structuredInstructions`。
- [ ] 管线复用：zod schema、`recipes:validate`/`coverage` 脚本、launch-catalog 组装；图片沿用 ai_illustration 流程，**落盘路径与 UI 约定一致（`public/media/<slug>.webp`）**——注意现有 `media.objectKey`（`recipes/v1/...`）与 UI 实际加载路径（`/media/<slug>.webp`）不一致，扩充前先统一。

### 4.2 备选清单界面
- [ ] 每道菜卡「更多选择」：抽屉列出当前条件下同角色备选（按 score 排序），显示差值 chips（−AU$3 · +80 kcal · 健康 +1），点击替换并重算。
- [ ] 「200 道符合条件」改为可点击：展开按课程分组的完整符合清单（400 道后如卡顿再上虚拟化）。

### 4.3 PWA
- [ ] `manifest.webmanifest` + 192/512 图标；SW 对 `/media`、数据 JSON cache-first——离线可查菜谱与购物清单（超市场景）。

**出口标准**：`recipes:validate`/`coverage` 全绿，总量 400；备选替换往返无状态错乱；PWA 可安装、飞行模式可查已看过的菜单。

---

## 全程红线

- 不接 D1/API、不做账号与邮件、不引入 AI 运行时评分（健康指数必须确定性）。
- 产品保持始终亮色（V1 已定），不加深色模式。
- 不引入 UI 框架/组件库等重依赖；新依赖需在 PR 说明理由。
- 过敏原拦截逻辑（contains/derived_from/may_contain/unknown 全拦）不得放松。
- 每阶段独立 PR + 线上验证后再进下一阶段。
