'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Cpu, Search, ArrowRight, Box, Shield, Zap, Battery, Wind, DoorOpen, Radio, Activity, Loader2, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

/**
 * Equipment (Device) register.
 *
 * The field names below mirror `/api/equipment` exactly. They previously did not:
 * the page read `code`, `name`, `description`, `location`, `type`,
 * `connectorCount` and a nested `system.code`, none of which the API returns.
 * Every card therefore rendered blank badges, "N/A" types and links pointing at
 * `/equipment/undefined`, and the unguarded `eq.description.toLowerCase()` in the
 * search filter threw a TypeError as soon as anyone typed a character.
 */
interface EquipmentItem {
  id: string;
  deviceName: string;
  tagNo: string | null;
  deviceType: string | null;
  carType: string | null;
  locationTag: string | null;
  note: string | null;
  systemCode: string | null;
  systemName: string | null;
  drawingNo: string | null;
  isVerified: boolean;
  wireCount: number;
  specCount: number;
}

interface EquipmentResponse {
  equipment?: EquipmentItem[];
  pagination?: { total: number; limit: number; offset: number; hasMore: boolean };
  filters?: { cars: (string | null)[]; systems: { code: string; name: string }[] };
  error?: string;
}

const PAGE_SIZE = 60;

const SYSTEM_COLORS: Record<string, { color: string; bg: string }> = {
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  COMMS: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  LTEB: { color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  LTJB: { color: 'text-sky-400', bg: 'bg-sky-500/20' },
  EDB: { color: 'text-rose-400', bg: 'bg-rose-500/20' },
  HV: { color: 'text-red-500', bg: 'bg-red-600/20' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  CAB: { color: 'text-violet-400', bg: 'bg-violet-500/20' },
  LIGHT: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  BOGIE: { color: 'text-stone-400', bg: 'bg-stone-500/20' },
  GEN: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

const CAR_COLORS: Record<string, { color: string; bg: string }> = {
  DMC: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  TC: { color: 'text-green-400', bg: 'bg-green-500/20' },
  MC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

const FALLBACK_SYSTEM_STYLE = { color: 'text-slate-400', bg: 'bg-slate-500/20' };

export default function EquipmentPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [page, setPage] = useState(0);

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<EquipmentResponse['filters']>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEquipment() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(page * PAGE_SIZE),
        });
        if (search) params.set('search', search);
        if (carFilter !== 'all') params.set('car_type', carFilter);
        if (systemFilter !== 'all') params.set('system_code', systemFilter);

        const res = await fetch(`/api/equipment?${params}`, { signal: controller.signal });
        // Without this check a 500 body `{error, details}` parsed cleanly, left
        // `equipment` undefined and rendered as "no equipment matches your
        // filters" — an outage was indistinguishable from an empty result.
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data: EquipmentResponse = await res.json();
        if (data.error) throw new Error(data.error);

        setEquipment(data.equipment ?? []);
        setTotal(data.pagination?.total ?? 0);
        // Facets are server-side and unfiltered, so the dropdowns always list
        // every option rather than only what the current page happens to contain.
        if (data.filters) setFacets(data.filters);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to fetch equipment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load equipment');
        setEquipment([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
    return () => controller.abort();
  }, [search, carFilter, systemFilter, page, reloadKey]);

  const cars = useMemo(
    () => (facets?.cars.filter(Boolean) as string[] | undefined) ?? [],
    [facets],
  );
  const systems = useMemo(() => facets?.systems ?? [], [facets]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setCarFilter('all');
    setSystemFilter('all');
    setPage(0);
  }, []);

  const hasFilters = search !== '' || carFilter !== 'all' || systemFilter !== 'all';
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, page * PAGE_SIZE + equipment.length);

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold gradient-text">
          <Cpu className="h-8 w-8 text-cyan-400" aria-hidden="true" />
          Equipment Register
        </h1>
        <p className="mt-2 text-slate-400">
          Electrical devices per car, with wire endpoint counts and originating drawing
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="tabular-nums">
            {loading ? '…' : `${rangeStart}–${rangeEnd} of ${total}`} devices
          </span>
          <span className="tabular-nums">{cars.length} car types</span>
          <span className="tabular-nums">{systems.length} systems</span>
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

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[16rem] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <label htmlFor="equipment-search" className="sr-only">Search equipment</label>
          <input
            id="equipment-search"
            type="search"
            placeholder="Search by name, tag or type…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 py-2 pl-10 pr-4 text-slate-200 transition-colors duration-200 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          />
        </div>

        <label htmlFor="car-filter" className="sr-only">Filter by car</label>
        <select
          id="car-filter"
          value={carFilter}
          onChange={e => { setCarFilter(e.target.value); setPage(0); }}
          className="cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 transition-colors duration-200 focus:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          <option value="all">All Cars</option>
          {cars.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label htmlFor="system-filter" className="sr-only">Filter by system</label>
        <select
          id="system-filter"
          value={systemFilter}
          onChange={e => { setSystemFilter(e.target.value); setPage(0); }}
          className="cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 transition-colors duration-200 focus:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          <option value="all">All Systems</option>
          {systems.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
        </select>

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

      {loading ? (
        <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" aria-hidden="true" />
          Loading equipment…
        </div>
      ) : equipment.length === 0 && !error ? (
        <div className="glass-card p-12 text-center">
          <Cpu className="mx-auto mb-4 h-12 w-12 text-slate-500" aria-hidden="true" />
          <p className="text-slate-400">
            {hasFilters ? 'No equipment matches your filters' : 'No equipment recorded'}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {equipment.map(eq => {
              const sysStyle = SYSTEM_COLORS[eq.systemCode ?? ''] ?? FALLBACK_SYSTEM_STYLE;
              const carStyle = CAR_COLORS[eq.carType ?? ''] ?? FALLBACK_SYSTEM_STYLE;
              // Tag number is the stable engineering identifier; fall back to the
              // row id so the link can never resolve to `/equipment/undefined`.
              const href = `/equipment/${encodeURIComponent(eq.tagNo ?? eq.id)}`;

              return (
                <Link
                  key={eq.id}
                  href={href}
                  className="group block cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                >
                  <div className="glass-card h-full p-5 transition-colors duration-200 hover:border-cyan-500/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          {eq.carType && (
                            <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${carStyle.color} ${carStyle.bg}`}>
                              {eq.carType}
                            </span>
                          )}
                          <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${sysStyle.color} ${sysStyle.bg}`}>
                            {eq.systemCode ?? 'Unassigned'}
                          </span>
                          {eq.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              Verified
                            </span>
                          )}
                        </div>
                        <h3 className="truncate font-mono text-lg font-bold text-white transition-colors duration-200 group-hover:text-cyan-400">
                          {eq.tagNo ?? eq.deviceName}
                        </h3>
                        {eq.tagNo && (
                          <p className="mt-1 truncate text-sm text-slate-400">{eq.deviceName}</p>
                        )}
                      </div>
                      <Cpu className="h-5 w-5 shrink-0 text-slate-500 transition-colors duration-200 group-hover:text-cyan-400" aria-hidden="true" />
                    </div>

                    {eq.note && (
                      <p className="mt-3 line-clamp-2 text-xs text-slate-500">{eq.note}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {eq.locationTag && (
                        <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-slate-300">
                          {eq.locationTag}
                        </span>
                      )}
                      <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-slate-400">
                        {eq.deviceType ?? 'Type not recorded'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="tabular-nums">
                        {eq.wireCount} wire endpoint{eq.wireCount === 1 ? '' : 's'}
                      </span>
                      {eq.specCount > 0 && (
                        <span className="tabular-nums">{eq.specCount} specs</span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-3">
                      {eq.drawingNo ? (
                        <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                          <FileText className="h-3 w-3" aria-hidden="true" />
                          {eq.drawingNo}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">No drawing</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-cyan-400 transition-colors duration-200 group-hover:text-cyan-300">
                        View <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Real pagination. The page previously fetched a hardcoded 500 rows
              with no offset, so anything beyond that was unreachable. */}
          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-between gap-4"
              aria-label="Equipment pagination"
            >
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="cursor-pointer rounded-lg border border-slate-700/50 px-4 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-500/60 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700/50 disabled:hover:text-slate-300"
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
                className="cursor-pointer rounded-lg border border-slate-700/50 px-4 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-500/60 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700/50 disabled:hover:text-slate-300"
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
