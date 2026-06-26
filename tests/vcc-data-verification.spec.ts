import { test, expect } from '@playwright/test';

// Production URL
const PROD_URL = 'https://vcc-system-application.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Detect if running against production or local
const baseURL = process.env.TEST_PROD ? PROD_URL : LOCAL_URL;

test.describe('VCC Data Verification Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable SSL verification warnings
    page.on('console', msg => {
      if (!msg.text().includes('SSL')) console.log(`Browser: ${msg.text()}`);
    });
  });

  // ─── Wire Harness Tests ───────────────────────────────────────────────────

  test('Wire Harness: Should load wires from database (not fallback)', async ({ page }) => {
    await page.goto(`${baseURL}/wires`);
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Check for wire count > fallback size (19)
    const wireCountText = await page.locator('text=/\\d+ wires loaded/').textContent();
    const match = wireCountText?.match(/(\d+) wires/);
    const count = match ? parseInt(match[1]) : 0;
    
    console.log(`📊 Wire page loaded: ${count} wires`);
    expect(count).toBeGreaterThan(19); // Should have more than fallback
  });

  test('Wire Harness: Search functionality returns results', async ({ page }) => {
    await page.goto(`${baseURL}/wires`);
    
    // Type into search
    const searchInput = page.locator('input[placeholder*="Search wires"]');
    await searchInput.fill('3001');
    
    // Wait for table to update
    await page.waitForTimeout(500);
    
    // Check if results are shown
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    console.log(`🔍 Wire search found ${rowCount} results for "3001"`);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Wire Harness: API returns correct wire count', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/wires?limit=100`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`📡 /api/wires response:`, {
      wiresCount: data.wires?.length || 0,
      totalCount: data.pagination?.total || 0,
      hasMore: data.pagination?.hasMore || false,
    });
    
    expect(data.wires).toBeDefined();
    expect(Array.isArray(data.wires)).toBe(true);
    expect(data.wires.length).toBeGreaterThan(0);
    expect(data.pagination.total).toBeGreaterThan(100000); // Should have 167K
  });

  // ─── Pin Diagram Tests ────────────────────────────────────────────────────

  test('Pin Diagram: Should load pins from database', async ({ page }) => {
    await page.goto(`${baseURL}/pins`);
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="pins-table"], table', { timeout: 10000 });
    
    // Check if pins are loaded
    const pinRows = page.locator('table tbody tr');
    const count = await pinRows.count();
    
    console.log(`📍 Pins page loaded: ${count} pins`);
    expect(count).toBeGreaterThan(0);
  });

  test('Pin Diagram: API returns pin data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/pins?limit=100`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`📡 /api/pins response:`, {
      pinsCount: data.pins?.length || 0,
    });
    
    expect(data.pins || data.data).toBeDefined();
  });

  // ─── Connector Tests ──────────────────────────────────────────────────────

  test('Connector: Should load connectors from database', async ({ page }) => {
    await page.goto(`${baseURL}/connectors`);
    
    // Wait for table or list
    await page.waitForSelector('table, [data-testid="connector-list"]', { timeout: 10000 });
    
    // Look for connector items
    const connectorItems = page.locator('table tbody tr, [data-testid="connector-item"]');
    const count = await connectorItems.count();
    
    console.log(`🔌 Connectors page loaded: ${count} connectors`);
    expect(count).toBeGreaterThan(0);
  });

  test('Connector: API returns connector data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/connectors?limit=100`);
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log(`📡 /api/connectors response:`, {
        connectorsCount: data.connectors?.length || data.data?.length || 0,
      });
      expect(data.connectors || data.data).toBeDefined();
    }
  });

  // ─── Equipment Tests ──────────────────────────────────────────────────────

  test('Equipment: Should load devices from database', async ({ page }) => {
    await page.goto(`${baseURL}/equipment`);
    
    // Wait for content
    await page.waitForSelector('table, [data-testid="equipment-list"]', { timeout: 10000 });
    
    const equipmentItems = page.locator('table tbody tr, [data-testid="equipment-item"]');
    const count = await equipmentItems.count();
    
    console.log(`🔧 Equipment page loaded: ${count} devices`);
    expect(count).toBeGreaterThan(0);
  });

  test('Equipment: API returns equipment data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/equipment?limit=100`);
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log(`📡 /api/equipment response:`, {
        equipmentCount: data.equipment?.length || data.data?.length || 0,
      });
      expect(data.equipment || data.data).toBeDefined();
    }
  });

  // ─── Trainline Tests ─────────────────────────────────────────────────────

  test('Trainline: Should load trainlines from database', async ({ page }) => {
    await page.goto(`${baseURL}/trainlines`);
    
    // Wait for content
    await page.waitForSelector('table, [data-testid="trainline-list"]', { timeout: 10000 });
    
    const trainlineItems = page.locator('table tbody tr, [data-testid="trainline-item"]');
    const count = await trainlineItems.count();
    
    console.log(`🚂 Trainlines page loaded: ${count} trainlines`);
    expect(count).toBeGreaterThan(0);
  });

  test('Trainline: API returns trainline data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/trainlines?limit=100`);
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log(`📡 /api/trainlines response:`, {
        trainlinesCount: data.trainlines?.length || data.data?.length || 0,
      });
      expect(data.trainlines || data.data).toBeDefined();
    }
  });

  // ─── Database Health Tests ────────────────────────────────────────────────

  test('Database: Health check endpoint shows connected', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`🏥 Database health:`, data);
    expect(data.status).toBe('connected');
  });

  test('Database: Audit endpoint shows real counts', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/audit`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`📊 Database audit:`, data);
    
    expect(data.wireCount).toBeGreaterThan(100000); // Should have 167K
    expect(data.connectorCount).toBeGreaterThan(1000);
    expect(data.drawingCount).toBeGreaterThan(500);
  });

  // ─── GSD Topology Tests ───────────────────────────────────────────────────

  test('GSD Topology: Page loads with expandable tree', async ({ page }) => {
    await page.goto(`${baseURL}/gsd/explore`);
    
    // Wait for tree to load
    await page.waitForSelector('[data-testid="tree-node"], .space-y-1', { timeout: 10000 });
    
    // Look for tree nodes
    const treeNodes = page.locator('[data-testid="tree-node"], button:has-text("Formation")');
    const count = await treeNodes.count();
    
    console.log(`🌳 GSD Topology loaded: ${count} tree nodes visible`);
    expect(count).toBeGreaterThan(0);
  });

  test('GSD Topology: Hierarchy API returns data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/twin/hierarchy?level=formation`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`📡 Hierarchy API:`, {
      success: data.success,
      formations: data.data?.length || 0,
    });
    
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  // ─── VCC Reference Tests ──────────────────────────────────────────────────

  test('VCC Reference: Page loads with system data', async ({ page }) => {
    await page.goto(`${baseURL}/vcc-reference`);
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="system-card"], .grid', { timeout: 10000 });
    
    // Check if systems are displayed
    const systemCards = page.locator('[data-testid="system-card"], [class*="card"]');
    const count = await systemCards.count();
    
    console.log(`📚 VCC Reference loaded: ${count} system cards`);
    expect(count).toBeGreaterThan(0);
  });

  test('VCC Reference: API returns system descriptions', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/vcc-descriptions`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`📡 VCC Descriptions API:`, {
      descriptions: data.data?.length || data.descriptions?.length || 0,
    });
    
    expect(data.data || data.descriptions).toBeDefined();
  });

  // ─── Integration Tests ────────────────────────────────────────────────────

  test('Integration: Search finds wires across all resources', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/search?q=3001&type=all`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`🔍 Unified search for "3001":`, {
      wires: data.wires?.length || 0,
      connectors: data.connectors?.length || 0,
      drawings: data.drawings?.length || 0,
      trainlines: data.trainlines?.length || 0,
    });
    
    const totalResults = (data.wires?.length || 0) + 
                        (data.connectors?.length || 0) + 
                        (data.drawings?.length || 0) + 
                        (data.trainlines?.length || 0);
    
    expect(totalResults).toBeGreaterThan(0);
  });

  test('Integration: Wire trace shows all connections', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/search?wire=3001`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log(`🔗 Wire trace for 3001:`, {
      pinConnections: data.pinConnections?.length || 0,
      trainlineEntries: data.trainlineEntries?.length || 0,
      totalDrawings: data.locations?.length || 0,
    });
    
    expect(data.pinConnections || data.metadata).toBeDefined();
  });
});
