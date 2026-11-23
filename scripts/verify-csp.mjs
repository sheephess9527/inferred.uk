import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export function verifyHtml(html, label) {
  const markup = html
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<script\b([^>]*)>([^]*?)<\/script\s*>/gi, (tag, attrs, body) => {
      if (!/\bsrc\s*=/i.test(attrs) && !/\btype=["']application\/ld\+json["']/i.test(attrs)) {
        assert.equal(body.trim(), '', `${label}: inline executable script`);
      }
      return `<script ${attrs}></script>`;
    });
  assert.doesNotMatch(markup, /<style\b/i, `${label}: inline style block`);
  assert.doesNotMatch(markup, /<[^>]+\s(?:style|on[a-z]+)\s*=/i, `${label}: inline attribute`);
}

verifyHtml('', 'empty');
verifyHtml(
  '<script src="/app.js"></script><script type="application/ld+json">{}</script>',
  'external/data'
);
for (const html of [
  '<script>alert(1)</script>',
  '<style>a{}</style>',
  '<p style="color:red">',
  '<p onclick="x()">',
]) {
  assert.throws(() => verifyHtml(html, 'rejected'));
}

const root = 'dist/client';
const policy = (await readFile('public/_headers', 'utf8')).match(
  /Content-Security-Policy: (.+)/
)[1];
assert(!policy.includes('unsafe-inline'));
const middleware = await readFile('src/middleware.ts', 'utf8');
for (const directive of policy.split('; '))
  assert(
    middleware.includes(JSON.stringify(directive)) || middleware.includes(`"${directive}"`),
    `Middleware CSP differs: ${directive}`
  );
assert((await readFile(`${root}/_headers`, 'utf8')).includes(policy));
let count = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (file.endsWith('.html')) {
      verifyHtml(await readFile(file, 'utf8'), file);
      count++;
    }
  }
}
await walk(root);
assert(count > 0, 'No prerendered HTML found');
console.log(
  `CSP verified: ${count} static HTML files; no inline execution/styles/handlers; matching policies.`
);
for (const url of process.argv.slice(2)) {
  const response = await fetch(url);
  assert.equal(response.status, 200, url);
  assert.equal(response.headers.get('content-security-policy'), policy, `${url}: CSP header`);
  verifyHtml(await response.text(), url);
  console.log(
    `CSP verified: ${url} (HTTP 200; matching CSP header; no inline execution/styles/handlers).`
  );
}
