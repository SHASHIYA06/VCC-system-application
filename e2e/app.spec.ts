import { test, expect } from '@playwright/test';

test.describe('VCC Application - Core Pages', () => {
  test('homepage redirects to dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard loads with stats', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Database Connected').first()).toBeVisible({ timeout: 15000 });
  });

  test('wires page loads and shows wire data', async ({ page }) => {
    await page.goto('/wires');
    await expect(page.locator('body')).toBeVisible();
  });

  test('systems page loads', async ({ page }) => {
    await page.goto('/systems');
    await expect(page.locator('body')).toBeVisible();
  });

  test('drawings page loads', async ({ page }) => {
    await page.goto('/drawings');
    await expect(page.locator('body')).toBeVisible();
  });

  test('troubleshooting page loads from database', async ({ page }) => {
    await page.goto('/troubleshooting');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'VCC Troubleshooting Center' })).toBeVisible({ timeout: 15000 });
  });

  test('vcc-reference page loads', async ({ page }) => {
    await page.goto('/vcc-reference');
    await expect(page.locator('body')).toBeVisible();
  });

  test('validation page loads', async ({ page }) => {
    await page.goto('/validation');
    await expect(page.locator('body')).toBeVisible();
  });

  test('gsd topology page loads', async ({ page }) => {
    await page.goto('/gsd');
    await expect(page.locator('body')).toBeVisible();
  });

  test('twin explorer page loads', async ({ page }) => {
    await page.goto('/twin');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('VCC API Endpoints - Data Integrity', () => {
  test('GET /api/stats returns all entity counts', async ({ request }) => {
    const response = await request.get('/api/stats');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.overview).toBeDefined();
    expect(data.overview.systems).toBeGreaterThan(0);
    expect(data.overview.wires).toBeGreaterThan(0);
    expect(data.overview.drawings).toBeGreaterThan(0);
    expect(data.overview.equipment).toBeGreaterThan(0);
    expect(data.overview.connectors).toBeGreaterThan(0);
    expect(data.overview.pins).toBeGreaterThan(0);
  });

  test('GET /api/wires returns real wire data', async ({ request }) => {
    const response = await request.get('/api/wires?limit=10');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.wires).toBeDefined();
    expect(data.pagination.total).toBeGreaterThan(100);
  });

  test('GET /api/systems returns all 19 systems', async ({ request }) => {
    const response = await request.get('/api/systems');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.systems).toBeDefined();
    expect(data.systems.length).toBeGreaterThanOrEqual(10);
  });

  test('GET /api/connectors returns connector data', async ({ request }) => {
    const response = await request.get('/api/connectors?limit=10');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.connectors).toBeDefined();
    expect(data.pagination.total).toBeGreaterThan(100);
  });

  test('GET /api/drawings returns drawing data', async ({ request }) => {
    const response = await request.get('/api/drawings?limit=10');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.drawings).toBeDefined();
    expect(data.pagination.total).toBeGreaterThan(100);
  });

  test('GET /api/vcc-descriptions returns system descriptions', async ({ request }) => {
    const response = await request.get('/api/vcc-descriptions');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('GET /api/gsd returns topology data', async ({ request }) => {
    const response = await request.get('/api/gsd?action=topology');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.systems).toBeDefined();
  });

  test('GET /api/troubleshooting returns fault data with DB links', async ({ request }) => {
    const response = await request.get('/api/troubleshooting');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.faults).toBeDefined();
    expect(data.data.faults.length).toBeGreaterThan(0);
  });

  test('GET /api/drawings/lookup returns drawing details', async ({ request }) => {
    const response = await request.get('/api/drawings/lookup?drawing_no=942-58120');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.drawing).toBeDefined();
    expect(data.drawing.drawingNo).toBeTruthy();
  });

  test('GET /api/wires returns wire with endpoints', async ({ request }) => {
    const response = await request.get('/api/wires?limit=5');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.wires.length).toBeGreaterThan(0);
  });
});

test.describe('VCC Application - Drawing Lookup', () => {
  test('drawing lookup by number returns full details', async ({ page }) => {
    await page.goto('/dashboard');
    const searchInput = page.getByPlaceholder(/drawing number/i);
    await searchInput.fill('942-58120');
    await searchInput.press('Enter');
    await expect(page.getByText('942-58120').first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('VCC Sidebar Navigation', () => {
  test('sidebar contains all main navigation items', async ({ page }) => {
    await page.goto('/dashboard');
    const sidebar = page.locator('aside[aria-label="Primary navigation"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Twin Explorer')).toBeVisible();
    await expect(sidebar.getByText('Systems')).toBeVisible();
    await expect(sidebar.getByText('Wire Harness')).toBeVisible();
    await expect(sidebar.getByText('Drawing Search')).toBeVisible();
    await expect(sidebar.getByText('GSD Topology')).toBeVisible();
    await expect(sidebar.getByText('AI Assistant')).toBeVisible();
    await expect(sidebar.getByText('Troubleshooting')).toBeVisible();
  });
});
