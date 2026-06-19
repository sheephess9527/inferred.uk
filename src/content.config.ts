import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 案卷集合：叙事正文与各分节（人物 / 证词 / 物证 / 揭晓）写在 MDX body 中，
// 通过组件渲染并提供交互；卡片所需的元信息写在 frontmatter。
const cases = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    caseId: z.string(),
    status: z.enum(['unsolved', 'solved']).default('unsolved'),
    difficulty: z.number().int().min(1).max(5),
    types: z.array(z.string()).default([]),
    scene: z.array(z.string()).default([]),
    readingTime: z.string(),
    clueCount: z.number().int().nonnegative().default(0),
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
