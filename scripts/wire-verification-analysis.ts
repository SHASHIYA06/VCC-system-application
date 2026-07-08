import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeWireVerification() {
    try {
        console.log('Analyzing wire verification and data linkage completeness...\n');

        // Get wire status breakdown
        const wireStatusResult = await prisma.$queryRaw<Array<{ wireStatus: string; count: number }>>`
      SELECT "wireStatus", COUNT(*)::int as count FROM "Wire" GROUP BY "wireStatus"
    `;

        console.log('=== WIRE STATUS BREAKDOWN ===');
        const totalWires = wireStatusResult.reduce((sum, status) => sum + status.count, 0);
        wireStatusResult.forEach(status => {
            const percentage = ((status.count / totalWires) * 100).toFixed(1);
            console.log(`${status.wireStatus}: ${status.count} (${percentage}%)`);
        });
        console.log(`Total wires: ${totalWires}\n`);

        // Check source/destination completeness
        console.log('=== SOURCE/DESTINATION COMPLETENESS ===');
        const [
            totalWiresForCheck,
            wiresWithSource,
            wiresWithDest,
            wiresWithBoth
        ] = await Promise.all([
            prisma.wire.count(),
            prisma.wire.count({ where: { sourceConnector: { not: null } } }),
            prisma.wire.count({ where: { destConnector: { not: null } } }),
            prisma.wire.count({
                where: {
                    sourceConnector: { not: null },
                    destConnector: { not: null }
                }
            })
        ]);

        const sourceCompleteness = ((wiresWithSource / totalWiresForCheck) * 100).toFixed(1);
        const destCompleteness = ((wiresWithDest / totalWiresForCheck) * 100).toFixed(1);
        const bothCompleteness = ((wiresWithBoth / totalWiresForCheck) * 100).toFixed(1);

        console.log(`Wires with source connector: ${wiresWithSource}/${totalWiresForCheck} (${sourceCompleteness}%)`);
        console.log(`Wires with destination connector: ${wiresWithDest}/${totalWiresForCheck} (${destCompleteness}%)`);
        console.log(`Wires with both source and destination: ${wiresWithBoth}/${totalWiresForCheck} (${bothCompleteness}%)`);

        // Check Drawing-Wire linkage completeness
        console.log('\n=== DRAWING-WIRE LINKAGE COMPLETENESS ===');
        const drawingWireLinks = await prisma.drawingWire.count();
        const linkagePercentage = ((drawingWireLinks / totalWiresForCheck) * 100).toFixed(1);

        console.log(`Total drawing-wire links: ${drawingWireLinks}`);
        console.log(`Linkage coverage: ${linkagePercentage}%`);
        console.log(`Average links per wire: ${(drawingWireLinks / totalWiresForCheck).toFixed(1)}`);

        // Check for wires with excessive links (potential duplicates)
        console.log('\n=== WIRES WITH HIGH LINK COUNT ===');
        const wireLinkCounts = await prisma.$queryRaw<Array<{ wireId: string, wireNo: string, linkCount: number }>>`
      SELECT w.id, w."wireNo", COUNT(dw.id)::int as "linkCount"
      FROM "Wire" w
      LEFT JOIN "DrawingWire" dw ON w.id = dw."wireId"
      GROUP BY w.id, w."wireNo"
      HAVING COUNT(dw.id) > 5
      ORDER BY COUNT(dw.id) DESC
      LIMIT 10
    `;

        if (wireLinkCounts.length > 0) {
            console.log('Wires with more than 5 drawing links:');
            wireLinkCounts.forEach(wire => {
                console.log(`  Wire ${wire.wireNo}: ${wire.linkCount} links`);
            });
        } else {
            console.log('No wires with excessive linking found.');
        }

        // Check Connector-Pin-Wire completeness
        console.log('\n=== CONNECTOR-PIN-WIRE COMPLETENESS ===');
        const [
            totalPins,
            pinsWithWires,
            connectorsWithPins,
            connectorsWithWires
        ] = await Promise.all([
            prisma.connectorPin.count(),
            prisma.connectorPin.count({ where: { wireNo: { not: null } } }),
            prisma.connector.count({ where: { pins: { some: {} } } }),
            prisma.connector.count({
                where: {
                    pins: {
                        some: {
                            wireNo: { not: null }
                        }
                    }
                }
            })
        ]);

        const pinWirePercentage = ((pinsWithWires / totalPins) * 100).toFixed(1);
        const connectorPinPercentage = ((connectorsWithPins / totalWiresForCheck) * 100).toFixed(1);
        const connectorWirePercentage = ((connectorsWithWires / totalWiresForCheck) * 100).toFixed(1);

        console.log(`Total pins: ${totalPins}`);
        console.log(`Pins with wire assignments: ${pinsWithWires}/${totalPins} (${pinWirePercentage}%)`);
        console.log(`Connectors with pins: ${connectorsWithPins} (${connectorPinPercentage}%)`);
        console.log(`Connectors with wire-assigned pins: ${connectorsWithWires} (${connectorWirePercentage}%)`);

        // Check verification status if DrawingVerificationStatus table has data
        console.log('\n=== DRAWING VERIFICATION STATUS ===');
        const verificationRecords = await prisma.drawingVerificationStatus.count();
        if (verificationRecords > 0) {
            const verificationStats = await prisma.drawingVerificationStatus.groupBy({
                by: ['status'],
                _count: true
            });

            console.log(`Total verification records: ${verificationRecords}`);
            verificationStats.forEach(stat => {
                const percentage = ((stat._count / verificationRecords) * 100).toFixed(1);
                console.log(`  ${stat.status}: ${stat._count} (${percentage}%)`);
            });
        } else {
            console.log('No verification records found.');
        }

        console.log('\n=== WIRE VERIFICATION ANALYSIS COMPLETE ===');

    } catch (error) {
        console.error('Error analyzing wire verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeWireVerification();