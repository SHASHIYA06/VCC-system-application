import { prisma } from '@/lib/prisma';

export async function getVCCDescription() {
  const systems = await prisma.system.findMany({ orderBy: { sortOrder: 'asc' } });
  const drawings = await prisma.drawing.findMany({ take: 50 });

  return {
    systems: systems.map(s => ({ code: s.code, name: s.name, description: s.description })),
    drawings: drawings.map(d => ({ drawingNo: d.drawingNo, title: d.title })),
    totalSystems: systems.length,
    totalDrawings: drawings.length,
  };
}