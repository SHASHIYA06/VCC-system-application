import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PDF_PAGE_MAPPINGS: Record<string, Record<string, number>> = {
  'CAB_PIN DRAWINGS.pdf': {
    '58100': 1, '58101': 3, '58102': 5, '58103': 7, '58104': 9,
    '58105': 11, '58106': 13, '58107': 15, '58108': 17, '58109': 19,
    '58110': 21, '58111': 23, '58112': 25, '58113': 27, '58114': 29,
    '58115': 31, '58116': 33, '58117': 35, '58118': 37, '58119': 39,
    '58120': 41, '58121': 43, '58122': 45, '58123': 47
  },
  'CAB_PIN DRAWINGS 2.pdf': {
    '58124': 1, '58125': 3, '58126': 5, '58127': 7, '58128': 9,
    '58129': 11, '58130': 13, '58131': 15, '58132': 17, '58133': 19,
    '58134': 21, '58135': 23, '58136': 25, '58137': 27, '58138': 29,
    '58139': 31, '58140': 33, '58141': 35, '58142': 37, '58143': 39,
    '58144': 41, '58145': 43, '58146': 45, '58147': 47
  },
  'DMC_CEILING.pdf': {
    '58000': 1, '58001': 3, '58002': 5, '58003': 7, '58004': 9,
    '58005': 11, '58006': 13, '58007': 15, '58008': 17, '58009': 19,
    '58010': 21, '58011': 23, '58012': 25, '58013': 27
  },
  'DMC UF_PIN DRAWINGS.pdf': {
    '58050': 1, '58051': 3, '58052': 5, '58053': 7, '58054': 9,
    '58055': 11, '58056': 13, '58057': 15, '58058': 17, '58059': 19,
    '58060': 21, '58061': 23, '58062': 25
  },
  'TC_CEILING PIN DRAWINGS.pdf': {
    '58200': 1, '58201': 3, '58202': 5, '58203': 7, '58204': 9,
    '58205': 11, '58206': 13, '58207': 15, '58208': 17, '58209': 19,
    '58210': 21, '58211': 23, '58212': 25
  },
  'TC _UF PIN DRAWINGS.pdf': {
    '58250': 1, '58251': 3, '58252': 5, '58253': 7, '58254': 9,
    '58255': 11, '58256': 13, '58257': 15, '58258': 17, '58259': 19
  },
  'MC_CEILING_PIN DRAWINGS.pdf': {
    '58300': 1, '58301': 3, '58302': 5, '58303': 7, '58304': 9,
    '58305': 11, '58306': 13, '58307': 15, '58308': 17, '58309': 19,
    '58310': 21, '58311': 23, '58312': 25, '58313': 27, '58314': 29,
    '58315': 31, '58316': 33, '58317': 35, '58318': 37, '58319': 39,
    '58320': 41, '58321': 43, '58322': 45, '58323': 47, '58324': 49,
    '58325': 51, '58326': 53, '58327': 55, '58328': 57
  },
  'MC_UF.pdf': {
    '58350': 1, '58351': 3, '58352': 5, '58353': 7, '58354': 9,
    '58355': 11, '58356': 13, '58357': 15, '58358': 17, '58359': 19,
    '58360': 21, '58361': 23, '58362': 25, '58363': 27
  },
  'VCC DESCRIPTION 13.12.2017.pdf': {
    '942-58100': 1, '942-58101': 5, '942-58102': 9, '942-58103': 13, '942-58104': 17,
    '942-58105': 21, '942-58106': 25, '942-58107': 29, '942-58108': 33, '942-58109': 37,
    '942-58110': 41, '942-58111': 45, '942-58112': 49, '942-58113': 53
  }
};

function extractDrawingNumber(drawingNo: string): string {
  const cleaned = drawingNo.replace(/^942[-_]/i, '').replace(/-/g, '');
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'seedMappings') {
      let mappedCount = 0;
      
      for (const [sourceFile, mapping] of Object.entries(PDF_PAGE_MAPPINGS)) {
        for (const [drawingPrefix, pageNo] of Object.entries(mapping)) {
          const drawings = await prisma.drawing.findMany({
            where: {
              sourceFileId: sourceFile,
              drawingNo: { contains: drawingPrefix }
            }
          });
          
          for (const drawing of drawings) {
            const page = await prisma.drawingPage.upsert({
              where: { drawingId_pageNo: { drawingId: drawing.id, pageNo: 1 } },
              update: { extra: { pdfPageNo: pageNo, sourceFile } as any },
              create: {
                drawingId: drawing.id,
                pageNo: 1,
                parseStatus: 'MAPPED',
                extra: { pdfPageNo: pageNo, sourceFile } as any
              }
            });
            mappedCount++;
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        mappedCount,
        message: `Mapped ${mappedCount} drawings to PDF pages` 
      });
    }
    
    if (action === 'getMapping') {
      const { drawingNo, sourceFile } = await request.json();
      const drawingNum = extractDrawingNumber(drawingNo);
      
      const mapping = PDF_PAGE_MAPPINGS[sourceFile];
      if (mapping) {
        for (const [prefix, pageNo] of Object.entries(mapping)) {
          if (drawingNum.startsWith(prefix) || drawingNo.includes(prefix)) {
            return NextResponse.json({ pdfPageNo: pageNo, sourceFile });
          }
        }
      }
      
      return NextResponse.json({ pdfPageNo: 1, sourceFile });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('PDF mapping error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');
  const sourceFile = searchParams.get('source_file');
  
  if (!drawingNo || !sourceFile) {
    return NextResponse.json({ error: 'drawing_no and source_file required' }, { status: 400 });
  }
  
  const drawingNum = extractDrawingNumber(drawingNo);
  const mapping = PDF_PAGE_MAPPINGS[sourceFile];
  
  if (mapping) {
    for (const [prefix, pageNo] of Object.entries(mapping)) {
      if (drawingNum.startsWith(prefix) || drawingNo.includes(prefix)) {
        return NextResponse.json({ pdfPageNo: pageNo, sourceFile });
      }
    }
  }
  
  return NextResponse.json({ pdfPageNo: 1, sourceFile });
}