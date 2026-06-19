# Inferred

> 真相从不明说，只能被推断。
> The truth is never stated. It is inferred.

**Inferred** 是一个原创互动悬疑推理案卷站。用户阅读案卷、查看证词、标记物证、写下推理，然后揭晓真相并复盘伏笔。

核心体验路径：

```
阅读案卷 → 查看证词 → 标记线索 → 写下推理 → 揭晓真相 → 复盘伏笔
```

技术栈：**Astro + MDX**（内容型静态站，默认零 JS，交互处按需加载）。

---

## 更新日志

### 2026-06-19 — 导航栏平板/手机布局

- `Header.astro`：≤960px 时导航换到独立第二行，四栏等宽网格分布；隐藏英文副标，避免分页面顶栏挤在一行

### 2026-06-19 — 修复朋友圈分享无图（图片入库 + JPEG）

- **根因**：`public/og/cases/` 此前只在本地构建时生成、未提交 Git，Cloudflare 部署后图片 404，微信爬虫抓不到 `og:image`
- 分享图改为 **JPEG**（微信兼容性更好），并**提交到仓库**；`og:image` 指向 `.jpg`
- 新增/改案卷后本地运行 `pnpm og:export` 再 commit 图片；`pnpm build` 不再依赖 sharp（避免 Cloudflare 构建失败）
- 案卷/线索详情页使用 `/og/cases/{slug}.jpg`、`/og/clues/{slug}.jpg`
- 微信会缓存链接预览，更新后可用[公众平台分享调试](https://mp.weixin.qq.com/debug/cgi-bin/switch?t=utils/share_page)重新抓取

### 2026-06-19 — 移除微信分享全屏引导层

- `ShareBar.astro`：删除「点击右上角 ···」全屏遮罩；微信内点击「微信 / 朋友圈」改为直接复制链接并 toast 提示

### 2026-06-19 — Bug 修复与体验改进

基于代码审查，修复以下问题（对应文件见括号）：

| 问题 | 修复 |
|------|------|
| 案卷页阅读进度条在移动端与双行导航重叠 | `ReadingProgress.astro` 改用 CSS 变量 `--header-height`；`Header.astro` 用 `ResizeObserver` 实时测量 header 高度 |
| 首页只显示 3 个 featured 案卷，其余被截断 | `index.astro` 移除 `.slice(0, 3)`，展示**全部** `featured: true` 的案卷（按发布日期排序） |
| 社交分享预览图用 SVG，微信/微博等不显示缩略图 | 新增 `scripts/export-og.mjs`，构建前自动导出 `public/og-default.png`（1200×630）；`BaseLayout.astro` 默认 `ogImage` 改为 PNG |
| 物证标记按数组下标存 localStorage，内容增删后标记错位 | `EvidenceList.astro` 改为按物证 `label` 的 hash 存储（`inferred:evidence:{caseId}`），并自动迁移旧版 `inferred:clues:{caseId}` 数据 |
| 切换亮色模式后浏览器/PWA 顶栏颜色不变 | `BaseLayout.astro` + `Header.astro`：主题切换时同步更新 `theme-color` 与 `apple-mobile-web-app-status-bar-style` |
| 案卷列表文案写死「未解案卷」，与已解案件矛盾 | `cases/index.astro` 改为中性表述 |
| 微信分享引导层无障碍不完整 | `ShareBar.astro`：补 `aria-modal`、Esc 关闭、打开时聚焦关闭按钮、关闭后还原焦点；桌面端微信分享合并为一次 toast |
| PWA 锁定竖屏，平板横屏阅读不便 | `site.webmanifest`：`orientation` 改为 `any` |
| 无 CI 自动构建检查 | 新增 `.github/workflows/ci.yml`（`pnpm check` + `pnpm build`） |
| 域名 `inferred.uk` 尚未解析（部署问题） | README 部署章节补充 DNS 检查清单（需你在托管商侧配置，代码无法代劳） |

**新增脚本与依赖**

- `pnpm og:export` — 手动从 `og-default.svg` 导出 PNG
- `prebuild` — 每次 `pnpm build` 前自动执行 `og:export`
- `devDependencies.sharp` — 用于 OG 图导出（图标导出命令不变）

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
pnpm build        # 构建到 dist/（构建前自动导出 og-default.png）
pnpm preview      # 本地预览构建产物
pnpm check        # 类型检查
pnpm og:export    # 单独从 og-default.svg 导出分享用 PNG
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

1. 在 `src/content/cases/` 下新建一个 `.mdx` 文件，文件名即 URL slug，例如 `the-empty-chair.mdx` → `/cases/the-empty-chair`。
2. 复制下面的模板，填好 frontmatter 与正文。frontmatter 会经过 `content.config.ts` 的 schema 校验，缺字段或类型不符会在构建时报错。

> 现有案卷编号已用到 `008`，新案件请从 `009` 起编。

```mdx
---
title: "案件标题"
caseId: "006"
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
featured: true            # 是否在首页“最新案卷”展示（所有 featured 案卷都会列出，按 publishedAt 排序）
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
案件背景（建议 800-1500 字，氛围克制、信息密度高、避免血腥猎奇）。

## 二、人物
<PersonCard name="姓名" role="身份" age="年龄" relation="与死者关系" alibi="案发时声称在哪里" />

## 三、证词
<TestimonyBlock speaker="姓名" time="记录时间">
  “证词内容。”
</TestimonyBlock>

## 四、物证
<EvidenceList caseId="006" items={evidence} />

## 五、推理问题
<DeductionQuestions />   {/* 不传参用默认 5 问，也可传 questions={[...]} 自定义 */}

## 六、你的推理
<DetectiveNotes caseId="006" />

## 七、揭晓真相
<RevealAnswer>
### 真相
……
### 关键矛盾
……
### 伏笔解析
1. ……
</RevealAnswer>
```

> 注意：
> - `<EvidenceList>` 和 `<DetectiveNotes>` 的 `caseId` 要与 frontmatter 的 `caseId` 一致——它决定了 `localStorage` 的存储 key（物证标记存于 `inferred:evidence:{caseId}`，按物证 `label` 内容的 hash 索引，**不要用数组下标**）。
> - 请把【真相 / 关键矛盾 / 伏笔解析】**全部写在 `<RevealAnswer>` 里**，避免在折叠之前剧透。

## 如何新增一篇线索文章

在 `src/content/clues/` 下新建 `.md` 文件：

```md
---
title: "文章标题"
summary: "一句话摘要。"
publishedAt: "2026-06-20"
order: 4          # 列表排序，数字越小越靠前
---

正文（普通 Markdown）。
```

---

## 如何修改网站信息

- **站点域名 / SEO 基准**：`astro.config.mjs` 的 `site` 字段。
- **设计系统（颜色、字体、间距）**：`src/styles/global.css` 顶部的 CSS 变量。
- **导航 / 页脚**：`src/components/Header.astro`、`src/components/Footer.astro`。
- **首页文案与模块**：`src/pages/index.astro`。
- **默认分享图**：源文件 `public/og-default.svg`，构建时自动导出 `public/og-default.png`（首页等通用页使用）。
- **案卷/线索分享图**：运行 `pnpm og:export` 根据 frontmatter 生成 `public/og/cases/*.{jpg,png}` 与 `public/og/clues/*.{jpg,png}`，**生成后需 commit 进 Git** 才会被 Cloudflare 部署。朋友圈使用 `.jpg`。
- **主屏幕图标**：源文件是矢量的 `public/icon.svg` 与 `public/icon-maskable.svg`。改完后用 `sharp` 重新导出位图：

  ```bash
  node -e "const s=require('sharp'),fs=require('fs');const m=fs.readFileSync('public/icon.svg'),k=fs.readFileSync('public/icon-maskable.svg');(async()=>{await s(m,{density:384}).resize(180,180).png().toFile('public/apple-touch-icon.png');await s(m,{density:384}).resize(192,192).png().toFile('public/icon-192.png');await s(m,{density:384}).resize(512,512).png().toFile('public/icon-512.png');await s(k,{density:384}).resize(512,512).png().toFile('public/icon-maskable-512.png');})()"
  ```

  图标元信息与「添加到主屏幕」配置在 `public/site.webmanifest` 和 `src/layouts/BaseLayout.astro` 的 `<head>` 中。
- **独立 App 的更新按钮**：`src/components/UpdatePrompt.astro`。仅在「添加到主屏幕」的独立模式下显示一个悬浮按钮（iOS 独立模式没有地址栏 / 刷新键，容易卡在旧版本）。它会轮询 `/version.json`（由 `src/pages/version.json.ts` + `src/buildInfo.ts` 在每次构建生成新的 `BUILD_ID`），检测到新版本就高亮为「有新内容 · 更新」，点按即重载到最新；平时也充当手动刷新键。Cloudflare/Netlify 等会注入 commit SHA 作为版本号。

---

## 如何部署

这是纯静态站，`pnpm build` 后将 `dist/` 部署到任意静态托管即可。推荐：

- **Cloudflare Pages / Netlify / Vercel**：连接仓库，构建命令 `pnpm build`，输出目录 `dist`。
- 部署后把自定义域名 `inferred.uk` 指向托管商，并确认 `astro.config.mjs` 中 `site` 与最终域名一致（影响 canonical、sitemap、OG 链接）。

**上线检查清单**

1. 托管商已连接 GitHub 仓库，CI（`.github/workflows/ci.yml`）在 main 分支通过。
2. 自定义域名 `inferred.uk` 的 DNS 已指向托管商（A/CNAME 记录生效；可用 `nslookup inferred.uk` 验证）。
3. 托管商已开启 HTTPS，且 `https://inferred.uk` 可正常打开。
4. `https://inferred.uk/sitemap-index.xml` 与 `https://inferred.uk/version.json` 可访问。
5. 分享任一案卷到微信/微博，确认预览图（`og-default.png`）正常显示。

---

## 路线图（v1 之后）

用户提交推理 · 推理正确率评分 · 排行榜 · 每周邮件案卷 · 会员高难案件 · 案件 PDF 导出 · 系列案件。

---

本项目所有人物与案件均属虚构，与任何真实事件无关。
