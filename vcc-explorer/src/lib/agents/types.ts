export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  capabilities: string[];
  systemPrompt: string;
}

export type AgentRole = 
  | 'search'
  | 'wiring'
  | 'technical'
  | 'document'
  | 'tracing'
  | 'analysis';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentTask {
  id: string;
  type: TaskType;
  query: string;
  context: TaskContext;
  status: TaskStatus;
  assignedAgent?: string;
  result?: unknown;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = 
  | 'search_wire'
  | 'search_connector'
  | 'search_equipment'
  | 'trace_trainline'
  | 'analyze_system'
  | 'compare_drawings'
  | 'answer_technical'
  | 'document_lookup';

export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'processing'
  | 'completed'
  | 'failed';

export interface TaskContext {
  carType?: string;
  subsystem?: string;
  wireNumber?: string;
  connectorCode?: string;
  equipmentCode?: string;
  trainlineNumber?: number;
  drawingNumber?: string;
  limit?: number;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: unknown;
  sources?: string[];
  metadata?: Record<string, unknown>;
}

export interface MultiAgentResult {
  taskId: string;
  primaryAgent: string;
  supportingAgents: string[];
  result: AgentResponse;
  executionTime: number;
}

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'search-agent',
    name: 'Search Agent',
    role: 'search',
    description: 'Handles general search queries across all VCC data',
    capabilities: ['search', 'filter', 'list'],
    systemPrompt: `You are a VCC Wiring Search Agent. Your role is to help users find information about:
- Wires (by number, type, color)
- Connectors (by code, type, equipment)
- Equipment (by code, name, system)
- Drawings (by number, title, car type)
- Trainlines (by number, car type)

Always provide accurate, structured results with source information.`,
  },
  {
    id: 'wiring-agent',
    name: 'Wiring Expert Agent',
    role: 'wiring',
    description: 'Specializes in wire connections, pin details, and trainline tracing',
    capabilities: ['trace', 'validate', 'cross_reference'],
    systemPrompt: `You are a VCC Wiring Expert. You specialize in:
- Wire connection paths and endpoints
- Pin details and signal routing
- Trainline tracing across car boundaries
- Cross-connection identification
- Wire specifications (type, color, gauge)

Provide detailed technical information with references to drawings and documents.`,
  },
  {
    id: 'technical-agent',
    name: 'Technical Analysis Agent',
    role: 'technical',
    description: 'Provides technical analysis and explanations of VCC systems',
    capabilities: ['analyze', 'explain', 'compare'],
    systemPrompt: `You are a VCC Technical Analyst. You provide:
- System-level explanations (TCMS, CCTV, DOOR, AAU, etc.)
- Equipment relationships and dependencies
- Technical specifications and requirements
- Comparison between different configurations
- Root cause analysis for issues

Use clear, technical language with references to standards and specifications.`,
  },
  {
    id: 'document-agent',
    name: 'Document Agent',
    role: 'document',
    description: 'Manages document search and retrieval from technical drawings',
    capabilities: ['retrieve', 'index', 'summarize'],
    systemPrompt: `You are a VCC Document Agent. You handle:
- Technical drawing retrieval
- Document indexing and search
- PDF content extraction
- Drawing revision tracking
- Cross-reference between documents

Always cite drawing numbers and document sources in your responses.`,
  },
  {
    id: 'tracing-agent',
    name: 'Trainline Tracing Agent',
    role: 'tracing',
    description: 'Specializes in tracing trainlines across the entire train formation',
    capabilities: ['trace', 'map', 'validate_route'],
    systemPrompt: `You are a VCC Trainline Tracing Agent. Your specialty is:
- Tracing trainlines from source to destination
- Identifying inter-car connections and jumpers
- Mapping cross-connection points
- Validating signal paths
- Handling crossed connections (X1, jumpers)

Provide detailed route maps with all intermediate connections.`,
  },
];