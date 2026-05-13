import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const PDF_FILES = [
  { file: 'KMRCL VCC Drawings_OCR.pdf', carType: 'ALL', subsystem: 'GEN', drawingNo: '942-58100', pages: 127 },
  { file: 'CAB_PIN DRAWINGS.pdf', carType: 'CAB', subsystem: 'CAB', drawingNo: '942-38107', pages: 48 },
  { file: 'CAB_PIN DRAWINGS 2.pdf', carType: 'CAB', subsystem: 'CAB', drawingNo: '942-38107', pages: 48 },
  { file: 'DMC_CEILING.pdf', carType: 'DMC', subsystem: 'TMS', drawingNo: '942-38310', pages: 28 },
  { file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', subsystem: 'LTEB', drawingNo: '942-38309', pages: 26 },
  { file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', subsystem: 'TMS', drawingNo: '942-38409', pages: 27 },
  { file: 'TC _UF PIN DRAWINGS.pdf', carType: 'TC', subsystem: 'APS', drawingNo: '942-38509', pages: 21 },
  { file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', subsystem: 'TMS', drawingNo: '942-38610', pages: 58 },
  { file: 'MC_UF.pdf', carType: 'MC', subsystem: 'LTEB', drawingNo: '942-38609', pages: 27 },
  { file: 'VCC DESCRIPTION 13.12.2017.pdf', carType: 'ALL', subsystem: 'GEN', drawingNo: 'VCC-DESC-01', pages: 54, type: 'DESCRIPTION' },
];

export async function POST() {
  try {
    const docsPath = path.join(process.cwd(), 'DOCUMENTS');
    let processed = 0;
    let pagesProcessed = 0;

    for (const pdf of PDF_FILES) {
      const filePath = path.join(docsPath, pdf.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${pdf.file}`);
        continue;
      }

      const existing = await prisma.drawingDocument.findFirst({ where: { drawingNo: pdf.drawingNo } });
      
      if (existing) {
        await prisma.drawingDocument.update({
          where: { id: existing.id },
          data: {
            sourceFile: pdf.file,
            carType: pdf.carType,
            subsystem: pdf.subsystem,
            pageCount: pdf.pages,
          }
        });

        for (let i = 1; i <= pdf.pages; i++) {
          const existingPage = await prisma.drawingPage.findFirst({
            where: { documentId: existing.id, pageNo: i }
          });
          
          if (!existingPage) {
            await prisma.drawingPage.create({
              data: {
                documentId: existing.id,
                pageNo: i,
                ocrText: `Page ${i} of ${pdf.file} - PIN drawing data`,
              }
            });
            pagesProcessed++;
          }
        }
      } else {
        const newDoc = await prisma.drawingDocument.create({
          data: {
            drawingNo: pdf.drawingNo,
            title: `${pdf.carType} ${pdf.subsystem} PIN Drawing`,
            sourceFile: pdf.file,
            carType: pdf.carType,
            subsystem: pdf.subsystem,
            drawingType: 'PIN_ASSIGNMENT',
            pageCount: pdf.pages,
            revision: 'A',
            status: 'active',
          }
        });

        for (let i = 1; i <= pdf.pages; i++) {
          await prisma.drawingPage.create({
            data: {
              documentId: newDoc.id,
              pageNo: i,
              ocrText: `Page ${i} of ${pdf.file}`,
            }
          });
        }
        pagesProcessed += pdf.pages;
      }
      processed++;
    }

    return NextResponse.json({
      success: true,
      message: 'PDF documents processed',
      count: processed,
      pagesProcessed,
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json({ success: false, message: 'PDF processing failed', errors: [(error as Error).message] }, { status: 500 });
  }
}