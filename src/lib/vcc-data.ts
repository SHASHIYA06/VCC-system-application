// Complete VCC Data Service - System hierarchy and relationships

import { prisma } from '@/lib/prisma';

export interface SystemWithSubsystems {
  code: string;
  name: string;
  description: string;
  subsystems: SubsystemWithEquipment[];
}

export interface SubsystemWithEquipment {
  code: string;
  name: string;
  equipment: EquipmentWithComponents[];
}

export interface EquipmentWithComponents {
  code: string;
  name: string;
  carType: string;
  location: string;
  connectors: ConnectorWithPins[];
}

export interface ConnectorWithPins {
  code: string;
  type: string;
  pins: PinWithWire[];
}

export interface PinWithWire {
  pinNo: string;
  signalName?: string;
  wireNo?: string;
  description?: string;
}

// System to Subsystem mapping based on VCC documentation
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
  CAB: ['OPERATING_PANEL', 'INDICATOR_PANEL', 'MCB_PANEL'],
  LTEB: ['110V_DISTRIBUTION', 'CONTROL_POWER'],
  LTJB: ['415V_DISTRIBUTION', 'JUNCTION'],
  EDB: ['CEILING_DISTRIBUTION', 'SALOON_POWER'],
  LIGHT: ['INTERIOR_LIGHT', 'EXTERIOR_LIGHT'],
  COUPL: ['GANGWAY', 'INTERCAR_SIGNAL'],
};

// Equipment to System mapping
export const EQUIPMENT_SYSTEM_MAP: Record<string, string> = {
  V1: 'TRAC',
  V2: 'TRAC',
  BCU1: 'BRAKE',
  BCU2: 'BRAKE',
  BCU3: 'BRAKE',
  BECU1: 'BRAKE',
  TCMS_RIO1: 'TMS',
  TCMS_RIO2: 'TMS',
  APS1: 'APS',
  SSB1: 'APS',
  BATT1: 'APS',
  HSCB1: 'HV',
  HSCB2: 'HV',
  DCU1: 'DOOR',
  DCU2: 'DOOR',
  VAC1: 'VAC',
  VAC2: 'VAC',
  CAB_VAC1: 'VAC',
  OP_PNL1: 'CAB',
  IND_PNL1: 'CAB',
  MCB_PNL1: 'CAB',
  LTEB1: 'LTEB',
  LTEB2: 'LTEB',
  LTEB3: 'LTEB',
  LTJB1: 'LTJB',
  LTJB2: 'LTJB',
  LTJB3: 'LTJB',
  EDB1: 'EDB',
  EDB2: 'EDB',
  ETH_SW1: 'COMMS',
  ETH_SW2: 'COMMS',
  AAU1: 'COMMS',
  AAU2: 'COMMS',
  COMP1: 'BRAKE',
  PBMV1: 'BRAKE',
  CSJB1: 'HV',
  CSJB2: 'HV',
  CSJB3: 'HV',
};

// Trainline to System mapping
export const TRAINLINE_SYSTEM_MAP: Record<string, string> = {
  // Propulsion
  '3003': 'TRAC', '3004': 'TRAC', '3005': 'TRAC', '3006': 'TRAC',
  '3007': 'TRAC', '3008': 'TRAC', '3009': 'TRAC', '3010': 'TRAC',
  '3011': 'TRAC', '3012': 'TRAC', '3013': 'TRAC',
  // Brake
  '4024': 'BRAKE', '4025': 'BRAKE', '4026': 'BRAKE', '4028': 'BRAKE',
  '4062': 'BRAKE', '4070': 'BRAKE', '4103': 'BRAKE', '4104': 'BRAKE',
  '4105': 'BRAKE', '4122': 'BRAKE', '4153': 'BRAKE', '4154': 'BRAKE',
  // Door
  '6001': 'DOOR', '6002': 'DOOR', '6003': 'DOOR', '6009': 'DOOR',
  '6010': 'DOOR', '6014': 'DOOR', '6015': 'DOOR', '6046': 'DOOR',
  '6051': 'DOOR', '6073': 'DOOR', '6074': 'DOOR', '6075': 'DOOR',
  '6076': 'DOOR', '6077': 'DOOR', '6112': 'DOOR',
  // VAC
  '7001': 'VAC', '7002': 'VAC', '7003': 'VAC', '7050': 'VAC',
  '7051': 'VAC', '7052': 'VAC', '7060': 'VAC', '7061': 'VAC',
  '7062': 'VAC', '7070': 'VAC', '7071': 'VAC', '7072': 'VAC',
  '7073': 'VAC',
  // APS
  '5000': 'APS', '5001': 'APS', '5002': 'APS', '5003': 'APS',
  '5004': 'APS', '5030': 'APS', '5031': 'APS', '5032': 'APS',
  '5033': 'APS', '5064': 'APS', '5065': 'APS', '5066': 'APS',
  // HV/Fault
  '1000': 'HV', '1001': 'HV', '1002': 'HV', '1207': 'TRAC',
  '1209': 'HV', '1215': 'APS',
  // Control
  '1032': 'TRL', '1040': 'TRL', '1050': 'TRL', '1515': 'TRL',
};

export async function getSystemHierarchy(): Promise<SystemWithSubsystems[]> {
  const systems = await prisma.system.findMany({
    orderBy: { name: 'asc' },
    include: {
      devices: {
        include: {
          connectors: {
            include: {
              pins: true,
            },
          },
        },
      },
    },
  });

  return systems.map(system => ({
    code: system.code || '',
    name: system.name,
    description: system.description || '',
    subsystems: (SYSTEM_SUBSYSTEM_MAP[system.code || ''] || []).map(subCode => ({
      code: subCode,
      name: subCode.replace(/_/g, ' '),
      equipment: system.devices.map(device => ({
        code: device.tag || '',
        name: device.name,
        carType: device.carType || '',
        location: device.location || '',
        connectors: device.connectors.map(conn => ({
          code: conn.connectorCode,
          type: conn.connectorType || 'IO',
          pins: conn.pins.map(pin => ({
            pinNo: pin.pinNo,
            signalName: pin.signalName || undefined,
            wireNo: pin.wireNo || undefined,
            description: pin.remarks || undefined,
          })),
        })),
      })),
    })),
  }));
}

export async function getCarWithSystems(carType: string) {
  const devices = await prisma.deviceInstance.findMany({
    where: { carType },
    include: {
      system: true,
      connectors: {
        include: {
          pins: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const systemGroups: Record<string, typeof devices> = {};
  
  for (const device of devices) {
    const sysCode = device.system?.code || 'OTHER';
    if (!systemGroups[sysCode]) {
      systemGroups[sysCode] = [];
    }
    systemGroups[sysCode].push(device);
  }

  return {
    carType,
    systems: Object.entries(systemGroups).map(([code, devs]) => ({
      code,
      devices: devs,
    })),
  };
}

export async function getEquipmentDetail(equipmentCode: string) {
  const device = await prisma.deviceInstance.findFirst({
    where: { 
      OR: [
        { tag: equipmentCode },
        { name: { contains: equipmentCode, mode: 'insensitive' } },
      ],
    },
    include: {
      system: true,
      connectors: {
        include: {
          pins: {
            orderBy: { pinNo: 'asc' },
          },
        },
      },
    },
  });

  if (!device) return null;

  // Get related trainlines from pins
  const trainlines = new Set<string>();
  for (const conn of device.connectors) {
    for (const pin of conn.pins) {
      if (pin.wireNo) {
        trainlines.add(pin.wireNo);
      }
    }
  }

  return {
    ...device,
    relatedTrainlines: Array.from(trainlines),
  };
}

export async function getPinDetail(pinId: string) {
  // Find pin by ID or by normPinNo
  const pin = await prisma.connectorPin.findFirst({
    where: {
      OR: [
        { id: pinId },
        { normPinNo: { contains: pinId } },
      ],
    },
    include: {
      connector: {
        include: {
          device: {
            include: { system: true },
          },
        },
      },
    },
  });

  if (!pin) return null;

  return {
    pin,
    device: pin.connector?.device,
    connector: pin.connector,
    system: pin.connector?.device?.system,
  };
}

export function getSystemForTrainline(trainlineNo: string): string {
  return TRAINLINE_SYSTEM_MAP[trainlineNo] || 'GEN';
}

export function getSubsystemForEquipment(equipmentCode: string): string {
  // Map equipment to subsystems based on documentation
  const subsystemMap: Record<string, string> = {
    V1: 'VVVF', V2: 'VVVF',
    BCU1: 'NORMAL_BRAKE', BCU2: 'NORMAL_BRAKE', BCU3: 'NORMAL_BRAKE',
    BECU1: 'NORMAL_BRAKE',
    TCMS_RIO1: 'TCMS_RIO', TCMS_RIO2: 'TCMS_RIO',
    APS1: 'SIV', SSB1: 'SHORE_SUPPLY', BATT1: 'BATTERY',
    HSCB1: 'HSCB', HSCB2: 'HSCB',
    DCU1: 'DOOR_CONTROL', DCU2: 'DOOR_CONTROL',
    VAC1: 'SALOON_VAC', VAC2: 'SALOON_VAC', CAB_VAC1: 'CAB_VAC',
    COMP1: 'COMPRESSOR', PBMV1: 'PARKING_BRAKE',
    LTEB1: '110V_DISTRIBUTION', LTEB2: '110V_DISTRIBUTION', LTEB3: '110V_DISTRIBUTION',
    LTJB1: '415V_DISTRIBUTION', LTJB2: '415V_DISTRIBUTION', LTJB3: '415V_DISTRIBUTION',
    EDB1: 'CEILING_DISTRIBUTION', EDB2: 'CEILING_DISTRIBUTION',
    ETH_SW1: 'COMMUNICATION', ETH_SW2: 'COMMUNICATION',
  };
  return subsystemMap[equipmentCode] || 'GENERAL';
}

export default {
  getSystemHierarchy,
  getCarWithSystems,
  getEquipmentDetail,
  getPinDetail,
  getSystemForTrainline,
  getSubsystemForEquipment,
  SYSTEM_SUBSYSTEM_MAP,
  EQUIPMENT_SYSTEM_MAP,
  TRAINLINE_SYSTEM_MAP,
};