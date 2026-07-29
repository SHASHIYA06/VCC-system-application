/**
 * Separates network round-trip cost from query cost.
 *
 * If a trivial `SELECT 1` costs hundreds of ms, the bottleneck is the distance to
 * the Neon region, not the SQL — and the fix is to reduce the NUMBER of round
 * trips per request, not to optimise individual queries. This also tells us what
 * to expect on Vercel, which runs in the same region as the database.
 *
 * Run: DATABASE_URL="..." npx tsx scripts/measure-latency.ts
 */
import { prisma } from '../src/lib/prisma';

async function sample(label: string, fn: () => Promise<unknown>, n: number) {
  const times: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = Date.now();
    await fn();
    times.push(Date.now() - t0);
  }
  times.sort((a, b) => a - b);
  const min = times[0];
  const med = times[Math.floor(times.length / 2)];
  const max = times[times.length - 1];
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  console.log(
    `${label.padEnd(34)} min=${String(min).padStart(5)}ms  med=${String(med).padStart(5)}ms  ` +
      `avg=${String(avg).padStart(5)}ms  max=${String(max).padStart(5)}ms`,
  );
  return min;
}

async function main() {
  await prisma.$queryRaw`SELECT 1`; // warm

  console.log('\nRound-trip cost (10 sequential samples each):\n');
  const rtt = await sample('SELECT 1 (pure round trip)', () => prisma.$queryRaw`SELECT 1`, 10);
  await sample('SELECT COUNT(*) FROM "System"', () => prisma.$queryRaw`SELECT COUNT(*) FROM "System"`, 10);
  await sample('indexed Drawing lookup', () =>
    prisma.drawing.findFirst({ where: { drawingNo: '942-58120' }, select: { id: true } }), 10);
  await sample('COUNT(*) over 167k Wire rows', () => prisma.wire.count(), 5);

  console.log(`\nBaseline round trip: ~${rtt}ms`);
  console.log(
    'Anything above this is real query work; anything at this floor is pure\n' +
      'network distance and is paid once PER QUERY, so a route issuing N queries\n' +
      `cannot be faster than N x ${rtt}ms from this machine.\n`,
  );

  // How many round trips do the heaviest routes make?
  console.log('Implied floor for a route, by query count:');
  for (const n of [1, 2, 4, 6, 8]) {
    console.log(`  ${String(n).padStart(2)} queries -> >= ${n * rtt}ms from here`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
