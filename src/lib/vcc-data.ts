import { prisma } from '@/lib/prisma';

export const SYSTEM_SUBSYSTEM_MAP: Record<string, string[]> = {
  GEN: ['DRAWINGS', 'CLASSIFICATION', 'SYMBOLS', 'WIRING_NUMBERS'],
  TRL: ['CONTROL', 'SIGNAL', 'HIGH_TENSION'],
  TRAC: ['VVVF', 'TRACTION_MOTOR', 'RETURN_CURRENT', 'SPEED_CONTROL'],
  HV: ['HSCB', 'COLLECTOR_SHOES', 'PANTOGRAPH', 'EARTH'],
  BRAKE: ['NORMAL_BRAKE', 'EMERGENCY_BRAKE', 'PARKING_BRAKE', 'COMPRESSOR'],
  APS: ['SIV', 'BATTERY', 'SHORE_SUPPLY', 'DC_DISTRIBUTION'],
  DOOR: ['DOOR_CONTROL', 'DOOR_SUPPLY', 'DOOR_PROVING', 'DOOR_SAFETY'],
  VAC: ['SALOON_VAC', 'CAB_VAC', 'SMOKE_DETECTION', 'DAMPER'],
  TMS: ['TCMS_RIO', 'COMMUNICATION', 'MONITORING'],
  COMMS: ['PIS', 'PA', 'CCTV', 'RADIO', 'CBTC'],
};

export const TRAINLINE_SYSTEM_MAP: Record<string, string> = {
  '3003': 'TRAC', '3004': 'TRAC', '3005': 'TRAC', '3006': 'TRAC', '3010': 'TRAC', '3011': 'TRAC',
  '4024': 'BRAKE', '4028': 'BRAKE', '4062': 'BRAKE', '4070': 'BRAKE', '4103': 'BRAKE', '4122': 'BRAKE', '4153': 'BRAKE',
  '6009': 'DOOR', '6014': 'DOOR', '6046': 'DOOR', '6051': 'DOOR', '6073': 'DOOR', '6076': 'DOOR', '6112': 'DOOR',
  '7001': 'VAC', '7050': 'VAC', '7060': 'VAC', '7070': 'VAC',
  '5000': 'APS', '5030': 'APS', '5031': 'APS', '5064': 'APS',
  '1207': 'TRAC', '1209': 'HV', '1215': 'APS',
  '1032': 'TRL', '1040': 'TRL', '1050': 'TRL',
};

export async function getSystemHierarchy() {
  const systems = await prisma.system.findMany({
    orderBy: { name: 'asc' },
    include: { drawings: true },
  });

  return systems.map(system => ({
    code: system.code,
    name: system.name,
    description: system.description || '',
    subsystems: (SYSTEM_SUBSYSTEM_MAP[system.code] || []).map(subCode => ({
      code: subCode,
      name: subCode.replace(/_/g, ' '),
      equipment: [],
    })),
    drawingCount: system.drawings.length,
  }));
}

export async function getCarWithSystems(carType: string) {
  const devices = await prisma.device.findMany({
    where: { carType },
    include: { system: true },
    orderBy: { deviceName: 'asc' },
  });

  return { carType, devices, systemCount: new Set(devices.map(d => d.systemId)).size };
}

export async function getEquipmentDetail(equipmentCode: string) {
  const device = await prisma.device.findFirst({
    where: { 
      OR: [
        { tagNo: equipmentCode },
        { deviceName: { contains: equipmentCode } },
      ],
    },
    include: { system: true },
  });

  return device;
}

export async function getPinDetail(pinId: string) {
  const pin = await prisma.connectorPin.findFirst({
    where: { id: pinId },
    include: { connector: true },
  });

  return pin;
}

export function getSystemForTrainline(trainlineNo: string): string {
  return TRAINLINE_SYSTEM_MAP[trainlineNo] || 'GEN';
}

export default {
  getSystemHierarchy,
  getCarWithSystems,
  getEquipmentDetail,
  getPinDetail,
  getSystemForTrainline,
  SYSTEM_SUBSYSTEM_MAP,
  TRAINLINE_SYSTEM_MAP,
};