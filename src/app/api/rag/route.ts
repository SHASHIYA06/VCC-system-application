import { NextRequest, NextResponse } from 'next/server';
import { reindexAllDocuments, getAllDocuments } from '@/lib/rag/service';
import { prisma } from '@/lib/prisma';

interface PostgresStatus {
  connected: boolean;
  error: string | null;
  stats: { systems: number; devices: number; wires: number; drawings: number } | null;
}

interface MongoStatus {
  connected: boolean;
  error: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'status') {
      const mongoStatus: MongoStatus = { connected: false, error: null };
      let postgresStatus: PostgresStatus = { connected: false, error: null, stats: null };

      try {
        await prisma.$connect();
        postgresStatus.connected = true;
        const [systemCount, deviceCount, wireCount, drawingCount] = await Promise.all([
          prisma.system.count(),
          prisma.deviceInstance.count(),
          prisma.wire.count(),
          prisma.drawingDocument.count(),
        ]);
        postgresStatus.stats = { systems: systemCount, devices: deviceCount, wires: wireCount, drawings: drawingCount };
      } catch (e) {
        const err = e as Error;
        postgresStatus.error = err.message || 'Connection failed';
      }

      try {
        const docs = await getAllDocuments();
        mongoStatus.connected = true;
        return NextResponse.json({
          mongoDB: { connected: true, documentCount: docs.length },
          postgresql: postgresStatus,
          status: 'ok',
        });
      } catch (e) {
        const err = e as Error;
        mongoStatus.error = err.message || 'Connection failed';
        return NextResponse.json({
          mongoDB: mongoStatus,
          postgresql: postgresStatus,
          status: 'degraded',
        });
      }
    }

    if (action === 'list') {
      const docs = await getAllDocuments();
      return NextResponse.json({
        documents: docs.map(d => ({
          id: d.documentId,
          fileName: d.fileName,
          carType: d.carType,
          subsystem: d.subsystem,
          title: d.title,
          pageCount: d.pageCount,
          createdAt: d.createdAt,
        })),
        count: docs.length,
      });
    }

    return NextResponse.json({ message: 'Use ?action=status or ?action=list' });
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json({ error: 'RAG operation failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'reindex') {
      await reindexAllDocuments();
      return NextResponse.json({ message: 'Reindexing completed' });
    }

    if (action === 'index_drawing') {
      const { drawingId } = body;
      const drawing = await prisma.drawingDocument.findUnique({
        where: { id: drawingId },
        include: { pages: true },
      });

      if (!drawing) {
        return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
      }

      const content = drawing.pages.map(p => p.ocrText || '').join('\n\n');
      const { indexDocument } = await import('@/lib/rag/service');
      await indexDocument(
        drawing.id,
        drawing.sourceFile || drawing.drawingNo || 'unknown',
        drawing.carType || 'Unknown',
        drawing.subsystem || 'Unknown',
        drawing.title || 'Untitled',
        content,
        drawing.pages.length
      );

      return NextResponse.json({ message: 'Document indexed successfully' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('RAG indexing error:', error);
    return NextResponse.json({ error: 'Indexing failed' }, { status: 500 });
  }
}