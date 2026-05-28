#!/usr/bin/env tsx
/**
 * Check Progress of Wire Variants and Drawing-Wire Relationships
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Checking Progress...\n');

  // Count wires
  const totalWires = await prisma.wire.count();
  const baseWires = await prisma.wire.count({
    where: {
      AND: [
        { wireNo: { not: { contains: 'a' } } },
        { wireNo: { not: { contains: 'b' } } },
        { wireNo: { not: { contains: 'c' } } },
        { wireNo: { not: { contains: 'd' } } },
        { wireNo: { not: { contains: '/' } } },
      ],
    },
  });
  const variantWires = totalWires - baseWires;

  console.log('🔌 Wire Statistics:');
  console.log(`   Total Wires: ${totalWires.toLocaleString()}`);
  console.log(`   Base Wires: ${baseWires.toLocaleString()}`);
  console.log(`   Variant Wires: ${variantWires.toLocaleString()}`);
  console.log(`   Expected Variants: ${(baseWires * 7).toLocaleString()}`);
  console.log(`   Progress: ${Math.round((variantWires / (baseWires * 7)) * 100)}%\n`);

  // Count drawing-wire relationships
  const totalRelationships = await prisma.drawingWire.count();
  const uniqueWires = await prisma.drawingWire.groupBy({
    by: ['wireId'],
    _count: true,
  });
  const uniqueDrawings = await prisma.drawingWire.groupBy({
    by: ['drawingId'],
    _count: true,
  });

  console.log('🔗 Drawing-Wire Relationships:');
  console.log(`   Total Relationships: ${totalRelationships.toLocaleString()}`);
  console.log(`   Unique Wires: ${uniqueWires.length.toLocaleString()}`);
  console.log(`   Unique Drawings: ${uniqueDrawings.length.toLocaleString()}`);
  console.log(`   Avg Drawings per Wire: ${(totalRelationships / uniqueWires.length).toFixed(2)}\n`);

  // Top wires by drawing count
  const topWires = await prisma.drawingWire.groupBy({
    by: ['wireId'],
    _count: {
      drawingId: true,
    },
    orderBy: {
      _count: {
        drawingId: 'desc',
      },
    },
    take: 5,
  });

  console.log('🏆 Top 5 Wires by Drawing Count:');
  for (const item of topWires) {
    const wire = await prisma.wire.findUnique({
      where: { id: item.wireId },
      select: { wireNo: true, signalName: true },
    });
    console.log(`   ${wire?.wireNo}: ${item._count.drawingId} drawings`);
  }

  console.log('\n✅ Progress check complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
