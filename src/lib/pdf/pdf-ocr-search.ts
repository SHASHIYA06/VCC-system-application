/**
 * PDF OCR Search Service
 * 
 * Provides comprehensive OCR text search across all VCC drawings
 * Features:
 * - Full-text search in OCR content
 * - Fuzzy matching for drawing numbers
 * - Exact page location for each drawing
 * - Fast indexed search
 */

import { prisma } from '@/lib/prisma';

export interface SearchResult {
  drawingId: string;
  drawingNo: string;
  title: string;
  pdfFile: string;
  pdfPage: number;
  matchScore: number;
  snippet: string;
  systemCode?: string;
}

export interface OCRSearchOptions {
  query: string;
  fuzzy?: boolean;
  limit?: number;
  systemFilter?: string;
}

/**
 * Search for drawings by OCR text content
 */
export async function searchDrawingsByOCR(options: OCRSearchOptions): Promise<SearchResult[]> {
  const { query, fuzzy = true, limit = 50, systemFilter } = options;
  
  // Normalize query
  const normalizedQuery = query.trim().toUpperCase();
  
  // Build search conditions
  const searchConditions: unknown[] = [
    // Exact drawing number match
    { drawingNo: { equals: normalizedQuery } },
    { drawingNo: { equals: normalizedQuery.replace(/-/g, '') } },
    
    // Contains match
    { drawingNo: { contains: normalizedQuery } },
    { title: { contains: normalizedQuery, mode: 'insensitive' } },
  ];

  // Add fuzzy matching if enabled
  if (fuzzy) {
    // Remove prefix and search
    const withoutPrefix = normalizedQuery.replace(/^942[-_]/i, '');
    searchConditions.push(
      { drawingNo: { contains: withoutPrefix } },
      { title: { contains: withoutPrefix, mode: 'insensitive' } }
    );
  }

  // Search in drawings
  const drawings = await prisma.drawing.findMany({
    where: {
      AND: [
        { OR: searchConditions },
        systemFilter ? { system: { code: systemFilter } } : {}
      ]
    },
    include: {
      system: { select: { code: true, name: true } },
      pages: {
        where: { ocrText: { not: null } },
        select: { pageNo: true, ocrText: true },
        orderBy: { pageNo: 'asc' },
        take: 1
      }
    },
    take: limit,
    orderBy: { drawingNo: 'asc' }
  });

  // Convert to search results
  const results: SearchResult[] = [];
  
  for (const drawing of drawings) {
    // Get PDF page mapping
    const pdfMapping = await getPDFPageMapping(drawing.drawingNo, drawing.sourceFileId || '');
    
    // Calculate match score
    const matchScore = calculateMatchScore(normalizedQuery, drawing.drawingNo, drawing.title);
    
    // Get snippet from OCR text
    const snippet = drawing.pages[0]?.ocrText 
      ? extractSnippet(drawing.pages[0].ocrText, query)
      : drawing.title;

    results.push({
      drawingId: drawing.id,
      drawingNo: drawing.drawingNo,
      title: drawing.title,
      pdfFile: drawing.sourceFileId || 'Unknown',
      pdfPage: pdfMapping.pageNo,
      matchScore,
      snippet,
      systemCode: drawing.system?.code
    });
  }

  // Sort by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  return results;
}

/**
 * Search within OCR text content
 */
export async function searchInOCRText(query: string, limit: number = 100): Promise<SearchResult[]> {
  const normalizedQuery = query.trim();
  
  // Search in DrawingPage OCR text
  const pages = await prisma.drawingPage.findMany({
    where: {
      OR: [
        { ocrText: { contains: normalizedQuery, mode: 'insensitive' } },
        { rawText: { contains: normalizedQuery, mode: 'insensitive' } }
      ]
    },
    include: {
      drawing: {
        include: {
          system: { select: { code: true } }
        }
      }
    },
    take: limit
  });

  const results: SearchResult[] = [];
  
  for (const page of pages) {
    const pdfMapping = await getPDFPageMapping(
      page.drawing.drawingNo, 
      page.drawing.sourceFileId || ''
    );
    
    const snippet = extractSnippet(page.ocrText || page.rawText || '', query);
    
    results.push({
      drawingId: page.drawing.id,
      drawingNo: page.drawing.drawingNo,
      title: page.drawing.title,
      pdfFile: page.drawing.sourceFileId || 'Unknown',
      pdfPage: pdfMapping.pageNo,
      matchScore: 0.8,
      snippet,
      systemCode: page.drawing.system?.code
    });
  }

  return results;
}

/**
 * Get PDF page mapping for a drawing
 */
async function getPDFPageMapping(drawingNo: string, sourceFile: string): Promise<{ pageNo: number; source: string }> {
  // Try database first
  const drawing = await prisma.drawing.findFirst({
    where: { drawingNo: { contains: drawingNo } },
    include: {
      pages: {
        orderBy: { pageNo: 'asc' },
        take: 1
      }
    }
  });

  if (drawing?.pages?.[0]?.extra) {
    const extra = drawing.pages[0].extra as unknown;
    if (extra.pdfPageNo) {
      return { pageNo: extra.pdfPageNo, source: 'database' };
    }
  }

  // Fallback to inference
  const inferredPage = inferPageFromDrawingNumber(drawingNo, sourceFile);
  return { pageNo: inferredPage, source: 'inferred' };
}

/**
 * Infer PDF page number from drawing number
 */
function inferPageFromDrawingNumber(drawingNo: string, sourceFile: string): number {
  const numMatch = drawingNo.match(/\d+/);
  if (!numMatch) return 1;
  
  const num = parseInt(numMatch[0]);
  
  // For PIN drawings, typically 2 pages each
  if (sourceFile.includes('PIN')) {
    if (sourceFile.includes('CAB_PIN DRAWINGS 2')) {
      const offset = num - 58124;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('CAB_PIN DRAWINGS')) {
      const offset = num - 58100;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('DMC_CEILING')) {
      const offset = num - 58000;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('DMC UF')) {
      const offset = num - 58050;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('TC_CEILING')) {
      const offset = num - 58200;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('TC _UF')) {
      const offset = num - 58250;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('MC_CEILING')) {
      const offset = num - 58300;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('MC_UF')) {
      const offset = num - 58350;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    }
  }
  
  return 1;
}

/**
 * Calculate match score between query and drawing
 */
function calculateMatchScore(query: string, drawingNo: string, title: string): number {
  let score = 0;
  
  const normalizedDrawingNo = drawingNo.toUpperCase();
  const normalizedTitle = title.toUpperCase();
  const normalizedQuery = query.toUpperCase();
  
  // Exact match in drawing number
  if (normalizedDrawingNo === normalizedQuery) {
    score += 1.0;
  } else if (normalizedDrawingNo.includes(normalizedQuery)) {
    score += 0.8;
  } else if (normalizedDrawingNo.replace(/-/g, '') === normalizedQuery.replace(/-/g, '')) {
    score += 0.9;
  }
  
  // Match in title
  if (normalizedTitle.includes(normalizedQuery)) {
    score += 0.5;
  }
  
  // Partial matches
  const queryWords = normalizedQuery.split(/\s+/);
  for (const word of queryWords) {
    if (word.length > 2) {
      if (normalizedDrawingNo.includes(word)) score += 0.2;
      if (normalizedTitle.includes(word)) score += 0.1;
    }
  }
  
  return Math.min(score, 1.0);
}

/**
 * Extract snippet from text around query
 */
function extractSnippet(text: string, query: string, contextLength: number = 100): string {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  const index = normalizedText.indexOf(normalizedQuery);
  
  if (index === -1) {
    // Query not found, return beginning
    return text.substring(0, contextLength) + (text.length > contextLength ? '...' : '');
  }
  
  // Extract context around match
  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + query.length + contextLength / 2);
  
  let snippet = text.substring(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
}

/**
 * Index all OCR text for faster searching
 */
export async function indexAllOCRText(): Promise<{ indexed: number; errors: number }> {
  let indexed = 0;
  let errors = 0;
  
  // Get all drawings with pages
  const drawings = await prisma.drawing.findMany({
    include: {
      pages: true
    }
  });
  
  for (const drawing of drawings) {
    try {
      for (const page of drawing.pages) {
        if (page.ocrText || page.rawText) {
          // Update parse status
          await prisma.drawingPage.update({
            where: { id: page.id },
            data: { parseStatus: 'INDEXED' }
          });
          indexed++;
        }
      }
    } catch (error) {
      console.error(`Error indexing drawing ${drawing.drawingNo}:`, error);
      errors++;
    }
  }
  
  return { indexed, errors };
}

/**
 * Get drawing suggestions based on partial input
 */
export async function getDrawingSuggestions(partial: string, limit: number = 10): Promise<SearchResult[]> {
  return searchDrawingsByOCR({
    query: partial,
    fuzzy: true,
    limit
  });
}
