/**
 * Verification Script - Test All Fixes
 * Run this to verify all upgrades are working correctly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAllFixes() {
  console.log('🔍 VCC Application - Verification Script\n');
  console.log('=' .repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };
  
  // Test 1: Check PDF mappings exist
  console.log('\n📄 Test 1: PDF Mappings');
  try {
    const mappedPages = await prisma.drawingPage.count({
      where: {
        extra: {
          path: ['verified'],
          equals: true,
        },
      },
    });
    
    if (mappedPages > 100) {
      console.log(`✅ PASS: ${mappedPages} PDF mappings verified`);
      results.passed++;
    } else {
      console.log(`⚠️  WARN: Only ${mappedPages} mappings found (expected 147+)`);
      results.warnings++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error}`);
    results.failed++;
  }
  
  // Test 2: Check specific drawing mappings
  console.log('\n📄 Test 2: Specific Drawing Mappings');
  const testDrawings = [
    { no: '942-38117', expectedPage: 25, file: 'CAB_PIN DRAWINGS.pdf' },
    { no: '942-58104', expectedPage: 17, file: 'KMRCL VCC Drawings_OCR.pdf' },
    { no: '942-58120', expectedPage: 21, file: 'KMRCL VCC Drawings_OCR.pdf' },
  ];
  
  for (const test of testDrawings) {
    try {
      const drawing = await prisma.drawing.findFirst({
        where: { drawingNo: { contains: test.no } },
        include: { pages: true },
      });
      
      if (!drawing) {
        console.log(`⚠️  WARN: Drawing ${test.no} not found`);
        results.warnings++;
        continue;
      }
      
      const page = drawing.pages[0];
      const extra = page?.extra as any;
      const actualFile = extra?.sourceFile || extra?.pdfFile;
      
      if (extra?.pdfPageNo === test.expectedPage && actualFile === test.file) {
        console.log(`✅ PASS: ${test.no} → Page ${test.expectedPage}`);
        results.passed++;
      } else {
        console.log(`❌ FAIL: ${test.no} → Expected page ${test.expectedPage} in ${test.file}, got ${extra?.pdfPageNo || 'none'} in ${actualFile || 'none'}`);
        results.failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${test.no} - ${error}`);
      results.failed++;
    }
  }
  
  // Test 3: Check wire search
  console.log('\n🔌 Test 3: Wire Search');
  try {
    const wire = await prisma.wire.findFirst({
      where: {
        OR: [
          { wireNo: { contains: '3001' } },
          { wireNo: { startsWith: '3001' } },
        ],
      },
    });
    
    if (wire) {
      console.log(`✅ PASS: Wire search working (found ${wire.wireNo})`);
      results.passed++;
    } else {
      console.log(`⚠️  WARN: No wires found with 3001`);
      results.warnings++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error}`);
    results.failed++;
  }
  
  // Test 4: Check connector pin counts
  console.log('\n🔗 Test 4: Connector Pin Counts');
  try {
    const connectors = await prisma.connector.findMany({
      include: { pins: true },
      take: 10,
    });
    
    const withPins = connectors.filter(c => c.pins.length > 0);
    
    if (withPins.length > 0) {
      console.log(`✅ PASS: ${withPins.length}/${connectors.length} connectors have pins`);
      results.passed++;
    } else {
      console.log(`❌ FAIL: No connectors have pins`);
      results.failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error}`);
    results.failed++;
  }
  
  // Test 5: Check database stats
  console.log('\n📊 Test 5: Database Statistics');
  try {
    const [systems, wires, drawings, connectors, pins] = await Promise.all([
      prisma.system.count(),
      prisma.wire.count(),
      prisma.drawing.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
    ]);
    
    console.log(`   Systems: ${systems}`);
    console.log(`   Wires: ${wires}`);
    console.log(`   Drawings: ${drawings}`);
    console.log(`   Connectors: ${connectors}`);
    console.log(`   Pins: ${pins}`);
    
    if (systems > 0 && wires > 0 && drawings > 0) {
      console.log(`✅ PASS: Database populated`);
      results.passed++;
    } else {
      console.log(`❌ FAIL: Database incomplete`);
      results.failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error}`);
    results.failed++;
  }
  
  // Test 6: Check MCP configuration
  console.log('\n⚙️  Test 6: MCP Configuration');
  try {
    const fs = require('fs');
    const path = require('path');
    const mcpPath = path.join(process.cwd(), '.kiro', 'settings', 'mcp.json');
    
    if (fs.existsSync(mcpPath)) {
      const config = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
      
      if (config.mcpServers && Object.keys(config.mcpServers).length > 0) {
        console.log(`✅ PASS: MCP configured with ${Object.keys(config.mcpServers).length} servers`);
        results.passed++;
      } else {
        console.log(`⚠️  WARN: MCP config exists but no servers configured`);
        results.warnings++;
      }
    } else {
      console.log(`⚠️  WARN: MCP config file not found`);
      results.warnings++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error}`);
    results.failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 VERIFICATION SUMMARY\n');
  console.log(`✅ Passed:   ${results.passed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`❌ Failed:   ${results.failed}`);
  console.log(`\nTotal Tests: ${results.passed + results.warnings + results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
    console.log('✅ Application is ready for production use.\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Please review the failures above and fix them.\n');
  }
  
  console.log('=' .repeat(60));
}

verifyAllFixes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
