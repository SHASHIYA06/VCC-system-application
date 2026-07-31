/**
 * INTEGRATED AI ENGINE - Phase 3
 * Central hub for all AI capabilities with Claude + TinyFish integration
 */

import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIContext {
  userQuery: string;
  systemContext?: 'vcc' | 'diagnostics' | 'learning' | 'troubleshooting' | 'commissioning';
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  confidence: number;
  suggestions?: string[];
}

const RAILWAY_SYSTEM_PROMPT = `You are an expert Railway Vehicle Control System (VCC) engineer with 30+ years experience.
You have deep knowledge of train electrical systems, control systems, wiring and diagnostics.
Be precise and cite specific systems/devices when possible.`;

export async function generateAIResponse(context: AIContext): Promise<AIResponse> {
  const systemPrompt = RAILWAY_SYSTEM_PROMPT;
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: context.maxTokens || 1500,
    temperature: context.temperature || 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: context.userQuery,
      },
    ],
  });

  const textContent = response.content.find(c => c.type === 'text');
  const responseText = textContent && textContent.type === 'text' ? textContent.text : '';

  return {
    content: responseText,
    confidence: 0.85,
    suggestions: ['View related drawings', 'Trace wire path', 'Check system topology'],
  };
}

export async function* streamAIResponse(
  context: AIContext
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = RAILWAY_SYSTEM_PROMPT;

  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: context.maxTokens || 1500,
    temperature: context.temperature || 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: context.userQuery,
      },
    ],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }
}
