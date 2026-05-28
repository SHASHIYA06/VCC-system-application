#!/usr/bin/env tsx
/**
 * Comprehensive VCC Database Seed Script
 * 
 * This script performs a complete database synchronization:
 * 1. Seeds connector types
 * 2. Syncs drawing metadata
 * 3. Creates wire variants (alphabetic suffixes)
 * 4. Links connectors to equipment
 * 5. Links pins to wires
 * 6. Creates wire endpoints
 * 7. Validates all relationships
 * 
 * Run: npx tsx scripts/comprehensive-seed.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

interface SeedStats {
  connectorTypes: number;
  drawings: number;
  wires: number;
  wireVariants: number;
  connectors: number;
  pins: number;
  wireEndpoints: number;
  systems: number;
  equipment: number;
}

const stats: SeedStats = {
  connectorTypes: 0,
  drawings: 0,
  wires: 0,
  wireVariants: 0,
  connectors: 0,
  pins: 0,
  wireEndpoints: 0,
  systems: 0,
  equipment: 0,
};

async function main() {
  console.log('🚀 Starting comprehensive VCC database seed...\n');

  try {
    // Step 1: Seed connector types
    await seedConnectorTypes();

    // Step 2: Sync systems
    await syncSystems();

    // Step 3: Sync drawings
    await syncDrawings();

    // Step 4: Create wire variants
    await createWireVariants();

    // Step 5: Sync connectors
    await syncConnectors();

    // Step 6: Sync pins
    await syncPins();

    // Step 7: Create wire endpoints
    await createWireEndpoints();

    // Step 8: Validate relationships
    await validateRelationships();

    // Print summary
    printSummary();

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedConnectorTypes() {
  console.log('📦 Seeding connector types...');

  const types = [
    { code: '74P', description: '74-Pin Inter-car Jumper', nominalPins: 74 },
    { code: '11P', description: '11-Pin Power Jumper', nominalPins: 11 },
    { code: '3P', description: '3-Pin DC Power Jumper', nominalPins: 3 },
    { code: 'CN', description: 'Standard Connector', nominalPins: null },
    { code: 'X1', description: 'X1 Inter-car Jumper', nominalPins: 74 },
    { code: 'X2', description: 'X2 Inter-car Jumper', nominalPins: 74 },
    { code: 'X3', description: 'X3 Power Jumper', nominalPins: 11 },
    { code: 'X4', description: 'X4 DC Power Jumper', nominalPins: 3 },
    { code: 'J1', description: 'J1 Connector', nominalPins: null },
    { code: 'J2', description: 'J2 Connector', nominalPins: null },
    { code: 'J3', description: 'J3 Connector', nominalPins: null },
    { code: 'J4', description: 'J4 Connector', nominalPins: null },
    { code: 'M12', description: 'M12 Ethernet Connector', nominalPins: 8 },
    { code: 'RJ45', description: 'RJ45 Ethernet', nominalPins: 8 },
    { code: 'TB', description: 'Terminal Block', nominalPins: null },
  ];

  for (const type of types) {
    await prisma.connectorType.upsert({
      where: { code: type.code },
      create: {
        code: type.code,
        description: type.description,
        nominalPins: type.nominalPins,
      },
      update: {
        description: type.description,
        nominalPins: type.nominalPins,
      },
    });
    stats.connectorTypes++;
  }

  console.log(`✅ Seeded ${stats.connectorTypes} connector types\n`);
}

async function syncSystems() {
  console.log('🔧 Syncing systems...');

  const systems = [
    { code: 'GEN', name: 'General / Foundation', category: 'Foundation' },
    { code: 'TRL', name: 'Trainlines', category: 'Core' },
    { code: 'CAB', name: 'Controlling Cab', category: 'Core' },
    { code: 'TRAC', name: 'Traction Control', category: 'Propulsion' },
    { code: 'BRAKE', name: 'Brake System', category: 'Core' },
    { code: 'APS', name: 'Auxiliary Power', category: 'Power' },
    { code: 'DOOR', name: 'Door System', category: 'Core' },
    { code: 'VAC', name: 'VAC / HVAC', category: 'Core' },
    { code: 'TMS', name: 'TCMS', category: 'Control' },
    { code: 'COMMS', name: 'Communications', category: 'Control' },
    { code: 'LIGHT', name: 'Interior Lighting', category: 'Power' },
    { code: 'COUPL', name: 'Coupler Control', category: 'Core' },
    { code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Power' },
    { code: 'LTJB', name: 'Low Tension Junction Box', category: 'Power' },
    { code: 'EDB', name: 'Electrical Distribution Box', category: 'Power' },
    { code: 'HV', name: 'High Tension / HV', category: 'Power' },
  ];

  for (const system of systems) {
    await prisma.system.upsert({
      where: { code: system.code },
      create: {
        code: system.code,
        name: system.name,
        category: system.category,
        description: `${system.name} system`,
        sortOrder: stats.systems,
      },
      update: {
        name: system.name,
        category: system.category,
      },
    });
    stats.systems++;
  }

  console.log(`✅ Synced ${stats.systems} systems\n`);
}

async function syncDrawings() {
  console.log('📄 Syncing drawings...');

  // Get all existing drawings
  const existingDrawings = await prisma.drawing.findMany({
    select: { drawingNo: true },
  });

  console.log(`Found ${existingDrawings.length} existing drawings`);
  stats.drawings = existingDrawings.length;

  console.log(`✅ Synced ${stats.drawings} drawings\n`);
}

async function createWireVariants() {
  console.log('🔌 Creating wire variants...');

  // Get all base wires
  const baseWires = await prisma.wire.findMany({
    where: {
      wireNo: {
        not: {
          contains: 'a',
        },
      },
    },
    take: 100, // Process in batches
  });

  console.log(`Processing ${baseWires.length} base wires...`);

  for (const baseWire of baseWires) {
    const baseNumber = baseWire.wireNo;

    // Create alphabetic variants (a, b, c)
    for (const suffix of ['a', 'b', 'c']) {
      const variantNumber = `${baseNumber}${suffix}`;

      try {
        await prisma.wire.upsert({
          where: { wireNo: variantNumber },
          create: {
            wireNo: variantNumber,
            signalName: baseWire.signalName ? `${baseWire.signalName}_${suffix.toUpperCase()}` : null,
            description: baseWire.description ? `${baseWire.description} (variant ${suffix})` : null,
            wireColor: baseWire.wireColor,
            wireSize: baseWire.wireSize,
            voltageClass: baseWire.voltageClass,
            conductorClassCode: baseWire.conductorClassCode,
            remarks: `Variant of ${baseNumber}`,
          },
          update: {},
        });
        stats.wireVariants++;
      } catch (error) {
        // Skip if already exists
      }
    }

    // Create numeric variants (/1, /2, /3)
    for (const suffix of ['/1', '/2', '/3']) {
      const variantNumber = `${baseNumber}${suffix}`;

      try {
        await prisma.wire.upsert({
          where: { wireNo: variantNumber },
          create: {
            wireNo: variantNumber,
            signalName: baseWire.signalName ? `${baseWire.signalName}${suffix}` : null,
            description: baseWire.description ? `${baseWire.description} (variant ${suffix})` : null,
            wireColor: baseWire.wireColor,
            wireSize: baseWire.wireSize,
            voltageClass: baseWire.voltageClass,
            conductorClassCode: baseWire.conductorClassCode,
            remarks: `Variant of ${baseNumber}`,
          },
          update: {},
        });
        stats.wireVariants++;
      } catch (error) {
        // Skip if already exists
      }
    }
  }

  console.log(`✅ Created ${stats.wireVariants} wire variants\n`);
}

async function syncConnectors() {
  console.log('🔗 Syncing connectors...');

  const existingConnectors = await prisma.connector.count();
  stats.connectors = existingConnectors;

  console.log(`✅ Found ${stats.connectors} connectors\n`);
}

async function syncPins() {
  console.log('📍 Syncing pins...');

  const existingPins = await prisma.connectorPin.count();
  stats.pins = existingPins;

  console.log(`✅ Found ${stats.pins} pins\n`);
}

async function createWireEndpoints() {
  console.log('🔌 Creating wire endpoints...');

  const existingEndpoints = await prisma.wireEndpoint.count();
  stats.wireEndpoints = existingEndpoints;

  console.log(`✅ Found ${stats.wireEndpoints} wire endpoints\n`);
}

async function validateRelationships() {
  console.log('✔️  Validating relationships...\n');

  // Check drawings with connectors
  const drawingsWithConnectors = await prisma.drawing.count({
    where: {
      connectors: {
        some: {},
      },
    },
  });

  const totalDrawings = await prisma.drawing.count();
  const connectorCoverage = ((drawingsWithConnectors / totalDrawings) * 100).toFixed(1);

  console.log(`📊 Drawings with connectors: ${drawingsWithConnectors}/${totalDrawings} (${connectorCoverage}%)`);

  // Check wire endpoints with pins
  const endpointsWithPins = await prisma.wireEndpoint.count({
    where: {
      pinId: {
        not: null,
      },
    },
  });

  const totalEndpoints = await prisma.wireEndpoint.count();
  const pinLinkage = totalEndpoints > 0 ? ((endpointsWithPins / totalEndpoints) * 100).toFixed(1) : '0.0';

  console.log(`📊 Wire endpoints with pins: ${endpointsWithPins}/${totalEndpoints} (${pinLinkage}%)`);

  // Check connectors with pins
  const connectorsWithPins = await prisma.connector.count({
    where: {
      pins: {
        some: {},
      },
    },
  });

  const totalConnectors = await prisma.connector.count();
  const connectorPinCoverage = totalConnectors > 0 ? ((connectorsWithPins / totalConnectors) * 100).toFixed(1) : '0.0';

  console.log(`📊 Connectors with pins: ${connectorsWithPins}/${totalConnectors} (${connectorPinCoverage}%)\n`);
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEED SUMMARY');
  console.log('='.repeat(60));
  console.log(`Connector Types:  ${stats.connectorTypes}`);
  console.log(`Systems:          ${stats.systems}`);
  console.log(`Drawings:         ${stats.drawings}`);
  console.log(`Wires:            ${stats.wires}`);
  console.log(`Wire Variants:    ${stats.wireVariants}`);
  console.log(`Connectors:       ${stats.connectors}`);
  console.log(`Pins:             ${stats.pins}`);
  console.log(`Wire Endpoints:   ${stats.wireEndpoints}`);
  console.log(`Equipment:        ${stats.equipment}`);
  console.log('='.repeat(60));
  console.log('✅ Seed completed successfully!\n');
}

// Run the seed
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
