import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system');
  const carType = searchParams.get('car');
  const depth = searchParams.get('depth') || 'full'; // full, system, equipment, component

  try {
    const whereClause: any = {};
    
    if (systemCode) {
      const system = await prisma.system.findFirst({ where: { code: systemCode } });
      if (system) whereClause.systemId = system.id;
    }
    if (carType) whereClause.carType = carType;

    // Get all systems with their hierarchy
    const systems = await prisma.system.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        drawings: {
          include: {
            _count: { select: { connectors: true, devices: true, pages: true } },
            connectors: {
              include: {
                pins: true,
                _count: { select: { pins: true, wireEndpoints: true } }
              }
            },
            devices: true
          }
        },
        devices: {
          include: {
            drawing: { select: { drawingNo: true, title: true } },
            _count: { select: { wireEndpoints: true } }
          },
          orderBy: { deviceName: 'asc' }
        }
      }
    });

    // Build hierarchical tree
    const tree = systems.map(sys => {
      const systemDrawings = sys.drawings || [];
      const systemDevices = sys.devices || [];
      
      // Group drawings by type/category
      const drawingsWithConnectors = systemDrawings.filter(d => (d._count?.connectors || 0) > 0);
      const drawingsSchematic = systemDrawings.filter(d => (d._count?.pages || 0) > 0 && (d._count?.connectors || 0) === 0);
      
      // Group devices by type
      const devicesByType = systemDevices.reduce((acc, dev) => {
        const type = dev.deviceType || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push({
          id: dev.id,
          name: dev.deviceName,
          tag: dev.tagNo,
          carType: dev.carType,
          location: dev.locationTag,
          drawing: dev.drawing?.drawingNo,
          connections: dev._count?.wireEndpoints || 0
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Collect all connectors with pins for this system
      const allConnectors = systemDrawings.flatMap(d => 
        (d.connectors || []).map(c => ({
          id: c.id,
          code: c.connectorCode,
          type: c.connectorTypeCode,
          carType: c.carType,
          pinCount: c._count?.pins || 0,
          wiredPins: (c.pins || []).filter(p => p.wireNo).length,
          drawing: d.drawingNo
        }))
      );

      // Count by car type
      const byCarType = allConnectors.reduce((acc, c) => {
        const car = c.carType || 'ALL';
        if (!acc[car]) acc[car] = { connectors: 0, pins: 0 };
        acc[car].connectors++;
        acc[car].pins += c.wiredPins;
        return acc;
      }, {} as Record<string, { connectors: number; pins: number }>);

      return {
        code: sys.code,
        name: sys.name,
        category: sys.category,
        stats: {
          drawings: systemDrawings.length,
          drawingsWithConnectors: drawingsWithConnectors.length,
          devices: systemDevices.length,
          connectors: allConnectors.length,
          totalPins: allConnectors.reduce((sum, c) => sum + c.pinCount, 0),
          wiredPins: allConnectors.reduce((sum, c) => sum + c.wiredPins, 0)
        },
        byCarType,
        drawings: {
          pinAssignments: drawingsWithConnectors.map(d => ({
            no: d.drawingNo,
            title: d.title,
            sheets: d.totalSheets,
            connectors: (d.connectors || []).length,
            connectorList: (d.connectors || []).map(c => ({
              code: c.connectorCode,
              pins: c._count?.pins || 0,
              wired: (c.pins || []).filter(p => p.wireNo).length
            }))
          })),
          schematics: drawingsSchematic.map(d => ({
            no: d.drawingNo,
            title: d.title,
            sheets: d.totalSheets
          }))
        },
        devices: Object.entries(devicesByType).map(([type, devs]) => ({
          type,
          count: devs.length,
          list: devs
        }))
      };
    });

    // Filter if system code specified
    const filteredTree = systemCode ? tree.filter(t => t.code === systemCode) : tree;

    return NextResponse.json({
      total: filteredTree.length,
      hierarchy: filteredTree
    });

  } catch (error) {
    console.error('Tree error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}