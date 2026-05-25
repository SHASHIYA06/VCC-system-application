'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, Loader2, MessageSquare, Lightbulb, AlertTriangle, BookOpen, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';

interface APIStatus {
  name: string;
  version: string;
  availableProviders: string[];
  configuredProviders: { name: string; defaultModel: string }[];
  database: Record<string, string>;
  status: 'loading' | 'connected' | 'error';
  error?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ type: string; label: string }>;
}

const SUGGESTED_QUERIES = [
  'Explain the traction system wiring for wire 3001',
  'Find all connectors related to brake system',
  'What are the trainlines for door control?',
  'Show me the TCMS RIO pin assignments',
  'Explain the emergency brake circuit',
  'List all drawings for the APS system',
];

export default function AIAssistantPage() {
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    name: 'VCC AI',
    version: '1.0.0',
    availableProviders: [],
    configuredProviders: [],
    database: {},
    status: 'loading',
  });
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `## VCC Personal AI Assistant

I can help you with:

- **Expert Analysis**: Detailed circuit and system explanations
- **Troubleshooting**: Identify issues and suggest solutions  
- **Training**: Learn about VCC systems and wiring
- **Documentation**: Generate technical references

Ask me anything about the VCC system, or choose from the suggestions below.`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'expert' | 'all' | 'langflow'>('expert');

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch('/api/ai-assistant');
        const data = await response.json();
        setApiStatus({
          ...data,
          status: 'connected',
        });
      } catch (error) {
        setApiStatus(prev => ({
          ...prev,
          status: 'error',
          error: 'Failed to connect to API',
        }));
      }
    }
    checkStatus();
  }, []);

  async function sendMessage() {
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, mode }),
      });

      const data = await response.json();

      console.log('AI Response:', data);

      if (data.success && data.response) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            sources: data.sources,
          },
        ]);
      } else {
        const errorMsg = data.error || data.fallback || 'Unknown error';
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I encountered an issue: ${errorMsg}\n\n**Troubleshooting:**\n- Check API keys are configured in .env.local\n- Try a simpler query like "list connectors" or "show wire 3003"`,
          },
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered a connection error. Please check if the server is running and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Bot className="h-8 w-8 text-cyan-400" />
          Personal AI Infrastructure
        </h1>
        <p className="mt-2 text-slate-400">
          AI-powered VCC expert system with multi-model support
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Mode:</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'expert' | 'all' | 'langflow')}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
          >
            <option value="expert">Expert Mode</option>
            <option value="all">Full Analysis</option>
            <option value="langflow">LangFlow RAG</option>
          </select>
        </div>
        
        {/* API Status Display */}
        <div className="flex items-center gap-2 text-xs">
          {apiStatus.status === 'loading' ? (
            <span className="flex items-center gap-1 text-slate-500">
              <RefreshCw className="h-3 w-3 animate-spin" /> Checking API...
            </span>
          ) : apiStatus.status === 'connected' ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle className="h-3 w-3" />
              API Connected ({apiStatus.configuredProviders?.length || 0} providers)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <XCircle className="h-3 w-3" /> API Error
            </span>
          )}
        </div>
        
        {apiStatus.configuredProviders && apiStatus.configuredProviders.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Providers: {apiStatus.configuredProviders.map(p => p.name).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <GlassPanel className="mb-6 glow-cyan">
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-cyan-600' : 'bg-purple-600'
              }`}>
                {msg.role === 'user' ? (
                  <span className="text-white text-sm">U</span>
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div className={`flex-1 p-4 rounded-lg ${
                msg.role === 'user' ? 'bg-cyan-600/20' : 'bg-slate-800/50'
              }`}>
                <div className="prose prose-invert max-w-none text-sm">
                  {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={i} className="text-cyan-400 font-semibold mt-4 mb-2">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('## ')) {
                      return <h3 key={i} className="text-white font-bold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="text-slate-300 ml-4">{line.replace('- ', '')}</li>;
                    }
                    if (line.startsWith('**')) {
                      return <p key={i} className="text-cyan-300 font-medium">{line}</p>;
                    }
                    return <p key={i} className="text-slate-300">{line || <br />}</p>;
                  })}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-xs text-slate-500 mb-2">Sources:</div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded text-xs ${
                            src.type === 'wire' ? 'bg-cyan-500/20 text-cyan-400' :
                            src.type === 'drawing' ? 'bg-purple-500/20 text-purple-400' :
                            src.type === 'connector' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {src.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about VCC system..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Suggested Queries */}
      <GlassPanel className="p-4 glow-purple">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Suggested Questions
        </h3>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(q); }}
              className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm text-left transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}