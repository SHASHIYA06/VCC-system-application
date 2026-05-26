// src/app/api/drawings/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing drawing id' }, { status: 400 });
  }

  const drawing = await prisma.drawing.findUnique({
    where: { id },
    select: { drawingPdfUrl: true },
  });

  if (!drawing || !drawing.drawingPdfUrl) {
    return NextResponse.json({ error: 'PDF not found for drawing' }, { status: 404 });
  }

  // Resolve absolute path – assume PDFs are stored under public/DOCUMENTS
  const pdfPath = path.join(process.cwd(), 'public', 'DOCUMENTS', drawing.drawingPdfUrl);
  if (!fs.existsSync(pdfPath)) {
    return NextResponse.json({ error: 'PDF file missing on server' }, { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(pdfPath);
  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', `inline; filename="${path.basename(pdfPath)}"`);

  return new NextResponse(fileBuffer, { status: 200, headers });
}
