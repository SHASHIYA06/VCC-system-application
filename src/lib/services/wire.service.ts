import { prisma } from '@/lib/prisma';

export async function searchWires(query: string, limit: number = 50) {
  const wires = await prisma.wire.findMany({
    where: {
      OR: [
        { wireNo: { contains: query } },
        { signalName: { contains: query } },
      ],
    },
    take: limit,
    orderBy: { wireNo: 'asc' },
  });

  return wires.map(w => ({
    wireNo: w.wireNo,
    signalName: w.signalName,
    wireColor: w.wireColor,
    voltageClass: w.voltageClass,
    sourceConnector: w.sourceConnector,
    destConnector: w.destConnector,
  }));
}

export async function getWireDetails(wireNo: string) {
  return prisma.wire.findUnique({
    where: { wireNo },
    include: { endpoints: true },
  });
}