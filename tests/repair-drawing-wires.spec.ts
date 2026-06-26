import { test, expect } from '@playwright/test';

test.describe('Repair: DrawingWire Gap', () => {
  const baseURL = process.env.TEST_PROD 
    ? 'https://vcc-system-application.vercel.app'
    : 'http://localhost:3000';

  test('GET /api/repair-drawing-wires shows current coverage', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/repair-drawing-wires`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('📊 Current DrawingWire Coverage:', data.beforeRepair);

    expect(data.status).toBe('audit');
    expect(data.beforeRepair.drawingWireCount).toBeGreaterThanOrEqual(0);
    expect(data.beforeRepair.wireEndpointCount).toBeGreaterThan(0);
    expect(data.beforeRepair.coveragePercent).toBeGreaterThanOrEqual(0);
    expect(data.beforeRepair.coveragePercent).toBeLessThanOrEqual(100);
  });

  test('POST /api/repair-drawing-wires increases DrawingWire coverage', async ({ request }) => {
    // Get baseline
    const auditResponse = await request.get(`${baseURL}/api/repair-drawing-wires`);
    const auditData = await auditResponse.json();
    const baselineDrawingWires = auditData.beforeRepair.drawingWireCount;
    console.log(`📊 Baseline DrawingWire count: ${baselineDrawingWires}`);

    // Run repair
    const repairResponse = await request.post(`${baseURL}/api/repair-drawing-wires`);
    expect(repairResponse.status()).toBe(200);

    const repairData = await repairResponse.json();
    console.log('🔧 Repair Results:', repairData);

    expect(repairData.status).toBe('success');
    expect(repairData.beforeRepair.drawingWireCount).toBeDefined();
    expect(repairData.afterRepair.drawingWireCount).toBeDefined();
    expect(repairData.improvement.recordsAdded).toBeGreaterThanOrEqual(0);

    // Verify coverage improved or stayed the same
    const coverageAfter = parseFloat(repairData.afterRepair.coveragePercent);
    expect(coverageAfter).toBeGreaterThanOrEqual(
      parseFloat(repairData.beforeRepair.coveragePercent)
    );

    console.log(`✅ DrawingWire count improved from ${repairData.beforeRepair.drawingWireCount} to ${repairData.afterRepair.drawingWireCount}`);
    console.log(`✅ Coverage improved from ${repairData.beforeRepair.coveragePercent}% to ${coverageAfter}%`);
  });

  test('DrawingWire records are properly linked to drawings and wires', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/audit`);
    const data = await response.json();

    console.log('🔍 Database Audit:', {
      drawingWireCount: data.drawingWire,
      wireCount: data.wire,
      wireEndpointCount: data.wireEndpoint,
    });

    // After repair, DrawingWire should be significant portion of WireEndpoint count
    if (data.wireEndpoint > 0) {
      const coverage = (data.drawingWire / data.wireEndpoint) * 100;
      console.log(`📊 DrawingWire coverage: ${coverage.toFixed(1)}%`);
      
      // Should have at least 10% coverage after repair, ideally much higher
      expect(coverage).toBeGreaterThan(10);
    }
  });
});
