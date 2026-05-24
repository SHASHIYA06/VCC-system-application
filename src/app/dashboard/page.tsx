'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, StatCard, GlassPanel } from '@/components/ui';
import {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Link2, Search, ChevronRight, Layers,
  Cpu, Cable, FileText, AlertTriangle, Eye, X, Database, Map,
  TrendingUp, Sparkles, Bot, Brain, GitBranch, Network,
  CheckCircle2, Clock, Loader2, BarChart3, Gauge, Wifi,
  BookOpen, Wrench, Car, ArrowUpRight, RefreshCw, Play,
  Atom, Lightbulb, Target
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
}

interface AISearchResult {
  query: string;
  primaryResponse: {
    agent: string;
    content: string;
    confidence: number;
  };
  unifiedResponse: string;
  allData: Record<string, any>;
  executionTime: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('database');
  const [drawingSearch, setDrawingSearch] = useState('');
  const [drawingResult, setDrawingResult] = useState<DrawingResult | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingError, setDrawingError] = useState<string | null>(null);
  
  // AI Search State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  useEffect(() => { fetchStats(); }, [fetchStats]);

  async function searchDrawing() {
    if (!drawingSearch.trim()) return;
    setDrawingLoading(true);
    setDrawingError(null);
    setDrawingResult(null);
    try {
      const response = await fetch(`/api/drawings/lookup?drawing_no=${encodeURIComponent(drawingSearch.trim())}`);
      const data = await response.json();
      if (response.ok && data.drawing) {
        setDrawingResult(data.drawing);
      } else {
        setDrawingError(data.error || 'Drawing not found');
      }
    } catch {
      setDrawingError('Search failed');
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

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative">
          <motion.h1 
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 mb-3 bg-[length:200%_auto] tracking-tight"
          >
            Dashboard
          </motion.h1>
          <p className="text-slate-400 text-lg font-medium flex items-center gap-2">
            Welcome back, Alex! <span className="animate-wave inline-block text-2xl">👋</span>
          </p>
        </div>
      </motion.div>

      {/* Statistics Grid - Using New StatCard Component */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <Link href="/systems/tree">
          <StatCard
            icon={<Layers className="h-6 w-6" />}
            label="Systems"
            value={stats?.overview?.systems || 0}
            subtext="Core systems"
            trend="up"
            trendValue="+2"
            color="purple"
            dataSource={dataSource}
          />
        </Link>
        <Link href="/wires">
          <StatCard
            icon={<Cable className="h-6 w-6" />}
            label="Wires"
            value={stats?.overview?.wires || 0}
            subtext="Total connections"
            trend="neutral"
            trendValue="0"
            color="cyan"
            dataSource={dataSource}
          />
        </Link>
        <Link href="/drawings">
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Drawings"
            value={stats?.overview?.drawings || 0}
            subtext="Schematics"
            trend="up"
            trendValue="+15"
            color="blue"
            dataSource={dataSource}
          />
        </Link>
        <Link href="/equipment">
          <StatCard
            icon={<Settings className="h-6 w-6" />}
            label="Equipment"
            value={stats?.overview?.equipment || 0}
            subtext="Devices"
            trend="neutral"
            trendValue="0"
            color="indigo"
            dataSource={dataSource}
          />
        </Link>
        <Link href="/connectors">
          <StatCard
            icon={<Link2 className="h-6 w-6" />}
            label="Connectors"
            value={stats?.overview?.connectors || 0}
            subtext="Connection points"
            trend="up"
            trendValue="+55"
            color="cyan"
            dataSource={dataSource}
          />
        </Link>
        <Link href="/pins">
          <StatCard
            icon={<Box className="h-6 w-6" />}
            label="Pins"
            value={stats?.overview?.pins || 0}
            subtext="Pin connections"
            trend="up"
            trendValue="+110"
            color="green"
            dataSource={dataSource}
          />
        </Link>
      </motion.div>

      {/* Drawing Lookup Section */}
      <GlassPanel
        title="Quick Drawing Lookup"
        subtitle="Search and view PDF drawings"
        icon={<Search className="h-5 w-5" />}
        variant="elevated"
        glow={true}
        glowColor="cyan"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Enter drawing number (e.g., 942-38309)..."
              value={drawingSearch}
              onChange={e => setDrawingSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchDrawing()}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-600 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
          <GlassButton
            variant="primary"
            size="lg"
            onClick={searchDrawing}
            disabled={!drawingSearch || drawingLoading}
          >
            {drawingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Search
          </GlassButton>
        </div>

        {/* Drawing Result */}
        <AnimatePresence>
          {drawingError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{drawingError}</span>
              <button onClick={() => setDrawingError(null)} className="ml-auto">
                <X className="h-4 w-4 text-red-400" />
              </button>
            </motion.div>
          )}
          {drawingResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-5 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{drawingResult.drawingNo}</h3>
                  <p className="text-slate-300">{drawingResult.title}</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-slate-400 text-sm">Type</p>
                  <p className="text-white font-medium">{drawingResult.drawingType || 'Schematic'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Pages</p>
                  <p className="text-white font-medium">{drawingResult.pageCount || 0}</p>
                </div>
              </div>
              <Link
                href={`/drawings/${drawingResult.drawingNo}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
              >
                <FileText className="h-4 w-4" /> View PDF
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>

      {/* AI Search Section */}
      <motion.div
        animate={{ boxShadow: ["0 0 0px 0px rgba(168,85,247,0)", "0 0 20px 2px rgba(168,85,247,0.3)", "0 0 0px 0px rgba(168,85,247,0)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-2xl"
      >
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
              className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-600 focus:border-purple-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
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
        
        {/* Quick Query Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Wire 3003', 'Connector X1-A', 'Drawing 942-38309', 'TRAC System', 'Brake Circuit'].map(q => (
            <button
              key={q}
              onClick={() => handleQuickQuery(q)}
              className="px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white text-xs border border-slate-700/50 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* AI Results */}
        <AnimatePresence>
          {aiError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
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
              {/* Primary Response */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400">
                      {aiResult.primaryResponse.agent}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {aiResult.executionTime}ms
                    </span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                      {Math.round(aiResult.primaryResponse.confidence * 100)}% confident
                    </span>
                  </div>
                </div>
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {aiResult.unifiedResponse}
                </p>
              </div>

              {/* Data Results */}
              {Object.keys(aiResult.allData).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Found Data
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(aiResult.allData).map(([key, value]) => (
                      <div key={key} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">{key}</div>
                        <div className="text-lg font-bold text-cyan-400">
                          {Array.isArray(value) ? value.length : typeof value === 'object' ? Object.keys(value).length : String(value)}
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

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Trainlines', icon: Train, href: '/trainlines', color: 'blue' },
            { label: 'Cars', icon: Car, href: '/cars', color: 'orange' },
            { label: 'Documents', icon: FileText, href: '/documents', color: 'cyan' },
            { label: 'Systems', icon: Map, href: '/systems/tree', color: 'purple' },
            { label: 'Wires', icon: Cable, href: '/wires', color: 'green' },
            { label: 'AI Assistant', icon: Bot, href: '/ai-assistant', color: 'pink' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="group block">
              <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card3D glowColor={link.color as any} variant="elevated" className="border-slate-700/50 group-hover:border-slate-600/80 transition-colors">
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${link.color}-500/10 group-hover:bg-${link.color}-500/20 flex items-center justify-center transition-colors shadow-inner`}>
                      <link.icon className={`h-6 w-6 text-${link.color}-400 group-hover:scale-110 transition-transform`} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{link.label}</p>
                      <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Explore system</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 ml-auto transition-all" />
                  </div>
                </Card3D>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
