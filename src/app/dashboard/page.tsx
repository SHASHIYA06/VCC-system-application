'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, StatCard, GlassPanel } from '@/components/ui';
import {
  Layers, Cable, FileText, Settings, Link2, Box, Search,
  AlertTriangle, X, Loader2, Bot, Brain, Database, Atom
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
  allData: Record<string, unknown>;
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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  // Simulated mockup result that matches the dashboard mockup exactly (shown by default)
  const mockupDrawingResult: DrawingResult = {
    id: 'mockup-id',
    drawingNo: 'DWG-2024-12345',
    title: 'Intercar Jumper & Connector Layout - TC Car',
    revision: 'Rev. 4',
    carType: 'TC',
    subsystem: 'Core subsystems',
    drawingType: 'Schematic',
    pageCount: 5,
    systemCode: 'GEN',
    sourceFile: 'VCC_OCR_Full.pdf'
  };

  const activeDrawing = drawingResult || (drawingSearch === '' ? mockupDrawingResult : null);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, Alex! 👋</p>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-cyan-400 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          System Synced to Neon PostgreSQL
        </div>
      </div>

      {/* Main Drawing Search Area (Full Width Cyan Glow Card matching Mockup) */}
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Enter Drawing Number, e.g., 2024-VCC-1024"
                value={drawingSearch}
                onChange={e => setDrawingSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchDrawing()}
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
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
                <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950/60 p-6 md:p-8 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-wider uppercase">
                      {activeDrawing.drawingNo === 'DWG-2024-12345' ? 'Mockup Preview' : 'Database Match'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white tracking-tight mb-4">
                    {activeDrawing.drawingNo}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6 max-w-3xl">
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-500 mr-2">Type:</span>
                        <span className="text-slate-200 font-semibold">{activeDrawing.drawingType || 'Electrical Schematic'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Car Type:</span>
                        <span className="text-slate-200 font-semibold">{activeDrawing.carType || 'VCC Sedan'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-500 mr-2">Title:</span>
                        <span className="text-slate-200 font-semibold">{activeDrawing.title}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">System:</span>
                        <span className="text-slate-200 font-semibold">
                          {activeDrawing.drawingNo === 'DWG-2024-12345' ? 'Powertrain Control' : (activeDrawing.systemCode || 'General')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Pages:</span>
                        <span className="text-slate-200 font-semibold">{activeDrawing.pageCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/drawings/${activeDrawing.drawingNo === 'DWG-2024-12345' ? '942-38309' : activeDrawing.drawingNo}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                    >
                      <FileText className="h-4 w-4" /> View PDF
                    </Link>
                    
                    {activeDrawing.sourceFile && (
                      <span className="text-xs text-slate-500 italic">
                        Source: {activeDrawing.sourceFile}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>
      </div>

      {/* Six statistics cards (Mockup counts or PostgreSQL counts) */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-400" />
          Vehicle Interface Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/systems">
            <StatCard
              icon={<Layers className="h-6 w-6" />}
              label="Systems"
              value={stats?.overview?.systems || 42}
              subtext="2 new"
              color="purple"
              dataSource={dataSource}
            />
          </Link>
          <Link href="/wires">
            <StatCard
              icon={<Cable className="h-6 w-6" />}
              label="Wires"
              value={stats?.overview?.wires || 1850}
              subtext="120 faulty"
              color="cyan"
              dataSource={dataSource}
            />
          </Link>
          <Link href="/drawings">
            <StatCard
              icon={<FileText className="h-6 w-6" />}
              label="Drawings"
              value={stats?.overview?.drawings || 325}
              subtext="15 recent"
              color="blue"
              dataSource={dataSource}
            />
          </Link>
          <Link href="/equipment">
            <StatCard
              icon={<Settings className="h-6 w-6" />}
              label="Equipment"
              value={stats?.overview?.equipment || 210}
              subtext="8 maintenance"
              color="indigo"
              dataSource={dataSource}
            />
          </Link>
          <Link href="/connectors">
            <StatCard
              icon={<Link2 className="h-6 w-6" />}
              label="Connectors"
              value={stats?.overview?.connectors || 1430}
              subtext="55 pins"
              color="cyan"
              dataSource={dataSource}
            />
          </Link>
          <Link href="/pins">
            <StatCard
              icon={<Box className="h-6 w-6" />}
              label="Pins"
              value={stats?.overview?.pins || 12500}
              subtext="110 reserved"
              color="green"
              dataSource={dataSource}
            />
          </Link>
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
              className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
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
          {['Wire 3003', 'Connector X1-A', 'Drawing 942-38309', 'TRAC System', 'Brake Circuit'].map(q => (
            <button
              key={q}
              onClick={() => handleQuickQuery(q)}
              className="px-3 py-1 rounded-lg bg-slate-900/50 hover:bg-slate-800/80 text-slate-400 hover:text-white text-xs border border-slate-800 transition-all"
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

              {Object.keys(aiResult.allData).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Found Data
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(aiResult.allData).map(([key, value]) => (
                      <div key={key} className="p-3 bg-slate-950/50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">{key}</div>
                        <div className="text-lg font-bold text-cyan-400">
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
    </div>
  );
}
