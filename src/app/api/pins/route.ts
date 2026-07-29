import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Connector Pins API
 *
 * Returns connector pins with the full traceability chain the UI needs:
 *   pin -> connector -> drawing -> system
 *   pin -> wireEndpoint -> device   (equipment tag)
 *
 * Response keys are snake_case to match the /pins page contract.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
  const search = (searchParams.get('search') || '').trim();
  const connectorCode = searchParams.get('connector_code');
  const carType = searchParams.get('car_type');
  const systemCode = searchParams.get('system_code');
  const wireNo = searchParams.get('wire_no');
  const drawingNo = searchParams.get('drawing_no');

  try {
    const where: Prisma.ConnectorPinWhereInput = {};

    if (search) {
      where.OR = [
        { pinNo: { contains: search, mode: 'insensitive' } },
        { signalName: { contains: search, mode: 'insensitive' } },
        { wireNo: { contains: search, mode: 'insensitive' } },
        { connector: { connectorCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (wireNo) where.wireNo = wireNo;

    // Build the connector filter as ONE object so later filters never clobber
    // earlier ones (the previous implementation reassigned `where.connector`
    // and silently dropped the connector_code constraint).
    const connectorFilter: Prisma.ConnectorWhereInput = {};
    if (connectorCode) connectorFilter.connectorCode = connectorCode;
    if (carType) connectorFilter.carType = carType;
    if (systemCode || drawingNo) {
      connectorFilter.drawing = {
        ...(systemCode ? { system: { code: systemCode } } : {}),
        ...(drawingNo ? { drawingNo } : {}),
      };
    }
    if (Object.keys(connectorFilter).length > 0) {
      where.connector = connectorFilter;
    }

    const [pins, total] = await Promise.all([
      prisma.connectorPin.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ connectorId: 'asc' }, { pinNo: 'asc' }],
        select: {
          id: true,
          pinNo: true,
          pinLabel: true,
          signalName: true,
          wireNo: true,
          note: true,
          conductorClassCode: true,
          voltageText: true,
          terminalFrom: true,
          terminalTo: true,
          connector: {
            select: {
              connectorCode: true,
              carType: true,
              locationTag: true,
              connectorTypeCode: true,
              drawing: {
                select: {
                  drawingNo: true,
                  title: true,
                  system: { select: { code: true, name: true } },
                },
              },
            },
          },
          // Equipment tag comes from the wire endpoint attached to this pin.
          wireEndpoints: {
            select: {
              endpointRole: true,
              device: { select: { tagNo: true, deviceName: true, carType: true } },
            },
            take: 2,
          },
        },
      }),
      prisma.connectorPin.count({ where }),
    ]);

    // Filter option lists (bounded)
    const [connectors, cars, systems] = await Promise.all([
      prisma.connector.findMany({
        select: { connectorCode: true },
        distinct: ['connectorCode'],
        orderBy: { connectorCode: 'asc' },
        take: 300,
      }),
      prisma.connector.findMany({
        select: { carType: true },
        distinct: ['carType'],
        where: { carType: { not: null } },
        orderBy: { carType: 'asc' },
      }),
      prisma.system.findMany({
        select: { code: true, name: true },
        orderBy: { code: 'asc' },
      }),
    ]);

    return NextResponse.json({
      pins: pins.map((p) => {
        // Prefer a device tag from the wire endpoint; fall back to the
        // connector's location tag so the column is never blank.
        const device = p.wireEndpoints.find((e) => e.device)?.device;
        return {
          id: p.id,
          connector_code: p.connector?.connectorCode || '',
          connector_type: p.connector?.connectorTypeCode || '',
          equipment_code: device?.tagNo || p.connector?.locationTag || '',
          equipment_name: device?.deviceName || '',
          car_code: p.connector?.carType || device?.carType || '',
          system_code: p.connector?.drawing?.system?.code || '',
          system_name: p.connector?.drawing?.system?.name || '',
          drawing_no: p.connector?.drawing?.drawingNo || '',
          drawing_title: p.connector?.drawing?.title || '',
          pin_no: p.pinNo,
          pin_label: p.pinLabel || '',
          signal_name: p.signalName || '',
          wire: p.wireNo || '',
          description: p.note || p.signalName || '',
          conductorClassCode: p.conductorClassCode,
          voltageText: p.voltageText,
          terminalFrom: p.terminalFrom,
          terminalTo: p.terminalTo,
        };
      }),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      connectors: connectors.map((c) => c.connectorCode),
      cars: cars.map((c) => c.carType).filter(Boolean),
      systems: systems.map((s) => s.code),
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch pins',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
