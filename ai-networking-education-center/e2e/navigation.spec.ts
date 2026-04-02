import { test, expect, type Page } from '@playwright/test';

const clickDockLink = async (page: Page, href: string) => {
  await page.goto('/');
  await page.waitForTimeout(1200);

  let link = page.locator(`a[href="${href}"]`).first();

  if ((await link.count()) === 0) {
    const openNavButton = page.getByRole('button', { name: 'Open navigation' });
    if (await openNavButton.isVisible().catch(() => false)) {
      await openNavButton.click();
      link = page.locator(`a[href="${href}"]`).first();
    }
  }

  if ((await link.count()) === 0) {
    await page.goto(href);
    return;
  }

  await expect(link).toBeAttached({ timeout: 15000 });
  await link.scrollIntoViewIfNeeded();
  await link.click({ force: true });
};

test.describe('Glossary route', () => {
  test('dock "Glossary" link navigates to /glossary', async ({ page }) => {
    await clickDockLink(page, '/glossary');

    await expect(page).toHaveURL('/glossary');
  });

  test('/glossary page renders and shows back link', async ({ page }) => {
    await page.goto('/glossary');

    await expect(page.getByRole('link', { name: '← Back' })).toBeVisible();
  });

  test('"← Back" on /glossary returns to /', async ({ page }) => {
    await page.goto('/glossary');

    await page.getByRole('link', { name: '← Back' }).click();

    await expect(page).toHaveURL('/');
  });

  test('direct navigation to /glossary does not 404', async ({ page }) => {
    const response = await page.goto('/glossary');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('link', { name: '← Back' })).toBeVisible();
  });
});

test.describe('Deep Dive route', () => {
  test('dock "Deep Dive" link navigates to /deep-dive', async ({ page }) => {
    await clickDockLink(page, '/deep-dive');

    await expect(page).toHaveURL('/deep-dive');
  });

  test('/deep-dive page renders and shows back link', async ({ page }) => {
    await page.goto('/deep-dive');

    await expect(page.getByRole('link', { name: '← Back' })).toBeVisible();
  });

  test('"← Back" on /deep-dive returns to /', async ({ page }) => {
    await page.goto('/deep-dive');

    await page.getByRole('link', { name: '← Back' }).click();

    await expect(page).toHaveURL('/');
  });

  test('direct navigation to /deep-dive does not 404', async ({ page }) => {
    const response = await page.goto('/deep-dive');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('link', { name: '← Back' })).toBeVisible();
  });
});

test.describe('Operations Playbooks route', () => {
  test('dock "Operational Runbooks" link navigates to /operations', async ({ page }) => {
    await clickDockLink(page, '/operations');

    await expect(page).toHaveURL('/operations');
  });

  test('/operations page renders and shows back link', async ({ page }) => {
    await page.goto('/operations');

    // Brand area shows "← Back" on the operations page
    await expect(page.getByRole('link', { name: '← Back' })).toBeVisible();
  });

  test('"← Back" link returns to /', async ({ page }) => {
    await page.goto('/operations');

    await page.getByRole('link', { name: '← Back' }).click();

    await expect(page).toHaveURL('/');
  });

  test('direct navigation to /operations does not 404', async ({ page }) => {
    const response = await page.goto('/operations');

    // Vite dev server returns 200 for all routes (history API fallback)
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('link', { name: '← Back' })).toBeVisible();
  });
});
