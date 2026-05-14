import { prisma } from '@/lib/prisma';

export async function findConnectorPins(connectorCode: string) {
  return prisma.connector.findMany({
    where: { connectorCode },
    include: { pins: { orderBy: { pinNo: 'asc' } } },
  });
}

export async function findConnectorByCode(connectorCode: string) {
  return prisma.connector.findFirst({
    where: { connectorCode: { equals: connectorCode, mode: 'insensitive' } },
    include: {
      pins: { orderBy: { pinNo: 'asc' } },
    },
  });
}

export async function findConnectorsByDevice(deviceId: string) {
  return prisma.connector.findMany({
    where: { drawingId: deviceId },
    include: { pins: { orderBy: { pinNo: 'asc' } } },
  });
}