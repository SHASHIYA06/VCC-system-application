/**
 * Fix Connector Pins - Link pins to wires based on wireNo references
 * ====================================================================
 * Many connectors were imported but their pins weren't linked to wires.
 * This script fixes that by matching pin.wireNo to wire.wireNo
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixConnectorPins() {
  console.log('🔧 Fixing connector pin references...\n');

  // Find all pins that have wireNo but aren't linked to a wire
  const unlinkedPins = await prisma.connectorPin.findMany({
    where: {
      wireNo: { not: null, not: '' },
      wire: null // Not linked
    },
    include: {
      connector: { include: { drawing: true } }
    },
    take: 100
  });

  console.log(`Found ${unlinkedPins.length} unlinked pins with wireNo references`);

  let linkedCount = 0;
  
  for (const pin of unlinkedPins) {
    if (!pin.wireNo) continue;
    
    // Find the wire by wireNo
    const wire = await prisma.wire.findFirst({
      where: {
        OR: [
          { wireNo: pin.wireNo },
          { wireNo: { equals: pin.wireNo, mode: 'insensitive' } }
        ]
      }
    });

    if (wire) {
      // Create WireEndpoint to link pin to wire
      await prisma.wireEndpoint.create({
        data: {
          wireId: wire.id,
          pinId: pin.id,
          connectorId: pin.connectorId,
          endpointRole: 'endpoint',
          endpointPin: pin.pinNo
        }
      });
      linkedCount++;
    }
  }

  console.log(`\n✅ Linked ${linkedCount} pins to wires\n`);
  
  // Now fix wires that have endpoints but no endpoints in database
  console.log('🔧 Creating missing wire endpoints from pin data...\n');
  
  // Get all wires that have source/dest info but no endpoints
  const orphanWires = await prisma.wire.findMany({
    where: {
      OR: [
        { sourceConnector: { not: null }, destConnector: { not: null } }
      ],
      endpoints: { none: {} }
    },
    take: 100
  });

  console.log(`Found ${orphanWires.length} wires with source/dest but no endpoints`);

  await prisma.$disconnect();
}

fixConnectorPins().catch(console.error);