import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('shell loads, navigates by keyboard and has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Operations overview' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

  await page.getByRole('navigation').getByRole('link', { name: 'Monitoring & Alerts' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Monitoring & Alerts' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious).toEqual([]);
});
