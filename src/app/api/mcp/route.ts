import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TOOLS = [
  {
    name: 'get_systems',
    description: 'Get all electrical/electronic systems in the VCC. Returns system code, name, category, and description.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by category (e.g., Core Systems, Power, Propulsion)' }
      }
    }
  },
  {
    name: 'get_drawings',
    description: 'Get all drawings with their details including drawing number, title, revision, status, and associated system.',
    inputSchema: {
      type: 'object',
      properties: {
        system_code: { type: 'string', description: 'Filter by system code (e.g., TRL, BRAKE, DOOR)' },
        status: { type: 'string', description: 'Filter by status (active, superseded, obsolete, draft)' }
      }
    }
  },
  {
    name: 'get_equipment',
    description: 'Get equipment/modules used in the project. Returns equipment code, name, type, manufacturer.',
    inputSchema: {
      type: 'object',
      properties: {
        system_code: { type: 'string', description: 'Filter by system code' },
        equipment_type: { type: 'string', description: 'Filter by equipment type' }
      }
    }
  },
  {
    name: 'get_connectors',
    description: 'Get connectors from drawings. Returns connector code, type, gender, pin count, and associated equipment.',
    inputSchema: {
      type: 'object',
      properties: {
        drawing_no: { type: 'string', description: 'Filter by drawing number' },
        connector_type: { type: 'string', description: 'Filter by connector type' }
      }
    }
  },
  {
    name: 'get_wires',
    description: 'Get wires with their specifications. Returns wire number, type, size, color, and description.',
    inputSchema: {
      type: 'object',
      properties: {
        wire_type: { type: 'string', description: 'Filter by wire type' },
        voltage_class: { type: 'string', description: 'Filter by voltage class (e.g., 110VDC, 415VAC)' }
      }
    }
  },
  {
    name: 'get_pins',
    description: 'Get pin assignments from connectors. Returns pin number, signal name, wire connections, and references.',
    inputSchema: {
      type: 'object',
      properties: {
        connector_code: { type: 'string', description: 'Filter by connector code' },
        signal_name: { type: 'string', description: 'Filter by signal name (partial match)' }
      }
    }
  },
  {
    name: 'get_trainlines',
    description: 'Get trainline numbers and their descriptions. Trainlines are priority signals for train control.',
    inputSchema: {
      type: 'object',
      properties: {
        voltage_domain: { type: 'string', description: 'Filter by voltage domain (e.g., 110VDC, 415VAC)' },
        is_cross_connected: { type: 'boolean', description: 'Filter by cross-connected status' }
      }
    }
  },
  {
    name: 'get_tcms_points',
    description: 'Get TCMS (Train Control Management System) remote I/O points. Returns point code, signal type, connector info.',
    inputSchema: {
      type: 'object',
      properties: {
        signal_type: { type: 'string', description: 'Filter by signal type (DI, DO, AI, AO)' },
        system_code: { type: 'string', description: 'Filter by system code' }
      }
    }
  },
  {
    name: 'search_wiring',
    description: 'Search across all wiring data by keyword. Searches drawings, equipment, connectors, wires, pins, and trainlines.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword' },
        limit: { type: 'number', description: 'Maximum results to return (default 20)' }
      }
    }
  },
  {
    name: 'get_project_info',
    description: 'Get project information including customer name, rolling stock type, and car types in the formation.',
    inputSchema: { type: 'object', properties: {} }
  }
];

async function executeTool(toolName: string, params: Record<string, unknown>) {
  switch (toolName) {
    case 'get_systems': {
      let query = supabase.from('systems').select('*').order('sort_order');
      if (params.category) {
        query = query.eq('category', params.category as string);
      }
      const { data } = await query;
      return { systems: data || [] };
    }

    case 'get_drawings': {
      let query = supabase.from('drawings')
        .select('*, systems(code, name)')
        .order('drawing_no');
      if (params.system_code) {
        query = query.eq('systems.code', params.system_code as string);
      }
      if (params.status) {
        query = query.eq('status', params.status as string);
      }
      const { data } = await query;
      return { drawings: data || [] };
    }

    case 'get_equipment': {
      let query = supabase.from('equipment')
        .select('*, systems(code), car_types(code)')
        .order('equipment_code');
      if (params.system_code) {
        query = query.eq('systems.code', params.system_code as string);
      }
      if (params.equipment_type) {
        query = query.eq('equipment_type', params.equipment_type as string);
      }
      const { data } = await query;
      return { equipment: data || [] };
    }

    case 'get_connectors': {
      let query = supabase.from('connectors')
        .select('*, equipment(equipment_code), drawing_id, drawing_pages(page_no)')
        .order('connector_code');
      if (params.drawing_no) {
        query = query.eq('drawings.drawing_no', params.drawing_no as string);
      }
      if (params.connector_type) {
        query = query.eq('connector_type', params.connector_type as string);
      }
      const { data } = await query;
      return { connectors: data || [] };
    }

    case 'get_wires': {
      let query = supabase.from('wires').select('*').order('wire_no');
      if (params.wire_type) {
        query = query.eq('wire_type', params.wire_type as string);
      }
      if (params.voltage_class) {
        query = query.eq('voltage_class', params.voltage_class as string);
      }
      const { data } = await query;
      return { wires: data || [] };
    }

    case 'get_pins': {
      let query = supabase.from('pins')
        .select('*, connectors(connector_code), wires(wire_no, wire_type, wire_color)')
        .order('sequence_no');
      if (params.connector_code) {
        query = query.eq('connectors.connector_code', params.connector_code as string);
      }
      if (params.signal_name) {
        query = query.ilike('signal_name', `%${params.signal_name}%`);
      }
      const { data } = await query;
      return { pins: data || [] };
    }

    case 'get_trainlines': {
      let query = supabase.from('trainlines')
        .select('*, systems(code, name)')
        .order('trainline_no');
      if (params.voltage_domain) {
        query = query.eq('voltage_domain', params.voltage_domain as string);
      }
      if (params.is_cross_connected !== undefined) {
        query = query.eq('is_cross_connected', params.is_cross_connected as boolean);
      }
      const { data } = await query;
      return { trainlines: data || [] };
    }

    case 'get_tcms_points': {
      let query = supabase.from('tcms_points')
        .select('*, systems(code)')
        .order('point_code');
      if (params.signal_type) {
        query = query.eq('signal_type', params.signal_type as string);
      }
      if (params.system_code) {
        query = query.eq('systems.code', params.system_code as string);
      }
      const { data } = await query;
      return { tcms_points: data || [] };
    }

    case 'search_wiring': {
      const query = (params.query as string) || '';
      const limit = (params.limit as number) || 20;
      const results: Record<string, unknown[]> = {};

      const [systems, drawings, equipment, trainlines] = await Promise.all([
        supabase.from('systems').select('*').ilike('name', `%${query}%`).limit(5),
        supabase.from('drawings').select('*, systems(code, name)').ilike('title', `%${query}%`).limit(5),
        supabase.from('equipment').select('*').ilike('equipment_name', `%${query}%`).limit(5),
        supabase.from('trainlines').select('*, systems(code, name)').ilike('name', `%${query}%`).limit(5)
      ]);

      if (systems.data?.length) results.systems = systems.data;
      if (drawings.data?.length) results.drawings = drawings.data;
      if (equipment.data?.length) results.equipment = equipment.data;
      if (trainlines.data?.length) results.trainlines = trainlines.data;

      return { search_results: results, total_results: Object.values(results).flat().length };
    }

    case 'get_project_info': {
      const [project, carTypes] = await Promise.all([
        supabase.from('projects').select('*').single(),
        supabase.from('car_types').select('code, name, position_in_formation').order('position_in_formation')
      ]);
      return { project: project.data, car_types: carTypes.data || [] };
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
    name: 'VCC Explorer MCP Server',
    version: '1.0.0',
    description: 'AI Agent interface for VCC Wiring Explorer database',
    tools: TOOLS.map(t => t.name)
  });
}