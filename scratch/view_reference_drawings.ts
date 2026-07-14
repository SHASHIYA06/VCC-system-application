import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL } }
});

async function main() {
    console.log('=== REFERENCE DRAWINGS ===');
    const refDrawings = await prisma.referenceDrawing.findMany();
    refDrawings.forEach((ref: any) => {
        console.log(`- ${ref.drawingNo}: ${ref.title} (${ref.revision || 'No Rev'}) - System: ${ref.systemCode}`);
    });

    console.log('\n=== CROSS CONNECTIONS ===');
    const crossConns = await prisma.crossConnection.findMany({
        take: 10
    });
    crossConns.forEach((cc: any) => {
        console.log(`- Drawing: ${cc.drawingId}, Connector: ${cc.connectorCode}, Pins: ${cc.pinA} <-> ${cc.pinB}, Wires: ${cc.wireA} <-> ${cc.wireB} (${cc.ruleType})`);
    });

    console.log('\n=== SYSTEM HIERARCHY INTEGRITY ===');
    const systems = await prisma.system.findMany({
        include: {
            _count: {
                select: {
                    drawings: true,
                    devices: true
                }
            }
        }
    });
    systems.forEach((sys: any) => {
        console.log(`- System ${sys.code} (${sys.name}): ${sys._count.drawings} drawings, ${sys._count.devices} devices`);
    });

    process.exit(0);
}

main().catch(console.error);
