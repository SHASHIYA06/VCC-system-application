'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card3D, GlassButton } from '@/components/ui';
import {
  FileText, Cable, Settings, Layers, ArrowUpRight, Plug, CircuitBoard,
  AlertTriangle, Loader2,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Report index.
 *
 * Every "Volume" figure on this page used to be a string literal — '19,016 Wires',
 * '978 Lines', '264 Devices', '574 Drawings' — while the database holds 167,758
 * wires and the trainline table is an order of magnitude larger than the number
 * shown. The page made no network request at all. It now reads the same
 * `/api/stats` endpoint the dashboard uses, so the counts cannot drift from the
 * data again.
 */
interface StatsOverview {
  systems?: number;
  wires?: number;
  drawings?: number;
  equipment?: number;
  connectors?: number;
  pins?: number;
  trainLines?: number;
  signals?: number;
  circuits?: number;
}

interface ReportCard {
  title: string;
  description: string;
  /** Key into `/api/stats` -> `overview`. */
  metricKey: keyof StatsOverview;
  unit: string;
  icon: typeof Cable;
  /** Static class pairs — Tailwind cannot extract `bg-${color}-500/10`. */
  iconClass: string;
  /** Must stay within Card3D's supported glow palette. */
  glow: 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'cyan' | 'pink' | 'amber';
  href: string;
}

const REPORTS: ReportCard[] = [
  {
    title: 'Wiring Harness Connectivity',
    description: 'Complete trace list of all wire endpoints, signal codes, and connector pin assignments.',
    metricKey: 'wires',
    unit: 'wires',
    icon: Cable,
    iconClass: 'bg-cyan-500/10 text-cyan-400',
    glow: 'cyan',
    href: '/wires',
  },
  {
    title: 'Trainlines Master List',
    description: 'Physical control loop lines mapping 110V DC signals and zero-speed loops.',
    metricKey: 'trainLines',
    unit: 'lines',
    icon: Layers,
    iconClass: 'bg-purple-500/10 text-purple-400',
    glow: 'purple',
    href: '/trainlines',
  },
  {
    title: 'Equipment Device Log',
    description: 'Physical equipment nodes, cabinet locations, and active control cabinets.',
    metricKey: 'equipment',
    unit: 'devices',
    icon: Settings,
    iconClass: 'bg-indigo-500/10 text-indigo-400',
    glow: 'purple',
    href: '/equipment',
  },
  {
    title: 'Drawing Index & PDF Mapping',
    description: 'List of all system schematics, revision numbers, and mapped PDF pages.',
    metricKey: 'drawings',
    unit: 'drawings',
    icon: FileText,
    iconClass: 'bg-blue-500/10 text-blue-400',
    glow: 'blue',
    href: '/drawings',
  },
  {
    title: 'Connector & Pin Register',
    description: 'Connector codes per car and system with their full pin-to-wire assignments.',
    metricKey: 'connectors',
    unit: 'connectors',
    icon: Plug,
    iconClass: 'bg-emerald-500/10 text-emerald-400',
    glow: 'green',
    href: '/connectors',
  },
  {
    title: 'Pin Traceability',
    description: 'Drawing to connector to pin to wire chain for commissioning verification.',
    metricKey: 'pins',
    unit: 'pins',
    icon: CircuitBoard,
    iconClass: 'bg-amber-500/10 text-amber-400',
    glow: 'amber',
    href: '/pins',
  },
];

export default function ReportsPage() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/stats', { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (!data?.overview) throw new Error('Stats response is missing its overview block');
        setOverview(data.overview);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to load report stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report statistics');
        setOverview(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    return () => controller.abort();
  }, [reloadKey]);

  return (
    <div className="space-y-8 py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white">System Reports</h1>
        <p className="text-lg text-slate-400">
          Live record counts across the vehicle control system. Each card links to the
          full, filterable register.
        </p>
      </motion.div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-300">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {REPORTS.map((report, idx) => {
          const value = overview?.[report.metricKey];
          return (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card3D glowColor={report.glow} variant="elevated" className="border-slate-800">
                <div className="flex h-full flex-col justify-between space-y-6 p-6">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-3 ${report.iconClass}`}>
                      <report.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-white">{report.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-400">{report.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <div>
                      <span className="block text-xs font-semibold uppercase text-slate-500">
                        Volume
                      </span>
                      <span className="text-lg font-bold text-white tabular-nums">
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-slate-500" aria-label="Loading count" />
                        ) : typeof value === 'number' ? (
                          `${value.toLocaleString()} ${report.unit}`
                        ) : (
                          <span className="text-sm font-normal text-slate-500">
                            Count unavailable
                          </span>
                        )}
                      </span>
                    </div>

                    <Link
                      href={report.href}
                      className="cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    >
                      <GlassButton variant="primary" size="sm" className="gap-1">
                        Explore <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </Card3D>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
