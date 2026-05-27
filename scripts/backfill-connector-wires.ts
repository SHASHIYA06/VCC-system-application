import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Starting Connector Pin Wire Number Backfill ===\n');

  // Step 1: Link WireEndpoints to ConnectorPins where pinId is null but connectorId and endpointPin match
  console.log('Step 1: Linking WireEndpoints to ConnectorPins by matching connectorId and endpointPin...');
  
  const endpointsToLink = await prisma.wireEndpoint.findMany({
    where: {
      pinId: null,
      connectorId: { not: null },
      endpointPin: { not: null },
    },
    include: {
      wire: true,
    }
  });

  console.log(`Found ${endpointsToLink.length} unlinked wire endpoints with connector and pin info.`);

  let endpointLinksCreated = 0;
  let pinWiresUpdated = 0;

  for (const ep of endpointsToLink) {
    if (!ep.connectorId || !ep.endpointPin) continue;

    // Find the ConnectorPin
    const pin = await prisma.connectorPin.findFirst({
      where: {
        connectorId: ep.connectorId,
        pinNo: ep.endpointPin,
      }
    });

    if (pin) {
      // 1. Link endpoint to pin
      await prisma.wireEndpoint.update({
        where: { id: ep.id },
        data: { pinId: pin.id }
      });
      endpointLinksCreated++;

      // 2. Backfill pin wire number if missing
      if (!pin.wireNo && ep.wire?.wireNo) {
        await prisma.connectorPin.update({
          where: { id: pin.id },
          data: {
            wireNo: ep.wire.wireNo,
            signalName: pin.signalName || ep.wire.signalName || null,
          }
        });
        pinWiresUpdated++;
      }
    }
  }

  console.log(`Linked ${endpointLinksCreated} wire endpoints to pins.`);
  console.log(`Updated wire numbers for ${pinWiresUpdated} pins via endpoints.`);

  // Step 2: Backfill from Wire table directly by matching connectorCode and pinNo
  console.log('\nStep 2: Backfilling ConnectorPins directly from Wire source/dest connector and pin codes...');
  
  const wires = await prisma.wire.findMany({
    where: {
      OR: [
        { AND: [{ sourceConnector: { not: null } }, { sourcePin: { not: null } }] },
        { AND: [{ destConnector: { not: null } }, { destPin: { not: null } }] },
      ]
    }
  });

  console.log(`Fetched ${wires.length} wires with connector and pin details.`);

  let directBackfills = 0;

  for (const wire of wires) {
    // Check source
    if (wire.sourceConnector && wire.sourcePin) {
      const sourceConnectors = await prisma.connector.findMany({
        where: { connectorCode: wire.sourceConnector }
      });

      for (const conn of sourceConnectors) {
        const pin = await prisma.connectorPin.findFirst({
          where: {
            connectorId: conn.id,
            pinNo: wire.sourcePin,
          }
        });

        if (pin && !pin.wireNo) {
          await prisma.connectorPin.update({
            where: { id: pin.id },
            data: {
              wireNo: wire.wireNo,
              signalName: pin.signalName || wire.signalName || null,
            }
          });
          directBackfills++;
        }
      }
    }

    // Check dest
    if (wire.destConnector && wire.destPin) {
      const destConnectors = await prisma.connector.findMany({
        where: { connectorCode: wire.destConnector }
      });

      for (const conn of destConnectors) {
        const pin = await prisma.connectorPin.findFirst({
          where: {
            connectorId: conn.id,
            pinNo: wire.destPin,
          }
        });

        if (pin && !pin.wireNo) {
          await prisma.connectorPin.update({
            where: { id: pin.id },
            data: {
              wireNo: wire.wireNo,
              signalName: pin.signalName || wire.signalName || null,
            }
          });
          directBackfills++;
        }
      }
    }
  }

  console.log(`Backfilled ${directBackfills} pins directly from Wire records.`);
  
  console.log('\n=== Backfill Completed Successfully! ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
