'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Link2, Search, ChevronRight, Layers,
  Cpu, Cable, FileText, AlertTriangle, Eye, X, Database, Map,
  TrendingUp, Sparkles
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
    gradient: 'from-slate-600 via-slate-500 to-slate-600',
    glow: 'shadow-slate-500/50',
  },
  {
    code: 'TRL',
    name: 'Trainlines',
    category: 'Core Systems',
    description: 'Train line control, signal, low/high tension power',
    icon: Train,
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/50',
  },
  {
    code: 'CAB',
    name: 'Cab Control & Status',
    category: 'Core Systems',
    description: 'Controlling cab, startup, status indication, MCB trip',
    icon: Activity,
    gradient: 'from-violet-600 via-purple-500 to-violet-600',
    glow: 'shadow-violet-500/50',
  },
  {
    code: 'TRAC',
    name: 'Traction & Propulsion',
    category: 'Propulsion',
    description: 'Speed control, VVVF control, traction return current',
    icon: Zap,
    gradient: 'from-orange-600 via-amber-500 to-orange-600',
    glow: 'shadow-orange-500/50',
  },
  {
    code: 'BRAKE',
    name: 'Brake System',
    category: 'Core Systems',
    description: 'Compressor, brake loop, emergency brake, parking brake, horn',
    icon: ShieldCheck,
    gradient: 'from-red-600 via-rose-500 to-red-600',
    glow: 'shadow-red-500/50',
  },
  {
    code: 'APS',
    name: 'Auxiliary Power Supply',
    category: 'Power',
    description: 'APS, shore supply, battery control',
    icon: Battery,
    gradient: 'from-green-600 via-emerald-500 to-green-600',
    glow: 'shadow-green-500/50',
  },
  {
    code: 'DOOR',
    name: 'Door System',
    category: 'Core Systems',
    description: 'Door operation, proving loop, local interlock, TMS interface',
    icon: DoorOpen,
    gradient: 'from-amber-600 via-yellow-500 to-amber-600',
    glow: 'shadow-amber-500/50',
  },
  {
    code: 'VAC',
    name: 'Ventilation AC',
    category: 'Comfort',
    description: 'Cab VAC, saloon VAC power/control',
    icon: Wind,
    gradient: 'from-cyan-600 via-teal-500 to-cyan-600',
    glow: 'shadow-cyan-500/50',
  },
  {
    code: 'COMMS',
    name: 'Communications',
    category: 'Communication',
    description: 'PIS, PA, CCTV, Radio, CBTC',
    icon: Radio,
    gradient: 'from-emerald-600 via-green-500 to-emerald-600',
    glow: 'shadow-emerald-500/50',
  },
  {
    code: 'TMS',
    name: 'TCMS',
    category: 'Control',
    description: 'Train Control Management System, RIO, Terminal Block',
    icon: Cpu,
    gradient: 'from-purple-600 via-fuchsia-500 to-purple-600',
    glow: 'shadow-purple-500/50',
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawingSearch, setDrawingSearch] = useState('');
  const [drawingResult, setDrawingResult] = useState<DrawingResult | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingError, setDrawingError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);

  async function seedDatabase() {
    setSeeding(true);
    setError(null);
    try {
      const response = await fetch('/api/vcc-master-seed', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setSeedResult(data);
        const statsResponse = await fetch('/api/stats');
        const statsData = await statsResponse.json();
        setStats(statsData);
        setError(null);
      } else {
        setError('Seed failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Seed failed: ' + String(err));
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (response.ok && data.overview) {
          setStats(data);
          if (data.overview.drawings === 0 && data.overview.wires === 0) {
            setError('Database is empty. Please click "Load VCC Data" button below to populate the database.');
          }
        } else if (data.error) {
          setError('Database connection error. Please ensure database is running and click "Load VCC Data".');
        }
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
            pageCount: data.drawing.pageCount || 0,
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Sparkles className="h-10 w-10 text-cyan-400" />
              VCC Dashboard
            </h1>
            <p className="text-xl text-slate-300">
              KMRCL RS3R VCC Wiring Database - Complete System Overview
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={seedDatabase}
            disabled={seeding}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-bold text-lg flex items-center gap-3 shadow-2xl shadow-cyan-500/50"
          >
            {seeding ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                />
                Loading Data...
              </>
            ) : (
              <>
                <Database className="h-6 w-6" />
                Load VCC Data
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Drawing Lookup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 glass-card p-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Eye className="h-7 w-7 text-cyan-400" />
          Quick Drawing Lookup
        </h2>
        <p className="text-lg text-slate-300 mb-6">
          Enter a drawing number to view complete details with wiring, pins, and equipment
        </p>
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-cyan-400" />
            <input
              type="text"
              placeholder="Enter drawing number (e.g., 942-38309, 942-58107)..."
              value={drawingSearch}
              onChange={(e) => setDrawingSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchDrawing()}
              className="w-full pl-14 pr-6 py-4 bg-slate-800/80 border-2 border-slate-600 rounded-xl text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={searchDrawing}
            disabled={!drawingSearch || drawingLoading}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors flex items-center gap-3 shadow-lg shadow-cyan-500/30"
          >
            {drawingLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Search className="h-5 w-5" />
            )}
            Search
          </motion.button>
        </div>

        {/* Search Results */}
        {(drawingResult || drawingError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6"
          >
            {drawingError && (
              <div className="p-6 rounded-xl bg-red-500/20 border-2 border-red-500/50">
                <div className="flex items-center gap-3 text-red-300 text-lg">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="font-semibold">{drawingError}</span>
                  <button
                    onClick={() => {
                      setDrawingResult(null);
                      setDrawingError(null);
                    }}
                    className="ml-auto p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            {drawingResult && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <FileText className="h-8 w-8 text-green-400" />
                      <span className="font-mono font-bold text-3xl text-white">{drawingResult.drawingNo}</span>
                      <span className="px-4 py-1 rounded-lg text-sm font-bold bg-purple-500/30 text-purple-200 border border-purple-400/50">
                        {drawingResult.drawingType}
                      </span>
                      <span className="px-4 py-1 rounded-lg text-sm font-bold bg-blue-500/30 text-blue-200 border border-blue-400/50">
                        {drawingResult.carType}
                      </span>
                    </div>
                    <p className="text-xl text-white font-semibold mb-2">{drawingResult.title}</p>
                    <div className="flex items-center gap-6 text-base text-slate-300">
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        System: {drawingResult.subsystem}
                      </span>
                      <span className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Pages: {drawingResult.pageCount}
                      </span>
                      {drawingResult.sourceFile && (
                        <a
                          href={`/DOCUMENTS/${drawingResult.sourceFile}`}
                          target="_blank"
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View PDF
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/drawings/${drawingResult.drawingNo}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-base font-bold shadow-lg shadow-cyan-500/30"
                      >
                        View Drawing
                      </motion.button>
                    </Link>
                    <button
                      onClick={() => {
                        setDrawingResult(null);
                        setDrawingSearch('');
                      }}
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
      >
        {[
          { label: 'Systems', value: stats?.overview?.systems || 0, icon: Settings, color: 'blue', href: '/systems' },
          { label: 'Wires', value: stats?.overview?.wires || 0, icon: Cable, color: 'cyan', href: '/wires' },
          { label: 'Drawings', value: stats?.overview?.drawings || 0, icon: FileText, color: 'purple', href: '/drawings' },
          { label: 'Equipment', value: stats?.overview?.equipment || 0, icon: Box, color: 'orange', href: '/equipment' },
          { label: 'Connectors', value: stats?.overview?.connectors || 0, icon: Link2, color: 'green', href: '/connectors' },
          { label: 'Pins', value: stats?.overview?.pins || 0, icon: Layers, color: 'amber', href: '/pins' },
        ].map((stat, index) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card p-6 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-500/20 rounded-xl group-hover:bg-${stat.color}-500/30 transition-colors`}>
                  <stat.icon className={`h-7 w-7 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-slate-300 font-semibold">{stat.label}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center text-cyan-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* System Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
      >
        {SYSTEM_GROUPS.map((system, index) => {
          const dbSystem = stats?.systems?.find(s => s.code === system.code);
          const deviceCount = dbSystem?.deviceCount || 0;
          
          return (
            <Link key={system.code} href={`/systems/${system.code}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -8 }}
                className={`glass-card overflow-hidden group cursor-pointer ${system.glow}`}
              >
                <div className={`bg-gradient-to-r ${system.gradient} p-6`}>
                  <div className="flex items-center gap-4">
                    <system.icon className="h-10 w-10 text-white drop-shadow-lg" />
                    <div>
                      <h3 className="font-bold text-2xl text-white">{system.code}</h3>
                      <p className="text-sm text-white/80 font-semibold">{system.category}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-bold text-xl text-white mb-2">{system.name}</h4>
                  <p className="text-base text-slate-300 mb-4 leading-relaxed">{system.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold">{deviceCount} equipment</span>
                    </div>
                    <span className="text-cyan-400 flex items-center gap-2 font-bold group-hover:gap-3 transition-all">
                      Explore <ChevronRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {[
          { label: 'Trainlines', icon: Train, href: '/trainlines', color: 'blue' },
          { label: 'Cars', icon: Box, href: '/cars', color: 'orange' },
          { label: 'Documents', icon: FileText, href: '/documents', color: 'cyan' },
          { label: 'System Tree', icon: Map, href: '/systems/tree', color: 'purple' },
          { label: 'Wire Trace', icon: Cable, href: '/wires/trace', color: 'green' },
          { label: 'Global Search', icon: Search, href: '/search', color: 'amber' },
        ].map((link, index) => (
          <Link key={link.label} href={link.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-6 group cursor-pointer"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <link.icon className={`h-10 w-10 text-${link.color}-400 group-hover:scale-110 transition-transform`} />
                <div>
                  <p className="font-bold text-lg text-white">{link.label}</p>
                  <ChevronRight className="h-5 w-5 text-cyan-400 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Error/Seed Result */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-red-500/20 border-2 border-red-500/50 rounded-xl"
        >
          <p className="text-red-300 text-lg font-semibold mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={seedDatabase}
            disabled={seeding}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white rounded-xl font-bold flex items-center gap-3"
          >
            {seeding ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Loading VCC Data...
              </>
            ) : (
              <>
                <Database className="h-5 w-5" />
                Load VCC Data
              </>
            )}
          </motion.button>
          {seedResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-green-500/20 border-2 border-green-500/50 rounded-xl"
            >
              <p className="text-green-300 font-bold text-lg mb-3">Data Loaded Successfully!</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base text-slate-300">
                <span className="font-semibold">Drawings: {seedResult.stats?.drawings}</span>
                <span className="font-semibold">Wires: {seedResult.stats?.wires}</span>
                <span className="font-semibold">Circuits: {seedResult.stats?.circuits}</span>
                <span className="font-semibold">Equipment: {seedResult.stats?.equipment}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
