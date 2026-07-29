/**
 * Drawing-table audit: duplicate drawing numbers, title provenance, and
 * system assignment. Read-only.
 * Run: DATABASE_URL="..." npx tsx scripts/audit-drawings.ts
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  const total = await prisma.drawing.count();
  console.log(`Drawing rows: ${total}\n`);

  // 1. Duplicate drawing numbers — legitimate only if revisions differ.
  const dupes = await prisma.$queryRaw<
    Array<{ drawingNo: string; rows: bigint; revisions: string; titles: string }>
  >`
    SELECT "drawingNo",
           COUNT(*)                                   AS rows,
           string_agg(DISTINCT "revision", ',' ORDER BY "revision") AS revisions,
           string_agg(DISTINCT "title", ' | ')        AS titles
    FROM "Drawing"
    GROUP BY "drawingNo"
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC, "drawingNo"`;

  console.log(`Drawing numbers appearing more than once: ${dupes.length}`);
  const sameRev = dupes.filter((d) => d.revisions.split(',').length < Number(d.rows));
  console.log(`  ...of which have FEWER distinct revisions than rows: ${sameRev.length}`);
  console.log('\n  First 15:');
  for (const d of dupes.slice(0, 15)) {
    console.log(`   ${d.drawingNo}  rows=${d.rows} revs=[${d.revisions}]`);
    console.log(`      titles: ${d.titles.slice(0, 140)}`);
  }

  // 2. Revision distribution.
  const revs = await prisma.$queryRaw<Array<{ revision: string; n: bigint }>>`
    SELECT "revision", COUNT(*) AS n FROM "Drawing" GROUP BY 1 ORDER BY 2 DESC`;
  console.log('\nRevision distribution:');
  for (const r of revs) console.log(`   "${r.revision}": ${r.n}`);

  // 3. Title provenance — how many titles are fabricated?
  const buckets = await prisma.$queryRaw<Array<{ kind: string; n: bigint }>>`
    SELECT CASE
             WHEN "title" IS NULL OR btrim("title") = ''      THEN 'empty'
             WHEN "title" ~ '^GEN Circuit 942-'               THEN 'placeholder: GEN Circuit'
             WHEN "title" ~ '^VCC Reference Document VCC-REF' THEN 'placeholder: VCC-REF'
             WHEN "title" ~ 'Page [0-9]+$'                    THEN 'placeholder: OCR page'
             WHEN "title" ~ '^[0-9-]+$'                       THEN 'placeholder: numeric only'
             ELSE 'looks real'
           END AS kind,
           COUNT(*) AS n
    FROM "Drawing" GROUP BY 1 ORDER BY 2 DESC`;
  console.log('\nTitle provenance:');
  for (const b of buckets) console.log(`   ${String(b.n).padStart(4)}  ${b.kind}`);

  // 4. Drawings whose system is the GEN catch-all or unset.
  const bySys = await prisma.$queryRaw<Array<{ code: string | null; n: bigint }>>`
    SELECT s."code", COUNT(*) AS n
    FROM "Drawing" d LEFT JOIN "System" s ON s.id = d."systemId"
    GROUP BY 1 ORDER BY 2 DESC`;
  console.log('\nDrawings per system:');
  for (const b of bySys) console.log(`   ${String(b.n).padStart(4)}  ${b.code ?? '(no system)'}`);

  // 5. Do drawings actually have renderable pages + a resolvable PDF?
  const health = await prisma.$queryRaw<
    Array<{ no_source: bigint; no_pages: bigint; no_mapping: bigint }>
  >`
    SELECT
      COUNT(*) FILTER (WHERE d."sourceFileId" IS NULL) AS no_source,
      COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM "DrawingPage" p WHERE p."drawingId" = d.id)) AS no_pages,
      COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM "DrawingPageMapping" m WHERE m."drawingId" = d.id)) AS no_mapping
    FROM "Drawing" d`;
  const h = health[0];
  console.log('\nViewer readiness:');
  console.log(`   without sourceFileId        : ${h.no_source}`);
  console.log(`   without any DrawingPage     : ${h.no_pages}`);
  console.log(`   without any PageMapping     : ${h.no_mapping}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
