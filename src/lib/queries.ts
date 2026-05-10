import { db } from '@/db';
import * as schema from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { System, Drawing, Equipment, Connector, Pin, Wire } from '@/types';

/** Helper to map System rows */
const mapSystem = (row: typeof schema.systems._): System => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description ?? '',
  status: row.status ?? 'unknown',
  icon: row.icon ?? 'HelpCircle',
});

/** Helper to map Drawing rows */
const mapDrawing = (row: typeof schema.drawings._): Drawing => ({
  id: row.id,
  drawing_no: row.drawing_no,
  title: row.title,
  system_code: row.system_code,
  status: row.status ?? 'unknown',
  current_revision: row.current_revision ?? '',
});

/** Helper to map Equipment rows */
const mapEquipment = (row: typeof schema.equipment._): Equipment => ({
  id: row.id,
  equipment_code: row.equipment_code,
  name: row.name,
  description: row.description ?? '',
  location: row.location ?? '',
  system_code: row.system_code,
  car_type: row.car_type ?? '',
});

/** Helper to map Connector rows */
const mapConnector = (row: typeof schema.connectors._): Connector => ({
  id: row.id,
  connector_code: row.connector_code,
  equipment_code: row.equipment_code,
  type: row.type ?? '',
  description: row.description ?? '',
});

/** Helper to map Pin rows */
const mapPin = (row: typeof schema.pins._): Pin => ({
  id: row.id,
  pin_number: row.pin_number,
  connector_code: row.connector_code,
  equipment_code: row.equipment_code,
  signal_name: row.signal_name ?? '',
  description: row.description ?? '',
  wire_no: row.wire_no,
});

/** Helper to map Wire rows */
const mapWire = (row: typeof schema.wires._): Wire => ({
  id: row.id,
  wire_no: row.wire_no,
  signal_name: row.signal_name ?? '',
  description: row.description ?? '',
  type: row.type ?? '',
  color: row.color ?? '',
  cross_section_mm2: row.cross_section_mm2 ?? null,
});

// ---------- System Queries ----------
export async function getSystems(): Promise<System[]> {
  try {
    const rows = await db.select().from(schema.systems).orderBy(asc(schema.systems.code));
    return rows.map(mapSystem);
  } catch (error) {
    console.error('getSystems error:', error);
    return [];
  }
}

export async function getSystemByCode(code: string): Promise<System | null> {
  try {
    const rows = await db.select().from(schema.systems).where(eq(schema.systems.code, code)).limit(1);
    if (!rows.length) return null;
    return mapSystem(rows[0]);
  } catch (error) {
    console.error('getSystemByCode error:', error);
    return null;
  }
}

// ---------- Drawing Queries ----------
export async function getDrawings(): Promise<Drawing[]> {
  try {
    const rows = await db.select().from(schema.drawings).orderBy(asc(schema.drawings.drawing_no));
    return rows.map(mapDrawing);
  } catch (error) {
    console.error('getDrawings error:', error);
    return [];
  }
}

// ---------- Equipment Queries ----------
export async function getEquipmentByCode(equipmentCode: string): Promise<Equipment | null> {
  try {
    const rows = await db.select().from(schema.equipment).where(eq(schema.equipment.equipment_code, equipmentCode)).limit(1);
    if (!rows.length) return null;
    return mapEquipment(rows[0]);
  } catch (error) {
    console.error('getEquipmentByCode error:', error);
    return null;
  }
}

export async function getAllEquipment(): Promise<Equipment[]> {
  try {
    const rows = await db.select().from(schema.equipment);
    return rows.map(mapEquipment);
  } catch (error) {
    console.error('getAllEquipment error:', error);
    return [];
  }
}

// ---------- Connector Queries ----------
export async function getConnectorsByEquipment(equipmentCode: string): Promise<Connector[]> {
  try {
    const rows = await db.select().from(schema.connectors).where(eq(schema.connectors.equipment_code, equipmentCode));
    return rows.map(mapConnector);
  } catch (error) {
    console.error('getConnectorsByEquipment error:', error);
    return [];
  }
}

export async function getAllConnectors(): Promise<Connector[]> {
  try {
    const rows = await db.select().from(schema.connectors);
    return rows.map(mapConnector);
  } catch (error) {
    console.error('getAllConnectors error:', error);
    return [];
  }
}

// ---------- Pin Queries ----------
export async function getPinsByConnector(connectorCode: string): Promise<Pin[]> {
  try {
    const rows = await db.select().from(schema.pins).where(eq(schema.pins.connector_code, connectorCode));
    return rows.map(mapPin);
  } catch (error) {
    console.error('getPinsByConnector error:', error);
    return [];
  }
}

export async function getAllPins(): Promise<Pin[]> {
  try {
    const rows = await db.select().from(schema.pins);
    return rows.map(mapPin);
  } catch (error) {
    console.error('getAllPins error:', error);
    return [];
  }
}

// ---------- Wire Queries ----------
export async function getWireByNo(wireNo: string): Promise<Wire | null> {
  try {
    const rows = await db.select().from(schema.wires).where(eq(schema.wires.wire_no, wireNo)).limit(1);
    if (!rows.length) return null;
    return mapWire(rows[0]);
  } catch (error) {
    console.error('getWireByNo error:', error);
    return null;
  }
}

export async function getAllWires(): Promise<Wire[]> {
  try {
    const rows = await db.select().from(schema.wires);
    return rows.map(mapWire);
  } catch (error) {
    console.error('getAllWires error:', error);
    return [];
  }
}
