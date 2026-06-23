import { prisma } from '../src/lib/prisma';

async function main() {
  const drawings = await prisma.drawing.findMany({
    orderBy: { drawingNo: 'asc' },
    include: {
      system: { select: { code: true, name: true } },
      pages: { orderBy: { pageNo: 'asc' } },
      pageMappings: true,
      _count: { select: { connectors: true, devices: true, wires: true } },
    },
  });

  console.log(JSON.stringify({
    total: drawings.length,
    drawings: drawings.map(d => ({
      drawingNo: d.drawingNo,
      title: d.title,
      system: d.system?.code || 'GEN',
      pages: d.pages.length,
      connectors: d._count.connectors,
      devices: d._count.devices,
      wires: d._count.wires,
      pageMappings: d.pageMappings.length,
    })),
  }, null, 2));

  await prisma.$disconnect();
}
main();
