import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export async function findDeviceByTag(tag: string) {
  return prisma.deviceInstance.findFirst({
    where: { tag: { equals: tag, mode: Prisma.QueryMode.insensitive } },
    include: { system: true, type: true, connectors: { include: { pins: { orderBy: { normPinNo: 'asc' } } } } },
  });
}

export async function findAllDevices(options?: { skip?: number; take?: number; carType?: string }) {
  return prisma.deviceInstance.findMany({
    skip: options?.skip,
    take: options?.take,
    where: options?.carType ? { carType: options.carType } : {},
    include: { system: true, type: true },
    orderBy: { name: 'asc' },
  });
}