import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const systems = await prisma.system.findMany({
    select: {
      id: true, code: true, name: true, category: true, dataStatus: true,
      _count: { select: { devices: true, drawings: true, subsystems: true } },
    },
    orderBy: { code: 'asc' },
  });
  console.log('=== ALL SYSTEMS ===');
  for (const s of systems) {
    console.log(`${s.code.padEnd(12)} ${(s.name||'').slice(0,30).padEnd(32)} dev=${s._count.devices} dwg=${s._count.drawings} sub=${s._count.subsystems} cat=${s.category||'-'} status=${s.dataStatus||'-'}`);
  }
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
