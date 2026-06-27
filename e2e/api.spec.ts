import { test, expect } from '@playwright/test';

test.describe('VCC API Endpoints', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

  test('GET /api/wires should return real data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/wires?limit=1`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('pagination');
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination.total).toBeGreaterThan(100); // Should be 167K+
  });

  test('GET /api/pins should return connector pin data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/pins?limit=1`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('pagination');
    expect(data.pagination.total).toBeGreaterThan(50000);
  });

  test('GET /api/connectors should return electrical connectors', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/connectors?limit=1`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('pagination');
  });

  test('GET /api/master-audit should return health metrics', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/master-audit`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('health_score');
  });
});
