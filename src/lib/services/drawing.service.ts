import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export async function searchDrawings(term: string, options?: { skip?: number; take?: number }) {
  const where = term
    ? {
        OR: [
          { drawingNo: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { title: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { subsystem: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { carType: { contains: term, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};
  return prisma.drawingDocument.findMany({
    where,
    skip: options?.skip,
    take: options?.take,
    include: { devices: true, pages: { orderBy: { pageNo: 'asc' } } },
    orderBy: { drawingNo: 'asc' },
  });
}

export async function findDrawingByNumber(drawingNo: string) {
  return prisma.drawingDocument.findFirst({
    where: { drawingNo: { equals: drawingNo, mode: 'insensitive' } },
    include: { devices: { include: { system: true, type: true, connectors: { include: { pins: true } } } }, pages: { orderBy: { pageNo: 'asc' } } },
  });
}