# Inferred

> 真相从不明说，只能被推断。
> The truth is never stated. It is inferred.

**Inferred** 是一个原创互动悬疑推理案卷站。用户阅读案卷、查看证词、标记物证、写下推理，然后揭晓真相并复盘伏笔。

核心体验路径：

```
阅读案卷 → 查看证词 → 标记线索 → 写下推理 → 揭晓真相 → 复盘伏笔
```

技术栈：**Astro + MDX + Cloudflare Workers**（内容型站点，`@astrojs/cloudflare` 适配器，SSR 模式）。

---

## 更新日志

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
  - 5 篇新线索（digital-age-fair-clues、recorded-alibi-tricks 等）

- 总计：34 篇案卷 + 40 篇线索


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

全站现共 **34 篇案卷 + 37 篇线索**（均已提交 GitHub `main` 分支）。

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

---

## 功能一览

- 📄 案卷详情页（正式档案排版，而非普通博客）
- 🗂️ 档案馆：按状态 / 难度 / 类型 / 场景客户端筛选
- 🔖 互动物证板：点击物证循环标记为 重要 / 可疑 / 误导 / 排除（存 `localStorage`）
- ✍️ 侦探笔记：自动保存到 `localStorage`，刷新不丢
- 🔒 折叠揭晓：基于原生 `<details>`，键盘可操作、无 JS 也能展开；不持久化展开状态以保留仪式感
- 📈 阅读进度条
- 🌗 亮色 / 暗色模式切换
- 🔍 基础 SEO（title / description / canonical / Open Graph）+ 自动 sitemap
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

> 现有案卷编号已用到 `034`，新案件请从 `035` 起编。新增后运行 `pnpm og:export` 生成分享图并 commit 到 `public/og/`。

```mdx
---
title: "案件标题"
caseId: "035"
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
<EvidenceList caseId="035" items={evidence} />
## 五、推理问题
<DeductionQuestions />
## 六、你的推理
<DetectiveNotes caseId="035" />
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
order: 38          # 当前最大为 37
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

### 2026-06-20 — 分享机制体验优化

**背景**：微信朋友圈和小红书分享存在明显摩擦：
- 朋友圈经常只显示链接，不显示图片
- 小红书需要手动下载海报，步骤较多

**本次优化**：
- 新增「复制图文」按钮，支持一键复制标题 + 链接 + 海报图链接
- 优化小红书分享流程（文案 + 海报同步提供）
- 改进微信/朋友圈分享提示文案
- 持续优化 `og:image` 质量

目标：降低用户分享到微信和小红书的摩擦，提升传播效率。


**具体改动**：
- `ShareBar.astro` 新增「复制图文」按钮
- 点击后可一键复制：标题 + 摘要 + 链接 + 海报图链接（适配小红书笔记）
- 优化了微信/朋友圈的分享提示文案


**文案优化**：
- 「小红书」按钮改为「去小红书」，更明确行动指引
- 优化了海报 modal 的提示文案（更简洁直接）
- 微信/朋友圈按钮文案微调

