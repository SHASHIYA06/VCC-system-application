import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { agentEngine } from '@/lib/agents/engine';
import { searchDocuments, searchWiring } from '@/lib/rag/service';

const TOOLS = [
  {
    name: 'get_systems',
    description: 'Get all electrical/electronic systems in the VCC. Returns system code, name, category, and description.',
    inputSchema: { type: 'object', properties: { category: { type: 'string' } } }
  },
  {
    name: 'get_drawings',
    description: 'Get all drawings with their details including drawing number, title, revision, and associated system.',
    inputSchema: { type: 'object', properties: { system_code: { type: 'string' }, car_type: { type: 'string' } } }
  },
  {
    name: 'get_equipment',
    description: 'Get equipment/modules used in the project by system or car type.',
    inputSchema: { type: 'object', properties: { system_code: { type: 'string' }, car_type: { type: 'string' } } }
  },
  {
    name: 'get_connectors',
    description: 'Get connectors from equipment. Returns connector code, type, and associated equipment.',
    inputSchema: { type: 'object', properties: { equipment_code: { type: 'string' } } }
  },
  {
    name: 'get_wires',
    description: 'Get wires with specifications. Returns wire number, type, size, color, and voltage class.',
    inputSchema: { type: 'object', properties: { voltage_class: { type: 'string' }, search: { type: 'string' } } }
  },
  {
    name: 'get_trainlines',
    description: 'Get trainline numbers and descriptions. Trainlines are priority signals for train control.',
    inputSchema: { type: 'object', properties: { voltage_domain: { type: 'string' }, is_cross_connected: { type: 'boolean' } } }
  },
  {
    name: 'get_tcms_points',
    description: 'Get TCMS remote I/O points. Returns point code, signal type, connector, and signal name.',
    inputSchema: { type: 'object', properties: { signal_type: { type: 'string' }, rio_unit: { type: 'string' } } }
  },
  {
    name: 'get_car_types',
    description: 'Get all car types in the formation (DMC, TC, MC, etc.) with their positions.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'search_wiring',
    description: 'Search across all wiring data by keyword. Searches trainlines, wires, equipment, and drawings.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } } }
  },
  {
    name: 'get_wire_details',
    description: 'Get detailed information about a specific wire by wire number.',
    inputSchema: { type: 'object', properties: { wire_no: { type: 'string' } } }
  },
  {
    name: 'get_trainline_trace',
    description: 'Get trainline details with cross-connection information and related signals.',
    inputSchema: { type: 'object', properties: { trainline_no: { type: 'number' } } }
  },
  {
    name: 'get_dashboard_stats',
    description: 'Get dashboard statistics including counts of systems, trainlines, drawings, equipment, and wires.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'search_documents_rag',
    description: 'Search technical documents using RAG (Retrieval Augmented Generation) for semantic search.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, top_k: { type: 'number' } } }
  },
  {
    name: 'search_wiring_semantic',
    description: 'Search wiring data with semantic similarity matching.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, car_type: { type: 'string' }, subsystem: { type: 'string' } } }
  },
  {
    name: 'get_all_agents',
    description: 'Get list of available AI agents for multi-agent queries.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'execute_agent_task',
    description: 'Execute a task using the multi-agent system. Specify task type and query.',
    inputSchema: {
      type: 'object',
      properties: {
        task_type: { type: 'string', enum: ['search_wire', 'search_connector', 'search_equipment', 'trace_trainline', 'document_lookup', 'analyze_system', 'answer_technical'] },
        query: { type: 'string' },
        car_type: { type: 'string' },
        subsystem: { type: 'string' },
        wire_number: { type: 'string' },
        connector_code: { type: 'string' },
        equipment_code: { type: 'string' },
        trainline_number: { type: 'number' },
        drawing_number: { type: 'string' }
      }
    }
  },
  {
    name: 'get_pin_details',
    description: 'Get detailed pin information including wire connections, signal names, and endpoints.',
    inputSchema: { type: 'object', properties: { connector_code: { type: 'string' }, pin_no: { type: 'string' } } }
  },
  {
    name: 'get_equipment_details',
    description: 'Get detailed information about specific equipment including connectors and pins.',
    inputSchema: { type: 'object', properties: { equipment_code: { type: 'string' } } }
  },
  {
    name: 'get_subsystems',
    description: 'Get all subsystems by car type (TCMS, CCTV, DOOR, AAU, DISPLAY, etc.)',
    inputSchema: { type: 'object', properties: { car_type: { type: 'string' } } }
  },
];

const TRAINLINE_TRACES: Record<number, any> = {
  3003: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-17', car: 'MC' }, destination: { type: 'equipment', code: 'VVVF', name: 'VVVF Inverter 1', pin: 'CN1-12', car: 'DMC' }, wires: ['3003', '3004'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '17' }] },
  3005: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-19', car: 'MC' }, destination: { type: 'equipment', code: 'VVVF', name: 'VVVF Inverter 1', pin: 'CN1-14', car: 'DMC' }, wires: ['3005', '3006'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '19/20', description: 'Crossed at X1 pins 19/20 - propulsion interlock' }] },
  3006: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-20', car: 'MC' }, destination: { type: 'equipment', code: 'VVVF', name: 'VVVF Inverter 1', pin: 'CN1-15', car: 'DMC' }, wires: ['3006', '3005'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '20/19', description: 'Crossed at X1 pins 20/19 - propulsion interlock' }] },
  4024: { source: { type: 'equipment', code: 'AAU-1', name: 'AAU', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'PEAU-R1', name: 'PEAU R1', pin: 'CN1-1', car: 'MC' }, wires: ['4024'], junctions: [] },
  6009: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-3', car: 'MC' }, destination: { type: 'equipment', code: 'DCU-1', name: 'Door Control Unit', pin: 'CN1-3', car: 'MC' }, wires: ['6009', '6046'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 43-44 (CROSSED)', pin: '43/44', description: 'Door open circuit crossed at jumpers 43-44' }] },
  6014: { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-5', car: 'MC' }, destination: { type: 'equipment', code: 'DCU-1', name: 'Door Control Unit', pin: 'CN1-5', car: 'MC' }, wires: ['6014', '6051'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 46-47 (CROSSED)', pin: '46/47', description: 'Door close circuit crossed at jumpers 46-47' }] },
};

async function executeTool(toolName: string, params: Record<string, unknown>) {
  try {
    switch (toolName) {
      case 'get_systems': {
        const systems = await prisma.system.findMany({ orderBy: { name: 'asc' } });
        return { systems: systems.map(s => ({ id: s.id, code: s.code || s.name, name: s.name, category: s.description || 'ELECTRICAL', description: s.description || '' })) };
      }
      case 'get_drawings': {
        const where: any = {};
        if (params.system_code) where.subsystem = String(params.system_code);
        if (params.car_type) where.carType = String(params.car_type);
        const docs = await prisma.drawingDocument.findMany({
          where,
          orderBy: { drawingNo: 'asc' }
        });
        return { drawings: docs.map(d => ({ id: d.id, drawing_no: d.drawingNo, title: d.title, subsystem: d.subsystem, car_type: d.carType, revision: d.revision })) };
      }
      case 'get_equipment': {
        const devices = await prisma.deviceInstance.findMany({
          include: { system: true, type: true, connectors: true },
          orderBy: { name: 'asc' }
        });
        return { equipment: devices.map(d => ({ id: d.id, code: d.tag || d.name, name: d.name, system_code: d.system?.code || '', car_type: d.carType || '', connector_count: d.connectors.length })) };
      }
      case 'get_connectors': {
        const connectors = await prisma.connector.findMany({
          include: { device: true, pins: true },
          orderBy: { connectorCode: 'asc' }
        });
        return { connectors: connectors.map(c => ({ id: c.id, connector_code: c.connectorCode, connector_type: c.connectorType || '', device: c.device?.name || '', pin_count: c.pins.length })) };
      }
      case 'get_wires': {
        const where: any = {};
        if (params.voltage_class) where.voltageClass = String(params.voltage_class);
        if (params.search) where.wireNo = { contains: String(params.search), mode: Prisma.QueryMode.insensitive };
        const wires = await prisma.wire.findMany({
          where,
          take: 100,
          orderBy: { wireNo: 'asc' }
        });
        return { wires: wires.map(w => ({ id: w.id, wire_no: w.wireNo, wire_type: w.wireType || '', wire_color: w.wireColor || '', voltage_class: w.voltageClass || '' })) };
      }
      case 'get_trainlines': {
        const pins = await prisma.connectorPin.findMany({
          where: { wireNo: { not: null } },
          include: { connector: { include: { device: { include: { system: true } } } } },
          take: 100
        });
        return { trainlines: pins.map(p => ({ trainline_no: p.wireNo, name: p.endpointLabel || p.signalName || `PIN-${p.pinNo}`, voltage_domain: '24V', description: `${p.connector?.connectorCode || ''} pin ${p.pinNo}`, car_code: p.connector?.device?.carType || 'MC', system_code: p.connector?.device?.system?.code || 'TCMS' })) };
      }
      case 'get_tcms_points': {
        const connectors = await prisma.connector.findMany({
          include: { device: true, pins: { orderBy: { normPinNo: 'asc' } } },
          orderBy: { connectorCode: 'asc' },
          take: 20
        });
        const points = connectors.flatMap(c => c.pins.map(p => ({ id: p.id, point_code: p.normPinNo || p.pinNo, signal_name: p.signalName || p.endpointLabel || '', signal_type: p.endpointDir || 'DIGITAL', connector_code: c.connectorCode, wire_no: p.wireNo, device_name: c.device?.name || '' })));
        return { points };
      }
      case 'get_car_types': {
        return {
          car_types: [
            { code: 'DMC', name: 'Driving Motor Car', position: 1, description: 'Driving Motor Car with Cab A' },
            { code: 'TC', name: 'Trailer Car', position: 2, description: 'Trailer Car with pantograph' },
            { code: 'MC', name: 'Motor Car', position: 3, description: 'Motor Car without cab' },
            { code: 'MC', name: 'Motor Car', position: 4, description: 'Motor Car without cab' },
            { code: 'TC', name: 'Trailer Car', position: 5, description: 'Trailer Car with pantograph' },
            { code: 'DMC', name: 'Driving Motor Car', position: 6, description: 'Driving Motor Car with Cab B' },
          ],
          fleet_formation: 'DMC-TC-MC-MC-TC-DMC'
        };
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
        return { wires, connectors, devices, drawings: docs, total_results: wires.length + connectors.length + devices.length + docs.length };
      }
      case 'get_wire_details': {
        const wire = await prisma.wire.findUnique({ where: { wireNo: String(params.wire_no) }, include: { endpoints: { include: { connector: true, device: true, pin: true } } } });
        return { wire };
      }
      case 'get_trainline_trace': {
        const num = Number(params.trainline_no);
        const trace = TRAINLINE_TRACES[num] || { source: { type: 'unknown', name: 'See database', pin: 'N/A' }, destination: { type: 'unknown', name: 'See database', pin: 'N/A' }, wires: [String(num)], junctions: [] };
        return { trainline_no: num, trace, is_cross_connected: [3005, 3006, 6009, 6046, 6014, 6051].includes(num) };
      }
      case 'get_dashboard_stats': {
        const [systemCount, wireCount, drawingCount, deviceCount, connectorCount, pinCount, carCount] = await Promise.all([
          prisma.system.count(),
          prisma.wire.count(),
          prisma.drawingDocument.count(),
          prisma.deviceInstance.count(),
          prisma.connector.count(),
          prisma.connectorPin.count(),
          prisma.deviceInstance.groupBy({ by: ['carType'], _count: true }),
        ]);
        return { stats: { systems: systemCount, wires: wireCount, drawings: drawingCount, equipment: deviceCount, connectors: connectorCount, pins: pinCount }, car_breakdown: carCount };
      }
      case 'search_documents_rag': {
        const results = await searchDocuments(String(params.query || ''), Number(params.top_k || 5));
        return { results, count: results.length };
      }
      case 'search_wiring_semantic': {
        const results = await searchWiring(
          String(params.query || ''),
          params.car_type as string | undefined,
          params.subsystem as string | undefined
        );
        return { results, count: results.length };
      }
      case 'get_all_agents': {
        const agents = agentEngine.getAllAgents();
        return { agents: agents.map(a => ({ id: a.id, name: a.name, role: a.role, description: a.description, capabilities: a.capabilities })) };
      }
      case 'execute_agent_task': {
        const task = agentEngine.createTask(
          params.task_type as any,
          String(params.query || ''),
          {
            carType: params.car_type as string,
            subsystem: params.subsystem as string,
            wireNumber: params.wire_number as string,
            connectorCode: params.connector_code as string,
            equipmentCode: params.equipment_code as string,
            trainlineNumber: params.trainline_number as number,
            drawingNumber: params.drawing_number as string,
          }
        );
        const result = await agentEngine.executeMultiAgent(task);
        return { task_id: result.taskId, primary_agent: result.primaryAgent, supporting_agents: result.supportingAgents, result: result.result, execution_time_ms: result.executionTime };
      }
      case 'get_pin_details': {
        const connectorCode = String(params.connector_code || '');
        const pinNo = String(params.pin_no || '');
        const pins = await prisma.connectorPin.findMany({
          where: {
            connector: { connectorCode: { contains: connectorCode, mode: Prisma.QueryMode.insensitive } },
            ...(pinNo && { pinNo: { contains: pinNo, mode: Prisma.QueryMode.insensitive } }),
          },
          include: { connector: { include: { device: { include: { system: true } } } }, endpoints: { include: { wire: true } } },
          take: 10
        });
        return { pins };
      }
      case 'get_equipment_details': {
        const equipmentCode = String(params.equipment_code || '');
        const device = await prisma.deviceInstance.findFirst({
          where: {
            OR: [
              { name: { contains: equipmentCode, mode: Prisma.QueryMode.insensitive } },
              { tag: { contains: equipmentCode, mode: Prisma.QueryMode.insensitive } },
            ],
          },
          include: { system: true, type: true, connectors: { include: { pins: { include: { endpoints: { include: { wire: true } } } } } } }
        });
        return { equipment: device };
      }
      case 'get_subsystems': {
        const systems = await prisma.system.findMany({
          where: params.car_type ? { devices: { some: { carType: String(params.car_type) } } } : undefined,
          orderBy: { name: 'asc' }
        });
        return { subsystems: systems.map(s => ({ code: s.code || s.name, name: s.name, description: s.description })) };
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

    if (method === 'agent/execute') {
      const { task_type, query, ...context } = params;
      const task = agentEngine.createTask(task_type, query, context);
      const result = await agentEngine.executeMultiAgent(task);
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
    version: '2.0',
    description: 'KMRCL VCC Wiring Explorer MCP Server - Enhanced with RAG & Multi-Agent',
    features: [
      'PostgreSQL (Neon) for structured data',
      'MongoDB for document storage and RAG',
      'Multi-agent AI system',
      'Semantic search capabilities',
      'Full VCC data model (Cars, Systems, Equipment, Connectors, Pins, Wires)',
    ]
  });
}