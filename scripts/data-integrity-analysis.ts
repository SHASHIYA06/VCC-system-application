import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeDataIntegrity() {
    try {
        console.log('Analyzing data integrity...\n');

        // Get wire status breakdown
        const wireStatusResult = await prisma.$queryRaw<Array<{ wireStatus: string; count: number }>>`
      SELECT "wireStatus", COUNT(*)::int as count FROM "Wire" GROUP BY "wireStatus"
    `;

        console.log('=== WIRE STATUS BREAKDOWN ===');
        wireStatusResult.forEach(status => {
            console.log(`${status.wireStatus}: ${status.count}`);
        });

        // Check for wires without proper source/destination
        const incompleteWires = await prisma.wire.count({
            where: {
                OR: [
                    { sourceConnector: null },
                    { sourceEquipment: null },
                    { destConnector: null },
                    { destEquipment: null }
                ]
            }
        });

        console.log(`\n=== INCOMPLETE WIRES ===`);
        console.log(`Wires with missing source/destination data: ${incompleteWires}`);

        // Check for drawings without connectors
        const emptyDrawings = await prisma.drawing.count({
            where: {
                connectors: {
                    none: {}
                }
            }
        });

        console.log(`\n=== EMPTY DRAWINGS ===`);
        console.log(`Drawings without connectors: ${emptyDrawings}`);

        // Check Drawing-Wire relationships
        const totalWires = await prisma.wire.count();
        const drawingWireLinks = await prisma.drawingWire.count();

        console.log(`\n=== DRAWING-WIRE RELATIONSHIPS ===`);
        console.log(`Total wires: ${totalWires}`);
        console.log(`Drawing-wire links: ${drawingWireLinks}`);
        console.log(`Coverage percentage: ${((drawingWireLinks / totalWires) * 100).toFixed(1)}%`);

        // Check for duplicate wires
        const duplicateWires = await prisma.$queryRaw<Array<{ wireNo: string; count: number }>>`
      SELECT "wireNo", COUNT(*)::int as count 
      FROM "Wire" 
      GROUP BY "wireNo" 
      HAVING COUNT(*) > 1
    `;

        console.log(`\n=== DUPLICATE WIRES ===`);
        console.log(`Duplicate wire numbers found: ${duplicateWires.length}`);
        if (duplicateWires.length > 0) {
            duplicateWires.slice(0, 5).forEach(dup => {
                console.log(`  Wire ${dup.wireNo}: ${dup.count} instances`);
            });
        }

        // Check for connectors without pins
        const connectorsWithoutPins = await prisma.connector.count({
            where: {
                pins: {
                    none: {}
                }
            }
        });

        console.log(`\n=== CONNECTORS WITHOUT PINS ===`);
        console.log(`Connectors with no pins: ${connectorsWithoutPins}`);

        console.log('\n=== DATA INTEGRITY ANALYSIS COMPLETE ===');

    } catch (error) {
        console.error('Error analyzing data integrity:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeDataIntegrity();