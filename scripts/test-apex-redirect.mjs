import assert from 'node:assert/strict';
import { redirectApex } from '../src/apex-redirect.mjs';

for (const path of ['/', '/cases/example/?q=a%20b&tag=one&tag=two', '/og/og-default.jpg?x=1']) {
  const response = redirectApex(new Request(`https://inferred.uk${path}`));
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), `https://www.inferred.uk${path}`);
  console.log(`apex ${path} -> ${response.status} ${response.headers.get('location')}`);
}

const http = redirectApex(new Request('http://inferred.uk:8080/path?q=1'));
assert.equal(http.headers.get('location'), 'https://www.inferred.uk/path?q=1');
console.log(`http apex -> ${http.status} ${http.headers.get('location')}`);

for (const host of ['www.inferred.uk', 'localhost:4321', '127.0.0.1:4321', 'inferred.workers.dev', 'preview.inferred.workers.dev', 'inferred.uk.example.com']) {
  assert.equal(redirectApex(new Request(`https://${host}/path?q=1`)), null);
  console.log(`${host} -> passthrough`);
}
