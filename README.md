# Inferred

> 真相从不明说，只能被推断。
> The truth is never stated. It is inferred.

**Inferred** 是一个原创互动悬疑推理案卷站。用户阅读案卷、查看证词、标记物证、写下推理，然后揭晓真相并复盘伏笔。

```
阅读案卷 → 查看证词 → 标记线索 → 写下推理 → 揭晓真相 → 复盘伏笔
```

- **仓库**：`sheephess9527/inferred.uk`，分支 `main`
- **技术栈**：Astro + MDX + Cloudflare Workers（`@astrojs/cloudflare`，SSR）
- **当前规模**：**105 篇案卷**（001–105）+ **72 篇线索**
- **最新提交**：见下方更新日志

---

## AI / 维护者速查

本节供 AI 助手或维护者快速恢复上下文，**新增案卷前必读**。

### 案卷生成规则（硬性）

1. **`publishedAt`**：取**创建当天**日期（`YYYY-MM-DD`）。同批次可相同。
2. **`caseId`**：三位数字字符串（`"001"`…），按 `publishedAt` 从旧到新**连续编号**，**禁止跳号、乱序**。当前已用到 `"100"`，下一篇从 `"101"` 起。
3. **正文结构**：严格七段式 MDX，标题固定：
   - `## 一、案发`
   - `## 二、人物`
   - `## 三、证词`
   - `## 四、物证`
   - `## 五、推理问题`
   - `## 六、你的推理`
   - `## 七、揭晓真相`（含 `### 真相` / `### 关键矛盾` / `### 伏笔解析` 编号列表，末句固定：**真相从不明说。它只能被推断。**）
4. **文风**：优雅克制、公平本格（fair play）；灵感可来自世界经典悬疑（阿加莎、卡尔、钱德勒、高罗佩、日本本格等），但**剧情须原创**。
5. **公平性**：关键线索须在揭晓前以物证/细节形式出现；禁止事后空降设定。
6. **组件约定**：
   - `export const evidence` **7 条**（`clueCount: 7`）；其中 1–2 条用 `detail` 标注红鲱鱼误导方向
   - `EvidenceList` / `DetectiveNotes` 的 `caseId` 与 frontmatter 一致
   - `DeductionQuestions` 通常 **5 个问题**
   - **5–6 个** `PersonCard`：死者 + 真凶 + **至少 2 个红鲱鱼嫌疑人**（参考 001、091）
   - **4 个** `TestimonyBlock`：互相矛盾、各为其主
   - **禁止 `**` 加粗**：物证 `label` 在 `EvidenceList` 中按纯文本渲染，星号会原样显示
   - **禁止在 JS 字符串内使用 ASCII 直双引号**：`export const evidence` 块和 `DeductionQuestions` 的 `questions={[...]}` 均为 JavaScript 上下文，字符串由 `"` 界定；若文案内需引用文字，必须改用中文角括号 `「」`，否则 acorn 解析器会将内层 `"` 视为字符串结束符，导致 `pnpm build` 报错（`Could not parse expression with acorn`）。
   - `readingTime` 进阶案卷用 `"12-16 分钟"`
   - 第六节在 `<DetectiveNotes>` 前写一句**推理引导语**（邀请读者先判断再揭晓）
   - 揭晓须说明红鲱鱼为何误导；`伏笔解析` **6–7 条**
7. **`questions`**：每案 **3 道**选择题，必须覆盖 Q1 嫌疑人、Q2 手法/物证、Q3 真相方向；`answer` 为 0-based 下标；选项须使用案件内真实人名和物证，并包含有迷惑性的干扰项。YAML 字符串内含双引号时改用中文书名号 `「」` 避免解析错误。
9. **`featured`**：每批约 25–30% 为 `true`；首页精选仅展示最新 10 篇 featured（`index.astro` `.slice(0, 10)`）。**近邻相似案卷只保留一篇 featured**（见下方审计备忘）。
10. **slug**：文件名即 URL，英文 kebab-case，如 `the-coat-from-yesterdays-reel.mdx` → `/cases/the-coat-from-yesterdays-reel`。

### 案卷状态（站点 vs 读者进度）

两套状态并存，UI 优先显示读者进度：

| 层级 | 字段 / 存储 | 取值 | 界面文案 |
|------|-------------|------|----------|
| 站点 | frontmatter `status` | `unsolved` / `solved` | 未解 / 已解 |
| 读者 | `localStorage` `inferred:progress:/cases/{slug}` | `reading` / `solved` | 推理中 / 已结案 |

**触发逻辑**（`src/pages/cases/[slug].astro`、`RevealAnswer.astro`）：

1. 打开案卷页 → 若非已结案，写入 `reading`
2. 展开「揭晓真相」→ 写入 `solved`，并派发 `inferred:case-solved` 事件

**显示位置**（`e648432` + `9b2bc04` 修复）：

- 列表卡片 `CaseCard.astro`：`data-progress-badge`
- 详情页眉：`data-case-eyebrow-text`，初始渲染中文「未解/已解」，JS 根据 localStorage 同步为「推理中/已结案」
- `CaseMeta.astro`：读取同一 `localStorage` 键，揭晓后即时更新（已移除 `data-progress-badge` 无效逻辑）

新增案卷 `status` 保持 `"unsolved"` 即可；读者进度由前端自动管理。

### 发布后流程（必须按序）

```bash
pnpm og:export      # 生成 public/og/ 与 public/share/cases/
pnpm check          # astro check，0 errors
pnpm verify:og      # 确认每篇案卷/线索均有分享图
git add -A
git commit -m "content: add cases XXX-YYY ..."
git push origin main
```

Cloudflare 监听 `main` 自动构建部署。

### Windows 环境备忘

- PowerShell 执行策略可能阻止 `pnpm.ps1`，用 **`pnpm.cmd`** 代替 `pnpm`。
- `git -C <repo路径> ...` 比 `cd ... && git` 更稳（避免 PowerShell `&&` 解析问题）。

### 重复案情审计备忘（2026-06-20）

全库 100 篇**无严格案情重复**（无两篇共享同一凶手+手法+误导+破解）。

曾发现 3 对「近邻案卷」，已通过 frontmatter/摘要差异化；featured 错开：

| 配对 | 区分要点 | featured |
|------|----------|----------|
| 052 蜡烛刻度 / 088 双端燃速 | 刻度计时 vs 燃速诡计 | 仅 **088** |
| 041 冲印工坊 / 066 商业照相馆 | 旋转遮光门假密室 vs 动线推理 | 仅 **066** |
| 039 缓效毒补棋 / 063 对弈骤止 | 死后多摆四步 vs 对弈中钝器 | 仅 **039** |

新增案卷前宜 grep 已有 `types` / 核心诡计，避免同批次撞车。

### 内容批次记录

| 日期 | caseId | 数量 | 提交 | 说明 |
|------|--------|------|------|------|
| 2026-06-20 | 056–060 | 5 | `89324a6` | 首批进阶批次 |
| 2026-06-20 | 061–070 | 10 | `c2cad64` | 难度提升批次 |
| 2026-06-20 | 071–090 | 20 | `f6ecfd9` | 经典悬疑灵感大批次 |
| 2026-06-20 | — | — | `b023f7b` | 三对近邻案卷差异化（无新编号） |
| 2026-06-20 | 091–100 | 10 | `6bcb3a4` | 监控/邮务/机械诡计批次 |
| 2026-06-21 | 056–100 | 45 | `e648432` | 扩充人物/证词/红鲱鱼；去除 `**`；修复进度状态显示 |
| 2026-06-21 | 101–105 | 5 | — | 时间线诡计批次（电钟断电/通话0秒/影子朝向/草籽物证/邮戳悖论） |

**质量标杆案卷**：`001`（早期完整版）、`091`（进阶批次范例）。

---

## 案卷 MDX 模板

在 `src/content/cases/` 新建 `.mdx`，复制并修改：

```mdx
---
title: "案件标题"
caseId: "101"
status: "unsolved"
difficulty: 4
types:
  - "诡计类型一"
  - "诡计类型二"
scene:
  - "场景一"
  - "场景二"
readingTime: "12-16 分钟"
clueCount: 7
questions:
  - q: "案件中最核心的嫌疑人是谁？"
    choices:
      - text: "人物A"
      - text: "人物B"
      - text: "人物C"
      - text: "人物D"
    answer: 0
  - q: "最关键的作案手法或物证是什么？"
    choices:
      - text: "手法/物证A"
      - text: "手法/物证B"
      - text: "手法/物证C"
      - text: "手法/物证D"
    answer: 2
  - q: "案件的核心真相最接近哪个方向？"
    choices:
      - text: "方向A"
      - text: "方向B"
      - text: "方向C"
      - text: "方向D"
    answer: 1
publishedAt: "2026-06-20"
summary: "一句话摘要，点明核心矛盾。"
featured: false
---

import PersonCard from '../../components/PersonCard.astro';
import TestimonyBlock from '../../components/TestimonyBlock.astro';
import EvidenceList from '../../components/EvidenceList.astro';
import DeductionQuestions from '../../components/DeductionQuestions.astro';
import DetectiveNotes from '../../components/DetectiveNotes.astro';
import RevealAnswer from '../../components/RevealAnswer.astro';

export const evidence = [
  { label: "物证一。", detail: "" },
  { label: "物证二。", detail: "红鲱鱼：指向错误嫌疑人。" },
  // …共 7 条，勿用 ** 加粗
];

## 一、案发
（2–3 段叙事；开场抛出矛盾，点名多名在场者）

---

## 二、人物

<PersonCard name="死者" … />
<PersonCard name="真凶" … />
<PersonCard name="红鲱鱼甲" … />
<PersonCard name="红鲱鱼乙" … />
<PersonCard name="证人/同事" … />
<!-- 共 5–6 人 -->

---

## 三、证词

<TestimonyBlock speaker="真凶" time="问询时">“…”</TestimonyBlock>
<TestimonyBlock speaker="红鲱鱼甲" time="…">“…”</TestimonyBlock>
<TestimonyBlock speaker="红鲱鱼乙" time="…">“…”</TestimonyBlock>
<TestimonyBlock speaker="证人" time="…">“…”</TestimonyBlock>
<!-- 共 4 段，互相矛盾 -->

---

## 四、物证

<EvidenceList caseId="101" items={evidence} />

---

## 五、推理问题

<DeductionQuestions questions={["…", "…", "…", "…", "…"]} />

---

## 六、你的推理

在打开答案前，写下你的判断：谁在说谎？哪条线索最可疑？

<DetectiveNotes caseId="101" />

---

## 七、揭晓真相

<RevealAnswer>

### 真相
（凶手、手法、动机；说明红鲱鱼为何有效）

### 关键矛盾
（一句点题）

### 伏笔解析
1. 线索一——说明。
2. …
（共 6–7 条，勿用 **）

真相从不明说。它只能被推断。

</RevealAnswer>
```

### Astro 组件开发注意事项

**`<style is:global>` 陷阱**：Astro `<style>` 块编译后会给选择器附加 `[data-astro-cid-xxx]` 属性限定符。但通过 `innerHTML` 或 `document.createElement` 在客户端脚本里动态创建的元素**不携带**该属性，导致 scoped 样式静默失效。凡是组件通过 JS 构建 DOM（如 `DetectiveNotes`、`CaseSummary`），必须使用 `<style is:global>`，并确保 class 名称唯一（`deduction__`、`case-summary__` 前缀已足够唯一）。

### frontmatter 字段（`src/content.config.ts`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 中文标题 |
| `caseId` | string | 三位编号，与 `publishedAt` 顺序一致 |
| `status` | `unsolved` \| `solved` | 默认 `unsolved` |
| `difficulty` | 1–5 | 整数 |
| `types` | string[] | 诡计/风格标签，通常 2 个 |
| `scene` | string[] | 场景标签，通常 2 个 |
| `readingTime` | string | 如 `"10-13 分钟"` |
| `clueCount` | number | 通常 7 |
| `hints` | string[]? | 折叠提示列表（可选） |
| `questions` | array? | 推理判断选择题，格式见下（可选，默认使用通用题） |
| `publishedAt` | date | 发布日期 |
| `summary` | string | 卡片摘要 |
| `featured` | boolean | 是否精选 |

#### `questions` 格式

```yaml
questions:
  - q: "题目文字"
    choices:
      - text: "选项A"
      - text: "选项B"
      - text: "选项C"
      - text: "选项D"
    answer: 2        # 正确选项的 0-based 下标（0=A, 1=B, 2=C, 3=D）
```

每案 **3 题**，建议覆盖：Q1 核心嫌疑人、Q2 关键物证/手法、Q3 真相方向。未设 `questions` 时组件回退至 3 道通用题（无答案评分）。

---

## 案卷一览（001–105）

| caseId | 标题 | slug | ★ |
|--------|------|------|---|
| 001 | 暴风雨之夜的第七位客人 | `the-storm-villa` | ★ |
| 002 | 楼梯间的两面镜子 | `the-stairwell-mirror` | ★ |
| 003 | 滑墙画廊 | `the-sliding-wall-gallery` | ★ |
| 004 | 纸门后的第三个房间 | `the-paper-screen-room` | ★ |
| 005 | 霓虹窗上的倒影 | `the-neon-reflection` | ★ |
| 006 | 湖里的那个人 | `the-misidentified-man` | ★ |
| 007 | 墙那边的笑声 | `the-laughter-through-the-wall` | ★ |
| 008 | 最后一页不是遗书 | `the-last-page` | |
| 009 | 最后一根烟 | `the-last-cigarette` | |
| 010 | 爵士俱乐部后门 | `the-jazz-club-backdoor` | ★ |
| 011 | 空展台上的倒影 | `the-empty-mannequin` | |
| 012 | 临终那行字 | `the-dying-scrawl` | ★ |
| 013 | 黄昏雨窗 | `the-dusk-rain-window` | |
| 014 | 配重落下的那一刻 | `the-delayed-counterweight` | |
| 015 | 交叉时刻表 | `the-crossing-timetable` | ★ |
| 016 | 固定座位的常客 | `the-cafe-regular` | |
| 017 | 没有脚印的雪地 | `snow-without-footprints` | ★ |
| 018 | 同一壶里的毒 | `poison-in-the-last-cube` | ★ |
| 019 | 凌晨 2:17 的电梯 | `elevator-at-2-17` | ★ |
| 020 | 雨夜旅馆的第三个杯子 | `third-cup-in-the-rainy-inn` | ★ |
| 021 | 宣读遗嘱的二十秒 | `the-will-reading` | |
| 022 | 寡妇的信封 | `the-widows-envelope` | ★ |
| 023 | 完美的镜子 | `the-perfect-mirror` | ★ |
| 024 | 第十位客人 | `the-tenth-guest` | ★ |
| 025 | 通往虚无的特快 | `the-express-to-nowhere` | ★ |
| 026 | 会移动的椅子 | `the-moving-chair` | |
| 027 | 时钟的不在场证明 | `the-clockwork-alibi` | |
| 028 | 最后一个字 | `the-dying-word` | |
| 029 | 最后一张牌 | `the-final-card` | |
| 030 | 隐藏的钥匙 | `the-hidden-key` | |
| 031 | 消失的客人 | `the-missing-guest` | |
| 032 | 红心王后的留言 | `the-queen-of-hearts-message` | |
| 033 | 榻榻米的误差 | `the-tatami-count` | |
| 034 | 消失的灯 | `the-vanishing-lamp` | ★ |
| 035 | 第六位证人 | `the-sixth-witness` | |
| 036 | 花圈上的露水 | `the-dew-on-the-wreath` | |
| 037 | 阅览室的眼镜 | `the-reading-room-glasses` | |
| 038 | 颠倒的结 | `the-inverted-knot` | |
| 039 | 不完整的棋局 | `the-unfinished-game` | ★ |
| 040 | 霜上的半个名字 | `the-half-name-in-frost` | ★ |
| 041 | 显影之间 | `between-exposures` | |
| 042 | 怀表慢了四分钟 | `the-watch-four-minutes-slow` | |
| 043 | 多说的那一句 | `the-sentence-too-many` | |
| 044 | 双人房的单数 | `the-odd-number-in-the-double-room` | |
| 045 | 最干净的指纹 | `the-cleanest-fingerprint` | |
| 046 | 灯塔的门闩 | `the-lighthouse-bolt` | |
| 047 | 白大褂 | `the-white-coat` | |
| 048 | 同一片海 | `the-same-sea` | |
| 049 | 分不清的红与绿 | `red-and-green` | |
| 050 | 颠倒的号码 | `the-upside-down-number` | |
| 051 | 隔水的枪声 | `the-shot-across-the-water` | |
| 052 | 蜡烛烧到第几格 | `how-far-the-candle-burned` | |
| 053 | 左手沏的茶 | `tea-poured-with-the-left-hand` | |
| 054 | 退潮线 | `the-receding-tide-line` | |
| 055 | 无人去翻的唱片 | `the-record-nobody-flipped` | |
| 056 | 镜厅里的对门 | `the-opposite-door-in-the-mirror-hall` | ★ |
| 057 | 冰楔托住的画框 | `the-frame-held-by-ice` | |
| 058 | 少了一点的「未」 | `the-dot-missing-from-wei` | ★ |
| 059 | 雪径上的双向印 | `the-prints-that-walked-both-ways` | |
| 060 | 檐角还在滴水 | `the-eaves-still-dripping` | |
| 061 | 书签折角的那一页 | `the-dog-eared-page-mark` | |
| 062 | 卧铺上的冷茶 | `the-cold-tea-on-the-sleeper-berth` | ★ |
| 063 | 未落完的一手 | `the-unfinished-move-in-go` | |
| 064 | 双墙间的檀香 | `the-sandalwood-between-the-walls` | |
| 065 | 太整齐的碎瓷 | `the-too-neat-porcelain-shards` | |
| 066 | 红灯区外的脚印 | `the-footprint-outside-the-red-zone` | ★ |
| 067 | 印泥深浅不一 | `the-seal-with-uneven-pressure` | |
| 068 | 湿绳迟断的幕坠 | `the-wet-rope-that-broke-late` | |
| 069 | 干砚旁的润笔 | `the-moist-brush-by-dry-inkstone` | |
| 070 | 偏移的星图 | `the-shift-on-the-star-chart` | ★ |
| 071 | 压在底稿下的那封信 | `the-letter-in-the-bottom-sheet` | ★ |
| 072 | 互锁的不在场 | `the-alibi-that-locks-each-other` | ★ |
| 073 | 食梯绳上的油渍 | `the-dumbwaiter-rope-grease` | |
| 074 | 玻璃门后的弯弹 | `the-bullet-that-bent-at-the-glass-door` | |
| 075 | 三瓶墨水的三角 | `the-triangle-of-ink-bottles` | ★ |
| 076 | 陌生人的围裙结 | `the-apron-knot-of-a-stranger` | |
| 077 | 多出十公分的房间 | `the-room-that-gained-ten-centimeters` | |
| 078 | 慢上一刻的客厅钟 | `the-slow-parlor-clock` | |
| 079 | 日历上被圈的日子 | `the-circled-dates-on-the-calendar` | |
| 080 | 永远用不完的那一粒 | `the-one-pill-that-never-ran-out` | |
| 081 | 骑不上坡的自行车 | `the-bicycle-that-could-not-climb-the-hill` | |
| 082 | 燃得过快的香 | `the-incense-that-burned-too-fast` | |
| 083 | 听错墙的那场争吵 | `the-quarrel-heard-from-the-wrong-wall` | |
| 084 | 楼梯间的不对称负重 | `the-asymmetric-burden-in-the-stairwell` | |
| 085 | 来自更低处的伤口 | `the-wound-from-a-shorter-hand` | |
| 086 | 封蜡未破，酒却淡了 | `the-seal-unbroken-but-the-proof-was-gone` | |
| 087 | 四斤，不是司机 | `the-four-jin-not-the-driver` | ★ |
| 088 | 两端同时燃的烛 | `the-candle-burned-from-both-ends` | ★ |
| 089 | 录音里裂开的那一声 | `the-voice-that-split-on-the-recording` | |
| 090 | 略去保险柜的那份报告 | `the-report-that-omitted-the-safe` | ★ |
| 091 | 昨日录像里的外套 | `the-coat-from-yesterdays-reel` | |
| 092 | 盖了两次的邮戳 | `the-stamp-cancelled-twice` | |
| 093 | 先断的 E 弦 | `the-e-string-snapped-first` | ★ |
| 094 | 墨水干涸的那一行 | `the-guest-book-with-dry-ink` | |
| 095 | 内侧结霜的玻璃 | `the-frost-inside-the-greenhouse` | |
| 096 | 链斗空了一拍 | `the-paternoster-skipped-a-beat` | |
| 097 | 打烊架上尚温的面包 | `the-warm-loaf-on-the-closing-shelf` | |
| 098 | 挂钩上的黄铜钥匙 | `the-brass-key-still-on-the-hook` | ★ |
| 099 | 没有咸味的潮池 | `the-tide-pool-without-salt` | |
| 100 | 七号座留下的竞拍牌 | `the-paddle-left-at-lot-seven` | ★ |
| 101 | 断电的七点四十三 | `the-clock-that-stopped-at-seven-forty-three` | |
| 102 | 未接通的电话 | `the-call-that-never-connected` | |
| 103 | 午后的阴影 | `the-afternoon-shadow` | |
| 104 | 鞋底的草籽 | `seeds-in-the-sole` | |
| 105 | 早了两小时的回信 | `the-reply-that-came-too-early` | |

★ = `featured: true`

---

## 线索一览（72 篇）

| order | 标题 | slug |
|-------|------|------|
| 1 | 如何识别证词矛盾 | `how-to-spot-testimony-contradictions` |
| 2 | 密室诡计的五种常见类型 | `five-types-of-locked-room` |
| 3 | 为什么"多余物品"往往不是多余的 | `the-superfluous-object` |
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
| 53 | 监控循环：录像也能撒谎 | `surveillance-loop-alibis` |
| 54 | 邮戳、挂号与寄达时间 | `postmark-time-traps` |
| 55 | 声响掩护：用噪音遮住动作 | `noise-as-cover` |
| 56 | 墨水干涸：笔尖写下的是时刻 | `ink-drying-clocks` |
| 57 | 冷热与假密室：温度也在推理 | `heat-cold-locked-rooms` |
| 58 | 钥匙仪式：展示、托管与调包 | `key-ceremony-tricks` |
| 59 | 泥土、花粉与「你来过这里」 | `soil-pollen-signatures` |
| 60 | 拍卖槌落下之后：身份错位 | `auction-estate-identity` |
| 61 | 滑轮、链条与动线诡计 | `pulley-chain-escapes` |
| 62 | 茶温与面包皮：餐桌上的钟 | `food-temperature-clocks` |
| 63 | 叙述省略：他没说的那一小时 | `what-narrator-omitted` |
| 64 | 拼接与频谱：数字录音的缝 | `splice-spectrum-lies` |
| 65 | 红鲱鱼审计：五问清单 | `herring-audit-checklist` |
| 66 | 互锁不在场：一张网，不是一根绳 | `woven-alibi-networks` |
| 67 | 术语陷阱：专家也会露怯 | `expert-jargon-traps` |
| 68 | 物证板怎么钉：四类标记法 | `pinning-the-evidence-board` |
| 69 | 揭晓前重读：与作者的契约 | `reread-before-reveal` |
| 70 | 误导的三层结构 | `layers-of-misdirection` |
| 71 | 从古典到案卷：灵感转化法 | `from-classics-to-cases` |
| 72 | 连读案卷：去重自检法 | `archive-reread-method` |

新增线索：`order` 从 **73** 起，在 `src/content/clues/` 新建 `.md`。

---

## 功能一览

- 案卷详情页（档案风排版）
- 案卷进度：未解 / 推理中 / 已结案（`localStorage`，揭晓后即时更新）
- 档案馆：按状态 / 难度 / 类型 / 场景筛选
- 互动物证板（重要 / 可疑 / 误导 / 排除，`localStorage`；揭晓后自动对比评分）
- **推理判断**：案卷专属选择题（每案 3 题），选项带圆形 radio 指示器（选中→红色实心），揭晓后自动评分并按题显示✓/✗/答案（`DetectiveNotes`）
- **案件总结**（`CaseSummary`）：揭晓后展示物证识别 + 推理判断综合评分（perfect / good / low 三级）及逐题选择明细（你选了X / 正确答案Y）
- 折叠揭晓（`<details>`，不持久化展开状态）
- 阅读进度条、亮暗色模式
- SEO + sitemap（带 lastmod / changefreq / priority 加权）+ Open Graph + JSON-LD
- 搜索引擎站点验证（Google / Bing / 百度，验证码填于 `src/siteConfig.ts`）
- 分享：`ShareBar`（海报 / 微信 / 小红书 / 复制图文）
- PWA：雷达眼 logo 图标（512/192/apple-touch/maskable）
- 响应式布局，支持「添加到主屏幕」

---

## 本地运行

需要 Node 18+（推荐 20/22）。

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build
pnpm preview      # wrangler dev
pnpm check
pnpm og:export
pnpm verify:og
```

Windows 若 `pnpm` 报错，改用 `pnpm.cmd`。

---

## 目录结构

```
.github/workflows/     # CI：check + build
scripts/
  export-og.mjs
  generate-share-images.mjs
  generate-share-posters.mjs
  verify-og.mjs
public/
  og/cases/            # 案卷分享图（og:export 生成）
  share/cases/         # 带 QR 的海报
src/
├── components/        # CaseCard, ShareBar, RevealAnswer, EvidenceList…
├── content/
│   ├── cases/         # 案卷 .mdx
│   └── clues/         # 线索 .md
├── layouts/BaseLayout.astro
├── pages/
│   ├── index.astro
│   ├── cases/[slug].astro
│   ├── archive.astro
│   ├── clues/[slug].astro
│   └── about.astro
└── content.config.ts
```

---

## 部署

Cloudflare Workers Git 集成，跟踪 `main`：

| 项 | 值 |
|----|-----|
| 构建命令 | `pnpm run build` |
| 部署命令 | `pnpm dlx wrangler versions upload` |
| 说明 | 构建环境不装 devDependencies，故用 `pnpm dlx` 而非 `pnpm exec wrangler` |

### 路由与静态资源

`astro.config.mjs` 中 `routes.extend.exclude` 排除 `/share/cases/*`、`/og/cases/*`、`/og/clues/*`，避免 Worker 拦截静态分享图（Cloudflare `_routes.json` 通配符 `*` 只匹配单段路径）。

---

## 更新日志（精编）

### 2026-06-22 — 中英文界面切换（完整版）

- **`EN / 中` 切换按钮**：Header 右上角（主题切换旁）新增语言切换按钮；点击后 `<html>` 增删 `data-lang="en"` 属性，触发全站 CSS 联动；偏好存入 `localStorage['inferred:lang']`，刷新自动恢复
- **首帧无闪烁**：`BaseLayout.astro` 新增内联初始化脚本（与主题初始化同级），在首次渲染前从 localStorage 读取语言偏好并应用到 `<html>`
- **全局 i18n 工具类**（`global.css`）：
  - `.i18n-zh`（默认显示）/ `.i18n-en`（默认隐藏）
  - `[data-lang="en"] .i18n-zh { display: none }` / `[data-lang="en"] .i18n-en { display: inline }`
- **已翻译的全部区域**（UI 框架层，案卷正文保持中文）：
  - `Header.astro`：导航标签（案卷/Cases、线索/Clues、档案馆/Archive、关于/About）
  - `Footer.astro`：导航链接、口号（中英互换顺序）、版权声明
  - `CaseMeta.astro`：字段标签；EN 模式隐藏中文状态词，英文 UNSOLVED/SOLVED/ACTIVE/CLOSED 可见
  - `src/pages/index.astro`：Hero 标题/副标题/按钮、介绍段落、玩法说明、案件类型分区
  - `src/pages/cases/index.astro`、`archive.astro`、`clues/index.astro`、`clues/[slug].astro`：页面标题与导航
  - `src/pages/cases/[slug].astro`：导航箭头（上一篇/下一篇）、底部链接（返回案卷列表/进入档案馆）、归档日期标签、眉题状态（已结案/CLOSED 等）
  - `src/pages/404.astro`：404 页面全文
  - `src/pages/about.astro`：关于页面全文（含正文段落英译）
  - `CaseCard.astro`：「打开案卷 →」、进度徽章（CLOSED/ACTIVE/SOLVED/UNSOLVED）；JS 监听 `inferred:lang-changed` 实时更新
  - `RelatedCases.astro`：「你可能还会喜欢 / You might also like」
  - `RevealAnswer.astro`：按钮文字、展开/折叠提示
  - `DifficultyVote.astro`：评分提示文字、官方难度标注
  - `NewsletterBox.astro`：标题、描述、标签、按钮、备注
  - `UpdatePrompt.astro`：更新提示标签
  - `HintSystem.astro`：提示标题、状态文字（点击查看/已查看/需先解锁）、已查看计数；JS 监听语言切换实时更新
  - `CaseSummary.astro`：物证识别/推理判断分行、命中统计、题目详情（Q1 · 你选：/You chose: 等）、结案语（5 档词句均有中英双版）；JS 渲染后 CSS 联动 i18n-zh/en span
  - `EvidenceList.astro`：标记状态文字（重要/Important 等）、揭晓反馈（✓ 正确/✓ Correct 等）、成绩行、清除确认；JS 监听语言切换重新绘制
  - `ShareBar.astro`：按钮文字（朋友圈/WeChat、复制链接/Copy Link、更多…/More… 等）、海报弹窗步骤说明、toast 消息、Canvas 成绩文字（全部命中/All correct 等）
  - `DeductionQuestions.astro`：进度计数（X / N 已思考 / X / N answered）；JS 监听语言切换
  - `ArchiveFilter.astro`：筛选分组标签（进度/Status、难度/Difficulty、类型/Type、场景/Scene）、各选项（全部/All、未解/Unsolved 等）、案卷计数、空态提示；JS 监听语言切换
  - `CaseList.astro`：空态文字（此分类下暂无案卷。/ No cases in this category.）

### 2026-06-21 — 修复合并回退：恢复成绩海报 + 结案报告

- **回归根因**：Astro 6 安全合并（`6024389`）解决冲突时对 4 个文件误用 `--theirs`（取了 feature 分支旧版），静默覆盖了 main 主线上的较新实现：
  - `ShareBar.astro`：丢失 canvas 成绩条功能（`733b5f1` 起实现），已从 stash `c6ab30d` 恢复「canvas + 安全修复」合并版
  - `CaseSummary.astro`：退化为 Frankenstein 版——调用了未定义的 `esc()`、缺 `DeductionDetail` 接口与 `details` 字段，会在渲染答题详情时抛 `ReferenceError`；已恢复完整自洽版（含 `VALID_VERDICTS` 安全校验）
  - `README.md`：丢失 6 个章节（开发注意事项 + 5 条更新日志），已恢复
  - `astro.config.mjs`：经核对完整无损（sitemap serialize 逻辑齐全）
- **教训**：二进制/大文件冲突可用 `--theirs/--ours`，但**源码冲突必须逐块手动合并**，`--theirs` 会整文件覆盖、静默丢功能。Astro `<script>` 不做类型检查，`pnpm build` 通过 ≠ 运行时正常，回退不会报错。

### 2026-06-21 — 安全加固 + Astro 6 升级

- **Astro 5 → 6**（`astro@6.4.8`）+ **`@astrojs/cloudflare@13`**（修复多项 CVE）
  - `astro.config.mjs` 新增 `output: 'server'`（Astro 6 SSR 必填）
  - `wrangler.jsonc` 去除 `main` 字段（`@cloudflare/vite-plugin@1.42` 改由 adapter 自动注入）
  - `src/pages/cases/[slug].astro`、`clues/[slug].astro` 加 `export const prerender = true`（否则 SSR 模式忽略 `getStaticPaths`，详情页白屏）
- **HTTP 安全响应头**（`src/middleware.ts`）：CSP（`img-src 'self' data: blob:` 放行 canvas 海报）、`X-Frame-Options: DENY`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`
- **XSS 修复**：`ShareBar.astro` / `CaseSummary.astro` 的 `innerHTML` 改为 `replaceChildren` + `textContent`；`verdict` 白名单校验

### 2026-06-21 — 分享海报叠加成绩

- **成绩海报**：`ShareBar` 点击「朋友圈」/「小红书」时，先读 `localStorage['inferred:reveal:deduction:/cases/{slug}']`（揭晓答案时写入）；若有判断题成绩（`evaluated > 0`），则用 Canvas 在原静态海报底部叠加渐变遮罩 + 成绩文字（"全部命中 · N 题全对" 或 "推断命中 X/N 题"）+ 邀请语，导出 `image/jpeg` data URL 替换原图；下载文件名改为 `inferred-score.jpg`
- **降级**：Canvas 失败或用户尚未揭晓时，沿用静态 `/share/cases/{slug}.jpg`
- **缓存**：`_scoredSrc` 变量缓存首次生成结果，同一页面内第二次点击无需重复绘制
- **纯客户端**：不需要服务端，无额外网络请求

### 2026-06-21 — 首页快速入口 + Prettier

- **首页三入口**：Hero 正下方新增 `<section class="quickstart">` 横排卡片组，三张卡片全由客户端 JS 驱动：
  - **继续推理**（accent 边框）：读取 localStorage `inferred:progress:/cases/{slug}` = `'reading'` 的记录，找到则显示标题并链接，否则隐藏（`hidden` 属性）
  - **今日推荐**：`Math.floor(Date.now() / 86400000) % caseIndex.length` 取每日固定推荐，刷新不换（同一天同一本）
  - **随机开案**（`<button>`）：点击跳转 `caseIndex` 中随机案卷
  - `caseIndex`（`slug` + `title` 数组）通过 `define:vars` 从服务端注入，无额外请求
- **Prettier 格式化**：新增 `.prettierrc`（`prettier-plugin-astro`）和 `.prettierignore`；`package.json` 加 `format` 脚本；对全部 `src/**` 已做一次统一格式化

### 2026-06-21 — SEO 收录强化

- **搜索引擎站点验证**：新增 `src/siteConfig.ts` 集中管理 Google / Bing / 百度验证码；`BaseLayout` 按需输出 `google-site-verification` / `msvalidate.01` / `baidu-site-verification` 三个 `<meta>`，字段留空则不输出。拿到验证码填入对应字段提交即可
- **sitemap 加权**：`astro.config.mjs` 为 `@astrojs/sitemap` 配置 `serialize`，按页面类型输出 `lastmod` / `changefreq` / `priority`：
  - 首页 1.0、列表/档案/线索目录页 0.9（daily）
  - 案卷详情：精选 `featured` 0.8、普通 0.7（monthly）
  - 线索详情 0.6、其余静态页 0.5
  - 案卷/线索 `lastmod` 取各自 frontmatter `publishedAt`（构建时用轻量正则读取，失败安全降级）
- **类型安全**：`changefreq` 使用 `@astrojs/sitemap` 重导出的 `ChangeFreqEnum` 枚举成员（非字符串字面量），`pnpm check` 0 error
- **实测**：构建后 `sitemap-0.xml` 仍含全部 177 条 URL，各条目带正确的 lastmod / changefreq / priority

> 收录操作：Google Search Console 添加网域 → DNS 加 TXT 验证 → 提交 `sitemap-index.xml` → 用「网址检查」对首页与精选案卷「请求编入索引」。Bing/百度同理，验证码填入 `src/siteConfig.ts`。

### 2026-06-21 — 交互优化与状态修复

- **`DetectiveNotes` 选项可见性**：每个选项前新增 12px 圆形 radio 指示器（空心→填充红 `#c05555`），选中项同时加粗边框、浅玫瑰色背景，揭晓后绿色/琥珀色反馈；彻底解决「看不出自己选了什么」问题
- **Astro 作用域 CSS 陷阱修复**：`<style>` 编译后选择器带 `[data-astro-cid-xxx]` 属性限定，`innerHTML` 注入的元素没有此属性，导致动态按钮样式静默失效；改为 `<style is:global>` 后所有 `deduction__` 样式正常应用（类名足够唯一，全局无冲突）
- **`CaseSummary` 逐题详情**：`DetectiveNotes` 揭晓时将每题 `{ q, selectedText, answerText, verdict }` 写入 `localStorage` 的 `details[]`；`CaseSummary` 读取后渲染 ✓/✗/— 列表，显示「你选：X」和「正确：Y」，让复盘一目了然
- **状态文案统一**：`[slug].astro` 页眉初始渲染改为中文「未解/已解」（原为英文），JS 同步函数与之对齐：`推理中 / 已结案 / 已解 / 未解` 四态均使用中文，全站状态标签一致
- **`CaseMeta` 无效代码移除**：`inferred:case-solved` 监听器中移除了针对 `[data-progress-badge]` 的更新逻辑（该选择器在案卷详情页不存在），消除静默无效操作

### 2026-06-21 — 推理判断交互化 + 案件总结

- **`DetectiveNotes` 重构**：自由文本笔记改为案卷专属选择题；揭晓后自动对比答案，显示「✓ 推断正确」/ 「✗ 推断有误」/ 「← 正确答案」badge，并在组件内显示得分横幅（perfect / good / low 三级）
- **`CaseSummary` 新增组件**：揭晓后 800ms 淡入，汇总「物证识别」与「推理判断」两项评分，按综合表现显示四级点评文案
- **`EvidenceList` 评分写入**：揭晓时记录 `{ marked, total, correct, evaluated }` 至 `localStorage`，供 `CaseSummary` 读取
- **content schema 扩展**：`src/content.config.ts` 新增可选字段 `questions`（含 `q` / `choices` / `answer`）
- **`[slug].astro` 注入机制**：`is:inline define:vars` 将 frontmatter `questions` 注入 `window.__inferredDeductionItems`，组件优先读取页面注入值，回退通用三题
- **全库 100 篇案卷**均已在 frontmatter 补写 3 道专属推理选择题（Q1 嫌疑人 / Q2 手法物证 / Q3 真相方向），选项使用案件内真实人名与物证，含迷惑性干扰项

### 2026-06-21 — 线索扩充（053–072）

- 新增线索 **20 篇**（order 53–72）：监控循环、邮戳时间、声响掩护、墨水干涸、冷热密室、钥匙仪式、地理痕迹、拍卖身份、滑轮动线、食温时钟、叙述省略、数字拼接、红鲱鱼审计、互锁 alibi、术语陷阱、物证板、揭晓前重读、误导层次、古典转化、连读去重
- 线索总数 **52 → 72**；README 线索一览表同步更新

### 2026-06-21 — 全站质量修复（001–100 统一标准）

- **001–055** 共 55 篇扩充：5–6 人物、4 段证词、红鲱鱼物证（与 056–100 同标准）
- 全库 100 篇去除 `**` 加粗（物证板不再显示星号）
- 档案馆进度筛选：未解 / 推理中 / 已结案 / 已解（读 `localStorage`）
- `ShareBar` 复制优先 `navigator.clipboard`，保留兼容回退
- 维护脚本：`strip-asterisks.mjs`、`audit-site.mjs`（审计应为 0 issue）

### 2026-06-21 — 案卷质量与状态显示

- **056–100 共 45 篇**内容扩充（`e648432`）：每篇 5–6 人物、4 段矛盾证词、红鲱鱼物证、去除全文 `**`
- 修复读者进度状态：`CaseMeta` / 详情页眉 / `CaseCard` 正确显示 **未解 → 推理中 → 已结案**
- `CaseMeta` 新增必填 `slug` prop，与 `localStorage` 键 `inferred:progress:/cases/{slug}` 对齐

### 2026-06-20 — 内容与文档

- 新增案卷 **091–100**（`6bcb3a4`）
- 三对近邻案卷差异化（`b023f7b`）：052/088、041/066、039/063
- 新增案卷 **071–090**（`f6ecfd9`）、**061–070**（`c2cad64`）、**056–060**（`89324a6`）
- README 重写：案卷规则、发布流程、完整目录、审计备忘（`2c33abb`）

### 2026-06-20 — 分享与资源

- 修复分享海报加载失败：`_routes.json` 通配符不匹配 `/share/cases/slug.jpg` 双段路径
- `ShareBar.astro`：海报 URL 改相对路径；增加加载失败降级
- 新增「复制图文」、分享海报（Logo + QR）、`generate-share-posters.mjs`
- PWA 图标替换为雷达眼 logo（`e3226da`）

### 2026-06-20 — UI / 构建

- Footer 精简（去除与 Header 重复的品牌块）
- About 页优化（移除重复 coda、调整字号）
- 清理构建期临时/孤儿组件：`ProgressDashboard`、`DetectiveDesk`、`DetectiveDeskToggle`、`TextToNote`、`lib/progress.ts`、`lib/notes.ts`
- 修复 `ShareBar.astro` 合并冲突残留与 script 语法损坏导致的构建失败

### 2026-06-19 — 早期扩展

- 案卷扩至 034+；线索 order 重排为 1–37，后增至 52
- 删除 3 篇重复线索；首页 featured 限制为 10 篇
- `CaseCard` 弹性高度；档案馆卡片对齐
- 移除微信分享全屏引导层
- 修复 `pnpm-workspace.yaml` 导致 Cloudflare monorepo 误判
- Cloudflare 部署命令改为 `pnpm dlx wrangler versions upload`
- About 页补充项目起源（为女儿糖糖而建）

---

## 路线图（v1 之后）

用户提交推理 · 推理评分 · 排行榜 · 每周邮件案卷 · 会员高难案件 · PDF 导出 · 系列案件。

---

本项目所有人物与案件均属虚构，与任何真实事件无关。