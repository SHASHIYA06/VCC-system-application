'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Zap, AlertTriangle, Loader2, FileText } from 'lucide-react';

/**
 * Trainline explorer.
 *
 * This page used to call `/api/trainlines` with no `limit` and no `offset`, so it
 * received the route's default 100 rows and then displayed "{100} trainlines in
 * database" — presenting a page size as the table total, with rows 101+ simply
 * unreachable. It now pages server-side and reports `pagination.total`.
 *
 * The cross-connected and critical wire numbers below are engineering reference
 * knowledge from the VCC drawings, not database values. They are labelled as such
 * in the UI so they are never mistaken for measured data.
 */
const CROSS_CONNECTED_TRAINLINES = [3005, 3006, 6009, 6014, 6046, 6051];
const CRITICAL_TRAINLINES = [
  3003, 3004, 3005, 3006, 3010, 4062, 4103, 4122, 4153, 6009, 6046, 6112, 7001, 7050,
];

const SYSTEM_STYLES: Record<string, { color: string; bg: string }> = {
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/10' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/10' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
  COMMS: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  HV: { color: 'text-red-500', bg: 'bg-red-600/10' },
  CAB: { color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  LIGHT: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  COUPLING: { color: 'text-neutral-400', bg: 'bg-neutral-500/10' },
  LTEB: { color: 'text-teal-400', bg: 'bg-teal-500/10' },
  LTJB: { color: 'text-sky-400', bg: 'bg-sky-500/10' },
  EDB: { color: 'text-violet-400', bg: 'bg-violet-500/10' },
  GEN: { color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

const FALLBACK_STYLE = { color: 'text-slate-400', bg: 'bg-slate-500/10' };

const VOLTAGE_COLORS: Record<string, { text: string; bg: string }> = {
  '110VDC': { text: 'text-green-400', bg: 'bg-green-500/20' },
  '415VAC': { text: 'text-amber-400', bg: 'bg-amber-500/20' },
  '750VDC': { text: 'text-red-400', bg: 'bg-red-500/20' },
  '230VAC': { text: 'text-cyan-400', bg: 'bg-cyan-500/20' },
};

const PAGE_SIZE = 100;

interface Trainline {
  id: string;
  wireNo: string;
  itemName: string | null;
  note: string | null;
  voltageText: string | null;
  conductorClass: string | null;
  carType: string | null;
  systemCode: string | null;
  drawingNo: string | null;
  lineGroup: string | null;
}

interface SystemFacet {
  code: string;
  name: string;
}

export default function TrainlinesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState('all');
  const [crossConnectedOnly, setCrossConnectedOnly] = useState(false);
  const [page, setPage] = useState(0);

  const [trainlines, setTrainlines] = useState<Trainline[]>([]);
  const [total, setTotal] = useState(0);
  const [systemFacets, setSystemFacets] = useState<SystemFacet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTrainlines() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(page * PAGE_SIZE),
        });
        if (search) params.set('search', search);
        if (systemFilter !== 'all') params.set('system_code', systemFilter);

        const res = await fetch(`/api/trainlines?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setTrainlines(data.data ?? []);
        setTotal(data.pagination?.total ?? 0);
        if (data.filters?.systems) setSystemFacets(data.filters.systems);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to fetch trainlines:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trainlines');
        setTrainlines([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    fetchTrainlines();
    return () => controller.abort();
  }, [search, systemFilter, page, reloadKey]);

  const isCross = useCallback(
    (wireNo: string) => CROSS_CONNECTED_TRAINLINES.includes(parseInt(wireNo, 10)),
    [],
  );

  // The cross-connected toggle can only narrow the current page, since
  // cross-connection is reference knowledge rather than a database column.
  const visible = useMemo(
    () => (crossConnectedOnly ? trainlines.filter(tl => isCross(tl.wireNo)) : trainlines),
    [trainlines, crossConnectedOnly, isCross],
  );

  const grouped = useMemo(
    () =>
      visible.reduce((acc, tl) => {
        const sys = tl.systemCode || 'GEN';
        (acc[sys] ??= []).push(tl);
        return acc;
      }, {} as Record<string, Trainline[]>),
    [visible],
  );

  const groupKeys = Object.keys(grouped).sort();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, page * PAGE_SIZE + trainlines.length);
  const hasFilters = search !== '' || systemFilter !== 'all' || crossConnectedOnly;

  const clearFilters = () => {
    setSearchInput('');
    setSystemFilter('all');
    setCrossConnectedOnly(false);
    setPage(0);
  };

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold gradient-text">
          <Zap className="h-8 w-8 text-cyan-400" aria-hidden="true" />
          Trainline Explorer
        </h1>
        <p className="mt-2 text-slate-400">
          Cross-car wiring across the 6-car formation
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="tabular-nums">
            Showing {loading ? '…' : `${rangeStart}–${rangeEnd}`} of{' '}
            <span className="text-slate-200">{total}</span> trainlines
          </span>
          {crossConnectedOnly && (
            <span className="tabular-nums text-amber-400">
              {visible.length} cross-connected on this page
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-300">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => setReloadKey(k => k + 1)}
            className="cursor-pointer rounded-md border border-red-400/60 px-3 py-1.5 text-sm font-medium text-red-200 transition-colors duration-200 hover:bg-red-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Known cross-connections. Sourced from the VCC drawings, not the DB. */}
      <div className="mb-6 space-y-3">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Engineering reference — from VCC drawings, not database records
        </p>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-400">X1 pins 19/20 crossed</p>
              <p className="mt-1 text-xs text-slate-400">
                Trainlines 3005 and 3006 (Powering 1 &amp; 2) cross at X1 jumper pins 19/20.
                Incorrect wiring causes train creep.
                <Link
                  href="/trainlines/3005"
                  className="ml-2 cursor-pointer text-red-300 underline-offset-2 transition-colors duration-200 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  View 3005
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-400">
                Door cross-connections at jumpers 43–47
              </p>
              <p className="mt-1 text-xs text-slate-400">
                6009/6046 (open left/right) cross at J43-44. 6014/6051 (close left/right) cross
                at J46-47. This enables all-door operation from a single command.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[16rem] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <label htmlFor="trainline-search" className="sr-only">Search trainlines</label>
          <input
            id="trainline-search"
            type="search"
            placeholder="Search by wire number or name…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 py-2 pl-10 pr-4 text-slate-200 transition-colors duration-200 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          />
        </div>

        {/* A real <select> rather than a custom dropdown: it was previously gated
            by a 9-entry constant, so systems outside that list were unselectable
            even when their rows were on screen. */}
        <label htmlFor="trainline-system" className="sr-only">Filter by system</label>
        <select
          id="trainline-system"
          value={systemFilter}
          onChange={e => { setSystemFilter(e.target.value); setPage(0); }}
          className="cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition-colors duration-200 focus:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          <option value="all">All Systems</option>
          {systemFacets.map(s => (
            <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
          ))}
        </select>

        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={crossConnectedOnly}
            onChange={e => setCrossConnectedOnly(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-800 text-cyan-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          />
          Cross-connected only (this page)
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer rounded-lg border border-slate-700/50 px-3 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-500/60 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Critical trainlines
        </h2>
        <div className="flex flex-wrap gap-2">
          {CRITICAL_TRAINLINES.map(no => (
            <Link
              key={no}
              href={`/trainlines/${no}`}
              className={`inline-flex cursor-pointer items-center rounded-lg px-3 py-1.5 font-mono text-sm font-medium tabular-nums transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                CROSS_CONNECTED_TRAINLINES.includes(no)
                  ? 'border border-amber-500/30 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {no}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" aria-hidden="true" />
          Loading trainlines…
        </div>
      ) : visible.length === 0 && !error ? (
        <div className="glass-card p-12 text-center">
          <Zap className="mx-auto mb-4 h-12 w-12 text-slate-500" aria-hidden="true" />
          <p className="text-slate-400">
            {hasFilters ? 'No trainlines match your filters' : 'No trainlines recorded'}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 cursor-pointer text-cyan-400 transition-colors duration-200 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {groupKeys.map(systemCode => {
              const style = SYSTEM_STYLES[systemCode] ?? FALLBACK_STYLE;
              const rows = grouped[systemCode];
              const systemName = systemFacets.find(s => s.code === systemCode)?.name ?? systemCode;

              return (
                <div key={systemCode} className="glass-card overflow-hidden">
                  <div className={`flex items-center justify-between border-b-2 border-slate-600/50 px-6 py-4 ${style.bg}`}>
                    <div className="flex items-center gap-3">
                      <Zap className={`h-5 w-5 ${style.color}`} aria-hidden="true" />
                      <span className={`text-lg font-bold ${style.color}`}>{systemCode}</span>
                      <span className="text-sm text-slate-400">{systemName}</span>
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {rows.length} trainline{rows.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <caption className="sr-only">Trainlines in system {systemCode}</caption>
                      <thead>
                        <tr className="border-b-2 border-slate-600/40">
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Wire</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Note</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Car</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Voltage</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Drawing</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cross</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-600/40">
                        {rows.map(tl => {
                          const vColor = tl.voltageText
                            ? VOLTAGE_COLORS[tl.voltageText] ?? FALLBACK_STYLE
                            : null;
                          const cross = isCross(tl.wireNo);

                          return (
                            <tr key={tl.id} className="transition-colors duration-200 hover:bg-slate-800/30">
                              <td className="px-6 py-4">
                                <span className={`font-mono text-lg font-bold tabular-nums ${cross ? 'text-amber-400' : 'text-cyan-400'}`}>
                                  {tl.wireNo}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-white">
                                  {tl.itemName ?? <span className="text-slate-500">Not recorded</span>}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-400">
                                  {tl.note ?? tl.conductorClass ?? '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-300">{tl.carType ?? '—'}</span>
                              </td>
                              <td className="px-6 py-4">
                                {vColor && tl.voltageText ? (
                                  <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${vColor.text} ${vColor.bg}`}>
                                    {tl.voltageText}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-600">Not classified</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {tl.drawingNo ? (
                                  <Link
                                    href={`/drawings/${tl.drawingNo}`}
                                    className="inline-flex cursor-pointer items-center gap-1 font-mono text-xs text-slate-300 transition-colors duration-200 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                                  >
                                    <FileText className="h-3 w-3" aria-hidden="true" />
                                    {tl.drawingNo}
                                  </Link>
                                ) : (
                                  <span className="text-xs text-slate-600">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {cross ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                                    <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Yes
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-600">No</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Link
                                  href={`/trainlines/${tl.wireNo}`}
                                  className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-cyan-400 transition-colors duration-200 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                                >
                                  Trace <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Trainline pagination">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="cursor-pointer rounded-lg border border-slate-700/50 px-4 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-500/60 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400 tabular-nums">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="cursor-pointer rounded-lg border border-slate-700/50 px-4 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-500/60 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
