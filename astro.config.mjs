// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

import cloudflare from '@astrojs/cloudflare';

// 读取某个内容目录下每篇的 frontmatter，提取 sitemap 需要的元信息：
// publishedAt 作为 lastmod、featured 用于提升精选案卷的 priority。
// 用轻量正则解析（字段格式固定），失败时安全降级为空 Map。
/** @param {string} dir */
function readContentMeta(dir) {
  const map = new Map();
  try {
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
      const slug = file.replace(/\.mdx?$/, '');
      const src = fs.readFileSync(path.join(dir, file), 'utf-8');
      const fm = src.split(/^---\s*$/m)[1] ?? '';
      const dateMatch = fm.match(/publishedAt:\s*["']?(\d{4}-\d{2}-\d{2})/);
      const featured = /^\s*featured:\s*true\s*$/m.test(fm);
      map.set(slug, {
        lastmod: dateMatch ? new Date(dateMatch[1]).toISOString() : undefined,
        featured,
      });
    }
  } catch {
    // 目录不可读时降级：sitemap 仍会用全局默认值
  }
  return map;
}

const caseMeta = readContentMeta('./src/content/cases');
const clueMeta = readContentMeta('./src/content/clues');
const buildLastmod = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
  site: 'https://inferred.uk',
  integrations: [
    mdx(),
    sitemap({
      changefreq: ChangeFreqEnum.WEEKLY,
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        const { pathname } = new URL(item.url);

        // 首页：最高权重
        if (pathname === '/') {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.lastmod = buildLastmod;
          return item;
        }

        // 列表/导航页：高权重、更新频繁
        if (pathname === '/cases/' || pathname === '/archive/' || pathname === '/clues/') {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.DAILY;
          item.lastmod = buildLastmod;
          return item;
        }

        // 案卷详情：精选 0.8，普通 0.7；lastmod 取发布日
        if (pathname.startsWith('/cases/')) {
          const slug = pathname.replace(/^\/cases\//, '').replace(/\/$/, '');
          const meta = caseMeta.get(slug);
          item.priority = meta?.featured ? 0.8 : 0.7;
          item.changefreq = ChangeFreqEnum.MONTHLY;
          if (meta?.lastmod) item.lastmod = meta.lastmod;
          return item;
        }

        // 线索详情：0.6
        if (pathname.startsWith('/clues/')) {
          const slug = pathname.replace(/^\/clues\//, '').replace(/\/$/, '');
          const meta = clueMeta.get(slug);
          item.priority = 0.6;
          item.changefreq = ChangeFreqEnum.MONTHLY;
          if (meta?.lastmod) item.lastmod = meta.lastmod;
          return item;
        }

        // 其余静态页（about 等）
        item.priority = 0.5;
        item.changefreq = ChangeFreqEnum.MONTHLY;
        return item;
      },
    }),
  ],

  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },

  adapter: cloudflare({
    routes: {
      extend: {
        exclude: [
          { pattern: '/share/cases/*' },
          { pattern: '/og/cases/*' },
          { pattern: '/og/clues/*' },
        ],
      },
    },
  }),
});
