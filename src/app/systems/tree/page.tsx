'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Cpu, Database, FileText, Link2, Zap, RefreshCw, 
  ChevronRight, ChevronDown, Box, MapPin, Cable, 
  Train, Settings, ShieldCheck, Battery, DoorOpen, Wind, Radio
} from 'lucide-react';

const SYSTEM_ICONS: Record<string, unknown> = {
  GEN: Settings,
  TRL: Train,
  TRAC: Zap,
  BRAKE: ShieldCheck,
  TMS: Cpu,
  DOOR: DoorOpen,
  APS: Battery,
  VAC: Wind,
  COMMS: Radio,
  CAB: Box,
  LTEB: Zap,
  LTJB: Zap,
  EDB: Zap,
  HV: Zap,
  LIGHT: Zap,
};

const SYSTEM_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  GEN: { color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
  COMMS: { color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30' },
  CAB: { color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30' },
};

interface TreeNode {
  code: string;
  name: string;
  category: string;
  description: string;
  stats: { drawings: number; devices: number };
  children: {
    drawings: { id: string; drawingNo: string; title: string; revision: string; sheets: number; connectors: number; trainlines: number }[];
    devices: { id: string; tagNo: string; deviceName: string; carType: string }[];
    connectors: { id: string; connectorCode: string; type: string; pins: number }[];
  };
}

interface SystemData {
  tree: TreeNode[];
  metadata: { totalSystems: number; generatedAt: string };
}

function TreeContent() {
  const searchParams = useSearchParams();
  const initialSystem = searchParams.get('system');
  
  const [treeData, setTreeData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>(
    initialSystem ? { [initialSystem]: true } : {}
  );
  const [expandedDrawings, setExpandedDrawings] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'tree' | 'flat'>('tree');

  useEffect(() => {
    fetchTree();
  }, []);

  async function fetchTree() {
    try {
      setLoading(true);
      const res = await fetch('/api/system-tree');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      
      // Transform to expected format
      const transformed = {
        tree: data.hierarchy.map((sys: unknown) => ({
          code: sys.code,
          name: sys.name,
          category: sys.category,
          description: sys.category,
          stats: {
            drawings: sys.stats.drawings,
            devices: sys.stats.devices,
            connectors: sys.stats.connectors,
            pins: sys.stats.totalPins
          },
          children: {
            drawings: sys.drawings.pinAssignments.map((d: unknown) => ({
              id: d.no,
              drawingNo: d.no,
              title: d.title,
              revision: 'A',
              sheets: d.sheets,
              connectors: d.connectors,
              connectorList: d.connectorList || []
            })),
            devices: sys.devices.flatMap((t: unknown) => t.list),
            connectors: []
          }
        })),
        metadata: {
          totalSystems: data.total,
          generatedAt: new Date().toISOString()
        }
      };
      
      setTreeData(transformed);
      
      if (initialSystem) {
        setExpandedSystems({ [initialSystem]: true });
      }
    } catch (err) {
      setError('Failed to load system tree');
    } finally {
      setLoading(false);
    }
  }

  function toggleSystem(code: string) {
    setExpandedSystems(prev => ({ ...prev, [code]: !prev[code] }));
  }

  function toggleDrawing(id: string) {
    setExpandedDrawings(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !treeData) {
    return (
      <div className="animated-bg min-h-screen p-6 grid-pattern">
        <div className="glass-card p-12 text-center">
          <Database className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error || 'Failed to load tree'}</p>
          <button onClick={fetchTree} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const flatList = treeData.tree;

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC System Tree</h1>
        <p className="mt-2 text-slate-400">
          Complete hierarchy from Systems → Drawings → Connectors → Pins → Wires
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            {treeData.metadata.totalSystems} Systems
          </span>
          <span className="text-cyan-400">
            {flatList.reduce((acc, s) => acc + s.children.drawings.length, 0)} Drawings
          </span>
          <span>
            {flatList.reduce((acc, s) => acc + s.children.connectors.length, 0)} Connectors
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('tree')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'tree' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300'}`}>
          <ChevronDown className="h-4 w-4" />
          Tree View
        </button>
        <button onClick={() => setActiveTab('flat')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'flat' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300'}`}>
          <Link2 className="h-4 w-4" />
          Flat List
        </button>
      </div>

      {activeTab === 'tree' ? (
        <div className="space-y-2">
          {flatList.map(system => {
            const sysInfo = SYSTEM_COLORS[system.code] || SYSTEM_COLORS['GEN'];
            const Icon = SYSTEM_ICONS[system.code] || Settings;
            const isExpanded = expandedSystems[system.code];
            const totalDrawings = system.children.drawings.length;
            const totalConnectors = system.children.connectors.length;
            const totalDevices = system.children.devices.length;

            return (
              <div key={system.code} className={`glass-card overflow-hidden border ${sysInfo.border}`}>
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30"
                  onClick={() => toggleSystem(system.code)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${sysInfo.bg}`}>
                      <Icon className={`h-6 w-6 ${sysInfo.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${sysInfo.color}`}>{system.code}</span>
                        <span className="text-white font-semibold">{system.name}</span>
                        {system.category && (
                          <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded text-xs">
                            {system.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{system.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-white">{totalDrawings}</div>
                        <div className="text-slate-500 text-xs">Drawings</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-white">{totalConnectors}</div>
                        <div className="text-slate-500 text-xs">Connectors</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-white">{totalDevices}</div>
                        <div className="text-slate-500 text-xs">Devices</div>
                      </div>
                    </div>
                    <Link href={`/systems/${system.code}`} onClick={e => e.stopPropagation()}
                      className="px-3 py-1 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded text-sm">
                      View System
                    </Link>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700/50">
                    <div className="p-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Drawings ({system.children.drawings.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {system.children.drawings.length === 0 ? (
                            <p className="text-sm text-slate-500">No drawings</p>
                          ) : system.children.drawings.slice(0, 20).map(dwg => (
                            <div key={dwg.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50">
                              <div className="flex items-center justify-between mb-1">
                                <Link href={`/drawings/${dwg.id}`} className="font-mono text-cyan-400 font-bold hover:text-cyan-300">
                                  {dwg.drawingNo}
                                </Link>
                                <span className="text-xs text-slate-500">Rev {dwg.revision}</span>
                              </div>
                              <p className="text-sm text-slate-300 truncate">{dwg.title}</p>
                              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                                <span>{dwg.sheets} sheets</span>
                                <span>{dwg.connectors} connectors</span>
                                <span>{dwg.trainlines} trainlines</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                          <Box className="h-4 w-4" />
                          Equipment ({system.children.devices.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {system.children.devices.length === 0 ? (
                            <p className="text-sm text-slate-500">No equipment</p>
                          ) : system.children.devices.slice(0, 15).map(eq => (
                            <div key={eq.id} className="px-3 py-1 bg-slate-800/30 rounded-lg border border-slate-700/30">
                              <span className="font-mono text-orange-400 text-sm">{eq.tagNo}</span>
                              <span className="text-slate-400 text-xs ml-2">{eq.deviceName}</span>
                              {eq.carType && (
                                <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs ml-2">{eq.carType}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          Connectors ({system.children.connectors.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {system.children.connectors.length === 0 ? (
                            <p className="text-sm text-slate-500">No connectors</p>
                          ) : system.children.connectors.slice(0, 20).map(conn => (
                            <Link key={conn.id} href={`/connectors?connector=${encodeURIComponent(conn.connectorCode)}`}
                              className="px-3 py-1 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-cyan-500/50">
                              <span className="font-mono text-green-400 text-sm">{conn.connectorCode}</span>
                              <span className="text-slate-400 text-xs ml-2">{conn.pins}P</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {flatList.map(system => {
              const sysInfo = SYSTEM_COLORS[system.code] || SYSTEM_COLORS['GEN'];
              const Icon = SYSTEM_ICONS[system.code] || Settings;
              return (
                <Link key={system.code} href={`/systems/${system.code}`}
                  className={`glass-card border ${sysInfo.border} p-4 hover:scale-[1.02] transition-transform`}>
                  <div className={`p-2 rounded-lg ${sysInfo.bg} inline-block mb-3`}>
                    <Icon className={`h-5 w-5 ${sysInfo.color}`} />
                  </div>
                  <div className="font-bold text-white">{system.code}</div>
                  <div className="text-sm text-slate-400">{system.name}</div>
                  <div className="mt-2 flex gap-3 text-xs text-slate-500">
                    <span>{system.stats.drawings} dwg</span>
                    <span>{system.stats.devices} eq</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Data Flow Architecture</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">Systems</span>
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">Drawings</span>
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">Connectors</span>
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">Pins</span>
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <Cable className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">Wires</span>
          </div>
        </div>
        <p className="text-center text-slate-500 text-sm mt-4">
          Hierarchical structure: Each System contains Drawings → each Drawing has Connectors → each Connector has Pins → each Pin connects to a Wire
        </p>
      </div>
    </div>
  );
}

export default function SystemTreePage() {
  return (
    <Suspense fallback={
      <div className="animated-bg min-h-screen p-6 grid-pattern flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <TreeContent />
    </Suspense>
  );
}