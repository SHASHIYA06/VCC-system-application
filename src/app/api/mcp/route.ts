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
];

const TRAINLINE_TRACES: Record<number, any> = {
  3003: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-17', car: 'MC' }, destination: { type: 'equipment', code: 'VVVF', name: 'VVVF Inverter 1', pin: 'CN1-12', car: 'DMC' }, wires: ['3003', '3004'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '17' }] },
  3005: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-19', car: 'MC' }, destination: { type: 'equipment', code: 'VVVF', name: 'VVVF Inverter 1', pin: 'CN1-14', car: 'DMC' }, wires: ['3005', '3006'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '19/20', description: 'Crossed at X1 pins 19/20 - propulsion interlock' }] },
  3006: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-20', car: 'MC' }, destination: { type: 'equipment', code: 'VVVF', name: 'VVVF Inverter 1', pin: 'CN1-15', car: 'DMC' }, wires: ['3006', '3005'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '20/19', description: 'Crossed at X1 pins 20/19 - propulsion interlock' }] },
  4024: { source: { type: 'equipment', code: 'AAU-1', name: 'AAU', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'PEAU-R1', name: 'PEAU R1', pin: 'CN1-1', car: 'MC' }, wires: ['4024'], junctions: [] },
  4062: { source: { type: 'equipment', code: 'PEAU-R1', name: 'PEAU R1', pin: 'CN1-2', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN12-5', car: 'MC' }, wires: ['4062'], junctions: [] },
  4103: { source: { type: 'equipment', code: 'TFT-R1', name: 'TFT Display R1', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'ETH-SW-1', name: 'Ethernet Switch', pin: 'M12-1', car: 'MC' }, wires: ['4103'], junctions: [{ type: 'cable', code: 'CAT5e', name: 'CAT5e Shielded', pin: 'TX+' }] },
  4122: { source: { type: 'equipment', code: 'COMM-NODE-1', name: 'TCMS Communication Node 1', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'COMM-NODE-2', name: 'TCMS Communication Node 2', pin: 'CN1-1', car: 'MC' }, wires: ['4122'], junctions: [] },
  6009: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-3', car: 'MC' }, destination: { type: 'equipment', code: 'DCU-1', name: 'Door Control Unit', pin: 'CN1-3', car: 'MC' }, wires: ['6009', '6046'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 43-44 (CROSSED)', pin: '43/44', description: 'Door open circuit crossed at jumpers 43-44' }] },
  6014: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-5', car: 'MC' }, destination: { type: 'equipment', code: 'DCU-1', name: 'Door Control Unit', pin: 'CN1-5', car: 'MC' }, wires: ['6014', '6051'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 46-47 (CROSSED)', pin: '46/47', description: 'Door close circuit crossed at jumpers 46-47' }] },
  6046: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-4', car: 'MC' }, destination: { type: 'equipment', code: 'DCU-1', name: 'Door Control Unit', pin: 'CN1-4', car: 'MC' }, wires: ['6046', '6009'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 43-44 (CROSSED)', pin: '43/44' }] },
  6051: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-6', car: 'MC' }, destination: { type: 'equipment', code: 'DCU-1', name: 'Door Control Unit', pin: 'CN1-6', car: 'MC' }, wires: ['6051', '6014'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 46-47 (CROSSED)', pin: '46/47' }] },
  6112: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN15-3', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-TB', name: 'TCMS TB', pin: 'TB-3', car: 'MC' }, wires: ['6112'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '48' }] },
  7001: { source: { type: 'equipment', code: 'BECU-1', name: 'BECU', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'EDB-1', name: 'EDB', pin: 'CN1-1', car: 'MC' }, wires: ['7001'], junctions: [] },
  7050: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN15-4', car: 'MC' }, destination: { type: 'equipment', code: 'VAC-1', name: 'VAC Unit', pin: 'CN1-3', car: 'MC' }, wires: ['7050', '7060'], junctions: [{ type: 'trainline', code: 'X1', name: 'VAC Status Loop', pin: '55' }] },
  7060: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN15-5', car: 'MC' }, destination: { type: 'equipment', code: 'VAC-1', name: 'VAC Unit', pin: 'CN1-4', car: 'MC' }, wires: ['7060', '7050'], junctions: [{ type: 'trainline', code: 'X1', name: 'VAC Status Loop', pin: '56' }] },
};

async function executeTool(toolName: string, params: Record<string, unknown>) {
  try {
    switch (toolName) {
      case 'get_systems': {
        const systems = await prisma.system.findMany({ orderBy: { name: 'asc' } });
        return { systems: systems.map(s => ({ id: s.id, code: s.code || s.name, name: s.name, category: s.description || 'ELECTRICAL', description: s.description || '' })) };
      }
      case 'get_drawings': {
        const docs = await prisma.drawingDocument.findMany({ orderBy: { drawingNo: 'asc' } });
        return { drawings: docs.map(d => ({ id: d.id, drawing_no: d.drawingNo, title: d.title, subsystem: d.subsystem, car_type: d.carType, revision: d.revision })) };
      }
      case 'get_equipment': {
        const devices = await prisma.deviceInstance.findMany({ include: { system: true, type: true }, orderBy: { name: 'asc' } });
        return { equipment: devices.map(d => ({ id: d.id, code: d.tag || d.name, name: d.name, system_code: d.system?.code || '', car_type: d.carType || '' })) };
      }
      case 'get_connectors': {
        const connectors = await prisma.connector.findMany({ include: { device: true, pins: true }, orderBy: { connectorCode: 'asc' } });
        return { connectors: connectors.map(c => ({ id: c.id, connector_code: c.connectorCode, connector_type: c.connectorType || '', device: c.device?.name || '', pin_count: c.pins.length })) };
      }
      case 'get_wires': {
        const wires = await prisma.wire.findMany({ take: 100, orderBy: { wireNo: 'asc' } });
        return { wires: wires.map(w => ({ id: w.id, wire_no: w.wireNo, wire_type: w.wireType || '', wire_color: w.wireColor || '', voltage_class: w.voltageClass || '' })) };
      }
      case 'get_trainlines': {
        const pins = await prisma.connectorPin.findMany({ where: { wireNo: { not: null } }, include: { connector: { include: { device: { include: { system: true } } } } }, take: 100 });
        return { trainlines: pins.map(p => ({ trainline_no: p.wireNo, name: p.endpointLabel || p.signalName || `PIN-${p.pinNo}`, voltage_domain: '24V', description: `${p.connector?.connectorCode || ''} pin ${p.pinNo}`, car_code: p.connector?.device?.carType || 'MC', system_code: p.connector?.device?.system?.code || 'TCMS' })) };
      }
      case 'get_tcms_points': {
        const connectors = await prisma.connector.findMany({ include: { device: true, pins: { orderBy: { normPinNo: 'asc' } } }, orderBy: { connectorCode: 'asc' }, take: 20 });
        const points = connectors.flatMap(c => c.pins.map(p => ({ id: p.id, point_code: p.normPinNo || p.pinNo, signal_name: p.signalName || p.endpointLabel || '', signal_type: p.endpointDir || 'DIGITAL', connector_code: c.connectorCode, wire_no: p.wireNo, device_name: c.device?.name || '' })));
        return { points };
      }
      case 'get_car_types': {
        return { car_types: [{ code: 'DMC', name: 'Driving Motor Car' }, { code: 'TC', name: 'Trailer Car' }, { code: 'MC', name: 'Motor Car' }], fleet_formation: ['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'] };
      }
      case 'search_wiring': {
        const q = String(params.query || '');
        const limit = Number(params.limit || 20);
        const [wires, connectors, devices, docs] = await Promise.all([
          prisma.wire.findMany({ where: { wireNo: { contains: q, mode: Prisma.QueryMode.insensitive } }, take: limit }),
          prisma.connector.findMany({ where: { OR: [{ connectorCode: { contains: q, mode: Prisma.QueryMode.insensitive } }, { normCode: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
          prisma.deviceInstance.findMany({ where: { OR: [{ name: { contains: q, mode: Prisma.QueryMode.insensitive } }, { tag: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
          prisma.drawingDocument.findMany({ where: { OR: [{ drawingNo: { contains: q, mode: Prisma.QueryMode.insensitive } }, { title: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
        ]);
        return { wires, connectors, devices, drawings: docs };
      }
      case 'get_wire_details': {
        const wire = await prisma.wire.findUnique({ where: { wireNo: String(params.wire_no) }, include: { endpoints: { include: { connector: true, device: true } } } });
        return { wire };
      }
      case 'get_trainline_trace': {
        const num = Number(params.trainline_no);
        const trace = TRAINLINE_TRACES[num] || { source: { type: 'unknown', name: 'See database', pin: 'N/A' }, destination: { type: 'unknown', name: 'See database', pin: 'N/A' }, wires: [String(num)], junctions: [] };
        return { trainline_no: num, trace, is_cross_connected: [3005, 3006, 6009, 6046, 6014, 6051].includes(num) };
      }
      case 'get_dashboard_stats': {
        const [systemCount, wireCount, drawingCount, deviceCount, connectorCount, pinCount] = await Promise.all([
          prisma.system.count(), prisma.wire.count(), prisma.drawingDocument.count(),
          prisma.deviceInstance.count(), prisma.connector.count(), prisma.connectorPin.count(),
        ]);
        return { stats: { systems: systemCount, wires: wireCount, drawings: drawingCount, equipment: deviceCount, connectors: connectorCount, pins: pinCount } };
      }
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch {
    return { error: 'Database unavailable', tool: toolName };
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
  return NextResponse.json({ tools: TOOLS, version: '1.0', description: 'KMRCL VCC Wiring Explorer MCP Server' });
}