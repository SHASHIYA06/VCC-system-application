'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Network, Cpu, Cable, Box, Zap, ArrowRight, RefreshCw } from 'lucide-react';

interface GSDData {
  metadata: {
    totalSystems: number;
    totalDrawings: number;
    totalDevices: number;
    totalConnectors: number;
    totalWires: number;
    totalTrainLines: number;
  };
  systems: Array<{
    code: string;
    name: string;
    category: string;
    drawings: number;
    devices: number;
    connections: string[];
  }>;
  network: {
    nodes: Array<{ id: string; label: string; type: string; connections: number }>;
    edges: Array<{ from: string; to: string; label: string; type: string }>;
  };
  topology: Array<{
    name: string;
    systems: Array<{ code: string; name: string }>;
  }>;
}

const SYSTEM_COLORS: Record<string, string> = {
  GEN: 'bg-slate-500',
  TRL: 'bg-blue-500',
  TRAC: 'bg-orange-500',
  BRAKE: 'bg-red-500',
  TMS: 'bg-purple-500',
  DOOR: 'bg-amber-500',
  VAC: 'bg-cyan-500',
  APS: 'bg-green-500',
  CAB: 'bg-violet-500',
  COMMS: 'bg-pink-500',
  HV: 'bg-red-600',
  LTEB: 'bg-yellow-500',
  EDB: 'bg-teal-500',
};

export default function GSDPage() {
  const [gsdData, setGsdData] = useState<GSDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  useEffect(() => {
    fetchGSD();
  }, []);

  async function fetchGSD() {
    try {
      setLoading(true);
      const response = await fetch('/api/gsd');
      const data = await response.json();
      setGsdData(data);
    } catch (error) {
      console.error('GSD fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Network className="h-8 w-8 text-cyan-400" />
          Global System Diagram (GSD)
        </h1>
        <p className="mt-2 text-slate-400">
          Complete VCC system architecture and interconnections
        </p>
      </div>

      {/* Metadata Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{gsdData?.metadata.totalSystems}</div>
          <div className="text-sm text-slate-400">Systems</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{gsdData?.metadata.totalDrawings}</div>
          <div className="text-sm text-slate-400">Drawings</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{gsdData?.metadata.totalDevices}</div>
          <div className="text-sm text-slate-400">Devices</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{gsdData?.metadata.totalConnectors}</div>
          <div className="text-sm text-slate-400">Connectors</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{gsdData?.metadata.totalWires}</div>
          <div className="text-sm text-slate-400">Wires</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{gsdData?.metadata.totalTrainLines}</div>
          <div className="text-sm text-slate-400">TrainLines</div>
        </div>
      </div>

      {/* System Layers Topology */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-cyan-400" />
          System Topology
        </h2>
        <div className="space-y-4">
          {gsdData?.topology.map((layer, idx) => (
            <div key={idx} className="glass-card p-4">
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">{layer.name} Layer</h3>
              <div className="flex flex-wrap gap-2">
                {layer.systems.map(sys => (
                  <Link
                    key={sys.code}
                    href={`/systems/${sys.code}`}
                    className={`px-4 py-2 rounded-lg text-white font-medium ${SYSTEM_COLORS[sys.code] || 'bg-slate-600'} hover:opacity-80 transition-opacity`}
                  >
                    {sys.code} - {sys.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Systems Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          Systems Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gsdData?.systems.map(system => (
            <div
              key={system.code}
              className={`glass-card p-4 cursor-pointer transition-all ${
                selectedSystem === system.code ? 'ring-2 ring-cyan-400' : ''
              }`}
              onClick={() => setSelectedSystem(selectedSystem === system.code ? null : system.code)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${SYSTEM_COLORS[system.code] || 'bg-slate-600'} text-white`}>
                  {system.code}
                </span>
                <span className="text-xs text-slate-500">{system.category}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{system.name}</h3>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>{system.drawings} drawings</span>
                <span>{system.devices} devices</span>
              </div>
              {system.connections.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {system.connections.slice(0, 3).map((conn, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
                      {conn}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Network Graph Visualization */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Cable className="h-5 w-5 text-cyan-400" />
          Network Connections
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-400">Trainline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-400">Pin Connection</span>
              </div>
            </div>
            <div className="space-y-2">
              {gsdData?.network.edges.slice(0, 30).map((edge, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                    {edge.from}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                    {edge.to}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{edge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}