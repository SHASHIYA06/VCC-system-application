'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Link2, Search, ChevronRight, Layers,
  Cpu, Cable, FileText, AlertTriangle, Eye, X, Database, Map,
  TrendingUp, Sparkles, Bot, Brain, GitBranch, Network,
  CheckCircle2, Clock, Loader2, BarChart3, Gauge, Wifi,
  BookOpen, Wrench, Car, ArrowUpRight, RefreshCw, Play,
  Atom, Lightbulb, Target, Zap as ZapIcon
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface AgentResult {
  agentId: string;
  content: string;
  confidence: number;
  sources: string[];
}

interface RagSearchResult {
  query: string;
  unifiedResponse: string;
  primaryResponse: AgentResult;
  supportingResponses: AgentResult[];
  drawingData?: DrawingResult;
  executionTime: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_GROUPS = [
  {
    code: 'GEN',
    name: 'General & Conventions',
    category: 'Foundation',
    description: 'Drawing list, classification, wiring numbers, symbols & conventions',
    icon: Settings,
    gradient: 'from-slate-600 via-slate-500 to-slate-600',
    glow: 'shadow-slate-500/30',
    color: 'slate',
    borderColor: 'border-slate-500/30',
  },
  {
    code: 'TRL',
    name: 'Trainlines',
    category: 'Core Systems',
    description: 'Train line control, signal, low/high tension power distribution',
    icon: Train,
    gradient: 'from-blue-700 via-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/30',
    color: 'blue',
    borderColor: 'border-blue-500/30',
  },
  {
    code: 'CAB',
    name: 'Cab Control & Status',
    category: 'Core Systems',
    description: 'Controlling cab, startup sequence, status indication, MCB trip',
    icon: Activity,
    gradient: 'from-violet-700 via-purple-500 to-violet-600',
    glow: 'shadow-violet-500/30',
    color: 'violet',
    borderColor: 'border-violet-500/30',
  },
  {
    code: 'TRAC',
    name: 'Traction & Propulsion',
    category: 'Propulsion',
    description: 'Speed control, VVVF inverter control, traction return current',
    icon: Zap,
    gradient: 'from-orange-600 via-amber-500 to-orange-600',
    glow: 'shadow-orange-500/30',
    color: 'orange',
    borderColor: 'border-orange-500/30',
  },
  {
    code: 'BRAKE',
    name: 'Brake System',
    category: 'Safety',
    description: 'Compressor, brake loop, emergency brake, parking brake, horn',
    icon: ShieldCheck,
    gradient: 'from-red-700 via-rose-500 to-red-600',
    glow: 'shadow-red-500/30',
    color: 'red',
    borderColor: 'border-red-500/30',
  },
  {
    code: 'APS',
    name: 'Auxiliary Power Supply',
    category: 'Power',
    description: 'APS, shore supply, battery control, auxiliary circuits',
    icon: Battery,
    gradient: 'from-green-700 via-emerald-500 to-green-600',
    glow: 'shadow-green-500/30',
    color: 'green',
    borderColor: 'border-green-500/30',
  },
  {
    code: 'DOOR',
    name: 'Door System',
    category: 'Core Systems',
    description: 'Door operation, proving loop, local interlock, TMS interface',
    icon: DoorOpen,
    gradient: 'from-amber-600 via-yellow-500 to-amber-600',
    glow: 'shadow-amber-500/30',
    color: 'amber',
    borderColor: 'border-amber-500/30',
  },
  {
    code: 'VAC',
    name: 'Ventilation & AC',
    category: 'Comfort',
    description: 'Cab VAC, saloon VAC power and control, HVAC management',
    icon: Wind,
    gradient: 'from-cyan-700 via-teal-500 to-cyan-600',
    glow: 'shadow-cyan-500/30',
    color: 'cyan',
    borderColor: 'border-cyan-500/30',
  },
  {
    code: 'COMMS',
    name: 'Communications',
    category: 'Communication',
    description: 'PIS, PA system, CCTV, Radio communication, CBTC',
    icon: Radio,
    gradient: 'from-emerald-700 via-green-500 to-emerald-600',
    glow: 'shadow-emerald-500/30',
    color: 'emerald',
    borderColor: 'border-emerald-500/30',
  },
  {
    code: 'TMS',
    name: 'TCMS',
    category: 'Control',
    description: 'Train Control Management System, RIO, Terminal Block, diagnostics',
    icon: Cpu,
    gradient: 'from-purple-700 via-fuchsia-500 to-purple-600',
    glow: 'shadow-purple-500/30',
    color: 'purple',
    borderColor: 'border-purple-500/30',
  },
];

const QUICK_LINKS = [
  { label: 'Trainlines', icon: Train, href: '/trainlines', color: 'blue', desc: 'All train lines' },
  { label: 'Cars', icon: Car, href: '/cars', color: 'orange', desc: 'DMC, TC, MC' },
  { label: 'Documents', icon: FileText, href: '/documents', color: 'cyan', desc: 'PDF library' },
  { label: 'System Tree', icon: Map, href: '/systems/tree', color: 'purple', desc: 'Hierarchy view' },
  { label: 'Wire Trace', icon: Cable, href: '/wires/trace', color: 'green', desc: 'Path tracing' },
  { label: 'AI Assistant', icon: Bot, href: '/ai-assistant', color: 'pink', desc: 'Smart queries' },
];

const CAR_TYPES = [
  { type: 'DMC', name: 'Driving Motor Car', color: 'from-blue-600 to-cyan-600', icon: '🚃', desc: 'Driver cab + traction' },
  { type: 'TC',  name: 'Trailer Car',        color: 'from-purple-600 to-violet-600', icon: '🚋', desc: 'Passenger only' },
  { type: 'MC',  name: 'Motor Car',          color: 'from-orange-600 to-amber-600', icon: '🚄', desc: 'Motor + passenger' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Drawing lookup
  const [drawingSearch, setDrawingSearch] = useState('');
  const [drawingResult, setDrawingResult] = useState<DrawingResult | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingError, setDrawingError] = useState<string | null>(null);

  // Multi-agent RAG
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<RagSearchResult | null>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [showRagPanel, setShowRagPanel] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (response.ok && data.overview) {
        setStats(data);
        if (data.overview.drawings === 0 && data.overview.wires === 0) {
          setError('Database is empty — click "Load VCC Data" to populate');
        }
      } else if (data.error) {
        setError('Database connection error. Click "Load VCC Data" to retry.');
      }
    } catch {
      setError('Failed to load database stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Seed database ─────────────────────────────────────────────────────────

  async function seedDatabase() {
    setSeeding(true);
    setError(null);
    try {
      const response = await fetch('/api/vcc-master-seed', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        await fetchStats();
      } else {
        setError('Seed failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Seed failed: ' + String(err));
    } finally {
      setSeeding(false);
    }
  }

  // ── Drawing lookup ────────────────────────────────────────────────────────

  async function searchDrawing() {
    if (!drawingSearch.trim()) return;
    setDrawingLoading(true);
    setDrawingError(null);
    setDrawingResult(null);
    try {
      const response = await fetch(`/api/drawings/lookup?drawing_no=${encodeURIComponent(drawingSearch.trim())}`);
      const data = await response.json();
      if (response.ok && data.drawing) {
        const remarksParts = (data.drawing.remarks || '').split('|');
        setDrawingResult({
          ...data.drawing,
          carType: remarksParts[0] || 'ALL',
          subsystem: remarksParts[1] || data.drawing.systemCode || 'GEN',
          drawingType: data.drawing.systemCode || 'SCHEMATIC',
          pageCount: data.drawing.pageCount || 0,
          relatedWires: data.relatedWires || [],
          relatedEquipment: data.relatedEquipment || [],
        });
      } else {
        setDrawingError(data.error || 'Drawing not found. Try format: 942-38309');
      }
    } catch {
      setDrawingError('Search failed — check connection');
    } finally {
      setDrawingLoading(false);
    }
  }

  // ── Multi-Agent RAG search ────────────────────────────────────────────────

  async function runRagSearch() {
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    setRagError(null);
    setRagResult(null);
    setShowRagPanel(true);
    setActiveAgents(['wire-agent', 'connector-agent', 'drawing-agent', 'equipment-agent', 'trainline-agent']);
    
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ragQuery,
          taskType: 'unified_search',
          useMultiAgent: true,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setRagResult(data);
        setActiveAgents([]);
      } else {
        setRagError(data.error || 'AI search failed');
        setActiveAgents([]);
      }
    } catch {
      setRagError('AI search failed — check connection');
      setActiveAgents([]);
    } finally {
      setRagLoading(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────

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
          <p className="text-slate-400 text-lg">Loading VCC Intelligence...</p>
        </motion.div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">VCC Dashboard</h1>
              <p className="text-slate-400 text-sm">KMRCL RS3R · Vehicle Control Circuits</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* DB Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            stats ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${stats ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {stats ? 'DB Connected' : 'DB Offline'}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchStats}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all border border-slate-700/50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Load VCC Data */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={seedDatabase}
            disabled={seeding}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-all"
          >
            {seeding ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Loading Data...</>
            ) : (
              <><Database className="h-4 w-4" /> Load VCC Data</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ─── Error Banner ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-amber-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Multi-Agent RAG Search ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6 border border-cyan-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Multi-Agent AI Search</h2>
            <p className="text-xs text-slate-400">LangChain-powered · 5 parallel agents · RAG retrieval</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {activeAgents.map(agent => (
              <motion.div
                key={agent}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                {agent.replace('-agent', '')}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Brain className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
            <input
              type="text"
              placeholder="Ask anything: wire numbers, connectors, drawing details, circuit analysis..."
              value={ragQuery}
              onChange={e => setRagQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runRagSearch()}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border-2 border-slate-600 focus:border-purple-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runRagSearch}
            disabled={!ragQuery || ragLoading}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30"
          >
            {ragLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Atom className="h-5 w-5" />}
            {ragLoading ? 'Analyzing...' : 'AI Analyze'}
          </motion.button>
        </div>

        {/* Suggested queries */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Wire 1001', 'Connector X1-A', 'Drawing 942-38309', 'HV System wiring', 'DMC brake circuit'].map(q => (
            <button
              key={q}
              onClick={() => { setRagQuery(q); }}
              className="px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white text-xs border border-slate-700/50 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* RAG Results */}
        <AnimatePresence>
          {showRagPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              {ragError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-red-300 text-sm">{ragError}</span>
                  <button onClick={() => { setRagError(null); setShowRagPanel(false); }} className="ml-auto">
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              )}

              {ragLoading && (
                <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                    <span className="text-purple-300 font-semibold">Running multi-agent analysis...</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {['Wire Agent', 'Connector Agent', 'Drawing Agent', 'Equipment Agent', 'Trainline Agent'].map((agent, i) => (
                      <motion.div
                        key={agent}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center"
                      >
                        <p className="text-purple-400 text-xs font-medium">{agent}</p>
                        <Loader2 className="h-3 w-3 animate-spin text-purple-500 mx-auto mt-1" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {ragResult && !ragLoading && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-white font-semibold">AI Analysis Complete</span>
                      <span className="text-slate-500 text-xs">({ragResult.executionTime}ms)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{ragResult.supportingResponses?.length + 1} agents</span>
                      <button onClick={() => { setRagResult(null); setShowRagPanel(false); }}>
                        <X className="h-4 w-4 text-slate-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
                      {ragResult.unifiedResponse || ragResult.primaryResponse?.content}
                    </p>
                  </div>
                  {/* Agent contributions */}
                  {ragResult.supportingResponses && ragResult.supportingResponses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Agent Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {[ragResult.primaryResponse, ...ragResult.supportingResponses]
                          .filter(r => r.confidence > 0)
                          .map((r, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 text-xs text-slate-300">
                              <div className={`w-2 h-2 rounded-full ${r.confidence > 0.8 ? 'bg-green-400' : r.confidence > 0.5 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                              {r.agentId} · {Math.round(r.confidence * 100)}%
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Stats Overview ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {[
          { label: 'Systems', value: stats?.overview?.systems || 0, icon: Settings, color: 'blue', href: '/systems', change: '+10' },
          { label: 'Wires', value: stats?.overview?.wires || 0, icon: Cable, color: 'cyan', href: '/wires', change: '' },
          { label: 'Drawings', value: stats?.overview?.drawings || 0, icon: FileText, color: 'purple', href: '/drawings', change: '' },
          { label: 'Equipment', value: stats?.overview?.equipment || 0, icon: Box, color: 'orange', href: '/equipment', change: '' },
          { label: 'Connectors', value: stats?.overview?.connectors || 0, icon: Link2, color: 'green', href: '/connectors', change: '' },
          { label: 'Pins', value: stats?.overview?.pins || 0, icon: Layers, color: 'amber', href: '/pins', change: '' },
        ].map((stat, index) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="glass-card p-5 cursor-pointer group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`inline-flex p-2.5 bg-${stat.color}-500/15 rounded-xl mb-3 group-hover:bg-${stat.color}-500/25 transition-colors`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
              </div>
              <div className={`mt-3 flex items-center text-${stat.color}-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity`}>
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ─── Quick Drawing Lookup + Car Fleet Row ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Drawing Lookup (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Eye className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quick Drawing Lookup</h2>
              <p className="text-xs text-slate-400">Direct drawing search with PDF viewer</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Enter drawing number (e.g., 942-38309)..."
                value={drawingSearch}
                onChange={e => setDrawingSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchDrawing()}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-600 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 focus:outline-none text-sm transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={searchDrawing}
              disabled={!drawingSearch || drawingLoading}
              className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              {drawingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </motion.button>
          </div>

          {/* Drawing Result */}
          <AnimatePresence>
            {drawingError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-red-300 text-sm">{drawingError}</span>
                <button onClick={() => setDrawingError(null)} className="ml-auto"><X className="h-4 w-4 text-red-400" /></button>
              </motion.div>
            )}
            {drawingResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 p-5 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono font-bold text-xl text-white">{drawingResult.drawingNo}</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">{drawingResult.drawingType || drawingResult.systemCode}</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">{drawingResult.carType || 'ALL'}</span>
                    </div>
                    <p className="text-white font-semibold text-sm mb-2">{drawingResult.title}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>System: {drawingResult.subsystem || drawingResult.systemCode}</span>
                      <span>Pages: {drawingResult.pageCount}</span>
                      {drawingResult.relatedWires?.length > 0 && (
                        <span className="text-cyan-400">{drawingResult.relatedWires.length} wires</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Link href={`/drawings/${drawingResult.drawingNo}`}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                    <button onClick={() => { setDrawingResult(null); setDrawingSearch(''); }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Related Wires preview */}
                {drawingResult.relatedWires && drawingResult.relatedWires.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <p className="text-xs text-slate-500 mb-2 font-semibold">Connected Wires</p>
                    <div className="flex flex-wrap gap-1.5">
                      {drawingResult.relatedWires.slice(0, 8).map((w, i) => (
                        <Link key={i} href={`/wires/${w.wireNo}`}
                          className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/20 transition-all font-mono">
                          {w.wireNo}
                        </Link>
                      ))}
                      {drawingResult.relatedWires.length > 8 && (
                        <span className="px-2 py-0.5 text-slate-500 text-xs">+{drawingResult.relatedWires.length - 8} more</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Car Fleet Overview (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Car className="h-5 w-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Fleet Overview</h2>
          </div>
          <div className="space-y-3">
            {CAR_TYPES.map(car => {
              const count = stats?.byCarType?.[car.type] || 0;
              return (
                <Link key={car.type} href={`/cars/${car.type}`}>
                  <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${car.color} flex items-center justify-center text-lg`}>
                      {car.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{car.type}</p>
                      <p className="text-slate-500 text-xs truncate">{car.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{count}</p>
                      <p className="text-slate-500 text-xs">wires</p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
          <Link href="/cars/tree"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all">
            <Map className="h-4 w-4" /> View Car Tree
          </Link>
        </motion.div>
      </div>

      {/* ─── System Cards ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-400" />
            System Architecture
          </h2>
          <Link href="/systems" className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {SYSTEM_GROUPS.map((system, index) => {
            const dbSystem = stats?.systems?.find(s => s.code === system.code);
            const deviceCount = dbSystem?.deviceCount || 0;

            return (
              <Link key={system.code} href={`/systems/${system.code}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.04 }}
                  whileHover={{ scale: 1.04, y: -6 }}
                  className={`glass-card overflow-hidden group cursor-pointer border ${system.borderColor} relative`}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 ${system.glow} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                  
                  {/* Header gradient */}
                  <div className={`bg-gradient-to-r ${system.gradient} p-4 relative`}>
                    <div className="flex items-center justify-between">
                      <system.icon className="h-8 w-8 text-white drop-shadow-lg" />
                      <span className="text-white/70 text-xs font-medium px-2 py-0.5 rounded-full bg-white/10">
                        {system.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl text-white mt-2">{system.code}</h3>
                  </div>

                  {/* Content */}
                  <div className="p-4 relative">
                    <h4 className="font-bold text-sm text-white mb-1 leading-snug">{system.name}</h4>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{system.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>{deviceCount} equip.</span>
                      </div>
                      <span className="text-cyan-400 flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all">
                        Explore <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Data Access + AI Intelligence Row ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Data Access */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" />
            Data Explorer
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Drawings', icon: FileText, href: '/drawings', color: 'purple', count: stats?.overview?.drawings },
              { label: 'Wires', icon: Cable, href: '/wires', color: 'cyan', count: stats?.overview?.wires },
              { label: 'Connectors', icon: Link2, href: '/connectors', color: 'green', count: stats?.overview?.connectors },
              { label: 'Equipment', icon: Box, href: '/equipment', color: 'orange', count: stats?.overview?.equipment },
              { label: 'Pins', icon: Layers, href: '/pins', color: 'amber', count: stats?.overview?.pins },
              { label: 'Trainlines', icon: Train, href: '/trainlines', color: 'blue', count: 0 },
            ].map(item => (
              <Link key={item.label} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer group"
                >
                  <div className={`p-2 rounded-lg bg-${item.color}-500/15 group-hover:bg-${item.color}-500/25 transition-colors`}>
                    <item.icon className={`h-4 w-4 text-${item.color}-400`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold">{item.label}</p>
                    {item.count !== undefined && item.count > 0 && (
                      <p className="text-slate-500 text-xs">{item.count.toLocaleString()} records</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* AI Intelligence Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-400" />
            AI Intelligence
          </h2>
          <div className="space-y-3">
            {[
              {
                title: 'Multi-Agent RAG',
                desc: 'LangChain-powered parallel analysis across all data sources',
                icon: Atom,
                color: 'purple',
                href: '/ai-assistant',
                badge: '5 Agents',
              },
              {
                title: 'Wire Circuit Tracer',
                desc: 'Trace wire paths across all cars and drawings',
                icon: GitBranch,
                color: 'cyan',
                href: '/wires/trace',
                badge: 'Interactive',
              },
              {
                title: 'Drawing Intelligence',
                desc: 'AI analysis of drawing content, connectors and wiring',
                icon: Eye,
                color: 'green',
                href: '/drawings',
                badge: 'PDF + AI',
              },
              {
                title: 'System Analysis',
                desc: 'Deep dive into any VCC system with AI explanations',
                icon: Target,
                color: 'orange',
                href: '/ai-assistant',
                badge: 'LLM',
              },
            ].map(item => (
              <Link key={item.title} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer group"
                >
                  <div className={`p-2 rounded-lg bg-${item.color}-500/15 group-hover:bg-${item.color}-500/25 transition-colors`}>
                    <item.icon className={`h-4 w-4 text-${item.color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">{item.title}</p>
                      <span className={`px-1.5 py-0.5 rounded text-xs bg-${item.color}-500/20 text-${item.color}-400 font-medium`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Quick Links ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_LINKS.map((link, index) => (
            <Link key={link.label} href={link.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass-card p-5 group cursor-pointer text-center"
              >
                <div className={`w-12 h-12 rounded-2xl bg-${link.color}-500/15 group-hover:bg-${link.color}-500/25 flex items-center justify-center mx-auto mb-3 transition-colors`}>
                  <link.icon className={`h-6 w-6 text-${link.color}-400`} />
                </div>
                <p className="font-bold text-sm text-white">{link.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ─── Database Status Footer ────────────────────────────────────── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4 flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Database Connected</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>{stats.overview.drawings} drawings</span>
            <span>{stats.overview.wires} wires</span>
            <span>{stats.overview.connectors} connectors</span>
            <span>{stats.overview.equipment} equipment items</span>
            <span>{stats.overview.pins} pins indexed</span>
          </div>
          <div className="ml-auto">
            <Link href="/admin"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors">
              <Settings className="h-3.5 w-3.5" /> Admin
            </Link>
          </div>
        </motion.div>
      )}

    </div>
  );
}
