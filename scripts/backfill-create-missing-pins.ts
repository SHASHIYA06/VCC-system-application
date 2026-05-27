import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Starting Missing Connector Pins Seeding & Backfill ===\n');

  // PART 1: Find all unlinked WireEndpoints that have a connectorId and endpointPin
  console.log('PART 1: Creating pins from WireEndpoints...');
  const endpoints = await prisma.wireEndpoint.findMany({
    where: {
      connectorId: { not: null },
      endpointPin: { not: null },
    },
    include: {
      wire: true,
    }
  });

  console.log(`Found ${endpoints.length} WireEndpoints with connector and pin info.`);

  let pinsCreatedFromEndpoints = 0;
  let endpointsLinked = 0;
  let pinsUpdatedFromEndpoints = 0;

  for (const ep of endpoints) {
    if (!ep.connectorId || !ep.endpointPin) continue;
    const cleanPinNo = ep.endpointPin.trim();
    if (!cleanPinNo) continue; // Skip empty strings

    // Check if the pin already exists
    let pin = await prisma.connectorPin.findUnique({
      where: {
        connectorId_pinNo: {
          connectorId: ep.connectorId,
          pinNo: cleanPinNo,
        }
      }
    });

    if (!pin) {
      // Create the missing pin
      try {
        pin = await prisma.connectorPin.create({
          data: {
            connectorId: ep.connectorId,
            pinNo: cleanPinNo,
            wireNo: ep.wire?.wireNo || null,
            signalName: ep.wire?.signalName || null,
          }
        });
        pinsCreatedFromEndpoints++;
      } catch (err) {
        console.error(`Failed to create pin ${cleanPinNo} on connector ${ep.connectorId}:`, err);
        continue;
      }
    } else {
      // If it exists but has no wireNo, update it
      if (!pin.wireNo && ep.wire?.wireNo) {
        pin = await prisma.connectorPin.update({
          where: { id: pin.id },
          data: {
            wireNo: ep.wire.wireNo,
            signalName: pin.signalName || ep.wire.signalName || null,
          }
        });
        pinsUpdatedFromEndpoints++;
      }
    }

    // Link the endpoint to this pin
    if (ep.pinId !== pin.id) {
      await prisma.wireEndpoint.update({
        where: { id: ep.id },
        data: { pinId: pin.id }
      });
      endpointsLinked++;
    }
  }

  console.log(`Created ${pinsCreatedFromEndpoints} missing ConnectorPins from WireEndpoints.`);
  console.log(`Linked ${endpointsLinked} WireEndpoints to pins.`);
  console.log(`Updated wire numbers for ${pinsUpdatedFromEndpoints} existing pins.`);

  // PART 2: Find all Wires with sourceConnector/sourcePin or destConnector/destPin
  console.log('\nPART 2: Creating pins from Wire source/destination codes...');
  const wires = await prisma.wire.findMany({
    where: {
      OR: [
        { AND: [{ sourceConnector: { not: null } }, { sourcePin: { not: null } }] },
        { AND: [{ destConnector: { not: null } }, { destPin: { not: null } }] },
      ]
    }
  });

  console.log(`Found ${wires.length} wires with connector and pin details.`);

  let pinsCreatedFromWires = 0;
  let pinsUpdatedFromWires = 0;

  for (const wire of wires) {
    // Process Source Connector
    if (wire.sourceConnector && wire.sourcePin) {
      const cleanPinNo = wire.sourcePin.trim();
      if (cleanPinNo) {
        // Find matching connectors (by code)
        const connectors = await prisma.connector.findMany({
          where: { connectorCode: wire.sourceConnector }
        });

        for (const conn of connectors) {
          // Check if pin exists
          let pin = await prisma.connectorPin.findUnique({
            where: {
              connectorId_pinNo: {
                connectorId: conn.id,
                pinNo: cleanPinNo,
              }
            }
          });

          if (!pin) {
            try {
              pin = await prisma.connectorPin.create({
                data: {
                  connectorId: conn.id,
                  pinNo: cleanPinNo,
                  wireNo: wire.wireNo,
                  signalName: wire.signalName,
                }
              });
              pinsCreatedFromWires++;
            } catch (err) {
              // Ignore unique constraint or other insert errors
            }
          } else if (!pin.wireNo) {
            await prisma.connectorPin.update({
              where: { id: pin.id },
              data: {
                wireNo: wire.wireNo,
                signalName: pin.signalName || wire.signalName || null,
              }
            });
            pinsUpdatedFromWires++;
          }
        }
      }
    }

    // Process Destination Connector
    if (wire.destConnector && wire.destPin) {
      const cleanPinNo = wire.destPin.trim();
      if (cleanPinNo) {
        // Find matching connectors (by code)
        const connectors = await prisma.connector.findMany({
          where: { connectorCode: wire.destConnector }
        });

        for (const conn of connectors) {
          // Check if pin exists
          let pin = await prisma.connectorPin.findUnique({
            where: {
              connectorId_pinNo: {
                connectorId: conn.id,
                pinNo: cleanPinNo,
              }
            }
          });

          if (!pin) {
            try {
              pin = await prisma.connectorPin.create({
                data: {
                  connectorId: conn.id,
                  pinNo: cleanPinNo,
                  wireNo: wire.wireNo,
                  signalName: wire.signalName,
                }
              });
              pinsCreatedFromWires++;
            } catch (err) {
              // Ignore
            }
          } else if (!pin.wireNo) {
            await prisma.connectorPin.update({
              where: { id: pin.id },
              data: {
                wireNo: wire.wireNo,
                signalName: pin.signalName || wire.signalName || null,
              }
            });
            pinsUpdatedFromWires++;
          }
        }
      }
    }
  }

  console.log(`Created ${pinsCreatedFromWires} missing ConnectorPins from Wire records.`);
  console.log(`Updated wire numbers for ${pinsUpdatedFromWires} existing pins from Wires.`);

  console.log('\n=== Seeding & Backfill Completed Successfully! ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
