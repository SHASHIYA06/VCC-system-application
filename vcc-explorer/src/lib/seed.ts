import { prisma } from '@/lib/prisma';

export async function seedDatabase() {
  const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro' } });

  const systems = [
    { code: 'GEN', name: 'General', description: 'General documentation' },
    { code: 'TRL', name: 'Train Line', description: 'Train control lines' },
    { code: 'TRAC', name: 'Traction', description: 'Traction system' },
    { code: 'BRAKE', name: 'Brake System', description: 'Brake control' },
    { code: 'DOOR', name: 'Door System', description: 'Door control' },
    { code: 'TMS', name: 'TCMS', description: 'Train Control Management' },
    { code: 'COMMS', name: 'Communication', description: 'Communication systems' },
  ];

  for (const sys of systems) {
    await prisma.system.upsert({ where: { code: sys.code }, update: sys, create: sys });
  }

  return { seeded: true, systems: systems.length };
}