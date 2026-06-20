# Inferred

> 真相从不明说，只能被推断。
> The truth is never stated. It is inferred.

**Inferred** 是一个原创互动悬疑推理案卷站。用户阅读案卷、查看证词、标记物证、写下推理，然后揭晓真相并复盘伏笔。

```
阅读案卷 → 查看证词 → 标记线索 → 写下推理 → 揭晓真相 → 复盘伏笔
```

- **仓库**：`sheephess9527/inferred.uk`，分支 `main`
- **技术栈**：Astro + MDX + Cloudflare Workers（`@astrojs/cloudflare`，SSR）
- **当前规模**：**100 篇案卷**（001–100）+ **52 篇线索**
- **最新提交**：`e648432` — `fix: case progress status display; enrich cases 056-100`

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
   - `readingTime` 进阶案卷用 `"12-16 分钟"`
   - 第六节在 `<DetectiveNotes>` 前写一句**推理引导语**（邀请读者先判断再揭晓）
   - 揭晓须说明红鲱鱼为何误导；`伏笔解析` **6–7 条**
7. **`featured`**：每批约 25–30% 为 `true`；首页精选仅展示最新 10 篇 featured（`index.astro` `.slice(0, 10)`）。**近邻相似案卷只保留一篇 featured**（见下方审计备忘）。
8. **slug**：文件名即 URL，英文 kebab-case，如 `the-coat-from-yesterdays-reel.mdx` → `/cases/the-coat-from-yesterdays-reel`。

### 案卷状态（站点 vs 读者进度）

两套状态并存，UI 优先显示读者进度：

| 层级 | 字段 / 存储 | 取值 | 界面文案 |
|------|-------------|------|----------|
| 站点 | frontmatter `status` | `unsolved` / `solved` | 未解 / 已解 |
| 读者 | `localStorage` `inferred:progress:/cases/{slug}` | `reading` / `solved` | 推理中 / 已结案 |

**触发逻辑**（`src/pages/cases/[slug].astro`、`RevealAnswer.astro`）：

1. 打开案卷页 → 若非已结案，写入 `reading`
2. 展开「揭晓真相」→ 写入 `solved`，并派发 `inferred:case-solved` 事件

**显示位置**（`e648432` 修复）：

- 列表卡片 `CaseCard.astro`：`data-progress-badge`
- 详情页眉 + `CaseMeta.astro`：读取同一 `localStorage` 键，揭晓后即时更新

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
| `publishedAt` | date | 发布日期 |
| `summary` | string | 卡片摘要 |
| `featured` | boolean | 是否精选 |

---

## 案卷一览（001–100）

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

★ = `featured: true`

---

## 线索一览（52 篇）

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

新增线索：`order` 从 **53** 起，在 `src/content/clues/` 新建 `.md`。

---

## 功能一览

- 案卷详情页（档案风排版）
- 案卷进度：未解 / 推理中 / 已结案（`localStorage`，揭晓后即时更新）
- 档案馆：按状态 / 难度 / 类型 / 场景筛选
- 互动物证板（重要 / 可疑 / 误导 / 排除，`localStorage`）
- 侦探笔记（自动保存）
- 折叠揭晓（`<details>`，不持久化展开状态）
- 阅读进度条、亮暗色模式
- SEO + sitemap + Open Graph
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