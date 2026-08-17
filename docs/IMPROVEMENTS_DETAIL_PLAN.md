# 改良建议细化方案（实现级设计 · 只出方案）

> 承接 CONTENT_WAVE_3_PLAN 第二节的 P0–P2 清单，本文把每项落到「怎么做」的粒度，并补充深想后的新增项。每项给出：设计、边界、验收。红线沿用（无账号无个人数据、确定性、静态客户端、打开即有内容）。

---

## P0 · 商用试点硬前置

### 1. 匿名埋点（campaign 数据源）

**设计**：Workers Analytics Engine（AE）数据集 `onetable_events`。前端在四个动作点 `navigator.sendBeacon('/api/v1/beacon', ...)`：`scan`（带 `?src=qr` 参数的首访）、`compose`（换一组/条件变更后的成菜）、`list`（购物清单打开）、`route`（路线卡保存）。Worker 端一个 30 行的 route：`writeDataPoint({ blobs: [event, tenantId, APP_ENV], doubles: [1] })`。
**关键取舍**：

- 不用 Cloudflare Web Analytics——它只有 pageview，给不出四事件；AE 免费额度完全够。
- `/api/v1` 休眠红线的例外声明：beacon 是**无状态计数**，不读不写业务数据、不接 D1，写进红线文档作为已审批例外。
- 客户端节流：同事件每会话最多 1 次（sessionStorage 标记），拒绝形成行为轨迹——我们卖给商场的是聚合数，不是用户画像。
  **报告管线**：`scripts/report/campaign-report.ts` 用 AE 的 SQL API 拉周聚合 → 生成信头 Markdown/HTML 报告（复用 letterhead 模板）——W5 结案报告从此一键出。
  **验收**：demo 域完成一次全流程后，AE 查询四事件各 ≥1；无 cookie、无 UA 存储；`/privacy` 页文案同步更新。

### 2. Kiosk 模式（W3 遗留）

**设计**：`?kiosk=1` 加 `<html data-kiosk>`：触控目标 ≥56px、隐藏 footer 外链与打印按钮（kiosk 无打印机）、90 秒无交互回吸引屏。吸引屏 = 全屏轮播当季 occasion 专题菜卡（数据来自 occasions 字段）+ 「碰一下开始 / Touch to start」。
**手机交接**：配好一桌后屏幕出二维码（编码现有分享 URL）。QR 编码器**vendor 一个单文件实现**（public-domain 的 qrcode 生成器约 300 行，放 `src/vendor/qr.ts` 带来源注释）——不进 npm 依赖树，无供应链面，红线例外以「vendored, auditable, zero-dep」为由记录。
**验收**：全触控走通「吸引屏→配菜→扫码带走」；闲置复位；断网（SW 缓存）下仍可用。

### 3. Sample Grocer 租户（亚超 demo）

**设计**：`tenants/sample-grocer/`，`venueType: 'grocer'` 走**通道模式**：floors 仅一层且无 planSrc（schema 允许 null），路线视图渲染为「通道条带图」——程序生成的横向通道序列（通道号大圆 + 该通道购物项），不需要画平面图。路线卡同理换通道条带模板。zone 即通道号。
**数据**：8 通道 × 类目映射（亚超场景：1 干货酱料 / 2 米面 / 3 零食 / 4 冻柜 / 5 蔬果 / 6 肉档 / 7 海鲜 / 8 日用），30 分钟录完。
**验收**：`demo-grocer.pwestudio.site` 上线；扫街拜访时手机演示用它，而不是拿商场版将就。

## P1 · 产品增长

### 4. 菜谱独立页 `/recipe/[slug]`（SEO 长尾）

**设计**：`generateStaticParams` 预渲染 600 页。页面 = 服务端渲染的完整菜谱（图、食材基准份量、结构化步骤、健康叶、免责）+ 「配一桌菜」CTA 回主页（带 `?inc=<主料>` 预置筛选）。OG 图直接用 `-1280` 主图；`generateMetadata` 出双语 title/description。新增 `sitemap.ts`（601 URL）。
**取舍**：页面内不做交互换算（保持静态纯净），换算引导去主应用；无图菜谱（占位）的页面**照常生成**——文字内容本身就是 SEO 资产，图片后补。
**验收**：构建产物 600 静态页；抽查 5 页 Lighthouse SEO ≥95；sitemap 提交 Search Console（用户操作项）。

### 5. 场合筛选 + 当季专题 chips

**设计**：筛选面板「风味」组加「场合」下拉（icon: 日历轮廓）；设置行下方新增**当季 chips 行**（最多 3 枚，如「中秋家宴」「快手周中」「派对小食」），点击 = 写入 occasion 筛选 + 换组。当季配置放 `src/config/seasonal.ts`（日期区间 → chips），白标租户可在 tenant.json 覆盖——**这就是商场「节庆版」的实现机制**，不需要为租户单独开发。
**URL**：`?occasion=cny` 进分享参数——商场 campaign 的投放链接直接带场合落地。
**验收**：chips 随日期切换；分享链接复现同一专题桌。

### 6. 浏览视图 + 本地收藏

**设计**：「N 道菜符合条件」和搜索框「浏览全部」入口打开全屏浏览层：按课程分组的卡片流，IntersectionObserver 每 60 张增量渲染（600 张不需要虚拟化库）。卡片心形收藏钮 → `localStorage['onetable.favs']`（slug 数组）；筛选面板加「只看收藏」开关。收藏在 PWA 离线可用。
**验收**：600 卡滚动 60fps（M 系列机型）；收藏跨会话保留；无任何网络写入。

## P2 · 偿还与延展

### 7. A–D 老 200 道结构化步骤回填

**设计**：两条路径——C/D（生成器产物）直接在 `expansion-shared.ts` 加 structuredInstructions（与 v3 同构，1 小时）；A/B（80 道手写）写一次性 codemod：其 instructions 本身是四段式模板，按位置映射 phase（1→prep, 2→cook, 3→cook, 4→plate），minutes 按 active/total 比例分配。跑完人工抽查 10 道。
**验收**：600/600 有结构化步骤；详情页时间轴全量生效。

### 8. 其余（顺序执行，不再展开）

拼音首字母搜索（搜索索引加一列，无依赖，音表 vendored）→ PWA 更新提示（SW `updatefound` → toast「有新版本，点击刷新」，解决部署频繁时的旧版驻留）→ iOS 壳（B2C 推广启动时）。

## 新增深想项（本轮补充）

- **路线购物勾选态**：路线面板每站条目可勾选，存 sessionStorage——顾客在场内边走边勾，回来接着买。零后端，体验差异巨大。**建议并入 P0-3 一起做。**
- **结案报告一键化**：见 P0-1 报告管线——把「给商场发周报」从手工变成脚本，这是维护费毛利的直接来源。
- **谨慎项（想过但不做）**：菜谱评分/评论（需要账号与审核，破红线）；实时库存对接（重集成，等真实租户提出再说）；多语言第三语（等真实需求）。

## 建议执行顺序

| 批     | 内容                                           | 体量 |
| ------ | ---------------------------------------------- | ---- |
| 下一轮 | P0-1 埋点 + P0-3 Sample Grocer + 路线勾选      | 1 周 |
| 随后   | P0-2 Kiosk + P1-5 场合 chips（互相独立可并行） | 1 周 |
| 再后   | P1-4 菜谱静态页 + P1-6 浏览收藏                | 1 周 |
| 空隙   | P2-7 步骤回填（半天）+ P2-8 顺序消化           | —    |
