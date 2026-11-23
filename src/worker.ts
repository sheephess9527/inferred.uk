import { handle } from '@astrojs/cloudflare/handler';
import { redirectApex } from './apex-redirect.mjs';

export default {
  async fetch(request, env, context) {
    return redirectApex(request) ?? handle(request, env, context);
  },
} satisfies { fetch: typeof handle };
