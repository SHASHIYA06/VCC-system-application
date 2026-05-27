import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const execAsync = promisify(exec);
const DOCS_DIR = join(process.cwd(), 'public', 'DOCUMENTS');

// ─── Wire number regex: 3001, 3001a, 3001/1, Y4181, X3001A ──────────────────
const WIRE_REGEX = /\b([A-Z]{0,2})(\d{3,5})([a-zA-Z]?(?:\/\d{1,2})?)\b/g;
const DRAWING_REGEX = /\b(942)[-\s]?(\d{5})([A-D]?)\b/g;

function parseWireNumbers(text: string) {
  const wires: { wireNo: string; base: string; prefix: string; suffix: string }[] = [];
  const seen = new Set<string>();
  
  WIRE_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = WIRE_REGEX.exec(text)) !== null) {
    const prefix = m[1] || '';
    const base = m[2];
    const suffix = m[3] || '';
    const numVal = parseInt(base);
    
    // Filter noise: too small, too large, tolerance values, year numbers
    if (numVal < 1000 || numVal > 19999) continue;
    
    const wireNo = `${prefix}${base}${suffix}`.trim();
    if (!seen.has(wireNo) && wireNo.length >= 4) {
      seen.add(wireNo);
      wires.push({ wireNo, prefix, base, suffix });
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

async function extractPagesWithPdftotext(
  filename: string, 
  startPage: number, 
  endPage: number
): Promise<{ pageNo: number; text: string }[]> {
  const filePath = join(DOCS_DIR, filename);
  const args = `-f ${startPage} -l ${endPage} -layout "${filePath}" -`;
  const { stdout } = await execAsync(`pdftotext ${args}`, { maxBuffer: 100 * 1024 * 1024 });
  
  const pageTexts = stdout.split('\f');
  return pageTexts
    .map((text, idx) => ({ pageNo: startPage + idx, text: text.trim() }))
    .filter(p => p.text.length > 10);
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

// ─── GET: status of extraction ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('file');
  
  const PDF_FILES = [
    'KMRCL VCC Drawings_OCR.pdf',
    'CAB_PIN DRAWINGS.pdf',
    'CAB_PIN DRAWINGS 2.pdf',
    'DMC UF_PIN DRAWINGS.pdf',
    'DMC_CEILING.pdf',
    'TC _UF PIN DRAWINGS.pdf',
    'TC_CEILING PIN DRAWINGS.pdf',
    'MC_UF.pdf',
    'MC_CEILING_PIN DRAWINGS.pdf',
    'VCC DESCRIPTION 13.12.2017.pdf',
  ];
  
  const files = filename ? [filename] : PDF_FILES;
  
  const statuses = await Promise.all(files.map(async (f) => {
    const filePath = join(DOCS_DIR, f);
    if (!existsSync(filePath)) return { filename: f, exists: false, totalPages: 0, indexedPages: 0 };
    
    const totalPages = await getPdfPageCount(f).catch(() => 0);
    const indexedPages = await prisma.ocrPage.count({ 
      where: { sourceFileId: { contains: f } } 
    }).catch(() => 0);
    
    // Also count via SourceFile path
    const sf = await prisma.sourceFile.findFirst({ where: { filename: f } }).catch(() => null);
    const sfIndexed = sf ? await prisma.sourcePage.count({ where: { sourceFileId: sf.id } }).catch(() => 0) : 0;
    
    return {
      filename: f,
      exists: true,
      totalPages,
      indexedPages: Math.max(indexedPages, sfIndexed),
      sourceFileId: sf?.id,
    };
  }));
  
  const totalWires = await prisma.wire.count().catch(() => 0);
  const totalDrawings = await prisma.drawing.count().catch(() => 0);
  
  return NextResponse.json({ files: statuses, totalWires, totalDrawings });
}

// ─── POST: run extraction for a file ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('file') || 'KMRCL VCC Drawings_OCR.pdf';
  const startPage = parseInt(searchParams.get('start') || '1');
  const batchSize = parseInt(searchParams.get('batch') || '20');
  const dryRun = searchParams.get('dry_run') === 'true';
  
  const filePath = join(DOCS_DIR, filename);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: `File not found: ${filename}` }, { status: 404 });
  }
  
  try {
    const totalPages = await getPdfPageCount(filename);
    const endPage = Math.min(startPage + batchSize - 1, totalPages);
    
    if (startPage > totalPages) {
      return NextResponse.json({ 
        message: 'All pages already processed',
        totalPages,
        isComplete: true,
      });
    }
    
    // Ensure SourceFile record exists
    let sourceFile = await prisma.sourceFile.findFirst({ where: { filename } });
    if (!sourceFile && !dryRun) {
      const project = await prisma.project.findFirst();
      if (project) {
        sourceFile = await prisma.sourceFile.create({
          data: {
            projectId: project.id,
            filename,
            fileType: 'PDF',
            status: 'IN_PROGRESS',
          }
        });
      }
    }
    
    // Extract text from pages
    const pages = await extractPagesWithPdftotext(filename, startPage, endPage);
    
    const stats = {
      filename,
      startPage,
      endPage,
      totalPages,
      pagesExtracted: pages.length,
      wiresFound: 0,
      drawingsFound: 0,
      wiresSaved: 0,
      errors: [] as string[],
    };
    
    for (const page of pages) {
      try {
        const wires = parseWireNumbers(page.text);
        const drawingNos = parseDrawingNumbers(page.text);
        
        stats.wiresFound += wires.length;
        stats.drawingsFound += drawingNos.length;
        
        if (dryRun) {
          // Just report what was found
          continue;
        }
        
        // 1. Save to OcrPage table for full-text search
        await prisma.ocrPage.upsert({
          where: { sourceFileId_pageNo: { sourceFileId: filename, pageNo: page.pageNo } },
          create: {
            sourceFileId: filename,
            pageNo: page.pageNo,
            sourcePageLabel: `Page ${page.pageNo}`,
            rawText: page.text.slice(0, 65000),
            parseStatus: 'DONE',
            extra: { drawingNos, wireCount: wires.length } as any,
          },
          update: {
            rawText: page.text.slice(0, 65000),
            parseStatus: 'DONE',
            extra: { drawingNos, wireCount: wires.length } as any,
          },
        });
        
        // 2. Also save to SourcePage if we have a SourceFile record
        if (sourceFile) {
          await prisma.sourcePage.upsert({
            where: { sourceFileId_pageNo: { sourceFileId: sourceFile.id, pageNo: page.pageNo } },
            create: {
              sourceFileId: sourceFile.id,
              pageNo: page.pageNo,
              rawText: page.text.slice(0, 65000),
              drawingNo: drawingNos[0] || null,
              metadata: { drawingNos, wireCount: wires.length } as any,
            },
            update: {
              rawText: page.text.slice(0, 65000),
              drawingNo: drawingNos[0] || null,
              metadata: { drawingNos, wireCount: wires.length } as any,
            },
          });
        }
        
        // 3. Upsert wire numbers (real data from PDFs)
        for (const wire of wires.slice(0, 50)) {
          try {
            const voltageClass = detectVoltageClass(page.text);
            await prisma.wire.upsert({
              where: { wireNo: wire.wireNo },
              create: {
                wireNo: wire.wireNo,
                voltageClass,
                description: drawingNos.length > 0 ? `From drawing ${drawingNos[0]}` : null,
                remarks: `OCR: ${filename} p.${page.pageNo}`,
              },
              update: {
                // Don't overwrite existing good data — just add remarks
                remarks: `OCR: ${filename} p.${page.pageNo}`,
              },
            });
            stats.wiresSaved++;
          } catch {
            // Duplicate or constraint — skip
          }
        }
        
        // 4. Update drawing records with correct source file
        for (const drawingNo of drawingNos) {
          await prisma.drawing.updateMany({
            where: { drawingNo },
            data: { 
              sourceFileId: filename,
              drawingPdfUrl: `/api/pdf/${encodeURIComponent(filename)}`,
            },
          });
        }
        
      } catch (pageErr) {
        stats.errors.push(`Page ${page.pageNo}: ${String(pageErr).slice(0, 200)}`);
      }
    }
    
    // Update source file status
    if (!dryRun && sourceFile) {
      await prisma.sourceFile.update({
        where: { id: sourceFile.id },
        data: { status: endPage >= totalPages ? 'DONE' : 'IN_PROGRESS' },
      });
    }
    
    const nextBatch = endPage < totalPages 
      ? { start: endPage + 1, end: Math.min(endPage + batchSize, totalPages) }
      : null;
    
    return NextResponse.json({
      ...stats,
      isComplete: endPage >= totalPages,
      nextBatch,
      dryRun,
      message: dryRun 
        ? `Dry run: found ${stats.wiresFound} wires, ${stats.drawingsFound} drawings on pages ${startPage}-${endPage}`
        : `Processed pages ${startPage}-${endPage} of ${totalPages}. Saved ${stats.wiresSaved} wires.`,
    });
    
  } catch (error) {
    console.error('OCR extract error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
