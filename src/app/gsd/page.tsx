'use client';

import React, { useState, useEffect } from 'react';
import { GSDViewer } from '@/components/gsd/GSDViewer';
import { SystemNode, SystemEdge, SystemTopology } from '@/lib/gsd/topology';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

export default function GSDPage() {
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [topology, setTopology] = useState<SystemTopology | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SystemEdge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SystemNode[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch systems for dropdown
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/gsd?action=topology');
        if (!response.ok) throw new Error(`Topology request failed with status ${response.status}`);
        const data = await response.json();

        if (data.success && data.data?.systems?.length > 0) {
          setTopology(data.data);
          setLoading(false);
          return;
        }

        // Degraded mode: still show the system list so the page isn't blank.
        // This branch used to test `systemsData.length` against /api/systems'
        // response, but that endpoint returns `{ systems, count }` — an object —
        // so `undefined > 0` was always false and the fallback never ran. Worse,
        // the line after it called `.map` on that object and would have thrown.
        const systemsResponse = await fetch('/api/systems');
        if (!systemsResponse.ok) {
          throw new Error(data?.error || 'Topology unavailable and system list could not be loaded');
        }
        const systemsData = await systemsResponse.json();
        const systemList: any[] = Array.isArray(systemsData)
          ? systemsData
          : systemsData.systems ?? [];

        if (systemList.length === 0) {
          throw new Error(data?.error || 'No topology or systems returned');
        }

        setError(
          'Topology graph unavailable — showing the system list only. No wiring graph could be built.',
        );
        setTopology({
          nodes: [],
          edges: [],
          systems: systemList.map((s: any) => ({
            code: s.code,
            name: s.name,
            devices: s.deviceCount ?? 0,
            connections: s.drawingCount ?? 0,
            color: '#3b82f6',
          })),
          statistics: {
            totalDevices: 0,
            totalConnections: 0,
            totalWires: 0,
            systemCount: systemList.length,
            connectorCount: 0,
            devicesBySystem: {},
            connectionsByType: {},
          },
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topology:', err);
        setError(err instanceof Error ? err.message : 'Failed to load GSD topology');
        setTopology(null);
        setLoading(false);
      }
    };

    fetchSystems();
  }, [reloadKey]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError(null);
      const params = new URLSearchParams();
      // `action=search` is required. Without it the route defaults to
      // 'topology', discarded the `search` param entirely and returned the full
      // graph — and the result was then only console.logged, so searching did
      // nothing observable at all.
      params.append('action', 'search');
      params.append('search', searchQuery);
      if (selectedSystem) params.append('system', selectedSystem);

      const response = await fetch(`/api/gsd?${params.toString()}`);
      if (!response.ok) throw new Error(`Search failed with status ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Search failed');

      setSearchResults(data.data?.nodes ?? []);
    } catch (err) {
      console.error('Error searching:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  };

  const handleExport = () => {
    if (!topology) return;

    const dataStr = JSON.stringify(topology, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gsd-topology-${selectedSystem || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            GSD - General System Diagram
          </h1>
          <p className="text-slate-400">Interactive system topology visualization</p>
        </div>

        {/* Error state. The page previously had no error variable and no error
            UI at all: a 500 left `topology` null and the panels quietly showed
            four zeros with an empty system dropdown. */}
        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <span className="text-sm text-amber-300">{error}</span>
            <button
              type="button"
              onClick={() => setReloadKey(k => k + 1)}
              className="cursor-pointer rounded-md border border-amber-400/60 px-3 py-1.5 text-sm font-medium text-amber-200 transition-colors duration-200 hover:bg-amber-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* System Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">System</label>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="">All Systems</option>
              {topology?.systems.map((sys) => (
                <option key={sys.code} value={sys.code}>
                  {sys.name} ({sys.code})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devices, wires, connectors..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                aria-label="Search topology"
                className="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>
              {searchResults !== null && (
                <button
                  type="button"
                  onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                  className="cursor-pointer rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Actions */}
          <div className="lg:col-span-1 flex gap-2 items-end">
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-slate-800 border border-cyan-500/30 text-slate-300 rounded-lg hover:bg-slate-700 hover:border-cyan-500 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-800 border border-cyan-500/30 text-slate-300 rounded-lg hover:bg-slate-700 hover:border-cyan-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden h-[600px]">
              <GSDViewer
                system={selectedSystem}
                onNodeClick={setSelectedNode}
                onEdgeClick={setSelectedEdge}
                interactive={true}
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search results. These were fetched and then only console.logged,
                so searching produced no visible outcome. */}
            {searchResults !== null && (
              <div className="rounded-lg border border-cyan-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h3 className="mb-3 text-lg font-semibold text-cyan-400">
                  Search Results{' '}
                  <span className="text-sm font-normal text-slate-400 tabular-nums">
                    ({searchResults.length})
                  </span>
                </h3>
                {searchResults.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nothing in the topology matches “{searchQuery}”.
                  </p>
                ) : (
                  <ul className="max-h-72 space-y-1 overflow-y-auto">
                    {searchResults.map(node => (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedNode(node)}
                          className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left transition-colors duration-200 hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                        >
                          <span className="block truncate font-mono text-sm text-slate-200">
                            {node.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {node.type} · {node.system}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Devices</span>
                  <span className="text-cyan-400 font-semibold">{topology?.statistics.totalDevices || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Connections</span>
                  <span className="text-cyan-400 font-semibold">{topology?.statistics.totalConnections || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Wires</span>
                  <span className="text-cyan-400 font-semibold">{topology?.statistics.totalWires || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Connectors</span>
                  <span className="text-cyan-400 font-semibold tabular-nums">
                    {topology?.statistics.connectorCount?.toLocaleString() ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Systems</span>
                  <span className="text-cyan-400 font-semibold tabular-nums">{topology?.statistics.systemCount ?? '—'}</span>
                </div>
              </div>
              {/* These are whole-database totals. The rendered graph is a bounded
                  sample, so the two numbers are deliberately distinguished
                  instead of implying the canvas shows everything. */}
              {topology && (
                <p className="mt-4 border-t border-slate-700/60 pt-3 text-xs leading-relaxed text-slate-500">
                  Totals cover the full database. The diagram shows a sample of{' '}
                  <span className="tabular-nums text-slate-400">{topology.nodes.length}</span>{' '}
                  nodes and{' '}
                  <span className="tabular-nums text-slate-400">{topology.edges.length}</span>{' '}
                  connections, kept small enough to stay readable.
                </p>
              )}
            </div>

            {/* Selected Node */}
            {selectedNode && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Selected Node</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400">Label</p>
                    <p className="text-slate-200 font-semibold">{selectedNode.label}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Type</p>
                    <p className="text-slate-200 font-semibold capitalize">{selectedNode.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">System</p>
                    <p className="text-slate-200 font-semibold">{selectedNode.system}</p>
                  </div>
                  {selectedNode.metadata && Object.entries(selectedNode.metadata).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-slate-400 capitalize">{key}</p>
                      <p className="text-slate-200 font-semibold text-xs break-words">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Edge */}
            {selectedEdge && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Selected Connection</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400">Wire</p>
                    <p className="text-slate-200 font-semibold">{selectedEdge.label}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Type</p>
                    <p className="text-slate-200 font-semibold capitalize">{selectedEdge.type}</p>
                  </div>
                  {selectedEdge.wireNo && (
                    <div>
                      <p className="text-slate-400">Wire No</p>
                      <p className="text-slate-200 font-semibold">{selectedEdge.wireNo}</p>
                    </div>
                  )}
                  {selectedEdge.metadata && Object.entries(selectedEdge.metadata).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-slate-400 capitalize">{key}</p>
                      <p className="text-slate-200 font-semibold text-xs break-words">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Systems List */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Systems</h3>
              <div className="space-y-2">
                {topology?.systems.map((sys) => (
                  <button
                    key={sys.code}
                    onClick={() => setSelectedSystem(sys.code)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedSystem === sys.code
                        ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                        : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <p className="font-semibold">{sys.code}</p>
                    <p className="text-xs text-slate-400">{sys.devices} devices</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
