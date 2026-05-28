#!/usr/bin/env tsx
/**
 * Optimized Wire Variant Creation Script
 * Creates alphabetic and numeric variants for all base wires
 * Handles: 3001a, 3001/1, Y4181a, etc.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Creating wire variants...\n');

  // Get all base wires (no alphabetic suffixes)
  const baseWires = await prisma.wire.findMany({
    where: {
      wireNo: {
        not: {
          contains: 'a',
        },
      },
    },
  });

  console.log(`Found ${baseWires.length} base wires to process\n`);

  let created = 0;
  let skipped = 0;
  const batchSize = 50;

  for (let i = 0; i < baseWires.length; i += batchSize) {
    const batch = baseWires.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(baseWires.length / batchSize)}...`);

    const variants = [];

    for (const baseWire of batch) {
      const baseNumber = baseWire.wireNo;

      // Create alphabetic variants (a, b, c, d)
      for (const suffix of ['a', 'b', 'c', 'd']) {
        variants.push({
          wireNo: `${baseNumber}${suffix}`,
          signalName: baseWire.signalName ? `${baseWire.signalName}_${suffix.toUpperCase()}` : null,
          description: baseWire.description ? `${baseWire.description} (variant ${suffix})` : null,
          wireColor: baseWire.wireColor,
          wireSize: baseWire.wireSize,
          voltageClass: baseWire.voltageClass,
          conductorClassCode: baseWire.conductorClassCode,
          remarks: `Variant of ${baseNumber}`,
        });
      }

      // Create numeric variants (/1, /2, /3)
      for (const suffix of ['/1', '/2', '/3']) {
        variants.push({
          wireNo: `${baseNumber}${suffix}`,
          signalName: baseWire.signalName ? `${baseWire.signalName}${suffix}` : null,
          description: baseWire.description ? `${baseWire.description} (variant ${suffix})` : null,
          wireColor: baseWire.wireColor,
          wireSize: baseWire.wireSize,
          voltageClass: baseWire.voltageClass,
          conductorClassCode: baseWire.conductorClassCode,
          remarks: `Variant of ${baseNumber}`,
        });
      }
    }

    // Batch insert
    try {
      const result = await prisma.wire.createMany({
        data: variants,
        skipDuplicates: true,
      });
      created += result.count;
      skipped += variants.length - result.count;
    } catch (error) {
      console.error('Batch insert error:', error);
    }

    console.log(`  Created: ${created}, Skipped: ${skipped}`);
  }

  console.log(`\n✅ Wire variant creation complete!`);
  console.log(`   Total created: ${created}`);
  console.log(`   Total skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
