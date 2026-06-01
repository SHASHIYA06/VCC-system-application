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

  // Fetch systems for dropdown
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await fetch('/api/gsd');
        const data = await response.json();
        if (data.success && data.data.systems.length > 0) {
          setTopology(data.data);
        }
      } catch (error) {
        console.error('Error fetching systems:', error);
      }
    };

    fetchSystems();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('search', searchQuery);
      if (selectedSystem) params.append('system', selectedSystem);

      const response = await fetch(`/api/gsd?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        console.log('Search results:', data.data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
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
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
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
                  <span className="text-slate-400">Systems</span>
                  <span className="text-cyan-400 font-semibold">{topology?.statistics.systemCount || 0}</span>
                </div>
              </div>
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
                  {Object.entries(selectedNode.metadata).map(([key, value]) => (
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
                  {Object.entries(selectedEdge.metadata).map(([key, value]) => (
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
