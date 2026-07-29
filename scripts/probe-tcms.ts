/**
 * Why does system=TCMS produce an empty GSD canvas? Read-only probe.
 * Run: DATABASE_URL="..." npx tsx scripts/probe-tcms.ts
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  for (const code of ['TCMS', 'TMS', 'CCTV', 'DOOR']) {
    const sys = await prisma.system.findFirst({
      where: { code },
      select: { id: true, code: true, name: true },
    });
    if (!sys) {
      console.log(`${code}: NOT FOUND in System table`);
      continue;
    }
    const [devices, drawings, connectors] = await Promise.all([
      prisma.device.count({ where: { system: { code } } }),
      prisma.drawing.count({ where: { system: { code } } }),
      prisma.connector.count({ where: { drawing: { system: { code } } } }),
    ]);
    const drawingSample = await prisma.drawing.findMany({
      where: { system: { code } },
      select: { drawingNo: true, title: true, revision: true },
      take: 5,
      orderBy: { drawingNo: 'asc' },
    });
    console.log(
      `${code.padEnd(6)} id=${sys.id} name="${sys.name}" devices=${devices} drawings=${drawings} connectors=${connectors}`,
    );
    for (const d of drawingSample) {
      console.log(`        ${d.drawingNo} rev=${d.revision ?? '-'}  ${d.title}`);
    }
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
