/**
 * Does Prisma actually run Promise.all queries concurrently against the Neon
 * pooled endpoint? Uses pg_sleep so the answer is unambiguous.
 * Run: DATABASE_URL="..." npx tsx scripts/probe-parallel.ts
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.$queryRaw`SELECT 1`; // warm

  let t0 = Date.now();
  await Promise.all([
    prisma.$queryRaw`SELECT pg_sleep(1)::text AS s`,
    prisma.$queryRaw`SELECT pg_sleep(1)::text AS s`,
    prisma.$queryRaw`SELECT pg_sleep(1)::text AS s`,
  ]);
  const par = Date.now() - t0;

  t0 = Date.now();
  await prisma.$queryRaw`SELECT pg_sleep(1)::text AS s`;
  const one = Date.now() - t0;

  console.log(`single 1s sleep        : ${one}ms`);
  console.log(`3x 1s sleep in parallel: ${par}ms`);
  console.log(
    par < one * 2
      ? '=> CONCURRENT (pool works)'
      : '=> SERIALIZED (only one connection in use)',
  );

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
