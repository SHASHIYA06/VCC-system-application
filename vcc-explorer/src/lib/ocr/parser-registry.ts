import { PrismaClient } from '@prisma/client';

type PageInput = {
  pageNo: number;
  text: string;
};

type ImportArgs = {
  projectCode: string;
  sourceFilename: string;
  pages: PageInput[];
};

type ParserContext = {
  prisma: PrismaClient;
  projectId: string;
  sourceFileId: string | number;
};

type DrawingAndSheet = {
  drawingId: string;
  drawingNo: string;
  sheetId: string | null;
  sheetNo: number | null;
  sourcePageId: string;
};

type DrawingParser = (
  ctx: ParserContext,
  page: PageInput,
  drawing: DrawingAndSheet
) => Promise<void>;

const DRAWING_TITLE_MAP: Record<string, { title: string; category: string }> = {
  '942-58099': { title: 'Drawing List', category: 'GENERAL' },
  '942-58100': { title: 'Classification', category: 'GENERAL' },
  '942-58101': { title: 'Wiring Numbers, Description', category: 'GENERAL' },
  '942-58102': { title: 'Symbols', category: 'GENERAL' },
  '942-58103': { title: 'Train Lines, Control', category: 'GENERAL' },
  '942-58104': { title: 'Train Lines, Signal', category: 'GENERAL' },
  '942-58105': { title: 'Train Lines, Low Tension Power', category: 'GENERAL' },
  '942-58106': { title: 'Train Lines, High Tension Power', category: 'GENERAL' },
  '942-58146': { title: 'IMS Interface', category: 'TIMS' },
  '942-58152': { title: 'CBTC', category: 'COMMUNICATION' },
  '942-58153': { title: 'Train Radio Interface', category: 'COMMUNICATION' },
  '942-58154': { title: 'CCTV', category: 'COMMUNICATION' },
};

const DRAWING_LIST_SEED = [
  ['942-58099', 'Drawing List', 'GENERAL'],
  ['942-58100', 'Classification', 'GENERAL'],
  ['942-58101', 'Wiring Numbers, Description', 'GENERAL'],
  ['942-58102', 'Symbols', 'GENERAL'],
  ['942-58103', 'Train Lines, Control', 'GENERAL'],
  ['942-58104', 'Train Lines, Signal', 'GENERAL'],
  ['942-58105', 'Train Lines, Low Tension Power', 'GENERAL'],
  ['942-58106', 'Train Lines, High Tension Power', 'GENERAL'],
  ['942-58107', 'Controlling Cab', 'AUXILIARY'],
  ['942-58108', 'Start-Up Relay', 'AUXILIARY'],
  ['942-58109', 'System Status Indication', 'AUXILIARY'],
  ['942-58110', 'MCB Trip Status Monitoring', 'AUXILIARY'],
  ['942-58111', 'DC Train Line Supply Contactor', 'AUXILIARY'],
  ['942-58112', 'Head Cab Main Light', 'INTERIOR'],
  ['942-58113', 'Tail Light, Flasher Light, Console Light', 'INTERIOR'],
  ['942-58114', 'Interior Light', 'INTERIOR'],
  ['942-58115', 'Interior Light', 'INTERIOR'],
  ['942-58116', 'Windscreen Wiper', 'INTERIOR'],
  ['942-58117', 'Coupling Uncoupling Control', 'COUPLER'],
  ['942-58119', 'Speed Control', 'TRACTION'],
  ['942-58120', 'VVVF Control', 'TRACTION'],
  ['942-58121', 'Traction Return Current', 'TRACTION'],
  ['942-58123', 'Compressor Control', 'BRAKE'],
  ['942-58124', 'Brake Loop', 'BRAKE'],
  ['942-58125', 'Emergency Brake', 'BRAKE'],
  ['942-58126', 'Parking Brake', 'BRAKE'],
  ['942-58127', 'Horn', 'BRAKE'],
  ['942-58128', 'Brake Control', 'BRAKE'],
  ['942-58129', 'Brake Control', 'BRAKE'],
  ['942-58130', 'APS', 'AUXILIARY'],
  ['942-58131', 'AC 415V Shore Supply', 'AUXILIARY'],
  ['942-58132', 'Battery Control', 'AUXILIARY'],
  ['942-58137', 'Saloon Door Supply Voltage', 'DOOR'],
  ['942-58138', 'Door Operation Left', 'DOOR'],
  ['942-58139', 'Door Operation Right', 'DOOR'],
  ['942-58140', 'Door Proving Loop', 'DOOR'],
  ['942-58141', 'Local Door Interlock', 'DOOR'],
  ['942-58142', 'Door Communication with IMS', 'DOOR'],
  ['942-58143', 'Cab VAC', 'HVAC'],
  ['942-58144', 'Saloon VAC Power', 'HVAC'],
  ['942-58145', 'Saloon VAC Control', 'HVAC'],
  ['942-58146', 'IMS Interface', 'TIMS'],
  ['942-58147', 'PIB', 'COMMUNICATION'],
  ['942-58148', 'PIB', 'COMMUNICATION'],
  ['942-58149', 'DVAS, PA System', 'COMMUNICATION'],
  ['942-58150', 'PA Amplifier', 'COMMUNICATION'],
  ['942-58151', 'PA Amplifier', 'COMMUNICATION'],
  ['942-58152', 'CBTC', 'COMMUNICATION'],
  ['942-58153', 'Train Radio Interface', 'COMMUNICATION'],
  ['942-58154', 'CCTV', 'COMMUNICATION'],
] as const;

const SYSTEMS = [
  { code: 'GENERAL', name: 'General', category: 'GENERAL' },
  { code: 'TRACTION', name: 'Traction System', category: 'TRACTION' },
  { code: 'BRAKE', name: 'Brake System', category: 'BRAKE' },
  { code: 'AUX', name: 'Auxiliary Electric System', category: 'AUXILIARY' },
  { code: 'DOOR', name: 'Door System', category: 'DOOR' },
  { code: 'HVAC', name: 'Air Conditioning System', category: 'HVAC' },
  { code: 'TIMS', name: 'Train Integrated Management System', category: 'TIMS' },
  { code: 'COMM', name: 'Communication System', category: 'COMMUNICATION' },
] as const;

const CONNECTOR_FAMILY_NOTES: { code: string; pinCount?: number; description: string }[] = [
  { code: 'X1', pinCount: 74, description: 'Control signal' },
  { code: 'X2', pinCount: 74, description: 'Control signal' },
  { code: 'X3', pinCount: 11, description: '415V AC / 230V AC' },
  { code: 'X4', pinCount: 3, description: '110V DC' },
  { code: 'X5', pinCount: undefined, description: 'CCTV / TCMS / EBCU' },
  { code: 'X6', pinCount: 1, description: 'High tension power' },
  { code: 'X7', pinCount: 1, description: 'High tension earth' },
  { code: 'X8', pinCount: undefined, description: 'EOSS1' },
  { code: 'X9', pinCount: undefined, description: 'EOSS2' },
  { code: 'X10', pinCount: undefined, description: 'CBTC' },
];

function normalize(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/[‐–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function lines(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

function detectDrawingNo(text: string): string | null {
  const direct = text.match(/DRG\s*No\.\s*(\d{3}-\d{5})D?/i);
  if (direct) return direct[1];

  const loose = text.match(/\b(942-\d{5})\b/);
  return loose?.[1] ?? null;
}

function detectSheetNo(text: string): number | null {
  const m = text.match(/SHEET\s+(\d+)\s+OF\s+\d+/i);
  return m ? Number(m[1]) : null;
}

async function getProjectId(prisma: PrismaClient, code: string): Promise<string> {
  const project = await prisma.project.findUnique({ where: { projectCode: code } });
  if (project) return project.id;
  
  const created = await prisma.project.create({
    data: {
      projectCode: code,
      projectName: code,
      description: 'KMRCL RS3R Vehicle Control Circuits',
    },
  });
  return created.id;
}

async function getOrCreateSourceFile(
  prisma: PrismaClient,
  projectId: string,
  filename: string
): Promise<string> {
  return filename;
}

async function getOrCreateDrawing(
  prisma: PrismaClient,
  projectId: string,
  drawingNo: string,
  title?: string,
  category?: string
) {
  const existing = await prisma.drawing.findFirst({
    where: { projectId, drawingNo },
  });

  if (existing) {
    return prisma.drawing.update({
      where: { id: existing.id },
      data: {
        title: title ?? existing.title,
        status: 'ACTIVE',
      },
    });
  }

  const system = await prisma.system.findFirst({
    where: { 
      code: category === 'TRACTION' ? 'TRAC' :
            category === 'BRAKE' ? 'BRAKE' :
            category === 'AUXILIARY' ? 'AUX' :
            category === 'DOOR' ? 'DOOR' :
            category === 'HVAC' ? 'VAC' :
            category === 'TIMS' ? 'TMS' :
            category === 'COMMUNICATION' ? 'COMMS' :
            'GENERAL'
    }
  });

  return prisma.drawing.create({
    data: {
      projectId,
      systemId: system?.id,
      drawingNo,
      title: title ?? drawingNo,
      totalSheets: 1,
      status: 'ACTIVE',
    },
  });
}

async function getOrCreateSheet(
  prisma: PrismaClient,
  drawingId: string,
  sheetNo: number | null
) {
  if (!sheetNo) return null;
  const existing = await prisma.drawingSheet.findFirst({
    where: { drawingId, sheetNo },
  });
  if (existing) return existing;
  return prisma.drawingSheet.create({
    data: {
      drawingId,
      sheetNo,
      sheetLabel: `SHEET ${sheetNo}`,
    },
  });
}

async function ensureSystemSeeds(prisma: PrismaClient, projectId: string) {
  for (const s of SYSTEMS) {
    const code = s.code === 'AUX' ? 'AUX' : 
                 s.code === 'COMM' ? 'COMMS' :
                 s.code === 'TIMS' ? 'TMS' :
                 s.code === 'TRACTION' ? 'TRAC' :
                 s.code;
    
    const existing = await prisma.system.findUnique({ where: { code } });
    if (!existing) {
      await prisma.system.create({
        data: {
          code,
          name: s.name,
          category: s.category,
        },
      });
    }
  }
}

async function ensureConnector(
  prisma: PrismaClient,
  drawingId: string,
  sheetId: string | null,
  code: string,
  pinCount?: number | null,
  description?: string
) {
  const existing = await prisma.connector.findFirst({
    where: { drawingId, connectorCode: code },
  });

  if (existing) {
    return prisma.connector.update({
      where: { id: existing.id },
      data: {
        pinCount: pinCount ?? existing.pinCount,
        description: description ?? existing.description,
      },
    });
  }

  return prisma.connector.create({
    data: {
      drawingId,
      sheetId: sheetId ?? null,
      connectorCode: code,
      pinCount: pinCount ?? null,
      description: description ?? null,
      scope: 'DEVICE',
    },
  });
}

async function ensureWire(prisma: PrismaClient, wireNo: string, conductorClass = 'UNKNOWN') {
  const existing = await prisma.wire.findFirst({
    where: { wireNo },
  });
  if (existing) return existing;
  return prisma.wire.create({
    data: {
      wireNo,
      wireColor: 'UNKNOWN',
      voltageClass: 'UNKNOWN',
    },
  });
}

async function ensureSignal(prisma: PrismaClient, signalCode: string, signalName: string, drawingId?: string) {
  const existing = await prisma.signal.findFirst({
    where: { signalCode: signalCode ?? undefined },
  }).catch(() => null);

  if (existing) {
    return prisma.signal.update({
      where: { id: existing.id },
      data: { signalName },
    });
  }

  const defaultDrawing = await prisma.drawing.findFirst({
    where: { drawingNo: '942-58103' },
  });

  return prisma.signal.create({
    data: {
      signalCode,
      signalName,
      drawingId: drawingId || defaultDrawing?.id || '',
    },
  });
}

async function ensurePin(
  prisma: PrismaClient,
  connectorId: string,
  pinNo: string,
  signalId?: string,
  wireId?: string
) {
  const existing = await prisma.connectorPin.findFirst({
    where: { connectorId, pinNo },
  });

  if (existing) {
    return prisma.connectorPin.update({
      where: { id: existing.id },
      data: {
        signalName: signalId ?? existing.signalName,
        wireNo: wireId ?? existing.wireNo,
      },
    });
  }

  return prisma.connectorPin.create({
    data: {
      connectorId,
      pinNo,
      signalName: signalId ?? null,
      wireNo: wireId ?? null,
    },
  });
}

async function ensureCrossRule(
  prisma: PrismaClient,
  drawingId: string,
  sheetId: string | null,
  connectorCode: string,
  pinA: string,
  pinB: string,
  wireA: string,
  wireB: string,
  remarks: string
) {
  const existing = await prisma.crossConnectionRule.findFirst({
    where: { drawingId, connectorCode, pinA, pinB },
  });

  if (existing) {
    return prisma.crossConnectionRule.update({
      where: { id: existing.id },
      data: { extra: { remarks } },
    });
  }

  return prisma.crossConnectionRule.create({
    data: {
      drawingId,
      sheetId: sheetId ?? null,
      connectorCode,
      pinA,
      pinB,
      wireA,
      wireB,
      ruleType: 'INTERNAL_CROSS',
      extra: { remarks },
    },
  });
}

function extractStructuredRows(text: string): Array<{ refDrawingNo: string; label: string; wireNo: string; pinNo: string }> {
  const out: Array<{ refDrawingNo: string; label: string; wireNo: string; pinNo: string }> = [];
  const src = lines(text).join('\n');

  for (const chunk of src.split(new RegExp('(?=942-\\d{5})', 'g'))) {
    const m = chunk.match(/^(942-\d{5})\s+([A-Z0-9 ,().\/-]+?)\s+([A-Z0-9]+)\s+(\d{1,2})(?:\s|$)/m);
    if (!m) continue;

    out.push({
      refDrawingNo: m[1],
      label: m[2].trim().replace(/\s+/g, ' '),
      wireNo: m[3].trim(),
      pinNo: m[4].trim(),
    });
  }

  return out;
}

async function parseDrawingList(ctx: ParserContext, page: PageInput, drawing: DrawingAndSheet) {
  for (const row of DRAWING_LIST_SEED) {
    await getOrCreateDrawing(ctx.prisma, ctx.projectId, row[0], row[1], row[2]);
  }

  await ctx.prisma.drawingNote.create({
    data: {
      drawingId: drawing.drawingId,
      noteType: 'SYSTEM',
      noteText: 'Drawing list imported from OCR',
    },
  }).catch(() => {});
}

async function parseClassification(ctx: ParserContext, page: PageInput, drawing: DrawingAndSheet) {
  await ensureSystemSeeds(ctx.prisma, ctx.projectId);
}

async function parseConductorClasses(ctx: ParserContext, page: PageInput, drawing: DrawingAndSheet) {
  const known = [
    ['ED', 'Main circuit 750V HV propulsion circuits / supply of AC traction motors'],
    ['AP', 'Auxiliary power circuits 415V/230V 50Hz'],
    ['BA', 'Conductors directly supplied by battery control, 110VDC'],
    ['S', 'Measuring / analog voltage signals / shielded cables'],
    ['PE', 'Protecting earthing'],
    ['GD', 'Grounding'],
    ['SP', 'Spare'],
  ] as const;

  for (const [code, noteText] of known) {
    await ctx.prisma.conductorClass.upsert({
      where: { code },
      update: { description: noteText },
      create: { code, description: noteText },
    }).catch(() => {});
  }
}

async function parseTrainLinesControl(ctx: ParserContext, page: PageInput, drawing: DrawingAndSheet) {
  for (const family of CONNECTOR_FAMILY_NOTES) {
    await ensureConnector(
      ctx.prisma,
      drawing.drawingId,
      drawing.sheetId,
      family.code,
      family.pinCount ?? undefined,
      family.description
    );
  }

  const connectorX1 = await ensureConnector(
    ctx.prisma,
    drawing.drawingId,
    drawing.sheetId,
    'X1',
    74,
    'Control signal'
  );

  const rows = extractStructuredRows(page.text);
  for (const row of rows) {
    const signal = await ensureSignal(ctx.prisma, row.wireNo, row.label);
    const wire = await ensureWire(ctx.prisma, row.wireNo);
    const pin = await ensurePin(
      ctx.prisma,
      connectorX1.id,
      row.pinNo,
      signal.signalCode ?? row.wireNo,
      wire.wireNo
    );
  }

  const t = normalize(page.text);

  if (t.includes('3005 AND 3006 ARE CROSS CONNECTED') || t.includes('3005,3006')) {
    await ensureCrossRule(
      ctx.prisma,
      drawing.drawingId,
      drawing.sheetId,
      'X1',
      '19',
      '20',
      '3005',
      '3006',
      'In X1 jumper plug, at pin no.19/20 internally cables 3005 and 3006 are cross connected.'
    );
  }

  if (t.includes('6009 AND 6046 ARE CROSS CONNECTED') || t.includes('6009,6046')) {
    await ensureCrossRule(
      ctx.prisma,
      drawing.drawingId,
      drawing.sheetId,
      'X1',
      '43',
      '44',
      '6009',
      '6046',
      'In X1 jumper plug, at pin no.43/44 internally cables 6009 and 6046 are cross connected.'
    );
  }

  if (t.includes('6014 AND 6051 ARE CROSS CONNECTED') || t.includes('6014,6051')) {
    await ensureCrossRule(
      ctx.prisma,
      drawing.drawingId,
      drawing.sheetId,
      'X1',
      '46',
      '47',
      '6014',
      '6051',
      'In X1 jumper plug, at pin no.46/47 internally cables 6014 and 6051 are cross connected.'
    );
  }
}

async function parseTrainLinesSignal(ctx: ParserContext, page: PageInput, drawing: DrawingAndSheet) {
  const t = normalize(page.text);

  const connectorX2 = await ensureConnector(
    ctx.prisma,
    drawing.drawingId,
    drawing.sheetId,
    'X2',
    74,
    'Control signal'
  );

  for (const code of ['X5-B', 'X5-C', 'X5-D', 'X8', 'X9', 'X10-A', 'X10-B', 'X10-C', 'X10-D', 'X10-E', 'X10-F']) {
    if (t.includes(code)) {
      await ensureConnector(ctx.prisma, drawing.drawingId, drawing.sheetId, code, null, 'Detected from OCR');
    }
  }

  const rows = extractStructuredRows(page.text);
  for (const row of rows) {
    const signal = await ensureSignal(ctx.prisma, row.wireNo, row.label);
    const wire = await ensureWire(ctx.prisma, row.wireNo);
    const pin = await ensurePin(
      ctx.prisma,
      connectorX2.id,
      row.pinNo,
      signal.signalCode ?? row.wireNo,
      wire.wireNo
    );
  }

  if (t.includes('92431 AND 92451 ARE CROSS CONNECTED') || t.includes('92431,92451')) {
    await ensureCrossRule(
      ctx.prisma,
      drawing.drawingId,
      drawing.sheetId,
      'X2',
      '29',
      '31',
      '92431',
      '92451',
      'In X2 jumper plug, at pin no.29/31 internally cables 92431 and 92451 are cross connected.'
    );
  }

  if (t.includes('92432 AND 92452 ARE CROSS CONNECTED') || t.includes('92432,92452')) {
    await ensureCrossRule(
      ctx.prisma,
      drawing.drawingId,
      drawing.sheetId,
      'X2',
      '30',
      '32',
      '92432',
      '92452',
      'In X2 jumper plug, at pin no.30/32 internally cables 92432 and 92452 are cross connected.'
    );
  }
}

async function parseGenericReferencedDrawing(ctx: ParserContext, page: PageInput, drawing: DrawingAndSheet) {
  const refs = Array.from(new Set((page.text.match(/\b942-\d{5}\b/g) ?? []).filter((x) => x !== drawing.drawingNo)));
  for (const ref of refs) {
    await getOrCreateDrawing(ctx.prisma, ctx.projectId, ref, ref, 'UNKNOWN');
  }
}

const REGISTRY: Record<string, DrawingParser> = {
  '942-58099': parseDrawingList,
  '942-58100': parseClassification,
  '942-58101': parseConductorClasses,
  '942-58103': parseTrainLinesControl,
  '942-58104': parseTrainLinesSignal,
  '942-58146': parseGenericReferencedDrawing,
  '942-58152': parseGenericReferencedDrawing,
  '942-58153': parseGenericReferencedDrawing,
  '942-58154': parseGenericReferencedDrawing,
};

export async function runOcrImport(prisma: PrismaClient, args: ImportArgs) {
  const projectId = await getProjectId(prisma, args.projectCode);
  await ensureSystemSeeds(prisma, projectId);

  const sourceFileId = await getOrCreateSourceFile(prisma, projectId, args.sourceFilename);

  for (const page of args.pages) {
    const drawingNo = detectDrawingNo(page.text);
    const sheetNo = detectSheetNo(page.text);

    let sourcePage;
    if (drawingNo) {
      const meta = DRAWING_TITLE_MAP[drawingNo];
      const dr = await getOrCreateDrawing(
        prisma,
        projectId,
        drawingNo,
        meta?.title ?? drawingNo,
        meta?.category ?? 'UNKNOWN'
      );

      const sheet = await getOrCreateSheet(prisma, dr.id, sheetNo);
      
      sourcePage = await prisma.ocrPage.create({
        data: {
          sourceFileId: sourceFileId,
          pageNo: page.pageNo,
          rawText: page.text,
          parseStatus: 'PENDING',
        },
      }).catch(async () => {
        const existing = await prisma.ocrPage.findFirst({
          where: { sourceFileId: sourceFileId, pageNo: page.pageNo },
        });
        if (existing) {
          return prisma.ocrPage.update({
            where: { id: existing.id },
            data: { rawText: page.text, parseStatus: 'PENDING' },
          });
        }
        return null;
      });

      if (!sourcePage) continue;

      const drawingRef: DrawingAndSheet = {
        drawingId: dr.id,
        drawingNo,
        sheetId: sheet?.id ?? null,
        sheetNo: sheetNo ?? null,
        sourcePageId: sourcePage.id,
      };

      const parser = REGISTRY[drawingNo] ?? parseGenericReferencedDrawing;
      await parser(
        { prisma, projectId, sourceFileId: sourceFileId },
        page,
        drawingRef
      );

      await prisma.ocrPage.update({
        where: { id: sourcePage.id },
        data: { parseStatus: 'COMPLETED' },
      }).catch(() => {});
    } else {
      sourcePage = await prisma.ocrPage.create({
        data: {
          sourceFileId: sourceFileId,
          pageNo: page.pageNo,
          rawText: page.text,
          parseStatus: 'FAILED',
        },
      }).catch(async () => {
        const existing = await prisma.ocrPage.findFirst({
          where: { sourceFileId: sourceFileId, pageNo: page.pageNo },
        });
        return existing;
      });

      if (sourcePage) {
        await prisma.validationIssue.create({
          data: {
            severity: 'MEDIUM',
            issueType: 'NO_DRAWING_NUMBER',
            sourceTable: 'OcrPage',
            sourceId: sourcePage.id,
            message: 'Could not detect drawing number from OCR page',
            resolved: false,
          },
        }).catch(() => {});
      }
    }
  }

  console.log(`OCR import completed for ${args.sourceFilename}`);
}

export { DRAWING_LIST_SEED, SYSTEMS, CONNECTOR_FAMILY_NOTES };