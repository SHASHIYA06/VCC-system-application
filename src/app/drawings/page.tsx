'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, GlassPanel } from '@/components/ui';
import { FileText, Search, ArrowRight, Cpu, MapPin, Cable, Loader2, AlertTriangle } from 'lucide-react';

interface Drawing {
  id: string;
  drawingNo: string;
  title: string;
  /** false when `title` was auto-generated rather than read from a source document. */
  titleVerified?: boolean;
  isReference?: boolean;
  revision: string;
  totalSheets: number;
  system?: { code: string; name: string };
  remarks?: string;
  connectorCount?: number;
  trainlineCount?: number;
  pageCount?: number;
}

interface SystemFacet {
  code: string;
  name: string;
  drawingCount: number;
}

const SYSTEM_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  GEN: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'General' },
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Traction' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Brake' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Door' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'APS' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'VAC/HVAC' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'TCMS' },
  COMMS: { color: 'text-pink-400', bg: 'bg-pink-500/20', label: 'Comms' },
  HV: { color: 'text-red-600', bg: 'bg-red-600/20', label: 'HV' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Trainlines' },
  BOGIE: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Bogie' },
  LTEB: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'LTEB' },
  LTJB: { color: 'text-yellow-500', bg: 'bg-yellow-600/20', label: 'LTJB' },
  EDB: { color: 'text-teal-400', bg: 'bg-teal-500/20', label: 'EDB' },
  LIGHT: { color: 'text-amber-500', bg: 'bg-amber-600/20', label: 'Lighting' },
  CAB: { color: 'text-indigo-400', bg: 'bg-indigo-500/20', label: 'Cab' },
  COUPL: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Coupling' },
};

function DrawingsContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('doc');
  
  const [search, setSearch] = useState('');
  const [filterSystem, setFilterSystem] = useState<string | null>(null);
  const [hideUnverified, setHideUnverified] = useState(false);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [systemFacets, setSystemFacets] = useState<SystemFacet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDrawings() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (filterSystem) params.append('system_code', filterSystem);
        params.append('limit', '1000');

        const res = await fetch(`/api/drawings?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error.message || data.error);
        setDrawings(data.drawings ?? []);
        // Facets come back unfiltered, so the dropdown keeps every system even
        // while a filter is active.
        if (data.meta?.systems) setSystemFacets(data.meta.systems);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to fetch drawings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load drawings from database');
        setDrawings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDrawings();
    return () => controller.abort();
  }, [filterSystem, reloadKey]);

  const filteredDrawings = drawings.filter(d => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      d.drawingNo.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q);
    const matchSystem = !filterSystem || d.system?.code === filterSystem;
    const matchVerified = !hideUnverified || d.titleVerified !== false;
    return matchSearch && matchSystem && matchVerified;
  });

  const unverifiedCount = drawings.filter(d => d.titleVerified === false).length;

  const groupedDrawings = filteredDrawings.reduce((acc, d) => {
    const systemCode = d.system?.code || 'GEN';
    if (!acc[systemCode]) acc[systemCode] = [];
    acc[systemCode].push(d);
    return acc;
  }, {} as Record<string, Drawing[]>);

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <FileText className="h-8 w-8 text-cyan-400" />
          VCC Drawing Register
        </h1>
        <p className="mt-2 text-slate-400">
          Complete index of all Vehicle Control Circuit drawings —{' '}
          <span className="tabular-nums text-slate-200">{filteredDrawings.length}</span> shown
          {unverifiedCount > 0 && (
            <>
              , of which{' '}
              <span className="tabular-nums text-amber-400">{unverifiedCount}</span> have an
              unverified title
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-300">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey(k => k + 1)}
            className="cursor-pointer rounded-md border border-red-400/60 px-3 py-1.5 text-sm font-medium text-red-200 transition-colors duration-200 hover:bg-red-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[16rem] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
          <label htmlFor="drawing-search" className="sr-only">Search drawings</label>
          <input id="drawing-search" type="search" placeholder="Search by drawing number or title..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 py-2 pl-10 pr-4 text-slate-200 transition-colors duration-200 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60" />
        </div>

        <label htmlFor="system-filter" className="sr-only">Filter by system</label>
        <select id="system-filter" value={filterSystem || ''} onChange={(e) => setFilterSystem(e.target.value || null)}
          className="cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-slate-200 transition-colors duration-200 focus:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60">
          <option value="">All Systems</option>
          {systemFacets.map(sys => (
            <option key={sys.code} value={sys.code} disabled={sys.drawingCount === 0}>
              {sys.code} — {sys.name} ({sys.drawingCount})
            </option>
          ))}
        </select>

        {unverifiedCount > 0 && (
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={hideUnverified}
              onChange={(e) => setHideUnverified(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-800 text-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            />
            Only verified titles
          </label>
        )}

        {(filterSystem || search || hideUnverified) && (
          <button
            type="button"
            onClick={() => { setFilterSystem(null); setSearch(''); setHideUnverified(false); }}
            className="cursor-pointer rounded-lg border border-slate-700/50 px-3 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-500/60 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          <span className="ml-3 text-slate-400">Loading drawings from database...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDrawings).map(([systemCode, systemDrawings]) => {
            const sysInfo = SYSTEM_COLORS[systemCode] || SYSTEM_COLORS['GEN'];
            
            return (
              <GlassPanel key={systemCode} className="overflow-hidden p-0 mb-6 border-0">
                <div className={`px-6 py-4 border-b-2 border-slate-600/50 flex items-center justify-between ${sysInfo.bg}`}>
                  <div className="flex items-center gap-3">
                    <Cpu className={`h-5 w-5 ${sysInfo.color}`} />
                    <span className={`font-bold text-lg ${sysInfo.color}`}>{systemCode}</span>
                    <span className="text-slate-400 text-sm">{sysInfo.label}</span>
                  </div>
                  <Link href={`/systems/${systemCode}`} className="text-xs text-cyan-400 hover:text-cyan-300">
                    View System <ArrowRight className="h-4 w-4 inline" />
                  </Link>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {systemDrawings.map(dwg => {
                    const subsystem = dwg.remarks?.split('|')[1] || systemCode;
                    
                    return (
                      <Link
                        key={dwg.id}
                        href={`/drawings/${dwg.drawingNo}`}
                        className="group block cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                      >
                        <Card3D variant="flat" interactive={true} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-cyan-400 tabular-nums">
                              {dwg.drawingNo}
                            </span>
                            <span className="text-xs text-slate-500">Rev {dwg.revision || 'A'}</span>
                          </div>
                          {/* An unverified title was auto-generated at import time and
                              is not the real engineering title, so it is never shown
                              as though it were. */}
                          {dwg.titleVerified === false ? (
                            <div className="mb-2 flex items-start gap-1.5 text-sm italic text-amber-400/90">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span>
                                Title not available from source documents
                                <span className="sr-only"> (unverified)</span>
                              </span>
                            </div>
                          ) : (
                            <div className="mb-2 text-sm text-white">{dwg.title}</div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <span className="px-2 py-0.5 bg-slate-700/50 rounded">{subsystem}</span>
                            <span className="tabular-nums">{dwg.totalSheets} sheets</span>
                            {dwg.isReference && (
                              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300">
                                Reference doc
                              </span>
                            )}
                          </div>
                        
                        {(dwg.connectorCount || dwg.trainlineCount) ? (
                          <div className="space-y-1 text-xs text-slate-500">
                            {dwg.connectorCount ? (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{dwg.connectorCount} connectors</span>
                              </div>
                            ) : null}
                            {dwg.trainlineCount ? (
                              <div className="flex items-center gap-1">
                                <Cable className="h-3 w-3" />
                                <span>{dwg.trainlineCount} trainlines</span>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                        
                        <div className="mt-4 text-xs text-cyan-400 font-medium flex items-center gap-1 group-hover:text-cyan-300">
                          View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </div>
                        </Card3D>
                      </Link>
                    );
                  })}
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {filteredDrawings.length === 0 && !loading && (
        <GlassPanel className="p-12 text-center">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No drawings found</p>
          {filterSystem && (
            <button onClick={() => setFilterSystem(null)} className="mt-4 text-cyan-400 hover:text-cyan-300">
              Clear filter
            </button>
          )}
        </GlassPanel>
      )}
    </div>
  );
}

export default function DrawingsPage() {
  return (
    <Suspense fallback={
      <div className="animated-bg min-h-screen p-6 grid-pattern flex items-center justify-center">
        <div className="text-cyan-400">Loading drawings...</div>
      </div>
    }>
      <DrawingsContent />
    </Suspense>
  );
}