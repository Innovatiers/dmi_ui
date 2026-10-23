import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { installFakeAdminApi } from './fakeAdminApi';

/**
 * Administration scenarios of story 12, against the development server (the role switcher exists only in a
 * development build). Without `E2E_API` the API is a stand-in (`fakeAdminApi.ts`); with `E2E_API=compose` the
 * requests go through the Vite proxy to the compose stack (story 06) with the demo seed (story 08).
 */
const againstCompose = process.env.E2E_API === 'compose';

async function signInAs(page: Page, subject: string) {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Development identity' }).selectOption(subject);
}

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  if (!againstCompose) {
    await installFakeAdminApi(page);
  }
});

test('an administrator changes the role of a member', async ({ page }) => {
  await signInAs(page, 'admin-a');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Administration' }).click();
  await page.getByRole('link', { name: 'Members and roles' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Members and roles' })).toBeVisible();

  const changeRole = async (from: string, to: string) => {
    await page.getByRole('button', { name: 'Manage manager-a' }).click();
    await expect(page.getByText(`Role: ${from}.`)).toBeVisible();
    await page.getByRole('combobox', { name: 'New role' }).selectOption({ label: to });
    await page.getByRole('button', { name: 'Change role' }).click();
    await expect(page.getByText('The role was changed.')).toBeVisible();
    await expect(page.getByRole('row', { name: /manager-a/ })).toContainText(to);
  };

  await changeRole('Manager / approver', 'Analyst');
  await expectNoSeriousViolations(page);
  // Restore the seed, so the scenario can run again against the same stack.
  await changeRole('Analyst', 'Manager / approver');
});

test('an operator sees no administration menu and gets a refusal at a direct address', async ({ page }) => {
  await signInAs(page, 'operator-a');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav.getByRole('link', { name: 'Monitoring & Alerts' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Administration' })).toHaveCount(0);

  await page.goto('/administration/memberships');

  const refusal = page.getByRole('alert');
  await expect(refusal).toContainText('Only administrators of this tenant can manage members.');
  await expect(refusal).toContainText('Reference:');
  await expect(page.getByRole('table')).toHaveCount(0);
  await expectNoSeriousViolations(page);
});

test('an auditor exports the audit trail', async ({ page }) => {
  await signInAs(page, 'auditor-a');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Administration' }).click();
  await page.getByRole('link', { name: 'Audit trail' }).click();
  await expect(page.getByRole('table', { name: 'Audit events' })).toBeVisible();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export as CSV' }).click();

  expect((await download).suggestedFilename()).toMatch(/^audit-events-\d{8}T\d{6}Z\.csv$/);
  await expect(page.getByText('The CSV export was downloaded.')).toBeVisible();
  await expectNoSeriousViolations(page);
});
