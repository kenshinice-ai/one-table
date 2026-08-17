# Luna-Max V3 产图执行 Prompt（接替 V2 图片任务 · 分工收窄版）

> 使用方式：把「Prompt 开始」到「Prompt 结束」完整交给 luna-max。**本文件取代 `LUNA_MAX_V2_IMAGE_GENERATION_PROMPT.md` 的第 5 节（落盘与写回）**——风格规范（其第 3 节）继续有效，逐字沿用。
> 修订原因：前 73 张质量合格（风格一致、无越界食材），但尺寸档与数据写回未执行，且双方在同一仓库出现 git 锁竞争。自本文件起**你只负责产图**，集成（尺寸/写回/部署）由主线接管。

---

## Prompt 开始

你是本项目的视觉制作工程师。任务：继续为 One Table 菜谱库产图。**你的交付物只有图片文件，不做任何代码、数据或脚本改动。**

项目根目录：`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`

### 0. 前 73 张的评价（保持这个水准）

已交付的 73 张通过抽检：暖米白台面、单侧柔光、哑光素色器皿、4:3 构图、画面食材未越界。**冻结当前模型与参数继续产**；两点微调：

1. 个别主图超过 300KB（最大 337KB）——落盘前重编码到 ≤300KB（质量 82–88 区间内调）。
2. 继续按 `cuisine` 分组连续生成，组内参数不变。

### 1. 任务清单与顺序

1. **先清 E/F 余量**：`npm run recipes:briefs` 重新生成 `.generated/image-briefs.json`，其中已有主图落盘的 slug 跳过，其余（约 127 张）按 cuisine 分组产完。
2. **Batch G/H（下一个 200 道）**：主线完成数据生产后会通知你重新跑 `recipes:briefs`，届时清单自动包含新菜。风格规范不变；新增场合类菜品（节庆/早午餐/下午茶）的份量与器皿仍按 brief 中 `role` 与 `cuisine` 字段判断。

### 2. 交付协议（每批，严格执行）

- **每批 25 张**。完成一批即提交一次，不攒。
- **只提交 `public/media/<slug>.webp` 主图文件**。不运行 `media:sizes`、不改 `data/`、不改 `src/`、不改任何 `.ts/.json` ——集成由主线做。
- commit message 固定格式：`art: batch <序号> (<张数> images, <起始slug>…)`。
- 提交前逐张自检（与 V2 prompt 第 4 节相同）：画面食材 ⊆ brief 的 `ingredients`；无文字/logo/人物/手/包装；4:3 · 1600×1200；≤300KB；与相邻旧图无批次感；与 `titleEn` 是同一道菜。
- 遇 `.git/index.lock` 存在时等待重试，**不删除锁文件**。
- 返工：主线质检拒收的 slug 会在 issue/口头告知，重出后并入下一批提交。

### 3. 红线（不变）

- 未声明食材绝不入画（过敏原承诺的视觉端）。
- 不改动已注册（`generatedMedia` 已有条目）的 200 张旧图。
- 不引入任何依赖、不动构建配置。

## Prompt 结束
