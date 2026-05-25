/**
 * Google Stitch MCP Client
 * Integrates the configured MCP tool APIs for agent use
 */

import fs from 'fs';
import path from 'path';

export interface MCPConfig {
  mcpServers: {
    [key: string]: {
      serverUrl: string;
      headers?: Record<string, string>;
    }
  }
}

export class MCPClient {
  private config: MCPConfig | null = null;
  private isLoaded = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      // Look for mcp_config.json in the project root
      const configPath = path.join(process.cwd(), 'mcp_config.json');
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        this.config = JSON.parse(fileContent) as MCPConfig;
        this.isLoaded = true;
        console.log('✅ Loaded MCP config from mcp_config.json');
      }
    } catch (error) {
      console.error('❌ Failed to load mcp_config.json:', error);
    }
  }

  /**
   * Execute a tool call against the configured MCP server
   */
  async callTool(serverName: string, toolName: string, args: Record<string, any>): Promise<any> {
    if (!this.isLoaded || !this.config) {
      this.loadConfig(); // try again
      if (!this.isLoaded || !this.config) {
        throw new Error('MCP Configuration not loaded');
      }
    }

    const serverConfig = this.config.mcpServers[serverName];
    if (!serverConfig) {
      throw new Error(`MCP Server '${serverName}' not configured`);
    }

    // Call the server via REST (assuming standard MCP REST mapping)
    // The exact endpoint structure depends on the MCP server implementation.
    // Using standard mapping /tools/:toolName
    const url = `${serverConfig.serverUrl.replace(/\\/$/, '')}/tools/${toolName}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(serverConfig.headers || {}),
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`MCP Tool error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling MCP tool ${toolName} on server ${serverName}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if a specific server is configured
   */
  hasServer(serverName: string): boolean {
    return !!(this.config?.mcpServers?.[serverName]);
  }
}

export const mcpClient = new MCPClient();
export default mcpClient;
