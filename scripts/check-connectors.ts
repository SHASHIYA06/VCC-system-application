#!/usr/bin/env tsx
/**
 * Check Connector Pin Counts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Checking Connector Pin Counts...\n');

  // Get connectors with pin counts
  const connectors = await prisma.connector.findMany({
    include: {
      pins: {
        select: { id: true }
      }
    },
    orderBy: {
      pins: {
        _count: 'desc'
      }
    },
    take: 20
  });

  console.log('Top 20 Connectors by Pin Count:');
  console.log('--------------------------------');
  let totalPins = 0;
  let connectorsWithPins = 0;

  for (const conn of connectors) {
    const pinCount = conn.pins.length;
    totalPins += pinCount;
    if (pinCount > 0) connectorsWithPins++;

    console.log(`${conn.connectorCode}: ${pinCount} pins${pinCount === 0 ? ' ⚠️' : ''}`);
  }

  console.log('\n--------------------------------');
  console.log(`Total Connectors: ${connectors.length}`);
  console.log(`Connectors with Pins: ${connectorsWithPins}`);
  console.log(`Total Pins: ${totalPins}`);
  console.log(`Avg Pins per Connector: ${(totalPins / connectors.length).toFixed(2)}`);

  // Check for connectors with 0 pins
  const zeroPinConnectors = connectors.filter(c => c._count.pins === 0);
  console.log(`\nConnectors with 0 pins: ${zeroPinConnectors.length}`);

  if (zeroPinConnectors.length > 0) {
    console.log('\nSample connectors with 0 pins:');
    for (const conn of zeroPinConnectors.slice(0, 5)) {
      console.log(`  - ${conn.connectorCode} (${conn.description || 'No description'})`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
