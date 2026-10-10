import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// 新案卷更新订阅：只用 frontmatter summary 做摘要，不含正文/揭晓真相，避免 RSS 阅读器剧透。
export async function GET(context) {
  const cases = await getCollection('cases');
  const sorted = cases.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  return rss({
    title: '推知 Inferred — 新案卷',
    description: '真相从不明说，只能被推断。新案卷上架即第一时间收到。',
    site: context.site,
    items: sorted.slice(0, 40).map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      pubDate: entry.data.publishedAt,
      link: `/cases/${entry.id}/`,
      categories: entry.data.types,
    })),
    customData: '<language>zh-cn</language>',
  });
}
