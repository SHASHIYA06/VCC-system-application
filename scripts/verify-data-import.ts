#!/usr/bin/env tsx
/**
 * VCC Data Import Verification Script
 * 
 * This script verifies the completeness and accuracy of data imported into the VCC database.
 * It checks for:
 * 1. Drawings with alphabetic suffixes
 * 2. Wires with alphabetic patterns
 * 3. Data completeness for specific drawings
 * 4. Relationship integrity between entities
 * 5. Missing or orphaned records
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResults {
  totalDrawings: number;
  drawingsWithAlphabeticSuffixes: number;
  totalWires: number;
  wiresWithAlphabeticPatterns: number;
  totalConnectors: number;
  totalPins: number;
  totalWireEndpoints: number;
  wireEndpointsLinkedToPins: number;
  drawingsWithConnectors: number;
  drawingsWithWires: number;
  drawingsWithDevices: number;
  drawingsWithTrainlines: number;
  orphanedWireEndpoints: number;
  orphanedPins: number;
  missingConnectorTypes: number;
  issues: string[];
}

const results: VerificationResults = {
  totalDrawings: 0,
  drawingsWithAlphabeticSuffixes: 0,
  totalWires: 0,
  wiresWithAlphabeticPatterns: 0,
  totalConnectors: 0,
  totalPins: 0,
  totalWireEndpoints: 0,
  wireEndpointsLinkedToPins: 0,
  drawingsWithConnectors: 0,
  drawingsWithWires: 0,
  drawingsWithDevices: 0,
  drawingsWithTrainlines: 0,
  orphanedWireEndpoints: 0,
  orphanedPins: 0,
  missingConnectorTypes: 0,
  issues: [],
};

async function main() {
  console.log('🔍 VCC Data Import Verification Script\n');
  console.log('=' .repeat(70));
  console.log('Verifying data completeness and integrity...\n');

  await verifyBasicCounts();
  await verifyAlphabeticVariants();
  await verifyRelationships();
  await verifySpecificDrawings();
  await verifyConnectorTypes();
  await verifyDataIntegrity();

  printResults();
}

async function verifyBasicCounts() {
  console.log('📊 Step 1: Verifying Basic Counts...\n');

  results.totalDrawings = await prisma.drawing.count();
  results.totalWires = await prisma.wire.count();
  results.totalConnectors = await prisma.connector.count();
  results.totalPins = await prisma.connectorPin.count();
  results.totalWireEndpoints = await prisma.wireEndpoint.count();

  results.drawingsWithConnectors = await prisma.drawing.count({
    where: { connectors: { some: {} } }
  });

  results.drawingsWithDevices = await prisma.drawing.count({
    where: { devices: { some: {} } }
  });

  results.drawingsWithTrainlines = await prisma.drawing.count({
    where: { trainLines: { some: {} } }
  });

  results.wireEndpointsLinkedToPins = await prisma.wireEndpoint.count({
    where: { pinId: { not: null } }
  });

  console.log(`✓ Total Drawings: ${results.totalDrawings}`);
  console.log(`✓ Total Wires: ${results.totalWires}`);
  console.log(`✓ Total Connectors: ${results.totalConnectors}`);
  console.log(`✓ Total Pins: ${results.totalPins}`);
  console.log(`✓ Total Wire Endpoints: ${results.totalWireEndpoints}`);
  console.log(`✓ Drawings with Connectors: ${results.drawingsWithConnectors} (${((results.drawingsWithConnectors/results.totalDrawings)*100).toFixed(1)}%)`);
  console.log(`✓ Drawings with Devices: ${results.drawingsWithDevices} (${((results.drawingsWithDevices/results.totalDrawings)*100).toFixed(1)}%)`);
  console.log(`✓ Drawings with Trainlines: ${results.drawingsWithTrainlines} (${((results.drawingsWithTrainlines/results.totalDrawings)*100).toFixed(1)}%)`);
  console.log(`✓ Wire Endpoints Linked to Pins: ${results.wireEndpointsLinkedToPins} (${((results.wireEndpointsLinkedToPins/results.totalWireEndpoints)*100).toFixed(1)}%)`);
}

async function verifyAlphabeticVariants() {
  console.log('\n📝 Step 2: Verifying Alphabetic Variants...\n');

  // Check for drawings with alphabetic suffixes (e.g., 942-58128D)
  const drawingsWithSuffixes = await prisma.drawing.findMany({
    where: {
      drawingNo: { contains: '-' }
    },
    select: { drawingNo: true, title: true }
  });

  // Filter for those ending with letters
  const alphabeticDrawings = drawingsWithSuffixes.filter(d => 
    /[A-Z]$/i.test(d.drawingNo)
  );

  results.drawingsWithAlphabeticSuffixes = alphabeticDrawings.length;

  if (alphabeticDrawings.length > 0) {
    console.log(`✓ Found ${alphabeticDrawings.length} drawings with alphabetic suffixes:`);
    alphabeticDrawings.slice(0, 10).forEach(d => {
      console.log(`   - ${d.drawingNo}: ${d.title}`);
    });
    if (alphabeticDrawings.length > 10) {
      console.log(`   ... and ${alphabeticDrawings.length - 10} more`);
    }
  } else {
    console.log('⚠ No drawings with alphabetic suffixes found');
    results.issues.push('No drawings with alphabetic suffixes found (e.g., 942-58128D)');
  }

  // Check for wires with alphabetic patterns (e.g., Y4181a, Y4184)
  const wiresWithPatterns = await prisma.wire.findMany({
    where: {
      OR: [
        { wireNo: { contains: 'Y4' } },
        { wireNo: { contains: 'W4' } },
        { wireNo: { contains: 'X4' } },
        { wireNo: { contains: 'Z4' } },
      ]
    },
    select: { wireNo: true, signalName: true }
  });

  results.wiresWithAlphabeticPatterns = wiresWithPatterns.length;

  if (wiresWithPatterns.length > 0) {
    console.log(`\n✓ Found ${wiresWithPatterns.length} wires with alphabetic patterns:`);
    wiresWithPatterns.slice(0, 10).forEach(w => {
      console.log(`   - ${w.wireNo}: ${w.signalName || 'N/A'}`);
    });
    if (wiresWithPatterns.length > 10) {
      console.log(`   ... and ${wiresWithPatterns.length - 10} more`);
    }
  } else {
    console.log('⚠ No wires with alphabetic patterns found');
    results.issues.push('No wires with alphabetic patterns found (e.g., Y4181a, Y4184)');
  }
}

async function verifyRelationships() {
  console.log('\n🔗 Step 3: Verifying Data Relationships...\n');

  // Check for orphaned wire endpoints (no wire, device, connector, or pin)
  const orphanedEndpoints = await prisma.wireEndpoint.count({
    where: {
      AND: [
        { deviceId: null },
        { connectorId: null },
        { pinId: null }
      ]
    }
  });

  results.orphanedWireEndpoints = orphanedEndpoints;

  if (orphanedEndpoints > 0) {
    console.log(`⚠ Found ${orphanedEndpoints} orphaned wire endpoints (not linked to device, connector, or pin)`);
    results.issues.push(`${orphanedEndpoints} orphaned wire endpoints found`);
  } else {
    console.log('✓ No orphaned wire endpoints found');
  }

  // Check for pins without wires
  const pinsWithoutWires = await prisma.connectorPin.count({
    where: { wireNo: null }
  });

  results.orphanedPins = pinsWithoutWires;

  if (pinsWithoutWires > 0) {
    console.log(`⚠ Found ${pinsWithoutWires} pins without wire numbers (${((pinsWithoutWires/results.totalPins)*100).toFixed(1)}%)`);
    results.issues.push(`${pinsWithoutWires} pins without wire numbers`);
  } else {
    console.log('✓ All pins have wire numbers');
  }

  // Check for connectors without pins
  const connectorsWithoutPins = await prisma.connector.count({
    where: { pins: { none: {} } }
  });

  if (connectorsWithoutPins > 0) {
    console.log(`⚠ Found ${connectorsWithoutPins} connectors without pins`);
    results.issues.push(`${connectorsWithoutPins} connectors without pins`);
  } else {
    console.log('✓ All connectors have pins');
  }

  // Check for drawings without any related data
  const emptyDrawings = await prisma.drawing.count({
    where: {
      AND: [
        { connectors: { none: {} } },
        { devices: { none: {} } },
        { trainLines: { none: {} } },
        { circuits: { none: {} } }
      ]
    }
  });

  if (emptyDrawings > 0) {
    console.log(`⚠ Found ${emptyDrawings} drawings without any related data (${((emptyDrawings/results.totalDrawings)*100).toFixed(1)}%)`);
    results.issues.push(`${emptyDrawings} drawings without any related data`);
  } else {
    console.log('✓ All drawings have related data');
  }
}

async function verifySpecificDrawings() {
  console.log('\n🔍 Step 4: Verifying Specific Drawings...\n');

  // Check drawing 942-38402 (mentioned in the issue)
  const drawing38402 = await prisma.drawing.findFirst({
    where: { drawingNo: { contains: '38402' } },
    include: {
      _count: {
        select: { 
          connectors: true, 
          devices: true, 
          trainLines: true,
          circuits: true 
        }
      }
    }
  });

  if (drawing38402) {
    console.log(`✓ Drawing 942-38402 found:`);
    console.log(`   Title: ${drawing38402.title}`);
    console.log(`   Connectors: ${drawing38402._count.connectors}`);
    console.log(`   Devices: ${drawing38402._count.devices}`);
    console.log(`   Trainlines: ${drawing38402._count.trainLines}`);
    console.log(`   Circuits: ${drawing38402._count.circuits}`);

    if (drawing38402._count.connectors === 0) {
      results.issues.push('Drawing 942-38402 has no connectors');
    }
    if (drawing38402._count.devices === 0) {
      results.issues.push('Drawing 942-38402 has no devices');
    }
  } else {
    console.log('⚠ Drawing 942-38402 not found');
    results.issues.push('Drawing 942-38402 not found in database');
  }

  // Check drawing 942-58128D (mentioned in the issue)
  const drawing58128D = await prisma.drawing.findFirst({
    where: { 
      OR: [
        { drawingNo: { contains: '58128D' } },
        { drawingNo: { contains: '58128' } }
      ]
    },
    include: {
      _count: {
        select: { 
          connectors: true, 
          devices: true, 
          trainLines: true 
        }
      }
    }
  });

  if (drawing58128D) {
    console.log(`\n✓ Drawing 942-58128D found:`);
    console.log(`   Drawing No: ${drawing58128D.drawingNo}`);
    console.log(`   Title: ${drawing58128D.title}`);
    console.log(`   Connectors: ${drawing58128D._count.connectors}`);
    console.log(`   Devices: ${drawing58128D._count.devices}`);
    console.log(`   Trainlines: ${drawing58128D._count.trainLines}`);
  } else {
    console.log('\n⚠ Drawing 942-58128D not found');
    results.issues.push('Drawing 942-58128D not found in database');
  }

  // Check for wires Y4181a and Y4184
  const wireY4181a = await prisma.wire.findFirst({
    where: { wireNo: { contains: 'Y4181' } }
  });

  const wireY4184 = await prisma.wire.findFirst({
    where: { wireNo: { contains: 'Y4184' } }
  });

  if (wireY4181a) {
    console.log(`\n✓ Wire Y4181a found: ${wireY4181a.wireNo}`);
  } else {
    console.log('\n⚠ Wire Y4181a not found');
    results.issues.push('Wire Y4181a not found in database');
  }

  if (wireY4184) {
    console.log(`✓ Wire Y4184 found: ${wireY4184.wireNo}`);
  } else {
    console.log('⚠ Wire Y4184 not found');
    results.issues.push('Wire Y4184 not found in database');
  }
}

async function verifyConnectorTypes() {
  console.log('\n🔌 Step 5: Verifying Connector Types...\n');

  const connectorTypes = await prisma.connectorType.findMany({
    select: { code: true, description: true, nominalPins: true }
  });

  console.log(`✓ Found ${connectorTypes.length} connector types:`);
  connectorTypes.forEach(ct => {
    console.log(`   - ${ct.code}: ${ct.description} (${ct.nominalPins || 'N/A'} pins)`);
  });

  // Check for connectors with missing types
  const connectorsWithMissingTypes = await prisma.connector.count({
    where: {
      connectorTypeCode: { not: null },
      connectorType: null
    }
  });

  results.missingConnectorTypes = connectorsWithMissingTypes;

  if (connectorsWithMissingTypes > 0) {
    console.log(`\n⚠ Found ${connectorsWithMissingTypes} connectors referencing non-existent connector types`);
    results.issues.push(`${connectorsWithMissingTypes} connectors with missing connector types`);

    // Get the missing types
    const missingTypes = await prisma.connector.findMany({
      where: {
        connectorTypeCode: { not: null },
        connectorType: null
      },
      select: { connectorTypeCode: true },
      distinct: ['connectorTypeCode']
    });

    console.log('   Missing connector types:');
    missingTypes.forEach(mt => {
      console.log(`   - ${mt.connectorTypeCode}`);
    });
  } else {
    console.log('\n✓ All connectors have valid connector types');
  }
}

async function verifyDataIntegrity() {
  console.log('\n🔒 Step 6: Verifying Data Integrity...\n');

  // Check for wire endpoints with invalid references
  const invalidWireEndpoints = await prisma.wireEndpoint.findMany({
    where: {
      OR: [
        { 
          deviceId: { not: null },
          device: null 
        },
        { 
          connectorId: { not: null },
          connector: null 
        },
        { 
          pinId: { not: null },
          pin: null 
        }
      ]
    }
  });

  if (invalidWireEndpoints.length > 0) {
    console.log(`⚠ Found ${invalidWireEndpoints.length} wire endpoints with invalid references`);
    results.issues.push(`${invalidWireEndpoints.length} wire endpoints with invalid references`);
  } else {
    console.log('✓ All wire endpoints have valid references');
  }

  // Check for duplicate drawing numbers
  const duplicateDrawings = await prisma.$queryRaw<Array<{ drawingNo: string; count: bigint }>>`
    SELECT "drawingNo", COUNT(*) as count
    FROM "Drawing"
    GROUP BY "drawingNo"
    HAVING COUNT(*) > 1
  `;

  if (duplicateDrawings.length > 0) {
    console.log(`⚠ Found ${duplicateDrawings.length} duplicate drawing numbers:`);
    duplicateDrawings.forEach(d => {
      console.log(`   - ${d.drawingNo}: ${d.count} occurrences`);
    });
    results.issues.push(`${duplicateDrawings.length} duplicate drawing numbers found`);
  } else {
    console.log('✓ No duplicate drawing numbers found');
  }

  // Check for duplicate wire numbers
  const duplicateWires = await prisma.$queryRaw<Array<{ wireNo: string; count: bigint }>>`
    SELECT "wireNo", COUNT(*) as count
    FROM "Wire"
    GROUP BY "wireNo"
    HAVING COUNT(*) > 1
  `;

  if (duplicateWires.length > 0) {
    console.log(`⚠ Found ${duplicateWires.length} duplicate wire numbers:`);
    duplicateWires.slice(0, 5).forEach(w => {
      console.log(`   - ${w.wireNo}: ${w.count} occurrences`);
    });
    if (duplicateWires.length > 5) {
      console.log(`   ... and ${duplicateWires.length - 5} more`);
    }
    results.issues.push(`${duplicateWires.length} duplicate wire numbers found`);
  } else {
    console.log('✓ No duplicate wire numbers found');
  }
}

function printResults() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  console.log('\n📈 Statistics:');
  console.log(`   Total Drawings: ${results.totalDrawings}`);
  console.log(`   Drawings with Alphabetic Suffixes: ${results.drawingsWithAlphabeticSuffixes}`);
  console.log(`   Total Wires: ${results.totalWires}`);
  console.log(`   Wires with Alphabetic Patterns: ${results.wiresWithAlphabeticPatterns}`);
  console.log(`   Total Connectors: ${results.totalConnectors}`);
  console.log(`   Total Pins: ${results.totalPins}`);
  console.log(`   Total Wire Endpoints: ${results.totalWireEndpoints}`);
  console.log(`   Wire Endpoints Linked to Pins: ${results.wireEndpointsLinkedToPins} (${((results.wireEndpointsLinkedToPins/results.totalWireEndpoints)*100).toFixed(1)}%)`);
  console.log(`   Drawings with Connectors: ${results.drawingsWithConnectors} (${((results.drawingsWithConnectors/results.totalDrawings)*100).toFixed(1)}%)`);
  console.log(`   Drawings with Devices: ${results.drawingsWithDevices} (${((results.drawingsWithDevices/results.totalDrawings)*100).toFixed(1)}%)`);
  console.log(`   Drawings with Trainlines: ${results.drawingsWithTrainlines} (${((results.drawingsWithTrainlines/results.totalDrawings)*100).toFixed(1)}%)`);

  console.log('\n⚠️  Issues Found:');
  if (results.issues.length === 0) {
    console.log('   ✓ No issues found! Data import is complete and accurate.');
  } else {
    results.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Verification complete!');
  console.log('\nNext steps:');
  if (results.issues.length > 0) {
    console.log('1. Review the issues listed above');
    console.log('2. Run the sync script to fix relationship issues: npx tsx scripts/sync-drawing-data.ts');
    console.log('3. Re-run this verification script to confirm fixes');
  } else {
    console.log('1. Data import is complete and accurate');
    console.log('2. Proceed with testing the application');
  }
}

main()
  .catch((error) => {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
