import { prisma } from '@/lib/prisma';
import { callLLM, callLLMWithFallback, LLMResponse } from '@/lib/llm';
import { Prisma } from '@prisma/client';

export interface AgentTask {
  taskId: string;
  taskType: TaskType;
  query: string;
  context: Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high';
}

export type TaskType = 
  | 'search_wire'
  | 'search_connector'
  | 'search_drawing'
  | 'search_equipment'
  | 'trace_trainline'
  | 'trace_circuit'
  | 'analyze_system'
  | 'explain_wire'
  | 'document_lookup'
  | 'semantic_search'
  | 'unified_search';

export interface AgentResponse {
  taskId: string;
  agentId: string;
  content: string;
  data: Record<string, unknown>;
  confidence: number;
  sources: string[];
  executionTime: number;
}

export interface MultiAgentResult {
  taskId: string;
  primaryResponse: AgentResponse;
  supportingResponses: AgentResponse[];
  unifiedResponse: string;
  allData: Record<string, unknown>;
  executionTime: number;
}

export interface RAGChunk {
  id: string;
  content: string;
  sourceType: string;
  sourceId: string;
  metadata: Record<string, unknown>;
}

interface WireTraceResult {
  wire: {
    wireNo: string;
    signalName: string | null;
    voltageClass: string | null;
    description: string | null;
  };
  endpoints: Array<{
    connector: string;
    pin: string;
    signal: string;
    wireNo: string;
    drawingNo: string;
  }>;
  trainlines: Array<{
    wireNo: string;
    itemName: string;
    lineGroup: string;
    drawingNo: string;
  }>;
  relatedConnectors: Array<{
    connectorCode: string;
    pinCount: number;
    drawingNo: string;
  }>;
}

export class MultiAgentRAG {
  private systemPrompt = `You are an expert VCC (Vehicle Control Circuit) system analyst for KMRCL RS3R Metro trains. 
You have access to a comprehensive database of wiring diagrams, connectors, pins, trainlines, equipment, and drawings.
Your role is to provide accurate, detailed information about electrical circuits, wire connections, and system architecture.

Key data relationships:
- Drawbacks contain Connectors, which contain Pins
- Pins connect to Wires through WireEndpoints
- Trainlines (1000-9000 series) span across all cars
- Systems: TRAC (Traction), BRAKE, TMS (TCMS), DOOR, APS, VAC, TRL (Trainlines), CAB, COMMS
- Car types: DMC, TC, MC

Provide clear, structured responses with relevant details from the database.`;

  async executeTask(task: AgentTask): Promise<AgentResponse> {
    const startTime = Date.now();
    
    switch (task.taskType) {
      case 'search_wire':
        return this.searchWire(task);
      case 'search_connector':
        return this.searchConnector(task);
      case 'search_drawing':
        return this.searchDrawing(task);
      case 'search_equipment':
        return this.searchEquipment(task);
      case 'trace_trainline':
        return this.traceTrainline(task);
      case 'explain_wire':
        return this.explainWire(task);
      case 'analyze_system':
        return this.analyzeSystem(task);
      case 'semantic_search':
        return this.semanticSearch(task);
      case 'unified_search':
        return this.unifiedSearch(task);
      default:
        return this.unifiedSearch(task);
    }
  }

  async executeMultiAgent(task: AgentTask): Promise<MultiAgentResult> {
    const startTime = Date.now();
    const taskId = task.taskId;
    
    const primaryTask = task;
    const supportingTaskTypes = this.getSupportingAgents(task.taskType);
    
    const [primaryResponse, ...supportingResponses] = await Promise.all([
      this.executeTask(primaryTask),
      ...supportingTaskTypes.map(tType => this.executeTask({ ...task, taskType: tType })),
    ]);
    
    const unifiedResponse = await this.generateUnifiedResponse(primaryResponse, supportingResponses, task);
    
    return {
      taskId,
      primaryResponse,
      supportingResponses,
      unifiedResponse,
      allData: this.collectAllData(primaryResponse, supportingResponses),
      executionTime: Date.now() - startTime,
    };
  }

  private getSupportingAgents(primaryType: TaskType): TaskType[] {
    const agentMap: Record<TaskType, TaskType[]> = {
      search_wire: ['search_connector', 'trace_trainline'],
      search_connector: ['search_drawing', 'search_wire'],
      search_drawing: ['search_wire', 'search_equipment'],
      search_equipment: ['search_drawing', 'search_connector'],
      trace_trainline: ['search_wire', 'explain_wire'],
      trace_circuit: ['search_wire', 'search_connector'],
      analyze_system: ['search_drawing', 'search_equipment'],
      explain_wire: ['search_connector', 'trace_trainline'],
      document_lookup: ['search_drawing'],
      semantic_search: ['search_wire', 'search_connector', 'search_drawing'],
      unified_search: ['search_wire', 'search_connector', 'search_drawing', 'search_equipment', 'trace_trainline'],
    };
    return agentMap[primaryType] || [];
  }

  private async searchWire(task: AgentTask): Promise<AgentResponse> {
    const query = task.query.trim();
    
    const wires = await prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: { contains: query } },
          { signalName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      take: 20,
      orderBy: { wireNo: 'asc' },
    });
    
    const pins = await prisma.connectorPin.findMany({
      where: {
        wireNo: { contains: query },
      },
      include: { connector: { include: { drawing: true } } },
      take: 20,
    });
    
    const trainlines = await prisma.trainLine.findMany({
      where: {
        OR: [
          { wireNo: { contains: query } },
          { itemName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: { drawing: true },
      take: 10,
    });
    
    const data = { wires, pins, trainlines };
    
    const content = wires.length > 0
      ? `Found ${wires.length} wire(s) matching "${query}":\n${wires.map(w => 
          `- **${w.wireNo}**: ${w.signalName || 'N/A'} (${w.voltageClass || 'N/A'})`
        ).join('\n')}\n\n` +
        (pins.length > 0 ? `Connected to ${pins.length} pin(s):\n${pins.slice(0, 5).map(p => 
          `- ${p.connector?.connectorCode || 'Unknown'}:${p.pinNo} (${p.connector?.drawing?.drawingNo || 'N/A'})`
        ).join('\n')}\n\n` : '') +
        (trainlines.length > 0 ? `Trainline entries:\n${trainlines.map(t => 
          `- ${t.wireNo}: ${t.itemName} (${t.lineGroup})`
        ).join('\n')}` : '')
      : `No wires found matching "${query}"`;
    
    return {
      taskId: task.taskId,
      agentId: 'wire-agent',
      content,
      data,
      confidence: wires.length > 0 ? 1 : 0,
      sources: [...wires.map(w => w.id), ...pins.map(p => p.id)],
      executionTime: 0,
    };
  }

  private async searchConnector(task: AgentTask): Promise<AgentResponse> {
    const query = task.query.trim();
    
    const connectors = await prisma.connector.findMany({
      where: {
        OR: [
          { connectorCode: { contains: query } },
          { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        pins: { take: 20 },
        drawing: { include: { system: true } },
        _count: { select: { pins: true } },
      },
      take: 20,
      orderBy: { connectorCode: 'asc' },
    });
    
    const data = { connectors };
    
    const content = connectors.length > 0
      ? `Found ${connectors.length} connector(s) matching "${query}":\n${connectors.map(c => 
          `- **${c.connectorCode}**: ${c._count.pins} pins - ${c.drawing?.drawingNo || 'N/A'} (${c.drawing?.system?.code || 'N/A'})`
        ).join('\n')}\n\n` +
        connectors.slice(0, 3).map(c => 
          `**${c.connectorCode}** pins:\n${c.pins.slice(0, 10).map(p => 
            `  - ${p.pinNo}: ${p.signalName || 'N/A'} → Wire ${p.wireNo || 'N/A'}`
          ).join('\n')}`
        ).join('\n\n')
      : `No connectors found matching "${query}"`;
    
    return {
      taskId: task.taskId,
      agentId: 'connector-agent',
      content,
      data,
      confidence: connectors.length > 0 ? 1 : 0,
      sources: connectors.map(c => c.id),
      executionTime: 0,
    };
  }

  private async searchDrawing(task: AgentTask): Promise<AgentResponse> {
    const query = task.query.trim();
    
    const drawings = await prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { contains: query } },
          { drawingNo: { contains: query.replace(/-/g, '') } },
          { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        system: true,
        _count: { select: { connectors: true, trainLines: true, devices: true } },
      },
      take: 20,
      orderBy: { drawingNo: 'asc' },
    });
    
    const data = { drawings };
    
    const content = drawings.length > 0
      ? `Found ${drawings.length} drawing(s) matching "${query}":\n${drawings.map(d => {
          const sys = d.system?.code || 'N/A';
          const conn = d._count.connectors;
          const tl = d._count.trainLines;
          const dev = d._count.devices;
          return `- **${d.drawingNo}**: ${d.title}\n  System: ${sys} | Connectors: ${conn} | Trainlines: ${tl} | Equipment: ${dev}`;
        }).join('\n\n')}`
      : `No drawings found matching "${query}". Try searching with just the numeric portion (e.g., "58120" instead of "942-58120")`;
    
    return {
      taskId: task.taskId,
      agentId: 'drawing-agent',
      content,
      data,
      confidence: drawings.length > 0 ? 1 : 0,
      sources: drawings.map(d => d.id),
      executionTime: 0,
    };
  }

  private async searchEquipment(task: AgentTask): Promise<AgentResponse> {
    const query = task.query.trim();
    
    const devices = await prisma.device.findMany({
      where: {
        OR: [
          { tagNo: { contains: query } },
          { deviceName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        system: true,
        _count: { select: { wireEndpoints: true } },
      },
      take: 20,
      orderBy: { deviceName: 'asc' },
    });
    
    const data = { devices };
    
    const content = devices.length > 0
      ? `Found ${devices.length} equipment(s) matching "${query}":\n${devices.map(d => {
          const sys = d.system?.code || 'N/A';
          const car = d.carType || 'N/A';
          const conn = d._count.wireEndpoints;
          return `- **${d.tagNo || d.deviceName}**: ${d.deviceName}\n  System: ${sys} | Car: ${car} | Connections: ${conn}`;
        }).join('\n\n')}`
      : `No equipment found matching "${query}"`;
    
    return {
      taskId: task.taskId,
      agentId: 'equipment-agent',
      content,
      data,
      confidence: devices.length > 0 ? 1 : 0,
      sources: devices.map(d => d.id),
      executionTime: 0,
    };
  }

  private async traceTrainline(task: AgentTask): Promise<AgentResponse> {
    const wireNo = task.query.trim();
    
    const trainlines = await prisma.trainLine.findMany({
      where: {
        OR: [
          { wireNo: { contains: wireNo } },
          { itemName: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: { drawing: true },
    });
    
    const pins = await prisma.connectorPin.findMany({
      where: { wireNo: { contains: wireNo } },
      include: { connector: { include: { drawing: true } } },
    });
    
    const wires = await prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: { contains: wireNo } },
          { signalName: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
        ],
      },
    });
    
    const data = { trainlines, pins, wires };
    
    const content = trainlines.length > 0 || pins.length > 0
      ? `**Trainline Trace for Wire ${wireNo}**\n\n` +
        (trainlines.length > 0 ? `**Trainline Entries:**\n${trainlines.map(t => 
          `- ${t.wireNo}: ${t.itemName} (${t.lineGroup}) at ${t.drawing?.drawingNo || 'N/A'}`
        ).join('\n')}\n\n` : '') +
        (pins.length > 0 ? `**Pin Connections (across all cars):**\n${pins.map(p => 
          `- ${p.connector?.connectorCode || 'Unknown'}:${p.pinNo} - ${p.signalName || 'N/A'}\n  Drawing: ${p.connector?.drawing?.drawingNo || 'N/A'}`
        ).join('\n')}\n\n` : '') +
        (wires.length > 0 ? `**Wire Details:**\n${wires.map(w => 
          `- ${w.wireNo}: ${w.signalName || 'N/A'} (${w.voltageClass || 'N/A'})`
        ).join('\n')}` : '')
      : `No trainline data found for wire ${wireNo}`;
    
    return {
      taskId: task.taskId,
      agentId: 'trainline-agent',
      content,
      data,
      confidence: trainlines.length > 0 || pins.length > 0 ? 1 : 0,
      sources: [...trainlines.map(t => t.id), ...pins.map(p => p.id)],
      executionTime: 0,
    };
  }

  private async explainWire(task: AgentTask): Promise<AgentResponse> {
    const wireNo = task.query.trim();
    
    const [wire, pins, trainlines, circuits] = await Promise.all([
      prisma.wire.findFirst({ where: { wireNo: { contains: wireNo } } }),
      prisma.connectorPin.findMany({
        where: { wireNo: { contains: wireNo } },
        include: { connector: { include: { drawing: { include: { system: true } } } } },
      }),
      prisma.trainLine.findMany({
        where: { wireNo: { contains: wireNo } },
        include: { drawing: true },
      }),
      prisma.circuit.findMany({
        where: {
          OR: [
            { circuitCode: { contains: wireNo } },
            { note: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { drawing: true },
      }),
    ]);
    
    const data = { wire, pins, trainlines, circuits };
    
    if (!wire && pins.length === 0 && trainlines.length === 0) {
      return {
        taskId: task.taskId,
        agentId: 'wire-agent',
        content: `No wire information found for "${wireNo}". This wire may not exist in the database.`,
        data,
        confidence: 0,
        sources: [],
        executionTime: 0,
      };
    }
    
    const llmResult = await callLLMWithFallback(
      `Explain the circuit for wire number ${wireNo} based on this data:\n${JSON.stringify(data, null, 2)}`,
      {
        system: this.systemPrompt,
        temperature: 0.3,
        maxTokens: 1500,
      }
    );
    
    const content = llmResult.content || this.generateWireExplanation(wireNo, wire, pins, trainlines, circuits);
    
    return {
      taskId: task.taskId,
      agentId: 'wire-agent',
      content,
      data,
      confidence: wire ? 0.9 : (pins.length > 0 ? 0.7 : 0.3),
      sources: [wire?.id, ...pins.map(p => p.id), ...trainlines.map(t => t.id)].filter(Boolean) as string[],
      executionTime: 0,
    };
  }

  private generateWireExplanation(
    wireNo: string,
    wire: any,
    pins: any[],
    trainlines: any[],
    circuits: any[]
  ): string {
    let explanation = `## Wire ${wireNo} Circuit Explanation\n\n`;
    
    if (wire) {
      explanation += `**Signal:** ${wire.signalName || 'N/A'}\n`;
      explanation += `**Description:** ${wire.description || 'N/A'}\n`;
      explanation += `**Voltage:** ${wire.voltageClass || 'N/A'}\n`;
      if (wire.sourceEquipment) explanation += `**Source:** ${wire.sourceEquipment}${wire.sourceConnector ? ` (${wire.sourceConnector})` : ''}\n`;
      if (wire.destEquipment) explanation += `**Destination:** ${wire.destEquipment}${wire.destConnector ? ` (${wire.destConnector})` : ''}\n`;
      explanation += '\n';
    }
    
    if (trainlines.length > 0) {
      explanation += `**Trainline Details:**\n`;
      trainlines.forEach(t => {
        explanation += `- ${t.wireNo}: ${t.itemName} (${t.lineGroup})\n`;
        if (t.carType && t.carType !== 'ALL') explanation += `  Car Type: ${t.carType}\n`;
      });
      explanation += '\n';
    }
    
    if (pins.length > 0) {
      explanation += `**Connected Pins:**\n`;
      const groupedByDrawing = pins.reduce((acc, p) => {
        const dwg = p.connector?.drawing?.drawingNo || 'Unknown';
        if (!acc[dwg]) acc[dwg] = [];
        acc[dwg].push(p);
        return acc;
      }, {} as Record<string, unknown[]>);
      
      Object.keys(groupedByDrawing).forEach((drawingNo) => {
        const pList = groupedByDrawing[drawingNo];
        explanation += `- Drawing ${drawingNo}:\n`;
        pList.forEach((p: any) => {
          explanation += `  - ${p.connector?.connectorCode || 'Unknown'}:${p.pinNo} (${p.signalName || 'N/A'})\n`;
        });
      });
      explanation += '\n';
    }
    
    if (circuits.length > 0) {
      explanation += `**Related Circuits:**\n`;
      circuits.forEach(c => {
        explanation += `- ${c.circuitCode || 'N/A'}: ${c.circuitName || 'N/A'}\n`;
      });
    }
    
    return explanation;
  }

  private async analyzeSystem(task: AgentTask): Promise<AgentResponse> {
    const systemCode = task.query.trim().toUpperCase();
    
    const system = await prisma.system.findFirst({
      where: { code: systemCode },
      include: {
        drawings: { take: 20, include: { _count: { select: { connectors: true, trainLines: true } } } },
        devices: { take: 20 },
        _count: { select: { drawings: true, devices: true } },
      },
    });
    
    if (!system) {
      return {
        taskId: task.taskId,
        agentId: 'system-agent',
        content: `System "${systemCode}" not found. Available systems: TRAC, BRAKE, TMS, DOOR, APS, VAC, TRL, CAB, COMMS, GEN`,
        data: {},
        confidence: 0,
        sources: [],
        executionTime: 0,
      };
    }
    
    const data = { system };
    
    const content = 
      `## ${system.name} (${system.code}) Analysis\n\n` +
      `**Category:** ${system.category || 'N/A'}\n` +
      `**Description:** ${system.description || 'N/A'}\n\n` +
      `**Statistics:**\n` +
      `- Drawings: ${system._count.drawings}\n` +
      `- Equipment: ${system._count.devices}\n\n` +
      `**Drawings:**\n${system.drawings.slice(0, 10).map(d => 
        `- ${d.drawingNo}: ${d.title} (${d._count.connectors} connectors, ${d._count.trainLines} trainlines)`
      ).join('\n')}\n\n` +
      `**Equipment:**\n${system.devices.map(e => 
        `- ${e.tagNo || e.deviceName}: ${e.deviceName} (${e.carType || 'N/A'})`
      ).join('\n')}`;
    
    return {
      taskId: task.taskId,
      agentId: 'system-agent',
      content,
      data,
      confidence: 1,
      sources: [system.id],
      executionTime: 0,
    };
  }

  private async semanticSearch(task: AgentTask): Promise<AgentResponse> {
    const query = task.query;
    
    const [wires, connectors, drawings, devices, trainlines] = await Promise.all([
      prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { signalName: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        take: 10,
      }),
      prisma.connector.findMany({
        where: {
          OR: [
            { connectorCode: { contains: query } },
            { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { drawing: true, _count: { select: { pins: true } } },
        take: 10,
      }),
      prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query } },
            { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { system: true },
        take: 10,
      }),
      prisma.device.findMany({
        where: {
          OR: [
            { tagNo: { contains: query } },
            { deviceName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { system: true },
        take: 10,
      }),
      prisma.trainLine.findMany({
        where: {
          OR: [
            { wireNo: { contains: query } },
            { itemName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        include: { drawing: true },
        take: 10,
      }),
    ]);
    
    const data = { wires, connectors, drawings, devices, trainlines };
    const totalResults = wires.length + connectors.length + drawings.length + devices.length + trainlines.length;
    
    let content = `## Search Results for "${query}"\n\n**Total Results:** ${totalResults}\n\n`;
    
    if (wires.length > 0) {
      content += `**Wires (${wires.length}):**\n${wires.map(w => `- ${w.wireNo}: ${w.signalName || 'N/A'}`).join('\n')}\n\n`;
    }
    if (connectors.length > 0) {
      content += `**Connectors (${connectors.length}):**\n${connectors.map(c => `- ${c.connectorCode} (${c._count.pins} pins)`).join('\n')}\n\n`;
    }
    if (drawings.length > 0) {
      content += `**Drawings (${drawings.length}):**\n${drawings.map(d => `- ${d.drawingNo}: ${d.title}`).join('\n')}\n\n`;
    }
    if (devices.length > 0) {
      content += `**Equipment (${devices.length}):**\n${devices.map(d => `- ${d.tagNo || d.deviceName}: ${d.deviceName}`).join('\n')}\n\n`;
    }
    if (trainlines.length > 0) {
      content += `**Trainlines (${trainlines.length}):**\n${trainlines.map(t => `- ${t.wireNo}: ${t.itemName}`).join('\n')}\n\n`;
    }
    
    if (totalResults === 0) {
      content = `No results found for "${query}". Try a different search term.`;
    }
    
    return {
      taskId: task.taskId,
      agentId: 'rag-agent',
      content,
      data,
      confidence: totalResults > 0 ? 0.9 : 0,
      sources: [
        ...wires.map(w => `wire-${w.id}`),
        ...connectors.map(c => `connector-${c.id}`),
        ...drawings.map(d => `drawing-${d.id}`),
        ...devices.map(d => `device-${d.id}`),
      ],
      executionTime: 0,
    };
  }

  private async unifiedSearch(task: AgentTask): Promise<AgentResponse> {
    return this.semanticSearch(task);
  }

  private async generateUnifiedResponse(
    primary: AgentResponse,
    supporting: AgentResponse[],
    task: AgentTask
  ): Promise<string> {
    const allContent = [primary.content, ...supporting.map(s => s.content)].filter(Boolean).join('\n\n---\n\n');
    
    const llmResult = await callLLMWithFallback(
      `Based on the user's query "${task.query}", synthesize the following agent responses into a coherent, well-structured answer:\n\n${allContent}`,
      {
        system: this.systemPrompt + '\n\nProvide a clear, well-organized response that directly answers the query. Include relevant details, statistics, and links to related data.',
        temperature: 0.2,
        maxTokens: 2000,
      }
    );
    
    if (!llmResult.error && llmResult.content) {
      return llmResult.content;
    }
    
    return allContent;
  }

  private collectAllData(primary: AgentResponse, supporting: AgentResponse[]): Record<string, unknown> {
    const data: Record<string, unknown> = { primary: primary.data };
    supporting.forEach((s, i) => {
      data[`supporting_${i}`] = s.data;
    });
    return data;
  }

  async queryWithContext(query: string): Promise<{
    context: string;
    sources: { type: string; id: string; title: string }[];
    rawData: Record<string, unknown>;
  }> {
    const task: AgentTask = {
      taskId: `rag-${Date.now()}`,
      taskType: 'semantic_search',
      query,
      context: {},
    };
    
    const result = await this.executeTask(task);
    
    return {
      context: result.content,
      sources: result.sources.map(s => ({ type: 'unknown', id: s, title: s })),
      rawData: result.data,
    };
  }
}

export const multiAgentRAG = new MultiAgentRAG();
export default multiAgentRAG;