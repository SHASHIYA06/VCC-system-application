import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query');
  const type = searchParams.get('type'); // wire, connector, pin, equipment, drawing
  
  if (!query || query.length < 2) {
    return NextResponse.json({ 
      error: 'Query too short (min 2 chars)',
      results: []
    });
  }
  
  const q = query.toLowerCase();
  const results: any = {
    wires: [],
    connectors: [],
    pins: [],
    equipment: [],
    drawings: [],
    trainlines: []
  };
  
  try {
    // Search wires
    if (!type || type === 'wire') {
      const wires = await prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: q } },
            { signalName: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 20,
        orderBy: { wireNo: 'asc' }
      });
      results.wires = wires.map(w => ({
        id: w.wireNo,
        label: w.wireNo,
        detail: w.signalName || w.wireColor,
        type: 'wire'
      }));
    }
    
    // Search connectors
    if (!type || type === 'connector') {
      const connectors = await prisma.connector.findMany({
        where: {
          OR: [
            { connectorCode: { contains: q } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: { drawing: true },
        take: 20,
        orderBy: { connectorCode: 'asc' }
      });
      results.connectors = connectors.map(c => ({
        id: c.id,
        label: c.connectorCode,
        detail: c.description,
        drawing: c.drawing?.drawingNo,
        type: 'connector'
      }));
    }
    
    // Search pins
    if (!type || type === 'pin') {
      const pins = await prisma.connectorPin.findMany({
        where: {
          OR: [
            { pinNo: { contains: q } },
            { signalName: { contains: q, mode: 'insensitive' } },
            { wireNo: { contains: q } }
          ]
        },
        include: { connector: true },
        take: 30
      });
      results.pins = pins.map(p => ({
        id: p.id,
        label: `${p.connector?.connectorCode}:${p.pinNo}`,
        signal: p.signalName,
        connector: p.connector?.connectorCode,
        wire: p.wireNo,
        type: 'pin'
      }));
    }
    
    // Search equipment
    if (!type || type === 'equipment') {
      const devices = await prisma.device.findMany({
        where: {
          OR: [
            { deviceName: { contains: q, mode: 'insensitive' } },
            { tagNo: { contains: q } }
          ]
        },
        include: { system: true },
        take: 20
      });
      results.equipment = devices.map(d => ({
        id: d.id,
        label: d.tagNo || d.deviceName,
        name: d.deviceName,
        system: d.system?.code,
        location: d.locationTag,
        type: 'equipment'
      }));
    }
    
    // Search drawings
    if (!type || type === 'drawing') {
      const drawings = await prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: q } },
            { title: { contains: q, mode: 'insensitive' } },
            { remarks: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: { system: true },
        take: 20,
        orderBy: { drawingNo: 'asc' }
      });
      results.drawings = drawings.map(d => ({
        id: d.id,
        label: d.drawingNo,
        title: d.title,
        system: d.system?.code,
        sheets: d.totalSheets,
        type: 'drawing'
      }));
    }
    
    // Search trainlines
    if (!type || type === 'trainline') {
      const trainlines = await prisma.trainLine.findMany({
        where: {
          OR: [
            { wireNo: { contains: q } },
            { itemName: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 20
      });
      results.trainlines = trainlines.map(t => ({
        id: t.id,
        label: t.wireNo,
        name: t.itemName,
        group: t.lineGroup,
        type: 'trainline'
      }));
    }
    
    const totalResults = 
      results.wires.length + 
      results.connectors.length + 
      results.pins.length + 
      results.equipment.length + 
      results.drawings.length +
      results.trainlines.length;
    
    return NextResponse.json({
      query,
      total: totalResults,
      results
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      details: String(error)
    }, { status: 500 });
  }
}