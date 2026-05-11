import { query } from './db';
import { System, Drawing, Equipment, Connector, Wire, Pin, Trainline, TcmsPoint } from '@/types';

const MOCK_SYSTEMS: System[] = [
  { id: '1', code: 'TRL', name: 'Trainlines', description: 'Train Lines Control & Signal', status: 'active', icon: 'Train' },
  { id: '2', code: 'BRAKE', name: 'Brake System', description: 'Brake Loop and BCU', status: 'active', icon: 'ShieldCheck' },
];

export async function getSystems(): Promise<System[]> {
  try {
    const rows = await query<System>('SELECT * FROM systems ORDER BY sort_order');
    return rows;
  } catch {
    return MOCK_SYSTEMS;
  }
}

export async function getSystemByCode(code: string): Promise<System | null> {
  try {
    const rows = await query<System>('SELECT * FROM systems WHERE code = $1', [code]);
    return rows[0] || null;
  } catch {
    return MOCK_SYSTEMS.find(s => s.code === code) || null;
  }
}

export async function getDrawings(): Promise<Drawing[]> {
  try {
    const rows = await query<Drawing>('SELECT * FROM drawings ORDER BY drawing_no');
    return rows;
  } catch {
    return [{ id: '1', drawing_no: '942-58103', title: 'Train Lines Control', system_code: 'TRL', status: 'active', current_revision: 'A' }];
  }
}

export async function getEquipment(): Promise<Equipment[]> {
  try {
    return await query<Equipment>('SELECT * FROM equipment ORDER BY equipment_code');
  } catch {
    return [];
  }
}

export async function getEquipmentByCode(code: string): Promise<Equipment | null> {
  try {
    const rows = await query<Equipment>('SELECT * FROM equipment WHERE equipment_code = $1', [code]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getConnectors(): Promise<Connector[]> {
  try {
    return await query<Connector>('SELECT * FROM connectors ORDER BY connector_code');
  } catch {
    return [];
  }
}

export async function getConnectorById(id: string): Promise<Connector | null> {
  try {
    const rows = await query<Connector>('SELECT * FROM connectors WHERE id = $1', [id]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getWires(): Promise<Wire[]> {
  try {
    return await query<Wire>('SELECT * FROM wires ORDER BY wire_no');
  } catch {
    return [];
  }
}

export async function getWireByNo(wireNo: string): Promise<Wire | null> {
  try {
    const rows = await query<Wire>('SELECT * FROM wires WHERE wire_no = $1', [wireNo]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getPins(): Promise<Pin[]> {
  try {
    return await query<Pin>('SELECT * FROM pins ORDER BY connector_id, sequence_no');
  } catch {
    return [];
  }
}

export async function getPinById(id: string): Promise<Pin | null> {
  try {
    const rows = await query<Pin>('SELECT * FROM pins WHERE id = $1', [id]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getTrainlines(): Promise<Trainline[]> {
  try {
    return await query<Trainline>('SELECT * FROM trainlines ORDER BY trainline_no');
  } catch {
    return [];
  }
}

export async function getTrainlineByNo(trainlineNo: number): Promise<Trainline | null> {
  try {
    const rows = await query<Trainline>('SELECT * FROM trainlines WHERE trainline_no = $1', [trainlineNo]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getTcmsPoints(): Promise<TcmsPoint[]> {
  try {
    return await query<TcmsPoint>('SELECT * FROM tcms_points ORDER BY point_code');
  } catch {
    return [];
  }
}

export async function getTcmsPointByCode(pointCode: string): Promise<TcmsPoint | null> {
  try {
    const rows = await query<TcmsPoint>('SELECT * FROM tcms_points WHERE point_code = $1', [pointCode]);
    return rows[0] || null;
  } catch {
    return null;
  }
}