# CLAUDE.md — Inferred 项目 AI 工作交接文档

本文件是给下一个 AI 助手（Claude Code 或其他）的工作交接文档。
Claude Code 启动时会自动读取它，其他 AI 请在开始工作前先完整阅读。

---

## 项目身份

- **名称**：推知 Inferred（`inferred.uk`）
- **GitHub**：`https://github.com/sheephess9527/quiz-app`（仓库名 quiz-app，远程已改名为 inferred.uk）
- **线上地址**：`https://inferred.uk`
- **技术栈**：Astro 5 + MDX + Cloudflare Workers（`@astrojs/cloudflare` 适配器，SSR 模式）
- **包管理**：pnpm（`pnpm install / pnpm dev / pnpm build / pnpm check`）

---

## 当前生产状态（截至 2026-06-28）

**已在线、正常工作**：
- 55 篇案卷（`src/content/cases/`，001–055，`.mdx`）
- 52 篇线索（`src/content/clues/`，order 1–52，`.md`）
- 侦探笔记（每篇案卷 MDX 内已直接 import `DetectiveNotes.astro`，localStorage 自动保存）
- 进度追踪（`inferred:progress:*`，案卷页标 reading，RevealAnswer 标 solved）
- 物证板（`EvidenceList.astro`，localStorage 标记 重要/可疑/误导/排除）
- 分享海报（`/share/cases/*.jpg`，50 张，PWA 分享用）
- OG 卡片（`/og/cases/*`、`/og/clues/*`）
- ShareBar（微信/小红书/复制链接）
- 亮/暗模式、阅读进度条、档案馆筛选

**已确认缺失（分享图）**：
- 案卷 051–055：`/share/cases/` 和 `/og/cases/` 无图
- 线索 48–52：`/og/clues/` 无图
- 修复方法：本地运行 `pnpm og:export` 后 commit `public/og/` 和 `public/share/`

**待完成（需外部执行）**：
- PWA 图标替换：4 个 PNG 需推送到 `main`，详见根目录 `hermes-icon-task.md`
  - 原因：本会话 git proxy（127.0.0.1）推送二进制文件时返回 503，已通过附件发给用户，等待 Hermes 完成

---

## Git 分支策略

| 分支 | 说明 |
|------|------|
| `main` | 生产分支，Cloudflare Workers 自动部署，直接 push |
| `claude/reset-rename-inferred-xmu4vs` | 当前 AI 工作分支（本 session 使用） |
| `origin/cloudflare/workers-autoconfig` | Cloudflare 自动生成，不要动 |

**注意**：本 session 存在 git push 限制（proxy 503 偶发），推送文字内容通常成功，推送二进制文件（PNG/JPG）基本失败。遇到此问题参考 `hermes-icon-task.md`。

---

## localStorage schema（全部客户端，无服务端存储）

| key 格式 | 写入位置 | 读取位置 | 说明 |
|---------|---------|---------|------|
| `inferred:progress:/cases/{slug}` | `cases/[slug].astro`（页面加载写 `reading`）；`RevealAnswer.astro`（揭晓写 `solved`） | `index.astro`（进度条）；`CaseCard.astro`（状态徽章） | 值：`reading` / `solved` |
| `inferred:notes:{caseId}` | `DetectiveNotes.astro` | `DetectiveNotes.astro` | 每篇案卷独立笔记，自动保存 |
| `inferred:evidence:{caseId}:{index}` | `EvidenceList.astro` | `EvidenceList.astro` | 物证标记状态 |

---

## 组件地图

```
src/components/
├── CaseCard.astro          # 案卷列表卡片，含状态徽章（读 localStorage progress）
├── CaseMeta.astro          # 案卷元数据条（难度、类型、阅读时间等）
├── DetectiveNotes.astro    # 侦探笔记框，localStorage 自动保存，每篇 MDX 直接 import
├── DeductionQuestions.astro # 推理问题引导区（静态）
├── EvidenceList.astro      # 物证板，支持 4 档循环标记，localStorage 持久化
├── RevealAnswer.astro      # 折叠揭晓区（<details>），揭晓时写 progress=solved
├── ShareBar.astro          # 分享条（微信/小红书/复制图文），含分享海报弹窗
├── ReadingProgress.astro   # 页面顶部阅读进度条
├── PersonCard.astro        # 人物卡片（姓名/身份/不在场证明）
├── TestimonyBlock.astro    # 证词块（说话人/时间/"内容"）
├── Tag.astro               # 标签徽章，支持 variant（scene/type）
├── DifficultyStars.astro   # 难度星级
├── ArchiveFilter.astro     # 档案馆客户端筛选（状态/难度/类型/场景）
├── CaseList.astro          # 档案馆卡片网格
├── Header.astro            # 顶部导航，含移动端汉堡菜单
├── Footer.astro            # 极简 Footer（仅导航链接 + 版权）
├── BrandMark.astro         # Logo 区（Header 内使用）
├── QuoteBlock.astro        # 引言块
├── NewsletterBox.astro     # 邮件订阅框（目前为占位）
└── UpdatePrompt.astro      # PWA 更新提示按钮
```

---

## 内容约定

### 新增案卷
- 文件放 `src/content/cases/{slug}.mdx`，slug 即 URL
- 当前最大编号：`055`，新案卷从 `056` 起编
- frontmatter 必填：`title`、`caseId`、`status`、`difficulty`、`types`、`scene`、`readingTime`、`clueCount`、`publishedAt`、`summary`、`featured`
- MDX 顶部固定 import 6 个组件（参见 README「如何新增案件」模板）
- `DetectiveNotes caseId` 必须与 frontmatter `caseId` 一致
- 新增后必须运行 `pnpm og:export` 生成 OG/分享图并 commit

### 新增线索
- 文件放 `src/content/clues/{slug}.md`
- 当前最大 order：`52`，新线索从 `53` 起
- frontmatter 必填：`title`、`summary`、`publishedAt`、`order`

---

## 部署流程

1. push 到 `main` → Cloudflare Workers Git 集成自动触发构建部署
2. **构建命令**：`pnpm run build`
3. **部署命令**：`pnpm dlx wrangler versions upload`（不能用 `pnpm exec wrangler`，Cloudflare 构建环境不装 devDeps）
4. 静态资源绕过 Worker：`/share/cases/*`、`/og/cases/*`、`/og/clues/*` 已在 `astro.config.mjs` 配置 `routes.extend.exclude`，直达 CDN

---

## 已删除、不要重建

以下文件曾存在，已确认是基于错误 schema 的孤儿实现，已删除：

| 文件 | 原因 |
|------|------|
| `src/components/ProgressDashboard.astro` | 使用 `inferred_progress`（下划线）schema，全站无代码写入，永远显示 0；首页进度条已由 `index.astro` 直接实现 |
| `src/components/DetectiveDesk.astro` | 分屏工作台，从未被任何页面 import |
| `src/components/DetectiveDeskToggle.astro` | 工作台切换按钮，孤儿 |
| `src/components/TextToNote.astro` | 写入 `inferred_detective_notes`，与笔记框读取的 `inferred:notes:*` 不通 |
| `src/lib/progress.ts` | 仅被上述孤儿组件引用 |
| `src/lib/notes.ts` | 仅被上述孤儿组件引用 |

---

## 已知坑

1. **`cases/[slug].astro` 不要再加 `DetectiveNotes`**：全部 55 篇 MDX 内已直接 import，再加会出现重复笔记框。
2. **分享海报路由**：`/share/cases/*.jpg` 需要在 `astro.config.mjs` 的 `exclude` 里，否则 Cloudflare 会让 Worker 处理静态文件，导致静默失败（浏览器 f12 看到 200 但图片空）。
3. **OG 图 `_headers` 需 CORS**：`public/_headers` 里 `/og/*` 和 `/share/*` 都有 `Access-Control-Allow-Origin: *`，不要删。
4. **`pnpm preview` 需要 wrangler**：本地预览构建产物用 `pnpm preview`（内部调 wrangler dev），不是 `astro preview`。
5. **binary push 503**：通过本会话 git proxy 推送 PNG/JPG/字体等二进制文件时，proxy 返回 503。文字内容推送正常。遇到此情况用 `hermes-icon-task.md` 里的方式通过 Hermes 推送。

---

## 快速上手检查清单

新 AI 接手时，按顺序执行：

```bash
git log --oneline -5          # 了解最近改动
git status                    # 有无未提交变更
pnpm check                    # 类型检查，应 0 error
pnpm build                    # 构建，应通过
cat hermes-icon-task.md       # 查看待推 PWA 图标任务状态
```

然后读本文件 + README 即可开始工作。
