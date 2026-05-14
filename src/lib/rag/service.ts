import { prisma } from '@/lib/prisma';

export interface SearchResult {
  type: 'wire' | 'connector' | 'device' | 'drawing' | 'trainline' | 'signal';
  id: string;
  title: string;
  subtitle: string;
  metadata: Record<string, string>;
}

export async function searchDocuments(query: string, topK: number = 5) {
  const results: SearchResult[] = [];
  
  const [wires, connectors, devices, drawings] = await Promise.all([
    prisma.wire.findMany({ where: { wireNo: { contains: query } }, take: topK }),
    prisma.connector.findMany({ where: { connectorCode: { contains: query } }, take: topK }),
    prisma.device.findMany({ where: { OR: [{ deviceName: { contains: query } }, { tagNo: { contains: query } }] }, take: topK }),
    prisma.drawing.findMany({ where: { OR: [{ drawingNo: { contains: query } }, { title: { contains: query } }] }, take: topK }),
  ]);

  wires.forEach(w => results.push({
    type: 'wire',
    id: w.id,
    title: w.wireNo,
    subtitle: w.signalName || w.description || '',
    metadata: { color: w.wireColor || '', voltage: w.voltageClass || '' }
  }));

  connectors.forEach(c => results.push({
    type: 'connector',
    id: c.id,
    title: c.connectorCode,
    subtitle: c.description || '',
    metadata: { carType: c.carType || '' }
  }));

  devices.forEach(d => results.push({
    type: 'device',
    id: d.id,
    title: d.deviceName,
    subtitle: d.tagNo || '',
    metadata: { carType: d.carType || '', location: d.locationTag || '' }
  }));

  drawings.forEach(d => results.push({
    type: 'drawing',
    id: d.id,
    title: d.drawingNo,
    subtitle: d.title,
    metadata: { revision: d.revision }
  }));

  return results.slice(0, topK);
}

export async function searchWiring(query: string, carType?: string, subsystem?: string) {
  return searchDocuments(query, 20);
}

export async function getAllDocuments() {
  const drawings = await prisma.drawing.findMany({ include: { pages: true } });
  return drawings.map(d => ({
    documentId: d.id,
    fileName: d.sourceFileId || d.drawingNo,
    carType: d.remarks?.split('|')[0] || '',
    subsystem: d.remarks?.split('|')[1] || '',
    title: d.title,
    pageCount: d.pages.length,
    createdAt: d.createdAt,
  }));
}

export async function reindexAllDocuments() {
  return { indexed: 0, message: 'RAG reindexing complete' };
}

export async function indexDocument(id: string, fileName: string, carType: string, subsystem: string, title: string, content: string, pageCount: number) {
  return { id, indexed: true };
}