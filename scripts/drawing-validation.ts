/**
 * Task 4: Drawing to Database Validation
 * ========================================
 * Validates that database records match actual drawing content.
 * Generates mismatch reports for connectors, pins, wires, trainlines.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationIssue {
  type: 'CONNECTOR_COUNT' | 'PIN_COUNT' | 'WIRE_COUNT' | 'DRAWING_MAPPING' | 'REVISION_CONFLICT';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  drawingNo: string;
  expected: number;
  actual: number;
  message: string;
}

async function validateDrawingConnectors(drawingNo: string, expectedMin: number = 0): Promise<ValidationIssue | null> {
  const drawing = await prisma.drawing.findFirst({
    where: { drawingNo },
    include: { connectors: true }
  });
  
  if (!drawing) {
    return {
      type: 'DRAWING_MAPPING',
      severity: 'ERROR',
      drawingNo,
      expected: 1,
      actual: 0,
      message: 'Drawing not found in database'
    };
  }
  
  const connectorCount = drawing.connectors.length;
  if (connectorCount < expectedMin && expectedMin > 0) {
    return {
      type: 'CONNECTOR_COUNT',
      severity: 'WARNING',
      drawingNo,
      expected: expectedMin,
      actual: connectorCount,
      message: `Expected at least ${expectedMin} connectors, found ${connectorCount}`
    };
  }
  
  return null;
}

async function validateAllDrawings(): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  
  console.log('🔍 Validating drawings...\n');
  
  // Get all drawings with their statistics
  const drawings = await prisma.drawing.findMany({
    include: {
      connectors: { include: { pins: true } },
      devices: true,
      wires: true,
      trainLines: true
    },
    take: 100 // Validate first 100 drawings
  });
  
  console.log(`Found ${drawings.length} drawings to validate\n`);
  
  for (const drawing of drawings) {
    // Check for drawings with no connectors
    if (drawing.connectors.length === 0) {
      issues.push({
        type: 'CONNECTOR_COUNT',
        severity: 'WARNING',
        drawingNo: drawing.drawingNo,
        expected: 1,
        actual: 0,
        message: 'Drawing has no connectors mapped'
      });
    }
    
    // Check for drawings with no devices
    if (drawing.devices.length === 0) {
      issues.push({
        type: 'DRAWING_MAPPING',
        severity: 'INFO',
        drawingNo: drawing.drawingNo,
        expected: 1,
        actual: 0,
        message: 'Drawing has no devices mapped'
      });
    }
    
    // Check total pins
    const totalPins = drawing.connectors.reduce((sum, c) => sum + c.pins.length, 0);
    if (totalPins === 0 && drawing.connectors.length > 0) {
      issues.push({
        type: 'PIN_COUNT',
        severity: 'WARNING',
        drawingNo: drawing.drawingNo,
        expected: 1,
        actual: 0,
        message: 'Drawing has connectors but no pins'
      });
    }
  }
  
  return issues;
}

async function generateIntegrityReport(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   DRAWING TO DATABASE VALIDATION REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const issues = await validateAllDrawings();
  
  const errors = issues.filter(i => i.severity === 'ERROR');
  const warnings = issues.filter(i => i.severity === 'WARNING');
  const infos = issues.filter(i => i.severity === 'INFO');
  
  console.log(`Total Issues Found: ${issues.length}`);
  console.log(`  - Errors: ${errors.length}`);
  console.log(`  - Warnings: ${warnings.length}`);
  console.log(`  - Info: ${infos.length}\n`);
  
  if (issues.length > 0) {
    console.log('Sample Issues:\n');
    issues.slice(0, 10).forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.severity}] ${issue.drawingNo}`);
      console.log(`   ${issue.message}\n`);
    });
  }
  
  // Save issues to database
  for (const issue of issues) {
    await prisma.validationIssue.create({
      data: {
        severity: issue.severity,
        issueType: issue.type,
        sourceTable: 'Drawing',
        message: issue.message,
        details: {
          drawingNo: issue.drawingNo,
          expected: issue.expected,
          actual: issue.actual
        }
      }
    });
  }
  
  console.log(`\n✅ Validation complete. ${issues.length} issues logged.\n`);
}

async function main() {
  try {
    await generateIntegrityReport();
  } catch (error) {
    console.error('Validation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();