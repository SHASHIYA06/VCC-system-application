'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Lightbulb, Link2, Search, ChevronRight, Layers,
  Cpu, Cable, FileText, AlertTriangle, CheckCircle, Clock, Eye, X
} from 'lucide-react';

interface DashboardStats {
  overview: {
    systems: number;
    wires: number;
    drawings: number;
    equipment: number;
    connectors: number;
    pins: number;
    totalConnections: number;
  };
  byCarType: Record<string, number>;
  systems: Array<{ code: string; name: string; deviceCount: number; category: string }>;
}

const SYSTEM_GROUPS = [
  {
    code: 'GEN',
    name: 'General & Conventions',
    category: 'Foundation',
    description: 'Drawing list, classification, wiring numbers, symbols',
    icon: Settings,
    color: 'from-slate-500/20 to-slate-600/10',
    borderColor: 'border-slate-500/30',
  },
  {
    code: 'TRL',
    name: 'Trainlines',
    category: 'Core Systems',
    description: 'Train line control, signal, low/high tension power',
    icon: Train,
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
  },
  {
    code: 'CAB',
    name: 'Cab Control & Status',
    category: 'Core Systems',
    description: 'Controlling cab, startup, status indication, MCB trip',
    icon: Activity,
    color: 'from-violet-500/20 to-violet-600/10',
    borderColor: 'border-violet-500/30',
  },
  {
    code: 'TRAC',
    name: 'Traction & Propulsion',
    category: 'Propulsion',
    description: 'Speed control, VVVF control, traction return current',
    icon: Zap,
    color: 'from-orange-500/20 to-orange-600/10',
    borderColor: 'border-orange-500/30',
  },
  {
    code: 'BRAKE',
    name: 'Brake System',
    category: 'Core Systems',
    description: 'Compressor, brake loop, emergency brake, parking brake, horn',
    icon: ShieldCheck,
    color: 'from-red-500/20 to-red-600/10',
    borderColor: 'border-red-500/30',
  },
  {
    code: 'APS',
    name: 'Auxiliary Power Supply',
    category: 'Power',
    description: 'APS, shore supply, battery control',
    icon: Battery,
    color: 'from-green-500/20 to-green-600/10',
    borderColor: 'border-green-500/30',
  },
  {
    code: 'DOOR',
    name: 'Door System',
    category: 'Core Systems',
    description: 'Door operation, proving loop, local interlock, TMS interface',
    icon: DoorOpen,
    color: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
  },
  {
    code: 'VAC',
    name: 'Ventilation AC',
    category: 'Comfort',
    description: 'Cab VAC, saloon VAC power/control',
    icon: Wind,
    color: 'from-cyan-500/20 to-cyan-600/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    code: 'COMMS',
    name: 'Communications',
    category: 'Communication',
    description: 'PIS, PA, CCTV, Radio, CBTC',
    icon: Radio,
    color: 'from-emerald-500/20 to-emerald-600/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    code: 'TMS',
    name: 'TCMS',
    category: 'Control',
    description: 'Train Control Management System, RIO, Terminal Block',
    icon: Cpu,
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/30',
  },
];

interface DrawingResult {
  id: string;
  drawingNo: string;
  title: string;
  revision: string;
  carType: string;
  subsystem: string;
  drawingType: string;
  pageCount: number;
  systemCode: string;
  sourceFile: string;
  notes: string;
  relatedWires: Array<{ wireNo: string; signalName: string; wireColor: string }>;
  relatedEquipment: Array<{ name: string; tag: string; carType: string }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawingSearch, setDrawingSearch] = useState('');
  const [drawingResult, setDrawingResult] = useState<DrawingResult | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingError, setDrawingError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Failed to load database stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  async function searchDrawing() {
    if (!drawingSearch.trim()) return;
    setDrawingLoading(true);
    setDrawingError(null);
    try {
      const response = await fetch(`/api/drawings/lookup?drawing_no=${encodeURIComponent(drawingSearch.trim())}`);
      const data = await response.json();
      if (response.ok) {
        if (data.drawing) {
          const remarksParts = (data.drawing.remarks || '').split('|');
          const carType = remarksParts[0] || 'ALL';
          const subsystem = remarksParts[1] || data.drawing.systemCode || 'GEN';
          
          setDrawingResult({
            ...data.drawing,
            carType,
            subsystem,
            drawingType: data.drawing.systemCode || 'SCHEMATIC',
            pageCount: data.pageCount || 0,
            relatedWires: data.relatedWires || [],
            relatedEquipment: data.relatedEquipment || []
          });
        } else {
          setDrawingResult(data);
        }
      } else {
        setDrawingError(data.error || 'Drawing not found');
      }
    } catch (err) {
      setDrawingError('Search failed');
    } finally {
      setDrawingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Complete system overview - KMRCL RS3R VCC Wiring Database
        </p>
      </div>

      {/* Drawing Number Search */}
      <div className="mb-8 glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          Quick Drawing Lookup
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Enter a drawing number to view the complete drawing with all related wiring, pins, and equipment details.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter drawing number (e.g., 942-38309, 942-58107)..."
              value={drawingSearch}
              onChange={(e) => setDrawingSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchDrawing()}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <button
            onClick={searchDrawing}
            disabled={!drawingSearch || drawingLoading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {drawingLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>

        {/* Search Results */}
        {(drawingResult || drawingError) && (
          <div className="mt-4">
            {drawingError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{drawingError}</span>
                  <button onClick={() => { setDrawingResult(null); setDrawingError(null); }} className="ml-auto">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            {drawingResult && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-400" />
                      <span className="font-mono font-bold text-lg text-green-400">{drawingResult.drawingNo}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">{drawingResult.drawingType}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{drawingResult.carType}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{drawingResult.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>System: {drawingResult.subsystem}</span>
                      <span>Pages: {drawingResult.pageCount}</span>
                      {drawingResult.sourceFile && (
                        <a href={`/DOCUMENTS/${drawingResult.sourceFile}`} target="_blank" className="text-cyan-400 hover:underline">View PDF</a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/drawings/${drawingResult.id}`} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium">
                      View Drawing
                    </Link>
                    <button onClick={() => { setDrawingResult(null); setDrawingSearch(''); }} className="p-2 text-slate-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Settings className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.overview?.systems || 0}</p>
              <p className="text-xs text-slate-400">Systems</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Cable className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.overview?.wires || 0}</p>
              <p className="text-xs text-slate-400">Wires</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.overview?.drawings || 0}</p>
              <p className="text-xs text-slate-400">Drawings</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Box className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.overview?.equipment || 0}</p>
              <p className="text-xs text-slate-400">Equipment</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Link2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.overview?.connectors || 0}</p>
              <p className="text-xs text-slate-400">Connectors</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Layers className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.overview?.pins || 0}</p>
              <p className="text-xs text-slate-400">Pins</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SYSTEM_GROUPS.map(system => {
          const dbSystem = stats?.systems?.find(s => s.code === system.code);
          const deviceCount = dbSystem?.deviceCount || 0;
          
          return (
            <Link key={system.code} href={`/systems/${system.code}`}>
              <div className={`glass-card border ${system.borderColor} overflow-hidden hover:scale-[1.02] transition-transform`}>
                <div className={`bg-gradient-to-r ${system.color} p-4`}>
                  <div className="flex items-center gap-3">
                    <system.icon className="h-6 w-6 text-white" />
                    <div>
                      <h3 className="font-bold text-white">{system.code}</h3>
                      <p className="text-xs text-slate-300">{system.category}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-white mb-1">{system.name}</h4>
                  <p className="text-sm text-slate-400 mb-4">{system.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {deviceCount} equipment in DB
                    </span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      View <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/trainlines" className="glass-card p-4 hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <Train className="h-8 w-8 text-blue-400" />
            <div>
              <p className="font-semibold text-white">Trainlines</p>
              <p className="text-xs text-slate-400">View all trainlines</p>
            </div>
          </div>
        </Link>

        <Link href="/equipment" className="glass-card p-4 hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <Box className="h-8 w-8 text-orange-400" />
            <div>
              <p className="font-semibold text-white">Equipment</p>
              <p className="text-xs text-slate-400">Browse equipment</p>
            </div>
          </div>
        </Link>

        <Link href="/drawings" className="glass-card p-4 hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-400" />
            <div>
              <p className="font-semibold text-white">Drawings</p>
              <p className="text-xs text-slate-400">View drawings</p>
            </div>
          </div>
        </Link>

        <Link href="/search" className="glass-card p-4 hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <Search className="h-8 w-8 text-green-400" />
            <div>
              <p className="font-semibold text-white">Search</p>
              <p className="text-xs text-slate-400">Global search</p>
            </div>
          </div>
        </Link>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
          <p className="text-sm text-slate-500 mt-1">Some data may be from static fallback</p>
        </div>
      )}
    </div>
  );
}