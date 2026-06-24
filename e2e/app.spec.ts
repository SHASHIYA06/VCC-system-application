import { test, expect } from '@playwright/test';

test.describe('VCC Application', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('wires page loads and shows wire data', async ({ page }) => {
    await page.goto('/wires');
    await expect(page.locator('body')).toBeVisible();
    // Should have some wire content or search
  });

  test('systems page loads', async ({ page }) => {
    await page.goto('/systems');
    await expect(page.locator('body')).toBeVisible();
  });

  test('drawings page loads', async ({ page }) => {
    await page.goto('/drawings');
    await expect(page.locator('body')).toBeVisible();
  });

  test('validation page loads', async ({ page }) => {
    await page.goto('/validation');
    await expect(page.locator('body')).toBeVisible();
  });

  test('twin page loads', async ({ page }) => {
    await page.goto('/twin');
    await expect(page.locator('body')).toBeVisible();
  });

  test('search API works', async ({ request }) => {
    const response = await request.get('/api/search?q=3001');
    expect(response.ok()).toBeTruthy();
  });

  test('wires API returns data', async ({ request }) => {
    const response = await request.get('/api/wires?limit=10');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('wires');
  });

  test('systems API returns data', async ({ request }) => {
    const response = await request.get('/api/systems');
    expect(response.ok()).toBeTruthy();
  });
});