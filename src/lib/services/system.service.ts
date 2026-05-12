import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export async function findSystemByCode(code: string) {
  return prisma.system.findFirst({
    where: { OR: [{ code: { equals: code, mode: Prisma.QueryMode.insensitive } }, { name: { equals: code, mode: Prisma.QueryMode.insensitive } }] },
    include: { devices: { include: { type: true, connectors: { include: { pins: { orderBy: { normPinNo: 'asc' } } } } } } },
  });
}