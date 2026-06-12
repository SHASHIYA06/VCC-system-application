/**
 * Troubleshooting API - Database-Integrated
 * GET /api/troubleshooting - Get troubleshooting data with live database references
 * GET /api/troubleshooting?systemCode=BRAKE - Get system-specific troubleshooting
 * GET /api/troubleshooting?search=door - Search fault codes
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface FaultCode {
  code: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  system: string;
  trainlines: string[];
  symptoms: string[];
  causes: string[];
  solutions: string[];
  drawings: string[];
}

// Complete fault code database linked to actual VCC systems
const FAULT_DATABASE: FaultCode[] = [
  // TRACTION FAULTS
  { code: 'VVVF_FAULT', description: 'VVVF Inverter Fault', severity: 'critical', system: 'TRAC', trainlines: ['1207'], symptoms: ['Train fails to accelerate', 'VVVF fault indicator lit', 'HSCB may trip'], causes: ['Overcurrent condition in VVVF', 'Motor overload or short circuit', 'Cooling system failure', 'Internal VVVF protection trip'], solutions: ['Check trainline 1207 for fault signal', 'Verify VVVF CN2 connections', 'Check motor insulation', 'Monitor cooling system status', 'Reset VVVF using trainline 1032'], drawings: ['942-58120', '942-58121'] },
  { code: 'HSCB_TRIP', description: 'High Speed Circuit Breaker Trip', severity: 'critical', system: 'HV', trainlines: ['1209'], symptoms: ['Traction power lost', 'HSCB indicator shows trip', 'Train coasts to stop'], causes: ['Overcurrent on traction circuit', 'Ground fault detection', 'VVVF fault causing trip', 'Protective relay operation'], solutions: ['Check trainline 1209 status', 'Verify HSCB CN1 connections', 'Check for ground faults', 'Check VVVF fault status', 'Reset HSCB after fault clearance'], drawings: ['942-38103', '942-58106'] },
  { code: 'MOTOR_OVERTEMP', description: 'Traction Motor Overtemperature', severity: 'warning', system: 'TRAC', trainlines: ['1245'], symptoms: ['Reduced traction power', 'Motor temperature warning', 'Cooling fan running continuously'], causes: ['Motor cooling system failure', 'Excessive load or acceleration', 'Blocked air vents', 'Cooling fan fault'], solutions: ['Check trainline 1245 temperature signal', 'Verify cooling fan operation', 'Check air vents for blockage', 'Allow motor to cool before restart', 'Check motor insulation resistance'], drawings: ['942-58120', '942-58121'] },
  // BRAKE FAULTS
  { code: 'EM_BRAKE_FAULT', description: 'Emergency Brake Application Fault', severity: 'critical', system: 'BRAKE', trainlines: ['4062', '4103'], symptoms: ['Emergency brake stuck on', 'Brake cannot be released', 'Train cannot move'], causes: ['Break in emergency brake loop (4062)', 'EBMV or EBSS failure', 'Wiring fault in redundant path (4103)'], solutions: ['Check trainline 4062 continuity', 'Check trainline 4103 redundant path', 'Verify BCU/EBCU connections', 'Check all car-to-car jumpers'], drawings: ['942-58125', '942-58128'] },
  { code: 'PARKING_BRAKE', description: 'Parking Brake Fault', severity: 'warning', system: 'BRAKE', trainlines: ['4122', '4153'], symptoms: ['Parking brake not applying', 'Parking brake not releasing', 'Brake indicator flashing'], causes: ['PBMV fault', 'Air pressure insufficient', 'Wiring issue to PBMV1'], solutions: ['Check trainline 4122 (applied)', 'Check trainline 4153 (released)', 'Verify PBMV1 connections', 'Check air pressure'], drawings: ['942-58126'] },
  { code: 'COMPRESSOR_FAULT', description: 'Air Compressor Failure', severity: 'critical', system: 'BRAKE', trainlines: ['4001'], symptoms: ['Low air pressure warning', 'Compressor not running', 'Brake pressure dropping'], causes: ['Compressor motor failure', 'Compressor thermal overload', 'Air leaks in system', 'Compressor contactor fault'], solutions: ['Check trainline 4001 (compressor status)', 'Verify compressor motor connections', 'Check thermal overload relay', 'Inspect air system for leaks', 'Check compressor contactor CM'], drawings: ['942-58123'] },
  // DOOR FAULTS
  { code: 'DOOR_FAULT', description: 'Door System Fault', severity: 'warning', system: 'DOOR', trainlines: ['6073', '6076', '6112'], symptoms: ['Door not opening/closing', 'Door proving failure', 'Door safety loop open'], causes: ['Door proving circuit open (6073, 6076)', 'Zero speed signal issue (6112)', 'DCU internal fault', 'Door motor failure'], solutions: ['Check door proving status (6073, 6076)', 'Verify zero speed signal (6112)', 'Check DCU1 connections', 'Verify door edge sensors', 'Check door motor operation'], drawings: ['942-58137', '942-58138', '942-58139', '942-58140'] },
  { code: 'DOOR_CROSS_FAULT', description: 'Door Cross Connection Fault', severity: 'warning', system: 'DOOR', trainlines: ['6009', '6014', '6046', '6051'], symptoms: ['Left and right doors operating together', 'Crossed wire condition'], causes: ['Crossed connections at jumpers 43-44', 'Crossed connections at jumpers 46-47', 'Wire mix-up in trainline routing'], solutions: ['Check jumper 43-44 for 6009/6046 cross', 'Check jumper 46-47 for 6014/6051 cross', 'Verify TCMS_RIO1 CN17 connections', 'Trace wire routing through X1'], drawings: ['942-58138', '942-58139'] },
  // VAC FAULTS
  { code: 'CAB_VAC_FAULT', description: 'Cab VAC Fault', severity: 'warning', system: 'VAC', trainlines: ['7001'], symptoms: ['Cab air conditioning not working', 'Cab VAC fault indicator', 'Temperature not controlled'], causes: ['CAB_VAC1 unit fault', 'Power supply issue to VAC', 'Communication fault with TCMS'], solutions: ['Check trainline 7001 for fault signal', 'Verify CAB_VAC1 CN1 connections', 'Check power supply to cab VAC', 'Reset using TCMS interface'], drawings: ['942-58143'] },
  { code: 'SALOON_VAC_FAULT', description: 'Saloon VAC Fault', severity: 'warning', system: 'VAC', trainlines: ['7050', '7060', '7070'], symptoms: ['Saloon not cooling', 'VAC status shows fault', 'Smoke detection alarm'], causes: ['VAC1 or VAC2 unit fault', 'Power supply issue (415V from APS)', 'Smoke detection triggered', 'Dampers not operating'], solutions: ['Check trainline 7050 (VAC1 status)', 'Check trainline 7060 (VAC2 status)', 'Check trainline 7070 (smoke detection)', 'Verify APS 415V supply via X3', 'Check damper operation (7071)'], drawings: ['942-58144', '942-58145'] },
  // APS FAULTS
  { code: 'AUX_FAULT', description: 'Auxiliary System Fault', severity: 'warning', system: 'APS', trainlines: ['1215'], symptoms: ['Auxiliary power not available', 'SIV contact not closing', 'Battery not charging'], causes: ['APS1 internal fault', 'SIV (Static Inverter) failure', 'Battery charger fault'], solutions: ['Check trainline 1215 for fault signal', 'Verify SIV contact status (5030, 5031)', 'Check battery voltage (5064)', 'Verify APS1 connections'], drawings: ['942-58130', '942-58131', '942-58132'] },
  { code: 'BATTERY_FAULT', description: 'Battery Under Voltage', severity: 'warning', system: 'APS', trainlines: ['5064'], symptoms: ['Low battery voltage warning', 'Battery discharge indicator', 'Emergency lighting may activate'], causes: ['Battery discharged', 'Battery failing', 'APS not charging battery', 'Excessive load on battery'], solutions: ['Check trainline 5064 battery voltage', 'Verify BATT1 connections', 'Check APS charging function', 'Connect shore supply for charging'], drawings: ['942-58132'] },
  // TCMS FAULTS
  { code: 'TCMS_COMM_FAULT', description: 'TCMS Communication Fault', severity: 'critical', system: 'TMS', trainlines: [], symptoms: ['TCMS not responding', 'Loss of monitoring data', 'Multiple system faults shown'], causes: ['TCMS_RIO failure', 'Ethernet network issue', 'Power supply to RIO'], solutions: ['Check TCMS_RIO1 (U15) status', 'Check TCMS_RIO2 (U25) status', 'Verify Ethernet switch connections', 'Check power supply to RIO units'], drawings: ['942-58146'] },
  // LIGHTING FAULTS
  { code: 'HEADLIGHT_FAULT', description: 'Headlight Not Working', severity: 'warning', system: 'LIGHT', trainlines: ['5110', '5111'], symptoms: ['One or both headlights not working', 'Headlight switch has no effect', 'HLS relay not energizing'], causes: ['Bulb failure', 'HLS relay fault', 'Wiring break in headlight circuit', 'HLCB tripped'], solutions: ['Check trainline 5110 (left headlight)', 'Check trainline 5111 (right headlight)', 'Test HLS relay operation', 'Replace headlight bulbs if needed', 'Check HLCB circuit breaker status'], drawings: ['942-58112'] },
  { code: 'EMERGENCY_LIGHT', description: 'Emergency Lighting Not Activating', severity: 'critical', system: 'LIGHT', trainlines: ['5064'], symptoms: ['Emergency lights not coming on', 'Battery supply missing', 'Emergency lighting dim'], causes: ['Battery discharge', 'Emergency lighting circuit fault', 'BCB not closing', 'Wiring break in emergency circuit'], solutions: ['Check trainline 5064 (battery voltage)', 'Test battery voltage (should be 110V DC)', 'Verify BCB contactor operation', 'Check emergency light bulbs', 'Test battery charging system'], drawings: ['942-58132'] },
];

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('systemCode');
  const search = searchParams.get('search');
  const faultCode = searchParams.get('faultCode');

  try {
    let faults = [...FAULT_DATABASE];

    // Filter by system
    if (systemCode) {
      faults = faults.filter(f => f.system === systemCode);
    }

    // Filter by search term
    if (search) {
      const q = search.toLowerCase();
      faults = faults.filter(f =>
        f.code.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.system.toLowerCase().includes(q) ||
        f.trainlines.some(tl => tl.includes(q)) ||
        f.symptoms.some(s => s.toLowerCase().includes(q)) ||
        f.causes.some(c => c.toLowerCase().includes(q))
      );
    }

    // Get specific fault code
    if (faultCode) {
      faults = faults.filter(f => f.code === faultCode);
    }

    // Enrich with live database data for each fault's drawings and trainlines
    const enrichedFaults = await Promise.all(
      faults.map(async (fault) => {
        // Check which drawings actually exist in database
        const existingDrawings = await prisma.drawing.findMany({
          where: { drawingNo: { in: fault.drawings } },
          select: { id: true, drawingNo: true, title: true, systemId: true },
        });

        // Check trainline wires in database
        const existingWires = fault.trainlines.length > 0
          ? await prisma.wire.findMany({
              where: { wireNo: { in: fault.trainlines } },
              select: { wireNo: true, signalName: true, description: true },
            })
          : [];

        return {
          ...fault,
          databaseLinks: {
            drawings: existingDrawings.map(d => ({
              id: d.id,
              drawingNo: d.drawingNo,
              title: d.title,
              exists: true,
            })),
            wires: existingWires.map(w => ({
              wireNo: w.wireNo,
              signalName: w.signalName,
              description: w.description,
              exists: true,
            })),
            missingDrawings: fault.drawings.filter(d => !existingDrawings.find(ed => ed.drawingNo === d)),
            missingWires: fault.trainlines.filter(tl => !existingWires.find(ew => ew.wireNo === tl)),
          },
        };
      })
    );

    // Get system statistics
    const systems = await prisma.system.findMany({
      select: { code: true, name: true, _count: { select: { drawings: true, devices: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        faults: enrichedFaults,
        total: enrichedFaults.length,
        systems: systems.map(s => ({
          code: s.code,
          name: s.name,
          faultCount: FAULT_DATABASE.filter(f => f.system === s.code).length,
          drawingCount: s._count.drawings,
          deviceCount: s._count.devices,
        })),
        statistics: {
          totalFaults: FAULT_DATABASE.length,
          criticalCount: FAULT_DATABASE.filter(f => f.severity === 'critical').length,
          warningCount: FAULT_DATABASE.filter(f => f.severity === 'warning').length,
          systemsCovered: [...new Set(FAULT_DATABASE.map(f => f.system))].length,
        },
      },
      executionTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Troubleshooting API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch troubleshooting data', details: String(error) },
      { status: 500 }
    );
  }
}
