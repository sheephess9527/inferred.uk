import { defineMiddleware } from 'astro:middleware';

// Security response headers applied to every HTML response.
// Fonts and images are self-hosted (@fontsource / public/), so no external
// origins are needed. Canvas-generated poster data URLs require img-src data:.
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Inline scripts are unavoidable with Astro's define:vars and is:inline
  // patterns, so 'unsafe-inline' is required for script-src.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

// 已删除线索文章 → 301 到相关继任文章（消除 Google Search Console 报告的 404）。
// key 为旧 slug，value 为目标路径（统一带尾斜杠）。仅这些 slug 会被重定向，
// 其余线索正常走 next() 渲染。
const CLUE_REDIRECTS: Record<string, string> = {
  'locked-room-basics': '/clues/five-types-of-locked-room/',
  'hidden-passage-designs': '/clues/hidden-room-tricks/',
  'psychological-misdirection': '/clues/layers-of-misdirection/',
  'evidence-planting-methods': '/clues/the-too-perfect-clue/',
  'narrator-unreliability': '/clues/what-narrator-omitted/',
  'fair-play-boundaries': '/clues/fair-play-promise/',
  'edge-suspect-minimal-set': '/clues/',
  'batch-technique-dedup': '/clues/',
};

export const onRequest = defineMiddleware(async (_ctx, next) => {
  // 把别名域名与裸域名统一 301 到规范域名 www.inferred.uk，保留路径与查询串。
  const host = _ctx.request.headers.get('host') ?? '';
  const REDIRECT_HOSTS = new Set(['tuilis.com', 'www.tuilis.com']);
  if (REDIRECT_HOSTS.has(host)) {
    const url = new URL(_ctx.request.url);
    url.hostname = 'www.inferred.uk';
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  // 已删除线索的旧地址 → 301 到继任文章，避免 404。
  const reqUrl = new URL(_ctx.request.url);
  const clueMatch = reqUrl.pathname.match(/^\/clues\/([a-z0-9-]+)\/?$/);
  if (clueMatch && CLUE_REDIRECTS[clueMatch[1]]) {
    return Response.redirect(new URL(CLUE_REDIRECTS[clueMatch[1]], reqUrl).toString(), 301);
  }

  const response = await next();
  const ct = response.headers.get('content-type') ?? '';
  if (!ct.startsWith('text/html')) return response;
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
});
