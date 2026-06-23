import { prisma } from '../src/lib/prisma';

async function main() {
  const systems = await prisma.system.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { drawings: true, devices: true } },
      drawings: {
        orderBy: { drawingNo: 'asc' },
        select: { drawingNo: true, pages: true, connectors: true, devices: true, wires: true },
        take: 5,
      },
    },
  });

  for (const s of systems) {
    console.log(`\n=== ${s.code} (${s.name}) ===`);
    console.log(`  drawings: ${s._count.drawings}, devices: ${s._count.devices}`);
    console.log(`  sample drawings:`, s.drawings.map(d => `${d.drawingNo}: ${d.pages}p, ${d.connectors}c, ${d.devices}d, ${d.wires}w`).join('; '));
  }

  await prisma.$disconnect();
}
main();
