import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const TOOLS = [
  { name: 'get_systems', description: 'Get all electrical/electronic systems in the VCC. Returns system code, name, category, and description.', inputSchema: { type: 'object', properties: { category: { type: 'string' } } } },
  { name: 'get_drawings', description: 'Get all drawings with their details including drawing number, title, revision, and associated system.', inputSchema: { type: 'object', properties: { system_code: { type: 'string' }, car_type: { type: 'string' } } } },
  { name: 'get_equipment', description: 'Get equipment/modules used in the project by system or car type.', inputSchema: { type: 'object', properties: { system_code: { type: 'string' }, car_type: { type: 'string' } } } },
  { name: 'get_connectors', description: 'Get connectors from equipment. Returns connector code, type, and associated equipment.', inputSchema: { type: 'object', properties: { equipment_code: { type: 'string' } } } },
  { name: 'get_wires', description: 'Get wires with specifications. Returns wire number, type, size, color, and voltage class.', inputSchema: { type: 'object', properties: { voltage_class: { type: 'string' }, search: { type: 'string' } } } },
  { name: 'get_trainlines', description: 'Get trainline numbers and descriptions. Trainlines are priority signals for train control.', inputSchema: { type: 'object', properties: { voltage_domain: { type: 'string' }, is_cross_connected: { type: 'boolean' } } } },
  { name: 'get_tcms_points', description: 'Get TCMS remote I/O points. Returns point code, signal type, connector, and signal name.', inputSchema: { type: 'object', properties: { signal_type: { type: 'string' }, rio_unit: { type: 'string' } } } },
  { name: 'get_car_types', description: 'Get all car types in the formation (DMC, TC, MC, etc.) with their positions.', inputSchema: { type: 'object', properties: {} } },
  { name: 'search_wiring', description: 'Search across all wiring data by keyword. Searches trainlines, wires, equipment, and drawings.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } } } },
  { name: 'get_wire_details', description: 'Get detailed information about a specific wire by wire number.', inputSchema: { type: 'object', properties: { wire_no: { type: 'string' } } } },
  { name: 'get_trainline_trace', description: 'Get trainline details with cross-connection information and related signals.', inputSchema: { type: 'object', properties: { trainline_no: { type: 'number' } } } },
  { name: 'get_dashboard_stats', description: 'Get dashboard statistics including counts of systems, trainlines, drawings, equipment, and wires.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_pin_details', description: 'Get detailed pin information including wire connections, signal names, and endpoints.', inputSchema: { type: 'object', properties: { connector_code: { type: 'string' }, pin_no: { type: 'string' } } } },
  { name: 'get_equipment_details', description: 'Get detailed information about specific equipment including connectors and pins.', inputSchema: { type: 'object', properties: { equipment_code: { type: 'string' } } } },
  { name: 'get_subsystems', description: 'Get all subsystems by car type (TCMS, CCTV, DOOR, AAU, DISPLAY, etc.)', inputSchema: { type: 'object', properties: { car_type: { type: 'string' } } } },
];

const TRAINLINE_TRACES: Record<number, any> = {
  3003: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-17', car: 'MC' }, destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-12', car: 'DMC' }, wires: ['3003', '3004'], junctions: [] },
  3005: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-19', car: 'MC' }, destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-14', car: 'DMC' }, wires: ['3005', '3006'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '19/20', description: 'Crossed at X1 pins 19/20 - propulsion interlock' }] },
  3006: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-20', car: 'MC' }, destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-15', car: 'DMC' }, wires: ['3006', '3005'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '20/19', description: 'Crossed at X1 pins 20/19 - propulsion interlock' }] },
  4024: { source: { type: 'equipment', code: 'BCU1', name: 'Brake Control Unit 1', pin: 'X1-24', car: 'DMC' }, destination: { type: 'equipment', code: 'BCU2', name: 'Brake Control Unit 2', pin: 'X1-24', car: 'TC' }, wires: ['4024'], junctions: [] },
  6009: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J7', car: 'MC' }, destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-3', car: 'MC' }, wires: ['6009', '6046'], junctions: [] },
};

async function executeTool(toolName: string, params: Record<string, unknown>) {
  try {
    switch (toolName) {
      case 'get_systems': {
        const systems = await prisma.system.findMany({ orderBy: { name: 'asc' } });
        return { systems: systems.map(s => ({ id: s.id, code: s.code, name: s.name, category: s.category || 'ELECTRICAL', description: s.description || '' })) };
      }
      case 'get_drawings': {
        const where: any = {};
        if (params.system_code) where.systemId = String(params.system_code);
        if (params.car_type) where.remarks = { contains: String(params.car_type) };
        const docs = await prisma.drawing.findMany({ where, orderBy: { drawingNo: 'asc' } });
        return { drawings: docs.map(d => ({ id: d.id, drawing_no: d.drawingNo, title: d.title, car_type: d.remarks?.split('|')[0] || '', revision: d.revision })) };
      }
      case 'get_equipment': {
        const devices = await prisma.device.findMany({ include: { system: true }, orderBy: { deviceName: 'asc' } });
        return { equipment: devices.map(d => ({ id: d.id, code: d.tagNo || d.deviceName, name: d.deviceName, system_code: d.system?.code || '', car_type: d.carType || '' })) };
      }
      case 'get_connectors': {
        const connectors = await prisma.connector.findMany({ include: { pins: true }, orderBy: { connectorCode: 'asc' }, take: 50 });
        return { connectors: connectors.map(c => ({ id: c.id, connector_code: c.connectorCode, description: c.description || '', pin_count: c.pins.length })) };
      }
      case 'get_wires': {
        const where: any = {};
        if (params.voltage_class) where.voltageClass = String(params.voltage_class);
        if (params.search) where.wireNo = { contains: String(params.search), mode: Prisma.QueryMode.insensitive };
        const wires = await prisma.wire.findMany({ where, take: 100, orderBy: { wireNo: 'asc' } });
        return { wires: wires.map(w => ({ id: w.id, wire_no: w.wireNo, wire_color: w.wireColor || '', voltage_class: w.voltageClass || '' })) };
      }
      case 'get_trainlines': {
        const trainlines = await prisma.trainLine.findMany({ take: 100, orderBy: { wireNo: 'asc' } });
        return { trainlines: trainlines.map(t => ({ trainline_no: t.wireNo, name: t.itemName, description: t.note || '' })) };
      }
      case 'get_tcms_points': {
        const pins = await prisma.connectorPin.findMany({
          where: { wireNo: { not: null } },
          include: { connector: true },
          take: 100
        });
        return { points: pins.map(p => ({ id: p.id, signal_name: p.signalName || '', connector_code: p.connector?.connectorCode || '', wire_no: p.wireNo })) };
      }
      case 'get_car_types': {
        return { car_types: [{ code: 'DMC', name: 'Driving Motor Car', position: 1 }, { code: 'TC', name: 'Trailer Car', position: 2 }, { code: 'MC', name: 'Motor Car', position: 3 }], fleet_formation: 'DMC-TC-MC-MC-TC-DMC' };
      }
      case 'search_wiring': {
        const q = String(params.query || '');
        const limit = Number(params.limit || 20);
        const [wires, connectors, devices, docs] = await Promise.all([
          prisma.wire.findMany({ where: { wireNo: { contains: q, mode: Prisma.QueryMode.insensitive } }, take: limit }),
          prisma.connector.findMany({ where: { connectorCode: { contains: q, mode: Prisma.QueryMode.insensitive } }, take: limit }),
          prisma.device.findMany({ where: { OR: [{ deviceName: { contains: q, mode: Prisma.QueryMode.insensitive } }, { tagNo: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
          prisma.drawing.findMany({ where: { OR: [{ drawingNo: { contains: q, mode: Prisma.QueryMode.insensitive } }, { title: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
        ]);
        return { wires, connectors, devices, drawings: docs, total_results: wires.length + connectors.length + devices.length + docs.length };
      }
      case 'get_wire_details': {
        const wire = await prisma.wire.findUnique({ where: { wireNo: String(params.wire_no) } });
        return { wire };
      }
      case 'get_trainline_trace': {
        const num = Number(params.trainline_no);
        const trace = TRAINLINE_TRACES[num] || { source: { type: 'unknown', name: 'See database', pin: 'N/A' }, destination: { type: 'unknown', name: 'See database', pin: 'N/A' }, wires: [String(num)], junctions: [] };
        return { trainline_no: num, trace, is_cross_connected: [3005, 3006, 6009, 6046, 6014, 6051].includes(num) };
      }
      case 'get_dashboard_stats': {
        const [systemCount, wireCount, drawingCount, deviceCount, connectorCount, pinCount] = await Promise.all([
          prisma.system.count(),
          prisma.wire.count(),
          prisma.drawing.count(),
          prisma.device.count(),
          prisma.connector.count(),
          prisma.connectorPin.count(),
        ]);
        return { stats: { systems: systemCount, wires: wireCount, drawings: drawingCount, equipment: deviceCount, connectors: connectorCount, pins: pinCount } };
      }
      case 'get_pin_details': {
        const connectorCode = String(params.connector_code || '');
        const pinNo = String(params.pin_no || '');
        const pins = await prisma.connectorPin.findMany({
          where: { connector: { connectorCode: { contains: connectorCode, mode: Prisma.QueryMode.insensitive } }, ...(pinNo && { pinNo: { contains: pinNo, mode: Prisma.QueryMode.insensitive } }) },
          include: { connector: true },
          take: 10
        });
        return { pins };
      }
      case 'get_equipment_details': {
        const equipmentCode = String(params.equipment_code || '');
        const device = await prisma.device.findFirst({
          where: { OR: [{ deviceName: { contains: equipmentCode, mode: Prisma.QueryMode.insensitive } }, { tagNo: { contains: equipmentCode, mode: Prisma.QueryMode.insensitive } }] },
          include: { system: true }
        });
        return { equipment: device };
      }
      case 'get_subsystems': {
        const systems = await prisma.system.findMany({ orderBy: { name: 'asc' } });
        return { subsystems: systems.map(s => ({ code: s.code, name: s.name, description: s.description || '' })) };
      }
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return { error: 'Database unavailable', tool: toolName, details: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params = {} } = body;

    if (method === 'tools/list') {
      return NextResponse.json({ tools: TOOLS });
    }

    if (method === 'tools/call') {
      const toolName = params.name || params.tool;
      if (!toolName) return NextResponse.json({ error: 'Tool name required' }, { status: 400 });
      const result = await executeTool(toolName, params.arguments || params);
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ tools: TOOLS, version: '2.0', description: 'KMRCL VCC Wiring Explorer MCP Server' });
}