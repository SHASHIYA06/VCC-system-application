import { prisma } from '@/lib/prisma';

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
}

export interface TaskResult {
  taskId: string;
  primaryAgent: string;
  supportingAgents: string[];
  result: unknown;
  executionTime: number;
}

export interface AgentTask {
  taskType: string;
  query: string;
  context: Record<string, unknown>;
  taskId: string;
}

class AgentEngine {
  private agents: AgentInfo[] = [
    { 
      id: 'wire-agent', 
      name: 'Wire Agent', 
      role: 'wiring', 
      description: 'Analyzes wire connections, traces signal paths, and identifies voltage classes',
      capabilities: ['trace_wire', 'find_connections', 'check_voltage', 'identify_cable', 'signal_analysis']
    },
    { 
      id: 'connector-agent', 
      name: 'Connector Agent', 
      role: 'hardware', 
      description: 'Manages connector and pin data, traces interconnects',
      capabilities: ['find_pins', 'check_connectors', 'trace_signals', 'pin_mapping', 'jumper_config']
    },
    { 
      id: 'system-agent', 
      name: 'System Agent', 
      role: 'analysis', 
      description: 'Analyzes system integration and provides system-level information',
      capabilities: ['analyze_system', 'check_interfaces', 'verify_signals', 'system_status']
    },
    { 
      id: 'trainline-agent', 
      name: 'Trainline Agent', 
      role: 'control', 
      description: 'Manages trainline control signals and cross-connections',
      capabilities: ['trace_trainline', 'cross_connect', 'control_signals', 'emergency_loops']
    },
    { 
      id: 'drawing-agent', 
      name: 'Drawing Agent', 
      role: 'documentation', 
      description: 'Retrieves drawing information and pin assignments',
      capabilities: ['get_drawing', 'pin_assignment', 'schematic_lookup', 'revision_info']
    },
    { 
      id: 'equipment-agent', 
      name: 'Equipment Agent', 
      role: 'equipment', 
      description: 'Manages equipment and device information',
      capabilities: ['get_equipment', 'device_status', 'location_info', 'system_mapping']
    },
  ];

  getAllAgents() {
    return this.agents;
  }

  getAgent(id: string) {
    return this.agents.find(a => a.id === id);
  }
  
  createTask(taskType: string, query: string, context: Record<string, unknown> = {}): AgentTask {
    return { 
      taskType, 
      query, 
      context, 
      taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    };
  }

  async executeMultiAgent(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    let result: unknown = {};
    let primaryAgent = 'wire-agent';
    let supportingAgents: string[] = [];

    switch (task.taskType) {
      case 'search_wire':
        result = await prisma.wire.findMany({ 
          where: { wireNo: { contains: task.query } }, 
          take: 20 
        });
        primaryAgent = 'wire-agent';
        supportingAgents = ['connector-agent', 'equipment-agent'];
        break;

      case 'search_connector':
        result = await prisma.connector.findMany({ 
          where: { connectorCode: { contains: task.query } }, 
          include: { pins: true },
          take: 20 
        });
        primaryAgent = 'connector-agent';
        supportingAgents = ['wire-agent'];
        break;

      case 'search_equipment':
        result = await prisma.device.findMany({ 
          where: { 
            OR: [
              { deviceName: { contains: task.query } },
              { tagNo: { contains: task.query } }
            ]
          },
          include: { system: true },
          take: 20 
        });
        primaryAgent = 'equipment-agent';
        supportingAgents = ['system-agent', 'connector-agent'];
        break;

      case 'trace_trainline':
        const trainlines = await prisma.trainLine.findMany({ 
          where: { wireNo: { contains: task.query } },
          include: { drawing: true }
        });
        
        const path = [];
        for (const tl of trainlines) {
          const pins = await prisma.connectorPin.findMany({
            where: { wireNo: tl.wireNo },
            include: { connector: true }
          });
          path.push({ trainline: tl, connections: pins });
        }
        
        result = { trainlines, path };
        primaryAgent = 'trainline-agent';
        supportingAgents = ['wire-agent', 'connector-agent'];
        break;

      case 'document_lookup':
        result = await prisma.drawing.findMany({ 
          where: { 
            OR: [
              { drawingNo: { contains: task.query } },
              { title: { contains: task.query }
            }]
          },
          include: { system: true },
          take: 10 
        });
        primaryAgent = 'drawing-agent';
        supportingAgents = ['system-agent'];
        break;

      case 'wire_trace':
        const wire = await prisma.wire.findUnique({ where: { wireNo: task.query } });
        if (wire) {
          const pins = await prisma.connectorPin.findMany({
            where: { wireNo: task.query },
            include: { connector: true }
          });
          result = { wire, connections: pins };
        }
        primaryAgent = 'wire-agent';
        supportingAgents = ['connector-agent'];
        break;

      case 'system_overview':
        const systems = await prisma.system.findMany({
          include: {
            _count: { select: { devices: true, drawings: true } }
          },
          orderBy: { sortOrder: 'asc' }
        });
        result = { systems };
        primaryAgent = 'system-agent';
        supportingAgents = ['equipment-agent', 'drawing-agent'];
        break;

      case 'search_all':
        const [wires, connectors, devices, drawings, trainlines, signals] = await Promise.all([
          prisma.wire.findMany({ where: { OR: [
            { wireNo: { contains: task.query } },
            { signalName: { contains: task.query } }
          ]}, take: 20 }),
          prisma.connector.findMany({ where: { connectorCode: { contains: task.query } }, take: 20 }),
          prisma.device.findMany({ where: { OR: [
            { deviceName: { contains: task.query } },
            { tagNo: { contains: task.query } }
          ]}, take: 20 }),
          prisma.drawing.findMany({ where: { OR: [
            { drawingNo: { contains: task.query } },
            { title: { contains: task.query } }
          ]}, take: 20 }),
          prisma.trainLine.findMany({ where: { OR: [
            { wireNo: { contains: task.query } },
            { itemName: { contains: task.query } }
          ]}, take: 20 }),
          prisma.signal.findMany({ where: { OR: [
            { signalName: { contains: task.query } },
            { signalCode: { contains: task.query } }
          ]}, take: 20 }),
        ]);
        result = { wires, connectors, devices, drawings, trainlines, signals, total: wires.length + connectors.length + devices.length + drawings.length };
        primaryAgent = 'wire-agent';
        supportingAgents = ['connector-agent', 'equipment-agent', 'drawing-agent', 'trainline-agent'];
        break;

      default:
        result = await prisma.system.findMany({ take: 50 });
        primaryAgent = 'system-agent';
    }

    return {
      taskId: task.taskId,
      primaryAgent,
      supportingAgents,
      result,
      executionTime: Date.now() - startTime,
    };
  }

  async executeTask(task: AgentTask): Promise<TaskResult> {
    return this.executeMultiAgent(task);
  }

  getCapabilities(agentId: string): string[] {
    const agent = this.agents.find(a => a.id === agentId);
    return agent?.capabilities || [];
  }
}

export const agentEngine = new AgentEngine();

export async function routeToAgent(taskType: string, query: string, context: Record<string, unknown> = {}): Promise<TaskResult> {
  const task = agentEngine.createTask(taskType, query, context);
  return agentEngine.executeTask(task);
}