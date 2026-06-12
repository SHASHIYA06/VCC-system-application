/**
 * Populate VCC Descriptions into the database
 * Syncs system descriptions from VCC Description document (GR/TD/3328) into the database
 * Run: npx tsx scripts/populate-vcc-descriptions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VCC_DESCRIPTIONS = [
  {
    systemCode: 'GEN',
    systemName: 'General / Foundation',
    description: 'General part drawings provide useful information such as Drawing List, Wiring numbers, description, Train-lines, symbols etc. This includes the complete VCC documentation index, wire numbering conventions, conductor classification (HV, ED, AP, BA, S), and symbol definitions used across all VCC drawings.',
    technicalSpecs: 'Wire numbering: 5-digit format. 1st digit = Car Type (None=Trainline, D=DMC, T=TC, M=MC). 2nd digit = System hierarchy. 3rd-5th = Trainline/Serial number. Conductor classes: HV (750V DC), ED (AC Traction Motors), AP (3Ph 415V/230V AC), BA (110V DC), S (Shielded/Analogue).',
    powerRequirements: 'N/A - Reference documentation',
    voltage: 'N/A',
  },
  {
    systemCode: 'TRL',
    systemName: 'Trainlines',
    description: 'Train control circuits including Controlling Cab, start-up, System status indication and Train line supply Contactor circuits. Controls HCR (Head Control Relay), TCR (Tail Control Relay), LCAR (Last Cab Activated Relay), and system start-up sequence.',
    technicalSpecs: 'Key relays: HCR, TCR, LCAR, STUR (Start-Up Relay), ASDR (Aux Shut Down Relay). Controls: AUX ON, AOFFS (Aux Off Switch), RESET, TLSC (Train Line Supply Contactor). Mode Selector (MS): RM, NRM modes.',
    powerRequirements: '110V DC Battery Supply',
    voltage: '110V DC',
  },
  {
    systemCode: 'LIGHT',
    systemName: 'Interior Lighting',
    description: 'Vehicle structure & interior fitting circuits including Head Light, Cab Main Light, Tail Light, Flasher Light, Console Light, Saloon Lights, Gangway Light, Windscreen Wiper. Emergency lighting powered by battery backup.',
    technicalSpecs: 'Components: HLS (Head Light Signal), HL(L/R), CML (Cab Main Light), TL(L/R), FL (Flasher Light), DCL (Door Console Light), ELCB1-4 (Earth Leakage Circuit Breakers), GWL (Gangway Light), WWCB (Windscreen Wiper Circuit Breaker).',
    powerRequirements: '230V AC from APS for normal lighting, 110V DC battery backup for emergency lighting',
    voltage: '230V AC / 110V DC emergency',
  },
  {
    systemCode: 'COUPL',
    systemName: 'Coupler Control',
    description: 'Coupling and uncoupling control circuits for train set connection. Controls the mechanical coupler, electrical connections, and pneumatic coupling between train units.',
    technicalSpecs: 'Components: COLPB (Coupling Operating Lever Push Button), UCPB (Uncoupling Push Button), MCCMV (Master Coupler Control Magnetic Valve), MCUCMV (Master Coupler Uncouple MV), MCDR (Master Coupler Detection Relay), COLR (Coupler Operating Lever Relay).',
    powerRequirements: '110V DC control supply, pneumatic air supply',
    voltage: '110V DC',
  },
  {
    systemCode: 'TRAC',
    systemName: 'Traction Control',
    description: 'Traction system including DC750V main power supply, speed control, VVVF (Variable Voltage Variable Frequency) Inverter interface and grounding. Controls propulsion through VVVF inverter driving AC traction motors.',
    technicalSpecs: 'Components: HSCB (High Speed Circuit Breaker), VVVF Inverter, TBC (Traction Brake Controller), MS (Mode Selector), EB1-4 (Emergency Buttons), EOSS (Encoder Optical Speed Sensor). Main power: 750V DC third rail.',
    powerRequirements: '750V DC third rail supply via HSCB. VVVF converts to 3-phase AC for traction motors.',
    voltage: '750V DC input, 3-phase AC output',
    current: '1500A peak traction current',
  },
  {
    systemCode: 'BRAKE',
    systemName: 'Brake System',
    description: 'Brake system including Compressor Control, Brake Loop, Emergency Brake Loop, Parking Brake, Horn and Brake Control. Uses electro-pneumatic braking with BCU (Brake Control Unit) and BECU (Brake Electronic Control Unit).',
    technicalSpecs: 'Components: CM (Compressor Motor), ADU (Air Dryer Unit), BCU, BECU, BCPS (Brake Control Pressure Switch), BLCB (Brake Loop Circuit Breaker), BLPR (Brake Loop Proving Relay), EBLR (Emergency Brake Loop Relay), EBMV (Emergency Brake Magnetic Valve), EBVR (Emergency Brake Valve Relay), PBR (Parking Brake Relay), PBMV (Parking Brake MV), HMV1/2 (Horn MVs).',
    powerRequirements: '415V 3-phase for compressor motor, 110V DC for control circuits',
    voltage: '415V AC (compressor) / 110V DC (control)',
  },
  {
    systemCode: 'APS',
    systemName: 'Auxiliary Power',
    description: 'Auxiliary power system including APS, Shore Supply 415VAC, Power Extension Box and Battery Control. Provides all auxiliary power including 415V AC, 230V AC, and 110V DC battery supply.',
    technicalSpecs: 'Components: APS (Auxiliary Power Supply/SIV), SSB (Shore Supply Box), SIV (Static Inverter), BATT (Battery 110V DC), BCB (Battery Charger Breaker), BUVDR (Battery Under Voltage Detection Relay), APSCB, SSCB (Shore Supply CB), ESK (Earth Switching Knife). Shore supply: 415V 3-phase 50Hz.',
    powerRequirements: '750V DC input from third rail, outputs: 415V 3-phase, 230V single-phase, 110V DC',
    voltage: '415V AC / 230V AC / 110V DC',
    frequency: '50Hz',
  },
  {
    systemCode: 'DOOR',
    systemName: 'Door System',
    description: 'Door system including Saloon Door Supply Voltage, Door Operation, Door Proving Loop, Local Door Interlock Circuit and Communication with TCMS. Each door independently controlled by DCU (Door Control Unit).',
    technicalSpecs: 'Components: DCU (Door Control Unit), EDCU (Emergency Door Control Unit), DMS (Door Mode Switch), DOLR/DORR (Door Open Left/Right Relay), DCLR/DCRR (Door Close Left/Right Relay), DPR (Door Proving Relay), ADCR (All Doors Closed Relay), ADCLp (All Doors Closed Indicator).',
    powerRequirements: '110V DC control supply, door motor power from APS',
    voltage: '110V DC (control) / 24V DC (door motors)',
  },
  {
    systemCode: 'VAC',
    systemName: 'VAC / HVAC',
    description: 'Air conditioning system including Cab VAC and Saloon VAC. Temperature controlled by TCMS interface with automatic and manual modes.',
    technicalSpecs: 'Components: CAB_VAC (Cabin Air Conditioning), VAC (Saloon AC Unit), ADMV (Air Damper Magnetic Valve), FR (Filter Regulator). Two saloon units VAC1/VAC2 per car, one cab unit.',
    powerRequirements: '415V 3-phase AC from APS for compressor, 110V DC for control',
    voltage: '415V AC (compressor) / 110V DC (control)',
    frequency: '50Hz',
  },
  {
    systemCode: 'TMS',
    systemName: 'TCMS',
    description: 'Train Control Management System (TCMS) for train control and monitoring. Central nervous system of the train providing monitoring, control, and diagnostics for all subsystems via RIO (Remote I/O) modules.',
    technicalSpecs: 'Components: TCMS (Train Control Management System), RIO (Remote Input/Output modules), TCPU (Train Central Processing Unit), VDU (Vehicle Display Unit), DCS (Driver Controller System). Communication: MVB (Multifunction Vehicle Bus), ETH (Ethernet).',
    powerRequirements: '110V DC primary, 24V DC for RIO modules',
    voltage: '110V DC / 24V DC',
  },
  {
    systemCode: 'COMMS',
    systemName: 'Communications',
    description: 'Communication system including PIS (Passenger Information System), PA (Public Address), CCTV, Radio, ATP (Automatic Train Protection) interface. Provides passenger information, entertainment, security, and train protection.',
    technicalSpecs: 'Components: PIS (Passenger Information System), PIB (Passenger Information Board), DVAU (Digital Voice Announcer Unit), PA (Public Address), PAMP (Power Amplifier), CCTV (Closed Circuit Television), VDU, ATPCB (ATP Circuit Breaker), TRU (Train Radio Unit).',
    powerRequirements: '110V DC primary supply, 24V DC for electronics',
    voltage: '110V DC / 24V DC',
  },
  {
    systemCode: 'HV',
    systemName: 'High Tension / HV',
    description: 'High voltage power distribution from 750V DC third rail through HSCB (High Speed Circuit Breaker) to VVVF inverter and auxiliary power systems.',
    technicalSpecs: 'Main circuit: 750V DC third rail → Current collector → HSCB → VVVF/APS. Protection: HSCB provides overcurrent and ground fault protection. Earth return via running rails.',
    powerRequirements: '750V DC nominal from third rail',
    voltage: '750V DC (nominal range: 500V-900V)',
    current: '2000A maximum',
  },
];

async function main() {
  console.log('📝 Populating VCC Descriptions...\n');

  try {
    for (const desc of VCC_DESCRIPTIONS) {
      const system = await prisma.system.findUnique({ where: { code: desc.systemCode } });
      
      if (!system) {
        console.log(`  ⚠️ System ${desc.systemCode} not found in database, skipping`);
        continue;
      }

      await prisma.vCCDescription.upsert({
        where: { systemCode: desc.systemCode },
        update: {
          systemName: desc.systemName,
          description: desc.description,
          technicalSpecs: desc.technicalSpecs,
          powerRequirements: desc.powerRequirements,
          voltage: desc.voltage,
          current: desc.current,
          frequency: desc.frequency,
          source: 'VCC Description Document GR/TD/3328',
          lastUpdated: new Date(),
        },
        create: {
          systemCode: desc.systemCode,
          systemName: desc.systemName,
          description: desc.description,
          technicalSpecs: desc.technicalSpecs,
          powerRequirements: desc.powerRequirements,
          voltage: desc.voltage,
          current: desc.current,
          frequency: desc.frequency,
          source: 'VCC Description Document GR/TD/3328',
        },
      });

      console.log(`  ✅ ${desc.systemCode} - ${desc.systemName}`);
    }

    const total = await prisma.vCCDescription.count();
    console.log(`\n✅ VCC Descriptions populated: ${total} systems`);
    console.log(`   Source: VCC Description Document GR/TD/3328 (13.12.2017)`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
