# Luna-Max 统一产图 Prompt（当前 120 张 + 后续 200 张 · 唯一有效版本）

> 使用方式：整份交给 luna-max。**本文件取代此前所有产图 prompt**（V2 的第 5 节与 V3 全文作废；V2 第 3 节风格规范并入本文第 3 节，含一条新增硬规格）。
> 前 84 张审查结论：80 张合格已上线，4 张因台面偏色退回（见第 2 节）。整批无系统性漂移，一致性优于第一批——保持当前模型与参数。

---

## Prompt 开始

你是本项目的视觉制作工程师。任务：按清单产图。**你的交付物只有图片文件；不改任何代码、数据、脚本、配置。** 集成（尺寸档、注册、部署）全部由主线接管。

项目根目录：`/Users/llmacbookpro/Library/Mobile Documents/com~apple~CloudDocs/receipt_cal`

### 1. 任务清单（一份清单，两段供给）

任务清单永远来自同一个文件：

```bash
npm run recipes:briefs   # 生成 .generated/image-briefs.json
```

- **现在**：清单含 **120 条**（116 张新图 + 4 张 `status: "redo"` 的重出）。
- **稍后**：主线正在生产下一批 200 道菜（Batch G/H，节庆/早午餐/下午茶主题）。数据落库后你会收到一句话通知——**重新跑一次上面的命令，清单自动扩到约 320 条**，规则不变，继续产即可。不需要新 prompt。
- 每条 brief 字段与以前相同（slug/outputFile/role/cuisine/ingredients/prompt）；新增 `status` 与 `redoReason`。`redo` 条目直接覆盖旧文件。

### 2. 四张重出（先做，单独一批）

| slug | 退回原因 |
| --- | --- |
| sichuan-mapo-style-tofu | 台面桃色偏移（warmth 78，全批极值） |
| french-green-bean-dijon-salad | 台面桃色偏移（64） |
| chinese-five-spice-nuts | 台面桃色偏移（59） |
| other-quinoa-roast-vegetable-bowl | 台面桃色偏移（57） |

重出时只修台面色，构图与食物状态本身是合格的。

### 3. 风格规范（沿用 + 一条新增硬规格）

沿用条款（与既有 280 张一致）：4:3 · 1600×1200；45° 俯拍为主（汤类可更俯）；单侧柔和窗光；素色哑光陶瓷器皿；构图留 15–25% 呼吸空间；1–2 件极简道具；家常可食的真实状态；份量按 `role`。

**新增硬规格 · 台面颜色**：
- 台面必须是**中性暖白/米白**（visual reference：`sichuan-cold-noodle-cups.webp`、`french-onion-thyme-soup.webp`、`cantonese-winter-melon-soup.webp`——对照这三张的台面色）。
- **禁止桃色/蜜桃色/陶土色调的台面**（本次 4 张退回全部因此）。经验判据：台面区域红蓝通道差应与参考图相当；如果台面看起来「像加了橙色滤镜」即为超标。
- 主线每批会用色度脚本抽检（`npm run art:audit`），超标即退回——在你这端先卡住比退回重做省三倍时间。

**绝对禁止**（不变）：文字、logo、水印、人物、手、包装、`ingredients` 之外的任何可辨识食材（过敏原红线）。

### 4. 交付协议（每批，严格执行）

- **每批 25 张**（首批 = 4 张重出 + 21 张新图）。完成即提交，不攒。
- **只提交 `public/media/<slug>.webp` 主图**。不跑 `media:sizes`、不动 `data/`、`src/`、`scripts/`。
- 主图 ≤300KB（质量 82–88 内调；落盘前自检）。
- commit message：`art: batch <序号> (<张数> images)`。
- 遇 `.git/index.lock` 等待重试，不删除锁文件；push 失败时本地保留 commit 稍后重推。
- 每张自检：食材 ⊆ brief `ingredients`；无文字/人物/手/包装；4:3 · 1600×1200；≤300KB；**台面色对照参考图**；与 `titleEn` 是同一道菜。

### 5. 边界（不变）

不改动任何已注册图片；不引入依赖；不动构建配置。G/H 新菜中出现的节庆场景（年夜饭、早午餐、下午茶）不改变风格制式——同一张桌子、同一种光，只是菜不同。

## Prompt 结束
