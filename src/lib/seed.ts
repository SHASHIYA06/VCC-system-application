import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const CAR_TYPES = [
  { code: 'DMC', name: 'Driving Motor Car', position: 1, description: 'Leading Driving Car with Cab A' },
  { code: 'TC', name: 'Trailer Car', position: 2, description: 'Trailer Car with Pantograph' },
  { code: 'MC', name: 'Motor Car', position: 3, description: 'Motor Car without Cab' },
  { code: 'MC', name: 'Motor Car', position: 4, description: 'Motor Car without Cab' },
  { code: 'TC', name: 'Trailer Car', position: 5, description: 'Trailer Car with Pantograph' },
  { code: 'DMC', name: 'Driving Motor Car', position: 6, description: 'Trailing Driving Car with Cab B' },
];

const SYSTEMS = [
  { code: 'TCMS', name: 'Train Control Management System', description: 'Central TCMS control and monitoring', category: 'CONTROL' },
  { code: 'TRAC', name: 'Traction System', description: 'Traction motors and VVVF control', category: 'TRACTION' },
  { code: 'HV', name: 'High Voltage', description: 'High voltage distribution and protection', category: 'POWER' },
  { code: 'LTEB', name: 'Low Tension Equipment Box', description: 'Low voltage power distribution', category: 'POWER' },
  { code: 'LTJB', name: 'Low Tension Junction Box', description: 'Junction boxes for low voltage', category: 'POWER' },
  { code: 'APS', name: 'Auxiliary Power Supply', description: 'Auxiliary power and battery charging', category: 'POWER' },
  { code: 'BRAKE', name: 'Brake System', description: 'Brake control and air supply', category: 'BRAKE' },
  { code: 'DOOR', name: 'Door System', description: 'Passenger door control', category: 'DOOR' },
  { code: 'VAC', name: 'Ventilation Air Conditioning', description: 'HVAC systems', category: 'HVAC' },
  { code: 'CAB', name: 'Cab Equipment', description: 'Driver cab equipment and controls', category: 'CAB' },
  { code: 'LIGHT', name: 'Lighting System', description: 'Interior and exterior lighting', category: 'LIGHTING' },
  { code: 'COMMS', name: 'Communication System', description: 'PIS, PA, CCTV, Radio', category: 'COMMUNICATION' },
  { code: 'COUPL', name: 'Coupling System', description: 'Car coupling and inter-car connections', category: 'MECHANICAL' },
  { code: 'TRL', name: 'Train Line', description: 'Trainlines for inter-car signaling', category: 'CONTROL' },
  { code: 'EDB', name: 'Electrical Distribution Box', description: 'Electrical distribution', category: 'POWER' },
];

const EQUIPMENT_BY_CAR: Record<string, Array<{ code: string; name: string; systemCode: string; location: string }>> = {
  DMC: [
    { code: 'VVVF-1', name: 'VVVF Inverter 1', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'LTEB-1', name: 'Low Tension Equipment Box 1', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTJB-1', name: 'Low Tension Junction Box 1', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'HSCB-1', name: 'High Speed Circuit Breaker 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'MSB-1', name: 'Main Switch Box 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'CCFB-1', name: 'Current Collector Fuse Box 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'HTEB-1', name: 'High Tension Equipment Box 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'HTJB-1', name: 'High Tension Junction Box 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'CSJB-1', name: 'Collector Shoe Junction Box 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'BCU-1', name: 'Brake Control Unit 1', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'PSB-1', name: 'Pressure Switch Box 1', systemCode: 'BRAKE', location: 'Underframe/Bogie' },
    { code: 'STINGER-1', name: 'Stinger Box 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'TM1', name: 'Traction Motor Connector 1', systemCode: 'TRAC', location: 'Underframe/Bogie' },
    { code: 'FILT_REACT-1', name: 'Filter Reactor 1', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'BRAKE_RES-1', name: 'Brake Resistor 1', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'CAB-VAC-1', name: 'Cab VAC Unit 1', systemCode: 'VAC', location: 'Cab' },
    { code: 'OP_PNL-1', name: 'Operating Panel 1', systemCode: 'CAB', location: 'Cab Desk' },
    { code: 'IND_PNL-1', name: 'Indicator Panel 1', systemCode: 'CAB', location: 'Cab Desk' },
    { code: 'MCB_PNL-1', name: 'MCB Panel 1', systemCode: 'CAB', location: 'Cab' },
    { code: 'HEAD_LIGHT-A', name: 'Head Light A', systemCode: 'LIGHT', location: 'Cab Front' },
    { code: 'TAIL_LIGHT-A', name: 'Tail Light A', systemCode: 'LIGHT', location: 'Cab Rear' },
  ],
  TC: [
    { code: 'APS-1', name: 'Auxiliary Power Supply 1', systemCode: 'APS', location: 'Underframe' },
    { code: 'SSB-1', name: 'Shore Supply Box 1', systemCode: 'APS', location: 'Underframe' },
    { code: 'BATT-1', name: 'Battery Box 1', systemCode: 'APS', location: 'Underframe' },
    { code: 'LTEB-2', name: 'Low Tension Equipment Box 2', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTJB-2', name: 'Low Tension Junction Box 2', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'HTEB-2', name: 'High Tension Equipment Box 2', systemCode: 'HV', location: 'Underframe' },
    { code: 'HTJB-2', name: 'High Tension Junction Box 2', systemCode: 'HV', location: 'Underframe' },
    { code: 'ESK-1', name: 'ESK Box 1', systemCode: 'HV', location: 'Underframe' },
    { code: 'BCU-2', name: 'Brake Control Unit 2', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'PSB-2', name: 'Pressure Switch Box 2', systemCode: 'BRAKE', location: 'Underframe/Bogie' },
    { code: 'EDB-2', name: 'Electrical Distribution Box 2', systemCode: 'EDB', location: 'Ceiling' },
    { code: 'ETH-SW-2', name: 'Ethernet Switch CCTV 2', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'AAU-2', name: 'Audio Alarm Unit 2', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'VAC-2', name: 'Saloon VAC Unit 2', systemCode: 'VAC', location: 'Ceiling' },
    { code: 'TCMS-RIO-2', name: 'TCMS Remote IO Unit 2', systemCode: 'TCMS', location: 'Ceiling' },
    { code: 'DCU-2', name: 'Door Control Unit 2', systemCode: 'DOOR', location: 'Ceiling' },
  ],
  MC: [
    { code: 'VVVF-2', name: 'VVVF Inverter 2', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'LTEB-3', name: 'Low Tension Equipment Box 3', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTJB-3', name: 'Low Tension Junction Box 3', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'HSCB-2', name: 'High Speed Circuit Breaker 2', systemCode: 'HV', location: 'Underframe' },
    { code: 'BECU-1', name: 'Brake Electronic Control Unit 1', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'EDB-1', name: 'Electrical Distribution Box 1', systemCode: 'EDB', location: 'Ceiling' },
    { code: 'ETH-SW-1', name: 'Ethernet Switch CCTV 1', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'AAU-1', name: 'Audio Alarm Unit 1', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'VAC-1', name: 'Saloon VAC Unit 1', systemCode: 'VAC', location: 'Ceiling' },
    { code: 'TCMS-RIO-1', name: 'TCMS Remote IO Unit 1', systemCode: 'TCMS', location: 'Ceiling' },
    { code: 'TCMS-TB-1', name: 'TCMS Terminal Block 1', systemCode: 'TCMS', location: 'Ceiling' },
    { code: 'COMM-NODE-1', name: 'TCMS Communication Node 1', systemCode: 'TCMS', location: 'Ceiling' },
    { code: 'DCU-1', name: 'Door Control Unit 1', systemCode: 'DOOR', location: 'Ceiling' },
    { code: 'PBMV-1', name: 'Parking Brake Magnetic Valve 1', systemCode: 'BRAKE', location: 'Underframe' },
  ],
};

const TRAINLINES = [
  { number: 3001, name: 'Train Line 1 - Reserved', voltage: '24V', description: 'Reserved for future use' },
  { number: 3002, name: 'Train Line 2 - Reserved', voltage: '24V', description: 'Reserved for future use' },
  { number: 3003, name: 'Train Line 3 - VVVF Ready', voltage: '24V', description: 'VVVF ready signal from TCMS to VVVF' },
  { number: 3004, name: 'Train Line 4 - VVVF Run', voltage: '24V', description: 'VVVF run command from TCMS to VVVF' },
  { number: 3005, name: 'Train Line 5 - Propulsion Interlock', voltage: '24V', description: 'Crossed - Propulsion interlock from DMC to MC' },
  { number: 3006, name: 'Train Line 6 - Propulsion Interlock', voltage: '24V', description: 'Crossed - Propulsion interlock from MC to DMC' },
  { number: 4001, name: 'Train Line 401 - AAU Power', voltage: '110V', description: 'AAU power supply' },
  { number: 4002, name: 'Train Line 402 - AAU Signal', voltage: '24V', description: 'AAU signal wiring' },
  { number: 4024, name: 'Train Line 424 - AAU to PEAU', voltage: '24V', description: 'AAU to PEAU communication' },
  { number: 4062, name: 'Train Line 462 - PEAU to TCMS', voltage: '24V', description: 'PEAU to TCMS communication' },
  { number: 4101, name: 'Train Line 4101 - TFT Power', voltage: '110V', description: 'TFT Display power' },
  { number: 4103, name: 'Train Line 4103 - TFT Data', voltage: '24V', description: 'TFT to Ethernet switch data' },
  { number: 4122, name: 'Train Line 4122 - Comm Node', voltage: '24V', description: 'TCMS Communication node link' },
  { number: 6001, name: 'Train Line 6001 - Door Power', voltage: '110V', description: 'Door power supply' },
  { number: 6009, name: 'Train Line 6009 - Door Open', voltage: '24V', description: 'Door open command (crossed at Jumper 43-44)' },
  { number: 6014, name: 'Train Line 6014 - Door Close', voltage: '24V', description: 'Door close command (crossed at Jumper 46-47)' },
  { number: 6046, name: 'Train Line 6046 - Door Open Return', voltage: '24V', description: 'Door open return (crossed)' },
  { number: 6051, name: 'Train Line 6051 - Door Close Return', voltage: '24V', description: 'Door close return (crossed)' },
  { number: 6112, name: 'Train Line 6112 - TCMS TB', voltage: '24V', description: 'TCMS Terminal block connection' },
  { number: 7001, name: 'Train Line 7001 - BECU to EDB', voltage: '110V', description: 'BECU to EDB power' },
  { number: 7050, name: 'Train Line 7050 - VAC Status', voltage: '24V', description: 'VAC status signal' },
  { number: 7060, name: 'Train Line 7060 - VAC Control', voltage: '24V', description: 'VAC control signal' },
];

async function seedSystems() {
  console.log('Seeding systems...');
  for (const sys of SYSTEMS) {
    await prisma.system.upsert({
      where: { name: sys.name },
      update: sys,
      create: sys,
    });
  }
}

async function seedDeviceTypes() {
  console.log('Seeding device types...');
  const deviceTypes = [
    { name: 'RIO', category: 'CONTROLLER', description: 'Remote I/O Unit' },
    { name: 'Ethernet Switch', category: 'NETWORK', description: 'Network Switch' },
    { name: 'Camera', category: 'CCTV', description: 'CCTV Camera' },
    { name: 'VVVF', category: 'TRACTION', description: 'Variable Voltage Variable Frequency Inverter' },
    { name: 'DCU', category: 'DOOR', description: 'Door Control Unit' },
    { name: 'BCU', category: 'BRAKE', description: 'Brake Control Unit' },
    { name: 'BECU', category: 'BRAKE', description: 'Brake Electronic Control Unit' },
    { name: 'APS', category: 'POWER', description: 'Auxiliary Power Supply' },
    { name: 'AAU', category: 'COMMUNICATION', description: 'Audio Alarm Unit' },
    { name: 'PEAU', category: 'COMMUNICATION', description: 'PA Equipment Amplifier Unit' },
    { name: 'TFT', category: 'DISPLAY', description: 'TFT Display' },
    { name: 'VAC', category: 'HVAC', description: 'Ventilation Air Conditioning' },
    { name: 'EDB', category: 'POWER', description: 'Electrical Distribution Box' },
    { name: 'LTEB', category: 'POWER', description: 'Low Tension Equipment Box' },
    { name: 'LTJB', category: 'POWER', description: 'Low Tension Junction Box' },
  ];
  for (const dt of deviceTypes) {
    await prisma.deviceType.upsert({
      where: { name: dt.name },
      update: dt,
      create: dt,
    });
  }
}

async function seedEquipment() {
  console.log('Seeding equipment...');
  const systems = await prisma.system.findMany();
  const systemMap = new Map(systems.map(s => [s.code, s]));

  for (const carType of Object.keys(EQUIPMENT_BY_CAR)) {
    const equipmentList = EQUIPMENT_BY_CAR[carType];
    for (const eq of equipmentList) {
      const system = systemMap.get(eq.systemCode);
      if (!system) continue;

      const existing = await prisma.deviceInstance.findFirst({ where: { tag: eq.code } });
      if (existing) {
        await prisma.deviceInstance.update({
          where: { id: existing.id },
          data: { carType },
        });
      } else {
        await prisma.deviceInstance.create({
          data: {
            tag: eq.code,
            name: eq.name,
            carType,
            location: eq.location,
            systemId: system.id,
          },
        });
      }
    }
  }
}

async function seedWires() {
  console.log('Seeding wires and trainlines...');
  
  const wireTypes = ['single', 'paired', 'shielded', 'twisted'];
  const colors = ['RED', 'BLUE', 'WHITE', 'BLACK', 'YELLOW', 'GREEN', 'ORANGE', 'BROWN'];

  const wires = [];

  for (let i = 3001; i <= 3999; i++) {
    wires.push({
      wireNo: String(i),
      wireType: wireTypes[i % 4],
      wireColor: colors[i % 8],
      voltageClass: i < 4000 ? '24V' : '110V',
      cableSpec: i < 4000 ? '0.75sqmm' : '1.5sqmm',
    });
  }

  for (let i = 4001; i <= 4999; i++) {
    wires.push({
      wireNo: String(i),
      wireType: wireTypes[i % 4],
      wireColor: colors[i % 8],
      voltageClass: '110V',
      cableSpec: '1.5sqmm',
    });
  }

  for (let i = 6001; i <= 6999; i++) {
    wires.push({
      wireNo: String(i),
      wireType: wireTypes[i % 4],
      wireColor: colors[i % 8],
      voltageClass: '24V',
      cableSpec: '0.75sqmm',
    });
  }

  for (let i = 7001; i <= 7999; i++) {
    wires.push({
      wireNo: String(i),
      wireType: wireTypes[i % 4],
      wireColor: colors[i % 8],
      voltageClass: i < 7500 ? '110V' : '24V',
      cableSpec: i < 7500 ? '1.5sqmm' : '0.75sqmm',
    });
  }

  for (const wire of wires) {
    await prisma.wire.upsert({
      where: { wireNo: wire.wireNo },
      update: wire,
      create: wire,
    });
  }
}

async function seedDrawings() {
  console.log('Seeding drawings...');
  
  const drawings = [
    { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', carType: 'DMC', subsystem: 'GEN' },
    { drawingNo: '942-58103', title: 'Train Lines Control', carType: 'DMC', subsystem: 'TRL' },
    { drawingNo: '942-58104', title: 'Train Lines Signal', carType: 'DMC', subsystem: 'TRL' },
    { drawingNo: '942-58131', title: 'AC 415V Shore Supply', carType: 'TC', subsystem: 'APS' },
    { drawingNo: '942-58132', title: 'Battery Control', carType: 'TC', subsystem: 'APS' },
    { drawingNo: '942-58138', title: 'Left Door Operation', carType: 'MC', subsystem: 'DOOR' },
    { drawingNo: '942-58139', title: 'Right Door Operation', carType: 'MC', subsystem: 'DOOR' },
    { drawingNo: '942-58144', title: 'Saloon VAC Power', carType: 'MC', subsystem: 'VAC' },
    { drawingNo: '942-58145', title: 'Saloon VAC Control', carType: 'MC', subsystem: 'VAC' },
    { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', carType: 'MC', subsystem: 'TCMS' },
    { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', carType: 'MC', subsystem: 'COMMS' },
    { drawingNo: '942-58149', title: 'DVAS/PA - Digital Voice Announcement System', carType: 'MC', subsystem: 'COMMS' },
    { drawingNo: '942-58305', title: 'CAB PIN DRAWINGS', carType: 'CAB', subsystem: 'CAB' },
    { drawingNo: '942-58306', title: 'DMC CEILING', carType: 'DMC', subsystem: 'INTERIOR' },
    { drawingNo: '942-58307', title: 'MC CEILING', carType: 'MC', subsystem: 'INTERIOR' },
    { drawingNo: '942-58308', title: 'TC CEILING', carType: 'TC', subsystem: 'INTERIOR' },
    { drawingNo: '942-38342', title: 'TCMS RIO CN11 Connection', carType: 'MC', subsystem: 'TCMS' },
    { drawingNo: '942-38343', title: 'TCMS RIO CN12 Connection', carType: 'MC', subsystem: 'TCMS' },
    { drawingNo: '942-38345', title: 'TCMS RIO CN15 Connection', carType: 'MC', subsystem: 'TCMS' },
    { drawingNo: '942-38347', title: 'TCMS RIO CN17 Connection', carType: 'MC', subsystem: 'TCMS' },
    { drawingNo: '942-38432', title: 'CCTV Ethernet Switch', carType: 'MC', subsystem: 'COMMS' },
    { drawingNo: '942-38433', title: 'CCTV Camera', carType: 'MC', subsystem: 'COMMS' },
    { drawingNo: '942-38532', title: 'AAU System', carType: 'MC', subsystem: 'COMMS' },
    { drawingNo: '942-38533', title: 'PEAU System', carType: 'MC', subsystem: 'COMMS' },
    { drawingNo: '942-38632', title: 'TFT Display', carType: 'MC', subsystem: 'DISPLAY' },
    { drawingNo: '942-38633', title: 'PIS System', carType: 'MC', subsystem: 'COMMS' },
  ];

  for (const d of drawings) {
    const existing = await prisma.drawingDocument.findFirst({ where: { drawingNo: d.drawingNo } });
    if (existing) {
      await prisma.drawingDocument.update({
        where: { id: existing.id },
        data: d,
      });
    } else {
      await prisma.drawingDocument.create({ data: d });
    }
  }
}

async function seedSampleConnectors() {
  console.log('Seeding sample connectors and pins...');
  
  const devices = await prisma.deviceInstance.findMany({ take: 10 });
  const deviceMap = new Map(devices.map(d => [d.tag, d]));

  const connectorsToCreate = [
    { code: 'CN1', type: 'MULTI_MODULE', pins: 40, deviceCode: 'TCMS-RIO-1' },
    { code: 'CN2', type: 'MULTI_MODULE', pins: 40, deviceCode: 'TCMS-RIO-1' },
    { code: 'CN11', type: 'REMOTE_IO', pins: 40, deviceCode: 'TCMS-RIO-1' },
    { code: 'CN12', type: 'REMOTE_IO', pins: 40, deviceCode: 'TCMS-RIO-1' },
    { code: 'CN15', type: 'REMOTE_IO', pins: 26, deviceCode: 'TCMS-RIO-1' },
    { code: 'CN17', type: 'REMOTE_IO', pins: 26, deviceCode: 'TCMS-RIO-1' },
    { code: 'X1', type: 'CONTROL_CONNECTOR', pins: 50, deviceCode: 'VVVF-1' },
    { code: 'CN1', type: 'POWER_CONNECTOR', pins: 3, deviceCode: 'VVVF-1' },
    { code: 'X1', type: 'MULTI_MODULE', pins: 74, deviceCode: 'LTEB-1' },
    { code: 'X2', type: 'MULTI_MODULE', pins: 74, deviceCode: 'LTEB-1' },
  ];

  for (const c of connectorsToCreate) {
    const device = deviceMap.get(c.deviceCode);
    if (!device) continue;

    const connector = await prisma.connector.upsert({
      where: { deviceId_connectorCode: { deviceId: device.id, connectorCode: c.code } },
      update: { connectorType: c.type },
      create: {
        deviceId: device.id,
        connectorCode: c.code,
        connectorType: c.type,
        gender: 'FEMALE',
        normCode: c.code.toUpperCase(),
      },
    });

    for (let i = 1; i <= c.pins; i++) {
      await prisma.connectorPin.upsert({
        where: { connectorId_pinNo: { connectorId: connector.id, pinNo: String(i) } },
        update: {},
        create: {
          connectorId: connector.id,
          pinNo: String(i),
          normPinNo: String(i),
        },
      });
    }
  }
}

async function main() {
  console.log('Starting database seed...');

  try {
    await seedSystems();
    await seedDeviceTypes();
    await seedEquipment();
    await seedWires();
    await seedDrawings();
    await seedSampleConnectors();

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();