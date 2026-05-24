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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawingSearch, setDrawingSearch] = useState('');
  const [drawingResult, setDrawingResult] = useState<DrawingResult | null>(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingError, setDrawingError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (response.ok && data.overview) {
        setStats(data);
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
        className="mb-8"
      >
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 gradient-text-animated">
          Dashboard
        </h1>
        <p className="text-slate-400 text-lg">Welcome back, Alex! 👋</p>
      </motion.div>

      {/* Statistics Grid - Using New StatCard Component */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard
          icon={<Layers className="h-6 w-6" />}
          label="Systems"
          value={stats?.overview?.systems || 0}
          subtext="Core systems"
          trend="up"
          trendValue="+2"
          color="purple"
        />
        <StatCard
          icon={<Cable className="h-6 w-6" />}
          label="Wires"
          value={stats?.overview?.wires || 0}
          subtext="Total connections"
          trend="neutral"
          trendValue="0"
          color="cyan"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Drawings"
          value={stats?.overview?.drawings || 0}
          subtext="Schematics"
          trend="up"
          trendValue="+15"
          color="blue"
        />
        <StatCard
          icon={<Settings className="h-6 w-6" />}
          label="Equipment"
          value={stats?.overview?.equipment || 0}
          subtext="Devices"
          trend="neutral"
          trendValue="0"
          color="indigo"
        />
        <StatCard
          icon={<Link2 className="h-6 w-6" />}
          label="Connectors"
          value={stats?.overview?.connectors || 0}
          subtext="Connection points"
          trend="up"
          trendValue="+55"
          color="cyan"
        />
        <StatCard
          icon={<Box className="h-6 w-6" />}
          label="Pins"
          value={stats?.overview?.pins || 0}
          subtext="Pin connections"
          trend="up"
          trendValue="+110"
          color="green"
        />
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
              className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-600 focus:border-purple-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
          <GlassButton variant="info" size="lg">
            <Atom className="h-5 w-5" />
            Analyze
          </GlassButton>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Wire 1001', 'Connector X1-A', 'Drawing 942-38309', 'HV System', 'Brake Circuit'].map(q => (
            <button
              key={q}
              className="px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white text-xs border border-slate-700/50 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </GlassPanel>

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
            <Link key={link.label} href={link.href}>
              <Card3D glowColor={link.color as any} variant="elevated">
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${link.color}-500/20 flex items-center justify-center`}>
                    <link.icon className={`h-5 w-5 text-${link.color}-400`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{link.label}</p>
                    <p className="text-slate-400 text-xs">Explore</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                </div>
              </Card3D>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
