import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 规范标签词表（诡计 / 机制）。新增标签须先在此与 README「标签词表」同步登记。
export const CASE_TYPES = [
  '密室',
  '建筑诡计',
  '暴风雪山庄',
  '不在场证明',
  '动线推理',
  '时间诡计',
  '证词矛盾',
  '叙述性诡计',
  '物证推理',
  '物证误导',
  '文书诡计',
  '仪器记录',
  '身份伪装',
  '心理误导',
  '声学诡计',
  '视觉诡计',
  '机械诡计',
  '临终留言',
  '文字诡计',
  '自然现象',
  '医药毒理',
] as const;

// 案卷集合：叙事正文与各分节（人物 / 证词 / 物证 / 揭晓）写在 MDX body 中，
// 通过组件渲染并提供交互；卡片所需的元信息写在 frontmatter。
const cases = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    caseId: z.string(),
    status: z.enum(['unsolved', 'solved']).default('unsolved'),
    difficulty: z.number().int().min(1).max(5),
    types: z.array(z.enum(CASE_TYPES)).default([]),
    scene: z.array(z.string()).default([]),
    readingTime: z.string(),
    clueCount: z.number().int().nonnegative().default(0),
    hints: z.array(z.string()).optional(),
    questions: z
      .array(
        z.object({
          q: z.string(),
          choices: z.array(z.object({ text: z.string() })),
          /** 正确选项的 0-based 下标 */
          answer: z.number().int().min(0).optional(),
        })
      )
      .optional(),
    publishedAt: z.coerce.date(),
    summary: z.string(),
    featured: z.boolean().default(false),
  }),
});

// 线索 / 推理技巧文章
const clues = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/clues' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    order: z.number().int().default(0),
  }),
});

export const collections = { cases, clues };
