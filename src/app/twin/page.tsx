'use client';

/**
 * DIGITAL TWIN EXPLORER
 * End-to-end wiring trace: enter a wire number and see every termination
 * (pin → connector → device → system → drawing) across the whole train.
 * Powered by /api/twin/trace (the WireEndpoint connectivity graph).
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, Cable, Cpu, Box, Layers, FileText, Loader2, ArrowRight,
  Network, GitBranch, MapPin, AlertTriangle, Workflow,
} from 'lucide-react';

interface TraceEndpoint {
  endpointId: string;
  role: string | null;
  label: string | null;
  pin: { pinNo: string; pinLabel: string | null; signalName: string | null; voltageText: string | null } | null;
  connector: { code: string; description: string | null; carType: string | null; locationTag: string | null } | null;
  device: { name: string; tagNo: string | null; carType: string | null } | null;
  drawing: { id: string; drawingNo: string; title: string } | null;
  system: { code: string; name: string } | null;
}

interface WireTrace {
  wire: {
    wireNo: string; signalName: string | null; voltageClass: string | null;
    wireColor: string | null; description: string | null;
    sourceEquipment: string | null; destEquipment: string | null;
  };
  endpoints: TraceEndpoint[];
  endpointCount: number;
  systemsTouched: string[];
  carsTouched: string[];
  drawingsTouched: string[];
}

const SYSTEM_COLORS: Record<string, string> = {
  TRL: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  TRAC: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  BRAKE: 'bg-red-500/15 text-red-300 border-red-500/30',
  DOOR: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  COMMS: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  VAC: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  HV: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  APS: 'bg-green-500/15 text-green-300 border-green-500/30',
  TMS: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  CAB: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
};
const sysColor = (c?: string | null) =>
  (c && SYSTEM_COLORS[c]) || 'bg-slate-500/15 text-slate-300 border-slate-500/30';

export default function TwinExplorerPage() {
  const [query, setQuery] = useState('');
  const [trace, setTrace] = useState<WireTrace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTrace = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setTrace(null);
    try {
      const res = await fetch(`/api/twin/trace?wire=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrace(data.trace);
      } else {
        setError(data.error || 'Wire not found');
      }
    } catch {
      setError('Network error — could not reach the trace engine');
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30">
          <Workflow className="h-7 w-7 text-cyan-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Digital Twin Explorer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Trace any wire end-to-end across the train — pin, connector, device, system and drawing.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runTrace()}
              placeholder="Enter wire number — e.g. 3001, 3001a, 3001/1, W942-CN1-3"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-text"
            />
          </div>
          <button
            onClick={runTrace}
            disabled={loading || !query.trim()}
            className="px-7 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GitBranch className="h-5 w-5" />}
            Trace Wire
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3 text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      <AnimatePresence mode="wait">
        {trace && (
          <motion.div
            key={trace.wire.wireNo + '-' + Date.now()}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Wire summary */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Cable className="h-6 w-6 text-cyan-300" />
                    <h2 className="text-2xl font-bold text-white font-mono">{trace.wire.wireNo}</h2>
                    {trace.wire.wireColor && (
                      <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 border border-slate-700 text-slate-300">
                        {trace.wire.wireColor}
                      </span>
                    )}
                  </div>
                  {trace.wire.signalName && (
                    <p className="text-slate-300 mt-2">{trace.wire.signalName}</p>
                  )}
                  {trace.wire.description && (
                    <p className="text-slate-500 text-sm mt-1">{trace.wire.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-cyan-300">{trace.endpointCount}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">terminations</div>
                </div>
              </div>

              {/* Coverage chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <Coverage icon={<Layers className="h-4 w-4" />} label="Systems" items={trace.systemsTouched} />
                <Coverage icon={<Box className="h-4 w-4" />} label="Cars" items={trace.carsTouched} />
                <Coverage icon={<FileText className="h-4 w-4" />} label="Drawings" items={trace.drawingsTouched} max={6} />
              </div>
            </div>

            {/* Endpoint list */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Network className="h-4 w-4 text-cyan-400" /> Termination Points
              </h3>
              {trace.endpoints.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  This wire has no termination points linked yet. It may be a bulk-imported
                  conductor not yet referenced by any connector pin.
                </p>
              ) : (
                <div className="space-y-2">
                  {trace.endpoints.map((e) => (
                    <div
                      key={e.endpointId}
                      className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
                    >
                      {e.system && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${sysColor(e.system.code)}`}>
                          {e.system.code}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <Cpu className="h-3.5 w-3.5 text-pink-400" />
                        <span className="font-mono">{e.connector?.code || '—'}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                      <span className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-amber-400" />
                        pin <span className="font-mono">{e.pin?.pinNo || '?'}</span>
                      </span>
                      {e.pin?.signalName && (
                        <span className="text-slate-400 text-xs">({e.pin.signalName})</span>
                      )}
                      {e.device && (
                        <>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                          <span className="flex items-center gap-1.5 text-slate-300 text-sm">
                            <Box className="h-3.5 w-3.5 text-orange-400" />
                            {e.device.name}
                          </span>
                        </>
                      )}
                      {e.connector?.carType && (
                        <span className="ml-auto px-2 py-0.5 rounded text-[11px] bg-slate-700/60 text-slate-300">
                          {e.connector.carType}
                        </span>
                      )}
                      {e.drawing && (
                        <Link
                          href={`/drawings?q=${encodeURIComponent(e.drawing.drawingNo)}`}
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" /> {e.drawing.drawingNo}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Coverage({
  icon, label, items, max = 12,
}: { icon: React.ReactNode; label: string; items: string[]; max?: number }) {
  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
        {icon} {label} <span className="text-slate-500">({items.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-slate-600 text-sm">none</span>
        ) : (
          items.slice(0, max).map((it) => (
            <span key={it} className="px-2 py-0.5 rounded text-xs bg-slate-700/60 text-slate-300 font-mono">
              {it}
            </span>
          ))
        )}
        {items.length > max && (
          <span className="px-2 py-0.5 text-xs text-slate-500">+{items.length - max}</span>
        )}
      </div>
    </div>
  );
}
