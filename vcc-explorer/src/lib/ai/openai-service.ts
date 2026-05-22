/**
 * OpenAI Service
 * 
 * Provides AI-powered assistance for VCC application
 * Features:
 * - Chat with GPT-4 about VCC drawings
 * - Drawing analysis
 * - Wire tracing assistance
 * - Troubleshooting help
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: any;
}

/**
 * Send chat message to OpenAI
 */
export async function chat(options: ChatOptions): Promise<string> {
  const {
    messages,
    model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 2000,
    context
  } = options;

  try {
    // Add system context if provided
    const systemMessages: ChatMessage[] = [];
    
    if (context) {
      systemMessages.push({
        role: 'system',
        content: buildSystemContext(context)
      });
    }

    // Add default system message
    systemMessages.push({
      role: 'system',
      content: `You are an expert VCC (Vehicle Control and Communication) system assistant. 
You help engineers understand electrical drawings, trace wires, identify connectors, and troubleshoot issues.
You have deep knowledge of:
- Electrical schematics and pin assignments
- Wire tracing and signal paths
- Connector types and pinouts
- Train control systems (TCMS)
- Communication protocols
- Troubleshooting methodologies

Always provide clear, accurate, and actionable information.`
    });

    const completion = await openai.chat.completions.create({
      model,
      messages: [...systemMessages, ...messages],
      temperature,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || 'No response generated';

  } catch (error) {
    console.error('OpenAI chat error:', error);
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Analyze a drawing using AI
 */
export async function analyzeDrawing(drawingData: any): Promise<string> {
  const context = {
    type: 'drawing_analysis',
    drawing: drawingData
  };

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Analyze this VCC drawing and provide insights:

Drawing Number: ${drawingData.drawingNo}
Title: ${drawingData.title}
System: ${drawingData.systemName || 'Unknown'}
Connectors: ${drawingData.connectorCount || 0}
Wires: ${drawingData.wireCount || 0}

Please provide:
1. Overview of the drawing's purpose
2. Key components and their functions
3. Important connections and signal paths
4. Potential issues or points of attention
5. Related drawings that might be useful`
    }
  ];

  return await chat({ messages, context });
}

/**
 * Trace a wire path using AI
 */
export async function traceWire(wireData: any): Promise<string> {
  const context = {
    type: 'wire_trace',
    wire: wireData
  };

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Help me trace this wire:

Wire Number: ${wireData.wireNo}
Signal: ${wireData.signalName || 'Unknown'}
Voltage: ${wireData.voltageClass || 'Unknown'}
Source: ${wireData.sourceConnector || 'Unknown'} - ${wireData.sourcePin || ''}
Destination: ${wireData.destConnector || 'Unknown'} - ${wireData.destPin || ''}

Please provide:
1. Complete wire path from source to destination
2. Signal type and purpose
3. Voltage and current specifications
4. Related wires in the same circuit
5. Troubleshooting tips for this wire`
    }
  ];

  return await chat({ messages, context });
}

/**
 * Get troubleshooting help using AI
 */
export async function getTroubleshootingHelp(problem: string, context?: any): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `I'm experiencing this issue with the VCC system:

${problem}

${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

Please provide:
1. Possible causes of this issue
2. Step-by-step diagnostic procedure
3. Recommended tests and measurements
4. Potential solutions
5. Related documentation or drawings to check`
    }
  ];

  return await chat({ messages, context: { type: 'troubleshooting', problem, ...context } });
}

/**
 * Explain a VCC concept using AI
 */
export async function explainConcept(concept: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Explain this VCC concept in detail:

${concept}

Please provide:
1. Clear definition
2. How it works in the VCC system
3. Related components and systems
4. Practical examples
5. Common issues and solutions`
    }
  ];

  return await chat({ messages });
}

/**
 * Build system context for AI
 */
function buildSystemContext(context: any): string {
  let contextStr = 'Current context:\n';

  if (context.type) {
    contextStr += `Task: ${context.type}\n`;
  }

  if (context.drawing) {
    contextStr += `\nDrawing Information:\n`;
    contextStr += `- Number: ${context.drawing.drawingNo}\n`;
    contextStr += `- Title: ${context.drawing.title}\n`;
    contextStr += `- System: ${context.drawing.systemName || 'Unknown'}\n`;
  }

  if (context.wire) {
    contextStr += `\nWire Information:\n`;
    contextStr += `- Number: ${context.wire.wireNo}\n`;
    contextStr += `- Signal: ${context.wire.signalName || 'Unknown'}\n`;
    contextStr += `- Voltage: ${context.wire.voltageClass || 'Unknown'}\n`;
  }

  if (context.connector) {
    contextStr += `\nConnector Information:\n`;
    contextStr += `- Code: ${context.connector.connectorCode}\n`;
    contextStr += `- Type: ${context.connector.connectorType || 'Unknown'}\n`;
    contextStr += `- Pins: ${context.connector.pinCount || 0}\n`;
  }

  return contextStr;
}

/**
 * Check if OpenAI is configured
 */
export function isConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
}

/**
 * Get available models
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const models = await openai.models.list();
    return models.data
      .filter(m => m.id.includes('gpt'))
      .map(m => m.id)
      .sort();
  } catch (error) {
    console.error('Error fetching models:', error);
    return ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
  }
}
