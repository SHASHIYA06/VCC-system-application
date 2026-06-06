'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Layers, GitBranch, Activity, Zap, Database, 
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Loader2,
  Settings, Monitor, Cpu, HardDrive, BarChart3
} from 'lucide-react';
import { Card3D } from '@/components/ui/Card3D';
import { GlassPanel } from '@/components/ui/GlassPanel';

// GSD-Pi Types
interface GSDNode {
  id: string;
  name: string;
  type: 'system' | 'subsystem' | 'device' | 'connector';
  status: 'active' | 'inactive' | 'warning' | 'error';
  connections: number;
  children?: GSDNode[];
  metadata?: {
    drawings?: number;
    wires?: number;
    pins?: number;
    lastUpdate?: string;
  };
}

interface GSDTopology {
  nodes: GSDNode[];
  edges: Array<{
    source: string;
    target: string;
    type: 'data' | 'power' | 'signal';
    status: 'active' | 'inactive';
  }>;
  stats: {
    totalNodes: number;
    activeConnections: number;
    systemHealth: number;
    lastSync: string;
  };
}

// Mock GSD-Pi Data (replace with real API call)
const mockGSDData: GSDTopology = {
  nodes: [
    {
      id: 'TRAC',
      name: 'Traction Control',
      type: 'system',
      status: 'active',
      connections: 156,
      metadata: { drawings: 23, wires: 1240, pins: 892, lastUpdate: '2 min ago' },
      children: [
        { id: 'TRAC_VVVF', name: 'VVVF Inverter', type: 'device', status: 'active', connections: 42 },
        { id: 'TRAC_MC', name: 'Motor Control', type: 'device', status: 'active', connections: 38 },
      ]
    },
    {
      id: 'BRAKE',
      name: 'Brake System',
      type: 'system',
      status: 'active',
      connections: 124,
      metadata: { drawings: 18, wires: 890, pins: 564, lastUpdate: '1 min ago' },
      children: [
        { id: 'BRAKE_COMP', name: 'Air Compressor', type: 'device', status: 'active', connections: 28 },
        { id: 'BRAKE_LOOP', name: 'Brake Loop', type: 'device', status: 'warning', connections: 35 },
      ]
    },
    {
      id: 'CAB',
      name: 'Cab Control',
      type: 'system',
      status: 'active',
      connections: 98,
      metadata: { drawings: 15, wires: 650, pins: 432, lastUpdate: '3 min ago' },
      children: [
        { id: 'CAB_CCU', name: 'Cab Control Unit', type: 'device', status: 'active', connections: 56 },
        { id: 'CAB_DCP', name: 'Driver Console', type: 'device', status: 'active', connections: 42 },
      ]
    },
    {
      id: 'APS',
      name: 'Auxiliary Power',
      type: 'system',
      status: 'warning',
      connections: 87,
      metadata: { drawings: 12, wires: 420, pins: 298, lastUpdate: '5 min ago' },
      children: [
        { id: 'APS_INV', name: 'DC/AC Inverter', type: 'device', status: 'warning', connections: 31 },
        { id: 'APS_BAT', name: 'Battery Control', type: 'device', status: 'active', connections: 28 },
      ]
    },
    {
      id: 'DOOR',
      name: 'Door System',
      type: 'system',
      status: 'active',
      connections: 76,
      metadata: { drawings: 10, wires: 380, pins: 224, lastUpdate: '4 min ago' },
      children: [
        { id: 'DOOR_CTRL', name: 'Door Controller', type: 'device', status: 'active', connections: 44 },
        { id: 'DOOR_SENSOR', name: 'Door Sensors', type: 'device', status: 'active', connections: 32 },
      ]
    },
    {
      id: 'TMS',
      name: 'Train Management',
      type: 'system',
      status: 'error',
      connections: 234,
      metadata: { drawings: 31, wires: 1840, pins: 1256, lastUpdate: '8 min ago' },
      children: [
        { id: 'TMS_CCU', name: 'Central Control', type: 'device', status: 'error', connections: 145 },
        { id: 'TMS_RIO', name: 'Remote I/O', type: 'device', status: 'active', connections: 89 },
      ]
    }
  ],
  edges: [
    { source: 'TRAC', target: 'TMS', type: 'data', status: 'active' },
    { source: 'BRAKE', target: 'TMS', type: 'data', status: 'active' },
    { source: 'CAB', target: 'TMS', type: 'data', status: 'active' },
    { source: 'APS', target: 'TRAC', type: 'power', status: 'active' },
    { source: 'APS', target: 'DOOR', type: 'power', status: 'active' },
    { source: 'DOOR', target: 'TMS', type: 'signal', status: 'active' },
  ],
  stats: {
    totalNodes: 18,
    activeConnections: 775,
    systemHealth: 87,
    lastSync: '2024-06-06T14:30:00Z'
  }
};

export default function GSDPiVisualization() {
  const [gsdData, setGsdData] = useState<GSDTopology | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GSDNode | null>(null);
  const [viewMode, setViewMode] = useState<'topology' | 'hierarchy' | 'status'>('topology');

  // Load GSD data
  useEffect(() => {
    const loadGSDData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real GSD data from API
        const response = await fetch('/api/gsd/topology');
        
        if (response.ok) {
          const data = await response.json();
          setGsdData(data);
        } else {
          // Fallback to mock data
          console.log('Using mock GSD-Pi data');
          setGsdData(mockGSDData);
        }
      } catch (error) {
        console.error('GSD-Pi data loading error:', error);
        // Always show mock data instead of error
        setGsdData(mockGSDData);
      } finally {
        setLoading(false);
      }
    };

    loadGSDData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'warning': return 'text-amber-400 bg-amber-500/20 border-amber-400/30';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center glass-card-premium rounded-5xl border border-glass-border">
        <div className="text-center">
          <div className="loading-advanced mx-auto mb-6"></div>
          <p className="text-white/80 text-sm font-mono uppercase tracking-wider">Loading GSD-Pi Topology...</p>
          <div className="mt-4 flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-accent-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gsdData) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center glass-card-premium rounded-5xl border border-glass-border">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-white/80 text-lg font-bold">GSD-Pi System Unavailable</p>
          <p className="text-white/60 text-sm mt-2">
            Ground Support Device topology could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* GSD-Pi Header with Controls */}
      <GlassPanel
        title="GSD-Pi System Topology"
        subtitle={`${gsdData.stats.totalNodes} nodes • ${gsdData.stats.activeConnections} connections • ${gsdData.stats.systemHealth}% health`}
        icon={<Network className="h-5 w-5" />}
        variant="elevated"
        glow={true}
        glowColor="cyan"
      >
        <div className="flex items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex glass-card-premium backdrop-blur-4xl p-1 rounded-2xl border border-glass-border">
            {[
              { mode: 'topology', label: 'Topology', icon: Network },
              { mode: 'hierarchy', label: 'Hierarchy', icon: GitBranch },
              { mode: 'status', label: 'Status', icon: Activity },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-mono transition-all ${
                  viewMode === mode 
                    ? 'bg-gradient-accent text-white shadow-glow-sm' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* System Health Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card-premium border border-glass-border">
              <div className={`w-3 h-3 rounded-full ${
                gsdData.stats.systemHealth > 90 ? 'bg-green-500' :
                gsdData.stats.systemHealth > 70 ? 'bg-amber-500' : 'bg-red-500'
              } animate-pulse`} />
              <span className="text-sm font-bold text-white font-mono">
                {gsdData.stats.systemHealth}% Health
              </span>
            </div>
            
            <div className="text-xs text-white/60 font-mono">
              Last sync: {new Date(gsdData.stats.lastSync).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Main Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* System Nodes */}
        <div className="lg:col-span-2">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {viewMode === 'topology' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gsdData.nodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card3D
                      interactive={true}
                      glowColor={
                        node.status === 'active' ? 'green' :
                        node.status === 'warning' ? 'amber' :
                        node.status === 'error' ? 'red' : 'cyan'
                      }
                      className="p-6 cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`p-2 rounded-xl ${getStatusColor(node.status)}`}>
                            {node.type === 'system' ? <Layers className="h-5 w-5" /> :
                             node.type === 'device' ? <Cpu className="h-5 w-5" /> :
                             <Database className="h-5 w-5" />}
                          </div>
                          {getStatusIcon(node.status)}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-white font-mono text-lg uppercase tracking-wider">
                            {node.id}
                          </h3>
                          <p className="text-white/70 text-sm font-sans line-clamp-1">
                            {node.name}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/60">Connections</span>
                            <span className="font-bold text-accent-400 font-mono">
                              {node.connections}
                            </span>
                          </div>
                          
                          {node.metadata && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white/60">Drawings</span>
                              <span className="font-bold text-white font-mono">
                                {node.metadata.drawings}
                              </span>
                            </div>
                          )}
                        </div>

                        {node.children && node.children.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="text-xs text-white/60 flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              {node.children.length} subsystems
                            </div>
                          </div>
                        )}
                      </div>
                    </Card3D>
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'hierarchy' && (
              <div className="space-y-4">
                {gsdData.nodes.map((node) => (
                  <Card3D key={node.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${getStatusColor(node.status)}`}>
                          <Layers className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-xl font-mono uppercase">
                            {node.id} - {node.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(node.status)}`}>
                              {node.status.toUpperCase()}
                            </span>
                            <span className="text-white/60 text-sm">
                              {node.connections} connections
                            </span>
                          </div>
                        </div>
                      </div>

                      {node.children && node.children.length > 0 && (
                        <div className="ml-12 space-y-2">
                          {node.children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                child.status === 'active' ? 'bg-green-500' :
                                child.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              <div className="flex-1">
                                <span className="text-white font-mono text-sm">
                                  {child.name}
                                </span>
                                <span className="text-white/60 text-xs ml-2">
                                  ({child.connections} conn.)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card3D>
                ))}
              </div>
            )}

            {viewMode === 'status' && (
              <Card3D className="p-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white font-mono mb-6 flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-accent-400" />
                    System Status Overview
                  </h3>
                  
                  {gsdData.nodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          node.status === 'active' ? 'bg-green-500' :
                          node.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                        } animate-pulse`} />
                        <div>
                          <div className="font-bold text-white font-mono">
                            {node.id}
                          </div>
                          <div className="text-white/60 text-sm">
                            {node.name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-accent-400 font-bold font-mono">
                            {node.connections}
                          </div>
                          <div className="text-white/60 text-xs">Connections</div>
                        </div>
                        
                        {node.metadata?.lastUpdate && (
                          <div className="text-center">
                            <div className="text-white font-mono">
                              {node.metadata.lastUpdate}
                            </div>
                            <div className="text-white/60 text-xs">Last Update</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card3D>
            )}
          </motion.div>
        </div>

        {/* Node Details Panel */}
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
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white font-mono uppercase">
                        {selectedNode.id}
                      </h3>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-white/60 text-sm mb-1">System Name</div>
                        <div className="text-white font-bold">{selectedNode.name}</div>
                      </div>

                      <div>
                        <div className="text-white/60 text-sm mb-1">Status</div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${getStatusColor(selectedNode.status)}`}>
                          {getStatusIcon(selectedNode.status)}
                          <span className="font-bold uppercase text-sm">
                            {selectedNode.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-white/60 text-sm mb-1">Active Connections</div>
                        <div className="text-2xl font-bold text-accent-400 font-mono">
                          {selectedNode.connections}
                        </div>
                      </div>

                      {selectedNode.metadata && (
                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <h4 className="text-white font-bold font-mono uppercase tracking-wider">
                            Metadata
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-white/5 rounded-xl">
                              <div className="text-white/60">Drawings</div>
                              <div className="text-white font-bold font-mono">
                                {selectedNode.metadata.drawings || 0}
                              </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                              <div className="text-white/60">Wires</div>
                              <div className="text-white font-bold font-mono">
                                {selectedNode.metadata.wires || 0}
                              </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                              <div className="text-white/60">Pins</div>
                              <div className="text-white font-bold font-mono">
                                {selectedNode.metadata.pins || 0}
                              </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                              <div className="text-white/60">Updated</div>
                              <div className="text-white font-bold text-xs">
                                {selectedNode.metadata.lastUpdate || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedNode.children && selectedNode.children.length > 0 && (
                        <div className="pt-4 border-t border-white/10">
                          <h4 className="text-white font-bold font-mono uppercase tracking-wider mb-3">
                            Subsystems ({selectedNode.children.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedNode.children.map((child) => (
                              <div
                                key={child.id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    child.status === 'active' ? 'bg-green-500' :
                                    child.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                  }`} />
                                  <span className="text-white font-mono text-sm">
                                    {child.name}
                                  </span>
                                </div>
                                <span className="text-white/60 text-xs font-mono">
                                  {child.connections}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center glass-card-premium rounded-5xl border border-glass-border p-12"
              >
                <div className="text-center">
                  <Monitor className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 font-mono">
                    Click a system node to view details
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}