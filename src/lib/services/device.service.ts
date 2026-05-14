import { prisma } from '@/lib/prisma';

export async function findDeviceByTag(tag: string) {
  return prisma.device.findFirst({
    where: { tagNo: { equals: tag, mode: 'insensitive' } },
    include: { system: true },
  });
}

export async function findAllDevices(options?: { skip?: number; take?: number; carType?: string }) {
  return prisma.device.findMany({
    skip: options?.skip,
    take: options?.take,
    where: options?.carType ? { carType: options.carType } : {},
    include: { system: true },
    orderBy: { deviceName: 'asc' },
  });
}