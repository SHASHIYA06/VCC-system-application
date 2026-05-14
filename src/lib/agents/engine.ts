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
  result: any;
  executionTime: number;
}

class AgentEngine {
  private agents: AgentInfo[] = [
    { id: 'wire-agent', name: 'Wire Agent', role: 'wiring', description: 'Analyzes wire connections and traces', capabilities: ['trace_wire', 'find_connections', 'check_voltage'] },
    { id: 'connector-agent', name: 'Connector Agent', role: 'hardware', description: 'Manages connector and pin data', capabilities: ['find_pins', 'check_connectors', 'trace_signals'] },
    { id: 'system-agent', name: 'System Agent', role: 'analysis', description: 'Analyzes system integration', capabilities: ['analyze_system', 'check_interfaces', 'verify_signals'] },
  ];

  getAllAgents() { return this.agents; }
  
  createTask(taskType: string, query: string, context: any) {
    return { taskType, query, context, taskId: `task-${Date.now()}` };
  }

  async executeMultiAgent(task: any) {
    const startTime = Date.now();
    let result = {};

    switch (task.taskType) {
      case 'search_wire':
        result = await prisma.wire.findMany({ where: { wireNo: { contains: task.query } }, take: 20 });
        break;
      case 'search_connector':
        result = await prisma.connector.findMany({ where: { connectorCode: { contains: task.query } }, take: 20 });
        break;
      case 'search_equipment':
        result = await prisma.device.findMany({ where: { OR: [{ deviceName: { contains: task.query } }, { tagNo: { contains: task.query } }] }, take: 20 });
        break;
      case 'trace_trainline':
        result = await prisma.trainLine.findMany({ where: { wireNo: task.query } });
        break;
      case 'document_lookup':
        result = await prisma.drawing.findMany({ where: { OR: [{ drawingNo: { contains: task.query } }, { title: { contains: task.query } }] }, take: 10 });
        break;
      default:
        result = await prisma.system.findMany({ take: 50 });
    }

    return {
      taskId: task.taskId,
      primaryAgent: 'wire-agent',
      supportingAgents: ['connector-agent'],
      result,
      executionTime: Date.now() - startTime,
    };
  }
}

export const agentEngine = new AgentEngine();