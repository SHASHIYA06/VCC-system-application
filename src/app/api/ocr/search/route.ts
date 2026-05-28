import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const drawingNo = searchParams.get('drawing_no');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    const searchTerm = query.trim();

    // Build the where clause
    const whereClause: any = {
      ocrText: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    };

    // If drawing number is specified, filter by it
    if (drawingNo) {
      whereClause.drawing = {
        drawingNo: {
          equals: drawingNo,
          mode: 'insensitive',
        },
      };
    }

    // Search in DrawingPage table
    const [results, totalCount] = await Promise.all([
      prisma.drawingPage.findMany({
        where: whereClause,
        include: {
          drawing: {
            select: {
              id: true,
              drawingNo: true,
              title: true,
              revision: true,
              systemId: true,
              system: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { drawingId: 'asc' },
          { pageNo: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.drawingPage.count({ where: whereClause }),
    ]);

    // Process results to extract context around the search term
    const processedResults = results.map(page => {
      const ocrText = page.ocrText || '';
      const lowerText = ocrText.toLowerCase();
      const lowerQuery = searchTerm.toLowerCase();
      
      // Find all occurrences
      const occurrences: Array<{ index: number; context: string; highlight: string }> = [];
      let index = lowerText.indexOf(lowerQuery);
      
      while (index !== -1) {
        // Extract context (100 chars before and after)
        const contextStart = Math.max(0, index - 100);
        const contextEnd = Math.min(ocrText.length, index + searchTerm.length + 100);
        const context = ocrText.substring(contextStart, contextEnd);
        
        // Get the actual matched text (preserving case)
        const highlight = ocrText.substring(index, index + searchTerm.length);
        
        occurrences.push({
          index,
          context: (contextStart > 0 ? '...' : '') + context + (contextEnd < ocrText.length ? '...' : ''),
          highlight,
        });
        
        // Find next occurrence
        index = lowerText.indexOf(lowerQuery, index + 1);
      }

      return {
        drawingId: page.drawing.id,
        drawingNo: page.drawing.drawingNo,
        drawingTitle: page.drawing.title,
        revision: page.drawing.revision,
        systemCode: page.drawing.system?.code || 'GEN',
        systemName: page.drawing.system?.name || 'General',
        pageNo: page.pageNo,
        pageLabel: page.pageLabel,
        occurrences,
        matchCount: occurrences.length,
      };
    });

    // Calculate total matches across all results
    const totalMatches = processedResults.reduce((sum, r) => sum + r.matchCount, 0);

    return NextResponse.json({
      query: searchTerm,
      totalResults: totalCount,
      totalMatches,
      limit,
      offset,
      hasMore: offset + limit < totalCount,
      results: processedResults,
    });
  } catch (error) {
    console.error('Error in OCR search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'OCR search failed', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, drawingIds, systemCodes, limit = 50, offset = 0 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    const searchTerm = query.trim();

    // Build advanced where clause
    const whereClause: any = {
      ocrText: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    };

    if (drawingIds && Array.isArray(drawingIds) && drawingIds.length > 0) {
      whereClause.drawingId = {
        in: drawingIds,
      };
    }

    if (systemCodes && Array.isArray(systemCodes) && systemCodes.length > 0) {
      whereClause.drawing = {
        system: {
          code: {
            in: systemCodes,
          },
        },
      };
    }

    const [results, totalCount] = await Promise.all([
      prisma.drawingPage.findMany({
        where: whereClause,
        include: {
          drawing: {
            select: {
              id: true,
              drawingNo: true,
              title: true,
              revision: true,
              systemId: true,
              system: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { drawingId: 'asc' },
          { pageNo: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.drawingPage.count({ where: whereClause }),
    ]);

    // Process results similar to GET
    const processedResults = results.map(page => {
      const ocrText = page.ocrText || '';
      const lowerText = ocrText.toLowerCase();
      const lowerQuery = searchTerm.toLowerCase();
      
      const occurrences: Array<{ index: number; context: string; highlight: string }> = [];
      let index = lowerText.indexOf(lowerQuery);
      
      while (index !== -1) {
        const contextStart = Math.max(0, index - 100);
        const contextEnd = Math.min(ocrText.length, index + searchTerm.length + 100);
        const context = ocrText.substring(contextStart, contextEnd);
        const highlight = ocrText.substring(index, index + searchTerm.length);
        
        occurrences.push({
          index,
          context: (contextStart > 0 ? '...' : '') + context + (contextEnd < ocrText.length ? '...' : ''),
          highlight,
        });
        
        index = lowerText.indexOf(lowerQuery, index + 1);
      }

      return {
        drawingId: page.drawing.id,
        drawingNo: page.drawing.drawingNo,
        drawingTitle: page.drawing.title,
        revision: page.drawing.revision,
        systemCode: page.drawing.system?.code || 'GEN',
        systemName: page.drawing.system?.name || 'General',
        pageNo: page.pageNo,
        pageLabel: page.pageLabel,
        occurrences,
        matchCount: occurrences.length,
      };
    });

    const totalMatches = processedResults.reduce((sum, r) => sum + r.matchCount, 0);

    return NextResponse.json({
      query: searchTerm,
      totalResults: totalCount,
      totalMatches,
      limit,
      offset,
      hasMore: offset + limit < totalCount,
      results: processedResults,
      filters: {
        drawingIds: drawingIds || [],
        systemCodes: systemCodes || [],
      },
    });
  } catch (error) {
    console.error('Error in advanced OCR search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Advanced OCR search failed', details: errorMessage }, { status: 500 });
  }
}
