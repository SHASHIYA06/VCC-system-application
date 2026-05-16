import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function searchDrawings(term: string, options?: { skip?: number; take?: number }) {
  const where = term
    ? {
        OR: [
          { drawingNo: { contains: term } },
          { title: { contains: term } },
          { remarks: { contains: term } },
        ],
      }
    : {};
  return prisma.drawing.findMany({
    where,
    skip: options?.skip,
    take: options?.take,
    include: { pages: { orderBy: { pageNo: 'asc' } } },
    orderBy: { drawingNo: 'asc' },
  });
}

export async function findDrawingByNumber(drawingNo: string) {
  return prisma.drawing.findFirst({
    where: { drawingNo: { equals: drawingNo } },
    include: { pages: { orderBy: { pageNo: 'asc' } } },
  });
}

export async function getAllDrawings(options?: { systemCode?: string; skip?: number; take?: number }) {
  const where: Prisma.DrawingWhereInput = {};
  
  if (options?.systemCode) {
    where.system = { code: options.systemCode };
  }

  return prisma.drawing.findMany({
    where,
    skip: options?.skip,
    take: options?.take || 500,
    include: { 
      system: true,
      _count: { select: { connectors: true, trainLines: true, pages: true } }
    },
    orderBy: { drawingNo: 'asc' },
  });
}

export async function getDrawingWithDetails(drawingNoOrId: string) {
  const drawing = await prisma.drawing.findFirst({
    where: {
      OR: [
        { id: drawingNoOrId },
        { drawingNo: { contains: drawingNoOrId, mode: Prisma.QueryMode.insensitive } },
      ],
    },
    include: {
      pages: { orderBy: { pageNo: 'asc' } },
      system: true,
      connectors: { include: { pins: true } },
    },
  });

  if (!drawing) return null;

  const pins = await prisma.connectorPin.findMany({
    where: {
      connector: { drawingId: drawing.id },
    },
    include: {
      connector: true,
    },
    take: 500,
  });

  const trainLines = await prisma.trainLine.findMany({
    where: { drawingId: drawing.id },
    take: 100,
  });

  return {
    drawing,
    pins,
    connectors: drawing.connectors,
    trainLines,
  };
}

export async function getDrawingsBySystem(systemCode: string) {
  return prisma.drawing.findMany({
    where: { system: { code: systemCode } },
    include: { system: true },
    orderBy: { drawingNo: 'asc' },
  });
}

export async function getDrawingStats() {
  const [total, bySystem, byType] = await Promise.all([
    prisma.drawing.count(),
    prisma.drawing.groupBy({
      by: ['systemId'],
      _count: true,
    }),
    prisma.drawing.findMany({
      select: { system: { select: { code: true, name: true } }, _count: true },
      take: 0,
    }),
  ]);

  const systemCounts = await prisma.system.findMany({
    include: {
      _count: { select: { drawings: true } },
    },
  });

  return {
    total,
    bySystem: systemCounts.map(s => ({
      code: s.code,
      name: s.name,
      count: s._count.drawings,
    })),
  };
}