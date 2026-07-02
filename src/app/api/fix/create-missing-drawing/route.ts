import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * CREATE MISSING DRAWING 942-38119
 * This drawing exists in CAB_PIN DRAWINGS 2.pdf but is missing from the database.
 */
export async function POST() {
  try {
    // Check if already exists
    const existing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-38119' },
    });

    if (existing) {
      return NextResponse.json({ error: '942-38119 already exists', id: existing.id });
    }

    // Find the PIS system
    const pisSystem = await prisma.system.findFirst({
      where: { code: 'PIS' },
    });

    // Find the project
    const project = await prisma.project.findFirst();

    if (!project) {
      return NextResponse.json({ error: 'No project found' }, { status: 500 });
    }

    // Create the drawing
    const drawing = await prisma.drawing.create({
      data: {
        projectId: project.id,
        systemId: pisSystem?.id || null,
        drawingNo: '942-38119',
        revision: '0',
        title: 'PIS/TIS Pin Assignment',
        totalSheets: 1,
        status: 'ACTIVE',
        remarks: 'PIS|CAB',
      },
    });

    // Create DrawingPageMapping
    await prisma.drawingPageMapping.create({
      data: {
        drawingId: drawing.id,
        sourceFileName: 'CAB_PIN DRAWINGS 2.pdf',
        pdfPageNo: 35,
        drawingNumber: '942-38119',
        verified: true,
        confidence: 1.0,
        verificationDate: new Date(),
        notes: 'Verified via pdftotext content extraction',
      },
    });

    return NextResponse.json({
      status: 'success',
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
      },
      pdfMapping: {
        sourceFile: 'CAB_PIN DRAWINGS 2.pdf',
        page: 35,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
