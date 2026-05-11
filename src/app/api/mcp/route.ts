import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
  }
];

interface System { id: string; code: string; name: string; category: string; description: string; sort_order: number }
interface Drawing { id: string; drawing_no: string; title: string; system_id: string; car_type_id: string; sheet_count: number }
interface Equipment { id: string; equipment_code: string; equipment_name: string; system_id: string; car_type_id: string; location_hint: string }
interface Trainline { id: string; trainline_no: number; name: string; description: string; voltage_domain: string; is_cross_connected: boolean }
interface Wire { id: string; wire_no: string; description: string; wire_size: string; wire_color: string; voltage_class: string }
interface TcmsPoint { id: string; point_code: string; rio_unit: string; connector_code: string; pin_no: string; signal_type: string; signal_name: string }
interface CarType { id: string; code: string; name: string; position_in_formation: number }

async function executeTool(toolName: string, params: Record<string, unknown>) {
  switch (toolName) {
    case 'get_systems': {
      const systems = await query<System>('SELECT * FROM systems ORDER BY sort_order');
      if (params.category) {
        return { systems: systems.filter((s: System) => s.category === params.category) };
      }
      return { systems };
    }

    case 'get_drawings': {
      let sql = 'SELECT d.*, s.code as system_code, c.code as car_type_code FROM drawings d LEFT JOIN systems s ON d.system_id = s.id LEFT JOIN car_types c ON d.car_type_id = c.id ORDER BY d.drawing_no';
      const drawings = await query<Drawing>(sql);
      let filtered = drawings;
      if (params.system_code) {
        filtered = filtered.filter((d: any) => d.system_code === params.system_code);
      }
      if (params.car_type) {
        filtered = filtered.filter((d: any) => d.car_type_code === params.car_type);
      }
      return { drawings: filtered };
    }

    case 'get_equipment': {
      let sql = 'SELECT e.*, s.code as system_code, c.code as car_type_code FROM equipment e LEFT JOIN systems s ON e.system_id = s.id LEFT JOIN car_types c ON e.car_type_id = c.id ORDER BY e.equipment_code';
      const equipment = await query<Equipment>(sql);
      let filtered = equipment;
      if (params.system_code) {
        filtered = filtered.filter((e: any) => e.system_code === params.system_code);
      }
      if (params.car_type) {
        filtered = filtered.filter((e: any) => e.car_type_code === params.car_type);
      }
      return { equipment: filtered };
    }

    case 'get_connectors': {
      const sql = `SELECT cn.*, e.equipment_code, e.equipment_name 
        FROM connectors cn 
        LEFT JOIN equipment e ON cn.equipment_id = e.id 
        ORDER BY e.equipment_code, cn.connector_code`;
      const connectors = await query(sql);
      if (params.equipment_code) {
        return { connectors: connectors.filter((c: any) => c.equipment_code === params.equipment_code) };
      }
      return { connectors };
    }

    case 'get_wires': {
      const wires = await query<Wire>('SELECT * FROM wires ORDER BY wire_no');
      let filtered = wires;
      if (params.voltage_class) {
        filtered = filtered.filter((w: Wire) => w.voltage_class === params.voltage_class);
      }
      if (params.search) {
        const search = (params.search as string).toLowerCase();
        filtered = filtered.filter((w: Wire) => 
          w.wire_no.toLowerCase().includes(search) || 
          (w.description && w.description.toLowerCase().includes(search))
        );
      }
      return { wires: filtered };
    }

    case 'get_trainlines': {
      let trainlines = await query<Trainline>('SELECT * FROM trainlines ORDER BY trainline_no');
      if (params.voltage_domain) {
        trainlines = trainlines.filter((t: Trainline) => t.voltage_domain === params.voltage_domain);
      }
      if (params.is_cross_connected !== undefined) {
        trainlines = trainlines.filter((t: Trainline) => t.is_cross_connected === params.is_cross_connected);
      }
      return { trainlines };
    }

    case 'get_tcms_points': {
      let points = await query<TcmsPoint>('SELECT * FROM tcms_points ORDER BY point_code');
      if (params.signal_type) {
        points = points.filter((p: TcmsPoint) => p.signal_type === params.signal_type);
      }
      if (params.rio_unit) {
        points = points.filter((p: TcmsPoint) => p.rio_unit === params.rio_unit);
      }
      return { tcms_points: points };
    }

    case 'get_car_types': {
      const carTypes = await query<CarType>('SELECT * FROM car_types ORDER BY position_in_formation');
      return { car_types: carTypes };
    }

    case 'search_wiring': {
      const searchQuery = (params.query as string || '').toLowerCase();
      const limit = (params.limit as number) || 20;
      const results: Record<string, unknown[]> = {};

      const [trainlines, wires, equipment] = await Promise.all([
        query<Trainline>(`SELECT * FROM trainlines WHERE LOWER(name) LIKE '%${searchQuery}%' OR LOWER(description) LIKE '%${searchQuery}%' LIMIT ${limit}`),
        query<Wire>(`SELECT * FROM wires WHERE LOWER(wire_no) LIKE '%${searchQuery}%' OR LOWER(description) LIKE '%${searchQuery}%' LIMIT ${limit}`),
        query<Equipment>(`SELECT e.*, s.code as system_code FROM equipment e LEFT JOIN systems s ON e.system_id = s.id WHERE LOWER(e.equipment_name) LIKE '%${searchQuery}%' OR LOWER(e.equipment_code) LIKE '%${searchQuery}%' LIMIT ${limit}`)
      ]);

      if (trainlines.length) results.trainlines = trainlines;
      if (wires.length) results.wires = wires;
      if (equipment.length) results.equipment = equipment;

      return { search_results: results, total_results: Object.values(results).flat().length };
    }

    case 'get_wire_details': {
      const wireNo = params.wire_no as string;
      const wires = await query<Wire>('SELECT * FROM wires WHERE wire_no = $1', [wireNo]);
      return { wire: wires[0] || null };
    }

    case 'get_trainline_trace': {
      const trainlineNo = params.trainline_no as number;
      const trainlines = await query<Trainline>('SELECT * FROM trainlines WHERE trainline_no = $1', [trainlineNo]);
      return { trainline: trainlines[0] || null };
    }

    case 'get_dashboard_stats': {
      const [systems, trainlines, drawings, equipment, wires, tcms, carTypes] = await Promise.all([
        query<{ count: number }>('SELECT COUNT(*) as count FROM systems'),
        query<{ count: number }>('SELECT COUNT(*) as count FROM trainlines'),
        query<{ count: number }>('SELECT COUNT(*) as count FROM drawings'),
        query<{ count: number }>('SELECT COUNT(*) as count FROM equipment'),
        query<{ count: number }>('SELECT COUNT(*) as count FROM wires'),
        query<{ count: number }>('SELECT COUNT(*) as count FROM tcms_points'),
        query<{ count: number }>('SELECT COUNT(*) as count FROM car_types')
      ]);
      return {
        stats: {
          systems: Number(systems[0]?.count) || 0,
          trainlines: Number(trainlines[0]?.count) || 0,
          drawings: Number(drawings[0]?.count) || 0,
          equipment: Number(equipment[0]?.count) || 0,
          wires: Number(wires[0]?.count) || 0,
          tcms_points: Number(tcms[0]?.count) || 0,
          car_types: Number(carTypes[0]?.count) || 0
        }
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params } = body;

    if (method === 'tools/list') {
      return NextResponse.json({ tools: TOOLS });
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      const result = await executeTool(name, args || {});
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Unknown method' }, { status: 400 });
  } catch (error) {
    console.error('MCP Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'VCC Intelligence MCP Server',
    version: '2.0.0',
    description: 'AI Agent interface for KMRCL VCC Wiring Explorer database',
    tools: TOOLS.map(t => t.name)
  });
}