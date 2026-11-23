import { expect, test } from '@playwright/test';

test('serves the legacy favicon at /favicon.ico', async ({ request }) => {
  const response = await request.get('/favicon.ico');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^image\/(x-icon|vnd\.microsoft\.icon)\b/);
});
