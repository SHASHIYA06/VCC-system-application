import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Seed missing VCCDescriptions for systems that don't have one.
 * Does NOT overwrite existing descriptions.
 */

const SYSTEM_DESCRIPTIONS: Record<string, { name: string; description: string; voltage: string; technicalSpecs: string; safetyFeatures: string }> = {
  CAB: {
    name: 'Controlling Cab',
    description: 'The Controlling Cab system encompasses all driver controls, instrument panels, and cab-side interfaces. It includes the master controller (throttle/brake), driver console displays, cab signaling equipment, horn, wiper controls, and cab HVAC. The controlling cab (DMC) provides the primary operator interface for train operation, with redundant safety circuits for emergency operations.',
    voltage: '110VDC control, 24VDC instrumentation, 230VAC cab power',
    technicalSpecs: 'Master controller with 7 notch positions. Dead man switch (vigilance device). Cab signal display (ATP/CBTC). Emergency brake reset. Horn dual-tone (high/low). Wiper intermittent control. Cab light dimmer. Windscreen heater.',
    safetyFeatures: 'Vigilance control system (dead man). Emergency brake plunger. Emergency horn. Cab door interlock. Driver seat occupancy sensor.',
  },
  BOGIE: {
    name: 'Bogie',
    description: 'The Bogie system covers the mechanical and electrical interfaces mounted on the bogie frame. This includes axle-mounted speed sensors (tachogenerators), brake actuators (disc and tread), suspension monitoring, and bogie-mounted equipment junction boxes. Speed signals from the bogie are critical inputs to the traction and braking control systems.',
    voltage: '24VDC sensors, 110VDC brake commands, 750VDC traction motor power',
    technicalSpecs: '2 speed sensors per axle (redundant). Brake disc temperature monitoring. Primary/secondary suspension pressure sensors. Bogie-mounted junction box (BMJB). Traction motor cooling fan status.',
    safetyFeatures: 'Speed sensor redundancy (2 per axle). Brake cylinder pressure monitoring. Over-speed protection input. Bogie fire detection.',
  },
  PIS: {
    name: 'Passenger Information System',
    description: 'The Passenger Information System (PIS) provides automated and manual announcements, destination displays, and passenger guidance across the train. It includes front/rear LED destination boards, internal LCD displays, audio PA system with pre-recorded announcements, and inter-car communication. PIS is coordinated via the TCMS for automatic station announcements.',
    voltage: '110VDC power supply, 24VDC LED displays, 230VAC audio amplifiers',
    technicalSpecs: 'LED destination display (front/rear). LCD internal displays (per car). Audio PA with 2 amplifiers per car. Pre-recorded announcement memory (50+ languages). GPS/location-based auto-announcements. Inter-car digital audio bus.',
    safetyFeatures: 'Emergency announcement override. Driver manual announcement priority. Fire alarm announcement trigger. Low-power mode on battery.',
  },
  DISPLAY: {
    name: 'Display System',
    description: 'The Display system includes driver console displays (DMI - Driver Machine Interface), passenger information displays, and crew communication displays. The DMI provides real-time train status, speed, traction/braking commands, fault notifications, and diagnostic information to the driver.',
    voltage: '24VDC for LCD displays, 110VDC for status indicators',
    technicalSpecs: 'Driver DMI: 10.4" TFT LCD, 800x600 resolution. Touch screen interface. Anti-glare coating. Brightness: 500 nits. Passenger displays: LED segment/LCD per car.',
    safetyFeatures: 'Display redundancy (primary + backup). Brightness auto-adjust. Night mode. Fault display priority.',
  },
  EDB: {
    name: 'Electrical Distribution Box',
    description: 'The Electrical Distribution Box (EDB) is the main power distribution hub for each car. It houses circuit breakers (MCBs/MCCBs), contactors, and fuses that distribute 750VDC traction power, 415VAC auxiliary power, and 110VDC control power to all subsystems within a car. The EDB is the primary point of electrical isolation for maintenance.',
    voltage: '750VDC main bus, 415VAC auxiliary, 110VDC control, 24VDC instrumentation',
    technicalSpecs: 'Main contactor (MCB1) - 750VDC rated. Auxiliary contactor - 415VAC rated. 24 branch circuit breakers (MCB). Earth leakage relay. Current transformers for monitoring. Surge protection devices.',
    safetyFeatures: 'Main circuit breaker with shunt trip. Earth fault detection. Arc fault detection. Interlock with door. Padlock provisions for lockout/tagout.',
  },
  LTEB: {
    name: 'Low Tension Equipment Box',
    description: 'The Low Tension Equipment Box (LTEB) houses 110VDC and 24VDC control equipment including relay logic, terminal blocks, and signal conditioning circuits. It serves as the central wiring junction for control signals between the TCMS and field devices. The LTEB contains the main inter-car jumper terminations (X1, X2 connectors).',
    voltage: '110VDC control power, 24VDC sensor power',
    technicalSpecs: '74-pin inter-car connectors (X1, X2). Terminal block strips (TB1-TB12). Relay logic for brake interlock. Signal conditioning for speed sensors. Fuse panel for 24VDC circuits.',
    safetyFeatures: 'Inter-car connector interlock. Control power fusing. Relay contact monitoring. IP43 enclosure rating.',
  },
  LTJB: {
    name: 'Low Tension Junction Box',
    description: 'The Low Tension Junction Box (LTJB) provides cable termination and distribution points for 110VDC and 24VDC control wiring within each car. It serves as the intermediate wiring hub between the LTEB and individual device connectors, reducing cable runs and simplifying maintenance access.',
    voltage: '110VDC control, 24VDC signal',
    technicalSpecs: 'Terminal block strips for wire distribution. IP54 rated enclosure. Cable glands for incoming/outgoing cables. Bus bars for power distribution. Test points for diagnostics.',
    safetyFeatures: 'Sealed enclosure (IP54). Labelled terminals. Test point access. Cable strain relief.',
  },
  AUX: {
    name: 'Auxiliary Electric System',
    description: 'The Auxiliary Electric System encompasses all non-traction electrical loads including battery management, battery charging, DC-DC converters, and auxiliary power distribution. It ensures 110VDC control power availability even when the main 750VDC supply is absent (e.g., during stabling or shore supply operation).',
    voltage: '750VDC input, 110VDC battery bus, 24VDC instrumentation',
    technicalSpecs: 'Battery charger (110VDC, 50A). DC-DC converter (750V→110V). Battery bank (110V, 200Ah). Shore supply contactor. Battery disconnect contactor. Battery monitoring BMS.',
    safetyFeatures: 'Under-voltage detection. Over-voltage protection. Battery temperature monitoring. Automatic shore supply transfer. Battery isolation switch.',
  },
  COUPLING: {
    name: 'Coupler Control',
    description: 'The Coupler Control system manages the electrical connections between coupled trains (multiple formations). It includes the inter-coupler electrical connectors, automatic coupling detection, and train-to-train communication bus extension. When two formations are coupled, the system automatically extends the TCMS network and power distribution.',
    voltage: '750VDC power coupling, 110VDC control coupling, Ethernet communication coupling',
    technicalSpecs: 'Electrical coupler with 200+ contacts. Automatic coupling detection sensor. Power bus extension contactors. Ethernet switch cascade. Pneumatic coupling for brake pipe.',
    safetyFeatures: 'Coupling confirmation sensor. Power interlock (no live coupling). Brake pipe continuity check. Communication bus verification.',
  },
};

export async function POST() {
  try {
    const allSystems = await prisma.system.findMany({ select: { code: true, name: true } });
    const existing = await prisma.vCCDescription.findMany({ select: { systemCode: true } });
    const existingCodes = new Set(existing.map(e => e.systemCode));

    const missing = allSystems.filter(s => !existingCodes.has(s.code));
    let created = 0;

    for (const sys of missing) {
      const desc = SYSTEM_DESCRIPTIONS[sys.code];
      if (desc) {
        await prisma.vCCDescription.create({
          data: {
            systemCode: sys.code,
            systemName: sys.name,
            description: desc.description,
            voltage: desc.voltage,
            technicalSpecs: desc.technicalSpecs,
            safetyFeatures: desc.safetyFeatures,
            source: 'MANUAL_SEED',
            documentVersion: '1.0',
          },
        });
        created++;
      } else {
        // Create placeholder for systems without specific content
        await prisma.vCCDescription.create({
          data: {
            systemCode: sys.code,
            systemName: sys.name,
            description: `${sys.name} system in KMRCL RS(3R) Metro vehicle control circuits. Refer to system drawings for detailed specifications.`,
            source: 'AUTO_GENERATED',
            documentVersion: '1.0',
          },
        });
        created++;
      }
    }

    const totalAfter = await prisma.vCCDescription.count();

    return NextResponse.json({
      status: 'success',
      systemsTotal: allSystems.length,
      existingBefore: existing.length,
      missingFound: missing.length,
      created,
      totalAfter,
      message: `Added ${created} VCCDescriptions. Total: ${totalAfter}/${allSystems.length} systems covered.`,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
