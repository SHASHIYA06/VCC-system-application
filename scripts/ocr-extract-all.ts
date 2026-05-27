import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';

const execAsync = promisify(exec);
const prisma = new PrismaClient();
const DOCS_DIR = join(process.cwd(), 'public', 'DOCUMENTS');

const WIRE_REGEX = /\b([A-Z]{0,2})(\d{3,5})([a-zA-Z]?(?:\/\d{1,2})?)\b/g;
const DRAWING_REGEX = /\b(942)[-\s]?(\d{5})([A-D]?)\b/g;

function parseWireNumbers(text: string) {
  const wires: string[] = [];
  const seen = new Set<string>();
  
  WIRE_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = WIRE_REGEX.exec(text)) !== null) {
    const prefix = m[1] || '';
    const base = m[2];
    const suffix = m[3] || '';
    const numVal = parseInt(base);
    
    // Filter noise
    if (numVal < 1000 || numVal > 19999) continue;
    
    const wireNo = `${prefix}${base}${suffix}`.trim();
    if (!seen.has(wireNo) && wireNo.length >= 4) {
      seen.add(wireNo);
      wires.push(wireNo);
    }
  }
  return wires;
}

function parseDrawingNumbers(text: string) {
  const drawings: string[] = [];
  const seen = new Set<string>();
  
  DRAWING_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = DRAWING_REGEX.exec(text)) !== null) {
    const drawingNo = `942-${m[2]}${m[3] || ''}`;
    if (!seen.has(drawingNo)) {
      seen.add(drawingNo);
      drawings.push(drawingNo);
    }
  }
  return drawings;
}

function detectVoltageClass(text: string): string | null {
  if (/750\s*V\s*DC|TRACTION\s*POWER/i.test(text)) return '750VDC';
  if (/110\s*V\s*DC/i.test(text)) return '110VDC';
  if (/24\s*V\s*DC/i.test(text)) return '24VDC';
  if (/HIGH\s*VOLTAGE\b|HV\b/i.test(text)) return 'HV';
  if (/RETURN\s*CURRENT|EARTH\s*WIRE/i.test(text)) return 'EARTH';
  return null;
}

async function getPdfPageCount(filename: string): Promise<number> {
  const filePath = join(DOCS_DIR, filename);
  try {
    const { stdout } = await execAsync(`pdfinfo "${filePath}"`, { timeout: 10000 });
    const match = stdout.match(/Pages:\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
  } catch {
    return 0;
  }
}

async function extractPageText(filename: string, pageNo: number): Promise<string> {
  const filePath = join(DOCS_DIR, filename);
  const args = `-f ${pageNo} -l ${pageNo} -layout "${filePath}" -`;
  try {
    const { stdout } = await execAsync(`pdftotext ${args}`, { maxBuffer: 10 * 1024 * 1024 });
    return stdout.trim();
  } catch (err) {
    console.error(`Error extracting page ${pageNo} from ${filename}:`, err);
    return '';
  }
}

async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️ DB connection warning. Retrying in ${delay}ms... (Remaining retries: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeWithRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

async function main() {
  console.log('🚀 Starting Full PDF OCR Text Extraction & Database Seeding...\n');
  
  if (!existsSync(DOCS_DIR)) {
    console.error(`❌ Documents directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }
  
  const files = readdirSync(DOCS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`📂 Found ${files.length} PDF files in ${DOCS_DIR}:`);
  files.forEach(f => console.log(`  - ${f}`));
  
  // Find project
  const project = await prisma.project.findFirst();
  if (!project) {
    console.error('❌ No project found in database. Seed the base database first.');
    process.exit(1);
  }
  
  let totalWiresSaved = 0;
  let totalPagesProcessed = 0;
  
  for (const filename of files) {
    console.log(`\n--------------------------------------------------`);
    console.log(`📄 Processing: ${filename}`);
    const pageCount = await getPdfPageCount(filename);
    console.log(`   Total pages: ${pageCount}`);
    
    if (pageCount === 0) {
      console.log(`   ⚠️ Could not read page count or file is empty. Skipping.`);
      continue;
    }
    
    // Ensure SourceFile record exists
    let sourceFile = await executeWithRetry(() => prisma.sourceFile.findFirst({ where: { filename } }));
    if (!sourceFile) {
      sourceFile = await executeWithRetry(() => prisma.sourceFile.create({
        data: {
          projectId: project.id,
          filename,
          fileType: 'PDF',
          status: 'IN_PROGRESS',
        }
      }));
      console.log(`   Created SourceFile record: ${sourceFile.id}`);
    }
    
    console.log(`   Extracting pages and upserting data...`);
    
    for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
      // Skip if already processed in standard tables to optimize resume speed
      const existing = await executeWithRetry(() => prisma.ocrPage.findUnique({
        where: { sourceFileId_pageNo: { sourceFileId: filename, pageNo } },
        select: { parseStatus: true }
      })).catch(() => null);

      if (existing?.parseStatus === 'DONE') {
        totalPagesProcessed++;
        continue;
      }

      const text = await extractPageText(filename, pageNo);
      if (!text) continue;
      
      const wires = parseWireNumbers(text);
      const drawingNos = parseDrawingNumbers(text);
      
      // Save OcrPage (standard search tables)
      await executeWithRetry(() => prisma.ocrPage.upsert({
        where: { sourceFileId_pageNo: { sourceFileId: filename, pageNo } },
        create: {
          sourceFileId: filename,
          pageNo,
          sourcePageLabel: `Page ${pageNo}`,
          rawText: text.slice(0, 65000),
          parseStatus: 'DONE',
          extra: { drawingNos, wireCount: wires.length } as any,
        },
        update: {
          rawText: text.slice(0, 65000),
          parseStatus: 'DONE',
          extra: { drawingNos, wireCount: wires.length } as any,
        },
      }));
      
      // Save SourcePage (Prisma-specific tables)
      await executeWithRetry(() => prisma.sourcePage.upsert({
        where: { sourceFileId_pageNo: { sourceFileId: sourceFile.id, pageNo } },
        create: {
          sourceFileId: sourceFile.id,
          pageNo,
          rawText: text.slice(0, 65000),
          drawingNo: drawingNos[0] || null,
          metadata: { drawingNos, wireCount: wires.length } as any,
        },
        update: {
          rawText: text.slice(0, 65000),
          drawingNo: drawingNos[0] || null,
          metadata: { drawingNos, wireCount: wires.length } as any,
        },
      }));
      
      // Seed real wires
      for (const wireNo of wires) {
        try {
          const voltageClass = detectVoltageClass(text);
          await executeWithRetry(() => prisma.wire.upsert({
            where: { wireNo },
            create: {
              wireNo,
              voltageClass,
              description: drawingNos.length > 0 ? `From drawing ${drawingNos[0]}` : null,
              remarks: `OCR: ${filename} p.${pageNo}`,
            },
            update: {
              remarks: `OCR: ${filename} p.${pageNo}`,
            },
          }));
          totalWiresSaved++;
        } catch (e) {
          // ignore upsert conflicts
        }
      }
      
      // Map drawings to PDF files and pages
      for (const drawingNo of drawingNos) {
        await executeWithRetry(() => prisma.drawing.updateMany({
          where: { drawingNo },
          data: {
            sourceFileId: filename,
            drawingPdfUrl: `/api/pdf/${encodeURIComponent(filename)}`,
          },
        }));
      }
      
      totalPagesProcessed++;
      if (pageNo % 20 === 0 || pageNo === pageCount) {
        console.log(`   Progress: page ${pageNo}/${pageCount} processed...`);
      }
    }
    
    // Set SourceFile status to DONE
    await executeWithRetry(() => prisma.sourceFile.update({
      where: { id: sourceFile.id },
      data: { status: 'DONE' },
    }));
    console.log(`   Finished processing ${filename}.`);
  }
  
  console.log(`\n==================================================`);
  console.log(`✅ OCR Extraction & Seeding Complete!`);
  console.log(`   Total Pages Processed: ${totalPagesProcessed}`);
  console.log(`   Total Real Wires Saved/Updated: ${totalWiresSaved}`);
  console.log(`==================================================\n`);
}

main()
  .then(() => {
    console.log('Script ran successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });
