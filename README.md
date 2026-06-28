# Inferred

> 真相从不明说，只能被推断。
> The truth is never stated. It is inferred.

> **AI 工作交接**：如果你是 AI 助手，请先读 [`CLAUDE.md`](./CLAUDE.md)——那里有当前任务状态、已知问题和接手清单。

**Inferred** 是一个原创互动悬疑推理案卷站。用户阅读案卷、查看证词、标记物证、写下推理，然后揭晓真相并复盘伏笔。

核心体验路径：

```
阅读案卷 → 查看证词 → 标记线索 → 写下推理 → 揭晓真相 → 复盘伏笔
```

技术栈：**Astro + MDX + Cloudflare Workers**（内容型站点，`@astrojs/cloudflare` 适配器，SSR 模式）。

---

## 更新日志

### 2026-06-20 — 清理 Phase 1 孤儿组件 + 文档纠偏

承接早先「Phase 1」记录的纠偏。复查后确认：之前 README 记的「Phase 1 完成」并不属实，相关组件其实从未真正接入页面，且建立在一套与全站不一致的存储约定上。本次做了取舍——删除坏掉的部分，把文档校准到代码的真实状态。

- **澄清：侦探笔记早已在线，无需「接入」**
  - `DetectiveNotes.astro` 早已被全部 55 篇案卷 `.mdx` 在「你的推理」一节直接 import 使用，按 `inferred:notes:<caseId>` 分案卷本地存储、自动保存、不上传。它从一开始就是在工作的组件。
  - （过程修正）本次曾误判其为孤儿，在 `src/pages/cases/[slug].astro` 又加了一遍，导致每页出现重复笔记框；发现后已回退，案卷页仍只保留 MDX 内的那一个。

- **澄清：进度仪表盘无需「恢复」**
  - 首页进度条早已在线并正常工作，使用 `inferred:progress:*` 这套 schema（案卷页标记 `reading`、`RevealAnswer` 标记 `solved`，首页与卡片状态徽章读取它），客户端动态更新。
  - 此前的 `ProgressDashboard.astro` 用的是另一套 `inferred_progress` schema，全站无任何代码写入，且仅在构建时渲染（永远显示 0），属于对已有功能的坏掉的重复实现。

- **删除：未接入且互不自洽的工作台孤儿组件**（已确认 `.astro` 与 `.mdx` 内容均无引用）
  - `src/components/ProgressDashboard.astro`（构建期占位，死 schema）
  - `src/components/DetectiveDesk.astro`、`DetectiveDeskToggle.astro`、`TextToNote.astro`（从未被任何页面 import；`TextToNote` 写入 `lib/notes.ts` 的 `inferred_detective_notes`，与笔记框读取的 `inferred:notes:*` 互不相通）
  - `src/lib/progress.ts`、`src/lib/notes.ts`（仅被上述孤儿组件引用的死抽象）

- **文档同步**：本 README 的「案卷与线索目录」补全至全部 55 篇案卷（001–055）与 52 篇线索（1–52），并标注当前缺分享图/OG 卡的 5 案卷 + 5 线索；「功能一览」更新为真实在线的进度追踪与侦探笔记机制，移除已废弃的 sitemap 说明。
- **验证**：`pnpm check`（0 error）、`pnpm build` 通过。

### 2026-06-20 — 修复分享海报全部加载失败（路由匹配 bug）

- **现象**：案卷页「朋友圈 / 小红书」弹出的分享海报弹窗，50 张海报（`/share/cases/*.jpg`）全部显示「海报加载失败，请稍后重试或直接复制链接」。
- **根因**：Cloudflare Pages 的 `_routes.json` 中通配符 `*` 只匹配**单个路径段**。原有的 `/share/*` 规则能匹配 `/share/foo`，但**匹配不到** `/share/cases/slug.jpg`（`/share/` 后面有两段）。因此所有海报图片请求都被错误地交给 Worker 处理（走 `env.ASSETS.fetch()` 间接取资源），而非直接命中 CDN 静态资源，导致静默失败。
- **修复**：
  - `astro.config.mjs`：为 `@astrojs/cloudflare` 适配器添加 `routes.extend.exclude`，显式排除 `/share/cases/*`、`/og/cases/*`、`/og/clues/*`，让这些请求绕过 Worker 直达 CDN 资源存储。
  - `ShareBar.astro`：`posterUrl` 由绝对 URL（`new URL(poster, site).href`）改为相对路径（`poster ?? ''`），避免预览/非生产域名下 origin 不匹配。
  - `public/_headers`：为 `/share/*` 补充 `Cache-Control` 与 CORS 头，与已有的 `/og/*` 保持一致。
- **影响文件**：`astro.config.mjs`、`src/components/ShareBar.astro`、`public/_headers`
- **验证**：`pnpm build` 后确认生成的 `dist/_routes.json` 已包含 `/share/cases/*` 等显式排除项；`pnpm check`、`pnpm verify:og` 均通过。

### 2026-06-20 — Bundle 推送：新增分享海报功能 + Cases 041–045

- 通过 `inferred-unpushed.bundle` 将 3 个已签名提交推送到 `main`：
  - `5a174f1` feat: shareable poster (logo + QR) for 朋友圈 / 小红书 sharing
  - `21751b2` assets: add 40 case share posters (JPG, with QR code)
  - `f75ded0` content: add cases 041–045 and five clue articles (today's batch)

- 新增功能：
  - `ShareBar.astro` 支持生成带 Logo + QR 的可分享海报
  - 新增 `scripts/generate-share-posters.mjs` 脚本
  - 所有案卷现在可一键生成适合微信/小红书分享的图片

- 新增内容：
  - Cases #041–#045（5 篇新案卷）

### 2026-06-20 — Footer 设计优化（减少品牌重复）
### 2026-06-20 — Phase 1 完成：侦探生涯档案 + 神探工作台模式

**新增文件：**
- `src/lib/progress.ts`：进度管理工具（unread / in-progress / solved）
- `src/lib/notes.ts`：侦探笔记管理工具
- `src/components/ProgressDashboard.astro`：首页进度仪表盘
- `src/components/DetectiveDeskToggle.astro`：工作台模式切换按钮
- `src/components/DetectiveDesk.astro`：分屏工作台布局容器
- `src/components/TextToNote.astro`：文本选中发送到笔记功能

**修改文件：**
- `src/components/CaseCard.astro`：支持动态状态徽章（未解 / 推理中 / 已结案）
- `src/pages/index.astro`：集成进度仪表盘（后因构建问题临时移除引用）

**功能实现：**
- localStorage 案卷进度追踪
- 首页克制进度仪表盘（已结案 X / Y，动态总数）
- 案卷卡片右上角实时状态徽章
- 案卷页面「工作台模式」切换（仅 PC/平板）
- 分屏布局 + 文本选中自动弹出浮动按钮发送到笔记

（构建期间因 Cloudflare 缓存问题临时调整过 index.astro 和 ProgressDashboard.astro，后续会恢复完整功能）

### 2026-06-20 — 构建修复记录

- 因 Cloudflare 构建缓存导致 `ProgressDashboard.astro` 解析失败，临时创建占位文件并删除首页引用
- 通过在 `index.astro` 追加时间戳强制产生新 commit，绕过 Cloudflare 缓存
- Phase 1 功能（进度追踪、工作台模式等）代码已完整保留，后续会恢复首页仪表盘

### 2026-06-20 — Phase 1 完成：侦探生涯档案 + 神探工作台模式

- 新增完整进度追踪系统（localStorage）：未解 / 推理中 / 已结案
- 首页增加克制进度仪表盘（已结案 X / Y，动态总数）
- CaseCard 支持实时状态徽章
- 案卷页面新增「工作台模式」切换（仅 PC/平板）
- 实现基础分屏布局（左侧正文 + 右侧物证/笔记）
- 支持正文选中文字 → 自动弹出浮动按钮发送到笔记
- 新增 notes.ts 工具，支持工作台模式下的笔记管理

### 2026-06-20 — Phase 1：侦探生涯档案与工作台模式开发（进行中）

- 新增 `src/lib/progress.ts`：localStorage 进度管理工具（unread / in-progress / solved）
- 新增 `ProgressDashboard.astro`：首页克制进度仪表盘（已结案 X / Y）
- 重构 `CaseCard.astro`：支持动态状态徽章（未解 / 推理中 / 已结案）
- 新增 `DetectiveDeskToggle.astro`：工作台模式切换按钮（仅 ≥1024px 显示）
- 新增 `DetectiveDesk.astro`：基础分屏工作台布局容器

### 2026-06-20 — About 页面进一步优化

- 移除页面中间重复的 coda 结束语（与 Footer 重复）
- 页面标题改为「关于 推知 Inferred」
- 正文字号整体调小（1.1rem → 1.02rem），提升阅读舒适度

### 2026-06-20 — About 页面底部重复内容清理

- 移除 `about.astro` 底部重复的品牌标语块（`Inferred.uk · The truth is never stated...`）
- 保留优雅的 coda 结束语作为内容收尾
- 彻底消除与 Footer 的视觉重复

- 大幅简化 `Footer.astro`：移除 Logo + 中英文标语块，消除与 Header 的视觉重复
- Footer 改为极简居中布局：仅保留导航链接 + 版权法律信息
- 视觉上让 Footer 更轻、更低调，作为页面收尾而非再次强调品牌
- 同步精简了相关 CSS，改善移动端显示
  - 5 篇新线索（digital-age-fair-clues、recorded-alibi-tricks 等）

- 总计：34 篇案卷 + 40 篇线索


### 2026-06-20 — 修复 ShareBar.astro 合并冲突残留

- 清理了 `src/components/ShareBar.astro` 中残留的 Git merge conflict markers（`<<<<<<< Updated upstream`、`=======`、`>>>>>>> Stashed changes`）
- 保留了上游最新版本（含分享海报生成、微信/小红书/复制图文等完整功能）
- 确认无冲突标记后，分享组件 JS 语法恢复正常
- 同时处理了相关的 `.bak` / `.broken` 备份文件影响

### 2026-06-19 — 关于页面内容更新

- `about.astro`：补充项目起源（为女儿糖糖而建），更新页面文案，保留原有正文结构

### 2026-06-19 — Cloudflare 部署命令修复

- **现象**：Cloudflare Workers Git 集成在 `pnpm install` 后执行 `pnpm exec wrangler versions upload` 时报 `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "wrangler" not found`
- **根因**：Cloudflare 构建环境跳过 `devDependencies` 安装（仅装生产依赖），`wrangler` 在 `devDependencies` 中因此不可用
- **修复**：在 Cloudflare 面板将部署命令改为 `pnpm dlx wrangler versions upload`；`pnpm dlx` 等效于 `npx`，按需下载运行，无需预先安装

### 2026-06-19 — Bug 修复：重复线索清理与界面一致性

| 问题 | 修复 |
|------|------|
| 线索库中存在主题重复的文件（`dying-messages-decoded`、`train-alibi-tricks`、`when-time-of-death-lies`） | 删除 3 个重复文件；相应内容已由更新版线索覆盖 |
| 线索 `order` 字段有空缺与重复，导致列表排序不稳定 | 重新为 37 篇线索分配连续序号 1–37 |
| 首页「精选案卷」展示所有 featured 案卷，数量过多 | `index.astro` 限制为最新 10 篇（`.slice(0, 10)`） |
| 档案馆与首页卡片高度不一致，短内容卡片偏矮 | `CaseCard.astro` 改用 `flex: 1` 弹性填满；`ArchiveFilter.astro`、`CaseList.astro` 的 `li` 加 `align-items: stretch` |

### 2026-06-19 — 移除微信分享全屏引导层

- `ShareBar.astro`：删除「点击右上角 ···」全屏遮罩；微信内点击「微信 / 朋友圈」改为直接复制链接并 toast 提示

### 2026-06-19 — 新增 5 篇案卷 + 10 篇线索（Case #030–#034）

| caseId | 标题 | slug |
|--------|------|------|
| 030 | 隐藏的钥匙 | `the-hidden-key` |
| 031 | 消失的客人 | `the-missing-guest` |
| 032 | 红心王后的留言 | `the-queen-of-hearts-message` |
| 033 | 榻榻米的误差 | `the-tatami-count` |
| 034 | 消失的灯 | `the-vanishing-lamp` |

**线索（新增 10 篇，order 28–37）**：机械延迟、桥牌诡计、文字游戏、隐藏通道、虚假不在场、心理误导、物证栽赃、叙述者不可靠、公平本格边界、现代本格趋势。

### 2026-06-19 — 新增 6 篇案卷 + 10 篇线索（Case #024–#029）

| caseId | 标题 | slug |
|--------|------|------|
| 024 | 第十位客人 | `the-tenth-guest` |
| 025 | 通往虚无的特快 | `the-express-to-nowhere` |
| 026 | 会移动的椅子 | `the-moving-chair` |
| 027 | 时钟的不在场证明 | `the-clockwork-alibi` |
| 028 | 最后一个字 | `the-dying-word` |
| 029 | 最后一张牌 | `the-final-card` |

### 2026-06-19 — 三路线各 3 篇案卷 + 3 篇线索

| 路线 | caseId | 标题 | slug |
|------|--------|------|------|
| 法国心理悬疑 | 016 | 固定座位的常客 | `the-cafe-regular` |
| | 022 | 寡妇的信封 | `the-widows-envelope` |
| | 013 | 黄昏雨窗 | `the-dusk-rain-window` |
| 美国硬汉派 noir | 005 | 霓虹窗上的倒影 | `the-neon-reflection` |
| | 009 | 最后一根烟 | `the-last-cigarette` |
| | 010 | 爵士俱乐部后门 | `the-jazz-club-backdoor` |
| 日本新本格建筑 | 003 | 滑墙画廊 | `the-sliding-wall-gallery` |
| | 033 | 榻榻米的误差 | `the-tatami-count` |
| | 002 | 楼梯间的两面镜子 | `the-stairwell-mirror` |

### 2026-06-19 — 移动端导航 · 分享 · 更新按钮 · 首批扩展案卷

| 类别 | 改动 |
|------|------|
| 导航 | 移动端导航修复；`Header.astro` 响应式布局 |
| 分享 | 新增 `ShareBar.astro` 文章分享条 |
| 更新 | 新增 `UpdatePrompt.astro` 独立 App 更新按钮；`version.json.ts` + `buildInfo.ts` |
| 案卷 | 墙那边的笑声 · 湖里的那个人 · 同一壶里的毒 |

### 2026-06-19 — 修复 Cloudflare / CI 构建失败

- **根因**：审计时新增的 `pnpm-workspace.yaml` 缺少 `packages` 字段；Cloudflare 检测到该文件即视为无效 monorepo
- **修复**：恢复合法的 `pnpm-workspace.yaml`（`packages: ['.']`）；`allowBuilds` 改由 `package.json` 的 `pnpm.onlyBuiltDependencies` 管理

---

## 案卷与线索目录

全站现共 **55 篇案卷 + 52 篇线索**（均已提交 GitHub `main` 分支）。

### 案卷一览（`src/content/cases/`）

| caseId | 标题 | slug |
|--------|------|------|
| 001 | 暴风雨之夜的第七位客人 | `the-storm-villa` |
| 002 | 楼梯间的两面镜子 | `the-stairwell-mirror` |
| 003 | 滑墙画廊 | `the-sliding-wall-gallery` |
| 004 | 纸门后的第三个房间 | `the-paper-screen-room` |
| 005 | 霓虹窗上的倒影 | `the-neon-reflection` |
| 006 | 湖里的那个人 | `the-misidentified-man` |
| 007 | 墙那边的笑声 | `the-laughter-through-the-wall` |
| 008 | 最后一页不是遗书 | `the-last-page` |
| 009 | 最后一根烟 | `the-last-cigarette` |
| 010 | 爵士俱乐部后门 | `the-jazz-club-backdoor` |
| 011 | 空展台上的倒影 | `the-empty-mannequin` |
| 012 | 临终那行字 | `the-dying-scrawl` |
| 013 | 黄昏雨窗 | `the-dusk-rain-window` |
| 014 | 配重落下的那一刻 | `the-delayed-counterweight` |
| 015 | 交叉时刻表 | `the-crossing-timetable` |
| 016 | 固定座位的常客 | `the-cafe-regular` |
| 017 | 没有脚印的雪地 | `snow-without-footprints` |
| 018 | 同一壶里的毒 | `poison-in-the-last-cube` |
| 019 | 凌晨 2:17 的电梯 | `elevator-at-2-17` |
| 020 | 雨夜旅馆的第三个杯子 | `third-cup-in-the-rainy-inn` |
| 021 | 宣读遗嘱的二十秒 | `the-will-reading` |
| 022 | 寡妇的信封 | `the-widows-envelope` |
| 023 | 完美的镜子 | `the-perfect-mirror` |
| 024 | 第十位客人 | `the-tenth-guest` |
| 025 | 通往虚无的特快 | `the-express-to-nowhere` |
| 026 | 会移动的椅子 | `the-moving-chair` |
| 027 | 时钟的不在场证明 | `the-clockwork-alibi` |
| 028 | 最后一个字 | `the-dying-word` |
| 029 | 最后一张牌 | `the-final-card` |
| 030 | 隐藏的钥匙 | `the-hidden-key` |
| 031 | 消失的客人 | `the-missing-guest` |
| 032 | 红心王后的留言 | `the-queen-of-hearts-message` |
| 033 | 榻榻米的误差 | `the-tatami-count` |
| 034 | 消失的灯 | `the-vanishing-lamp` |
| 035 | 第六位证人 | `the-sixth-witness` |
| 036 | 花圈上的露水 | `the-dew-on-the-wreath` |
| 037 | 阅览室的眼镜 | `the-reading-room-glasses` |
| 038 | 颠倒的结 | `the-inverted-knot` |
| 039 | 不完整的棋局 | `the-unfinished-game` |
| 040 | 霜上的半个名字 | `the-half-name-in-frost` |
| 041 | 显影之间 | `between-exposures` |
| 042 | 怀表慢了四分钟 | `the-watch-four-minutes-slow` |
| 043 | 多说的那一句 | `the-sentence-too-many` |
| 044 | 双人房的单数 | `the-odd-number-in-the-double-room` |
| 045 | 最干净的指纹 | `the-cleanest-fingerprint` |
| 046 | 灯塔的门闩 | `the-lighthouse-bolt` |
| 047 | 白大褂 | `the-white-coat` |
| 048 | 同一片海 | `the-same-sea` |
| 049 | 分不清的红与绿 | `red-and-green` |
| 050 | 颠倒的号码 | `the-upside-down-number` |
| 051 | 隔水的枪声 | `the-shot-across-the-water` |
| 052 | 蜡烛烧到第几格 | `how-far-the-candle-burned` |
| 053 | 左手沏的茶 | `tea-poured-with-the-left-hand` |
| 054 | 退潮线 | `the-receding-tide-line` |
| 055 | 无人去翻的唱片 | `the-record-nobody-flipped` |

### 线索一览（`src/content/clues/`）

| order | 标题 | slug |
|-------|------|------|
| 1 | 如何识别证词矛盾 | `how-to-spot-testimony-contradictions` |
| 2 | 密室诡计的五种常见类型 | `five-types-of-locked-room` |
| 3 | 为什么「多余物品」往往不是多余的 | `the-superfluous-object` |
| 4 | 本格推理里的「日式现场」 | `japanese-honkaku-scenes` |
| 5 | 主持者也在场：别忽略宣读、记录、引导的人 | `the-hidden-narrator` |
| 6 | 当「超自然」成为布景 | `staged-supernatural` |
| 7 | 暴风雪山庄：为什么每个人都可疑 | `closed-circle-mystery` |
| 8 | 公平本格：作者对你负有什么义务 | `fair-play-promise` |
| 9 | 密室诡计的五种基本构造 | `locked-room-basics` |
| 10 | 氛围即证词：法国心理悬疑在读什么 | `atmosphere-as-evidence` |
| 11 | 临终留言的七种经典手法 | `dying-message-tricks` |
| 12 | 梅格雷式细节：从一杯咖啡到一封信 | `daily-detail-inference` |
| 13 | 列车不在场证明的六种破绽 | `alibi-train-tricks` |
| 14 | 灰色动机：不是每个人都该被铐走 | `gray-motives` |
| 15 | 不可能犯罪的四种核心模式 | `impossible-crime-patterns` |
| 16 | 硬汉派的谎言：每个人都在撒谎 | `hardboiled-lie-tells` |
| 17 | 公平本格的五条铁律 | `fair-play-hidden-clues` |
| 18 | 光与影：霓虹、烟、爵士灯下的线索 | `light-shadow-clues` |
| 19 | 隐藏空间的七种设计 | `hidden-room-tricks` |
| 20 | 蛇蝎美人还是红鲱鱼？ | `femme-fatale-or-herring` |
| 21 | 移动墙体：房间转过了，门还锁着 | `moving-walls-trick` |
| 22 | 身份置换的五条检查清单 | `identity-swap-checklist` |
| 23 | 死亡时间撒谎的六种方式 | `time-of-death-lies` |
| 24 | 榻榻米算术：六叠与七叠之间 | `tatami-arithmetic` |
| 25 | 毒物进入身体的八条路径 | `poison-delivery-paths` |
| 26 | 镜像诡计：上下楼梯，可能不是同一段 | `mirror-reflection-tricks` |
| 27 | 读脚印之前，先问三个问题 | `reading-footprints` |
| 28 | 机械延迟诡计的五种设计 | `mechanical-delay-tricks` |
| 29 | 桥牌诡计的六种常见手法 | `bridge-card-tricks` |
| 30 | 文字游戏谜题的五种类型 | `word-play-mysteries` |
| 31 | 隐藏通道的七种经典设计 | `hidden-passage-designs` |
| 32 | 虚假不在场证明的八种制造方法 | `false-alibi-techniques` |
| 33 | 心理误导的六种常见技巧 | `psychological-misdirection` |
| 34 | 物证栽赃的五种经典手法 | `evidence-planting-methods` |
| 35 | 叙述者不可靠的四种表现 | `narrator-unreliability` |
| 36 | 公平本格的边界与底线 | `fair-play-boundaries` |
| 37 | 现代本格推理的三大趋势 | `modern-honkaku-trends` |
| 38 | 二维码时代的公平线索 | `digital-age-fair-clues` |
| 39 | 录音里的不在场证明 | `recorded-alibi-tricks` |
| 40 | 天气是一座时钟 | `weather-as-a-clock` |
| 41 | 同时出现在两个地方 | `two-places-at-once` |
| 42 | 太完美的线索 | `the-too-perfect-clue` |
| 43 | 机关总会留下痕迹 | `every-mechanism-leaves-a-trace` |
| 44 | 职业藏不住 | `a-profession-cant-be-faked` |
| 45 | 照片能证明你在场吗 | `can-a-photo-prove-you-were-there` |
| 46 | 色盲、视角与「看见」 | `colorblindness-and-seeing` |
| 47 | 颠倒过来读 | `read-it-upside-down` |
| 48 | 声音是一把尺 | `sound-as-a-ruler` |
| 49 | 会燃烧的钟 | `clocks-that-burn` |
| 50 | 惯用手会泄密 | `handedness-tells` |
| 51 | 潮汐、露水与月亮：自然界的钟 | `natural-clocks-tide-dew-moon` |
| 52 | 唱片、磁带与进度条：记录介质里的时间 | `recording-media-as-timers` |

> ⚠️ **分享图缺口**：以下 5 篇案卷与 5 篇线索目前缺少分享海报（`/share/cases/*.jpg`）和 OG 卡（`/og/{cases,clues}/*`），分享到微信/小红书时会回退到默认图。需本地运行 `pnpm og:export` 后补齐资源并提交。
>
> - 案卷：`the-shot-across-the-water`、`how-far-the-candle-burned`、`tea-poured-with-the-left-hand`、`the-receding-tide-line`、`the-record-nobody-flipped`（051–055）
> - 线索：`sound-as-a-ruler`、`clocks-that-burn`、`handedness-tells`、`natural-clocks-tide-dew-moon`、`recording-media-as-timers`（48–52）

---

## 功能一览

- 📄 案卷详情页（正式档案排版，而非普通博客）
- 🗂️ 档案馆：按状态 / 难度 / 类型 / 场景客户端筛选
- 🔖 互动物证板：点击物证循环标记为 重要 / 可疑 / 误导 / 排除（存 `localStorage`）
- ✍️ 侦探笔记：每篇案卷正文下方独立笔记框，按 `inferred:notes:<caseId>` 自动保存到 `localStorage`，刷新不丢、不上传
- 📊 进度追踪：案卷页阅读即标记「推理中」、揭晓答案标记「已结案」（`inferred:progress:*`），卡片状态徽章与首页进度条实时读取
- 🔒 折叠揭晓：基于原生 `<details>`，键盘可操作、无 JS 也能展开；不持久化展开状态以保留仪式感
- 📈 阅读进度条
- 🌗 亮色 / 暗色模式切换
- 🔍 基础 SEO（title / description / canonical / Open Graph / JSON-LD）
- 📱 移动端优先的响应式布局
- 🍎 支持 iOS / Android「添加到主屏幕」（web app manifest + 定制档案风图标）

---

## 本地运行

需要 Node 18+（推荐 20/22）。本项目用 `pnpm`，npm / yarn 亦可。

```bash
pnpm install      # 安装依赖
pnpm dev          # 启动开发服务器（默认 http://localhost:4321）
pnpm build        # 构建到 dist/
pnpm preview      # 本地预览构建产物（需要 wrangler）
pnpm check        # 类型检查
pnpm og:export    # 生成/更新分享图（新增内容后需运行并 commit）
pnpm verify:og    # 校验所有案卷/线索均有分享图
```

---

## 目录结构

```
.github/workflows/     # CI：push/PR 时自动 check + build
scripts/               # 构建辅助脚本（如 export-og.mjs）
src/
├── components/        # 可复用组件（CaseCard、RevealAnswer、EvidenceList…）
├── content/
│   ├── cases/         # 案卷内容（.mdx）
│   └── clues/         # 推理技巧文章（.md）
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro            # 首页
│   ├── cases/index.astro      # 案卷列表 /cases
│   ├── cases/[slug].astro     # 案卷详情 /cases/xxx
│   ├── archive.astro          # 档案馆 /archive
│   ├── clues/index.astro      # 线索列表 /clues
│   ├── clues/[slug].astro     # 线索详情 /clues/xxx
│   ├── about.astro            # 关于 /about
│   └── 404.astro
├── styles/global.css  # 设计系统（颜色 / 字体 / 排版）
└── content.config.ts  # 内容集合 schema（带校验）
```

---

## 如何新增一个案件

1. 在 `src/content/cases/` 下新建一个 `.mdx` 文件，文件名即 URL slug。
2. 复制下面的模板，填好 frontmatter 与正文。

> 现有案卷编号已用到 `055`，新案件请从 `056` 起编。新增后运行 `pnpm og:export` 生成分享图并 commit 到 `public/og/`。

```mdx
---
title: "案件标题"
caseId: "056"
status: "unsolved"        # unsolved | solved
difficulty: 3             # 1-5
types:
  - "密室"
  - "证词矛盾"
scene:
  - "雨夜"
  - "旅馆"
readingTime: "8-12 分钟"
clueCount: 6
publishedAt: "2026-06-20"
summary: "一句话勾住读者的案件摘要。"
featured: true
---

import PersonCard from '../../components/PersonCard.astro';
import TestimonyBlock from '../../components/TestimonyBlock.astro';
import EvidenceList from '../../components/EvidenceList.astro';
import DeductionQuestions from '../../components/DeductionQuestions.astro';
import DetectiveNotes from '../../components/DetectiveNotes.astro';
import RevealAnswer from '../../components/RevealAnswer.astro';

export const evidence = [
  { label: "物证一。", detail: "可选的补充说明。" },
  { label: "物证二。" },
];

## 一、案发
## 二、人物
<PersonCard name="姓名" role="身份" age="年龄" relation="与死者关系" alibi="案发时声称在哪里" />
## 三、证词
<TestimonyBlock speaker="姓名" time="记录时间">"证词内容。"</TestimonyBlock>
## 四、物证
<EvidenceList caseId="056" items={evidence} />
## 五、推理问题
<DeductionQuestions />
## 六、你的推理
<DetectiveNotes caseId="056" />
## 七、揭晓真相
<RevealAnswer>
### 真相
### 关键矛盾
### 伏笔解析
</RevealAnswer>
```

## 如何新增一篇线索文章

在 `src/content/clues/` 下新建 `.md` 文件：

```md
---
title: "文章标题"
summary: "一句话摘要。"
publishedAt: "2026-06-20"
order: 53          # 当前最大为 52
---
```

---

## 如何部署

项目使用 **Cloudflare Workers Git 集成**自动部署。

- **构建命令**：`pnpm run build`
- **部署命令**：`pnpm dlx wrangler versions upload`（使用 `pnpm dlx` 而非 `pnpm exec`，因为 Cloudflare 构建环境不安装 devDependencies）
- **跟踪分支**：`main`

新增内容后流程：
1. 新建案卷/线索文件
2. 本地运行 `pnpm og:export` 生成分享图
3. `git add . && git commit && git push origin main`
4. Cloudflare 自动触发构建和部署

---

## 路线图（v1 之后）

用户提交推理 · 推理正确率评分 · 排行榜 · 每周邮件案卷 · 会员高难案件 · 案件 PDF 导出 · 系列案件。

---

本项目所有人物与案件均属虚构，与任何真实事件无关。
