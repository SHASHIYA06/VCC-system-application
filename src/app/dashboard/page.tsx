'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, StatCard, GlassPanel } from '@/components/ui';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import GSDPiVisualization from '@/components/gsd/GSDPiVisualization';
import SystemHealthCard from '@/components/dashboard/SystemHealthCard';
import DiagnosticsPanel from '@/components/diagnostics/DiagnosticsPanel';
import { DrawingDetailsPanel } from '@/components/dashboard/DrawingDetailsPanel';
import {
  Train, ShieldCheck, ShieldAlert, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Link2, Search, ChevronRight, Layers, Sparkles, Rocket, Cpu, 
  Cable, FileText, AlertTriangle, Eye, X, Database, Map, TrendingUp, Bot, Brain, 
  GitBranch, Network, CheckCircle2, Clock, Loader2, BarChart3, Gauge, Wifi,
  BookOpen, Wrench, Car, ArrowUpRight, RefreshCw, Play, Atom, Lightbulb, 
  Target, Sliders, Command, Zap as Lightning, Star
} from 'lucide-react';

const PdfViewerEnhanced = dynamic(() => import('@/components/pdf/EnhancedPdfViewer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center glass-card-premium">
      <div className="text-center">
        <div className="loading-advanced mx-auto mb-6"></div>
        <p className="text-white/80 text-sm font-mono uppercase tracking-wider">Initializing Holographic PDF Renderer...</p>
        <div className="mt-4 h-1 w-32 mx-auto bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-accent rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
});

const GraphViewer = dynamic(() => import('@/components/ui/GraphViewer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center glass-card-premium">
      <div className="text-center">
        <div className="loading-advanced mx-auto mb-6"></div>
        <p className="text-white/80 text-sm font-mono uppercase tracking-wider">Loading Quantum Graph Network...</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="particle w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
          <div className="particle w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="particle w-2 h-2 bg-accent-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
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
  { type: 'DMC', name: 'Driving Motor Car', color: 'from-blue-600 to-cyan-600', icon: Train, desc: 'Driver cab + traction' },
  { type: 'TC',  name: 'Trailer Car',        color: 'from-purple-600 to-violet-600', icon: Activity, desc: 'Passenger only' },
  { type: 'MC',  name: 'Motor Car',          color: 'from-orange-600 to-amber-600', icon: Zap, desc: 'Motor + passenger' },
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
      console.log('🎯 Fetching GSD topology data...');
      const res = await fetch('/api/gsd?action=topology');
      const data = await res.json();
      
      if (res.ok && data.success) {
        setGsdData(data.data);
        console.log(`✅ GSD data loaded: ${data.metadata?.nodeCount || 0} nodes`);
      } else {
        console.error('❌ GSD API error:', data.error);
        throw new Error(data.message || data.error || 'Failed to fetch GSD data');
      }
    } catch (err) {
      console.error('❌ Failed to fetch GSD:', err);
      setGsdData(null);
      // Show user-friendly error instead of silent failure
      alert(`GSD Topology Error: ${err instanceof Error ? err.message : 'Network error occurred'}`);
    } finally {
      setGsdLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      console.log('📊 Fetching wiring analysis data...');
      const res = await fetch('/api/analysis/wiring');
      const data = await res.json();
      
      if (res.ok && data.success !== false) {
        setAnalysisData(data);
        console.log('✅ Analysis data loaded');
      } else {
        console.error('❌ Analysis API error:', data.error);
        throw new Error(data.message || data.error || 'Failed to fetch analysis data');
      }
    } catch (err) {
      console.error('❌ Failed to fetch wiring analysis:', err);
      setAnalysisData(null);
      // Show user-friendly error instead of silent failure
      alert(`Analysis Error: ${err instanceof Error ? err.message : 'Network error occurred'}`);
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
      console.log(`🔍 Searching for drawing: ${drawingSearch.trim()}`);
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
        
        console.log(`✅ Drawing found: ${data.drawing.drawingNo}`);
        
        // Find mapped page if available
        if (data.drawing.sourceFile) {
          const drawingToMap = data.drawing.pageSuffix 
            ? `${data.drawing.drawingNo}${data.drawing.pageSuffix}` 
            : data.drawing.drawingNo;
            
          const mappingRes = await fetch(`/api/drawings/pdf-mapping?drawing_no=${encodeURIComponent(drawingToMap)}&source_file=${encodeURIComponent(data.drawing.sourceFile)}`);
          if (mappingRes.ok) {
            const mappingData = await mappingRes.json();
            if (mappingData.pdfPageNo) {
              setInlinePdfPage(mappingData.pdfPageNo);
            }
          }
        }
      } else {
        const errorMsg = data.error || 'Drawing not found. Check number formatting.';
        setDrawingError(errorMsg);
        console.warn(`⚠️ Drawing search failed: ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg = 'Search failed — check connection';
      setDrawingError(errorMsg);
      console.error('❌ Drawing search error:', err);
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
      console.log(`🤖 Executing AI search: ${aiQuery.trim()}`);
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery.trim(),
          taskType: 'unified_search',
          useMultiAgent: true,
          useLangChain: true, // Use new LangChain system
          model: aiModel,
          temperature: aiTemperature,
          confidenceThreshold: aiConfidenceLimit
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        setAiResult(data);
        console.log(`✅ AI search completed: ${data.agents?.length || 1} agents responded`);
      } else {
        const errorMsg = data.error || data.message || 'AI search failed';
        setAiError(errorMsg);
        console.error('❌ AI search error:', errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Failed to connect to AI service';
      setAiError(errorMsg);
      console.error('❌ AI search network error:', err);
    } finally {
      setAiLoading(false);
    }
  }

  function handleQuickQuery(query: string) {
    setAiQuery(query);
    setTimeout(() => searchAI(), 100);
  }

  // Simulated fallback - REMOVED: No more mockup data, show proper empty state
  const activeDrawing = drawingResult;

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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Premium background effects */}
        <div className="glow-orb glow-orb-cyan" />
        <div className="glow-orb glow-orb-purple" />
        <div className="absolute inset-0 bg-gradient-mesh opacity-[0.03] animate-mesh-rotate" />
        
        <div className="text-center glass-card-premium p-12 rounded-5xl border border-glass-border shadow-premium">
          <div className="loading-advanced mx-auto mb-6" />
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white font-mono font-bold uppercase tracking-widest text-lg"
          >
            Initializing Quantum Dashboard...
          </motion.p>
          <div className="mt-6 flex justify-center space-x-3">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-accent-500 rounded-full"
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

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-8 relative overflow-x-hidden">
      
      {/* Background glow elements */}
      <div className="glow-orb glow-orb-cyan" />
      <div className="glow-orb glow-orb-purple" />
      
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none mix-blend-screen"></div>

      {/* Title Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ perspective: 1000 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10"
      >
        <div>
          <h1 className="text-5xl font-extrabold font-mono text-neon tracking-tight uppercase">
            Dashboard
          </h1>
          <p className="text-white/70 mt-2 font-sans flex items-center gap-2">
            Welcome back to the VCC System!
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-5xl glass-card-premium border border-glass-border text-sm text-green-400 font-bold shadow-glow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          System Synced to Neon PostgreSQL
        </div>
      </motion.div>

      {/* Tabs Controller */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex glass-card-premium backdrop-blur-4xl p-2 rounded-5xl border border-glass-border max-w-2xl relative z-10 shadow-premium"
      >
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 py-3 px-6 rounded-4xl text-sm font-bold font-mono transition-all flex items-center justify-center gap-3 uppercase tracking-wider ${
            activeTab === 'explorer' 
              ? 'bg-gradient-accent text-white shadow-glow-lg border border-white/20 transform scale-105' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Cpu className="h-5 w-5" />
          System Explorer
        </button>
        <button
          onClick={() => setActiveTab('gsd')}
          className={`flex-1 py-3 px-6 rounded-4xl text-sm font-bold font-mono transition-all flex items-center justify-center gap-3 uppercase tracking-wider ${
            activeTab === 'gsd' 
              ? 'bg-gradient-accent text-white shadow-glow-lg border border-white/20 transform scale-105' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Network className="h-5 w-5" />
          GSD Topology
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex-1 py-3 px-6 rounded-4xl text-sm font-bold font-mono transition-all flex items-center justify-center gap-3 uppercase tracking-wider ${
            activeTab === 'diagnostics' 
              ? 'bg-gradient-accent text-white shadow-glow-lg border border-white/20 transform scale-105' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <ShieldAlert className="h-5 w-5" />
          Diagnostics & AI
        </button>
      </motion.div>

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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-accent-400" />
                    <input
                      type="text"
                      placeholder="Enter Drawing Number, e.g., 942-58120, 942-38301"
                      value={drawingSearch}
                      onChange={e => setDrawingSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchDrawing()}
                      className="input-premium w-full pl-12 pr-4 py-4 text-sm bg-glass-light backdrop-blur-xl border border-glass-border focus:border-accent-500 rounded-2xl text-white placeholder-white/50 focus:outline-none transition-all shadow-inner-glow focus:shadow-glow-sm"
                    />
                  </div>
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={searchDrawing}
                    disabled={drawingLoading}
                    className="w-full md:w-auto px-8 py-4 shrink-0"
                  >
                    {drawingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Find Drawing'}
                  </GlassButton>
                </div>

                {drawingError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl glass-card-premium border border-red-400/30 text-red-300 text-sm flex items-center gap-3 mt-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                    <span>{drawingError}</span>
                  </motion.div>
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
                      <h4 className="text-xs font-bold text-white/60 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent-400" />
                        Search Result
                      </h4>
                      <div className="relative overflow-hidden rounded-5xl border-2 border-accent-400/60 glass-card-premium p-8 shadow-glow-lg backdrop-blur-4xl">
                        <div className="absolute top-0 right-0 p-4">
                          <span className="px-4 py-2 rounded-full bg-gradient-accent text-white text-xs font-bold tracking-wider uppercase shadow-glow-sm">
                            Database Match
                          </span>
                        </div>

                        <h3 className="text-3xl font-extrabold font-mono text-neon tracking-tight mb-6 uppercase">
                          {activeDrawing.drawingNo}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mb-8 max-w-4xl">
                          <div className="space-y-4">
                            <div>
                              <span className="text-white/60 mr-3 font-mono">Type:</span>
                              <span className="text-white font-bold">{activeDrawing.drawingType || 'Electrical Schematic'}</span>
                            </div>
                            <div>
                              <span className="text-white/60 mr-3 font-mono">Car Type:</span>
                              <span className="text-white font-bold">{activeDrawing.carType || 'TC / DMC / MC'}</span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <span className="text-white/60 mr-3 font-mono">Title:</span>
                              <span className="text-white font-bold">{activeDrawing.title}</span>
                            </div>
                            <div>
                              <span className="text-white/60 mr-3 font-mono">System:</span>
                              <span className="text-white font-bold">
                                {activeDrawing.drawingNo === 'CAB_PIN DRAWINGS' ? 'CAB' : (activeDrawing.systemCode || 'General')}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/60 mr-3 font-mono">Pages:</span>
                              <span className="text-white font-bold">{activeDrawing.pageCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                          <GlassButton
                            variant="primary"
                            size="lg"
                            onClick={() => setShowInlinePdf(!showInlinePdf)}
                          >
                            <FileText className="h-5 w-5" /> 
                            {showInlinePdf ? 'Hide PDF Viewer' : 'View PDF'}
                          </GlassButton>
                          
                          {activeDrawing.sourceFile && (
                            <span className="text-xs text-white/50 font-mono">
                              Source: {activeDrawing.sourceFile}
                            </span>
                          )}
                        </div>

                        {/* Fetch and Display Wire/Connector/Equipment Details */}
                        <DrawingDetailsPanel drawingId={activeDrawing.id || activeDrawing.drawingNo} />
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
                      drawingNo={activeDrawing.drawingNo}
                      title={activeDrawing.title}
                      sourceFile={activeDrawing.sourceFile || (() => {
                        const upper = (activeDrawing.drawingNo || '').toUpperCase();
                        if (upper.match(/942-?38[1-2]/)) return 'CAB_PIN DRAWINGS.pdf';
                        if (upper.match(/942-?383/)) return 'DMC UF_PIN DRAWINGS.pdf';
                        if (upper.match(/942-?384/)) return 'DMC_CEILING.pdf';
                        if (upper.match(/942-?385/)) return 'TC _UF PIN DRAWINGS.pdf';
                        if (upper.match(/942-?386/)) return 'TC_CEILING PIN DRAWINGS.pdf';
                        if (upper.match(/942-?387/)) return 'MC_CEILING_PIN DRAWINGS.pdf';
                        return 'KMRCL VCC Drawings_OCR.pdf';
                      })()}
                      initialPage={inlinePdfPage}
                      onClose={() => setShowInlinePdf(false)}
                      inline={true}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Statistics Cards (6 Cards with 3D Spring Tilt) */}
            <div>
              <h2 className="text-2xl font-bold font-mono text-neon mb-8 tracking-tight flex items-center gap-3 uppercase">
                <Database className="h-6 w-6 text-accent-400" />
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
              <Card3D interactive={true} glowColor="cyan" className="lg:col-span-2">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <motion.div 
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center text-white shadow-glow-sm"
                    >
                      <Train className="h-7 w-7" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold font-mono text-neon uppercase">Car Fleet Overview</h3>
                      <p className="text-sm text-white/60 font-sans">Classified wiring allocations by car type</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CAR_TYPES.map(car => {
                      const count = stats?.byCarType?.[car.type] || (car.type === 'DMC' ? 7800 : car.type === 'TC' ? 5600 : 5616);
                      return (
                        <Link key={car.type} href={`/cars/${car.type}`} className="block">
                          <motion.div 
                            whileHover={{ scale: 1.05, y: -5, rotateX: 5 }}
                            className="p-6 rounded-3xl glass-card-premium backdrop-blur-4xl border border-glass-border hover:shadow-glow-sm transition-all flex flex-col justify-between h-full min-h-[140px] group gpu-accelerated"
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <div className="flex items-start justify-between">
                              <car.icon className="h-8 w-8 text-accent-400 group-hover:text-accent-300 transition-colors" />
                              <div className="text-right">
                                <span className="text-3xl font-extrabold font-mono text-neon">{count}</span>
                                <span className="text-xs text-white/60 uppercase tracking-wider block font-mono">wires</span>
                              </div>
                            </div>
                            <div className="mt-6">
                              <p className="text-lg font-bold font-mono text-white group-hover:text-accent-400 transition-colors uppercase">{car.type}</p>
                              <p className="text-xs text-white/60 line-clamp-1">{car.desc}</p>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </Card3D>

              {/* Data Explorer Quick Navigation (1/3 width) */}
              <Card3D interactive={true} glowColor="purple">
                <div className="p-8">
                  <h3 className="text-xl font-bold font-mono text-neon mb-6 flex items-center gap-3 uppercase">
                    <Database className="h-6 w-6 text-purple-400" />
                    Data Explorer
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Drawings', icon: FileText, href: '/drawings', color: 'purple' },
                      { label: 'Wires', icon: Cable, href: '/wires', color: 'cyan' },
                      { label: 'Connectors', icon: Link2, href: '/connectors', color: 'green' },
                      { label: 'Equipment', icon: Box, href: '/equipment', color: 'orange' },
                      { label: 'Pins', icon: Layers, href: '/pins', color: 'pink' },
                      { label: 'Trainlines', icon: Train, href: '/trainlines', color: 'blue' },
                    ].map(item => (
                      <Link key={item.label} href={item.href} className="block">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="p-4 rounded-2xl glass-card-premium backdrop-blur-xl border border-glass-border hover:shadow-glow-sm transition-all flex items-center gap-3 group"
                        >
                          <item.icon className={`h-5 w-5 text-${item.color}-400 group-hover:scale-110 transition-transform`} />
                          <span className="text-white font-bold font-mono group-hover:text-accent-300 transition-colors uppercase tracking-wider">{item.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/cars/tree"
                    className="mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl border border-glass-border hover:border-accent-500/50 glass-card-premium hover:shadow-glow-sm text-white hover:text-accent-300 text-sm font-bold font-mono transition-all uppercase tracking-wider">
                    <Map className="h-5 w-5" /> View Car Tree
                  </Link>
                </div>
              </Card3D>

            </div>

            {/* System Architecture Grid Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-mono text-neon flex items-center gap-3 tracking-tight uppercase">
                  <Network className="h-6 w-6 text-accent-400" />
                  System Architecture
                </h2>
                <Link href="/systems" className="flex items-center gap-2 text-sm text-accent-400 hover:text-accent-300 font-bold font-mono transition-colors uppercase tracking-wider">
                  View All Systems <ChevronRight className="h-4 w-4" />
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
            <GSDPiVisualization />
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
            <DiagnosticsPanel />

            {/* System Health Overview */}
            <SystemHealthCard />

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

      {/* Voice Assistant - Premium VibeVoice Integration */}
      <VoiceAssistant />

    </div>
  );
}
