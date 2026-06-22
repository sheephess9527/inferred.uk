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

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const host = _ctx.request.headers.get('host') ?? '';
  if (host === 'www.tuilis.com' || host === 'tuilis.com') {
    const url = new URL(_ctx.request.url);
    url.hostname = 'www.inferred.uk';
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
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
