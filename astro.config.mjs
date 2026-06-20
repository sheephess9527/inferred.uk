// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://inferred.uk',
  integrations: [mdx()],

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
        ]
      }
    }
  }),
});
