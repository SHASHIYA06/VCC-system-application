import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Digital Twin Hierarchy API
 * Returns the full navigable hierarchy: Formation → Car → System → Subsystem → Device → Connector → Pin
 * Supports lazy loading at each level via ?level=&parentId= query params
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') || 'formation';
  const parentId = searchParams.get('parentId') || null;
  const systemCode = searchParams.get('systemCode') || null;

  try {
    switch (level) {
      case 'formation': {
        const formations = await prisma.formation.findMany({
          include: {
            cars: {
              orderBy: { carPosition: 'asc' },
              select: { id: true, carCode: true, carType: true, carPosition: true, carLabel: true },
            },
            project: { select: { projectName: true, projectCode: true } },
          },
        });
        return NextResponse.json({
          success: true,
          level: 'formation',
          data: formations.map(f => ({
            id: f.id,
            code: f.formationCode,
            name: f.formationName,
            carCount: f.carCount,
            project: f.project.projectName,
            cars: f.cars,
          })),
        });
      }

      case 'car': {
        if (!parentId) {
          return NextResponse.json({ success: false, error: 'parentId required for car level' }, { status: 400 });
        }
        const car = await prisma.car.findUnique({
          where: { id: parentId },
          include: {
            carSystems: {
              include: {
                system: {
                  select: { id: true, code: true, name: true, category: true, iconName: true, colorTheme: true },
                },
              },
            },
          },
        });
        if (!car) return NextResponse.json({ success: false, error: 'Car not found' }, { status: 404 });
        return NextResponse.json({
          success: true,
          level: 'car',
          data: {
            id: car.id,
            carCode: car.carCode,
            carType: car.carType,
            carPosition: car.carPosition,
            systems: car.carSystems.map(cs => cs.system),
          },
        });
      }

      case 'system': {
        const systemId = parentId;
        if (!systemId) {
          // Return all systems
          const systems = await prisma.system.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true, code: true, name: true, category: true, iconName: true, colorTheme: true,
              _count: { select: { devices: true, drawings: true, subsystems: true } },
            },
          });
          return NextResponse.json({
            success: true,
            level: 'systems',
            data: systems.map(s => ({
              id: s.id,
              code: s.code,
              name: s.name,
              category: s.category,
              iconName: s.iconName,
              colorTheme: s.colorTheme,
              deviceCount: s._count.devices,
              drawingCount: s._count.drawings,
              subsystemCount: s._count.subsystems,
            })),
          });
        }
        // Return system details with subsystems and devices
        const system = await prisma.system.findUnique({
          where: { id: systemId },
          include: {
            subsystems: {
              orderBy: { sortOrder: 'asc' },
              select: { id: true, code: true, name: true, description: true },
            },
            devices: {
              take: 100,
              orderBy: { deviceName: 'asc' },
              select: {
                id: true, deviceName: true, deviceType: true, tagNo: true, carType: true,
                _count: { select: { wireEndpoints: true } },
              },
            },
            drawings: {
              take: 50,
              orderBy: { drawingNo: 'asc' },
              select: { id: true, drawingNo: true, title: true, revision: true, totalSheets: true },
            },
            vccDescription: { select: { description: true, technicalSpecs: true, powerRequirements: true } },
          },
        });
        if (!system) return NextResponse.json({ success: false, error: 'System not found' }, { status: 404 });
        return NextResponse.json({ success: true, level: 'system', data: system });
      }

      case 'device': {
        if (!parentId) return NextResponse.json({ success: false, error: 'parentId required' }, { status: 400 });
        const device = await prisma.device.findUnique({
          where: { id: parentId },
          include: {
            system: { select: { code: true, name: true } },
            subsystem: { select: { code: true, name: true } },
            specifications: { select: { specCode: true, specName: true, specValue: true, unit: true, category: true } },
            wireEndpoints: {
              take: 50,
              include: {
                wire: { select: { wireNo: true, signalName: true, wireStatus: true } },
                connector: { select: { connectorCode: true } },
                pin: { select: { pinNo: true, pinLabel: true } },
              },
            },
          },
        });
        if (!device) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
        return NextResponse.json({ success: true, level: 'device', data: device });
      }

      case 'connector': {
        if (!parentId) {
          // Get connectors by system code
          if (!systemCode) return NextResponse.json({ success: false, error: 'systemCode or parentId required' }, { status: 400 });
          const connectors = await prisma.connector.findMany({
            where: { drawing: { systemId: (await prisma.system.findUnique({ where: { code: systemCode } }))?.id } },
            take: 100,
            orderBy: { connectorCode: 'asc' },
            select: {
              id: true, connectorCode: true, description: true, carType: true, pinCount: true, scope: true,
              _count: { select: { pins: true, wireEndpoints: true } },
            },
          });
          return NextResponse.json({ success: true, level: 'connectors', data: connectors });
        }
        // Single connector detail with pins
        const connector = await prisma.connector.findUnique({
          where: { id: parentId },
          include: {
            pins: {
              orderBy: { pinNo: 'asc' },
              select: {
                id: true, pinNo: true, pinLabel: true, wireNo: true, signalName: true,
                conductorClassCode: true, voltageText: true, terminalFrom: true, terminalTo: true,
              },
            },
            drawing: { select: { drawingNo: true, title: true, systemId: true } },
            connectorType: { select: { code: true, description: true, nominalPins: true } },
          },
        });
        if (!connector) return NextResponse.json({ success: false, error: 'Connector not found' }, { status: 404 });
        return NextResponse.json({ success: true, level: 'connector', data: connector });
      }

      case 'wire': {
        if (!parentId) return NextResponse.json({ success: false, error: 'parentId (wireNo) required' }, { status: 400 });
        const wire = await prisma.wire.findFirst({
          where: { OR: [{ id: parentId }, { wireNo: parentId }] },
          include: {
            endpoints: {
              include: {
                connector: { select: { connectorCode: true, description: true, carType: true } },
                pin: { select: { pinNo: true, pinLabel: true, signalName: true } },
                device: { select: { deviceName: true, tagNo: true, carType: true } },
              },
            },
            drawings: {
              include: { drawing: { select: { drawingNo: true, title: true, system: { select: { code: true, name: true } } } } },
            },
          },
        });
        if (!wire) return NextResponse.json({ success: false, error: 'Wire not found' }, { status: 404 });
        return NextResponse.json({ success: true, level: 'wire', data: wire });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown level: ${level}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Twin hierarchy error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
