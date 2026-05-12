import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';
import { searchDocuments, searchWiring } from '../rag/service';
import {
  Agent,
  AgentTask,
  TaskType,
  TaskContext,
  AgentResponse,
  MultiAgentResult,
  DEFAULT_AGENTS,
} from './types';

class AgentEngine {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();

  constructor() {
    DEFAULT_AGENTS.forEach((agent) => this.registerAgent(agent));
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  getAgent(role: string): Agent | undefined {
    return Array.from(this.agents.values()).find((a) => a.role === role);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  createTask(type: TaskType, query: string, context: TaskContext): AgentTask {
    const task: AgentTask = {
      id: uuidv4(),
      type,
      query,
      context,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  private determinePrimaryAgent(type: TaskType): Agent {
    switch (type) {
      case 'trace_trainline':
      case 'search_wire':
        return this.getAgent('wiring') || DEFAULT_AGENTS[1];
      case 'document_lookup':
        return this.getAgent('document') || DEFAULT_AGENTS[3];
      case 'analyze_system':
      case 'answer_technical':
        return this.getAgent('technical') || DEFAULT_AGENTS[2];
      case 'search_connector':
      case 'search_equipment':
      case 'compare_drawings':
        return this.getAgent('search') || DEFAULT_AGENTS[0];
      default:
        return DEFAULT_AGENTS[0];
    }
  }

  private determineSupportingAgents(type: TaskType): Agent[] {
    const supporting: Agent[] = [];
    switch (type) {
      case 'trace_trainline':
        supporting.push(this.getAgent('tracing') || DEFAULT_AGENTS[4]);
        supporting.push(this.getAgent('document') || DEFAULT_AGENTS[3]);
        break;
      case 'answer_technical':
        supporting.push(this.getAgent('wiring') || DEFAULT_AGENTS[1]);
        break;
      default:
        break;
    }
    return supporting;
  }

  async executeTask(task: AgentTask): Promise<AgentResponse> {
    const startTime = Date.now();
    task.status = 'processing';
    task.updatedAt = new Date();

    try {
      let result: AgentResponse;

      switch (task.type) {
        case 'search_wire':
          result = await this.handleWireSearch(task.query, task.context);
          break;
        case 'search_connector':
          result = await this.handleConnectorSearch(task.query, task.context);
          break;
        case 'search_equipment':
          result = await this.handleEquipmentSearch(task.query, task.context);
          break;
        case 'trace_trainline':
          result = await this.handleTrainlineTrace(task.query, task.context);
          break;
        case 'document_lookup':
          result = await this.handleDocumentSearch(task.query, task.context);
          break;
        case 'analyze_system':
          result = await this.handleSystemAnalysis(task.query, task.context);
          break;
        default:
          result = await this.handleGeneralQuery(task.query, task.context);
      }

      task.status = 'completed';
      task.result = result;
      task.updatedAt = new Date();

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.updatedAt = new Date();

      return {
        success: false,
        message: `Task failed: ${task.error}`,
        data: null,
      };
    }
  }

  async executeMultiAgent(task: AgentTask): Promise<MultiAgentResult> {
    const startTime = Date.now();

    const primaryAgent = this.determinePrimaryAgent(task.type);
    const supportingAgents = this.determineSupportingAgents(task.type);

    task.assignedAgent = primaryAgent.id;
    task.status = 'processing';

    const primaryResult = await this.executeTask(task);

    const executionTime = Date.now() - startTime;

    return {
      taskId: task.id,
      primaryAgent: primaryAgent.name,
      supportingAgents: supportingAgents.map((a) => a.name),
      result: primaryResult,
      executionTime,
    };
  }

  private async handleWireSearch(query: string, context: TaskContext): Promise<AgentResponse> {
    const wires = await prisma.wire.findMany({
      where: {
        wireNo: { contains: query, mode: 'insensitive' },
      },
      include: {
        endpoints: {
          include: {
            device: true,
            connector: true,
          },
        },
      },
      take: context.limit || 20,
    });

    return {
      success: true,
      message: `Found ${wires.length} wires matching "${query}"`,
      data: { wires },
      sources: wires.map((w) => w.wireNo),
    };
  }

  private async handleConnectorSearch(query: string, context: TaskContext): Promise<AgentResponse> {
    const connectors = await prisma.connector.findMany({
      where: {
        OR: [
          { connectorCode: { contains: query, mode: 'insensitive' } },
          { normCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        device: { include: { system: true } },
        pins: true,
      },
      take: context.limit || 20,
    });

    return {
      success: true,
      message: `Found ${connectors.length} connectors matching "${query}"`,
      data: { connectors },
      sources: connectors.map((c) => c.connectorCode),
    };
  }

  private async handleEquipmentSearch(query: string, context: TaskContext): Promise<AgentResponse> {
    const devices = await prisma.deviceInstance.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tag: { contains: query, mode: 'insensitive' } },
        ],
        ...(context.carType && { carType: context.carType }),
        ...(context.subsystem && { system: { code: context.subsystem } }),
      },
      include: { system: true, type: true, connectors: true },
      take: context.limit || 20,
    });

    return {
      success: true,
      message: `Found ${devices.length} equipment matching "${query}"`,
      data: { devices },
      sources: devices.map((d) => d.name),
    };
  }

  private async handleTrainlineTrace(query: string, context: TaskContext): Promise<AgentResponse> {
    const trainlineNum = context.trainlineNumber || parseInt(query.replace(/\D/g, ''));

    if (!trainlineNum) {
      return {
        success: false,
        message: 'Please provide a valid trainline number',
        data: null,
      };
    }

    const pins = await prisma.connectorPin.findMany({
      where: { wireNo: String(trainlineNum) },
      include: {
        connector: {
          include: {
            device: { include: { system: true } },
          },
        },
      },
    });

    if (pins.length === 0) {
      return {
        success: true,
        message: `Trainline ${trainlineNum} not found in database`,
        data: { trainline: trainlineNum, connections: [] },
      };
    }

    return {
      success: true,
      message: `Found ${pins.length} connections for trainline ${trainlineNum}`,
      data: {
        trainline: trainlineNum,
        connections: pins.map((p) => ({
          connector: p.connector?.connectorCode,
          pin: p.pinNo,
          device: p.connector?.device?.name,
          car: p.connector?.device?.carType,
          direction: p.endpointDir,
        })),
      },
      sources: pins.map((p) => `${p.connector?.connectorCode}-${p.pinNo}`),
    };
  }

  private async handleDocumentSearch(query: string, context: TaskContext): Promise<AgentResponse> {
    const dbResults = await prisma.drawingDocument.findMany({
      where: {
        OR: [
          { drawingNo: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
        ...(context.carType && { carType: context.carType }),
        ...(context.subsystem && { subsystem: context.subsystem }),
      },
      take: context.limit || 20,
    });

    const ragResults = await searchDocuments(query, 5);

    return {
      success: true,
      message: `Found ${dbResults.length} drawings and ${ragResults.length} document chunks`,
      data: {
        drawings: dbResults,
        documentChunks: ragResults,
      },
      sources: [...dbResults.map((d) => d.drawingNo || ''), ...ragResults.map((r) => r.fileName)],
    };
  }

  private async handleSystemAnalysis(query: string, context: TaskContext): Promise<AgentResponse> {
    const systems = await prisma.system.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        devices: {
          include: { connectors: true },
        },
      },
    });

    return {
      success: true,
      message: `Found ${systems.length} systems`,
      data: { systems },
      sources: systems.map((s) => s.name),
    };
  }

  private async handleGeneralQuery(query: string, context: TaskContext): Promise<AgentResponse> {
    const [wires, connectors, devices, drawings] = await Promise.all([
      prisma.wire.findMany({
        where: { wireNo: { contains: query, mode: 'insensitive' } },
        take: 10,
      }),
      prisma.connector.findMany({
        where: {
          OR: [
            { connectorCode: { contains: query, mode: 'insensitive' } },
            { normCode: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.deviceInstance.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { tag: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.drawingDocument.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return {
      success: true,
      message: `Search results for "${query}"`,
      data: { wires, connectors, devices, drawings },
      sources: [
        ...wires.map((w) => w.wireNo),
        ...connectors.map((c) => c.connectorCode),
        ...devices.map((d) => d.name),
        ...drawings.map((d) => d.drawingNo || ''),
      ],
    };
  }
}

export const agentEngine = new AgentEngine();