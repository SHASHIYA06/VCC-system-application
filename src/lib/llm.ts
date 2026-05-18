export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  error?: string;
}

export interface LLMProvider {
  name: string;
  baseURL?: string;
  apiKey?: string;
  models: string[];
  defaultModel: string;
}

const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    name: 'openai',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
  },
  {
    name: 'anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-5-sonnet-20241022',
  },
  {
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    models: [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro-1.5',
      'meta-llama/llama-3-8b-instruct',
      'mistralai/mistral-7b-instruct',
      'deepseek/deepseek-chat',
    ],
    defaultModel: 'anthropic/claude-3.5-sonnet',
  },
  {
    name: 'nvidia',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    models: ['nvidia/llama-3.1-nemotron-70b-instruct', 'nvidia/phi-3-mini-128k-instruct'],
    defaultModel: 'nvidia/llama-3.1-nemotron-70b-instruct',
  },
  {
    name: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    defaultModel: 'gemini-1.5-flash',
  },
];

function getProviderConfig(providerName: string): LLMProvider | undefined {
  const envKey = providerName.toUpperCase() + '_API_KEY';
  const apiKey = process.env[envKey];
  
  const provider = DEFAULT_PROVIDERS.find(p => p.name === providerName);
  if (!provider) return undefined;
  
  const baseURLKey = providerName.toUpperCase() + '_BASE_URL';
  const baseURL = process.env[baseURLKey] || provider.baseURL;
  
  return {
    ...provider,
    baseURL,
    apiKey,
    models: provider.models,
  };
}

export async function callLLM(
  prompt: string,
  options: {
    provider?: string;
    model?: string;
    system?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<LLMResponse> {
  const { provider = 'openrouter', model, system, temperature = 0.3, maxTokens = 2048 } = options;
  
  const config = getProviderConfig(provider);
  if (!config) {
    return { content: '', model: provider, error: `Provider ${provider} not found` };
  }
  
  const selectedModel = model || config.defaultModel;
  
  if (!config.apiKey || config.apiKey === `YOUR_${provider.toUpperCase()}_KEY`) {
    return { content: '', model: selectedModel, error: `API key not configured for ${provider}` };
  }
  
  const messages: LLMMessage[] = [];
  if (system) {
    messages.push({ role: 'system', content: system });
  }
  messages.push({ role: 'user', content: prompt });
  
  try {
    if (provider === 'anthropic') {
      const response = await fetch(`${config.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages.filter(m => m.role !== 'system'),
          system: system,
          max_tokens: maxTokens,
          temperature,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        return { content: '', model: selectedModel, error: `API error: ${error}` };
      }
      
      const data = await response.json();
      return {
        content: data.content?.[0]?.text || '',
        model: selectedModel,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        finishReason: data.stop_reason,
      };
    }
    
    if (provider === 'gemini') {
      const response = await fetch(`${config.baseURL}/models/${selectedModel}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        return { content: '', model: selectedModel, error: `API error: ${error}` };
      }
      
      const data = await response.json();
      return {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        model: selectedModel,
      };
    }
    
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://vcc-system.app', 'X-Title': 'VCC System' } : {}),
        ...(provider === 'nvidia' ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { content: '', model: selectedModel, error: `API error: ${error}` };
    }
    
    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || selectedModel,
      usage: data.usage,
      finishReason: data.choices?.[0]?.finish_reason,
    };
  } catch (error) {
    return {
      content: '',
      model: selectedModel,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function callLLMWithFallback(
  prompt: string,
  options: {
    system?: string;
    temperature?: number;
    maxTokens?: number;
    preferredProviders?: string[];
  } = {}
): Promise<LLMResponse> {
  const providers = options.preferredProviders || ['openrouter', 'openai', 'anthropic', 'gemini', 'nvidia'];
  
  for (const provider of providers) {
    const result = await callLLM(prompt, { ...options, provider });
    if (!result.error && result.content) {
      return result;
    }
    console.warn(`LLM call failed for ${provider}:`, result.error);
  }
  
  return {
    content: '',
    model: 'none',
    error: 'All LLM providers failed',
  };
}

export function getAvailableProviders(): LLMProvider[] {
  return DEFAULT_PROVIDERS.filter(p => {
    const key = p.name.toUpperCase() + '_API_KEY';
    const apiKey = process.env[key];
    return apiKey && apiKey !== `YOUR_${p.name.toUpperCase()}_KEY`;
  });
}

export default {
  callLLM,
  callLLMWithFallback,
  getAvailableProviders,
  getProviderConfig,
};