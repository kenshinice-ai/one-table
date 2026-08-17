# Luna-Max / Codex V2 改版执行 Prompt

> 使用方式：把本文件从「Prompt 开始」到「Prompt 结束」完整交给 luna-max / codex。不要删减验收标准、规则定义或禁止项。配套详细清单见 `docs/V2_EXECUTION_CHECKLIST.md`（两者冲突时以本 Prompt 为准）。

---

## Prompt 开始

你是本项目的高级实现工程师。请直接在当前仓库内完成下面定义的工作，并持续工作到所有可执行的验收项通过。不要只做分析，不要停在半成品，不要要求用户替你决定常规的组件命名、CSS 组织、类型或测试细节。

项目根目录：

`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`

### 0. 总目标与优先级

按以下不可颠倒的顺序执行：

1. **接入 Git 远端并保住回退点**：本地目前不是 Git 仓库；GitHub 远端 `kenshinice-ai/one-table` 已存在（main 仅含 README）。先建仓、合入远端、提交 V1 baseline 并推送，然后才允许改任何代码。
2. **工程基线**：清理 iCloud 副本文件；把 `planner-app.tsx` 拆分为独立组件（纯重构，不改行为）；建立 GitHub Actions CI；记录性能基线。
3. **P0 界面改版**（一次交付）：品牌更名「一桌 · One Table」、单行顶栏 + 全局搜索、删除 Hero、人均热量目标 + 健康指数、课程结构编辑与分组菜单、URL 分享链接、footer 版权。
4. **P1 详情与导出**：食谱详情改版（食材换算、两栏排版、结构化步骤时间轴）、打印 PDF + 合并购物清单、OG/SEO meta。
5. **性能落地**：图片多尺寸预生成、菜谱数据移出 JS bundle、长缓存策略，达到第 7 节预算。
6. 完成测试、浏览器验收、无障碍检查，再部署更新版并线上验证。

Batch E/F（+200 道菜谱）与 PWA **不在本次范围**，见第 3 节。

当本 Prompt 与仓库实际代码冲突时，以仓库证据为准，但不得改变已锁定的产品方向与验收标准。发现真正的架构、安全、数据或外部权限阻塞时，提供证据和最小必要问题；其余决定自行完成。

### 1. 开始前必须读取和检查

完整阅读以下文件，不要只读摘要：

- `AGENTS.md`（注意其中 Next.js 版本警告：先读 `node_modules/next/dist/docs/` 相关指南再写 Next 相关代码）
- `package.json`、`wrangler.jsonc`、`open-next.config.ts`
- `docs/V2_EXECUTION_CHECKLIST.md`（本次改版的详细清单）
- `docs/UX_UI_SPEC.md`、`docs/ARCHITECTURE.md`、`docs/DATA_MODEL.md`
- `src/components/planner-app.tsx`
- `src/app/layout.tsx`、`src/app/page.tsx`、`src/app/globals.css`
- `src/domain/planner.ts`、`src/domain/batch-a.ts`、`src/domain/recipe.ts`
- `data/recipes/index.ts`（launch catalog 组装方式）
- `scripts/recipes/validate.ts`、`tests/` 下现有测试

检查并记录基线（区分既有失败与本次引入的回归）：

- `git status`（预期：尚无仓库，这是任务 T0 的对象）
- `npm run recipes:validate`、`npm run typecheck`、`npm test`、`npm run build`
- 生产构建的首屏 JS 体积与页面数据体积

### 2. 当前仓库事实（执行时必须重新验证）

- 技术栈：Next.js 16、React 19、TypeScript、原生 CSS、Zod、Cloudflare OpenNext；包管理器 npm。
- 前端为**纯静态客户端**：`page.tsx` 直接 `import { launchRecipes }` 渲染 `PlannerApp`；D1 仓储、`/api/v1` 路由、`src/server/ai/` 已存在但未接线——**保持休眠，不接、不删**。
- 菜谱共约 200 道，位于 `data/recipes/batch-{a..d}.ts`，由 `data/recipes/index.ts` 组装；`nutrition` 含 kcal/蛋白/脂肪/饱和脂肪/糖/纤维/钠等完整字段。
- `planner.ts` 是无框架依赖纯函数：`roleTemplate()` 已按 snack/starter/soup/main/side/staple/salad/dessert 排菜；每次组合已产出 `candidateMenus`。
- `planner-app.tsx` 为 1181 行单组件；`RecipeImage` 从 `/media/<slug>.webp` 加载（注意与 `media.objectKey` 的 `recipes/v1/...` 路径不一致，本次不处理图片内容，但新代码一律以 `/media/<slug>.webp` 为准）。
- 产品**始终亮色**（V1 已锁定），无深色模式。
- iCloud 同步产生了副本文件：`src/components/planner-app 2.tsx`、`package-lock 2.json`、`.node_modules.backup-20260816/` 等。

### 3. 明确不做的范围

- 不接入 D1/API/AI 运行时，不做账号体系、邮件导出、宾客链接。
- 不新增菜谱内容（Batch E/F 另行执行），不做 PWA/Service Worker，不做长图分享卡。
- 不加深色模式；不引入 UI 框架、组件库或其它重依赖（新依赖必须在提交说明中给出理由）。
- 不放松过敏原拦截（contains/derived_from/may_contain/unknown 全拦）。
- 不改动 `db/`、`migrations/`、`src/server/` 下的休眠代码。

### 4. 任务定义

#### T0 · Git 接入与工程卫生（先于一切代码改动）

1. `git init`（分支 `main`）→ `git remote add origin https://github.com/kenshinice-ai/one-table.git` → `git fetch origin` → 以远端 main 为基础合入本地工作树（保留远端 README，本地 README 内容并入）。
2. 写 `.gitignore`：`node_modules/`、`.next/`、`.open-next/`、`.wrangler/`、`.dev.vars`、`*.tsbuildinfo`、`.DS_Store`、`.node_modules.backup-*/`。
3. 删除副本文件（删除前 diff 确认与正本无实质差异）：`planner-app 2.tsx`、`package-lock 2.json`、`.node_modules.backup-20260816/`、其它 `* 2.*`。
4. 提交「chore: V1 baseline」，推送，打 tag `v1-baseline`。
5. 拆分 `planner-app.tsx` → `AppHeader` / `TableSettings` / `FilterWorkspace` / `MenuBoard` / `RecipeDetail` / `Dropdown` / icons 模块；状态保持集中于 `PlannerApp`；此提交不得包含任何行为变化。
6. GitHub Actions：push/PR 跑 `npm ci` → `recipes:validate` → `typecheck` → `test` → `build`。
7. 把基线数字（JS 体积、Lighthouse、构建耗时）写入 `docs/PERF_BASELINE.md`。

验收：远端 main 含 baseline tag 与拆分提交；CI 绿；`git status` 干净；页面行为与拆分前逐屏一致。

#### T1 · 品牌更名「一桌 · One Table」

1. metadata title `一桌 · One Table`；description 双语更新；`package.json` name `one-table`。
2. 顶栏 wordmark：衬线「一桌」+ tagline 小字「为一桌人，配一桌好菜」；EN 态显示 One Table / "A table of people, a table of good food" 级别的自然英译。
3. Logo：圆桌俯视 SVG——外环（陶土红描边）为桌、中心实心圆为主菜、环绕 6 个墨绿小圆为餐位；落为 `public/logo.svg`、`favicon`、`apple-touch-icon`；色值取自现有 CSS 变量，不引入新色。
4. 全站替换「聚餐菜单 / Menu Planning Companion」措辞（含图片 alt 模板、README）。

#### T2 · 顶栏合并 + 全局搜索 + 删除 Hero

1. 单行顶栏：logo + 品牌名｜中央搜索框｜「200 道」徽章｜中/EN 切换。「确定性安全规则即时生成 · AI 仅做候选策展」移入 footer。
2. Hero 区整块删除；「餐桌设置」成为首个区块。
3. 搜索（纯客户端）：索引 = 菜名（双语）+ 食材名 + 菜系名；前缀与子串匹配；`⌘K / Ctrl+K` 唤起、`Esc` 关闭、方向键选择；结果分组「菜谱 / 食材 / 菜系」——菜谱→打开详情；食材→写入 `mustIncludeIngredientIds`；菜系→写入 `cuisines`。写入后有可见反馈（对应筛选框计数徽章变化）。
4. <768px 折叠为图标 + 覆盖层。

验收：桌面 1280px 下顶栏高 ≤72px；首屏可见设置行 + 筛选面板 + 菜单前两道；全键盘完成「搜索→选中→条件写入」。

#### T3 · 健康双控件

1. **人均热量目标**：餐桌设置行新增下拉——不限 / 轻盈 ≤900 / 适中 900–1400 / 丰盛 1400+（kcal·人）。进评分不做硬过滤：`ScoreBreakdown` 新增 `kcalFit`（带宽内 100，偏离按每 100kcal 递减，最低 0）；超带宽通过 conflicts 新增码 `kcal_out_of_target` 出黄色提示。
2. **健康指数**：`src/domain` 新增纯函数 `healthScore(recipe): 1|2|3|4|5`——基础 3；钠/份 <600mg +1、>900mg −1；纤维 ≥6g +1；饱和脂肪 >8g −1；糖 >20g −1（dessert 阈值 30g）；clamp 1–5。禁止任何运行时 AI 参与。
3. 筛选面板新增「健康指数」下拉：不限 / ≥3 / ≥4 / 仅 5；实现路径与 `maxSpiceLevel` 完全同构（含 exclusion reason 码 `health_below_min`）。
4. 菜卡与详情页展示叶子图标分值；footer 免责声明补「健康指数为规划参考，非营养医学建议」（双语）。
5. 单测：healthScore 每条规则的边界值、dessert 特例、kcalFit 衰减曲线、筛选排除计数。

#### T4 · 课程结构

1. `PlannerPreferences` 增 `roleOverrides: Partial<Record<PrimaryRole, number>> | null`；null 时沿用 `roleTemplate(dishCount, servingStyle)`。
2. 「菜品数量」下拉升级为「菜单结构」：上半为数量快捷选择（1–10，行为不变）；下半为 8 个角色的步进 chips（0–4），总和即菜品数量；任一修改进入自定义态并显示「恢复推荐结构」。
3. 预设：家常合餐（family 模板）/ 西式三道（starter–main–dessert）/ 自助冷餐（`holdQuality ≥ 4` 优先的组合）。
4. 本桌菜单按课程分组，节头顺序：小食→前菜→汤→沙拉→主菜→副菜→主食→甜品；每节头「换这道 ↻」只重选该角色（其余固定、汇总重算），无替补时给出原因 toast。
5. 单测：overrides 解析、总数一致性、单角色重选的不变量（其它菜 id 不变）。

#### T5 · URL 即状态

1. 序列化餐桌设置 + 筛选 + seed 进 query：`?v=1&g=6&d=4&style=family&budget=12000&kcal=mid&roles=main:2,side:1,staple:1,dessert:1&cuisine=…&seed=8f3a`。载入解析恢复；变更 debounce 300ms 后 `replaceState`；无参数 = 现默认。
2. 组合过程中的随机源全部改为 seed 驱动的确定性 PRNG（如 mulberry32，自实现十几行，不加依赖）；「换一组」= 换 seed 并写回 URL。
3. 单测：serialize/parse 往返、非法值回退、同 seed 同输入 → 同菜单。

#### T6 · Footer 版权

右下角两行（EN 态照排）：
`© 2026 PWE Group Pty Ltd · PWE Studio`（PWE Studio 链接 https://pwestudio.online/，`target="_blank" rel="noopener"`）
`A Paradise Production · 天域文创出品`

#### T7 · 食谱详情改版

1. 食材两栏网格：28px 缩略图、名称左对齐、分量右对齐（`font-variant-numeric: tabular-nums`）；optional 食材灰显 +「可选」角标；行首 checkbox。
2. 「按 N 人换算」开关（默认开，N = 当前用餐人数）：`normalizedQuantity × guests / baseServings`；linear → 取整到 5g/10ml；rounded → 向上取整数个；constant → 不变；manual → 显示基准量 +「按口味调整」；normalizedQuantity 为 null 时回退 displayQuantity 原文。
3. 主料/调味分组（单位启发式：g/ml 且换算后 ≥50g/50ml 为主料，其余为调味；tbsp/tsp 一律调味）。
4. 步骤：translations 增可选 `structuredInstructions: Array<{ text: string; minutes?: number; phase?: 'prep'|'cook'|'plate'; tip?: string }>`（zod schema 同步、向后兼容——现有数据不迁移）；有则渲染时间轴（竖线串联、每步分钟数、顶部「动手 X 分钟 · 总计 Y 分钟」），无则回退现有列表；`advanceMinutes > 0` 渲染「可提前 N 分钟准备」callout。
5. 弹层 a11y：focus trap、Esc 关闭、关闭后焦点还原触发元素；`aria-live="polite"` 播报「换一组」后的汇总变化。

#### T8 · 打印 PDF + 合并购物清单

1. 汇总区「导出 / 打印」按钮 → 打印视图（`@media print`，隐藏交互 UI）→ `window.print()`。
2. 版式：P1 菜单总览（品牌、人数、菜品、预计总价/热量）；每道菜一页（换算后食材 + 步骤）；末页购物清单。
3. 购物清单 domain 纯函数：按 `ingredientId` 聚合全部选中菜；单位一致且 strategy ∈ {linear, rounded} 的按人数换算后求和；不可合并的分行；输出按主料/调味分区；界面另设独立入口。
4. 单测：跨菜求和、单位不一致不合并、constant/manual 不缩放、空菜单安全。
5. 验收：Chrome 与 Safari「存为 PDF」版式正确、无截断；A4 纵向。

#### T9 · SEO / OG

静态 OG 图（1200×630 品牌模板，可用脚本从 logo + 品牌字生成后提交为静态资产）；`openGraph`/`twitter` meta；`alternates.languages`（zh-CN / en-AU）；`themeColor`；favicon 全套。

#### T10 · 性能落地

1. 图片：脚本预生成 320/640/1280 三档 WebP + AVIF（源图在 `public/media/`），组件输出 `srcset/sizes`；非首屏 `loading="lazy"`；显式宽高防 CLS。
2. 数据出包：构建期把 launch catalog 导出为带内容哈希的静态 JSON（单文件），客户端 fetch + immutable 缓存；加载期骨架屏；`page.tsx` 不再直接 import 全量数据进 RSC payload。
3. wrangler assets 配置 `/media/*` 与数据 JSON 的长缓存。
4. 菜卡 memo 化；搜索索引构建一次复用。
5. 结果写入 `docs/PERF_BASELINE.md`（前后对比）。

### 5. 提交与部署流程

- 每个任务组独立 commit（T0 至少两个：baseline / 拆分），message 用 conventional commits；推送 `origin/main` 前 CI 必须绿。
- 部署沿用仓库现有脚本（OpenNext + wrangler，见 `package.json`）；部署后用浏览器访问线上 URL 逐项验收，截图存 `docs/renders/v2/`。
- 阶段完成顺序：T0 → (T1–T6 可并行开发但一次合入部署) → (T7–T9) → T10；每次部署后重跑 Lighthouse。

### 6. 测试与质量门

- 全程保持 `recipes:validate`、`typecheck`、`test`、`build` 绿。
- 新增单测最低覆盖：healthScore、kcalFit、roleOverrides、URL 往返、PRNG 确定性、购物清单合并、食材换算策略。
- 手动走查矩阵：中/EN × 桌面/375px 移动 × 亮色；键盘-only 完成一次完整流程（设置→筛选→搜索→详情→导出）。

### 7. 性能预算（未达标 = T10 未完成）

| 指标 | 目标 |
| --- | --- |
| 首屏 JS（gzip） | ≤ 250 KB |
| 首视口总传输（冷缓存） | ≤ 1 MB |
| LCP | 桌面 ≤ 2.0s · 移动 4G ≤ 2.5s |
| CLS | < 0.1 |
| Lighthouse Performance | ≥ 90（中/EN） |

### 8. 禁止项

- 禁止接线 D1/API/AI 运行时；禁止账号、邮件、深色模式。
- 禁止引入 UI 框架/组件库；禁止外部字体 CDN。
- 禁止放松过敏原拦截；健康指数禁止任何非确定性来源。
- 禁止提交 `node_modules`、构建产物、`.dev.vars`、iCloud 副本文件。
- 禁止在未打 `v1-baseline` tag 前改动任何业务代码。
- 禁止把 `media.objectKey` 的 `recipes/v1/...` 路径当作真实图片地址（UI 一律 `/media/<slug>.webp`）。

### 9. 完成汇报格式

按任务列出：改动摘要、涉及文件、测试结果（命令 + 输出结论）、部署 URL 验证结论、性能前后对比表、遗留问题（如有，附证据与建议）。

## Prompt 结束
