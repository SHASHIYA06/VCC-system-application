import { prisma } from '@/lib/prisma';

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