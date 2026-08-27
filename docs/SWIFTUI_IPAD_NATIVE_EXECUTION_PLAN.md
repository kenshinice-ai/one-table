# 一桌 · One Table — iPad 优先 SwiftUI 原生化执行方案

> 状态：执行基线 v1.0  
> 日期：2026-08-23  
> 目标：在保留现有 Web/PWA 和 Cloudflare 服务的同时，新建真正原生的 SwiftUI Apple 多平台客户端；iPadOS 为第一优先级，iPhone 与 macOS 从同一架构扩展。  
> 本文是实施方案和验收清单，不代表 SwiftUI 工程已经创建或功能已经完成。

---

## 1. 核心决策

### 1.1 在 Codex 还是 Xcode 继续开发

不是二选一。采用以下分工：

- **Codex 是主要开发工作台和执行入口**：代码迁移、SwiftUI 实现、测试、`xcodebuild`、差异审查、文档和长期迭代都在 Codex 中进行。
- **Xcode 是 Apple 工具链和人工验收工具**：负责 SDK、Simulator、SwiftUI Preview、签名、Capabilities、Instruments、Archive、TestFlight 和真机调试。
- 日常循环保持 CLI-first；只有必须依赖 Apple GUI 或人工触摸判断的步骤才切到 Xcode。

推荐日常流程：

1. 在 Codex 中下达一个边界清晰的功能任务。
2. Codex 检查当前 Swift/测试/Git 状态并实施。
3. Codex 运行 Swift 单元测试和 `xcodebuild`。
4. Codex 在 Simulator 中验证并保留截图或测试证据。
5. 需要 Preview、签名、真机手感、Instruments 或 Archive 时打开 Xcode。
6. 回到 Codex 修复问题、复跑验证、审查 diff。

OpenAI 官方的 iOS 工作流也建议让 Codex scaffold、build、debug SwiftUI，并保持 `xcodebuild`/Tuist 驱动的 CLI-first 循环：

- <https://learn.chatgpt.com/use-cases/native-ios-apps>

### 1.2 原生路线

采用：

- Swift 6；
- SwiftUI；
- iPadOS 第一优先级；
- 一个共享的 Apple 多平台代码库；
- iPhone 作为第二阶段适配；
- macOS 使用原生 SwiftUI destination，不以 WebView 或 Catalyst 作为最终架构；
- Web/PWA 继续运行，作为免安装入口、分享落点、访客入口和迁移期间的生产基线；
- Cloudflare `/api/v1`、D1 和静态媒体继续作为服务端与内容基础设施；
- App 核心规划功能不使用 `WKWebView`。

### 1.3 优先级

1. 规则正确、过敏原安全和结果可复现；
2. iPad 横屏与可变窗口下的完整工作台体验；
3. 离线可用；
4. 菜单、菜谱、购物清单和分享闭环；
5. iPhone 适配；
6. macOS 桌面级体验；
7. 账号、同步、宾客响应、AI 说明等在线增强。

---

## 2. 当前项目事实基线

实施前必须以当前仓库重新验证，不能把本文数字当作永久事实。

截至 2026-08-23，本轮实测：

- 当前是 Next.js 16 / React 19 / TypeScript 6 Web/PWA；
- 700 道已发布菜谱；
- 700 张菜谱 AI illustration 已生成；
- 105 个现有领域测试全部通过；
- planner 主要逻辑是无框架依赖的纯 TypeScript；
- 主流程在客户端读取版本化 JSON 并本地组合菜单；
- 实际 API 路由只有 health、recipes、recipe detail、menu compose、beacon；
- 完整账号、宾客响应、撤销式分享、后台 PDF 等仍未全部实现；
- planning/details JSON 合计约 3.8MB，适合成为原生 App 的内置 seed；
- `public/media` 约 243MB，不应整体放入 App 安装包；
- 当前仓库中还没有 Swift、`.xcodeproj`、`.xcworkspace` 或 `Package.swift`；
- 本机有 Swift 6.4 Command Line Tools，但完整 Xcode 当前未安装或未设为 active developer directory；
- `xcodebuild` 和 `simctl` 当前不可用；
- iCloud 已产生 `.next/types/* 2.*` 重复文件并使 Web typecheck 冲突。

### 2.1 现有能力与原生映射

| 现有 Web 能力                 | SwiftUI 原生实现                              |
| ----------------------------- | --------------------------------------------- |
| `src/domain/planner.ts`       | `OneTableCore/Planner` 纯 Swift 规则引擎      |
| `src/domain/shopping-list.ts` | `OneTableCore/Shopping`                       |
| `src/domain/venue.ts`         | `OneTableCore/Venue`                          |
| URL query state               | `Codable PlannerState` + Universal Links      |
| Service Worker                | 内置 seed + manifest 更新 + URLCache/文件缓存 |
| Clipboard copy                | `ShareLink` / 系统 Share Sheet                |
| Canvas 分享卡                 | SwiftUI `ImageRenderer` 或 Core Graphics      |
| `window.print()`              | `UIPrintInteractionController` / PDF 导出     |
| sessionStorage                | App 内 session state；必要时 SwiftData        |
| Web modal/drawer              | `sheet`、`popover`、`navigationDestination`   |
| 浏览器历史                    | `NavigationStack` / `NavigationPath`          |
| Wake Lock                     | 仅 kiosk target 使用 idle timer 控制          |
| Web analytics beacon          | 隐私合规的原生网络事件队列                    |

---

## 3. 范围边界

### 3.1 Native v1 必须包含

- 700 道菜谱目录解码和版本识别；
- 中英双语；
- 人数、菜数、用餐方式、预算；
- 场合快捷入口；
- 菜系、做法、食材、排除食材、饮食、过敏原、时间、设备、辣度、儿童友好筛选；
- 实时候选数量、冲突说明和空结果；
- 确定性菜单组合；
- 整桌重组；
- 单道替换并重新验证整桌；
- 菜谱详情、用量缩放和步骤；
- 购物清单；
- 菜单状态持久化；
- 分享链接；
- 菜单分享图；
- 打印或 PDF 导出；
- 核心目录和 planner 离线可用；
- iPad 横屏、竖屏、Split View、Stage Manager；
- VoiceOver、Dynamic Type、键盘、鼠标/触控板；
- 无 AI 时仍完整可用。

### 3.2 Native v1 可按租户启用

- 场馆平面图；
- 商户/货架路线；
- kiosk attract screen；
- QR handoff；
- 特定场馆联合品牌。

### 3.3 第一阶段明确不做

- 不删除或冻结现有 Web/PWA；
- 不把全部 243MB 图片打入 App；
- 不在 App 内运行模型；
- 不允许 AI 覆盖过敏原、安全、设备、预算或可行性规则；
- 不把数据库直接嵌入 UI 层；
- 不在 Swift 中手工复制维护 700 道菜的第二份内容源；
- 不承诺尚未落地的完整账号/宾客/后台 PDF 服务；
- 不为了 iPhone 简化 iPad 的核心工作台；
- 不为 macOS 交付一个简单放大的 iPad 界面；
- 不使用 WebView 伪装成原生主流程。

---

## 4. 推荐仓库与工程结构

Web 和 Apple 客户端保留在同一产品仓库，以共享数据契约、fixtures 和变更历史。

```text
receipt_cal/
├── apple/
│   ├── OneTable.xcodeproj
│   ├── OneTableApp/
│   │   ├── App/
│   │   ├── DesignSystem/
│   │   ├── Features/
│   │   │   ├── Planner/
│   │   │   ├── Menu/
│   │   │   ├── Recipe/
│   │   │   ├── Shopping/
│   │   │   ├── Search/
│   │   │   ├── Sharing/
│   │   │   └── Venue/
│   │   ├── Services/
│   │   │   ├── API/
│   │   │   ├── Cache/
│   │   │   ├── DeepLinks/
│   │   │   └── Analytics/
│   │   └── Resources/
│   ├── Packages/
│   │   └── OneTableCore/
│   │       ├── Package.swift
│   │       ├── Sources/
│   │       │   ├── Models/
│   │       │   ├── Planner/
│   │       │   ├── Shopping/
│   │       │   ├── Venue/
│   │       │   └── StateCodec/
│   │       └── Tests/
│   ├── OneTableUITests/
│   └── SharedFixtures/
├── data/                    # 现有 canonical recipe source
├── scripts/
│   └── apple/               # 生成 native seed 和 parity fixtures
├── src/                     # 现有 Web/PWA
└── docs/
```

工程原则：

- `OneTableCore` 不依赖 SwiftUI、UIKit、AppKit 或网络；
- UI 只能依赖 domain/service protocol，不直接读 Cloudflare/D1；
- recipe canonical source 仍在当前内容管线；
- Swift seed 由脚本生成，不手工维护；
- Xcode 工程优先使用 filesystem-synchronized groups，减少 `.pbxproj` 冲突；
- 只有项目文件维护成为真实瓶颈时再引入 Tuist，不先增加工具链复杂度。

---

## 5. 目标架构

### 5.1 模块边界

| 模块           | 责任                                                       | 是否可离线 |
| -------------- | ---------------------------------------------------------- | ---------: |
| Models         | 菜谱、食材、筛选、菜单、租户、场馆模型                     |         是 |
| Planner        | eligibility、role template、candidate、score、substitution |         是 |
| CatalogueStore | 内置 seed、版本、更新、搜索索引                            |         是 |
| MenuStore      | 当前菜单、撤销、重置、本地历史                             |         是 |
| Shopping       | 合并、缩放、分类、勾选状态                                 |         是 |
| Venue          | 商户映射、路线、完成状态                                   |         是 |
| APIClient      | `/api/v1`、超时、重试、错误映射                            |         否 |
| MediaCache     | 缩略图/原图按需下载和磁盘限制                              |       部分 |
| Sharing        | Universal Link、分享图、PDF、系统分享                      |         是 |
| Identity       | Apple/email identity 和安全存储                            |       后续 |
| AI Curation    | 仅向服务端发送 allow-list                                  |   后续增强 |

### 5.2 数据策略

1. 现有 TypeScript recipe source 仍是 canonical source。
2. 新增可重复执行的 native export 脚本。
3. 构建时输出带 schemaVersion/catalogueVersion/hash 的 JSON seed。
4. App 第一次启动直接从 bundle 加载，不依赖网络。
5. 联网后获取小型 manifest，只有版本更新时才下载新 catalogue。
6. 下载成功后完整校验 hash 和 schema，再原子替换。
7. 更新失败继续使用最后一个有效版本。
8. 菜谱图只打包极少量启动/默认菜单资源，其余按需下载并限制磁盘缓存。
9. AI illustration 标签由 media type 生成，不能靠手写 caption。

### 5.3 planner 迁移策略

不在原生 App 中嵌入 JavaScript runtime。将 planner 移植为纯 Swift，同时保留 TypeScript 实现作为迁移期 oracle。

迁移顺序：

1. 枚举、ID、数量、金额、营养和 locale-neutral 类型；
2. 默认 filters/preferences；
3. 过敏原、饮食、排除项和发布状态硬过滤；
4. 时间、设备、辣度、儿童友好与食材条件；
5. role templates；
6. candidate 生成；
7. 成本、营养、偏好、可行性和多样性评分；
8. deterministic tie-break；
9. partial menu 和空结果解释；
10. single-course substitution；
11. shopping list；
12. venue route；
13. share/deep-link state codec。

每个阶段都必须由 TypeScript 生成黄金 fixtures，再由 Swift 读取并逐项断言。不能只比较界面看起来相似。

### 5.4 AI 边界

- 硬规则全部在客户端和服务端确定性执行；
- AI 只接收通过硬规则的 candidate allow-list；
- AI 只能选择 candidate ID 和生成受约束说明；
- 响应必须重新验证 revision、candidate ID、recipe IDs 和规则版本；
- 超时、无网络、结构无效时使用确定性第一候选；
- 过敏原关系为 unknown 或 may contain 时不能静默当作安全。

---

## 6. iPad 优先交互方案

### 6.1 iPad 主工作台

横屏 regular width：

- 使用 `NavigationSplitView` 或等价的自适应原生分栏；
- 左侧约 60%–64%：桌面设置、场合、筛选、有效数量、撤销/重置；
- 右侧约 36%–40%：当前菜单、分数、成本、时间、重组和购物清单；
- 菜谱详情使用 detail navigation 或 sheet，不清空当前 planner；
- 菜单更新期间保留旧结果并显示更新状态；
- 不能出现筛选变化后结果仍旧但无状态提示；
- 不使用只能依靠 swipe 才能发现的操作。

竖屏、Split View 和窄窗口：

- 自动收敛为单列 NavigationStack；
- 条件筛选和菜单结果是可预测的导航目的地；
- 返回筛选必须保留选择与滚动位置；
- 窄窗口仍提供所有筛选，不转成顺序 wizard；
- 不根据具体设备型号硬编码布局，以 size class 和实际可用宽度判断。

### 6.2 iPad 原生能力

- Toolbar：搜索、语言、分享、更多操作；
- Keyboard shortcuts：搜索、重组、撤销、打印/导出；
- Pointer/hover：只做增强，不能成为唯一反馈；
- Stage Manager：连续缩放不破布局；
- Multiwindow：第一版可只保证单窗口，架构不得把全局 UI state 写死成唯一实例；
- Share Sheet：菜单链接、菜单图、PDF；
- Drag & Drop：后续增强，不阻塞 v1；
- Handoff/App Intents/Spotlight：v1 后增强。

### 6.3 视觉规则

以 `design-system/menu-planning-companion/MASTER.md` 和 `docs/UX_UI_SPEC.md` 为准：

- 保留暖色、纸张/餐桌感和当前品牌方向；
- 使用 semantic color assets 支持 light/dark；
- 字体优先系统字体与正确的中文 fallback；
- 不采用 Playfair Display SC 作为中文字体；
- 4/8pt spacing rhythm；
- 一般触控区域至少 44×44pt；
- 正文和重要小字对比度至少 4.5:1；
- press feedback 在 80–150ms 内可感知；
- 微交互 150–300ms，并尊重 Reduce Motion；
- SF Symbols 或统一的品牌 vector icon；
- 不用 emoji 充当结构图标；
- Dynamic Type 最大档不截断关键信息；
- VoiceOver 顺序与视觉顺序一致。

---

## 7. 分阶段执行计划

时间估算假设：1 名熟悉 SwiftUI 的高级工程师全职，Codex 辅助；不包含等待 Apple 审核的自然时间。

### Phase 0 — 工具链与安全基线（2–4 天）

目标：建立可以稳定由 Codex 驱动的 Xcode 构建环境。

- [ ] 安装完整 Xcode；
- [ ] 接受 license 并完成 first launch；
- [ ] 将 active developer directory 指向完整 Xcode；
- [ ] 验证 `xcodebuild -version`；
- [ ] 验证 `xcrun simctl list devices available`；
- [ ] 安装至少一个目标 iPadOS Simulator runtime；
- [ ] 准备 Apple Developer Team；
- [ ] 将工作 Git checkout 迁到非 iCloud 本地目录；
- [ ] 保留当前远端、分支和用户未提交修改；
- [ ] 在迁移后的 checkout 重新运行 Web 测试、typecheck、build；
- [ ] 记录迁移前后 HEAD 和 Git 状态；
- [ ] 不删除现有 Web 部署。

出口标准：

- Codex 能调用 `xcodebuild`；
- Simulator 可用；
- Web 基线重新验证；
- 工作目录不再产生 iCloud `* 2.*` 冲突。

### Phase 1 — SwiftUI 多平台骨架（3–5 天）

目标：创建可构建、可启动、可测试的原生工程。

- [ ] 在 `apple/` 创建 SwiftUI App；
- [ ] 支持 iPhone、iPad、Mac destinations；
- [ ] iPad 作为默认运行和 UI 验收 destination；
- [ ] 创建 `OneTableCore` local Swift package；
- [ ] 创建 unit test 和 UI test targets；
- [ ] 配置 Debug/Release；
- [ ] 配置 Bundle ID 占位值但不伪造正式签名；
- [ ] 使用 filesystem-synchronized groups；
- [ ] 添加最小 app shell、错误页和 loading state；
- [ ] 添加 CLI build/test 脚本；
- [ ] 添加 SwiftFormat/SwiftLint 仅在确有需要时评估，不先增加依赖。

出口标准：

- iPad Simulator build、launch、unit test 通过；
- iPhone 和 Mac targets 至少 compile-green；
- Scheme、destination 和命令写入 README/本文执行记录。

### Phase 2 — 数据契约与生成管线（1–2 周）

目标：让 Web 与 Swift 读取同一份语义数据。

- [ ] 列出所有 native v1 必需字段；
- [ ] 定义 schemaVersion 和 catalogueVersion；
- [ ] 为 Swift 建立 `Codable` models；
- [ ] 保持 money 为整数 cents；
- [ ] 保持 normalized units；
- [ ] 保持 unknown/null，不以零代替；
- [ ] 生成 native seed JSON；
- [ ] 生成 hash/manifest；
- [ ] 生成小型 fixtures；
- [ ] 生成 700-recipe decode test；
- [ ] 生成 malformed/unknown enum 测试；
- [ ] 定义 additive versioning 和兼容策略；
- [ ] 不在 Swift 中复制第二份菜谱源。

出口标准：

- Swift 可解码全部当前菜谱；
- 字段数量、ID、locale、media type 与 TypeScript 基线一致；
- seed 可重复生成且相同输入得到相同 hash。

### Phase 3 — 纯 Swift planner parity（3–5 周）

目标：原生 App 离线生成与 Web 语义等价的菜单。

- [ ] 移植全部硬过滤；
- [ ] 移植 role templates；
- [ ] 移植 candidate generation；
- [ ] 移植 scoring；
- [ ] 移植 deterministic tie-break；
- [ ] 移植 partial/empty result；
- [ ] 移植 substitutions；
- [ ] 移植 shopping list；
- [ ] 移植 venue routing；
- [ ] 移植 state codec；
- [ ] TypeScript 生成黄金输入/输出 fixtures；
- [ ] Swift 对 fixtures 做逐字段对比；
- [ ] 对过敏原 unknown 建立回归测试；
- [ ] 对极窄条件、设备冲突和预算边界建立测试；
- [ ] 对同一输入重复运行验证稳定性。

出口标准：

- 所有硬规则 fixtures 100% 一致；
- 代表性菜单 recipe IDs、score breakdown、partial result 一致；
- 同一 catalogue/ruleset/input 始终得到相同输出；
- 无网络下完成筛选和重组。

### Phase 4 — iPad 原生工作台（4–6 周）

目标：完成可真实使用的 iPad 主流程。

- [ ] App launch 和 catalogue loading；
- [ ] table settings；
- [ ] occasion chips；
- [ ] filter workspace；
- [ ] multi-select popover/sheet；
- [ ] selected chips；
- [ ] eligible count/conflict feedback；
- [ ] menu board；
- [ ] recompose；
- [ ] per-course substitution；
- [ ] recipe detail；
- [ ] ingredient scaling；
- [ ] shopping list；
- [ ] reset confirmation；
- [ ] undo；
- [ ] global search；
- [ ] Chinese/English；
- [ ] loading、empty、no-safe-result、error、offline；
- [ ] portrait、landscape、Split View、Stage Manager；
- [ ] keyboard、pointer、VoiceOver、Dynamic Type。

出口标准：

- 首次用户可在 iPad 上离线生成四道菜菜单；
- 所有筛选自由可达，不是 wizard；
- 所有窗口宽度无截断、重叠或不可达功能；
- 菜单重组期间不空白；
- 过敏原和安全说明完整可读。

### Phase 5 — 原生分享、缓存与场馆（2–3 周）

目标：完成 App-like 能力和当前产品差异化能力。

- [ ] Universal Links；
- [ ] Web link 与 native state 双向 round-trip；
- [ ] 系统 Share Sheet；
- [ ] 菜单分享图；
- [ ] 菜谱分享图；
- [ ] PDF/打印；
- [ ] media disk cache；
- [ ] cache size/eviction；
- [ ] 离线图片 placeholder；
- [ ] catalogue manifest 更新；
- [ ] hash/schema 校验；
- [ ] 失败时回退有效 seed；
- [ ] 场馆路线；
- [ ] 路线勾选状态；
- [ ] QR handoff；
- [ ] 租户配置边界。

出口标准：

- Web 和 App 打开同一链接得到同一菜单状态；
- 飞行模式下目录、菜单、菜谱文字、购物清单可用；
- 下载失败不破坏最后有效 catalogue；
- App 安装包不包含全部原始媒体库。

### Phase 6 — iPhone 适配（2–3 周）

目标：不破坏 iPad 架构的前提下完成 iPhone。

- [ ] 单列 planner；
- [ ] filters/menu 可预测导航；
- [ ] 返回保持 scroll 和 selection；
- [ ] 小屏安全区；
- [ ] 横屏；
- [ ] 键盘弹出和 FocusState；
- [ ] 分享、PDF、购物清单；
- [ ] 小屏 Dynamic Type；
- [ ] VoiceOver rotor 顺序；
- [ ] 深链接冷启动。

出口标准：

- 所有核心 iPad 功能在 iPhone 可达；
- 没有隐藏 swipe-only 操作；
- 小屏和最大文字不丢失安全信息。

### Phase 7 — macOS 原生适配（3–5 周）

目标：交付真正的 Mac App，而不是放大的 iPad App。

- [ ] Sidebar/Toolbar；
- [ ] resizable window 和 minimum size；
- [ ] Menu Commands；
- [ ] `Command-F` 搜索；
- [ ] `Command-Z` 撤销；
- [ ] `Command-P` 打印；
- [ ] `Command-S` 导出；
- [ ] mouse/trackpad/keyboard 完整操作；
- [ ] context menus；
- [ ] hover 仅增强；
- [ ] 文件保存位置选择；
- [ ] 多窗口策略；
- [ ] Universal Link；
- [ ] Mac VoiceOver；
- [ ] App Sandbox 权限最小化。

出口标准：

- 没有依赖触控的唯一操作；
- 常见 Mac 命令可通过菜单和快捷键发现；
- 窗口缩放不破坏主流程。

### Phase 8 — 质量、TestFlight 与 App Store（2–4 周）

- [ ] 全量 unit/UI tests；
- [ ] 真机 iPad QA；
- [ ] crash 和性能检查；
- [ ] Instruments：launch、memory、image、hang；
- [ ] Privacy manifest；
- [ ] App Privacy answers；
- [ ] 隐私政策和支持 URL；
- [ ] AI illustration 与健康免责声明；
- [ ] App Store icon/screenshots/metadata；
- [ ] Review Notes；
- [ ] TestFlight internal；
- [ ] TestFlight external；
- [ ] 无账号主流程；
- [ ] 若加入账号，App 内删除账号；
- [ ] Archive/Validate；
- [ ] 回滚和紧急修复流程。

出口标准：

- 无 P0/P1 已知缺陷；
- 所有必测设备通过；
- App Review 材料与实际功能一致；
- 不把未完成服务描述为已上线。

---

## 8. 验证矩阵

### 8.1 单元测试

- [ ] 700 recipes decode；
- [ ] published-only；
- [ ] allergen contains/derived/may contain/unknown；
- [ ] diet tags；
- [ ] include/exclude ingredients；
- [ ] methods/equipment/time/spice/child-friendly；
- [ ] role templates 1–10 dishes；
- [ ] family/plated/buffet；
- [ ] budget boundaries；
- [ ] equipment collisions；
- [ ] deterministic tie-break；
- [ ] partial result；
- [ ] substitution revalidation；
- [ ] scaling strategy；
- [ ] shopping aggregation；
- [ ] route mapping；
- [ ] URL/native state round-trip；
- [ ] catalogue version migration。

### 8.2 iPad UI 测试

- [ ] 最小支持 iPad；
- [ ] 11-inch class；
- [ ] 13-inch class；
- [ ] portrait；
- [ ] landscape；
- [ ] 1/2 Split View；
- [ ] 1/3 Split View；
- [ ] Stage Manager 连续缩放；
- [ ] hardware keyboard；
- [ ] pointer；
- [ ] VoiceOver；
- [ ] 最大 Dynamic Type；
- [ ] Reduce Motion；
- [ ] light/dark；
- [ ] airplane mode；
- [ ] low storage/cache eviction；
- [ ] cold deep-link launch；
- [ ] background/foreground restore。

### 8.3 性能目标

这些是验收目标，不是当前已证明结果：

- [ ] 代表性当前 iPad 冷启动到可操作默认菜单不超过 2 秒；
- [ ] 普通筛选反馈 P95 不超过 100ms；
- [ ] 700 道目录重组 P95 不超过 500ms；
- [ ] 主列表滚动稳定，无明显掉帧；
- [ ] 图片解码不阻塞主线程；
- [ ] 内存告警后可以释放非关键图片缓存；
- [ ] 安装包不因媒体库膨胀到不可接受大小。

### 8.4 CLI 验证模板

完整 Xcode 安装后，先发现真实 scheme 和 destination，不盲猜设备名称：

```bash
xcodebuild -version
xcrun simctl list devices available
xcodebuild -project apple/OneTable.xcodeproj -list
xcodebuild -project apple/OneTable.xcodeproj -scheme OneTable -showdestinations
swift test --package-path apple/Packages/OneTableCore
```

再使用 `-showdestinations` 返回的真实 destination 执行：

```bash
xcodebuild \
  -project apple/OneTable.xcodeproj \
  -scheme OneTable \
  -destination '<selected iPad Simulator destination>' \
  build

xcodebuild \
  -project apple/OneTable.xcodeproj \
  -scheme OneTable \
  -destination '<selected iPad Simulator destination>' \
  test
```

---

## 9. Codex 每个任务的执行规则

每一个迁移任务必须包含：

1. 当前目标和不改范围；
2. 相关 TypeScript 源文件；
3. Swift 目标模块；
4. 必须保持的业务不变量；
5. 新增或更新的测试；
6. 实际运行的命令；
7. Simulator/真机验证证据；
8. Git diff 范围；
9. 剩余风险。

每一个任务禁止：

- 为赶进度绕过 hard rules；
- 用 UI snapshot 代替 domain parity test；
- 把 TODO 或 dispatch 当作完成；
- 静默改动 canonical recipe source；
- 修改用户未提交的租户文件；
- 将 secrets 写进代码或 `.xcconfig`；
- 因 SwiftUI 重写而删除现有 Web 能力；
- 在未真机验证时声称 iPad 体验完成。

---

## 10. 风险与控制

| 风险                             | 影响                          | 控制                                                   |
| -------------------------------- | ----------------------------- | ------------------------------------------------------ |
| TypeScript 与 Swift planner 漂移 | 菜单不一致或安全缺陷          | 黄金 fixtures、双实现 parity、规则版本                 |
| 700 张图片导致安装包过大         | 下载/审核/存储体验差          | 只内置 seed 和少量 hero，媒体按需缓存                  |
| iPad 固定尺寸设计                | Split View/Stage Manager 崩坏 | size class + 可用宽度，不按设备名判断                  |
| 完整后端尚未落地                 | Native 承诺超出现状           | v1 匿名本地优先，在线能力逐项 gated                    |
| iCloud 重复文件                  | Xcode/Next 构建冲突           | 本地非 iCloud checkout，DerivedData 保持默认本地位置   |
| SwiftUI 大 View                  | 难测试、重绘和维护            | Feature 分层、observable state、拆分小 View            |
| 深链接协议变化                   | Web/native 分享断裂           | versioned codec、向后兼容 fixtures                     |
| AI 越权                          | 食品安全和可信度风险          | allow-list、服务端复核、确定性 fallback                |
| 白标重复 App                     | App Review 风险               | 优先一个可配置产品或 Apple Custom Apps，不批量克隆提交 |
| Mac 只是放大 iPad                | 桌面体验差                    | 独立 Mac acceptance、菜单/窗口/快捷键                  |

---

## 11. 里程碑与时间

| 里程碑              | 预计累计时间 | 交付物                          |
| ------------------- | -----------: | ------------------------------- |
| M0 工具链可用       |      第 1 周 | Xcode/Simulator/CLI build loop  |
| M1 Core 数据解码    |    第 2–3 周 | Swift models、seed、fixtures    |
| M2 Planner parity   |    第 5–8 周 | 纯 Swift planner + parity tests |
| M3 iPad Alpha       |   第 9–12 周 | iPad 核心工作台                 |
| M4 iPad TestFlight  |  第 12–16 周 | 离线、分享、缓存、真机 QA       |
| M5 iPhone Universal |  第 15–19 周 | iPhone 适配                     |
| M6 Native macOS     |  第 18–24 周 | Mac 原生体验                    |
| M7 App Store Ready  |  第 22–28 周 | 全平台质量与上架材料            |

实际工期取决于 planner parity、真机 UI 迭代和后端范围。若 v1 同时加入完整账号、宾客响应、云同步和后台导出，应另行估算，不应塞入上述计划。

---

## 12. Definition of Done

SwiftUI 原生化只有同时满足以下条件才算完成：

- [ ] iPad 主流程完全原生，不依赖 WebView；
- [ ] 700 道菜谱从 canonical 管线生成并可离线加载；
- [ ] 硬规则与 TypeScript 基线通过 parity tests；
- [ ] 同一输入得到稳定可复现的菜单；
- [ ] 过敏原 unknown 不被当作安全；
- [ ] iPad portrait/landscape/Split View/Stage Manager 全部可用；
- [ ] iPhone 核心能力完整可达；
- [ ] Mac 具备窗口、菜单、快捷键和指针体验；
- [ ] Web/native 分享状态可互操作；
- [ ] 无网络时核心规划、菜谱文字和购物清单可用；
- [ ] 图片采用按需缓存，安装包不包含全部媒体库；
- [ ] VoiceOver、Dynamic Type、Reduce Motion 和深色模式通过；
- [ ] unit、UI、build、真机和 TestFlight 验证有实际证据；
- [ ] App Store 描述不夸大未实现功能；
- [ ] Web/PWA 在迁移期间没有被破坏；
- [ ] 没有覆盖用户未提交工作或泄露 secrets。

---

## 13. 下一步唯一入口

在开始写 SwiftUI 代码前，按顺序完成：

1. 安装并启用完整 Xcode；
2. 将 Git 工作 checkout 迁出 iCloud；
3. 在新 checkout 重新验证 Web 基线；
4. 由 Codex 创建 `apple/` SwiftUI 多平台骨架；
5. 先完成数据契约和 planner parity，不先堆 UI；
6. planner 通过后进入 iPad 工作台实现。

第一份执行任务应限定为：**Phase 0 + Phase 1，只创建可构建、可测试的 SwiftUI 多平台骨架，不迁移业务功能。**
