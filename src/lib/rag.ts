import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface RAGChunk {
  id: string;
  content: string;
  sourceType: 'drawing' | 'circuit' | 'wire' | 'trainline' | 'connector' | 'device' | 'pin';
  sourceId: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

export interface RAGQueryResult {
  chunks: RAGChunk[];
  context: string;
  sources: { type: string; id: string; title: string }[];
}

export class RAGService {
  private async getRelevantChunks(query: string, limit = 10): Promise<RAGChunk[]> {
    const queryLower = query.toLowerCase();
    const chunks: RAGChunk[] = [];

    const [drawings, circuits, wires, trainlines, connectors, devices] = await Promise.all([
      prisma.drawing.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { drawingNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { remarks: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { system: true },
        take: limit,
      }),
      prisma.circuit.findMany({
        where: {
          OR: [
            { circuitName: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { circuitCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { note: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { drawing: true },
        take: limit,
      }),
      prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { signalName: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        take: limit,
      }),
      prisma.trainLine.findMany({
        where: {
          OR: [
            { wireNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { itemName: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { note: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { drawing: true },
        take: limit,
      }),
      prisma.connector.findMany({
        where: {
          OR: [
            { connectorCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { drawing: true },
        take: limit,
      }),
      prisma.device.findMany({
        where: {
          OR: [
            { deviceName: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { tagNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { system: true },
        take: limit,
      }),
    ]);

    drawings.forEach(d => {
      chunks.push({
        id: `drawing-${d.id}`,
        content: `Drawing ${d.drawingNo}: ${d.title}. System: ${d.system?.code || 'N/A'}. Revision: ${d.revision}. Sheets: ${d.totalSheets}`,
        sourceType: 'drawing',
        sourceId: d.id,
        metadata: { drawingNo: d.drawingNo, title: d.title, systemCode: d.system?.code },
      });
    });

    circuits.forEach(c => {
      chunks.push({
        id: `circuit-${c.id}`,
        content: `Circuit ${c.circuitCode || 'N/A'}: ${c.circuitName || ''} - ${c.note || ''}. Category: ${c.category || 'N/A'}, Car: ${c.carScope || 'N/A'}`,
        sourceType: 'circuit',
        sourceId: c.id,
        metadata: { circuitCode: c.circuitCode, circuitName: c.circuitName, category: c.category },
      });
    });

    wires.forEach(w => {
      chunks.push({
        id: `wire-${w.id}`,
        content: `Wire ${w.wireNo}: ${w.signalName || ''} - ${w.description || ''}. Voltage: ${w.voltageClass || 'N/A'}, Size: ${w.wireSize || 'N/A'}`,
        sourceType: 'wire',
        sourceId: w.id,
        metadata: { wireNo: w.wireNo, signalName: w.signalName, voltageClass: w.voltageClass },
      });
    });

    trainlines.forEach(t => {
      chunks.push({
        id: `trainline-${t.id}`,
        content: `Trainline ${t.wireNo}: ${t.itemName || ''}. ${t.note || ''}. Car Type: ${t.carType || 'All'}`,
        sourceType: 'trainline',
        sourceId: t.id,
        metadata: { wireNo: t.wireNo, itemName: t.itemName, carType: t.carType },
      });
    });

    connectors.forEach(c => {
      chunks.push({
        id: `connector-${c.id}`,
        content: `Connector ${c.connectorCode}: ${c.description || ''}. Type: ${c.connectorTypeCode || 'N/A'}`,
        sourceType: 'connector',
        sourceId: c.id,
        metadata: { connectorCode: c.connectorCode, description: c.description },
      });
    });

    devices.forEach(d => {
      chunks.push({
        id: `device-${d.id}`,
        content: `Device ${d.tagNo || d.deviceName}: ${d.deviceName}. System: ${d.system?.code || 'N/A'}, Location: ${d.locationTag || 'N/A'}`,
        sourceType: 'device',
        sourceId: d.id,
        metadata: { tagNo: d.tagNo, deviceName: d.deviceName, systemCode: d.system?.code },
      });
    });

    return chunks.slice(0, limit * 3);
  }

  async query(userQuery: string): Promise<RAGQueryResult> {
    const chunks = await this.getRelevantChunks(userQuery, 10);
    
    const context = chunks
      .slice(0, 10)
      .map(c => c.content)
      .join('\n\n');

    const sources = chunks.map(c => {
      const meta = c.metadata;
      const title = String(meta.drawingNo || meta.wireNo || meta.connectorCode || meta.tagNo || meta.circuitCode || c.id || 'Unknown');
      return { type: c.sourceType, id: c.sourceId, title };
    });

    return { chunks: chunks.slice(0, 10), context, sources };
  }

  async explainCircuit(wireNo: string): Promise<string> {
    const [circuit, wires, pins, trainlines] = await Promise.all([
      prisma.circuit.findFirst({
        where: { circuitCode: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
        include: { drawing: { include: { system: true } } },
      }),
      prisma.wire.findMany({
        where: { wireNo: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
      }),
      prisma.connectorPin.findMany({
        where: { wireNo: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
        include: { connector: true },
      }),
      prisma.trainLine.findMany({
        where: { wireNo: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
        include: { drawing: true },
      }),
    ]);

    if (!circuit && wires.length === 0) {
      return `No circuit found for wire number ${wireNo}`;
    }

    let explanation = `## Wire ${wireNo} Analysis\n\n`;

    if (circuit) {
      explanation += `**Circuit Name:** ${circuit.circuitName || 'N/A'}\n`;
      explanation += `**Circuit Code:** ${circuit.circuitCode || 'N/A'}\n`;
      if (circuit.category) explanation += `**Category:** ${circuit.category}\n`;
      if (circuit.carScope) explanation += `**Car Scope:** ${circuit.carScope}\n`;
      if (circuit.voltageText) explanation += `**Voltage:** ${circuit.voltageText}\n`;
      if (circuit.note) explanation += `**Note:** ${circuit.note}\n`;
    } else if (wires.length > 0) {
      const w = wires[0];
      explanation += `**Signal Name:** ${w.signalName || 'N/A'}\n`;
      explanation += `**Wire No:** ${w.wireNo || 'N/A'}\n`;
      if (w.voltageClass) explanation += `**Voltage Class:** ${w.voltageClass}\n`;
      if (w.wireSize) explanation += `**Wire Size:** ${w.wireSize}\n`;
      if (w.description) explanation += `**Description:** ${w.description}\n`;
    }

    if (pins.length > 0) {
      explanation += `\n### Connected Endpoints\n`;
      pins.forEach(p => {
        explanation += `- ${p.connector?.connectorCode || 'Unknown'}:${p.pinNo} - ${p.signalName || 'N/A'}\n`;
      });
    }

    if (trainlines.length > 0) {
      explanation += `\n### Related Trainlines\n`;
      trainlines.forEach(t => {
        explanation += `- ${t.wireNo}: ${t.itemName}\n`;
      });
    }

    if (circuit?.drawing) {
      explanation += `\n### Source Drawing\n`;
      explanation += `- ${circuit.drawing.drawingNo}: ${circuit.drawing.title}\n`;
    }

    return explanation;
  }
}

export const ragService = new RAGService();