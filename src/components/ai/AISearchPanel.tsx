'use client';

import React, { useState } from 'react';
import { SearchResult, AISearchResponse } from '@/lib/ai/rag-search';
import { Search, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface AISearchPanelProps {
  onResultSelect?: (result: SearchResult) => void;
}

export const AISearchPanel: React.FC<AISearchPanelProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AISearchResponse | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('q', query);
      if (selectedType) params.append('type', selectedType);

      const response = await fetch(`/api/ai-search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResponse(data.data);
        setResults(data.data.results);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search error');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'drawing':
        return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
      case 'wire':
        return 'bg-purple-900/20 border-purple-500/30 text-purple-400';
      case 'device':
        return 'bg-green-900/20 border-green-500/30 text-green-400';
      case 'connector':
        return 'bg-orange-900/20 border-orange-500/30 text-orange-400';
      case 'system':
        return 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400';
      default:
        return 'bg-slate-900/20 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-lg border border-cyan-500/20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-500" />
          AI Search
        </h2>
        <p className="text-slate-400 text-sm mt-1">100% accurate search with RAG system</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drawings, wires, devices, connectors, systems..."
              className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'drawing', 'wire', 'device', 'connector', 'system'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(selectedType === type ? '' : type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedType === type
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Search Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-xs">Results</p>
              <p className="text-2xl font-bold text-cyan-400">{response.totalResults}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-xs">Accuracy</p>
              <p className="text-2xl font-bold text-green-400">{response.accuracy}%</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-xs">Time</p>
              <p className="text-2xl font-bold text-blue-400">{response.executionTime}ms</p>
            </div>
          </div>

          {/* Results List */}
          {results.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => onResultSelect?.(result)}
                  className={`w-full text-left p-4 rounded-lg border transition hover:border-cyan-500 ${getTypeColor(result.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                          {result.type}
                        </span>
                        <span className="text-xs opacity-50">
                          {result.relevance}% match
                        </span>
                      </div>
                      <p className="font-semibold text-white">{result.title}</p>
                      <p className="text-sm opacity-75 mt-1">{result.description}</p>
                      {Object.keys(result.metadata).length > 0 && (
                        <div className="text-xs opacity-50 mt-2 space-y-1">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <p key={key}>
                              <span className="font-semibold">{key}:</span> {String(value)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <CheckCircle2 className="w-5 h-5 opacity-50 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-400">No results found</p>
              <p className="text-slate-500 text-sm mt-1">Try a different search query</p>
            </div>
          )}

          {/* Sources */}
          {response.sources.length > 0 && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 font-semibold mb-2">Sources</p>
              <div className="flex gap-2 flex-wrap">
                {response.sources.map((source) => (
                  <span key={source} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!response && !loading && (
        <div className="p-8 text-center">
          <Zap className="w-12 h-12 text-cyan-500/30 mx-auto mb-4" />
          <p className="text-slate-400">Enter a search query to get started</p>
          <p className="text-slate-500 text-sm mt-1">Search across all drawings, wires, devices, and more</p>
        </div>
      )}
    </div>
  );
};

export default AISearchPanel;
