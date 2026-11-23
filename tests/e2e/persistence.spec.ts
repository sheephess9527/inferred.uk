import { expect, test, type Page } from '@playwright/test';

const slug = 'the-storm-villa';
const path = `/cases/${slug}`;
const pagePath = `${path}/`;
const evidenceKey = 'inferred:evidence:001';
const deductionKey = 'inferred:deduction:001';
const stored = (page: Page, key: string) =>
  page.evaluate((key) => localStorage.getItem(key), key);

test.beforeEach(async ({ page }) => {
  await page.goto(`${path}/`);
  await expect(page.locator('[data-evidence-item]').first()).toHaveAttribute('aria-pressed', 'false');
});

test('evidence cycles, persists and supports cancel/confirm reset', async ({ page }) => {
  const item = page.locator('[data-evidence-item]').first();
  const id = (await item.getAttribute('data-evidence-key'))!;
  await expect(item.locator('[data-evidence-mark]')).toHaveText('未标记');
  expect(await stored(page, evidenceKey)).toBeNull();
  for (const [state, label] of [
    ['important', '重要'], ['suspicious', '可疑'],
    ['misleading', '误导'], ['excluded', '排除'],
  ]) {
    await item.click();
    await expect(item.locator('[data-evidence-mark]')).toHaveText(label);
    expect(JSON.parse((await stored(page, evidenceKey))!)).toEqual({ [id]: state });
  }
  await item.click();
  await expect(item).toHaveAttribute('aria-pressed', 'false');
  expect(await stored(page, evidenceKey)).toBe('{}');
  await item.click();
  await page.reload();
  await expect(item).toHaveAttribute('data-state', 'important');
  expect(JSON.parse((await stored(page, evidenceKey))!)).toEqual({ [id]: 'important' });
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '清除本案标记' }).click();
  await expect(item).toHaveAttribute('data-state', 'important');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '清除本案标记' }).click();
  expect(await stored(page, evidenceKey)).toBe('{}');
  await page.reload();
  await expect(item.locator('[data-evidence-mark]')).toHaveText('未标记');
});

test('thinking checklist and deduction choices toggle and persist', async ({ page }) => {
  const check = page.locator('[data-q-check]').first();
  const questionKey = `inferred:q:${pagePath}:0`;
  await check.click();
  await expect(check).toHaveAttribute('aria-pressed', 'true');
  expect(await stored(page, questionKey)).toBe('1');
  const choices = page.getByRole('group', { name: '第 1 题', exact: true }).getByRole('button');
  await choices.nth(0).click();
  await choices.nth(1).click();
  await expect(choices.nth(0)).toHaveAttribute('aria-pressed', 'false');
  expect(await stored(page, deductionKey)).toBe('{"0":1}');
  await page.reload();
  await expect(check).toHaveAttribute('aria-pressed', 'true');
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await choices.nth(1).click();
  await check.click();
  expect(await stored(page, questionKey)).toBeNull();
  expect(await stored(page, deductionKey)).toBe('{}');
  await page.reload();
  await expect(check).toHaveAttribute('aria-pressed', 'false');
  await expect(choices.locator('[aria-pressed="true"]')).toHaveCount(0);
});

test('reading → solved, scoring summary, locked choices and difficulty vote survive reload', async ({ page }) => {
  expect(await stored(page, `inferred:progress:${path}`)).toBe('reading');
  await expect(page.locator('[data-diff-vote]')).toBeHidden();
  await expect(page.locator('[data-case-summary]')).toBeHidden();
  await page.reload();
  expect(await stored(page, `inferred:progress:${path}`)).toBe('reading');
  const first = page.getByRole('group', { name: '第 1 题', exact: true });
  await first.getByRole('button', { name: '沈默（别墅主人）' }).click();
  await page.getByRole('group', { name: '第 2 题', exact: true }).getByRole('button').first().click();
  await page.locator('[data-evidence-item]').first().click();
  await page.locator('[data-reveal-answer] > summary').click();
  await expect(page.locator('[data-reveal-answer]')).toHaveAttribute('open', '');
  await expect.poll(() => stored(page, `inferred:progress:${path}`)).toBe('solved');
  const scoreKey = `inferred:reveal:deduction:${pagePath}`;
  const score = JSON.parse((await stored(page, scoreKey))!);
  expect(score).toMatchObject({ answered: 2, total: 3, correct: 1, evaluated: 3 });
  expect(score.details.map((d: { verdict: string }) => d.verdict)).toEqual(['correct', 'wrong', 'unanswered']);
  expect(JSON.parse((await stored(page, `inferred:reveal:evidence:${pagePath}`))!)).toMatchObject({ marked: 1, total: 7 });
  const summary = page.locator('[data-case-summary]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('正确 1 / 3 题');
  await expect(summary).toContainText('标记了 1 / 7 条');
  const rows = summary.locator('.case-summary__row');
  await expect(rows).toHaveCount(2);
  for (const row of await rows.all()) {
    await expect(row).toHaveCSS('display', 'flex');
    await expect(row).toHaveCSS('justify-content', 'space-between');
  }
  await expect(summary.locator('[data-verdict="unanswered"]')).toContainText('未作答');
  await expect(summary.locator('[data-verdict="unanswered"]')).toHaveCSS('display', 'flex');
  await first.getByRole('button').first().click();
  expect(await stored(page, deductionKey)).toBe('{"0":2,"1":0}');
  await page.locator('[data-evidence-item]').first().click();
  await expect(page.locator('[data-evidence-item]').first()).toHaveAttribute('data-state', 'important');
  await page.getByRole('button', { name: '4 星', exact: true }).click();
  expect(await stored(page, `inferred:myrating:${path}`)).toBe('4');
  await expect(page.locator('[data-vote-thanks]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-reveal-answer]')).not.toHaveAttribute('open', '');
  await expect(summary).toContainText('正确 1 / 3 题');
  expect(JSON.parse((await stored(page, scoreKey))!)).toEqual(score);
  await expect(first.getByRole('button', { name: '沈默（别墅主人）' })).toHaveAttribute('data-locked', '');
  await expect(page.getByRole('button', { name: '4 星', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '5 星', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/weekly/');
  await page.goto('/cases/');
  await expect(page.locator(`[data-case-slug="${slug}"] [data-progress-badge]`)).toHaveText('已结案');
});

test('weekly SSR route links to a real playable case', async ({ page }) => {
  await page.goto('/weekly/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('每周一案，错过就要等下周');
  const card = page.locator('[data-case-slug]');
  const weeklySlug = await card.getAttribute('data-case-slug');
  await card.getByRole('link').click();
  await expect(page).toHaveURL(new RegExp(`/cases/${weeklySlug}/?$`));
  await expect(page.locator('[data-reveal-answer]')).toBeVisible();
  expect(await stored(page, `inferred:progress:/cases/${weeklySlug}`)).toBe('reading');
  await page.reload();
  expect(await stored(page, `inferred:progress:/cases/${weeklySlug}`)).toBe('reading');
});

test('malformed saved JSON falls back to empty interactive state', async ({ page }) => {
  await page.evaluate(({ evidenceKey, deductionKey }) => {
    localStorage.setItem(evidenceKey, '{broken');
    localStorage.setItem(deductionKey, '{broken');
  }, { evidenceKey, deductionKey });
  await page.reload();
  const item = page.locator('[data-evidence-item]').first();
  await expect(item).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-deduction-choice][aria-pressed="true"]')).toHaveCount(0);
  await item.click();
  await page.getByRole('group', { name: '第 1 题', exact: true }).getByRole('button').first().click();
  expect(Object.values(JSON.parse((await stored(page, evidenceKey))!))).toEqual(['important']);
  expect(await stored(page, deductionKey)).toBe('{"0":0}');
  await page.reload();
  await expect(item).toHaveAttribute('data-state', 'important');
  await expect(page.locator('[data-deduction-choice][aria-pressed="true"]')).toHaveCount(1);
});

test('legacy trailing-slash solved progress migrates before components initialize', async ({ page }) => {
  await page.evaluate(({ path, pagePath }) => {
    localStorage.setItem(`inferred:progress:${path}`, 'reading');
    localStorage.setItem(`inferred:progress:${pagePath}`, 'solved');
  }, { path, pagePath });
  await page.reload();
  expect(await stored(page, `inferred:progress:${path}`)).toBe('solved');
  expect(await stored(page, `inferred:progress:${pagePath}`)).toBeNull();
  await expect(page.locator('[data-diff-vote]')).toBeVisible();
  await expect(page.locator('[data-case-summary]')).toBeVisible();
  await expect(page.locator('[data-evidence-item]').first()).toHaveAttribute('data-locked', '');
  await page.reload();
  expect(await stored(page, `inferred:progress:${path}`)).toBe('solved');
});
