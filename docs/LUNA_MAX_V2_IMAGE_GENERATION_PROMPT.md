# Luna-Max V2 菜品配图执行 Prompt（200 道）

> 使用方式：把本文件从「Prompt 开始」到「Prompt 结束」完整交给 luna-max。这是一个**只做配图**的任务——代码、数据、界面均已完成并上线，不要改动它们。
>
> 核心目标：新增的 200 道菜的配图，必须与已有 200 道**看起来像同一位摄影师、同一天、同一张桌子上拍的**。风格一致性优先于单张图的惊艳程度。

---

## Prompt 开始

你是本项目的视觉制作工程师。请为 One Table（一桌）菜谱库中尚无配图的 200 道菜生成成品图，并落盘到仓库，使线上占位图全部被替换。

项目根目录：

`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`

GitHub 远端：`https://github.com/kenshinice-ai/one-table`（分支 `main`）

### 0. 任务边界

**只做这一件事**：生成 200 张菜品图并提交。

明确不做：

- 不改动 `src/`、`data/`、`docs/` 下的任何逻辑或文案（唯一例外见第 5 节：写回 `generatedAt` / `aiModel` 的媒体元数据）。
- 不新增菜谱、不改营养/价格/过敏原数据。
- 不改动已有 200 道菜的配图（`data/recipes/index.ts` 中 `generatedMedia` 已登记的那些）。
- 不引入新的运行时依赖。

### 1. 开始前必须读取

- `docs/RENDER_NOTES.md`、`docs/LUNA_MAX_200_RECIPE_UI_IMAGE_EXECUTION_PROMPT.md`（第一批 200 张的原始风格规范——**这是风格一致性的唯一权威来源**）
- `design-system/menu-planning-companion/MASTER.md`
- `data/recipes/index.ts` 中的 `generatedMedia` 表（已完成的 200 张）
- `public/media/` 下任取 10–15 张既有成品图，**逐张观察**：视角、景深、餐具、桌面材质、光位、色温、留白比例。你要复制的是这些，不是你自己的审美。

### 2. 取得任务清单

```bash
npm run recipes:briefs
```

生成 `.generated/image-briefs.json`，含 200 条记录，每条：

| 字段                  | 用途                                                                      |
| --------------------- | ------------------------------------------------------------------------- |
| `slug`                | 文件名，**唯一权威**                                                      |
| `outputFile`          | 落盘路径 `public/media/<slug>.webp`                                       |
| `titleEn` / `titleZh` | 菜名                                                                      |
| `role`                | 课程（starter/soup/salad/snack/main/side/staple/dessert）——决定器皿与分量 |
| `cuisine`             | 菜系——决定器皿风格与摆盘习惯                                              |
| `method`              | 烹饪方式——决定成品状态（带汤汁 / 焦边 / 生鲜）                            |
| `ingredients`         | **画面中只允许出现这些食材**                                              |
| `altEn` / `altZh`     | 已写好的 alt 文案，不要改                                                 |
| `prompt`              | 由数据生成的基础提示词，作为起点                                          |

`prompt` 字段是自动生成的骨架。你需要在它基础上补齐第 3 节的风格约束再送入模型。

### 3. 风格规范（与既有 200 张严格一致）

- **画幅**：4:3 横向，输出 1600×1200。
- **视角**：45° 俯拍为主；汤品与深碗类可用 60–75° 更俯的角度以显示内容物。禁止 90° 正俯拍（既有图库没有这一视角）。
- **光线**：单一柔和侧逆光（窗光感），左上或右上入射；阴影柔、有方向，不用环形光、不用硬闪。
- **桌面**：温暖的米白／浅陶土色哑光台面。禁止大理石纹、深色木纹、金属台面、餐布褶皱抢戏。
- **器皿**：素色哑光陶瓷，白／米／浅鼠尾草绿／浅陶土红。禁止花纹、镀金边、透明玻璃盘、一次性餐具。
- **配色氛围**：整体暖调，点缀鼠尾草绿与柔和桃粉（品牌色 `--terracotta #d96b45` / `--sage #5a947e`），但不要把品牌色刷在食物上。
- **构图**：主体居中偏左或居中，右侧或上方留出 15–25% 呼吸空间；1–2 件极简道具（一双筷子、一把勺、一小碟酱料、一枝香草），道具不得喧宾夺主。
- **食物状态**：真实、可食、家常水准——不是米其林摆盘，也不是随手快照。要看得出「这是一桌人会真的吃的菜」。
- **份量**：按 `role` 区分——`snack`/`starter` 小碟少量；`main` 一大盘；`soup` 深碗；`staple` 主食盆；`dessert` 小份精致。

**绝对禁止出现**：文字、logo、水印、人物、手、包装袋/罐/盒、品牌标识、二维码、`ingredients` 之外的任何可辨识食材（尤其是过敏原类：坚果、虾蟹、乳制品、蛋——它们不在清单里就不能出现在画面里）。

> **为什么食材约束是硬红线**：产品对读者承诺「排除过敏原会同时拦截 contains / derived_from / may_contain / unknown」。一张画面里出现了数据未声明的花生或虾，就等于用图片推翻了这条安全承诺。宁可图片朴素，不可多画一样东西。

### 4. 生成与质检流程

1. **先做 12 张校准批**：从不同 `cuisine` × `role` 组合中各取一张（至少覆盖 starter/soup/salad/main/dessert 五类）。
2. 把这 12 张与 `public/media/` 中既有成品图**并排比对**：视角、光位、桌面色、器皿、留白是否属于同一图库？不一致就调整提示词或参数，重出，直到肉眼看不出批次差异。**校准批不通过，不要开始批量生产。**
3. 批量生成剩余图片。建议按 `cuisine` 分组连续生成，同组内参数不变，减少组内漂移。
4. **每张逐条自检**（不通过则重出，不要将就）：
   - [ ] 画面食材 ⊆ 该条 `ingredients`
   - [ ] 无文字/logo/人物/手/包装
   - [ ] 4:3、1600×1200
   - [ ] 视角、光线、桌面、器皿符合第 3 节
   - [ ] 与相邻既有图并排看无批次感
   - [ ] 与 `titleEn` 描述的菜确实是同一道菜

### 5. 落盘与写回

1. 成品存为 `public/media/<slug>.webp`（1600×1200，质量 82–88，单张控制在 300KB 内）。文件名必须与 `slug` **完全一致**，不得改名、不得加后缀。
2. 生成响应式尺寸档：
   ```bash
   npm run media:sizes
   ```
   会为每张图产出 `-320` / `-640` / `-1280` 三档；**这一步不做，线上仍会走占位图逻辑**。
3. 在 `data/recipes/index.ts` 的 `generatedMedia` 表中为这 200 个 slug 各补一条：
   ```ts
   '<slug>': {
     objectKey: 'media/<slug>.webp',
     generatedAt: '<ISO 时间戳>',
     aiModel: '<实际使用的模型标识>',
   },
   ```
   同时把 batch E/F 的记录纳入该表的映射范围（当前 `launchRecipes` 中 E/F 两批未走 `generatedMedia` 分支，需要一并处理——这是本任务唯一允许的逻辑改动，改完必须 `npm test` 通过）。
4. 校验：
   ```bash
   npm run recipes:validate
   npm run recipes:coverage   # pendingMedia 应从 200 降为 0
   npm run typecheck && npm test && npm run build
   ```

### 6. 验收标准

- [ ] `public/media/` 中 400 个 slug 各有主图 + 三档尺寸。
- [ ] `npm run recipes:coverage` 报告 `generatedMedia: 400`、`pendingMedia: 0`。
- [ ] 线上不再出现任何「菜品图片准备中」占位图（逐页走查本桌菜单与搜索结果）。
- [ ] 随机抽 20 张与第一批 20 张混排，**说不出哪些是新的**。
- [ ] 抽查 20 张核对 `ingredients`，无未声明食材。
- [ ] `npm test`、`npm run build` 全绿；改动以独立提交推送 `origin/main`。

### 7. 汇报格式

- 使用的模型与关键参数（含负面提示词）
- 校准批的前后对比说明：调整了什么、为什么
- 200 张的生成与重出次数统计
- 未能达标的条目（如有）：slug、问题、建议
- coverage 报告前后对比、部署 URL 走查结论

## Prompt 结束
