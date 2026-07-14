'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Layers, GitBranch, Activity, Zap, Database,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Loader2,
  Settings, Monitor, Cpu, HardDrive, BarChart3, RefreshCw,
  Plug, Cable, Wifi, Search
} from 'lucide-react';
import { Card3D } from '@/components/ui/Card3D';
import { GlassPanel } from '@/components/ui/GlassPanel';

interface GSDNode {
  id: string;
  label: string;
  type: 'equipment' | 'connector' | 'device' | 'junction' | 'system';
  system: string;
  position: { x: number; y: number };
  metadata: Record<string, unknown>;
  color?: string;
  icon?: string;
}

interface GSDEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'power' | 'signal' | 'communication' | 'ground' | 'connection';
  wireNo?: string;
  metadata: Record<string, unknown>;
  color?: string;
  animated?: boolean;
}

interface GSDSystem {
  code: string;
  name: string;
  devices: number;
  connections: number;
  color: string;
}

interface GSDTopology {
  nodes: GSDNode[];
  edges: GSDEdge[];
  systems: GSDSystem[];
  statistics: {
    totalDevices: number;
    totalConnections: number;
    totalWires: number;
    systemCount: number;
    connectorCount: number;
  };
}

const SYSTEM_COLORS: Record<string, string> = {
  TRAC: '#f97316', BRAKE: '#ef4444', DOOR: '#f59e0b', VAC: '#06b6d4',
  APS: '#10b981', TMS: '#a855f7', COMMS: '#34d399', CAB: '#6366f1',
  HV: '#f43f5e', GEN: '#6b7280', TRL: '#3b82f6',
};

export default function GSDPiVisualization() {
  const [gsdData, setGsdData] = useState<GSDTopology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GSDNode | null>(null);
  const [viewMode, setViewMode] = useState<'topology' | 'hierarchy' | 'status'>('topology');
  const [isDemo, setIsDemo] = useState(false);

  const loadGSDData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gsd?action=topology');
      const json = await response.json();

      if (json.success && json.data) {
        setGsdData(json.data);
        setIsDemo(json.metadata?.isDemo || false);
      } else {
        setError(json.message || 'Failed to load GSD topology');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGSDData();
  }, [loadGSDData]);

  const getStatusColor = (nodeType: string) => {
    switch (nodeType) {
      case 'device': return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
      case 'connector': return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'system': return 'text-purple-400 bg-purple-500/20 border-purple-400/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'device': return <Cpu className="h-5 w-5" />;
      case 'connector': return <Plug className="h-5 w-5" />;
      case 'system': return <Layers className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  const getEdgeTypeColor = (type: string) => {
    switch (type) {
      case 'power': return 'bg-red-500';
      case 'signal': return 'bg-blue-500';
      case 'communication': return 'bg-green-500';
      case 'ground': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center glass-card-premium rounded-5xl border border-glass-border">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-sm font-mono uppercase tracking-wider">Loading GSD Topology from database...</p>
        </div>
      </div>
    );
  }

  if (error && !gsdData) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center glass-card-premium rounded-5xl border border-glass-border">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-white/80 text-lg font-bold">GSD Topology Unavailable</p>
          <p className="text-white/60 text-sm mt-2">{error}</p>
          <button
            onClick={loadGSDData}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassPanel
        title="GSD Topology Explorer"
        subtitle={`${gsdData?.nodes.length || 0} nodes · ${gsdData?.edges.length || 0} edges · ${gsdData?.systems.length || 0} systems`}
        icon={<Network className="h-5 w-5" />}
        variant="elevated"
        glow={true}
        glowColor="cyan"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex glass-card-premium backdrop-blur-4xl p-1 rounded-2xl border border-glass-border">
            {[
              { mode: 'topology', label: 'Topology', icon: Network },
              { mode: 'hierarchy', label: 'Hierarchy', icon: GitBranch },
              { mode: 'status', label: 'Status', icon: Activity },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as typeof viewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-mono transition-all ${viewMode === mode
                    ? 'bg-gradient-accent text-white shadow-glow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadGSDData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card-premium border border-glass-border">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-white font-mono">Live DB</span>
            </div>
            {isDemo && (
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                DEMO DATA
              </span>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {viewMode === 'topology' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gsdData?.nodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card3D
                        interactive={true}
                        glowColor={node.type === 'device' ? 'blue' : node.type === 'connector' ? 'green' : 'cyan'}
                        className="p-5 cursor-pointer"
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-xl ${getStatusColor(node.type)}`}>
                              {getTypeIcon(node.type)}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-800/50 rounded">
                              {node.type}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white font-mono text-sm uppercase tracking-wider">
                              {node.label}
                            </h3>
                            <p className="text-white/60 text-xs font-mono mt-1">
                              System: {node.system}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: SYSTEM_COLORS[node.system] || '#6b7280' }}
                            />
                            <span className="text-xs text-white/50 font-mono">{node.system}</span>
                          </div>
                        </div>
                      </Card3D>
                    </motion.div>
                  ))}

                  {(!gsdData?.nodes || gsdData.nodes.length === 0) && (
                    <div className="col-span-full text-center py-16">
                      <Database className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No topology nodes found in database</p>
                      <p className="text-slate-500 text-sm mt-1">Run seed scripts to populate device and connector data</p>
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'hierarchy' && (
                <div className="space-y-4">
                  {gsdData?.systems.map((sys) => (
                    <Card3D key={sys.code} className="p-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: sys.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-white font-mono uppercase">{sys.code}</h3>
                            <span className="text-white/60 text-sm">{sys.name}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>{sys.devices} devices</span>
                            <span>{sys.connections} connections</span>
                          </div>
                        </div>
                      </div>
                    </Card3D>
                  ))}
                </div>
              )}

              {viewMode === 'status' && (
                <Card3D className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-cyan-400" />
                      System Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 text-center">
                        <div className="text-2xl font-bold text-cyan-400 font-mono">{gsdData?.statistics.totalDevices || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Devices</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 text-center">
                        <div className="text-2xl font-bold text-green-400 font-mono">{gsdData?.statistics.connectorCount || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Connectors</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 text-center">
                        <div className="text-2xl font-bold text-blue-400 font-mono">{gsdData?.statistics.totalWires || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Wires</div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 text-center">
                        <div className="text-2xl font-bold text-purple-400 font-mono">{gsdData?.statistics.systemCount || 0}</div>
                        <div className="text-xs text-slate-500 mt-1">Systems</div>
                      </div>
                    </div>
                  </div>
                </Card3D>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card3D className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white font-mono uppercase">{selectedNode.label}</h3>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Type</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(selectedNode.type)}`}>
                          {selectedNode.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">System</span>
                        <span className="text-white font-mono font-bold">{selectedNode.system}</span>
                      </div>

                      {Object.entries(selectedNode.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-white/60 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-white font-mono text-sm">{String(value)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <div className="text-xs text-white/50 mb-2">Connected edges:</div>
                      <div className="space-y-1.5">
                        {gsdData?.edges
                          .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                          .slice(0, 10)
                          .map((edge) => (
                            <div key={edge.id} className="flex items-center gap-2 text-xs text-slate-400">
                              <div className={`w-2 h-2 rounded-full ${getEdgeTypeColor(edge.type)}`} />
                              <span className="font-mono">{edge.label}</span>
                              <span className="text-slate-600">({edge.type})</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card-premium rounded-5xl border border-glass-border p-12 text-center"
              >
                <Monitor className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/50 font-mono text-sm">Click a node to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
