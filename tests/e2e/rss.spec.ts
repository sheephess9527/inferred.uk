import { expect, test } from '@playwright/test';

test('direct navigation displays a styled RSS feed under the strict CSP', async ({ page }) => {
  const cspErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /content security policy/i.test(message.text())) {
      cspErrors.push(message.text());
    }
  });

  const response = await page.goto('/rss.xml');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-type']).toMatch(/^(?:application|text)\/xml\b/);
  expect(response?.headers()['content-security-policy']).toContain("style-src 'self';");

  const channel = page.locator('rss[version="2.0"] > channel');
  await expect(channel.locator(':scope > title')).toHaveText('推知 Inferred — 新案卷');
  const item = channel.locator(':scope > item').first();
  await expect(item.locator('title')).toBeVisible();
  await expect(item.locator('description')).toBeVisible();
  await expect(item.locator('link')).toHaveText(/^https:\/\/www\.inferred\.uk\/cases\//);
  await expect(item).toHaveCSS('display', 'block');
  expect(cspErrors).toEqual([]);
});
