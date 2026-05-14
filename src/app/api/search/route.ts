import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query');
  const type = searchParams.get('type') || 'all';
  const carType = searchParams.get('car');
  const systemCode = searchParams.get('subsystem');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results: Record<string, any> = {
      query,
      type,
      carType: carType || null,
      systemCode: systemCode || null,
      total: 0,
    };

    if (type === 'all' || type === 'wires') {
      const wires = await prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: query } },
            { signalName: { contains: query } },
          ],
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
          connectorCode: { contains: query },
        },
        include: {
          connectorType: true,
          pins: { take: 10 },
        },
        take: limit,
        orderBy: { connectorCode: 'asc' },
      });
      results.connectors = connectors;
      results.total += connectors.length;
    }

    if (type === 'all' || type === 'equipment') {
      const equipment = await prisma.device.findMany({
        where: {
          OR: [
            { deviceName: { contains: query } },
            { tagNo: { contains: query } },
          ],
          ...(carType && { carType }),
        },
        include: { system: true },
        take: limit,
        orderBy: { deviceName: 'asc' },
      });
      results.equipment = equipment;
      results.total += equipment.length;
    }

    if (type === 'all' || type === 'drawings') {
      const drawings = await prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query } },
            { title: { contains: query } },
          ],
        },
        include: { system: true },
        take: limit,
        orderBy: { drawingNo: 'asc' },
      });
      results.drawings = drawings;
      results.total += drawings.length;
    }

    if (type === 'all' || type === 'trainlines') {
      const trainlines = await prisma.trainLine.findMany({
        where: {
          OR: [
            { wireNo: { contains: query } },
            { itemName: { contains: query } },
          ],
        },
        include: { drawing: { include: { system: true } } },
        take: limit,
        orderBy: { wireNo: 'asc' },
      });
      results.trainlines = trainlines;
      results.total += trainlines.length;
    }

    if (type === 'all' || type === 'systems') {
      const systems = await prisma.system.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
          ],
        },
        include: {
          _count: { select: { devices: true, drawings: true } },
        },
        take: limit,
        orderBy: { name: 'asc' },
      });
      results.systems = systems;
      results.total += systems.length;
    }

    if (type === 'all' || type === 'signals') {
      const signals = await prisma.signal.findMany({
        where: {
          OR: [
            { signalName: { contains: query } },
            { signalCode: { contains: query } },
          ],
        },
        take: limit,
        orderBy: { signalName: 'asc' },
      });
      results.signals = signals;
      results.total += signals.length;
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
    const { carType, systemCode, limit = 20 } = filters;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const [wires, connectors, devices, docs, trainlines, signals] = await Promise.all([
      prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: query } },
            { signalName: { contains: query } },
          ],
        },
        take: limit,
      }),
      prisma.connector.findMany({
        where: {
          connectorCode: { contains: query },
        },
        take: limit,
        include: { connectorType: true },
      }),
      prisma.device.findMany({
        where: {
          OR: [
            { deviceName: { contains: query } },
            { tagNo: { contains: query } },
          ],
          ...(carType && { carType }),
        },
        take: limit,
        include: { system: true },
      }),
      prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query } },
            { title: { contains: query } },
          ],
        },
        take: limit,
        include: { system: true },
      }),
      prisma.trainLine.findMany({
        where: {
          OR: [
            { wireNo: { contains: query } },
            { itemName: { contains: query } },
          ],
        },
        take: limit,
        include: { drawing: true },
      }),
      prisma.signal.findMany({
        where: {
          OR: [
            { signalName: { contains: query } },
            { signalCode: { contains: query } },
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
        trainlines,
        signals,
      },
      counts: {
        wires: wires.length,
        connectors: connectors.length,
        equipment: devices.length,
        drawings: docs.length,
        trainlines: trainlines.length,
        signals: signals.length,
        total: wires.length + connectors.length + devices.length + docs.length + trainlines.length + signals.length,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}