import { NextRequest, NextResponse } from 'next/server';
import { searchDrawingsByOCR, searchInOCRText, getDrawingSuggestions } from '@/lib/pdf/pdf-ocr-search';

/**
 * OCR Search API
 * 
 * Provides comprehensive search across all VCC drawings using OCR text
 * 
 * Query Parameters:
 * - q: Search query (required)
 * - type: Search type ('drawing' | 'text' | 'suggest') - default: 'drawing'
 * - fuzzy: Enable fuzzy matching (true | false) - default: true
 * - limit: Maximum results - default: 50
 * - system: Filter by system code (optional)
 * 
 * Examples:
 * - /api/ocr/search?q=942-38402
 * - /api/ocr/search?q=EDB&type=text
 * - /api/ocr/search?q=58&type=suggest&limit=10
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'drawing';
    const fuzzy = searchParams.get('fuzzy') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '50');
    const systemFilter = searchParams.get('system') || undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    let results;

    switch (type) {
      case 'drawing':
        // Search by drawing number/title
        results = await searchDrawingsByOCR({
          query,
          fuzzy,
          limit,
          systemFilter
        });
        break;

      case 'text':
        // Search within OCR text content
        results = await searchInOCRText(query, limit);
        break;

      case 'suggest':
        // Get suggestions for autocomplete
        results = await getDrawingSuggestions(query, limit);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid search type. Use: drawing, text, or suggest' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      query,
      type,
      count: results.length,
      results
    });

  } catch (error) {
    console.error('OCR search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for advanced search with filters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      query,
      fuzzy = true,
      limit = 50,
      systemFilter,
      includeOCRText = false
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Perform search
    const results = await searchDrawingsByOCR({
      query,
      fuzzy,
      limit,
      systemFilter
    });

    // Optionally include full OCR text
    if (includeOCRText) {
      const textResults = await searchInOCRText(query, limit);
      return NextResponse.json({
        query,
        drawingResults: results,
        textResults,
        totalCount: results.length + textResults.length
      });
    }

    return NextResponse.json({
      query,
      count: results.length,
      results
    });

  } catch (error) {
    console.error('OCR search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
