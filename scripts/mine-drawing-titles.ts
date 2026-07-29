/**
 * Mines authoritative drawing titles out of the OCR'd source pages.
 *
 * The `VCC DESCRIPTION 13.12.2017.pdf` table of contents lists entries shaped
 * like `9.2 APS (942-58130) ...... 38`, i.e. the real engineering title followed
 * by the drawing number in brackets. That is the only authoritative
 * title-to-number mapping in the corpus, so we harvest every occurrence of that
 * shape across every page (not just the four TOC pages) and report coverage
 * against the 575 Drawing rows.
 *
 * READ-ONLY. Writes nothing; prints a proposed mapping for review.
 * Run: DATABASE_URL="..." npx tsx scripts/mine-drawing-titles.ts
 */
import { prisma } from '../src/lib/prisma';

/** `Some Title (942-58130)` — title before, number in brackets. */
const TITLE_THEN_NO = /([A-Za-z][A-Za-z0-9 ,&\-\/'.+]{2,70}?)\s*\(\s*(942-\d{5})\s*\)/g;

/** Leading TOC numbering such as "9.2 " or "12.3.1 ". */
const LEADING_SECTION = /^\s*\d+(?:\.\d+)*\s*/;

/** Dot leaders and trailing page numbers left over from the TOC. */
const DOT_LEADERS = /[.\u2026]{2,}.*$/;

function clean(raw: string): string {
  let t = raw.replace(DOT_LEADERS, '').replace(LEADING_SECTION, '').trim();
  t = t.replace(/\s{2,}/g, ' ');
  // Drop obvious OCR noise from drawing-border text.
  if (/machining|deviation|tolerance|^[\dI |]+$/i.test(t)) return '';
  return t;
}

async function main() {
  const pages = await prisma.sourcePage.findMany({
    where: { rawText: { not: null } },
    select: { pageNo: true, rawText: true, sourceFile: { select: { filename: true } } },
  });
  console.log(`Scanning ${pages.length} OCR'd pages...\n`);

  // drawingNo -> candidate titles with the number of times each was seen.
  const found = new Map<string, Map<string, number>>();

  for (const p of pages) {
    const text = p.rawText ?? '';
    for (const m of text.matchAll(TITLE_THEN_NO)) {
      const title = clean(m[1]);
      const no = m[2];
      if (title.length < 3 || title.length > 70) continue;
      const bucket = found.get(no) ?? new Map<string, number>();
      bucket.set(title, (bucket.get(title) ?? 0) + 1);
      found.set(no, bucket);
    }
  }

  // Pick the most frequently seen title per drawing number, tie-broken by length
  // (longer titles carry more signal than truncated OCR fragments).
  const best = new Map<string, string>();
  for (const [no, bucket] of found) {
    const ranked = [...bucket.entries()].sort(
      (a, b) => b[1] - a[1] || b[0].length - a[0].length,
    );
    best.set(no, ranked[0][0]);
  }

  console.log(`Distinct drawing numbers with a mined title: ${best.size}\n`);

  const drawings = await prisma.drawing.findMany({
    select: { id: true, drawingNo: true, title: true },
    orderBy: { drawingNo: 'asc' },
  });

  const PLACEHOLDER =
    /^(GEN Circuit 942-\d+|VCC Reference Document VCC-REF-\d+|.*_OCR - Page \d+)$/i;

  let matched = 0;
  let wouldFix = 0;
  let alreadyGood = 0;
  const proposals: Array<{ drawingNo: string; from: string; to: string }> = [];
  const stillPlaceholder: string[] = [];

  for (const d of drawings) {
    const mined = best.get(d.drawingNo);
    const isPlaceholder = PLACEHOLDER.test(d.title ?? '');
    if (mined) {
      matched++;
      if (isPlaceholder || (d.title ?? '').trim() !== mined) {
        wouldFix++;
        proposals.push({ drawingNo: d.drawingNo, from: d.title ?? '', to: mined });
      } else {
        alreadyGood++;
      }
    } else if (isPlaceholder) {
      stillPlaceholder.push(d.drawingNo);
    }
  }

  console.log(`Drawing rows: ${drawings.length}`);
  console.log(`  covered by a mined title : ${matched}`);
  console.log(`    already correct        : ${alreadyGood}`);
  console.log(`    would be corrected     : ${wouldFix}`);
  console.log(`  still placeholder / none : ${stillPlaceholder.length}`);

  console.log('\nProposed corrections (first 40):');
  for (const p of proposals.slice(0, 40)) {
    console.log(`  ${p.drawingNo}  "${p.from}"\n              -> "${p.to}"`);
  }

  console.log('\nMined titles with no matching Drawing row:');
  const orphanNos = [...best.keys()].filter((n) => !drawings.some((d) => d.drawingNo === n));
  for (const n of orphanNos) console.log(`  ${n} -> "${best.get(n)}"`);

  console.log(`\nDrawings that will remain without a real title: ${stillPlaceholder.length}`);
  console.log('  ' + stillPlaceholder.slice(0, 20).join(', ') + (stillPlaceholder.length > 20 ? ' ...' : ''));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
