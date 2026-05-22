import { prisma } from '@/lib/prisma';

export async function seedComprehensive() {
  const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro' } });

  const systems = [
    { code: 'GEN', name: 'General', category: 'Foundation', description: 'General documentation and standards' },
    { code: 'TRL', name: 'Train Line', category: 'Core Systems', description: 'Train line control circuits' },
    { code: 'TRAC', name: 'Traction', category: 'Propulsion', description: 'Traction system and VVVF control' },
    { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Brake control and air supply' },
    { code: 'DOOR', name: 'Door System', category: 'Core Systems', description: 'Passenger door control' },
    { code: 'VAC', name: 'Ventilation AC', category: 'Comfort', description: 'HVAC systems' },
    { code: 'TMS', name: 'TCMS', category: 'Control', description: 'Train Control Management System' },
    { code: 'COMMS', name: 'Communication', category: 'Communication', description: 'PIS, PA, CCTV, Radio' },
    { code: 'APS', name: 'Auxiliary Power Supply', category: 'Power', description: 'Auxiliary power and battery' },
    { code: 'HV', name: 'High Voltage', category: 'Power', description: 'High voltage distribution' },
    { code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Power', description: 'Low tension power distribution' },
    { code: 'LIGHT', name: 'Lighting', category: 'Comfort', description: 'Interior and exterior lighting' },
  ];

  for (const sys of systems) {
    await prisma.system.upsert({ where: { code: sys.code }, update: sys, create: sys });
  }

  const defaultDrawing = await prisma.drawing.findFirst({ where: { projectId: project.id } }) || await prisma.drawing.create({ data: { projectId: project.id, drawingNo: 'MASTER', title: 'Master Drawing' } });

  const equipment = [
    { tagNo: 'TCMS_RIO1', deviceName: 'TCMS Remote IO Unit 1', carType: 'MC', systemCode: 'TMS' },
    { tagNo: 'TCMS_RIO2', deviceName: 'TCMS Remote IO Unit 2', carType: 'TC', systemCode: 'TMS' },
    { tagNo: 'V1', deviceName: 'VVVF Inverter 1', carType: 'DMC', systemCode: 'TRAC' },
    { tagNo: 'V2', deviceName: 'VVVF Inverter 2', carType: 'MC', systemCode: 'TRAC' },
    { tagNo: 'BCU1', deviceName: 'Brake Control Unit 1', carType: 'DMC', systemCode: 'BRAKE' },
    { tagNo: 'DCU1', deviceName: 'Door Control Unit 1', carType: 'MC', systemCode: 'DOOR' },
  ];

  for (const eq of equipment) {
    const sys = await prisma.system.findFirst({ where: { code: eq.systemCode } });
    const existing = await prisma.device.findFirst({ where: { tagNo: eq.tagNo } });
    if (!existing) {
      await prisma.device.create({ data: { tagNo: eq.tagNo, deviceName: eq.deviceName, carType: eq.carType, systemId: sys?.id, drawingId: defaultDrawing.id } });
    }
  }

  return { seeded: true, systems: systems.length, equipment: equipment.length };
}