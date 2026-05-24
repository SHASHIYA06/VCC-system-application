'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card3D, GlassButton, GlassPanel } from '@/components/ui';
import { Network, Cpu, Cable, Box, Zap, ArrowRight, RefreshCw, Activity, Layers, Link2, Settings, FileText } from 'lucide-react';

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
      
      if (response.ok && data.metadata) {
        setGsdData(data);
      } else {
        console.error('GSD API error:', data.error);
        // Set default data if API fails
        setGsdData({
          metadata: {
            totalSystems: 0,
            totalDrawings: 0,
            totalDevices: 0,
            totalConnectors: 0,
            totalWires: 0,
            totalTrainLines: 0,
          },
          systems: [],
          network: { nodes: [], edges: [] },
          topology: [],
        });
      }
    } catch (error) {
      console.error('GSD fetch error:', error);
      // Set default data on error
      setGsdData({
        metadata: {
          totalSystems: 0,
          totalDrawings: 0,
          totalDevices: 0,
          totalConnectors: 0,
          totalWires: 0,
          totalTrainLines: 0,
        },
        systems: [],
        network: { nodes: [], edges: [] },
        topology: [],
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400 text-lg">Loading Global System Diagram...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 gradient-text-animated">
          Global System Diagram
        </h1>
        <p className="text-slate-400 text-lg">Complete VCC system architecture and interconnections</p>
      </motion.div>

      {/* Metadata Stats - Using StatCard Components */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <Link href="/systems">
          <GlassPanel
            title="Systems"
            subtitle="Core systems"
            icon={<Layers className="h-6 w-6" />}
            variant="elevated"
            glow={true}
            glowColor="purple"
          >
            <div className="text-4xl font-bold text-white">{gsdData?.metadata.totalSystems || 0}</div>
          </GlassPanel>
        </Link>
        <Link href="/drawings">
          <GlassPanel
            title="Drawings"
            subtitle="Schematics"
            icon={<FileText className="h-6 w-6" />}
            variant="elevated"
            glow={true}
            glowColor="blue"
          >
            <div className="text-4xl font-bold text-white">{gsdData?.metadata.totalDrawings || 0}</div>
          </GlassPanel>
        </Link>
        <Link href="/equipment">
          <GlassPanel
            title="Devices"
            subtitle="Equipment"
            icon={<Settings className="h-6 w-6" />}
            variant="elevated"
            glow={true}
            glowColor="purple"
          >
            <div className="text-4xl font-bold text-white">{gsdData?.metadata.totalDevices || 0}</div>
          </GlassPanel>
        </Link>
        <Link href="/connectors">
          <GlassPanel
            title="Connectors"
            subtitle="Connection points"
            icon={<Link2 className="h-6 w-6" />}
            variant="elevated"
            glow={true}
            glowColor="cyan"
          >
            <div className="text-4xl font-bold text-white">{gsdData?.metadata.totalConnectors || 0}</div>
          </GlassPanel>
        </Link>
        <Link href="/wires">
          <GlassPanel
            title="Wires"
            subtitle="Total connections"
            icon={<Cable className="h-6 w-6" />}
            variant="elevated"
            glow={true}
            glowColor="green"
          >
            <div className="text-4xl font-bold text-white">{gsdData?.metadata.totalWires || 0}</div>
          </GlassPanel>
        </Link>
        <Link href="/trainlines">
          <GlassPanel
            title="Trainlines"
            subtitle="Circuit groups"
            icon={<Activity className="h-6 w-6" />}
            variant="elevated"
            glow={true}
            glowColor="orange"
          >
            <div className="text-4xl font-bold text-white">{gsdData?.metadata.totalTrainLines || 0}</div>
          </GlassPanel>
        </Link>
      </motion.div>

      {/* System Topology */}
      <GlassPanel
        title="System Topology"
        subtitle="Layered architecture view"
        icon={<Zap className="h-5 w-5" />}
        variant="elevated"
        glow={true}
        glowColor="cyan"
      >
        <div className="space-y-4">
          {gsdData?.topology.map((layer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-4"
            >
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
            </motion.div>
          ))}
        </div>
      </GlassPanel>

      {/* Systems Overview */}
      <GlassPanel
        title="Systems Overview"
        subtitle="Complete system inventory"
        icon={<Cpu className="h-5 w-5" />}
        variant="elevated"
        glow={true}
        glowColor="purple"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gsdData?.systems.map((system, idx) => (
            <Card3D
              key={system.code}
              glowColor="blue"
              variant="elevated"
              className="cursor-pointer"
              onClick={() => setSelectedSystem(selectedSystem === system.code ? null : system.code)}
            >
              <div className="p-4">
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
            </Card3D>
          ))}
        </div>
      </GlassPanel>

      {/* Network Connections */}
      <GlassPanel
        title="Network Connections"
        subtitle="System interconnections"
        icon={<Cable className="h-5 w-5" />}
        variant="elevated"
        glow={true}
        glowColor="green"
      >
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
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg"
                >
                  <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono font-semibold">
                    {edge.from}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded text-xs font-mono font-semibold">
                    {edge.to}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{edge.label}</span>
                </motion.div>
              ))}
              {gsdData?.network.edges.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No network connections available
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}