import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('=== COMPLETE DATA AUDIT ===\n');
  
  // 1. Wire number format analysis
  const wireFormats = await prisma.$queryRaw`
    SELECT 
      CASE 
        WHEN "wireNo" ~ '/[0-9]+$' THEN 'SUFFIX-SLASH'
        WHEN "wireNo" ~ '[a-zA-Z]$' THEN 'SUFFIX-LETTER'
        WHEN "wireNo" ~ '[a-zA-Z]/' THEN 'LETTER-SLASH'
        ELSE 'PLAIN'
      END as fmt,
      COUNT(*)::bigint as cnt
    FROM "Wire" GROUP BY 1 ORDER BY cnt DESC`
  console.log('Wire number formats:', JSON.stringify(wireFormats, null, 2));
  
  // 2. Pin wireNo matching
  const pinWireStats = await prisma.$queryRaw`
    SELECT 
      CASE 
        WHEN p."wireNo" IS NULL THEN 'NO_WIRE'
        WHEN EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo") THEN 'EXACT_MATCH'
        WHEN EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = regexp_replace(p."wireNo", '[a-zA-Z/].*$', '')) THEN 'BASE_MATCH'
        ELSE 'NO_MATCH'
      END as type,
      COUNT(*)::bigint as cnt
    FROM "ConnectorPin" p GROUP BY 1`
  console.log('\nPin wireNo status:', JSON.stringify(pinWireStats, null, 2));
  
  // 3. Drawing system linkage
  const drawingSys = await prisma.$queryRaw`
    SELECT s."code" as sys, COUNT(d.id)::bigint as cnt
    FROM "Drawing" d LEFT JOIN "System" s ON d."systemId" = s.id
    GROUP BY s."code" ORDER BY s."sortOrder" NULLS LAST`
  console.log('\nDrawings by system:', JSON.stringify(drawingSys, null, 2));
  
  // 4. System hierarchy completeness
  const subSys = await prisma.subsystem.count();
  const devWithSys = await prisma.device.count({ where: { systemId: { not: null } } });
  console.log(`\nSubsystems: ${subSys}, Devices with System: ${devWithSys}/${274}`);
  
  // 5. Full data counts
  const [drawings, devices, connectors, pins, wires, wireEndpoints, connections] = await Promise.all([
    prisma.drawing.count(),
    prisma.device.count(),
    prisma.connector.count(),
    prisma.connectorPin.count(),
    prisma.wire.count(),
    prisma.wireEndpoint.count(),
    prisma.$queryRaw`SELECT COUNT(*)::bigint FROM "WireConnection"`
      .then(r => Number((r as any)[0].cnt))
  ]);
  console.log(`\nCOUNTS: Drawings=${drawings}, Devices=${devices}, Connectors=${connectors}, Pins=${pins}, Wires=${wires}, WireEndpoints=${wireEndpoints}, Connections=${connections}`);
  
  await prisma.$disconnect();
}
main();
