import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * REPAIR SCRIPT 3: Seed Missing VCC Descriptions
 * 
 * Problem: VCCDescription table has only 12 rows but 21 systems exist
 * Solution: Auto-generate descriptions for missing systems
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auditing VCC Description coverage...');

    // STEP 1: Find which systems have descriptions
    const systemsWithDesc = await prisma.vCCDescription.findMany({
      select: { systemCode: true },
    });

    const describedCodes = new Set(systemsWithDesc.map(d => d.systemCode));
    console.log(`✅ Found ${describedCodes.size} systems with descriptions`);

    // STEP 2: Find all systems
    const allSystems = await prisma.system.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' },
    });

    console.log(`📋 Total systems in database: ${allSystems.length}`);

    // STEP 3: Find missing systems
    const missing = allSystems.filter(s => !describedCodes.has(s.code));

    console.log(`⚠️ Missing descriptions for ${missing.length} systems:`, 
      missing.map(m => m.code).join(', ')
    );

    return NextResponse.json({
      status: 'audit',
      timestamp: new Date().toISOString(),
      coverage: {
        totalSystems: allSystems.length,
        withDescriptions: describedCodes.size,
        missingDescriptions: missing.length,
        coveragePercent: ((describedCodes.size / allSystems.length) * 100).toFixed(1),
      },
      systemsWithDescriptions: Array.from(describedCodes).sort(),
      missingSystems: missing.map(m => ({
        code: m.code,
        name: m.name,
      })),
      nextStep: 'POST /api/seed-vcc-descriptions to auto-generate missing descriptions',
    });
  } catch (error) {
    console.error('❌ Audit failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'VCC Description audit failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting VCC Description seed...');

    // STEP 1: Find all systems
    const allSystems = await prisma.system.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' },
    });

    // STEP 2: Find which systems already have descriptions
    const existingDescs = await prisma.vCCDescription.findMany({
      select: { systemCode: true },
    });

    const existingCodes = new Set(existingDescs.map(d => d.systemCode));
    const missingCodes = allSystems.filter(s => !existingCodes.has(s.code));

    console.log(`🌱 Found ${missingCodes.length} systems needing descriptions`);

    // STEP 3: Generate descriptions for missing systems
    const generatedDescriptions = missingCodes.map(system => ({
      systemCode: system.code,
      systemName: system.name,
      description: generateSystemDescription(system.code, system.name),
      voltage: 'Refer to drawing',
      current: 'Refer to drawing',
      power: 'Refer to drawing',
      source: 'AUTO_GENERATED',
      documentVersion: '1.0',
      lastUpdated: new Date(),
    }));

    console.log(`📝 Generated descriptions for: ${generatedDescriptions.map(d => d.systemCode).join(', ')}`);

    // STEP 4: Bulk upsert (update if exists, create if not)
    const result = await prisma.vCCDescription.createMany({
      data: generatedDescriptions,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${result.count} VCC descriptions`);

    // STEP 5: Get final counts
    const finalCount = await prisma.vCCDescription.count();
    const finalSystems = await prisma.system.count();

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      beforeSeed: {
        systemCount: finalSystems,
        descriptionCount: finalSystems - result.count,
      },
      afterSeed: {
        systemCount: finalSystems,
        descriptionCount: finalCount,
        newDescriptionsCreated: result.count,
      },
      coverage: {
        coveragePercent: ((finalCount / finalSystems) * 100).toFixed(1),
      },
      generatedFor: generatedDescriptions.map(d => ({
        systemCode: d.systemCode,
        systemName: d.systemName,
      })),
      message: `✅ VCC Description coverage improved from ${((finalSystems - result.count) / finalSystems * 100).toFixed(1)}% to ${(finalCount / finalSystems * 100).toFixed(1)}%`,
    });
  } catch (error) {
    console.error('❌ Seed failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'VCC Description seed failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a meaningful description for each system based on its code and name
 */
function generateSystemDescription(code: string, name: string): string {
  const descriptions: Record<string, string> = {
    TCMS: 'Train Control and Management System - Central control logic for train operation',
    CCTV: 'Closed-Circuit Television - Passenger and exterior monitoring system',
    AAU: 'Auxiliary Air Unit - Compressed air supply for pneumatic systems',
    PEAU: 'Passenger Environment Air Unit - HVAC system for passenger comfort',
    TFT: 'Thin-Film Transistor Display - Digital display systems for information',
    DOOR: 'Door Control System - Passenger door operation and interlocks',
    BECU: 'Brake Electronic Control Unit - Brake system management',
    EDB: 'Event Data Recorder - Black box recording of operational events',
    LTEB: 'Long-Term Event Buffer - Extended event logging system',
    LTJB: 'Local Train Junction Box - Local electrical junction and distribution',
    VAC: 'Vacuum/HVAC System - Air handling and cabin pressure control',
    BRAKE: 'Brake System - Pneumatic and dynamic braking',
    TRAC: 'Traction System - Propulsion motor control',
    HV: 'High Voltage System - Main power distribution',
    LIGHT: 'Lighting System - Interior and exterior lighting',
    GEN: 'Generator System - Auxiliary power generation',
    TRL: 'Trainline System - Inter-car power and signal distribution',
    CAB: 'Cabin Control System - Driver cabin systems',
    BOGIE: 'Bogie System - Suspension and running gear',
    COMMS: 'Communication System - Internal and external communications',
    APS: 'Auxiliary Power Supply - Backup and supplemental power',
  };

  return descriptions[code] || `${name} - System in KMRCL Metro Rail vehicle`;
}
