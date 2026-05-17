import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { searchWeb, fetchWebPage, TinyFishClient } from '@/lib/tinyfish';

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || 'sk-tinyfish-JAI-1Lk0ZP-FkvhUYsWUaZD4AhpAxlbG';
const tinyfishClient = new TinyFishClient(TINYFISH_API_KEY);

const TOOLS = [
  { name: 'get_systems', description: 'Get all electrical/electronic systems in the VCC. Returns system code, name, category, and description.', inputSchema: { type: 'object', properties: { category: { type: 'string' } } } },
  { name: 'get_drawings', description: 'Get all drawings with their details including drawing number, title, revision, and associated system.', inputSchema: { type: 'object', properties: { system_code: { type: 'string' }, car_type: { type: 'string' } } } },
  { name: 'get_drawing_details', description: 'Get detailed information about a specific drawing including pages, sheets, and connectors.', inputSchema: { type: 'object', properties: { drawing_no: { type: 'string' } } } },
  { name: 'get_equipment', description: 'Get equipment/modules used in the project by system or car type.', inputSchema: { type: 'object', properties: { system_code: { type: 'string' }, car_type: { type: 'string' } } } },
  { name: 'get_equipment_details', description: 'Get detailed information about specific equipment including connectors and pins.', inputSchema: { type: 'object', properties: { equipment_code: { type: 'string' } } } },
  { name: 'get_connectors', description: 'Get connectors from equipment. Returns connector code, type, and associated equipment.', inputSchema: { type: 'object', properties: { equipment_code: { type: 'string' } } } },
  { name: 'get_connector_pins', description: 'Get detailed pin information for a connector including wire connections and signals.', inputSchema: { type: 'object', properties: { connector_code: { type: 'string' } } } },
  { name: 'get_wires', description: 'Get wires with specifications. Returns wire number, type, size, color, and voltage class.', inputSchema: { type: 'object', properties: { voltage_class: { type: 'string' }, search: { type: 'string' } } } },
  { name: 'get_wire_details', description: 'Get detailed information about a specific wire by wire number.', inputSchema: { type: 'object', properties: { wire_no: { type: 'string' } } } },
  { name: 'get_wire_trace', description: 'Trace a wire through all connectors and devices to show complete path.', inputSchema: { type: 'object', properties: { wire_no: { type: 'string' } } } },
  { name: 'get_trainlines', description: 'Get trainline numbers and descriptions. Trainlines are priority signals for train control.', inputSchema: { type: 'object', properties: { voltage_domain: { type: 'string' }, is_cross_connected: { type: 'boolean' } } } },
  { name: 'get_trainline_details', description: 'Get detailed information about a specific trainline including connector and pin details.', inputSchema: { type: 'object', properties: { trainline_no: { type: 'string' } } } },
  { name: 'get_trainline_trace', description: 'Get trainline details with cross-connection information and related signals.', inputSchema: { type: 'object', properties: { trainline_no: { type: 'number' } } } },
  { name: 'get_tcms_points', description: 'Get TCMS remote I/O points. Returns point code, signal type, connector, and signal name.', inputSchema: { type: 'object', properties: { signal_type: { type: 'string' }, rio_unit: { type: 'string' } } } },
  { name: 'get_car_types', description: 'Get all car types in the formation (DMC, TC, MC, etc.) with their positions.', inputSchema: { type: 'object', properties: {} } },
  { name: 'search_wiring', description: 'Search across all wiring data by keyword. Searches trainlines, wires, equipment, and drawings.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } } } },
  { name: 'get_dashboard_stats', description: 'Get dashboard statistics including counts of systems, trainlines, drawings, equipment, and wires.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_pin_details', description: 'Get detailed pin information including wire connections, signal names, and endpoints.', inputSchema: { type: 'object', properties: { connector_code: { type: 'string' }, pin_no: { type: 'string' } } } },
  { name: 'get_subsystems', description: 'Get all subsystems by car type (TCMS, CCTV, DOOR, AAU, DISPLAY, etc.)', inputSchema: { type: 'object', properties: { car_type: { type: 'string' } } } },
  { name: 'get_signals', description: 'Get signals and protocols including RS422, RS485, CAN, Ethernet.', inputSchema: { type: 'object', properties: { protocol: { type: 'string' } } } },
  { name: 'get_cross_connections', description: 'Get cross-connection details for connectors.', inputSchema: { type: 'object', properties: { connector_code: { type: 'string' } } } },
  { name: 'tinyfish_search', description: 'Search the web using TinyFish AI for external information. Use for current events, technical references, or information not in the local database.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, location: { type: 'string' }, language: { type: 'string' }, num_results: { type: 'number' } } } },
  { name: 'tinyfish_fetch', description: 'Fetch and extract content from a specific web URL using TinyFish.', inputSchema: { type: 'object', properties: { url: { type: 'string' } } } },
  { name: 'search_circuits', description: 'Search for circuits by wire number, signal name, or description. Returns circuit details with related drawings and connections.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, wire_no: { type: 'string' } } } },
  { name: 'get_circuit_details', description: 'Get detailed circuit information including wire path, connected equipment, and related drawings.', inputSchema: { type: 'object', properties: { circuit_id: { type: 'string' }, wire_no: { type: 'string' } } } },
];

const TRAINLINE_TRACES: Record<number, any> = {
  3003: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-17', car: 'MC' }, destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-12', car: 'DMC' }, wires: ['3003', '3004'], junctions: [] },
  3005: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-19', car: 'MC' }, destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-14', car: 'DMC' }, wires: ['3005', '3006'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '19/20', description: 'Crossed at X1 pins 19/20 - propulsion interlock' }] },
  3006: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-20', car: 'MC' }, destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-15', car: 'DMC' }, wires: ['3006', '3005'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '20/19', description: 'Crossed at X1 pins 20/19 - propulsion interlock' }] },
  4024: { source: { type: 'equipment', code: 'BCU1', name: 'Brake Control Unit 1', pin: 'X1-24', car: 'DMC' }, destination: { type: 'equipment', code: 'BCU2', name: 'Brake Control Unit 2', pin: 'X1-24', car: 'TC' }, wires: ['4024'], junctions: [] },
  6009: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J7', car: 'MC' }, destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-3', car: 'MC' }, wires: ['6009', '6046'], junctions: [] },
  6014: { source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J14', car: 'MC' }, destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-7', car: 'MC' }, wires: ['6014', '6051'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '46/47', description: 'Crossed at X1 pins 46/47 - door interlock' }] },
  6046: { source: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-4', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J8', car: 'MC' }, wires: ['6046', '6009'], junctions: [] },
  6051: { source: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-8', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J15', car: 'MC' }, wires: ['6051', '6014'], junctions: [] },
};

async function executeTool(toolName: string, params: Record<string, unknown>) {
  try {
    switch (toolName) {
      case 'get_systems': {
        const where: any = {};
        if (params.category) where.category = String(params.category);
        const systems = await prisma.system.findMany({ where, orderBy: { sortOrder: 'asc' } });
        return { systems: systems.map(s => ({ id: s.id, code: s.code, name: s.name, category: s.category || 'ELECTRICAL', description: s.description || '' })) };
      }
      case 'get_drawings': {
        const where: any = {};
        if (params.system_code) where.system = { code: String(params.system_code) };
        if (params.car_type) where.remarks = { contains: String(params.car_type) };
        const docs = await prisma.drawing.findMany({ where, include: { system: true }, orderBy: { drawingNo: 'asc' } });
        return { drawings: docs.map(d => ({ id: d.id, drawing_no: d.drawingNo, title: d.title, car_type: d.remarks?.split('|')[0] || '', revision: d.revision, total_sheets: d.totalSheets, system: d.system?.code })) };
      }
      case 'get_drawing_details': {
        const drawingNo = String(params.drawing_no);
        const drawing = await prisma.drawing.findFirst({
          where: { drawingNo: { contains: drawingNo, mode: Prisma.QueryMode.insensitive } },
          include: { system: true, pages: true, sheets: true, connectors: { include: { pins: true } } }
        });
        if (!drawing) return { error: 'Drawing not found' };
        return { drawing: { ...drawing, connector_count: drawing.connectors.length, pin_count: drawing.connectors.reduce((acc, c) => acc + (c.pins?.length || 0), 0) } };
      }
      case 'get_equipment': {
        const where: any = {};
        if (params.system_code) where.system = { code: String(params.system_code) };
        if (params.car_type) where.carType = String(params.car_type);
        const devices = await prisma.device.findMany({ where, include: { system: true }, orderBy: { deviceName: 'asc' }, take: 100 });
        return { equipment: devices.map(d => ({ id: d.id, code: d.tagNo || d.deviceName, name: d.deviceName, system_code: d.system?.code || '', car_type: d.carType || '', location: d.locationTag })) };
      }
      case 'get_equipment_details': {
        const equipmentCode = String(params.equipment_code || '');
        const device = await prisma.device.findFirst({
          where: { OR: [{ deviceName: { contains: equipmentCode, mode: Prisma.QueryMode.insensitive } }, { tagNo: { contains: equipmentCode, mode: Prisma.QueryMode.insensitive } }] },
          include: { system: true, drawing: true }
        });
        if (!device) return { error: 'Equipment not found' };
        return { equipment: device };
      }
      case 'get_connectors': {
        const where: any = {};
        if (params.equipment_code) where.connectorCode = { contains: String(params.equipment_code), mode: Prisma.QueryMode.insensitive };
        const connectors = await prisma.connector.findMany({ where, include: { pins: true }, orderBy: { connectorCode: 'asc' }, take: 50 });
        return { connectors: connectors.map(c => ({ id: c.id, connector_code: c.connectorCode, description: c.description || '', pin_count: c.pins?.length || c.pinCount || 0, car_type: c.carType })) };
      }
      case 'get_connector_pins': {
        const connectorCode = String(params.connector_code || '');
        const connector = await prisma.connector.findFirst({
          where: { connectorCode: { contains: connectorCode, mode: Prisma.QueryMode.insensitive } },
          include: { pins: true, drawing: true }
        });
        if (!connector) return { error: 'Connector not found' };
        return { connector, pins: connector.pins };
      }
      case 'get_wires': {
        const where: any = {};
        if (params.voltage_class) where.voltageClass = String(params.voltage_class);
        if (params.search) where.wireNo = { contains: String(params.search), mode: Prisma.QueryMode.insensitive };
        const wires = await prisma.wire.findMany({ where, take: 100, orderBy: { wireNo: 'asc' } });
        return { wires: wires.map(w => ({ id: w.id, wire_no: w.wireNo, wire_color: w.wireColor || '', voltage_class: w.voltageClass || '', cable_spec: w.cableSpec, signal_name: w.signalName })) };
      }
      case 'get_wire_details': {
        const wire = await prisma.wire.findUnique({ where: { wireNo: String(params.wire_no) } });
        if (!wire) return { error: 'Wire not found' };
        return { wire };
      }
      case 'get_wire_trace': {
        const wireNo = String(params.wire_no);
        const pins = await prisma.connectorPin.findMany({
          where: { wireNo },
          include: { connector: true }
        });
        return { wire_no: wireNo, connections: pins.map(p => ({ connector: p.connector?.connectorCode, pin: p.pinNo, signal: p.signalName })), total_connections: pins.length };
      }
      case 'get_trainlines': {
        const trainlines = await prisma.trainLine.findMany({ include: { drawing: true }, take: 100, orderBy: { wireNo: 'asc' } });
        return { trainlines: trainlines.map(t => ({ trainline_no: t.wireNo, name: t.itemName, description: t.note || '', car_type: t.carType, line_group: t.lineGroup })) };
      }
      case 'get_trainline_details': {
        const trainlineNo = String(params.trainline_no || '');
        const trainlines = await prisma.trainLine.findMany({
          where: { wireNo: { contains: trainlineNo, mode: Prisma.QueryMode.insensitive } },
          include: { drawing: true }
        });
        return { trainlines };
      }
      case 'get_trainline_trace': {
        const num = Number(params.trainline_no);
        const trace = TRAINLINE_TRACES[num] || { source: { type: 'unknown', name: 'See database', pin: 'N/A' }, destination: { type: 'unknown', name: 'See database', pin: 'N/A' }, wires: [String(num)], junctions: [] };
        return { trainline_no: num, trace, is_cross_connected: [3005, 3006, 6009, 6046, 6014, 6051].includes(num) };
      }
      case 'get_tcms_points': {
        const where: any = { wireNo: { not: null } };
        if (params.signal_type) where.signalName = { contains: String(params.signal_type), mode: Prisma.QueryMode.insensitive };
        const pins = await prisma.connectorPin.findMany({
          where,
          include: { connector: true },
          take: 100
        });
        return { points: pins.map(p => ({ id: p.id, signal_name: p.signalName || '', connector_code: p.connector?.connectorCode || '', wire_no: p.wireNo, pin_no: p.pinNo })) };
      }
      case 'get_car_types': {
        return { car_types: [{ code: 'DMC', name: 'Driving Motor Car', position: 1 }, { code: 'TC', name: 'Trailer Car', position: 2 }, { code: 'MC', name: 'Motor Car', position: 3 }], fleet_formation: 'DMC-TC-MC-MC-TC-DMC' };
      }
      case 'search_wiring': {
        const q = String(params.query || '');
        const limit = Number(params.limit || 20);
        const [wires, connectors, devices, docs, trainlines] = await Promise.all([
          prisma.wire.findMany({ where: { OR: [{ wireNo: { contains: q, mode: Prisma.QueryMode.insensitive } }, { signalName: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
          prisma.connector.findMany({ where: { connectorCode: { contains: q, mode: Prisma.QueryMode.insensitive } }, take: limit }),
          prisma.device.findMany({ where: { OR: [{ deviceName: { contains: q, mode: Prisma.QueryMode.insensitive } }, { tagNo: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
          prisma.drawing.findMany({ where: { OR: [{ drawingNo: { contains: q, mode: Prisma.QueryMode.insensitive } }, { title: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
          prisma.trainLine.findMany({ where: { OR: [{ wireNo: { contains: q, mode: Prisma.QueryMode.insensitive } }, { itemName: { contains: q, mode: Prisma.QueryMode.insensitive } }] }, take: limit }),
        ]);
        return { wires, connectors, devices, drawings: docs, trainlines, total_results: wires.length + connectors.length + devices.length + docs.length + trainlines.length };
      }
      case 'get_dashboard_stats': {
        const [systemCount, wireCount, drawingCount, deviceCount, connectorCount, pinCount, trainlineCount] = await Promise.all([
          prisma.system.count(),
          prisma.wire.count(),
          prisma.drawing.count(),
          prisma.device.count(),
          prisma.connector.count(),
          prisma.connectorPin.count(),
          prisma.trainLine.count(),
        ]);
        return { stats: { systems: systemCount, wires: wireCount, drawings: drawingCount, equipment: deviceCount, connectors: connectorCount, pins: pinCount, trainlines: trainlineCount } };
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
      case 'get_subsystems': {
        const where: any = {};
        if (params.car_type) where.carType = String(params.car_type);
        const systems = await prisma.system.findMany({ where, orderBy: { name: 'asc' } });
        return { subsystems: systems.map(s => ({ code: s.code, name: s.name, description: s.description || '', category: s.category })) };
      }
      case 'get_signals': {
        const where: any = {};
        if (params.protocol) where.protocol = { contains: String(params.protocol), mode: Prisma.QueryMode.insensitive };
        const signals = await prisma.signal.findMany({ where, take: 50 });
        return { signals };
      }
      case 'get_cross_connections': {
        const connectorCode = String(params.connector_code || '');
        const crossConns = await prisma.crossConnection.findMany({
          where: { connectorCode: { contains: connectorCode, mode: Prisma.QueryMode.insensitive } },
          take: 20
        });
        return { cross_connections: crossConns };
      }
      case 'tinyfish_search': {
        const query = String(params.query || '');
        const location = String(params.location || 'US');
        const language = String(params.language || 'en');
        const numResults = Number(params.num_results || 10);
        try {
          const results = await tinyfishClient.search(query, { location, language, numResults });
          return { web_search: results };
        } catch (e) {
          return { error: 'TinyFish search failed', details: e instanceof Error ? e.message : String(e) };
        }
      }
      case 'tinyfish_fetch': {
        const url = String(params.url || '');
        try {
          const result = await tinyfishClient.fetch(url);
          return { web_fetch: result };
        } catch (e) {
          return { error: 'TinyFish fetch failed', details: e instanceof Error ? e.message : String(e) };
        }
      }
      case 'search_circuits': {
        const query = String(params.query || '');
        const wireNo = String(params.wire_no || '');
        const circuits = await prisma.circuit.findMany({
          where: {
            OR: [
              ...(query ? [
                { circuitName: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { note: { contains: query, mode: Prisma.QueryMode.insensitive } },
              ] : []),
              ...(wireNo ? [{ circuitCode: { contains: wireNo, mode: Prisma.QueryMode.insensitive } }] : []),
            ],
          },
          include: { drawing: true },
          take: 50,
        });
        return { circuits: circuits.map(c => ({
          id: c.id,
          circuit_code: c.circuitCode,
          circuit_name: c.circuitName,
          category: c.category,
          voltage: c.voltageText,
          car_scope: c.carScope,
          note: c.note,
          drawing: c.drawing?.drawingNo
        })) };
      }
      case 'get_circuit_details': {
        const circuitId = String(params.circuit_id || '');
        const wireNo = String(params.wire_no || '');
        const circuit = await prisma.circuit.findFirst({
          where: circuitId ? { id: circuitId } : { circuitCode: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
          include: {
            drawing: { include: { system: true } },
            endpoints: true
          }
        });
        if (!circuit) return { error: 'Circuit not found' };
        return { circuit: { ...circuit, endpoint_count: circuit.endpoints?.length || 0 } };
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

    if (method === 'mcp/execute') {
      const { tool, arguments: args } = params;
      const result = await executeTool(tool, args || {});
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    tools: TOOLS, 
    version: '3.0', 
    description: 'KMRCL VCC Wiring Explorer MCP Server - Enhanced with wire tracing and cross-connections',
    endpoints: {
      POST: '/api/mcp',
      GET: '/api/mcp'
    }
  });
}