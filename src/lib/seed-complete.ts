import { prisma } from '@/lib/prisma';

export async function seedComplete() {
  const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro' } });

  const systems = [
    { code: 'GEN', name: 'General', description: 'General documentation and standards' },
    { code: 'TRL', name: 'Train Line', description: 'Train line control circuits' },
    { code: 'TRAC', name: 'Traction', description: 'Traction system - VVVF control' },
    { code: 'BRAKE', name: 'Brake System', description: 'Brake control circuits' },
    { code: 'DOOR', name: 'Door System', description: 'Door control circuits' },
    { code: 'VAC', name: 'Ventilation AC', description: 'Air conditioning systems' },
    { code: 'TMS', name: 'TCMS', description: 'Train Control Management System' },
    { code: 'COMMS', name: 'Communication', description: 'PIS, PA, CCTV, Radio' },
    { code: 'APS', name: 'Auxiliary Power', description: 'Auxiliary power supply' },
    { code: 'HV', name: 'High Voltage', description: 'High voltage distribution' },
  ];

  for (const sys of systems) {
    await prisma.system.upsert({ where: { code: sys.code }, update: sys, create: sys });
  }

  const drawings = [
    { drawingNo: '942-58099', title: 'Drawing List', subsystem: 'GEN' },
    { drawingNo: '942-58103', title: 'Train Lines Control', subsystem: 'TRL' },
    { drawingNo: '942-58119', title: 'Speed Control', subsystem: 'TRAC' },
    { drawingNo: '942-58124', title: 'Brake Loop', subsystem: 'BRAKE' },
    { drawingNo: '942-58138', title: 'Door Operation', subsystem: 'DOOR' },
  ];

  for (const d of drawings) {
    const sys = await prisma.system.findFirst({ where: { code: d.subsystem } });
    await prisma.drawing.upsert({
      where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo: d.drawingNo, revision: 'A' } },
      update: { title: d.title, systemId: sys?.id },
      create: { projectId: project.id, drawingNo: d.drawingNo, title: d.title, systemId: sys?.id, remarks: `ALL|${d.subsystem}` }
    });
  }

  return { seeded: true, systems: systems.length, drawings: drawings.length };
}