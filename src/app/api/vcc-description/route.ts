/**
 * VCC Description API - Database-Synchronized
 * GET /api/vcc-description - Get all VCC system descriptions from database
 * POST /api/vcc-description - Upsert VCC description for a system
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('systemCode');

  try {
    if (systemCode) {
      // Get specific system VCC description
      const system = await prisma.system.findUnique({
        where: { code: systemCode },
        include: {
          vccDescription: true,
          metadata: true,
          drawings: {
            select: { id: true, drawingNo: true, title: true, totalSheets: true },
            orderBy: { drawingNo: 'asc' },
          },
          devices: {
            select: { id: true, tagNo: true, deviceName: true, deviceType: true },
            take: 50,
          },
          _count: {
            select: { drawings: true, devices: true },
          },
        },
      });

      if (!system) {
        return NextResponse.json({ error: 'System not found' }, { status: 404 });
      }

      // Get connectors for this system's drawings
      const connectors = await prisma.connector.findMany({
        where: { drawing: { systemId: system.id } },
        select: {
          connectorCode: true,
          pinCount: true,
          locationTag: true,
          _count: { select: { pins: true } },
        },
        take: 100,
      });

      // Get wires for this system's drawings
      const wireCount = await prisma.drawingWire.count({
        where: { drawing: { systemId: system.id } },
      });

      return NextResponse.json({
        success: true,
        data: {
          code: system.code,
          name: system.name,
          category: system.category,
          description: system.description,
          vccDescription: system.vccDescription,
          metadata: system.metadata,
          statistics: {
            totalDrawings: system._count.drawings,
            totalDevices: system._count.devices,
            totalConnectors: connectors.length,
            totalWires: wireCount,
            totalPins: connectors.reduce((sum, c) => sum + c._count.pins, 0),
          },
          drawings: system.drawings,
          devices: system.devices,
          connectors: connectors.map(c => ({
            connectorCode: c.connectorCode,
            pinCount: c.pinCount || c._count.pins,
            locationTag: c.locationTag,
          })),
        },
        executionTime: Date.now() - startTime,
      });
    }

    // Get all systems with VCC descriptions
    const systems = await prisma.system.findMany({
      include: {
        vccDescription: true,
        metadata: true,
        _count: { select: { drawings: true, devices: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: systems.map(sys => ({
        code: sys.code,
        name: sys.name,
        category: sys.category,
        description: sys.description,
        hasVCCDescription: !!sys.vccDescription,
        vccDescription: sys.vccDescription ? {
          description: sys.vccDescription.description,
          technicalSpecs: sys.vccDescription.technicalSpecs,
          powerRequirements: sys.vccDescription.powerRequirements,
          voltage: sys.vccDescription.voltage,
          source: sys.vccDescription.source,
          lastUpdated: sys.vccDescription.lastUpdated,
        } : null,
        metadata: sys.metadata ? {
          dataCompleteness: sys.metadata.dataCompleteness,
          syncStatus: sys.metadata.syncStatus,
          totalDrawings: sys.metadata.totalDrawings,
          totalDevices: sys.metadata.totalDevices,
        } : null,
        statistics: {
          totalDrawings: sys._count.drawings,
          totalDevices: sys._count.devices,
        },
      })),
      total: systems.length,
      executionTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('VCC Description API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VCC descriptions', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { systemCode, description, technicalSpecs, powerRequirements, voltage, current, frequency, safetyFeatures, maintenanceSchedule, source } = body;

    if (!systemCode) {
      return NextResponse.json({ error: 'systemCode is required' }, { status: 400 });
    }

    // Verify system exists
    const system = await prisma.system.findUnique({ where: { code: systemCode } });
    if (!system) {
      return NextResponse.json({ error: `System ${systemCode} not found` }, { status: 404 });
    }

    const upserted = await prisma.vCCDescription.upsert({
      where: { systemCode },
      update: {
        description,
        technicalSpecs,
        powerRequirements,
        voltage,
        current,
        frequency,
        safetyFeatures,
        maintenanceSchedule,
        source: source || 'Manual',
        lastUpdated: new Date(),
      },
      create: {
        systemCode,
        systemName: system.name,
        description,
        technicalSpecs,
        powerRequirements,
        voltage,
        current,
        frequency,
        safetyFeatures,
        maintenanceSchedule,
        source: source || 'Manual',
      },
    });

    return NextResponse.json({
      success: true,
      data: upserted,
      executionTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('VCC Description POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update VCC description', details: String(error) },
      { status: 500 }
    );
  }
}
