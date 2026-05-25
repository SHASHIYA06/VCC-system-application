/**
 * LangFlow Client Integration
 * Provides connection to LangFlow RAG workflows
 */

export interface LangFlowConfig {
  baseUrl: string;
  flowId: string;
  applicationToken?: string;
}

export class LangFlowClient {
  private config: LangFlowConfig;

  constructor(config?: Partial<LangFlowConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.LANGFLOW_BASE_URL || 'http://localhost:7860',
      flowId: config?.flowId || process.env.LANGFLOW_FLOW_ID || '',
      applicationToken: config?.applicationToken || process.env.LANGFLOW_API_TOKEN,
    };
  }

  /**
   * Run a LangFlow query
   */
  async query(inputValue: string, inputType: string = 'chat', outputType: string = 'chat'): Promise<string> {
    if (!this.config.flowId) {
      console.warn('LangFlow Flow ID not configured');
      return '';
    }

    try {
      const url = `${this.config.baseUrl}/api/v1/run/${this.config.flowId}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.applicationToken) {
        headers['Authorization'] = `Bearer ${this.config.applicationToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          input_value: inputValue,
          input_type: inputType,
          output_type: outputType,
          tweaks: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`LangFlow API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the result from the LangFlow standard output format
      if (data.outputs && data.outputs.length > 0 && data.outputs[0].outputs && data.outputs[0].outputs.length > 0) {
        const result = data.outputs[0].outputs[0].results?.message?.text || data.outputs[0].outputs[0].results?.text;
        return result || JSON.stringify(data);
      }
      
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error calling LangFlow:', error);
      throw error;
    }
  }
}

export const langFlowClient = new LangFlowClient();
export default langFlowClient;
