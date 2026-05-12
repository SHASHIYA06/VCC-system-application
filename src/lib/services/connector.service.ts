import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export async function findConnectorPins(connectorCode: string) {
  return prisma.connector.findMany({
    where: { OR: [{ connectorCode }, { normCode: connectorCode.toUpperCase().replace(/[^A-Za-z0-9]/g, '') }] },
    include: { pins: { orderBy: { normPinNo: 'asc' } }, device: true },
  });
}

export async function findConnectorByCode(connectorCode: string) {
  return prisma.connector.findFirst({
    where: {
      OR: [
        { connectorCode: { equals: connectorCode, mode: Prisma.QueryMode.insensitive } },
        { normCode: connectorCode.toUpperCase().replace(/[^A-Z0-9]/g, '') },
      ],
    },
    include: {
      pins: { orderBy: { normPinNo: 'asc' } },
      device: { include: { system: true, type: true } },
    },
  });
}

export async function findConnectorsByDevice(deviceId: string) {
  return prisma.connector.findMany({
    where: { deviceId },
    include: { pins: { orderBy: { normPinNo: 'asc' } } },
  });
}