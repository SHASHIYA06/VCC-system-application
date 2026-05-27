'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, StatCard, GlassPanel } from '@/components/ui';
import {
  Train, ShieldCheck, ShieldAlert, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Link2, Search, ChevronRight, Layers,
  Cpu, Cable, FileText, AlertTriangle, Eye, X, Database, Map,
  TrendingUp, Sparkles, Bot, Brain, GitBranch, Network,
  CheckCircle2, Clock, Loader2, BarChart3, Gauge, Wifi,
  BookOpen, Wrench, Car, ArrowUpRight, RefreshCw, Play,
  Atom, Lightbulb, Target, Sliders
} from 'lucide-react';

const PdfViewerEnhanced = dynamic(() => import('@/components/pdf/PdfViewerEnhanced'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto mb-2" />
        <p className="text-slate-400 text-xs font-mono">Mounting PDF Renderer...</p>
      </div>
    </div>
  )
});

const GraphViewer = dynamic(() => import('@/components/ui/GraphViewer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto mb-2" />
        <p className="text-slate-400 text-xs font-mono">Loading Interactive Graph Viewer...</p>
      </div>
    </div>
  )
});

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
  systems: Array<{ code: string; name: string; deviceCount: number; drawingCount: number; category: string }>;
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

interface AISearchResult {
  query: string;
  primaryResponse: {
    agent: string;
    content: string;
    confidence: number;
  };
  unifiedResponse: string;
  allData: Record<string, unknown>;
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
    glow: 'shadow-slate-500/20',
    color: 'blue' as const,
    borderColor: 'border-slate-500/20',
  },
  {
    code: 'TRL',
    name: 'Trainlines',
    category: 'Core Systems',
    description: 'Train line control, signal, low/high tension power distribution',
    icon: Train,
    gradient: 'from-blue-700 via-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/20',
    color: 'blue' as const,
    borderColor: 'border-blue-500/20',
  },
  {
    code: 'CAB',
    name: 'Cab Control & Status',
    category: 'Core Systems',
    description: 'Controlling cab, startup sequence, status indication, MCB trip',
    icon: Activity,
    gradient: 'from-violet-700 via-purple-500 to-violet-600',
    glow: 'shadow-violet-500/20',
    color: 'purple' as const,
    borderColor: 'border-purple-500/20',
  },
  {
    code: 'TRAC',
    name: 'Traction & Propulsion',
    category: 'Propulsion',
    description: 'Speed control, VVVF inverter control, traction return current',
    icon: Zap,
    gradient: 'from-orange-600 via-amber-500 to-orange-600',
    glow: 'shadow-orange-500/20',
    color: 'orange' as const,
    borderColor: 'border-orange-500/20',
  },
  {
    code: 'BRAKE',
    name: 'Brake System',
    category: 'Safety',
    description: 'Compressor, brake loop, emergency brake, parking brake, horn',
    icon: ShieldCheck,
    gradient: 'from-red-700 via-rose-500 to-red-600',
    glow: 'shadow-red-500/20',
    color: 'red' as const,
    borderColor: 'border-red-500/20',
  },
  {
    code: 'APS',
    name: 'Auxiliary Power Supply',
    category: 'Power',
    description: 'APS, shore supply, battery control, auxiliary circuits',
    icon: Battery,
    gradient: 'from-green-700 via-emerald-500 to-green-600',
    glow: 'shadow-green-500/20',
    color: 'green' as const,
    borderColor: 'border-green-500/20',
  },
  {
    code: 'DOOR',
    name: 'Door System',
    category: 'Core Systems',
    description: 'Door operation, proving loop, local interlock, TMS interface',
    icon: DoorOpen,
    gradient: 'from-amber-600 via-yellow-500 to-amber-600',
    glow: 'shadow-amber-500/20',
    color: 'amber' as const,
    borderColor: 'border-amber-500/20',
  },
  {
    code: 'VAC',
    name: 'Ventilation & AC',
    category: 'Comfort',
    description: 'Cab VAC, saloon VAC power and control, HVAC management',
    icon: Wind,
    gradient: 'from-cyan-700 via-teal-500 to-cyan-600',
    glow: 'shadow-cyan-500/20',
    color: 'cyan' as const,
    borderColor: 'border-cyan-500/20',
  },
  {
    code: 'COMMS',
    name: 'Communications',
    category: 'Communication',
    description: 'PIS, PA system, CCTV, Radio communication, CBTC',
    icon: Radio,
    gradient: 'from-emerald-700 via-green-500 to-emerald-600',
    glow: 'shadow-emerald-500/20',
    color: 'green' as const,
    borderColor: 'border-emerald-500/20',
  },
  {
    code: 'TMS',
    name: 'TCMS',
    category: 'Control',
    description: 'Train Control Management System, RIO, Terminal Block, diagnostics',
    icon: Cpu,
    gradient: 'from-purple-700 via-fuchsia-500 to-purple-600',
    glow: 'shadow-purple-500/20',
    color: 'purple' as const,
    borderColor: 'border-purple-500/20',
  },
];

const QUICK_LINKS = [
  { label: 'Trainlines', icon: Train, href: '/trainlines', color: 'blue' as const, desc: 'All train lines' },
  { label: 'Cars', icon: Car, href: '/cars', color: 'orange' as const, desc: 'DMC, TC, MC' },
  { label: 'Documents', icon: FileText, href: '/documents', color: 'cyan' as const, desc: 'PDF library' },
  { label: 'System Tree', icon: Map, href: '/systems/tree', color: 'purple' as const, desc: 'Hierarchy view' },
  { label: 'Wire Trace', icon: Cable, href: '/wires/trace', color: 'green' as const, desc: 'Path tracing' },
  { label: 'AI Assistant', icon: Bot, href: '/ai-assistant', color: 'pink' as const, desc: 'Smart queries' },
];

const CAR_TYPES = [
  { type: 'DMC', name: 'Driving Motor Car', color: 'from-blue-600 to-cyan-600', icon: '🚃', desc: 'Driver cab + traction' },
  { type: 'TC',  name: 'Trailer Car',        color: 'from-purple-600 to-violet-600', icon: '🚋', desc: 'Passenger only' },
  { type: 'MC',  name: 'Motor Car',          color: 'from-orange-600 to-amber-600', icon: '🚄', desc: 'Motor + passenger' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'gsd' | 'diagnostics'>('explorer');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('database');

  // Drawing lookup
  const [drawingSearch, setDrawingSearch] = useState('');
  const [drawingResult, setDrawingResult] = useState<DrawingResult | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingError, setDrawingError] = useState<string | null>(null);
  const [showInlinePdf, setShowInlinePdf] = useState(false);
  const [inlinePdfPage, setInlinePdfPage] = useState(1);

  // AI Search State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // GSD Data State
  const [gsdData, setGsdData] = useState<any | null>(null);
  const [gsdLoading, setGsdLoading] = useState(false);

  // Diagnostics Data State
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<any | null>(null);

  // AI Agent Parameters
  const [aiModel, setAiModel] = useState('opencode-minimax');
  const [aiTemperature, setAiTemperature] = useState(0.2);
  const [aiConfidenceLimit, setAiConfidenceLimit] = useState(0.75);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (response.ok && data.overview) {
        setStats(data);
        setDataSource(data.overview.dataSource || 'database');
      }
    } catch {
      setError('Failed to load database stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGsd = async () => {
    setGsdLoading(true);
    try {
      const res = await fetch('/api/gsd');
      if (res.ok) {
        const data = await res.json();
        setGsdData(data);
      }
    } catch (err) {
      console.error('Failed to fetch GSD:', err);
    } finally {
      setGsdLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/analysis/wiring');
      if (res.ok) {
        const data = await res.json();
        setAnalysisData(data);
      }
    } catch (err) {
      console.error('Failed to fetch wiring analysis:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'gsd') {
      fetchGsd();
    } else if (activeTab === 'diagnostics') {
      fetchAnalysis();
    }
  }, [activeTab]);

  const handleBackfill = async () => {
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const res = await fetch('/api/fix/backfill-wires', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackfillResult(data.summary);
        // Refresh data
        fetchAnalysis();
        fetchStats();
      } else {
        alert(data.error || 'Database backfill failed.');
      }
    } catch (err) {
      console.error('Backfill call failed:', err);
      alert('Failed to connect to backfill API endpoint.');
    } finally {
      setBackfilling(false);
    }
  };

  async function searchDrawing() {
    if (!drawingSearch.trim()) return;
    setDrawingLoading(true);
    setDrawingError(null);
    setDrawingResult(null);
    setShowInlinePdf(false);
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
        
        // Find mapped page if available
        if (data.drawing.sourceFile) {
          const mappingRes = await fetch(`/api/drawings/pdf-mapping?drawing_no=${encodeURIComponent(data.drawing.drawingNo)}&source_file=${encodeURIComponent(data.drawing.sourceFile)}`);
          if (mappingRes.ok) {
            const mappingData = await mappingRes.json();
            if (mappingData.pdfPageNo) {
              setInlinePdfPage(mappingData.pdfPageNo);
            }
          }
        }
      } else {
        setDrawingError(data.error || 'Drawing not found. Check number formatting.');
      }
    } catch {
      setDrawingError('Search failed — check connection');
    } finally {
      setDrawingLoading(false);
    }
  }

  async function searchAI() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery.trim(),
          taskType: 'unified_search',
          useMultiAgent: true,
          model: aiModel,
          temperature: aiTemperature,
          confidenceThreshold: aiConfidenceLimit
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAiResult(data);
      } else {
        setAiError(data.error || 'AI search failed');
      }
    } catch (err) {
      setAiError('Failed to connect to AI service');
    } finally {
      setAiLoading(false);
    }
  }

  function handleQuickQuery(query: string) {
    setAiQuery(query);
    setTimeout(() => searchAI(), 100);
  }

  // Simulated fallback mockup result
  const mockupDrawingResult: DrawingResult = {
    id: 'mockup-id',
    drawingNo: 'CAB_PIN DRAWINGS',
    title: 'Intercar Jumper & Connector Layout - TC Car',
    revision: 'Rev. 4',
    carType: 'TC',
    subsystem: 'CAB',
    drawingType: 'SCHEMATIC',
    pageCount: 14,
    systemCode: 'CAB',
    sourceFile: 'CAB_PIN DRAWINGS.pdf',
    notes: 'Primary connector assignment details for CAB signals.',
    relatedWires: [
      { wireNo: '3001', signalName: 'CAB_START', wireColor: 'RD' },
      { wireNo: '3002', signalName: 'CAB_RUN', wireColor: 'BU' },
      { wireNo: '3003', signalName: 'CAB_STOP', wireColor: 'BK' },
    ],
    relatedEquipment: [
      { name: 'Cab Controller Main', tag: 'CCU-1', carType: 'DMC' },
      { name: 'Driver Console Panel', tag: 'DCP-A', carType: 'DMC' },
    ]
  };

  const activeDrawing = drawingResult || (drawingSearch === '' ? mockupDrawingResult : null);

  const flowNodes = gsdData?.network?.nodes?.map((n: any, idx: number) => ({
    id: n.id,
    type: 'default',
    position: { x: (idx % 4) * 240 + 50, y: Math.floor(idx / 4) * 160 + 50 },
    data: { label: `${n.id} (${n.connections})` },
    style: {
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#06b6d4',
      border: '2px solid rgba(6, 182, 212, 0.4)',
      borderRadius: '12px',
      padding: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      width: 180,
      textAlign: 'center',
    }
  })) || [];

  const flowEdges = gsdData?.network?.edges?.map((e: any, idx: number) => ({
    id: `e-${idx}`,
    source: e.from,
    target: e.to,
    label: e.label,
    animated: true,
    style: { stroke: '#0ea5e9', strokeWidth: 2 },
    labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-8 relative overflow-x-hidden">
      
      {/* Background glow elements */}
      <div className="glow-orb glow-orb-cyan" />
      <div className="glow-orb glow-orb-purple" />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Welcome back, Alex! 👋</p>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-cyan-400 font-semibold shadow-lg shadow-cyan-500/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          System Synced to Neon PostgreSQL
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 max-w-lg relative z-10">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'explorer' 
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="h-4 w-4" />
          System Explorer
        </button>
        <button
          onClick={() => setActiveTab('gsd')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'gsd' 
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="h-4 w-4" />
          GSD Topology
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'diagnostics' 
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Diagnostics & AI
        </button>
      </div>

      {/* TAB CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: SYSTEM EXPLORER */}
        {activeTab === 'explorer' && (
          <motion.div
            key="explorer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8 relative z-10"
          >
            {/* Quick Drawing Lookup (Search Card) */}
            <div className="w-full">
              <GlassPanel
                title="Quick Drawing Lookup"
                subtitle="Search drawings in PostgreSQL"
                icon={<Search className="h-5 w-5" />}
                variant="elevated"
                glow={false}
                className="w-full"
              >
                <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
                    <input
                      type="text"
                      placeholder="Enter Drawing Number, e.g., 942-58120, 942-38301"
                      value={drawingSearch}
                      onChange={e => setDrawingSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchDrawing()}
                      className="w-full pl-11 pr-4 py-3 text-sm bg-slate-950/80 border border-slate-800/80 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
                    />
                  </div>
                  <GlassButton
                    variant="primary"
                    size="md"
                    onClick={searchDrawing}
                    disabled={drawingLoading}
                    className="w-full md:w-auto md:px-8 py-3 shrink-0"
                  >
                    {drawingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find Drawing'}
                  </GlassButton>
                </div>

                {drawingError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mt-4">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{drawingError}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {activeDrawing && (
                    <motion.div
                      key={activeDrawing.drawingNo}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-6"
                    >
                      <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Search Result</h4>
                      <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/80 bg-gradient-to-r from-cyan-500/10 to-transparent p-6 md:p-8 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-xl">
                        <div className="absolute top-0 right-0 p-4">
                          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-wider uppercase">
                            {activeDrawing.drawingNo === 'CAB_PIN DRAWINGS' ? 'Mockup Preview' : 'Database Match'}
                          </span>
                        </div>

                        <h3 className="text-2xl font-extrabold text-white tracking-tight mb-4">
                          {activeDrawing.drawingNo}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6 max-w-3xl">
                          <div className="space-y-3">
                            <div>
                              <span className="text-slate-400 mr-2">Type:</span>
                              <span className="text-slate-200 font-semibold">{activeDrawing.drawingType || 'Electrical Schematic'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 mr-2">Car Type:</span>
                              <span className="text-slate-200 font-semibold">{activeDrawing.carType || 'TC / DMC / MC'}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-slate-400 mr-2">Title:</span>
                              <span className="text-slate-200 font-semibold">{activeDrawing.title}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 mr-2">System:</span>
                              <span className="text-slate-200 font-semibold">
                                {activeDrawing.drawingNo === 'CAB_PIN DRAWINGS' ? 'CAB' : (activeDrawing.systemCode || 'General')}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 mr-2">Pages:</span>
                              <span className="text-slate-200 font-semibold">{activeDrawing.pageCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                          <button
                            onClick={() => setShowInlinePdf(!showInlinePdf)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                          >
                            <FileText className="h-4 w-4" /> 
                            {showInlinePdf ? 'Hide Inline PDF' : 'View PDF'}
                          </button>
                          
                          {activeDrawing.sourceFile && (
                            <span className="text-xs text-slate-500 italic">
                              Source: {activeDrawing.sourceFile}
                            </span>
                          )}
                        </div>

                        {/* Connector Wire Details */}
                      {activeDrawing.relatedWires && activeDrawing.relatedWires.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-cyan-500/20">
                          <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Cable className="h-3.5 w-3.5 text-cyan-400" />
                            Connected Wire Details
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono">
                              <thead>
                                <tr className="border-b border-slate-800">
                                  <th className="text-left text-slate-500 py-1.5 pr-3 font-bold uppercase tracking-wider">Wire No.</th>
                                  <th className="text-left text-slate-500 py-1.5 pr-3 font-bold uppercase tracking-wider">Signal Name</th>
                                  <th className="text-left text-slate-500 py-1.5 pr-3 font-bold uppercase tracking-wider">Color</th>
                                  <th className="text-left text-slate-500 py-1.5 font-bold uppercase tracking-wider">Source → Dest</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeDrawing.relatedWires.slice(0, 15).map((w, i) => (
                                  <tr key={i} className="border-b border-slate-900/60 hover:bg-slate-900/30 transition-colors">
                                    <td className="py-1.5 pr-3">
                                      <Link href={`/wires?wire=${w.wireNo}`} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                        {w.wireNo}
                                      </Link>
                                    </td>
                                    <td className="py-1.5 pr-3 text-slate-300">{w.signalName || '—'}</td>
                                    <td className="py-1.5 pr-3">
                                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">{w.wireColor || '—'}</span>
                                    </td>
                                    <td className="py-1.5 text-slate-500">
                                      {(w as any).sourceConnector || '—'} → {(w as any).destConnector || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {activeDrawing.relatedWires.length > 15 && (
                              <p className="text-[10px] text-slate-500 mt-2">+{activeDrawing.relatedWires.length - 15} more wire details available</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>
          </div>

            {/* Inline Drawing PDF Rendering below Search Result */}
            <AnimatePresence>
              {showInlinePdf && activeDrawing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-2xl relative"
                >
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-cyan-400" />
                      <span className="font-bold text-white text-sm">{activeDrawing.drawingNo} - PDF Viewer</span>
                    </div>
                    <button
                      onClick={() => setShowInlinePdf(false)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="h-[80vh] relative">
                    <PdfViewerEnhanced
                      src={activeDrawing.sourceFile
                        ? `/api/pdf/${encodeURIComponent(activeDrawing.sourceFile)}`
                        : (() => {
                          const upper = (activeDrawing.drawingNo || '').toUpperCase();
                          if (upper.match(/942-?38[1-2]/)) return `/api/pdf/${encodeURIComponent('CAB_PIN DRAWINGS.pdf')}`;
                          if (upper.match(/942-?383/)) return `/api/pdf/${encodeURIComponent('DMC UF_PIN DRAWINGS.pdf')}`;
                          if (upper.match(/942-?384/)) return `/api/pdf/${encodeURIComponent('DMC_CEILING.pdf')}`;
                          if (upper.match(/942-?385/)) return `/api/pdf/${encodeURIComponent('TC _UF PIN DRAWINGS.pdf')}`;
                          if (upper.match(/942-?386/)) return `/api/pdf/${encodeURIComponent('TC_CEILING PIN DRAWINGS.pdf')}`;
                          if (upper.match(/942-?387/)) return `/api/pdf/${encodeURIComponent('MC_CEILING_PIN DRAWINGS.pdf')}`;
                          return `/api/pdf/${encodeURIComponent('KMRCL VCC Drawings_OCR.pdf')}`;
                        })()
                      }
                      initialPage={inlinePdfPage}
                      title={`${activeDrawing.drawingNo} - ${activeDrawing.title}`}
                      onClose={() => setShowInlinePdf(false)}
                      inline={true}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Statistics Cards (6 Cards with 3D Spring Tilt) */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                Vehicle Interface Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/systems" className="block">
                  <StatCard
                    icon={<Layers className="h-6 w-6" />}
                    label="Systems"
                    value={stats?.overview?.systems || 42}
                    subtext="All train subsystems"
                    color="purple"
                    dataSource={dataSource}
                  />
                </Link>
                <Link href="/wires" className="block">
                  <StatCard
                    icon={<Cable className="h-6 w-6" />}
                    label="Wires"
                    value={stats?.overview?.wires || 19016}
                    subtext="Sampled circuit connections"
                    color="cyan"
                    dataSource={dataSource}
                  />
                </Link>
                <Link href="/drawings" className="block">
                  <StatCard
                    icon={<FileText className="h-6 w-6" />}
                    label="Drawings"
                    value={stats?.overview?.drawings || 574}
                    subtext="Active schematics indexed"
                    color="blue"
                    dataSource={dataSource}
                  />
                </Link>
                <Link href="/equipment" className="block">
                  <StatCard
                    icon={<Settings className="h-6 w-6" />}
                    label="Equipment"
                    value={stats?.overview?.equipment || 210}
                    subtext="Physical devices classified"
                    color="indigo"
                    dataSource={dataSource}
                  />
                </Link>
                <Link href="/connectors" className="block">
                  <StatCard
                    icon={<Link2 className="h-6 w-6" />}
                    label="Connectors"
                    value={stats?.overview?.connectors || 1430}
                    subtext="Intercar/device plugs"
                    color="pink"
                    dataSource={dataSource}
                  />
                </Link>
                <Link href="/pins" className="block">
                  <StatCard
                    icon={<Box className="h-6 w-6" />}
                    label="Pins"
                    value={stats?.overview?.pins || 80470}
                    subtext="Signal allocation points"
                    color="green"
                    dataSource={dataSource}
                  />
                </Link>
              </div>
            </div>

            {/* Car Fleet Overview & Navigation Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Fleet Overview (2/3 width) */}
              <Card3D interactive={false} glowColor="cyan" className="lg:col-span-2">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-lg">
                      🚃
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Car Fleet Overview</h3>
                      <p className="text-xs text-slate-400">Classified wiring allocations by car type</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CAR_TYPES.map(car => {
                      const count = stats?.byCarType?.[car.type] || (car.type === 'DMC' ? 7800 : car.type === 'TC' ? 5600 : 5616);
                      return (
                        <Link key={car.type} href={`/cars/${car.type}`} className="block">
                          <motion.div 
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between h-full min-h-[120px] group"
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-2xl">{car.icon}</span>
                              <div className="text-right">
                                <span className="text-2xl font-extrabold text-white font-mono">{count}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">wires</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{car.type}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{car.desc}</p>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </Card3D>

              {/* Data Explorer Quick Navigation (1/3 width) */}
              <Card3D interactive={false} glowColor="purple">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-400" />
                    Data Explorer
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Drawings', icon: FileText, href: '/drawings', color: 'purple' },
                      { label: 'Wires', icon: Cable, href: '/wires', color: 'cyan' },
                      { label: 'Connectors', icon: Link2, href: '/connectors', color: 'green' },
                      { label: 'Equipment', icon: Box, href: '/equipment', color: 'orange' },
                      { label: 'Pins', icon: Layers, href: '/pins', color: 'pink' },
                      { label: 'Trainlines', icon: Train, href: '/trainlines', color: 'blue' },
                    ].map(item => (
                      <Link key={item.label} href={item.href} className="block">
                        <div className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 group">
                          <item.icon className={`h-3.5 w-3.5 text-${item.color}-400 group-hover:scale-110 transition-transform`} />
                          <span className="text-slate-300 font-semibold group-hover:text-white transition-colors">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/cars/tree"
                    className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/60 text-slate-400 hover:text-white text-xs font-bold transition-all">
                    <Map className="h-3.5 w-3.5" /> View Car Tree
                  </Link>
                </div>
              </Card3D>

            </div>

            {/* System Architecture Grid Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                  <Network className="h-5 w-5 text-cyan-400" />
                  System Architecture
                </h2>
                <Link href="/systems" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                  View all systems <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {SYSTEM_GROUPS.map((system, index) => {
                  const dbSystem = stats?.systems?.find(s => s.code === system.code);
                  const deviceCount = dbSystem?.deviceCount || 0;

                  return (
                    <Link key={system.code} href={`/systems/${system.code}`} className="block">
                      <Card3D glowColor={system.color} variant="default" className="h-full">
                        <div className="h-full flex flex-col justify-between">
                          {/* Card header color gradient banner */}
                          <div className={`bg-gradient-to-r ${system.gradient} p-4 text-white relative flex items-center justify-between`}>
                            <system.icon className="h-6 w-6 drop-shadow-md text-white" />
                            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">
                              {system.category}
                            </span>
                          </div>
                          {/* Card Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between min-h-[140px]">
                            <div>
                              <h4 className="font-extrabold text-white text-base font-mono mb-1">{system.code}</h4>
                              <p className="font-bold text-xs text-slate-200 leading-snug line-clamp-1">{system.name}</p>
                              <p className="text-[10px] text-slate-400 mt-2 leading-normal line-clamp-2">{system.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-900">
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-cyan-400" /> {deviceCount} Devs · {dbSystem?.drawingCount || 0} Drgs
                              </span>
                              <span className="text-[10px] text-cyan-400 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Explore <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card3D>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant Section */}
            <GlassPanel
              title="Multi-Agent AI Search"
              subtitle="LangChain-powered · 5 parallel agents · RAG retrieval"
              icon={<Brain className="h-5 w-5" />}
              variant="elevated"
              glow={true}
              glowColor="purple"
            >
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Brain className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Ask anything: wire numbers, connectors, drawing details..."
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchAI()}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-800/85 focus:border-purple-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
                <GlassButton 
                  variant="info" 
                  size="lg"
                  onClick={searchAI}
                  disabled={!aiQuery.trim() || aiLoading}
                >
                  {aiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Atom className="h-5 w-5" />}
                  Analyze
                </GlassButton>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {['Wire 3003', 'Connector APS_CN1', 'Drawing MC_UF', 'TRAC System', 'Brake Circuit'].map(q => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuery(q)}
                    className="px-3 py-1 rounded-lg bg-slate-950/50 hover:bg-slate-900/80 text-slate-400 hover:text-white text-xs border border-slate-800 transition-all cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {aiError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-sm"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-red-300">{aiError}</span>
                    <button onClick={() => setAiError(null)} className="ml-auto">
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </motion.div>
                )}
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 space-y-4"
                  >
                    <div className="p-5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-purple-400" />
                          <span className="text-sm font-semibold text-purple-400">
                            {aiResult.primaryResponse.agent}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono">
                            {aiResult.executionTime}ms
                          </span>
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                            {Math.round(aiResult.primaryResponse.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-100 leading-relaxed text-sm whitespace-pre-wrap font-sans">
                        {aiResult.unifiedResponse}
                      </p>
                    </div>

                    {Object.keys(aiResult.allData).length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                          <Database className="h-4 w-4 text-cyan-400" />
                          Retrieved Reference Objects
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(aiResult.allData).map(([key, value]) => (
                            <div key={key} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
                              <div className="text-xs text-slate-500 mb-1">{key}</div>
                              <div className="text-lg font-extrabold text-cyan-400 font-mono">
                                {Array.isArray(value) ? value.length : (value !== null && typeof value === 'object') ? Object.keys(value).length : String(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>
          </motion.div>
        )}

        {/* TAB 2: GSD TOPOLOGY */}
        {activeTab === 'gsd' && (
          <motion.div
            key="gsd"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8 relative z-10"
          >
            {gsdLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Mapping Ground Support Device (GSD) Topology...</p>
              </div>
            ) : gsdData ? (
              <>
                {/* GSD Topology Stats Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Total Systems</div>
                    <div className="text-2xl font-extrabold text-white mt-1 font-mono">{gsdData.metadata.totalSystems}</div>
                  </div>
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Active Drawings</div>
                    <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{gsdData.metadata.totalDrawings}</div>
                  </div>
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Devices/Equipment</div>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{gsdData.metadata.totalDevices}</div>
                  </div>
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Connectors mapped</div>
                    <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{gsdData.metadata.totalConnectors}</div>
                  </div>
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 col-span-2 md:col-span-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Wires Traced</div>
                  <div className="text-2xl font-extrabold text-pink-400 mt-1 font-mono">{gsdData.metadata.totalWires}</div>
                  </div>
                </div>

                {/* Interactive Network Graph */}
                <GlassPanel
                  title="Interactive System Connection Graph"
                  subtitle="Drag and inspect real-time system connections and trainlines"
                  icon={<Network className="h-5 w-5 text-cyan-400" />}
                  variant="elevated"
                  glow={true}
                  glowColor="cyan"
                >
                  <div className="h-[650px] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/40 relative">
                    <GraphViewer nodes={flowNodes} edges={flowEdges} />
                  </div>
                </GlassPanel>

                {/* Topology Layers Display */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Network className="h-5 w-5 text-cyan-400" />
                    Subsystem Architecture & GSD Mapping
                  </h2>
                  
                  <div className="space-y-6">
                    {gsdData.topology.map((layer: any, idx: number) => (
                      <div key={idx} className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60 backdrop-blur-xl">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-900 flex items-center justify-between">
                          <span>{layer.name} Subsystems</span>
                          <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-cyan-400 font-mono">
                            {layer.systems.length} system{layer.systems.length > 1 ? 's' : ''}
                          </span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {layer.systems.map((sys: any, sIdx: number) => (
                            <Link href={`/systems?code=${sys.code}`} key={sIdx} className="group">
                              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all duration-300 flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-slate-950 text-cyan-400 font-mono font-bold text-xs shrink-0 shadow-inner group-hover:bg-cyan-950/50 group-hover:text-cyan-300">
                                  {sys.code}
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                                    {sys.name}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" /> {sys.drawings} dwg{sys.drawings !== 1 ? 's' : ''}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Wrench className="h-3 w-3" /> {sys.devices} device{sys.devices !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center bg-slate-950/40 border border-slate-800 rounded-2xl">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                <p className="text-slate-400">Failed to render GSD Topology. Please verify db connections.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: DIAGNOSTICS & AI SETUP */}
        {activeTab === 'diagnostics' && (
          <motion.div
            key="diagnostics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8 relative z-10"
          >
            
            {/* Database Integrity Sync Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Wiring Health Summary */}
              <div className="lg:col-span-2 space-y-6">
                <GlassPanel
                  title="Database Integrity & Wiring Health"
                  subtitle="Validation rules run against schematics, connectors, and pins"
                  icon={<Activity className="h-5 w-5 text-cyan-400" />}
                  variant="elevated"
                >
                  {analysisLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mr-2" />
                      <span className="text-slate-400 text-sm">Querying Neon DB validation metrics...</span>
                    </div>
                  ) : analysisData ? (
                    <div className="space-y-6">
                      
                      {/* Metric gauges */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                          <div className="text-xs text-slate-500 font-bold uppercase">Pins Linked to Wires</div>
                          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
                            {analysisData.pins.percentageWithWire}%
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {analysisData.pins.withWire} / {analysisData.pins.sampled} sampled
                          </p>
                        </div>
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                          <div className="text-xs text-slate-500 font-bold uppercase">Connectors with Pins</div>
                          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                            {Math.round((analysisData.connectors.withPins / analysisData.connectors.total) * 100)}%
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {analysisData.connectors.withPins} / {analysisData.connectors.total} active plugs
                          </p>
                        </div>
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                          <div className="text-xs text-slate-500 font-bold uppercase">Traced Wires Linked</div>
                          <div className="text-3xl font-extrabold text-purple-400 font-mono mt-1">
                            {analysisData.wires.connectionPercentage}%
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {analysisData.wires.withBoth} / {analysisData.wires.sampled} wires linked
                          </p>
                        </div>
                      </div>

                      {/* DB Integrity issues list */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Integrity Issues Detected</h4>
                        <div className="divide-y divide-slate-850 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
                          {analysisData.issues.map((issue: any, index: number) => (
                            <div key={index} className="p-3.5 flex items-start gap-3 hover:bg-slate-900/40 transition-colors">
                              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                                issue.severity === 'critical' ? 'text-red-400' : issue.severity === 'high' ? 'text-orange-400' : 'text-amber-400'
                              }`} />
                              <div className="space-y-0.5">
                                <div className="text-sm font-bold text-white">{issue.category} check</div>
                                <div className="text-xs text-slate-400">{issue.message}</div>
                              </div>
                              <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                issue.severity === 'critical' ? 'bg-red-500/10 text-red-400' : issue.severity === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {issue.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pin-Wire Backfill Utility Button */}
                      <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <Activity className="h-4 w-4 text-cyan-400" />
                            Database Relational Link Sync
                          </div>
                          <p className="text-xs text-slate-400 mt-1 max-w-lg">
                            Run high-speed PostgreSQL query pipelines to resolve pin-wire mismatches, synchronize OCR extracted wires, and fix missing connector wire details.
                          </p>
                        </div>
                        <GlassButton
                          variant="primary"
                          size="md"
                          onClick={handleBackfill}
                          disabled={backfilling}
                          className="w-full md:w-auto px-6 py-2.5 shrink-0"
                        >
                          {backfilling ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                              Syncing...
                            </>
                          ) : (
                            'Run Pin-Wire Backfill'
                          )}
                        </GlassButton>
                      </div>

                      {/* Backfill Result Toast */}
                      <AnimatePresence>
                        {backfillResult && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-300 space-y-2 animate-fade-in"
                          >
                            <div className="font-bold flex items-center gap-1.5 text-sm text-green-400">
                              <CheckCircle2 className="h-4 w-4" />
                              Neon DB Synchronization Successful!
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300 font-mono mt-1 pt-1 border-t border-green-500/10">
                              <div>Endpoints Linked: <span className="text-white font-bold">{backfillResult.endpointsLinked}</span></div>
                              <div>Pins Updated (via EP): <span className="text-white font-bold">{backfillResult.pinsUpdatedViaEndpoints}</span></div>
                              <div>Direct Wire Sources: <span className="text-white font-bold">{backfillResult.pinsUpdatedViaSources}</span></div>
                              <div>Direct Wire Dests: <span className="text-white font-bold">{backfillResult.pinsUpdatedViaDestinations}</span></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">Failed to load diagnostics information.</div>
                  )}
                </GlassPanel>
              </div>

              {/* AI Agent Configuration Parameters */}
              <div className="space-y-6">
                <GlassPanel
                  title="AI Analysis Setup"
                  subtitle="Parameters for Multi-Agent RAG execution"
                  icon={<Sliders className="h-5 w-5 text-purple-400" />}
                  variant="elevated"
                >
                  <div className="space-y-5 text-sm">
                    
                    {/* Primary Model */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Primary Agent Model</label>
                      <select
                        value={aiModel}
                        onChange={e => setAiModel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="opencode-minimax">OpenCode MiniMax M2.5 (Token-Saving Free)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Precision Parser)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-fast search)</option>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Advanced Reasoning)</option>
                        <option value="gpt-4o">GPT-4o (Cross-references)</option>
                      </select>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Temperature</span>
                        <span className="font-mono text-purple-400">{aiTemperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={aiTemperature}
                        onChange={e => setAiTemperature(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Precise (Fact-based)</span>
                        <span>Creative (Analogous)</span>
                      </div>
                    </div>

                    {/* Confidence Threshold */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Confidence Limit</span>
                        <span className="font-mono text-purple-400">{Math.round(aiConfidenceLimit * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="0.95"
                        step="0.05"
                        value={aiConfidenceLimit}
                        onChange={e => setAiConfidenceLimit(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Low (Permissive)</span>
                        <span>High (Strict OCR match)</span>
                      </div>
                    </div>

                    {/* Details status */}
                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>RAG Chunk size:</span>
                        <span className="font-mono text-white font-semibold">1,500 chars</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Index Name:</span>
                        <span className="font-mono text-white font-semibold">vcc_document_chunks</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Vector Dimensions:</span>
                        <span className="font-mono text-white font-semibold">1,536 (OpenAI-ADA)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Active Agents:</span>
                        <span className="font-mono text-cyan-400 font-semibold">5 (Parallel)</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
                      <Bot className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Changes are loaded directly into the AI assistant query headers for active context pruning.</span>
                    </div>

                  </div>
                </GlassPanel>
              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Database Connected Status Footer */}
      {stats && activeTab === 'explorer' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 flex flex-wrap items-center gap-4 relative z-10 border border-slate-800/80"
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
