import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function t<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  const r = await fn();
  console.log(`  ${String(Date.now() - t0).padStart(6)}ms  ${label}`);
  return r;
}

async function main() {
  console.log('\nGSD query profile (sequential, to isolate cost):\n');

  await t('system.findMany + _count', () =>
    prisma.system.findMany({
      select: { code: true, name: true, sortOrder: true, _count: { select: { devices: true, drawings: true } } },
      orderBy: { sortOrder: 'asc' },
    }));

  await t('device.count', () => prisma.device.count());
  await t('wire.count  (167k rows)', () => prisma.wire.count());
  await t('system.count', () => prisma.system.count());
  await t('connector.count', () => prisma.connector.count());
  await t('wireEndpoint.count  (78k rows)', () => prisma.wireEndpoint.count());
  await t('device.groupBy systemId', () => prisma.device.groupBy({ by: ['systemId'], _count: true }));
  await t('system.findMany id+code', () => prisma.system.findMany({ select: { id: true, code: true } }));

  await t('wire.findMany 250 + 2 endpoints (nested)', () =>
    prisma.wire.findMany({
      where: { endpoints: { some: {} } },
      select: {
        id: true, wireNo: true, signalName: true, voltageClass: true, conductorClassCode: true,
        endpoints: {
          take: 2,
          select: {
            endpointRole: true, endpointPin: true,
            device: { select: { id: true, tagNo: true, deviceName: true, system: { select: { code: true } } } },
            connector: { select: { id: true, connectorCode: true, drawing: { select: { drawingNo: true, system: { select: { code: true } } } } } },
          },
        },
      },
      take: 250,
    }));

  await t('APPROX counts via pg_class', () => prisma.$queryRaw`
    SELECT relname, reltuples::bigint AS est
    FROM pg_class
    WHERE relname IN ('Wire','WireEndpoint','Connector','ConnectorPin','Device','Drawing')`);

  console.log();
}

main().catch(console.error).finally(() => prisma.$disconnect());
