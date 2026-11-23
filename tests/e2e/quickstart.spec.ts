import { expect, test } from '@playwright/test';

test('homepage only shows the resume card after starting a case', async ({ page }) => {
  const casePath = '/cases/the-storm-villa';
  const progressKey = `inferred:progress:${casePath}`;
  await page.goto('/');
  const resume = page.locator('[data-qs-resume]');
  await expect(resume).toBeHidden();

  await page.goto(`${casePath}/`);
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), progressKey))
    .toBe('reading');
  await page.goto('/');
  await expect(resume).toBeVisible();
  await expect(resume.locator('[data-qs-resume-title]')).toHaveText('暴风雨之夜的第七位客人');
  await expect(resume).toHaveAttribute('href', `${casePath}/`);
});
