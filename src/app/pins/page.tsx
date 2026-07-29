'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Loader2, X, ChevronLeft, ChevronRight,
  AlertTriangle, Cpu, FileText, Cable, Zap,
} from 'lucide-react';

interface PinData {
  id: string;
  connector_code: string;
  connector_type: string;
  equipment_code: string;
  equipment_name: string;
  car_code: string;
  system_code: string;
  system_name: string;
  drawing_no: string;
  drawing_title: string;
  pin_no: string;
  pin_label: string;
  signal_name: string;
  wire: string;
  description: string;
  voltageText: string | null;
  conductorClassCode: string | null;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const PAGE_SIZE = 50;

const SYSTEM_TINT: Record<string, string> = {
  TRAC: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
  BRAKE: 'bg-red-500/15 text-red-300 ring-red-500/30',
  DOOR: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  VAC: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
  APS: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  TMS: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  TCMS: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  COMMS: 'bg-green-500/15 text-green-300 ring-green-500/30',
  CAB: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
  HV: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  TRL: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  LIGHT: 'bg-yellow-500/15 text-yellow-300 ring-yellow-500/30',
};

function systemTint(code: string) {
  return SYSTEM_TINT[code] ?? 'bg-slate-500/15 text-slate-300 ring-slate-500/30';
}

export default function PinsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [connectorFilter, setConnectorFilter] = useState('all');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [page, setPage] = useState(0);

  const [pins, setPins] = useState<PinData[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [connectors, setConnectors] = useState<string[]>([]);
  const [cars, setCars] = useState<string[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search box so we don't fire a query per keystroke.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const fetchPins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(page * PAGE_SIZE));
      if (connectorFilter !== 'all') params.set('connector_code', connectorFilter);
      if (carFilter !== 'all') params.set('car_type', carFilter);
      if (systemFilter !== 'all') params.set('system_code', systemFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/pins?${params.toString()}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();

      setPins(data.pins ?? []);
      setPagination(data.pagination ?? null);
      if (data.connectors?.length) setConnectors(data.connectors);
      if (data.cars?.length) setCars(data.cars);
      if (data.systems?.length) setSystems(data.systems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pins');
      setPins([]);
    } finally {
      setLoading(false);
    }
  }, [page, connectorFilter, carFilter, systemFilter, search]);

  useEffect(() => { fetchPins(); }, [fetchPins]);

  const total = pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  const activeFilters =
    (connectorFilter !== 'all' ? 1 : 0) +
    (carFilter !== 'all' ? 1 : 0) +
    (systemFilter !== 'all' ? 1 : 0) +
    (search ? 1 : 0);

  function resetFilters() {
    setConnectorFilter('all');
    setCarFilter('all');
    setSystemFilter('all');
    setSearchInput('');
    setSearch('');
    setPage(0);
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-mono">Pin Diagrams</h1>
              <p className="text-sm text-slate-400">
                Connector pin assignments with full traceability
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900/70 ring-1 ring-slate-700/60">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Total Pins</div>
            <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">
              {total.toLocaleString()}
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl bg-slate-800/70 ring-1 ring-slate-700/60 text-xs text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* ─── Filter bar ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-900/60 ring-1 ring-slate-700/60 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search pin no, signal, wire, or connector…"
              aria-label="Search pins"
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-950/70 ring-1 ring-slate-700/60 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow font-mono"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={connectorFilter}
            onChange={(e) => { setConnectorFilter(e.target.value); setPage(0); }}
            aria-label="Filter by connector"
            className="h-10 px-3 rounded-xl bg-slate-950/70 ring-1 ring-slate-700/60 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer font-mono"
          >
            <option value="all">All connectors ({connectors.length})</option>
            {connectors.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={carFilter}
              onChange={(e) => { setCarFilter(e.target.value); setPage(0); }}
              aria-label="Filter by car type"
              className="h-10 px-3 rounded-xl bg-slate-950/70 ring-1 ring-slate-700/60 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer font-mono"
            >
              <option value="all">All cars</option>
              {cars.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={systemFilter}
              onChange={(e) => { setSystemFilter(e.target.value); setPage(0); }}
              aria-label="Filter by system"
              className="h-10 px-3 rounded-xl bg-slate-950/70 ring-1 ring-slate-700/60 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer font-mono"
            >
              <option value="all">All systems</option>
              {systems.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-red-500/10 ring-1 ring-red-500/30 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Could not load pins</p>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            <button
              onClick={fetchPins}
              className="mt-2 text-xs text-red-300 underline hover:text-red-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ─── Table ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-900/60 ring-1 ring-slate-700/60 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
            <p className="text-sm text-slate-400 font-mono">Querying connector pins…</p>
          </div>
        ) : pins.length === 0 ? (
          <div className="p-16 text-center">
            <MapPin className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No pins match these filters</p>
            <p className="text-sm text-slate-500 mt-1">
              Try a shorter search term or clear the filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-950/50">
                  <Th>Drawing</Th>
                  <Th>System</Th>
                  <Th>Connector</Th>
                  <Th align="center">Pin</Th>
                  <Th>Signal</Th>
                  <Th>Wire</Th>
                  <Th>Equipment</Th>
                  <Th align="right">Trace</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pins.map((pin) => (
                  <tr key={pin.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Drawing — the root of the traceability chain */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {pin.drawing_no ? (
                        <Link
                          href={`/drawings/${encodeURIComponent(pin.drawing_no)}`}
                          className="group inline-flex items-center gap-1.5 cursor-pointer"
                          title={pin.drawing_title}
                        >
                          <FileText className="h-3.5 w-3.5 text-blue-400/70 group-hover:text-blue-300 transition-colors" />
                          <span className="font-mono text-blue-400 group-hover:text-blue-300 transition-colors">
                            {pin.drawing_no}
                          </span>
                        </Link>
                      ) : <Dash />}
                    </td>

                    {/* System */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {pin.system_code ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ${systemTint(pin.system_code)}`}
                          title={pin.system_name}
                        >
                          {pin.system_code}
                        </span>
                      ) : <Dash />}
                    </td>

                    {/* Connector */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-pink-400/70" />
                        <span className="font-mono text-pink-300">{pin.connector_code || '—'}</span>
                      </span>
                      {pin.car_code && (
                        <span className="ml-2 text-[10px] text-slate-500 font-mono">{pin.car_code}</span>
                      )}
                    </td>

                    {/* Pin number */}
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md bg-amber-500/15 ring-1 ring-amber-500/30 font-mono font-bold text-amber-300 tabular-nums">
                        {pin.pin_no}
                      </span>
                    </td>

                    {/* Signal */}
                    <td className="px-4 py-2.5">
                      <span className="text-slate-200 font-mono text-xs">
                        {pin.signal_name || <Dash />}
                      </span>
                      {pin.voltageText && (
                        <span className="ml-2 text-[10px] text-slate-500">{pin.voltageText}</span>
                      )}
                    </td>

                    {/* Wire */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {pin.wire ? (
                        <Link
                          href={`/wires/${encodeURIComponent(pin.wire)}`}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/25 text-emerald-300 font-mono text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          <Cable className="h-3 w-3" />
                          {pin.wire}
                        </Link>
                      ) : <Dash />}
                    </td>

                    {/* Equipment */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {pin.equipment_code ? (
                        <span
                          className="font-mono text-xs text-violet-300"
                          title={pin.equipment_name || undefined}
                        >
                          {pin.equipment_code}
                        </span>
                      ) : <Dash />}
                    </td>

                    {/* Trace actions */}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {pin.wire && (
                          <Link
                            href={`/wires/trace?wire=${encodeURIComponent(pin.wire)}`}
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <Zap className="h-3 w-3" />
                            Trace
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Pagination ────────────────────────────────────────────────── */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/60 bg-slate-950/40">
            <p className="text-xs text-slate-400 font-mono tabular-nums">
              {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous page"
                className="h-8 w-8 grid place-items-center rounded-lg ring-1 ring-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-slate-400 font-mono tabular-nums px-2">
                {page + 1} / {totalPages.toLocaleString()}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination?.hasMore}
                aria-label="Next page"
                className="h-8 w-8 grid place-items-center rounded-lg ring-1 ring-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Small presentational helpers ───────────────────────────────────────── */

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}) {
  const cls = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  return (
    <th className={`px-4 py-2.5 ${cls} text-[10px] font-semibold text-slate-500 uppercase tracking-widest`}>
      {children}
    </th>
  );
}

function Dash() {
  return <span className="text-slate-600">—</span>;
}
