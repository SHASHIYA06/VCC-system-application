import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { searchDocuments, searchWiring } from '@/lib/rag/service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query');
  const type = searchParams.get('type') || 'all';
  const carType = searchParams.get('car');
  const subsystem = searchParams.get('subsystem');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results: Record<string, any> = {
      query,
      type,
      carType: carType || null,
      subsystem: subsystem || null,
      total: 0,
    };

    if (type === 'all' || type === 'wires') {
      const wires = await prisma.wire.findMany({
        where: {
          wireNo: { contains: query, mode: Prisma.QueryMode.insensitive },
        },
        take: limit,
        orderBy: { wireNo: 'asc' },
      });
      results.wires = wires;
      results.total += wires.length;
    }

    if (type === 'all' || type === 'connectors') {
      const connectors = await prisma.connector.findMany({
        where: {
          OR: [
            { connectorCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { normCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
          ...(carType && { device: { carType } }),
        },
        include: {
          device: { include: { system: true } },
          pins: { take: 10 },
        },
        take: limit,
        orderBy: { connectorCode: 'asc' },
      });
      results.connectors = connectors;
      results.total += connectors.length;
    }

    if (type === 'all' || type === 'equipment') {
      const equipment = await prisma.deviceInstance.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { tag: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
          ...(carType && { carType }),
          ...(subsystem && { system: { code: subsystem } }),
        },
        include: { system: true, type: true, connectors: true },
        take: limit,
        orderBy: { name: 'asc' },
      });
      results.equipment = equipment;
      results.total += equipment.length;
    }

    if (type === 'all' || type === 'drawings') {
      const drawings = await prisma.drawingDocument.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
          ...(carType && { carType }),
          ...(subsystem && { subsystem }),
        },
        take: limit,
        orderBy: { drawingNo: 'asc' },
      });
      results.drawings = drawings;
      results.total += drawings.length;
    }

    if (type === 'all' || type === 'trainlines') {
      const trainlines = await prisma.connectorPin.findMany({
        where: {
          wireNo: { contains: query, mode: Prisma.QueryMode.insensitive },
        },
        include: {
          connector: {
            include: {
              device: { include: { system: true } },
            },
          },
        },
        take: limit,
      });
      results.trainlines = trainlines.map(p => ({
        number: p.wireNo,
        connector: p.connector?.connectorCode,
        pin: p.pinNo,
        device: p.connector?.device?.name,
        car: p.connector?.device?.carType,
        signal: p.signalName || p.endpointLabel,
      }));
      results.total += trainlines.length;
    }

    if (type === 'all' || type === 'systems') {
      const systems = await prisma.system.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { code: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: {
          devices: { take: 5 },
        },
        take: limit,
        orderBy: { name: 'asc' },
      });
      results.systems = systems;
      results.total += systems.length;
    }

    if (type === 'rag') {
      const ragResults = await searchDocuments(query, limit);
      results.rag = ragResults;
      results.total += ragResults.length;
    }

    if (type === 'semantic') {
      const semanticResults = await searchWiring(query, carType || undefined, subsystem || undefined);
      results.semantic = semanticResults;
      results.total += semanticResults.length;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters = {} } = body;
    const { carType, subsystem, wireType, voltageClass, limit = 20 } = filters;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const [wires, connectors, devices, docs] = await Promise.all([
      prisma.wire.findMany({
        where: {
          wireNo: { contains: query, mode: Prisma.QueryMode.insensitive },
          ...(voltageClass && { voltageClass }),
          ...(wireType && { wireType }),
        },
        take: limit,
        include: { endpoints: { include: { device: true, connector: true } } },
      }),
      prisma.connector.findMany({
        where: {
          OR: [
            { connectorCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { normCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
          ...(carType && { device: { carType } }),
        },
        take: limit,
        include: { device: true, pins: true },
      }),
      prisma.deviceInstance.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { tag: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
          ...(carType && { carType }),
          ...(subsystem && { system: { code: subsystem } }),
        },
        take: limit,
        include: { system: true, connectors: true },
      }),
      prisma.drawingDocument.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        take: limit,
      }),
    ]);

    return NextResponse.json({
      query,
      results: {
        wires,
        connectors,
        equipment: devices,
        drawings: docs,
      },
      counts: {
        wires: wires.length,
        connectors: connectors.length,
        equipment: devices.length,
        drawings: docs.length,
        total: wires.length + connectors.length + devices.length + docs.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}