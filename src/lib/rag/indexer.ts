/**
 * Document Indexing Service
 * Indexes VCC documents into the RAG system
 */

import { prisma } from '@/lib/prisma';
import { chunkDocument, DocumentChunkInput } from './chunking';
import { generateEmbeddings } from './embeddings';
import { storeChunks, DocumentChunk } from './mongodb';

export interface IndexingProgress {
  total: number;
  processed: number;
  failed: number;
  status: 'running' | 'completed' | 'failed';
}

/**
 * Index all drawings
 */
export async function indexDrawings(
  onProgress?: (progress: IndexingProgress) => void
): Promise<void> {
  const drawings = await prisma.drawing.findMany({
    include: {
      system: true,
      pages: true,
      connectors: {
        include: {
          pins: true,
        },
      },
      trainLines: true,
      devices: true,
    },
  });
  
  const progress: IndexingProgress = {
    total: drawings.length,
    processed: 0,
    failed: 0,
    status: 'running',
  };
  
  for (const drawing of drawings) {
    try {
      await indexDrawing(drawing);
      progress.processed++;
      onProgress?.(progress);
    } catch (error) {
      console.error(`Failed to index drawing ${drawing.drawingNo}:`, error);
      progress.failed++;
      onProgress?.(progress);
    }
  }
  
  progress.status = 'completed';
  onProgress?.(progress);
}

/**
 * Index a single drawing
 */
export async function indexDrawing(drawing: any): Promise<void> {
  // Build comprehensive document content
  const content = buildDrawingContent(drawing);
  
  // Create document chunks
  const input: DocumentChunkInput = {
    content,
    metadata: {
      documentId: drawing.id,
      documentType: 'drawing',
      drawingNo: drawing.drawingNo,
      title: drawing.title,
      systemCode: drawing.system?.code,
      revision: drawing.revision,
      totalSheets: drawing.totalSheets,
      source: drawing.sourceFileId,
    },
  };
  
  const chunks = chunkDocument(input);
  
  // Generate embeddings
  const texts = chunks.map(c => c.content);
  const embeddings = await generateEmbeddings(texts);
  
  // Prepare chunks for storage
  const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
    documentId: drawing.id,
    documentType: 'drawing',
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    metadata: chunk.metadata,
    embedding: embeddings[index].embedding,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  
  // Store in MongoDB
  await storeChunks(documentChunks);
  
  console.log(`✅ Indexed drawing ${drawing.drawingNo} (${chunks.length} chunks)`);
}

/**
 * Build comprehensive content for a drawing
 */
function buildDrawingContent(drawing: any): string {
  const sections: string[] = [];
  
  // Header
  sections.push(`# Drawing: ${drawing.drawingNo} - ${drawing.title}`);
  sections.push(`Revision: ${drawing.revision}`);
  sections.push(`System: ${drawing.system?.name || 'N/A'} (${drawing.system?.code || 'N/A'})`);
  sections.push(`Total Sheets: ${drawing.totalSheets}`);
  sections.push('');
  
  // Description
  if (drawing.remarks) {
    sections.push(`## Description`);
    sections.push(drawing.remarks);
    sections.push('');
  }
  
  // Pages (OCR text)
  if (drawing.pages && drawing.pages.length > 0) {
    sections.push(`## Pages`);
    for (const page of drawing.pages) {
      if (page.ocrText) {
        sections.push(`### Page ${page.pageNo}`);
        sections.push(page.ocrText);
        sections.push('');
      }
    }
  }
  
  // Connectors
  if (drawing.connectors && drawing.connectors.length > 0) {
    sections.push(`## Connectors`);
    for (const connector of drawing.connectors) {
      sections.push(`### ${connector.connectorCode}`);
      sections.push(`- Type: ${connector.connectorTypeCode || 'Standard'}`);
      sections.push(`- Description: ${connector.description || 'N/A'}`);
      sections.push(`- Car Type: ${connector.carType || 'N/A'}`);
      sections.push(`- Location: ${connector.locationTag || 'N/A'}`);
      sections.push(`- Pin Count: ${connector.pinCount || connector.pins?.length || 0}`);
      
      // Pins
      if (connector.pins && connector.pins.length > 0) {
        sections.push(`#### Pins`);
        for (const pin of connector.pins) {
          sections.push(`- Pin ${pin.pinNo}: ${pin.signalName || 'N/A'} (Wire: ${pin.wireNo || 'N/A'})`);
        }
      }
      sections.push('');
    }
  }
  
  // Trainlines
  if (drawing.trainLines && drawing.trainLines.length > 0) {
    sections.push(`## Trainlines`);
    for (const tl of drawing.trainLines) {
      sections.push(`- ${tl.wireNo}: ${tl.itemName} (${tl.lineGroup})`);
      if (tl.note) sections.push(`  ${tl.note}`);
    }
    sections.push('');
  }
  
  // Devices
  if (drawing.devices && drawing.devices.length > 0) {
    sections.push(`## Devices`);
    for (const device of drawing.devices) {
      sections.push(`- ${device.deviceName} (${device.deviceType || 'N/A'})`);
      if (device.tagNo) sections.push(`  Tag: ${device.tagNo}`);
      if (device.locationTag) sections.push(`  Location: ${device.locationTag}`);
    }
    sections.push('');
  }
  
  return sections.join('\n');
}

/**
 * Index all wires
 */
export async function indexWires(): Promise<void> {
  const wires = await prisma.wire.findMany({
    include: {
      endpoints: {
        include: {
          device: true,
          connector: true,
          pin: true,
        },
      },
    },
  });
  
  for (const wire of wires) {
    const content = buildWireContent(wire);
    
    const input: DocumentChunkInput = {
      content,
      metadata: {
        documentId: wire.id,
        documentType: 'wire',
        wireNo: wire.wireNo,
        signalName: wire.signalName,
        conductorClassCode: wire.conductorClassCode,
      },
    };
    
    const chunks = chunkDocument(input);
    const texts = chunks.map(c => c.content);
    const embeddings = await generateEmbeddings(texts);
    
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      documentId: wire.id,
      documentType: 'wire',
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      metadata: chunk.metadata,
      embedding: embeddings[index].embedding,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await storeChunks(documentChunks);
  }
  
  console.log(`✅ Indexed ${wires.length} wires`);
}

/**
 * Build content for a wire
 */
function buildWireContent(wire: any): string {
  const sections: string[] = [];
  
  sections.push(`# Wire: ${wire.wireNo}`);
  sections.push(`Signal: ${wire.signalName || 'N/A'}`);
  sections.push(`Conductor Class: ${wire.conductorClassCode || 'N/A'}`);
  sections.push(`Description: ${wire.description || 'N/A'}`);
  sections.push('');
  
  if (wire.endpoints && wire.endpoints.length > 0) {
    sections.push(`## Endpoints`);
    for (const endpoint of wire.endpoints) {
      sections.push(`- ${endpoint.endpointRole || 'Endpoint'}: ${endpoint.endpointLabel || 'N/A'}`);
      if (endpoint.device) {
        sections.push(`  Device: ${endpoint.device.deviceName}`);
      }
      if (endpoint.connector) {
        sections.push(`  Connector: ${endpoint.connector.connectorCode}`);
      }
      if (endpoint.pin) {
        sections.push(`  Pin: ${endpoint.pin.pinNo}`);
      }
    }
  }
  
  return sections.join('\n');
}

/**
 * Index all connectors
 */
export async function indexConnectors(): Promise<void> {
  const connectors = await prisma.connector.findMany({
    include: {
      drawing: {
        include: {
          system: true,
        },
      },
      pins: true,
      connectorType: true,
    },
  });
  
  for (const connector of connectors) {
    const content = buildConnectorContent(connector);
    
    const input: DocumentChunkInput = {
      content,
      metadata: {
        documentId: connector.id,
        documentType: 'connector',
        connectorCode: connector.connectorCode,
        drawingNo: connector.drawing?.drawingNo,
        carType: connector.carType,
      },
    };
    
    const chunks = chunkDocument(input);
    const texts = chunks.map(c => c.content);
    const embeddings = await generateEmbeddings(texts);
    
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      documentId: connector.id,
      documentType: 'connector',
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      metadata: chunk.metadata,
      embedding: embeddings[index].embedding,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await storeChunks(documentChunks);
  }
  
  console.log(`✅ Indexed ${connectors.length} connectors`);
}

/**
 * Build content for a connector
 */
function buildConnectorContent(connector: any): string {
  const sections: string[] = [];
  
  sections.push(`# Connector: ${connector.connectorCode}`);
  sections.push(`Type: ${connector.connectorType?.description || connector.connectorTypeCode || 'Standard'}`);
  sections.push(`Description: ${connector.description || 'N/A'}`);
  sections.push(`Car Type: ${connector.carType || 'N/A'}`);
  sections.push(`Location: ${connector.locationTag || 'N/A'}`);
  sections.push(`Drawing: ${connector.drawing?.drawingNo || 'N/A'} - ${connector.drawing?.title || 'N/A'}`);
  sections.push(`System: ${connector.drawing?.system?.name || 'N/A'}`);
  sections.push('');
  
  if (connector.pins && connector.pins.length > 0) {
    sections.push(`## Pins (${connector.pins.length})`);
    for (const pin of connector.pins) {
      sections.push(`### Pin ${pin.pinNo}`);
      sections.push(`- Signal: ${pin.signalName || 'N/A'}`);
      sections.push(`- Wire: ${pin.wireNo || 'N/A'}`);
      sections.push(`- Conductor Class: ${pin.conductorClassCode || 'N/A'}`);
      sections.push(`- Voltage: ${pin.voltageText || 'N/A'}`);
      if (pin.terminalFrom) sections.push(`- From: ${pin.terminalFrom}`);
      if (pin.terminalTo) sections.push(`- To: ${pin.terminalTo}`);
      if (pin.note) sections.push(`- Note: ${pin.note}`);
    }
  }
  
  return sections.join('\n');
}

/**
 * Index all systems
 */
export async function indexSystems(): Promise<void> {
  const systems = await prisma.system.findMany({
    include: {
      drawings: true,
      devices: true,
    },
  });
  
  for (const system of systems) {
    const content = buildSystemContent(system);
    
    const input: DocumentChunkInput = {
      content,
      metadata: {
        documentId: system.id,
        documentType: 'system',
        systemCode: system.code,
      },
    };
    
    const chunks = chunkDocument(input);
    const texts = chunks.map(c => c.content);
    const embeddings = await generateEmbeddings(texts);
    
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      documentId: system.id,
      documentType: 'system',
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      metadata: chunk.metadata,
      embedding: embeddings[index].embedding,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await storeChunks(documentChunks);
  }
  
  console.log(`✅ Indexed ${systems.length} systems`);
}

/**
 * Build content for a system
 */
function buildSystemContent(system: any): string {
  const sections: string[] = [];
  
  sections.push(`# System: ${system.name} (${system.code})`);
  sections.push(`Category: ${system.category || 'N/A'}`);
  sections.push(`Description: ${system.description || 'N/A'}`);
  sections.push('');
  
  if (system.drawings && system.drawings.length > 0) {
    sections.push(`## Drawings (${system.drawings.length})`);
    for (const drawing of system.drawings) {
      sections.push(`- ${drawing.drawingNo}: ${drawing.title}`);
    }
    sections.push('');
  }
  
  if (system.devices && system.devices.length > 0) {
    sections.push(`## Devices (${system.devices.length})`);
    const deviceTypes = [...new Set(system.devices.map((d: any) => d.deviceType))];
    for (const type of deviceTypes) {
      const count = system.devices.filter((d: any) => d.deviceType === type).length;
      sections.push(`- ${type}: ${count}`);
    }
  }
  
  return sections.join('\n');
}

/**
 * Index everything
 */
export async function indexAll(
  onProgress?: (progress: IndexingProgress) => void
): Promise<void> {
  console.log('🚀 Starting full indexing...');
  
  await indexSystems();
  await indexDrawings(onProgress);
  await indexWires();
  await indexConnectors();
  
  console.log('✅ Full indexing complete');
}
