import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import type { WireConnection } from '@prisma/client';

export async function searchAll(term: string, options?: { skip?: number; take?: number }) {
  const skip = options?.skip ?? 0;
  const take = options?.take ?? 50;
  const [wires, connectors, devices, drawings] = await Promise.all([
    prisma.wire.findMany({ where: { wireNo: { contains: term, mode: Prisma.QueryMode.insensitive } }, take: 20 }),
    prisma.connector.findMany({ where: { OR: [{ connectorCode: { contains: term, mode: Prisma.QueryMode.insensitive } }, { normCode: { contains: term, mode: Prisma.QueryMode.insensitive } }] }, include: { pins: true, device: true }, take: 20 }),
    prisma.deviceInstance.findMany({ where: { OR: [{ name: { contains: term, mode: 'insensitive' } }, { tag: { contains: term, mode: 'insensitive' } }] }, include: { system: true, type: true }, take: 20 }),
    prisma.drawingDocument.findMany({ where: { OR: [{ drawingNo: { contains: term, mode: 'insensitive' } }, { title: { contains: term, mode: 'insensitive' } }] }, take: 20 }),
  ]);
  return { wires, connectors, devices, drawings };
}

export async function getStats() {
  const [wireCount, connectorCount, deviceCount, drawingCount, systemCount, pinCount] = await Promise.all([
    prisma.wire.count(),
    prisma.connector.count(),
    prisma.deviceInstance.count(),
    prisma.drawingDocument.count(),
    prisma.system.count(),
    prisma.connectorPin.count(),
  ]);
  return { wireCount, connectorCount, deviceCount, drawingCount, systemCount, pinCount };
}

export async function getValidationIssues(severity?: string) {
  return prisma.validationIssue.findMany({
    where: severity ? { severity, resolved: false } : { resolved: false },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}