# Luna-Max 第一版上线与 80 道菜 UI 重构执行 Prompt

> 使用方式：把本文件从“Prompt 开始”到“Prompt 结束”完整交给 luna-max。不要删减验收标准、配额表或禁止项。

---

## Prompt 开始

你是本项目的高级实现工程师。请直接在当前仓库内完成下面定义的工作，并持续工作到所有可执行的验收项通过。不要只做分析，不要停在半成品，不要要求用户替你决定常规的组件命名、CSS 组织、类型或测试细节。

项目根目录：

`/Users/leeliu/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`

### 0. 总目标与优先级

按以下不可颠倒的顺序执行：

1. 先确认当前版本能构建，并优先完成第一个可访问的 Cloudflare 线上基线版本。
2. 保留可回退基线后，实施始终亮色、清新可爱、横屏 iPad/桌面尽量单屏的新界面。
3. 将首发菜谱库扩展到总计 80 道菜，不是“现有 40 道再加 80 道”。
4. 实现统一的单选/多选下拉框、菜单卡片、菜谱详情、食材详情、估算热量与图片元数据。
5. 实现“确定性硬规则生成安全候选 + AI 从候选 allow-list 中选取和解释”的核心菜单引擎。
6. 使用 AI 生成最终菜谱图和食材图，并在 UI 中自动标注为 AI 示意图。
7. 完成测试、浏览器验收、性能与无障碍检查，再部署更新版。

当本 Prompt 与仓库实际代码冲突时，以仓库证据为准，但不得改变已锁定的产品方向、80 道配额和验收标准。发现真正的架构、安全、数据或外部权限阻塞时，提供证据和最小必要问题；其余决定自行完成。

### 1. 开始前必须读取和检查

完整阅读以下文件，不要只读摘要：

- `AGENTS.md`、`AGENTS.override.md`：如存在。
- `package.json`
- `wrangler.jsonc`
- `docs/UX_UI_SPEC.md`
- `docs/PRODUCT_BLUEPRINT.md`
- `docs/DATA_MODEL.md`
- `docs/CONTENT_PLAN_200_RECIPES.md`
- `docs/ARCHITECTURE.md`
- `design-system/menu-planning-companion/MASTER.md`
- `src/components/planner-app.tsx`
- `src/app/globals.css`
- `src/domain/planner.ts`
- `src/domain/batch-a.ts`
- `src/domain/recipe.ts`
- `src/domain/launch-catalog.ts`
- `data/recipes/batch-a.ts`
- `scripts/recipes/validate.ts`
- `scripts/recipes/coverage.ts`
- `tests/` 下的相关测试。

检查并记录：

- `git status`；如果项目根目录没有 Git 仓库，不要自行初始化 Git。
- 当前 Node/npm 版本与锁文件。
- `npm run recipes:validate`
- `npm run recipes:coverage`
- `npm run typecheck`
- `npm test`
- `npm run build`

保存基线结果，区分既有失败和本次引入的回归。

### 2. 当前仓库事实

下面是已知现状，执行时必须重新验证：

- 技术栈是 Next.js 16、React 19、TypeScript、原生 CSS、Zod、Cloudflare OpenNext、D1/R2 预留配置。
- 包管理器使用 npm。
- 当前菜谱数据在 `data/recipes/batch-a.ts`，共 40 条，其中 30 条 `published`、10 条 `review`。
- `src/domain/batch-a.ts` 当前把文件长度写死为 40。
- 页面文案把“30 道已发布菜谱”写死在 `planner-app.tsx`。
- 当前菜谱媒体有若干指向 `ideas/IMG_*.jpeg` 的占位路径；这些是 UI 参考照片，不是食物照片，禁止继续当作菜谱图使用。
- 当前 UI 有超高标题区、展开式筛选卡、选择方式混杂、菜单卡没有真实图片、卡片不显示单道热量、没有菜谱详情。
- 当前 CSS 包含 `prefers-color-scheme: dark`，必须删除，产品最终始终亮色。
- 当前 `PlannerFilters` 没有完整覆盖烹饪方式、必须包含食材、排除食材、可用设备。
- 当前参考数据已定义 16 个菜系，但 UI 只列出了 12 个。

### 3. 明确不做的范围

本轮不要扩展下列路线图功能，除非它们是完成本 Prompt 的必要依赖：

- 登录、账户、Magic Link。
- 嘉宾邀请、二维码、PDF 导出。
- 菜谱后台管理系统。
- 200 道菜长期目录。
- 外部实时菜谱 API。
- 新的全局状态框架、UI 框架或大型依赖。
- 与当前任务无关的数据库重写。

优先使用 React、TypeScript、原生 CSS 和现有依赖。不要为了下拉框、图标或弹层引入大型生产依赖；小型本地组件足够。

### 4. 已锁定视觉方向

产品关键词：

- 始终亮色。
- 暖白、清新、柔和、轻微可爱。
- 中性色作为主体，粉彩只用于分类、图标底板和弱强调。
- 家庭聚餐工具，不要做成儿童应用、营销落地页、企业后台或玻璃拟态页面。
- 信息密度偏高，但不能拥挤。

必须更新设计系统文档，使其成为实现后的真实来源。以下 token 是目标基线，可在保证对比度的前提下微调，但不得改变整体方向：

```css
:root {
  color-scheme: light;
  --background: #fffcf7;
  --surface: #ffffff;
  --surface-muted: #f7f4ef;
  --foreground: #364152;
  --text-muted: #667085;
  --border: #e8e1d9;
  --primary: #cf7258;
  --primary-strong: #a94f3e;
  --primary-soft: #faece8;
  --positive: #487f69;
  --positive-soft: #eaf4ef;
  --pastel-sage: #8fb7a6;
  --pastel-sage-soft: #eaf4ef;
  --pastel-butter: #e8c98d;
  --pastel-butter-soft: #fff5dc;
  --pastel-rose: #dfafa9;
  --pastel-rose-soft: #faecea;
  --pastel-blue: #9bbfd0;
  --pastel-blue-soft: #edf6fa;
  --pastel-lilac: #b4a8cb;
  --pastel-lilac-soft: #f2eff8;
  --danger: #b42318;
  --danger-soft: #fef3f2;
  --focus: #2563eb;
}
```

执行规则：

- 删除所有自动暗色主题规则，不响应系统暗色偏好。
- 文本对比度达到 WCAG 2.2 AA；正文至少 4.5:1。
- 粉彩不能承担唯一的状态含义。
- 正文字号默认不低于 16px；紧凑辅助文字不得低于 12px。
- 保持 Source Serif 4 / 中文衬线作为少量品牌标题，界面正文继续使用 Inter / PingFang SC / Noto Sans SC / system sans。
- 间距使用 4/8px 节奏。
- 通用交互目标至少 44×44px，主要触控控件优先 48px 高。
- 动效 150–240ms，并支持 `prefers-reduced-motion`。
- 不使用 Emoji 作为结构图标。

### 5. SVG 图标系统

创建一组本地、可复用、无外部运行时依赖的 SVG React 组件：

- 品牌叶片/餐桌图标。
- 人数、餐盘、家庭分享、预算。
- 菜系、厨师帽/烹饪方式、食材、排除、时钟、设备、饮食安全。
- 刷新、关闭、返回、搜索、勾选、下拉箭头、热量、价格。

规范：

- 同一视觉层级统一 2px 圆角描边。
- 统一 `16 / 20 / 24px` 图标尺寸 token。
- 可爱感来自轮廓和淡彩底板，不来自 Emoji 或复杂动画。
- 装饰图标使用 `aria-hidden="true"`；图标按钮必须有可本地化的可访问名称。
- 不把完整 SVG 大段重复粘贴到多个组件中。

### 6. 横屏 iPad/桌面单屏布局

主要目标视口：

- 1024×768 横屏 iPad。
- 1366×768 笔记本。
- 1440×900 桌面。
- 1536×1024 参考渲染尺寸。

布局必须遵守：

1. 标题栏压缩至 52–56px。
2. 左侧为小型品牌图标和“聚餐菜单 / Gathering Menu”。
3. 右侧为语言下拉框、单位下拉框；不要把语言切换藏到页脚。
4. 删除大型 Hero、超大 H1、介绍段和独立目录宣传卡。
5. 第二行为四个紧凑快速控制：人数、菜数、上菜方式、预算。
6. 主工作区为约 61.8% 筛选区 / 38.2% 当前菜单区。
7. 黄金比例只控制主区域，不要强行应用于每个小组件。
8. 1024×768 下，默认 4 道菜时页面主体本身不滚动。
9. 5–10 道菜时，仅允许菜单列表内部滚动。
10. 菜谱详情过长时，仅允许详情内容区内部滚动。
11. 下拉层必须浮在布局上方，不能展开后推高页面。
12. 不允许横向页面滚动。

建议高度预算：

- Header：56px。
- 快速控制行：64px。
- 页面上下间距和行间距：约 24–32px。
- 剩余高度交给主工作区。
- 右侧 4 张菜单卡每张约 92–104px，缩略图约 88×66px。

只在满足 `min-width: 900px` 且 `min-height: 700px` 的横屏/桌面模式限制页面级滚动；移动端不得全局 `overflow: hidden`。

响应式规则：

- 900px 以下进入单列布局。
- 移动端允许正常纵向滚动，快速控制为两列。
- 菜单作为下方区域或可访问面板，不依赖隐藏手势。
- 保留 safe-area 内边距。
- 验证 375、390、430、768、1024、1366、1440、1536px。

### 7. 统一单选/多选下拉框

实现一个共享组件体系，不要继续混用原生 `select`、展开式 `details`、按钮组和外露 checkbox。

建议组件边界：

- `SelectDropdown<T>`：单选。
- `MultiSelectDropdown<T>`：多选。
- `DropdownTrigger`：共享外观。
- `DropdownPopover`：定位、关闭与 focus 管理。
- `OptionRow`：单选或带 checkbox 的多选项。
- `SelectedValueSummary`：最多两个选中标签，剩余显示 `+N`。

所有选择类字段都使用这套体系：

- 语言。
- 单位制。
- 人数。
- 菜品数量。
- 上菜方式。
- 预算。
- 组合重点（均衡、预算优先、简单省时）。
- 菜系。
- 烹饪方式。
- 希望包含的食材。
- 不希望出现的食材。
- 时间限制。
- 可用设备。
- 饮食偏好。
- 排除过敏原。
- 最高辣度。
- 儿童友好。

交互要求：

- 单选选中后关闭。
- 多选在面板内部显示原生 checkbox 语义，点击外部关闭时保留选择。
- 超过 8 个选项显示搜索。
- 多选面板底部提供“清除”和“完成”。
- 同时只允许一个下拉框打开。
- Escape 关闭并把焦点还给 trigger。
- Tab 顺序符合视觉顺序。
- ArrowUp/ArrowDown 在选项间移动；Space 切换；Enter 选择/完成。
- trigger 设置 `aria-expanded`、`aria-controls`、可访问标签和选择数量。
- 选中状态不能只靠颜色，必须同时有 checkbox、边框或文字。
- 面板 `max-height` 约 280–320px，内部滚动。
- 触控目标至少 48px 高，项目之间至少 8px 间距。
- 支持中文和英文搜索；食材使用规范 ID，不能以翻译后的字符串作为业务键。
- 搜索无结果、空选项、禁用项都要有明确状态。

预算下拉框使用常用预设，例如 A$60、80、100、120、150、200，并允许在下拉面板内输入自定义金额；不要把独立数字输入框留在页面上。

### 8. 完整筛选模型

扩展 `PlannerFilters`，至少包含：

```ts
type PlannerFilters = {
  cuisines: string[];
  methods: string[];
  mustIncludeIngredientIds: string[];
  excludedIngredientIds: string[];
  dietTags: string[];
  excludedAllergens: string[];
  maxTotalMinutes: number | null;
  availableEquipmentIds: string[];
  maxSpiceLevel: number;
  childFriendlyOnly: boolean;
};

type PlannerPreferences = {
  guests: number;
  dishCount: DishCount;
  servingStyle: PlannerServingStyle;
  budgetCents: number;
  compositionMode: 'balanced' | 'budget' | 'easy';
};
```

确定性规则：

- 菜系多选：配方命中任意一个已选菜系。
- 烹饪方式多选：配方命中任意一个已选方式。
- 希望包含食材：整桌菜单必须合计覆盖所有选中的规范食材，不要求每道菜都同时包含。
- 排除食材：命中任意排除食材即淘汰。
- 饮食偏好：必须满足所有已选标签。
- 过敏原：`contains`、`derived_from`、`may_contain` 和相关 `unknown` 都不得静默通过主动排除。
- 可用设备：配方所有 `required: true` 设备必须在可用列表中；空列表代表不限制。
- 时间、辣度和儿童友好继续作为硬筛选。
- 同一食材不得同时出现在“希望包含”和“排除”；最后一次操作应移除另一侧并显示简短反馈。
- 所有规则编写纯函数单元测试。
- 菜单生成不依赖 AI；相同输入和 variation 得到可复现结果。

保留撤销、重置、条件已改变和重新组合能力。重置需要确认；清除单个下拉框不需要全局确认。

#### 8.1 条件与菜谱字段的精确对应关系

不要把全部筛选都粗暴地写成一次 `recipes.filter()`。必须区分“单道菜谱硬条件”“整桌菜单硬约束”“软偏好”和“仅展示设置”。

| 用户条件               | 数据字段                                            | 层级                      | 精确语义                                                                               |
| ---------------------- | --------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| 语言                   | `locale` / `translations`                           | 展示                      | 只改变文案、alt 和格式，不影响入选结果。                                               |
| 单位制                 | canonical metric quantity + formatter               | 展示                      | 只改变显示单位，不改变规范数量和筛选结果。                                             |
| 人数                   | `baseServings`、ingredient quantity、cost           | 菜单计算                  | 缩放食材和总成本；人数本身不淘汰菜谱，但 nonlinear/manual scaling 产生提示。           |
| 菜品数量               | role template                                       | 菜单硬约束                | 最终应达到请求数量；安全候选不足时返回 partial menu，不用不合格菜补齐。                |
| 上菜方式               | `servingStyles[style]`、role template               | 菜单硬约束 + 评分         | 低于 40 的菜谱不得进入该方式；40–74 可用但降分；75 以上优先。                          |
| 总预算                 | scaled menu cost                                    | 菜单约束                  | 先寻找不超过预算 +10% 的完整安全菜单；无解时返回最低成本安全菜单并标记超预算。         |
| 组合重点               | score weights                                       | 软偏好                    | `balanced`、`budget`、`easy` 只改变候选排序，不改变安全硬条件。                        |
| 菜系多选               | `recipe.cuisines`                                   | 菜谱硬条件 + 菜单覆盖偏好 | 单道菜命中任意已选菜系即可；菜数足够时尽量覆盖更多已选菜系。                           |
| 烹饪方式多选           | `recipe.methods`                                    | 菜谱硬条件 + 菜单覆盖偏好 | 单道菜命中任意已选方式即可；整桌优先避免全部使用同一方式。                             |
| 希望包含食材           | `recipe.ingredients[].ingredientId`                 | 整桌菜单硬约束            | 所有选中食材必须在整桌至少各出现一次；无法同时覆盖时返回冲突原因。                     |
| 不希望出现食材         | `recipe.ingredients[].ingredientId`                 | 菜谱硬条件                | 命中任意排除食材即淘汰；检查规范 ID，不以翻译字符串匹配。                              |
| 饮食偏好               | `recipe.dietTags`                                   | 菜谱硬条件                | 每道菜都必须满足全部已选标签；`vegan` 隐含 `vegetarian`。                              |
| 排除过敏原             | `recipe.allergens` + compound ingredient state      | 最高优先级硬条件          | `contains`、`derived_from`、`may_contain` 和有关 `unknown` 全部阻止入选；AI 无权放宽。 |
| 单道最长时间           | `totalMinutes`                                      | 菜谱硬条件                | 超过用户上限即淘汰。                                                                   |
| 可用设备               | `equipment[].id/required/occupiedMinutes`           | 菜谱硬条件 + 菜单冲突     | required 设备必须可用；整桌还要检查设备占用冲突。空选择表示不限。                      |
| 最高辣度               | `spiceLevel`                                        | 菜谱硬条件                | 高于上限即淘汰。                                                                       |
| 儿童友好               | `childFriendly`                                     | 菜谱硬条件                | 选择“仅儿童友好”时每道菜都必须为 true。                                                |
| 难度（如启用）         | `difficulty`                                        | 菜谱硬条件                | `easy < medium < advanced`，不得用字符串字母顺序比较。                                 |
| 提前准备偏好（如启用） | `advanceMinutes`、`holdQuality`、`reheatingQuality` | 软偏好                    | 不淘汰安全菜谱，只在 easy/balanced 模式提高可提前准备菜的分数。                        |

术语必须保持一致：

- `eligible recipe`：通过所有单道菜谱硬条件的菜。
- `feasible menu`：由 eligible recipes 组成，并通过整桌硬约束的菜单。
- `candidate menu`：通过硬约束、已经计算评分、可以交给 AI 比较的菜单。
- `selected menu`：确定性引擎或 AI 从候选中选择、再次验证后展示的菜单。

#### 8.2 固定规则执行顺序

实现一个可测试、可版本化的 pipeline，顺序不得随组件渲染顺序变化：

1. 规范化输入：去重并排序 ID、验证数字范围、解析预算、解决 include/exclude 冲突。
2. 仅加载 `published` 且具备必要双语、食材、成本、营养和媒体元数据的菜谱。
3. 过敏原与排除食材。
4. 饮食标签。
5. 菜系、烹饪方式、时间、设备、辣度、儿童友好和难度。
6. 生成与菜数/上菜方式相符的 role template。
7. 生成不重复菜谱的完整候选组合。
8. 检查整桌 must-include 食材覆盖。
9. 检查缩放安全、设备占用和时间冲突。
10. 检查预算 +10% 容差。
11. 对通过硬条件的候选计算软评分。
12. 生成 balanced、budget、easy 排序结果。
13. 把有限、完整、已经安全验证的候选交给 AI 选择。
14. AI 输出返回后，按当前 catalog version、ruleset version 和 filter revision 再次验证。
15. 展示 selected menu；AI 失败时立即使用确定性第一名。

每一步返回结构化 reason code，不只返回布尔值：

```ts
type ExclusionReasonCode =
  | 'not_published'
  | 'missing_required_data'
  | 'allergen_conflict'
  | 'allergen_unknown'
  | 'excluded_ingredient'
  | 'diet_mismatch'
  | 'cuisine_mismatch'
  | 'method_mismatch'
  | 'time_exceeded'
  | 'equipment_unavailable'
  | 'spice_exceeded'
  | 'not_child_friendly'
  | 'serving_style_unsuitable';

type MenuConflictCode =
  | 'insufficient_role_coverage'
  | 'must_include_not_covered'
  | 'equipment_collision'
  | 'scaling_requires_review'
  | 'over_budget'
  | 'insufficient_safe_recipes';
```

UI 至少展示造成空结果的前三个原因及受影响数量，例如“排除花生后减少 7 道”“60 分钟内仍有 18 道”“缺少符合条件的主菜”。

#### 8.3 Role template 精确规则

不要只靠最后用任意菜补齐：

| 菜数 | Family sharing                               | Plated                                           | Buffet                                       |
| ---: | -------------------------------------------- | ------------------------------------------------ | -------------------------------------------- |
|    1 | main                                         | main                                             | main                                         |
|    2 | main + side                                  | main + starter                                   | main + side                                  |
|    3 | main + side + staple                         | starter + main + dessert                         | main + side + staple                         |
|    4 | main + side + staple + dessert               | starter + main + side + dessert                  | main + side + staple + dessert               |
|    5 | main + main + side + staple + dessert        | starter + main + side + staple + dessert         | main + main + side + staple + dessert        |
|    6 | main + main + side + side + staple + dessert | snack + starter + main + side + staple + dessert | main + main + side + side + staple + dessert |

7–10 道从 6 道模板继续轮换增加 `starter/soup/snack`、`side/salad`、第二个 `staple` 和额外 `main`，但始终满足：

- 至少一个 main。
- 4 道以上至少一个 side 或 salad。
- Family/Buffet 的 4 道以上至少一个 staple。
- Plated 的 3 道以上优先有 starter 和 dessert。
- 4 道以上默认最多一个 dessert。
- fallback role 使用明确兼容表：starter 可由 soup/snack 替代，side 可由 salad/soup 替代；禁止用 dessert 填 main。

#### 8.4 候选菜单生成算法

80 道菜、最多 10 道的组合不能穷举。实现确定性 beam search 或等价有界算法：

1. 按 role template 建立 slot 和 eligible role bucket。
2. 给单道菜计算不含 AI 的基础分；同分使用稳定的 `recipe.id` 排序。
3. 每个 role bucket 至少保留前 12 个；不足时全部保留。
4. 按 slot 逐层扩展，禁止重复 recipe ID。
5. 每层保留前 160 个 partial candidates；排序必须稳定。
6. 提前剪枝：剩余 slot 已不可能覆盖 must-include、出现设备硬冲突、或存在更合理路径时已经必然远超预算。
7. 完整候选通过全菜单再验证后保留最高 24 个。
8. 送给 AI 的候选最多 12 个，且必须来自这 24 个。
9. `variation` 只改变稳定候选轮换，不得使用当前时间或不可复现随机数。

如果没有完整候选：

- 绝不放松过敏原、排除食材、饮食和发布状态。
- 可以返回最高覆盖率 partial menu，并列出缺少的 role 或 must-include。
- 如果唯一失败是预算，返回最低成本完整安全菜单并标注超出金额。
- 如果唯一失败是设备/时间，给出移除哪个条件可恢复多少候选的建议，但不自动移除。

#### 8.5 菜单评分公式

所有维度归一化后加总为 0–100，并在 UI 中可解释。不得让 AI 编造分数。

| 维度                        | Balanced |  Budget |    Easy |
| --------------------------- | -------: | ------: | ------: |
| Preference match            |       25 |      15 |      15 |
| Operational feasibility     |       25 |      25 |      45 |
| Budget fit                  |       20 |      40 |      20 |
| Nutrition/data completeness |       15 |      10 |       5 |
| Menu variety                |       15 |      10 |      15 |
| **总计**                    |  **100** | **100** | **100** |

每一维由纯函数计算 0–1，再乘权重：

- `preferenceMatch`：菜系覆盖率 30%、方式覆盖率 20%、must-include 覆盖率 35%、提前准备偏好 15%。某项未选择时，将其权重按比例分配给本维度其他项。
- `operationalFeasibility`：平均 serving-style suitability 35%、总 active time 25%、设备余量 20%、hold/reheat quality 20%。
- `budgetFit`：预算内得分不低于 0.75；balanced 偏好 80–100% 目标区间；budget 在完整安全基础上越低越高；超过 110% 仅能作为明确 fallback。
- `nutritionDataCompleteness`：营养字段完整度/confidence 50%、至少一份 side/salad/vegetable role 25%、主要蛋白/豆类/蔬菜不过度重复 25%。不得称为医学健康评分。
- `menuVariety`：不同菜系 35%、不同方式 30%、主要食材不重复 25%、已有结构化颜色/温度/口感属性 10%；缺少最后一项时按比例分配给前三项，禁止让 AI 从菜名猜不可审计分数。

显式惩罚并测试：主要蛋白重复至少 3 次、同一 method 达 60%、同一菜系达 75%（用户只选该菜系除外）、最后阶段设备冲突、全部菜都高 active-time 且不可提前准备。

#### 8.6 Eligible count 与实时反馈

筛选变化后立即在本地计算：

```ts
type EligibilitySummary = {
  eligibleRecipeCount: number;
  eligibleByRole: Record<PrimaryRole, number>;
  excludedByReason: Partial<Record<ExclusionReasonCode, number>>;
  feasibleMenuCountEstimate: number;
  canBuildRequestedMenu: boolean;
  coveredMustIncludeIngredientIds: string[];
  uncoveredMustIncludeIngredientIds: string[];
  conflicts: MenuConflict[];
};
```

- `eligibleRecipeCount` 只表示通过菜谱级硬条件的数量，不能与“80 道总目录”混淆。
- must-include 是菜单级约束，单独显示“可覆盖 3/4 个希望食材”。
- 当前菜单在筛选改变时保持显示并标为 stale。
- 80 道目录下 eligibility 目标小于 50ms，候选组合代表性本地运行目标小于 100ms。

#### 8.7 AI 菜单选择的职责边界

AI 是“安全候选菜单的策展与解释层”，不是过滤器、过敏原判断器或自由生成菜谱器。

AI 可以：

- 从确定性引擎提供的最多 12 个 candidate menu 中选择一个 `candidateId`。
- 比较风味、质地、颜色、冷热搭配、上菜顺序和聚餐协调性。
- 在相近候选中结合 balanced/budget/easy 做最终排序。
- 为已选组合生成事实受限的双语解释。
- 从后端提供的同角色安全替代列表中选择 substitution ID。

AI 绝对不可以：

- 返回候选列表外的 recipe/candidate ID。
- 新增、删除或改写食材、数量、成本、营养或过敏原。
- 把 unknown、may contain 或未审核状态判断为安全。
- 为满足预算绕过饮食、过敏原、设备或排除食材规则。
- 从互联网临时找未入库菜谱。
- 修改发布状态或把输出写入已发布菜谱正文。
- 接收不必要的姓名、健康自由文本或其他个人信息。

AI 可以选择与确定性第一名不同的候选，但它必须已经通过全部硬规则。UI 只能描述为“AI 优化搭配”，不能暗示 AI 认证了食品安全。

当前 `PRODUCT_BLUEPRINT.md` 和 `ARCHITECTURE.md` 主要把 AI 写成解释层。本次用户已经明确要求 AI 参与选取，因此实现时同步更新这两份文档：AI 可以在确定性安全候选 allow-list 中选一个候选，但硬规则、候选生成和最终再验证仍完全由本地规则引擎负责。不要把文档留在与代码相矛盾的旧状态。

#### 8.8 AI 输入、输出与服务端接口

AI 调用必须在服务端，通过 provider adapter；API key 只存在 Cloudflare secret/服务端环境，禁止进入客户端 bundle。

建议接口：`POST /api/v1/menu/compose`。客户端只发送规范化条件；服务端重新加载目录并执行规则，不能信任客户端传来的 eligible recipes。

送给 AI 的结构化输入：

```ts
type AiMenuSelectionInput = {
  promptVersion: string;
  catalogueVersion: string;
  rulesetVersion: string;
  filterRevision: number;
  locale: 'zh-CN' | 'en-AU';
  compositionMode: 'balanced' | 'budget' | 'easy';
  event: {
    guests: number;
    dishCount: number;
    servingStyle: 'family' | 'plated' | 'buffet';
    budgetCents: number;
  };
  selectedPreferenceCodes: {
    cuisines: string[];
    methods: string[];
    mustIncludeIngredientIds: string[];
  };
  candidates: Array<{
    candidateId: string;
    recipeIds: string[];
    dishes: Array<{
      recipeId: string;
      titleZh: string;
      titleEn: string;
      primaryRole: string;
      cuisines: string[];
      methods: string[];
      focusIngredientIds: string[];
    }>;
    estimatedCostCents: number;
    energyKcalPerPerson: number | null;
    activeMinutes: number;
    longestDishMinutes: number;
    preferenceCoverage: Record<string, number>;
    score: number;
    scoreBreakdown: Record<string, number>;
    hardChecksPassed: true;
  }>;
};
```

严格验证输出：

```ts
const aiMenuSelectionSchema = z.object({
  candidateId: z.string().min(1),
  confidence: z.number().min(0).max(1),
  rationaleZh: z.string().min(1).max(320),
  rationaleEn: z.string().min(1).max(420),
  highlights: z
    .array(
      z.object({
        code: z.enum(['flavour', 'texture', 'colour', 'temperature', 'workflow', 'budget']),
        noteZh: z.string().min(1).max(120),
        noteEn: z.string().min(1).max(160),
      }),
    )
    .max(4),
});
```

验证顺序：Zod schema → candidate ID allow-list → recipe IDs 一致 → 当前 filters/preferences/ruleset 全量再验证 → filter revision 仍为当前值。任何一步失败都不得替换确定性菜单。

AI 系统提示词保存为版本化模板，至少包含：

```text
You are a menu curation layer, not a food-safety authority and not a recipe generator.
Choose exactly one candidateId from the supplied candidate menus. Every candidate has already
passed deterministic safety and feasibility checks. Never invent a candidate, recipe, ingredient,
quantity, allergen claim, nutrition value or price. Compare only the supplied facts. Prefer a
coherent gathering menu with complementary flavours, textures, colours, temperatures and a
practical cooking workflow, while respecting the requested composition mode. Return only the
required structured JSON. If candidates are effectively tied, select the higher deterministic
score; if still tied, select the lexicographically smaller candidateId.
```

运行策略：

- 页面先立即展示确定性第一名，AI 不阻塞菜单可用性。
- AI 异步请求建议 6 秒超时，最多一次安全重试。
- AI 不可用、超时、结构无效、返回越权 ID或再次验证失败时，保持确定性菜单并显示“AI 搭配说明暂不可用”。
- 使用 `AbortController` 或 revision guard，禁止旧请求覆盖新条件。
- 缓存 key 包含 catalog version、ruleset version、normalized filter hash、composition mode、model、prompt version。
- 记录 purpose/provider/model/promptVersion/inputHash/status/validatedOutput，不记录敏感自由文本。
- 模型名使用 `AI_MENU_MODEL` 等服务端配置，不在业务组件硬编码具体模型。
- Provider secret 缺失时核心流程仍工作；启用 AI 前用 Cloudflare secret 的最小权限流程请求用户授权，不让用户在聊天里发送 key。

#### 8.9 单道替换与重新组合

“替换这道菜”必须：固定其他菜 → 建立同角色 eligible replacements → 排除当前菜单已有菜 → 重新检查 must-include、预算、设备、时间和整桌评分 → 只把合格替代方案交给 AI 排序 → 再验证 AI 返回的 substitution ID。

“换一组菜单”使用下一批稳定候选，短期会话内尽量避免刚展示过的完整组合，但不得放松硬规则。若只有一个可行菜单，明确提示“当前条件下只有这一组完整安全组合”。

### 9. 菜单卡片

右侧每张菜单卡必须可点击、可聚焦，并展示：

- 4:3 菜谱缩略图。
- 顺序编号和角色。
- 当前语言菜名。
- 预计成本。
- `≈ N kcal/人`。
- 总烹饪时间。
- 最多两个饮食/过敏提示标签。
- AI 图片时显示不抢眼但持续可见的 `AI 示意图 / AI illustration`。

卡片要求：

- 点击或按 Enter 打开详情。
- 使用真实按钮/链接语义或完整可访问交互容器，不能只给 `div` 加点击事件。
- 图片提前保留 4:3 空间，避免 CLS。
- 标题最多两行；辅助信息不能挤出容器。
- 重组时保留旧菜单并显示 updating 状态，不得先把列表清空。
- 空结果、部分菜单、超预算、营养不完整需要明确状态。

### 10. 菜谱详情

实现当前页面内的可访问详情层，不跳去一个丢失筛选状态的新流程。

行为：

- 打开详情时保留全部筛选、菜单和滚动位置。
- URL 写入 `?recipe=<slug>`，刷新或直接访问能恢复详情。
- 关闭时移除参数并把焦点还给原菜单卡。
- 浏览器后退可以关闭详情。
- Escape 关闭。
- 打开后 focus 进入详情标题或关闭按钮；焦点不能跑到遮罩后的页面。

横屏详情继续使用 38.2/61.8：

- 左侧 38.2%：4:3 成品图、菜名、简介、人数、准备时间、烹饪时间、总时间、难度、预计成本、约热量、蛋白质、辣度、过敏信息、AI 标记。
- 右侧 61.8%：带 1:1 图片和用量的食材清单、可替换项、编号烹饪步骤、上菜与安全说明。

必须显示：

- `activeMinutes`、`totalMinutes`、`advanceMinutes`。
- `baseServings`，并按当前聚餐人数计算展示用量。
- 每种食材的中英文名称、规范数量、显示数量和处理说明。
- 完整编号步骤，不再使用泛化的三步模板。
- 过敏原与“核对包装标签”的免责声明。
- 营养和成本均明确为估算。
- `kitchenTestStatus` 真实显示，不得把 `not_tested` 表述为已厨房测试。

移动端详情改成单列全屏面板，成品图、摘要、食材、步骤依次排列。

### 11. 菜谱总量与最终配额

最终目录必须恰好 80 道，无重复 `id`、`slug` 或中英文标题。现有 40 道尽量保留；新增下面规定的 40 道。

#### 11.1 角色最终配额

| Primary role | 最终数量 | 现有数量 | 新增数量 |
| ------------ | -------: | -------: | -------: |
| main         |       26 |       16 |       10 |
| side         |        9 |        6 |        3 |
| salad        |        9 |        4 |        5 |
| starter      |        5 |        2 |        3 |
| soup         |        5 |        2 |        3 |
| snack        |        4 |        2 |        2 |
| staple       |       10 |        4 |        6 |
| dessert      |       12 |        4 |        8 |
| **总计**     |   **80** |   **40** |   **40** |

这套比例按现有 200 道内容规划缩放，既保证每类覆盖，也保留多菜菜单所需的主菜和配菜比例。不得为了“每类完全相等”破坏菜单组合能力。

#### 11.2 菜系最终配额

必须覆盖数据库参考表中的全部 16 个菜系。最终每类为 4–6 道，平均 5 道：

| Cuisine code      | 中文             | 最终数量 | 现有数量 | 新增数量 |
| ----------------- | ---------------- | -------: | -------: | -------: |
| chinese_northern  | 中国北方菜       |        5 |        2 |        3 |
| chinese_sichuan   | 川菜             |        5 |        3 |        2 |
| chinese_cantonese | 粤菜             |        5 |        3 |        2 |
| chinese_jiangnan  | 江南菜           |        5 |        2 |        3 |
| japanese          | 日本料理         |        5 |        5 |        0 |
| korean            | 韩国料理         |        5 |        1 |        4 |
| southeast_asian   | 东南亚料理       |        6 |        6 |        0 |
| indian            | 印度料理         |        5 |        0 |        5 |
| mediterranean     | 地中海料理       |        5 |        4 |        1 |
| italian           | 意大利料理       |        5 |        3 |        2 |
| french            | 法国料理         |        5 |        0 |        5 |
| australian_modern | 现代澳大利亚料理 |        5 |        5 |        0 |
| western_home      | 西式家常菜       |        5 |        3 |        2 |
| middle_eastern    | 中东料理         |        5 |        3 |        2 |
| latin_american    | 拉丁美洲料理     |        5 |        0 |        5 |
| other             | 其他             |        4 |        0 |        4 |
| **总计**          |                  |   **80** |   **40** |   **40** |

UI 的 `cuisineNames` 或等价本地化数据必须加入 Indian、French、Latin American 和 Other；不得显示裸 code。

#### 11.3 烹饪方式最终配额

每道菜先按一个主要方式计数，最终精确为：

| Method   | 最终数量 |
| -------- | -------: |
| braise   |       12 |
| grill    |        6 |
| stir_fry |        7 |
| roast    |       10 |
| pan_fry  |        6 |
| steam    |        5 |
| bake     |        8 |
| raw      |       11 |
| boil     |       10 |
| deep_fry |        5 |
| **总计** |   **80** |

这保证所有方法至少 5 道，避免目录继续过度集中在烘烤或煮制。

#### 11.4 交叉覆盖最低要求

标签允许重叠，最终至少满足：

- Vegetarian：24 道。
- Vegan：16 道；每个 vegan 配方必须同时带 vegetarian。
- Gluten-free adaptable：36 道。
- Dairy-free adaptable：32 道。
- Child-friendly：24 道。
- `activeMinutes <= 30`：至少 50 道。
- `advanceMinutes >= 15`：至少 28 道。
- `buffet >= 75`：至少 50 道。
- `family >= 75`：至少 60 道。
- 至少 24 道有经过安全约束检查的替换方案。
- 每个 primary role 至少有 2 道 vegetarian，dessert 除外时也应尽量满足。
- 每个菜系至少有 1 道 vegetarian 或 vegan、1 道 child-friendly、1 道 30 分钟内可完成的菜。

### 12. 必须新增的 40 道菜

必须按下面的 slug、菜系、primary role 和主要 method 创建。中英文名称允许做小幅专业化润色，但不得改变菜品身份或配额。

|   # | Slug                             | 中文名             | English title                      | Cuisine           | Role    | Method   |
| --: | -------------------------------- | ------------------ | ---------------------------------- | ----------------- | ------- | -------- |
|   1 | braised-lion-head-meatballs      | 红烧狮子头         | Braised Lion’s Head Meatballs      | chinese_jiangnan  | main    | braise   |
|   2 | shanghai-scallion-oil-noodles    | 上海葱油拌面       | Shanghai Scallion Oil Noodles      | chinese_jiangnan  | staple  | boil     |
|   3 | osmanthus-steamed-pear           | 桂花蒸梨           | Osmanthus Steamed Pear             | chinese_jiangnan  | dessert | steam    |
|   4 | beijing-pork-cabbage-dumplings   | 猪肉白菜蒸饺       | Beijing Pork and Cabbage Dumplings | chinese_northern  | staple  | steam    |
|   5 | shandong-braised-tofu-cabbage    | 白菜炖豆腐         | Shandong Braised Tofu and Cabbage  | chinese_northern  | side    | braise   |
|   6 | northern-red-bean-sesame-cakes   | 北方红豆炸糕       | Northern Red Bean Sesame Cakes     | chinese_northern  | dessert | deep_fry |
|   7 | sichuan-dry-fried-green-beans    | 干煸四季豆         | Sichuan Dry-Fried Green Beans      | chinese_sichuan   | side    | stir_fry |
|   8 | brown-sugar-glutinous-rice-cakes | 红糖糍粑           | Brown Sugar Glutinous Rice Cakes   | chinese_sichuan   | dessert | pan_fry  |
|   9 | cantonese-char-siu               | 粤式叉烧           | Cantonese Char Siu                 | chinese_cantonese | main    | roast    |
|  10 | cantonese-steamed-egg            | 粤式蒸水蛋         | Cantonese Steamed Egg              | chinese_cantonese | starter | steam    |
|  11 | korean-dak-galbi                 | 韩式辣炒鸡         | Korean Dak Galbi                   | korean            | main    | stir_fry |
|  12 | korean-japchae                   | 韩式杂菜           | Korean Japchae                     | korean            | staple  | stir_fry |
|  13 | korean-kimchi-pancakes           | 韩式泡菜煎饼       | Korean Kimchi Pancakes             | korean            | snack   | pan_fry  |
|  14 | korean-hotteok                   | 韩式糖饼           | Korean Hotteok                     | korean            | dessert | pan_fry  |
|  15 | indian-butter-chicken            | 印度黄油鸡         | Indian Butter Chicken              | indian            | main    | braise   |
|  16 | indian-chana-masala              | 印度香料鹰嘴豆     | Indian Chana Masala                | indian            | main    | braise   |
|  17 | indian-jeera-rice                | 印度孜然香米饭     | Indian Jeera Rice                  | indian            | staple  | steam    |
|  18 | indian-cucumber-raita            | 印度黄瓜酸奶沙拉   | Indian Cucumber Raita              | indian            | salad   | raw      |
|  19 | indian-gulab-jamun               | 印度玫瑰奶球       | Indian Gulab Jamun                 | indian            | dessert | deep_fry |
|  20 | mediterranean-falafel            | 地中海炸鹰嘴豆丸   | Mediterranean Falafel              | mediterranean     | snack   | deep_fry |
|  21 | italian-mushroom-risotto         | 意式蘑菇烩饭       | Italian Mushroom Risotto           | italian           | staple  | boil     |
|  22 | italian-baked-pear-ricotta       | 意式烤梨配乳清干酪 | Italian Baked Pear with Ricotta    | italian           | dessert | bake     |
|  23 | french-coq-au-vin                | 法式红酒炖鸡       | French Coq au Vin                  | french            | main    | braise   |
|  24 | french-ratatouille               | 法式普罗旺斯烤蔬菜 | French Ratatouille                 | french            | side    | roast    |
|  25 | french-onion-soup                | 法式洋葱汤         | French Onion Soup                  | french            | soup    | braise   |
|  26 | french-gougeres                  | 法式芝士泡芙       | French Gougères                    | french            | starter | bake     |
|  27 | french-tarte-tatin               | 法式焦糖苹果挞     | French Tarte Tatin                 | french            | dessert | bake     |
|  28 | western-chicken-pot-pie          | 西式鸡肉派         | Western Chicken Pot Pie            | western_home      | main    | bake     |
|  29 | western-apple-cabbage-slaw       | 苹果卷心菜沙拉     | Apple and Cabbage Slaw             | western_home      | salad   | raw      |
|  30 | middle-eastern-lamb-kofta        | 中东烤羊肉丸       | Middle Eastern Lamb Kofta          | middle_eastern    | main    | grill    |
|  31 | middle-eastern-tabbouleh         | 中东欧芹小麦沙拉   | Middle Eastern Tabbouleh           | middle_eastern    | salad   | raw      |
|  32 | latin-carne-asada                | 拉美炭烤牛肉       | Latin American Carne Asada         | latin_american    | main    | grill    |
|  33 | latin-black-bean-corn-salad      | 黑豆玉米沙拉       | Black Bean and Corn Salad          | latin_american    | salad   | raw      |
|  34 | latin-chicken-empanadas          | 拉美鸡肉馅饼       | Latin American Chicken Empanadas   | latin_american    | starter | deep_fry |
|  35 | latin-arroz-rojo                 | 墨西哥红米饭       | Latin American Arroz Rojo          | latin_american    | staple  | braise   |
|  36 | latin-churros                    | 拉美肉桂吉事果     | Latin American Cinnamon Churros    | latin_american    | dessert | deep_fry |
|  37 | jamaican-jerk-chicken            | 牙买加香辣烤鸡     | Jamaican Jerk Chicken              | other             | main    | grill    |
|  38 | west-african-peanut-stew         | 西非花生炖汤       | West African Peanut Stew           | other             | soup    | braise   |
|  39 | hawaiian-lomi-tomato             | 夏威夷番茄沙拉     | Hawaiian Lomi Tomato Salad         | other             | salad   | raw      |
|  40 | caribbean-pumpkin-soup           | 加勒比南瓜汤       | Caribbean Pumpkin Soup             | other             | soup    | boil     |

### 13. 每道菜的数据质量要求

不要使用当前 `instructions()` 那种所有菜共享的泛化三步模板。每道新增菜必须有真正针对该菜的内容：

- 中文和澳大利亚英语标题。
- 原创双语摘要，不复制网站文案。
- 4–8 条具体中文步骤和对应英文步骤。
- 4–12 种规范食材；数量为 metric 规范值，并有易读 display quantity。
- 处理说明，例如切丁、沥干、室温、切片。
- Primary role、合理 secondary roles。
- 菜系、烹饪方式、设备和占用时间。
- Family/plated/buffet 适配评分。
- 基准份数、active/total/advance 时间。
- 难度、辣度、儿童友好、保温和复热质量。
- 所有食材必须存在于 canonical ingredient catalog；缺失时新增规范食材，不得使用自由字符串绕过。
- 复合酱料必须在过敏原相关时拆出或标为 unknown，不得推断为安全。
- Allergen 关系从规范食材生成，并对 `unknown` 保持保守处理。
- 营养按每份给出约数，热量四舍五入到接近的 10 kcal 展示。
- 营养 source/confidence 明确表明为估算；不得声称医疗精度。
- 成本使用 AU-MEL、AUD 估算，并保留版本和 pantry policy。
- 来源、许可、图片类型和 AI 元数据完整。
- `kitchenTestStatus` 真实，未经实体厨房测试一律 `not_tested`。
- 替代方案必须同时考虑功能和过敏原安全；不能为了凑数添加不合理替代品。
- 中英文步骤在语义和数量上对应。

现有 40 道也要进行一致性修复：

- vegan 必须同时带 vegetarian。
- 删除把 `ideas/` UI 照片当菜谱图的媒体记录。
- 把硬编码的“foundation fixture”用户可见摘要替换成真实菜谱摘要。
- 将泛化三步说明替换成菜品专属步骤。
- 保留透明的 estimated、not tested 和包装核验提示。

### 14. 80 道数据文件架构

不要简单把一个文件继续膨胀并把所有共享逻辑复制一份。优先整理成：

```text
data/recipes/
  ingredients.ts             # canonical ingredient catalog
  factory.ts                 # 纯数据构造/共享帮助函数
  batch-a.ts                 # 现有 40 道，清理后保留
  batch-b.ts                 # 新增 40 道
  index.ts                   # 合并并导出 launchRecipes / launchCatalog

src/domain/
  recipe-catalog.ts          # recipe schema、80 条目录 schema、类型
```

可以保留小型兼容 re-export，减少不必要的调用方变化，但最终命名不能继续让 80 道目录看起来仍是“Batch A 40”。

目录 schema 应验证：

- 总数恰好 80。
- ID/slug 唯一。
- 所有食材引用存在。
- `totalMinutes >= activeMinutes`。
- 两种语言完整。
- media 和 rights 字段完整。
- 所有最终配额和交叉覆盖达标。

页面、API、launch catalogue、planner 和测试统一从 `data/recipes/index.ts` 获取最终目录，禁止不同入口使用不同的菜谱集合。

页面上的菜谱数量必须从实际数据动态计算，禁止再写死 30、40 或 80。

### 15. 覆盖率与验证脚本

扩展 `scripts/recipes/coverage.ts`，输出并在不达标时以非零状态退出：

- 总菜谱数。
- published/review 状态数。
- primary role 精确配额。
- 16 个菜系精确配额。
- 10 个主要烹饪方式精确配额。
- diet、child-friendly、active time、advance prep、serving style、substitution 覆盖。
- 缺少双语标题/摘要/步骤的菜。
- 泛化重复步骤或明显重复摘要。
- unknown allergen 行。
- 缺少媒体或权利元数据的菜。
- 仍指向 `ideas/` 的菜谱媒体。
- 无图片的 canonical ingredient。
- 从未能进入有效 4 菜菜单的菜。

增加自动化测试覆盖：

- 80 道总数和全部配额。
- 新的筛选字段。
- must include / exclude 冲突处理。
- must-include 食材可以分布在整桌不同菜中，并且全部得到覆盖。
- 过敏原 unknown 不通过排除条件。
- 设备筛选。
- 设备占用冲突不会进入完整候选。
- 预算内有解时不返回超过预算 +10% 的菜单；无解 fallback 明确标记超出金额。
- 同一输入、catalog version、ruleset version 和 variation 产生相同候选次序。
- AI 只能选择 allow-list 中的 candidate ID。
- AI 返回虚构 ID、改写菜谱、无效 JSON 或超时时使用确定性第一名。
- 过期 filter revision 的 AI 响应不会覆盖当前菜单。
- 单道替换后整个菜单重新通过硬规则。
- 1、3、4、6、10 道菜单角色组合。
- 估算热量聚合。
- 菜谱详情查找和 URL slug。
- 双语内容非空。

### 16. AI 菜谱图与食材图

如果当前执行环境提供 imagegen 技能/工具，必须先完整阅读其 `SKILL.md` 并用它生成图片。禁止用 Python、CSS 渐变、远程随机图或文字占位图冒充最终成片。

#### 16.1 生成范围

- 80 张菜谱成品图，每道菜一张。
- 每个被 80 道菜实际引用的 canonical ingredient 一张 1:1 食材图；同一食材全站复用，禁止为每道菜重复生成。
- 先生成 4 张代表性菜谱图和 8 张食材图进行风格 QA；风格符合下面规范后继续批量。
- 如果工具配额或权限不足，不能把 placeholder 标记为完成；保留完整 manifest 并明确报告剩余数量。

#### 16.2 菜谱图统一提示方向

每道菜根据真实外观调整主体，但必须保持同一系列视觉语言：

```text
Realistic editorial food photography of [DISH], freshly plated for a family gathering,
bright soft natural daylight, warm off-white tabletop, subtle sage green and muted peach props,
clean comfortable composition, appetising but believable texture, 45-degree camera angle with
some top-down visibility, restrained styling, no people, no hands, no text, no logos, no packaging,
no duplicate utensils, no surreal ingredients, 4:3 landscape composition.
```

输出：

- 原始图至少 1600×1200 或工具允许的接近尺寸。
- 最终生成 AVIF/WebP 响应式版本。
- 菜单卡使用 4:3 crop，详情使用同一源图。
- 不在像素里烙中文/英文文字。

#### 16.3 食材图统一提示方向

```text
Realistic studio ingredient photograph of [INGREDIENT], one clear canonical ingredient as sold or
normally prepared, centred on a warm off-white background, soft natural shadow, bright diffused
daylight, accurate colour and texture, minimal styling, no bowl unless necessary to contain it,
no hands, no text, no label, no logo, no packaging, square 1:1 composition.
```

食材名称作为页面 caption，不写进图片。

#### 16.4 AI 标记和元数据

所有 AI 图片：

- `mediaType: 'ai_illustration'`。
- 保存实际 `aiModel`、最终 prompt、`generatedAt`、width、height、mime type。
- 中英文 alt text 描述内容，不写“图片”。
- UI 持续显示 `AI 示意图 / AI illustration`。
- 标记由媒体元数据自动渲染，不要人工写在每个卡片标题里。
- 图像不能被描述为成品外观保证。

#### 16.5 存储策略

- 禁止把高分辨率批量源文件直接塞进 Git 历史。
- 本地生成文件放在明确的 staging 目录并建立 manifest。
- 生产优先上传 Cloudflare R2，object key 建议：
  - `recipes/v1/<slug>/hero-1600x1200.webp`
  - `recipes/v1/<slug>/hero-800x600.webp`
  - `ingredients/v1/<ingredient-id>/square-512.webp`
- 使用受控媒体路由或明确的 R2 公共 URL；不要开放任意远程图片 hostname。
- Next.js 图片使用 `next/image`、预留尺寸、合理 `sizes`；首屏关键图可优先加载，其余 lazy load。
- 对远程源仅配置精确 `remotePatterns`，禁止通配所有域名。

如果 R2 尚未配置，先保持本地可验证的 manifest 和开发媒体路径；创建/绑定生产 R2 属于外部状态修改，执行前向用户提出一次精确权限请求。

### 17. 建议组件拆分

保持业务规则与展示分离。建议但不强制以下结构；若仓库已有更合适模式可调整：

```text
src/components/planner/
  planner-app.tsx
  compact-header.tsx
  quick-controls.tsx
  select-dropdown.tsx
  multi-select-dropdown.tsx
  filter-workspace.tsx
  menu-panel.tsx
  menu-card.tsx
  recipe-detail.tsx
  recipe-image.tsx
  ingredient-image.tsx
  icons.tsx
  copy.ts
```

要求：

- 不保留一个超长、同时处理文案、筛选、弹层、卡片、详情的组件。
- 共享类型来自 domain 层。
- 中英文文案集中管理，不能散落在 JSX 条件表达式中。
- 颜色使用语义 token，组件内不散落原始 hex。
- 不引入与项目规模不匹配的状态管理库。
- 避免不必要的 `useEffect`；派生值用纯函数或 `useMemo`。
- 保持当前菜单在筛选改变时稳定，只更新 stale 状态。

### 18. 状态与错误处理

至少实现并实际可见地处理：

- 初始加载。
- 目录为空。
- 没有安全菜谱结果。
- 只能生成部分菜单。
- 条件已改变、菜单未重组。
- 重组进行中。
- 菜谱图片加载失败。
- 食材图片加载失败。
- 营养数据不完整。
- 价格数据过期。
- 详情 slug 不存在。
- 离线/重试。

图片失败时使用同系列的轻量 SVG 食物占位图，但只能作为运行时错误回退；不能把它算作完成的最终 AI 图片。

### 19. Cloudflare 上线顺序与权限边界

#### Gate A：当前基线上线

1. 先运行完整本地验证。
2. 检查 `wrangler whoami` 和现有 Cloudflare 配置。
3. 确认当前页面不依赖尚未绑定的 production D1/R2 后，优先发布可运行基线。
4. 记录线上 URL、部署版本和健康检查结果。
5. 对线上首页和 `/api/v1/health` 做只读验证。

#### Gate B：新版上线

1. 所有 UI、80 道数据、图片和本地测试完成。
2. 先部署 staging。
3. 在 staging 完成浏览器、触屏、键盘、图片和菜谱详情验收。
4. 再部署 production。
5. 线上 smoke test 通过后才报告完成。

权限规则：

- 用户已经登录 Cloudflare，但网络、创建 R2/D1、绑定资源或生产部署如果触发审批，直接用工具请求明确权限；不要让用户手工复制 token。
- 不输出、读取或提交秘密。
- 不做破坏性数据库操作。
- 生产配置里的 placeholder ID 不得原样部署为真实绑定。
- 如果首发页面仍使用静态本地目录，不要为了上线基线强行引入 D1。
- 发布命令优先使用 package scripts：`npm run deploy:staging`、`npm run deploy:production`。

### 20. 执行阶段与退出条件

#### Phase 0 — 基线与首次上线

- 读取仓库、运行基线检查。
- 修复仅阻塞构建/上线的缺陷。
- 部署当前可运行基线。

退出：线上 URL 可访问，health 通过，记录基线。

#### Phase 1 — 数据架构与 80 道目录

- 拆分共享 ingredient/factory/batches/index。
- 新增规定的 40 道菜。
- 清理现有 40 道的泛化文案、步骤、标签和错误媒体。
- 完成 schema、coverage 和 validation。

退出：总数和所有配额自动验证通过。

#### Phase 2 — 亮色设计系统与单屏骨架

- 更新 MASTER 和 UX spec。
- 删除暗色模式。
- 实现 compact header、quick controls、61.8/38.2 工作区。
- 建立 SVG 图标系统。

退出：1024×768 默认 4 菜无页面滚动、无横向溢出。

#### Phase 3 — 统一下拉框与完整筛选

- 实现共享单选/多选 dropdown。
- 扩展 PlannerFilters 和确定性规则。
- 完成撤销、重置、冲突和可访问交互。

退出：所有选择统一、键盘/触屏可用、筛选测试通过。

#### Phase 3A — 候选菜单引擎与 AI 选择层

- 实现固定顺序的 recipe eligibility pipeline。
- 实现 role template、beam search、全菜单硬约束和 0–100 score breakdown。
- 实现 balanced/budget/easy 三套权重。
- 实现结构化 exclusion reason、menu conflict 和实时 eligibility summary。
- 实现服务端 AI adapter、严格结构化输出、candidate allow-list 和再次验证。
- 实现超时、无 secret、无效输出、过期 revision 的确定性 fallback。
- 实现全菜单重组和单道替换的再次验证。

退出：AI 无法让任何不合格 recipe 进入菜单；AI 完全不可用时核心流程仍可用，且同一输入得到可复现结果。

#### Phase 4 — 菜单卡与菜谱详情

- 图片、成本、约热量、时间、标签进入卡片。
- 详情层、URL、食材、步骤、缩放和安全信息完成。

退出：80 道都可通过菜单卡或目录数据打开完整详情。

#### Phase 5 — AI 图片生产

- 生成风格 pilot 并自检。
- 生成 80 张成品图和所有去重食材图。
- 转码、生成 manifest、上传/绑定 R2 或完成批准的等价存储。
- 清除所有旧占位媒体引用。

退出：媒体审计 0 缺失、0 `ideas/` 菜谱路径、所有 AI 标记自动出现。

#### Phase 6 — 综合 QA 与新版部署

- 格式、lint、类型、测试、build、recipe validation/coverage。
- 浏览器与视觉回归。
- staging 部署与验收。
- production 部署与线上 smoke test。

退出：下面“完成定义”全部通过。

### 21. 必跑验证

至少运行：

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run recipes:validate
npm run recipes:coverage
npm run build
```

如果修改了 Cloudflare 绑定：

```bash
npm run cf-typegen
npm run preview
```

浏览器验收：

- 375×812：正常单列滚动、没有水平滚动。
- 768×1024：平板竖屏适配。
- 1024×768：4 菜单屏、所有主要选择可见。
- 1366×768：单屏、详情可用。
- 1440×900、1536×1024：黄金比例和密度稳定。
- 中文、英文。
- Metric、US。
- 鼠标、触屏、纯键盘。
- 系统浅色与系统深色设置下都保持相同亮色 UI。
- `prefers-reduced-motion`。
- 200% 浏览器缩放下仍可操作；允许必要滚动，不得截断。

视觉检查：

- 无超大标题。
- 无 Emoji 图标。
- 粉彩不影响正文对比度。
- 所有 dropdown 对齐，展开不推动布局。
- 同时只打开一个 dropdown。
- 菜谱卡图片不变形、不跳动。
- 详情打开/关闭无焦点丢失。
- AI 标记清楚但不喧宾夺主。
- 长中文、长英文标题不溢出。

### 22. 完成定义

只有全部满足才能宣布完成：

- 当前版本已经有可访问的 Cloudflare 线上基线，或明确提供了唯一外部权限阻塞证据。
- 新版始终亮色，系统深色偏好不会改变主题。
- 1024×768 默认 4 道菜时主要页面无需页面级滚动。
- 主区域为约 61.8/38.2。
- 所有选择统一为共享 dropdown，支持规定的多选、搜索、键盘和触屏。
- 每个筛选条件都有明确的 recipe 字段映射、硬/软层级和结构化排除原因。
- must-include 食材按整桌覆盖，不会错误要求每道菜包含全部希望食材。
- 候选菜单由确定性规则生成，并带可解释的 0–100 score breakdown。
- AI 只从已通过全部硬规则的 candidate allow-list 里选择；任何越权或失败都安全回退。
- AI 返回后按当前 filter revision 和 ruleset 再验证，旧响应不能覆盖新菜单。
- 最终目录恰好 80 道。
- 8 个 primary role、16 个菜系、10 个 method 配额全部通过自动验证。
- 页面数量来自实际数据，不含硬编码 30/40/80。
- 点击菜单卡可以看到完整双语菜谱、食材、时间、步骤、估算成本和热量。
- 80 张菜谱图齐全。
- 每个实际使用的 canonical ingredient 都有去重食材图。
- 所有 AI 图均有真实元数据和自动 AI 标记。
- 没有菜谱媒体继续指向 `ideas/`。
- 没有已知硬过敏原违规；unknown 不静默通过。
- 所有必跑命令通过，或明确区分并记录无关的既有失败。
- staging 和 production smoke test 通过。
- 不存在明显横向滚动、焦点陷阱、无标签按钮或低对比正文。

### 23. 工作方式与进度沟通

- 开始后先发一条短进度，说明基线状态和实施顺序。
- 每完成一个 Phase 发一次简短更新，列出完成项、验证结果和下一阶段。
- 工具运行期间不要让用户超过 60 秒没有进度信息。
- 不要因为工作量大而自行缩小范围。
- 同一底层问题两种不同尝试均失败后，停止盲目重试，提交包含错误、日志、已尝试方法、根因排序和建议动作的诊断包。
- 不要覆盖无关用户修改。
- 文件修改使用安全、可审查的方式；不得使用破坏性 Git 命令。

### 24. 最终交付报告格式

最终只报告真实完成情况：

#### Completed

- 实现了什么。
- 线上 URL 和部署环境。
- 最终菜谱/菜系/角色/方法数量。
- AI 菜谱图和食材图实际数量。

#### Files

- 重要修改文件的绝对路径链接。

#### Verification

- 实际运行的命令及结果。
- 浏览器测试视口及结果。
- staging/production smoke test。

#### Decisions

- 重要实现选择和与本 Prompt 不同的仓库事实。

#### Remaining risks

- 仅列真实未解决风险或需要人工/外部权限完成的事项。
- 不得把 placeholder、未生成图片或未部署状态描述为完成。

现在开始执行，不要只复述计划。

## Prompt 结束
