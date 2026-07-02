'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card3D, GlassButton, StatCard, GlassPanel } from '@/components/ui';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import GSDPiVisualization from '@/components/gsd/GSDPiVisualization';
import SystemHealthCard from '@/components/dashboard/SystemHealthCard';
import DiagnosticsPanel from '@/components/diagnostics/DiagnosticsPanel';
import WireDistributionChart from '@/components/dashboard/WireDistributionChart';
import ConnectorBarChart from '@/components/dashboard/ConnectorBarChart';
import { DrawingDetailsPanel } from '@/components/dashboard/DrawingDetailsPanel';
import {
  Train, ShieldCheck, ShieldAlert, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Link2, Search, ChevronRight, Layers, Cpu,
  Cable, FileText, AlertTriangle, X, Database, Map, TrendingUp, Bot, Brain,
  Network, CheckCircle2, Loader2, BarChart3, MapPin,
  BookOpen, Wrench, Car, RefreshCw, Lightbulb,
} from 'lucide-react';

const PdfViewerEnhanced = dynamic(() => import('@/components/pdf/EnhancedPdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading PDF viewer...</p>
      </div>
    </div>
  )
});

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
  primaryResponse: { agent: string; content: string; confidence: number };
  unifiedResponse: string;
  allData: Record<string, unknown>;
  executionTime: number;
}

const SYSTEM_GROUPS = [
  { code: 'GEN', name: 'General & Conventions', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  { code: 'TRL', name: 'Trainlines', icon: Train, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { code: 'CAB', name: 'Cab Control', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { code: 'TRAC', name: 'Traction', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { code: 'BRAKE', name: 'Brake System', icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-500/10' },
  { code: 'APS', name: 'Aux Power', icon: Battery, color: 'text-green-400', bg: 'bg-green-500/10' },
  { code: 'DOOR', name: 'Door System', icon: DoorOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { code: 'VAC', name: 'Ventilation', icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { code: 'COMMS', name: 'Communications', icon: Radio, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { code: 'TMS', name: 'TCMS', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const CAR_TYPES = [
  { type: 'DMC', name: 'Driving Motor Car', icon: Train, desc: 'Driver cab + traction' },
  { type: 'TC', name: 'Trailer Car', icon: Activity, desc: 'Passenger only' },
  { type: 'MC', name: 'Motor Car', icon: Zap, desc: 'Motor + passenger' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'gsd' | 'diagnostics'>('explorer');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawingSearch, setDrawingSearch] = useState('');
  const [drawingResult, setDrawingResult] = useState<DrawingResult | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingError, setDrawingError] = useState<string | null>(null);
  const [showInlinePdf, setShowInlinePdf] = useState(false);
  const [inlinePdfPage, setInlinePdfPage] = useState(1);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (response.ok && data.overview) setStats(data);
    } catch {
      setError('Failed to load database stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchGsd = async () => {
    try {
      const res = await fetch('/api/gsd?action=topology');
      const data = await res.json();
      if (res.ok && data.success) setGsdData(data.data);
    } catch (err) {
      setError(`GSD Error: ${err instanceof Error ? err.message : 'Network error'}`);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const res = await fetch('/api/analysis/wiring');
      const data = await res.json();
      if (res.ok && data.success !== false) setAnalysisData(data);
    } catch (err) {
      setError(`Analysis Error: ${err instanceof Error ? err.message : 'Network error'}`);
    }
  };

  const [gsdData, setGsdData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'gsd') fetchGsd();
    else if (activeTab === 'diagnostics') fetchAnalysis();
  }, [activeTab]);

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
      } else {
        setDrawingError(data.error || 'Drawing not found');
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
        body: JSON.stringify({ query: aiQuery.trim(), taskType: 'unified_search', useMultiAgent: true, useLangChain: true }),
      });
      const data = await response.json();
      if (response.ok && data.success !== false) setAiResult(data);
      else setAiError(data.error || data.message || 'AI search failed');
    } catch {
      setAiError('Failed to connect to AI service');
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span className="text-sm text-red-300 flex-1">{error}</span>
          <button onClick={() => { setError(null); fetchStats(); }} className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors">
            Retry
          </button>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">KMRCL RS(3R) Vehicle Control Circuits — Digital Twin</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Database Connected
        </div>
      </div>

      {/* Tab Controller */}
      <div className="flex bg-slate-900/50 border border-slate-800/60 p-1 rounded-xl max-w-lg">
        {[
          { key: 'explorer', label: 'System Explorer', icon: Cpu },
          { key: 'gsd', label: 'GSD Topology', icon: Network },
          { key: 'diagnostics', label: 'Diagnostics', icon: ShieldAlert },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === key
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* TAB: System Explorer */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          {/* Drawing Lookup */}
          <GlassPanel title="Quick Drawing Lookup" subtitle="Search 524+ drawings in the database" icon={<Search className="h-5 w-5" />}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter drawing number, e.g. 942-58120"
                  value={drawingSearch}
                  onChange={e => setDrawingSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchDrawing()}
                  className="input-premium w-full pl-10 pr-4 py-3"
                />
              </div>
              <GlassButton variant="primary" size="lg" onClick={searchDrawing} disabled={drawingLoading} className="shrink-0">
                {drawingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </GlassButton>
            </div>

            {drawingError && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {drawingError}
              </div>
            )}

            {drawingResult && (
              <div className="mt-4 p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">{drawingResult.drawingNo}</h3>
                    <p className="text-sm text-slate-400 mt-1">{drawingResult.title}</p>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
                    Found in DB
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  <div><span className="text-slate-500">System</span><p className="text-white font-medium">{drawingResult.systemCode || 'N/A'}</p></div>
                  <div><span className="text-slate-500">Car Type</span><p className="text-white font-medium">{drawingResult.carType}</p></div>
                  <div><span className="text-slate-500">Pages</span><p className="text-white font-medium">{drawingResult.pageCount}</p></div>
                  <div><span className="text-slate-500">Revision</span><p className="text-white font-medium">{drawingResult.revision}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <GlassButton variant="primary" size="sm" onClick={() => setShowInlinePdf(!showInlinePdf)}>
                    <FileText className="h-4 w-4" /> {showInlinePdf ? 'Hide PDF' : 'View PDF'}
                  </GlassButton>
                  {drawingResult.sourceFile && (
                    <span className="text-xs text-slate-500 font-mono">Source: {drawingResult.sourceFile}</span>
                  )}
                </div>
                <DrawingDetailsPanel drawingId={drawingResult.id || drawingResult.drawingNo} />
              </div>
            )}
          </GlassPanel>

          {/* Inline PDF */}
          {showInlinePdf && drawingResult && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                <span className="font-medium text-white text-sm">{drawingResult.drawingNo} — PDF Viewer</span>
                <button onClick={() => setShowInlinePdf(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[70vh]">
                <PdfViewerEnhanced
                  drawingNo={drawingResult.drawingNo}
                  title={drawingResult.title}
                  sourceFile={drawingResult.sourceFile || 'KMRCL VCC Drawings_OCR.pdf'}
                  initialPage={inlinePdfPage}
                  onClose={() => setShowInlinePdf(false)}
                  inline={true}
                />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" />
              Vehicle Interface Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link href="/systems"><StatCard icon={<Layers className="h-5 w-5" />} label="Systems" value={stats?.overview?.systems ?? 0} color="purple" /></Link>
              <Link href="/wires"><StatCard icon={<Cable className="h-5 w-5" />} label="Wires" value={stats?.overview?.wires ?? 0} color="cyan" /></Link>
              <Link href="/drawings"><StatCard icon={<FileText className="h-5 w-5" />} label="Drawings" value={stats?.overview?.drawings ?? 0} color="blue" /></Link>
              <Link href="/equipment"><StatCard icon={<Settings className="h-5 w-5" />} label="Equipment" value={stats?.overview?.equipment ?? 0} color="indigo" /></Link>
              <Link href="/connectors"><StatCard icon={<Link2 className="h-5 w-5" />} label="Connectors" value={stats?.overview?.connectors ?? 0} color="pink" /></Link>
              <Link href="/pins"><StatCard icon={<Box className="h-5 w-5" />} label="Pins" value={stats?.overview?.pins ?? 0} color="green" /></Link>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card3D className="p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" /> Wire Distribution by System
              </h3>
              <WireDistributionChart
                data={(stats?.systems || []).map(s => ({
                  name: s.code,
                  value: s.drawingCount * 100 || 0,
                })).filter(d => d.value > 0)}
              />
            </Card3D>
            <Card3D className="p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-400" /> Connectors per System
              </h3>
              <ConnectorBarChart
                data={(stats?.systems || []).map(s => ({
                  name: s.code,
                  value: s.deviceCount,
                })).filter(d => d.value > 0)}
              />
            </Card3D>
          </div>

          {/* Car Fleet & Quick Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card3D className="lg:col-span-2 p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Train className="h-5 w-5 text-cyan-400" /> Car Fleet Overview
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {CAR_TYPES.map(car => {
                  const count = stats?.byCarType?.[car.type] ?? 0;
                  return (
                    <Link key={car.type} href={`/cars/${car.type}`}>
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer group">
                        <car.icon className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors mb-3" />
                        <div className="text-2xl font-bold text-white font-mono">{count.toLocaleString()}</div>
                        <div className="text-xs text-slate-400 mt-1">{car.type} — {car.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card3D>

            <Card3D className="p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Map className="h-5 w-5 text-purple-400" /> Quick Navigation
              </h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Drawings', href: '/drawings', icon: FileText },
                  { label: 'Wires', href: '/wires', icon: Cable },
                  { label: 'Connectors', href: '/connectors', icon: Link2 },
                  { label: 'Equipment', href: '/equipment', icon: Box },
                  { label: 'Pins', href: '/pins', icon: MapPin },
                  { label: 'Trainlines', href: '/trainlines', icon: Train },
                ].map(item => (
                  <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors group text-sm">
                    <item.icon className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                    <ChevronRight className="h-3 w-3 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </Card3D>
          </div>

          {/* System Architecture Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Network className="h-5 w-5 text-cyan-400" /> System Architecture
              </h2>
              <Link href="/systems" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {SYSTEM_GROUPS.map(sys => {
                const dbSystem = stats?.systems?.find(s => s.code === sys.code);
                return (
                  <Link key={sys.code} href={`/systems/${sys.code}`}>
                    <Card3D className="p-4 cursor-pointer group" interactive>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${sys.bg}`}>
                          <sys.icon className={`h-4 w-4 ${sys.color}`} />
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-sm font-mono">{sys.code}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{sys.name}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <span>{dbSystem?.deviceCount ?? 0} devs</span>
                        <span>·</span>
                        <span>{dbSystem?.drawingCount ?? 0} drgs</span>
                      </div>
                    </Card3D>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* AI Search */}
          <GlassPanel title="AI Assistant" subtitle="Ask about wires, connectors, systems, or drawings" icon={<Brain className="h-5 w-5" />} glow>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Brain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ask anything about the VCC system..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchAI()}
                  className="input-premium w-full pl-10 pr-4 py-3"
                />
              </div>
              <GlassButton variant="primary" size="lg" onClick={searchAI} disabled={!aiQuery.trim() || aiLoading}>
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Ask
              </GlassButton>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {['Wire 3001', 'Connector APS_CN1', 'TRAC System', 'Brake Circuit'].map(q => (
                <button key={q} onClick={() => { setAiQuery(q); setTimeout(searchAI, 100); }}
                  className="px-3 py-1 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white text-xs border border-slate-700/50 transition-colors cursor-pointer">
                  {q}
                </button>
              ))}
            </div>

            {aiError && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {aiError}
              </div>
            )}

            {aiResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">{aiResult.primaryResponse.agent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">{aiResult.executionTime}ms</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium">
                      {Math.round(aiResult.primaryResponse.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{aiResult.unifiedResponse}</p>
              </div>
            )}
          </GlassPanel>

          {/* Database Status Footer */}
          {stats && (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Database Connected</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span>{stats.overview.drawings} drawings</span>
                <span>{stats.overview.wires} wires</span>
                <span>{stats.overview.connectors} connectors</span>
                <span>{stats.overview.equipment} equipment</span>
                <span>{stats.overview.pins} pins</span>
              </div>
              <Link href="/admin" className="ml-auto text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                <Settings className="h-3 w-3" /> Admin
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB: GSD Topology */}
      {activeTab === 'gsd' && (
        <div className="space-y-6">
          <GSDPiVisualization />
        </div>
      )}

      {/* TAB: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <DiagnosticsPanel />
          <SystemHealthCard />
        </div>
      )}

      <VoiceAssistant />
    </div>
  );
}
