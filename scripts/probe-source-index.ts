/**
 * Looks for an authoritative "drawing list / index" in the OCR'd source pages so
 * the 307 placeholder drawing titles can be replaced with real ones. Read-only.
 * Run: DATABASE_URL="..." npx tsx scripts/probe-source-index.ts
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  const files = await prisma.$queryRaw<
    Array<{ filename: string; pages: bigint; with_text: bigint; with_dwg: bigint }>
  >`
    SELECT sf."filename",
           COUNT(sp.id)                                         AS pages,
           COUNT(sp."rawText")                                  AS with_text,
           COUNT(sp."drawingNo")                                AS with_dwg
    FROM "SourceFile" sf
    LEFT JOIN "SourcePage" sp ON sp."sourceFileId" = sf.id
    GROUP BY sf."filename"
    ORDER BY pages DESC`;

  console.log('SourceFile / SourcePage coverage:');
  console.log('  pages  w/text  w/dwgNo  filename');
  for (const f of files) {
    console.log(
      `  ${String(f.pages).padStart(5)}  ${String(f.with_text).padStart(6)}  ${String(
        f.with_dwg,
      ).padStart(7)}  ${f.filename}`,
    );
  }

  // Pages whose OCR text looks like a drawing index: many "942-#####" tokens.
  const candidates = await prisma.$queryRaw<
    Array<{ filename: string; pageNo: number; hits: number; sample: string }>
  >`
    SELECT sf."filename",
           sp."pageNo",
           ((length(sp."rawText") - length(replace(sp."rawText", '942-', ''))) / 4)::int AS hits,
           left(sp."rawText", 700) AS sample
    FROM "SourcePage" sp
    JOIN "SourceFile" sf ON sf.id = sp."sourceFileId"
    WHERE sp."rawText" LIKE '%942-%'
    ORDER BY hits DESC
    LIMIT 8`;

  console.log('\nPages with the most 942-XXXXX references (likely index pages):');
  for (const c of candidates) {
    console.log(`\n--- ${c.filename} p${c.pageNo}  (~${c.hits} refs) ---`);
    console.log(c.sample.replace(/[ \t]+/g, ' ').slice(0, 650));
  }

  // How many distinct drawing numbers did OCR actually tag on pages?
  const tagged = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT COUNT(DISTINCT "drawingNo") AS n FROM "SourcePage" WHERE "drawingNo" IS NOT NULL`;
  console.log(`\nDistinct drawingNo values tagged on SourcePage: ${tagged[0]?.n}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
