import { prisma } from '../prisma';

export async function findWireByNumber(wireNo: string) {
  return prisma.wire.findUnique({
    where: { wireNo },
    include: { endpoints: { include: { connector: true, device: true, pin: true } } },
  });
}

export async function findWires(options?: { skip?: number; take?: number; where?: { wireType?: string; carType?: string } }) {
  return prisma.wire.findMany({
    skip: options?.skip,
    take: options?.take,
    where: options?.where,
    include: { endpoints: { include: { connector: true, device: true } } },
    orderBy: { wireNo: 'asc' },
  });
}

export async function countWires(where?: { wireType?: string }) {
  return prisma.wire.count({ where });
}