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

---

## 本地运行

需要 Node 18+（推荐 20/22）。本项目用 `pnpm`，npm / yarn 亦可。

```bash
pnpm install      # 安装依赖
pnpm dev          # 启动开发服务器（默认 http://localhost:4321）
pnpm build        # 构建到 dist/
pnpm preview      # 本地预览构建产物
pnpm check        # 类型检查
```

---

## 目录结构

```
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

```mdx
---
title: "案件标题"
caseId: "004"
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
featured: true            # 是否在首页“最新案卷”展示
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
<EvidenceList caseId="004" items={evidence} />

## 五、推理问题
<DeductionQuestions />   {/* 不传参用默认 5 问，也可传 questions={[...]} 自定义 */}

## 六、你的推理
<DetectiveNotes caseId="004" />

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
> - `<EvidenceList>` 和 `<DetectiveNotes>` 的 `caseId` 要与 frontmatter 的 `caseId` 一致——它决定了 `localStorage` 的存储 key。
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
- **默认分享图**：`public/og-default.svg`（可替换为 1200×630 的 PNG，并更新各页 `ogImage`）。

---

## 如何部署

这是纯静态站，`pnpm build` 后将 `dist/` 部署到任意静态托管即可。推荐：

- **Cloudflare Pages / Netlify / Vercel**：连接仓库，构建命令 `pnpm build`，输出目录 `dist`。
- 部署后把自定义域名 `inferred.uk` 指向托管商，并确认 `astro.config.mjs` 中 `site` 与最终域名一致（影响 canonical、sitemap、OG 链接）。

---

## 路线图（v1 之后）

用户提交推理 · 推理正确率评分 · 排行榜 · 每周邮件案卷 · 会员高难案件 · 案件 PDF 导出 · 系列案件。

---

本项目所有人物与案件均属虚构，与任何真实事件无关。
