#!/usr/bin/env tsx
/**
 * Sync Drawing-Wire Relationships
 * Creates many-to-many relationships between wires and drawings
 * based on existing data in ConnectorPin and TrainLine tables
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔗 Syncing Drawing-Wire Relationships...\n');

  // Get all wires that appear in connector pins
  const pinsWithWires = await prisma.connectorPin.findMany({
    where: {
      wireNo: { not: null },
    },
    include: {
      connector: {
        include: {
          drawing: true,
          sheet: true,
        },
      },
    },
  });

  console.log(`Found ${pinsWithWires.length} connector pins with wire numbers`);

  // Get all wires that appear in trainlines
  const trainLinesWithWires = await prisma.trainLine.findMany({
    where: {
      wireNo: { not: null },
    },
    include: {
      drawing: true,
    },
  });

  console.log(`Found ${trainLinesWithWires.length} trainline entries with wire numbers\n`);

  // Build a map of wire-drawing relationships
  const wireDrawingMap = new Map<string, Set<{ drawingId: string; pageNo?: number; sheetNo?: number }>>();

  // Process connector pins
  for (const pin of pinsWithWires) {
    if (!pin.wireNo || !pin.connector?.drawing) continue;

    const wireNo = pin.wireNo.trim();
    const drawingId = pin.connector.drawing.id;
    const sheetNo = pin.connector.sheetId ? pin.connector.sheet?.sheetNo : undefined;

    if (!wireDrawingMap.has(wireNo)) {
      wireDrawingMap.set(wireNo, new Set());
    }

    wireDrawingMap.get(wireNo)!.add({
      drawingId,
      sheetNo,
    });
  }

  // Process trainlines
  for (const trainLine of trainLinesWithWires) {
    if (!trainLine.wireNo || !trainLine.drawing) continue;

    const wireNo = trainLine.wireNo.trim();
    const drawingId = trainLine.drawing.id;

    if (!wireDrawingMap.has(wireNo)) {
      wireDrawingMap.set(wireNo, new Set());
    }

    wireDrawingMap.get(wireNo)!.add({
      drawingId,
    });
  }

  console.log(`Found ${wireDrawingMap.size} unique wires across drawings\n`);

  // Now create DrawingWire entries
  let created = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [wireNo, drawingSet] of wireDrawingMap.entries()) {
    // Find the wire in database
    const wire = await prisma.wire.findFirst({
      where: {
        OR: [
          { wireNo: wireNo },
          { wireNo: { equals: wireNo, mode: 'insensitive' } },
        ],
      },
    });

    if (!wire) {
      notFound++;
      continue;
    }

    // Create relationships for each drawing
    for (const drawingInfo of Array.from(drawingSet)) {
      try {
        await prisma.drawingWire.create({
          data: {
            wireId: wire.id,
            drawingId: drawingInfo.drawingId,
            sheetNo: drawingInfo.sheetNo,
            pageNo: drawingInfo.pageNo,
            context: 'Synced from connector pins and trainlines',
          },
        });
        created++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation - already exists
          skipped++;
        } else {
          console.error(`Error creating relationship for wire ${wireNo}:`, error.message);
        }
      }
    }

    if (created % 100 === 0) {
      console.log(`Progress: ${created} created, ${skipped} skipped, ${notFound} wires not found`);
    }
  }

  console.log(`\n✅ Drawing-Wire relationship sync complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`   Wires not found: ${notFound}`);

  // Show some statistics
  const stats = await prisma.drawingWire.groupBy({
    by: ['wireId'],
    _count: {
      drawingId: true,
    },
    orderBy: {
      _count: {
        drawingId: 'desc',
      },
    },
    take: 10,
  });

  console.log(`\n📊 Top 10 wires by drawing count:`);
  for (const stat of stats) {
    const wire = await prisma.wire.findUnique({
      where: { id: stat.wireId },
      select: { wireNo: true, signalName: true },
    });
    console.log(`   ${wire?.wireNo}: ${stat._count.drawingId} drawings`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
