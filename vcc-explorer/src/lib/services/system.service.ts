import { prisma } from '@/lib/prisma';

export async function getSystemWithDevices(code: string) {
  return prisma.system.findFirst({
    where: { code },
    include: { 
      devices: true,
      drawings: true,
    },
  });
}

export async function getAllSystems() {
  return prisma.system.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}