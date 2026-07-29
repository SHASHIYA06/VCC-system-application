/**
 * Performance + correctness probe for the rewritten GSD topology builder.
 * Run: DATABASE_URL="..." npx ts-node --transpile-only scripts/profile-gsd3.ts
 */
import { getSystemTopology } from '../src/lib/gsd/topology';
import { prisma } from '../src/lib/prisma';

async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  const out = await fn();
  console.log(`${label}: ${Date.now() - t0}ms`);
  return out;
}

async function main() {
  // Warm the pool so the first measurement isn't connection setup.
  await timed('warmup SELECT 1', () => prisma.$queryRaw`SELECT 1`);

  const cold = await timed('getSystemTopology() cold', () => getSystemTopology());
  console.log(
    `  nodes=${cold.nodes.length} edges=${cold.edges.length} systems=${cold.systems.length}`,
  );
  console.log(
    `  stats: devices=${cold.statistics.totalDevices} wires=${cold.statistics.totalWires} ` +
      `connections=${cold.statistics.totalConnections} connectors=${cold.statistics.connectorCount} ` +
      `systems=${cold.statistics.systemCount}`,
  );
  console.log(`  devicesBySystem keys=${Object.keys(cold.statistics.devicesBySystem).length}`);

  const warm = await timed('getSystemTopology() warm', () => getSystemTopology());
  console.log(`  nodes=${warm.nodes.length} edges=${warm.edges.length}`);

  const filtered = await timed("getSystemTopology('TCMS')", () => getSystemTopology('TCMS'));
  console.log(`  nodes=${filtered.nodes.length} edges=${filtered.edges.length}`);

  // Sanity: every edge must reference nodes that exist.
  const ids = new Set(warm.nodes.map((n) => n.id));
  const dangling = warm.edges.filter((e) => !ids.has(e.source) || !ids.has(e.target));
  console.log(`  dangling edges: ${dangling.length} (expected 0)`);

  const noSelfLoops = warm.edges.every((e) => e.source !== e.target);
  console.log(`  no self loops: ${noSelfLoops} (expected true)`);

  const sample = warm.edges[0];
  if (sample) {
    console.log(
      `  sample edge: ${sample.label} ${sample.source} -> ${sample.target} (${sample.type})`,
    );
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
