import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const missing = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT p."wireNo")::bigint AS count
       FROM "ConnectorPin" p
       WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
         AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")`
    );
    console.log('DISTINCT pin wireNos with NO Wire row (would be created):', Number(missing[0].count));

    const pinsAffected = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count
       FROM "ConnectorPin" p
       WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
         AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")`
    );
    console.log('PINS that would become traceable after creating those wires:', Number(pinsAffected[0].count));

    // sample of missing pin wireNos
    const sample = await prisma.$queryRawUnsafe<{ wireNo: string }[]>(
      `SELECT DISTINCT p."wireNo"
       FROM "ConnectorPin" p
       WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
         AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")
       LIMIT 20`
    );
    console.log('sample missing wireNos:', sample.map(s => s.wireNo).join(', '));
  } catch (e) {
    console.error('AUDIT ERROR:', (e as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
