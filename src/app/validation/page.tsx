'use client';

/**
 * VALIDATION CENTER
 * Runs the wiring integrity report and presents an engineering-grade
 * health score with categorised findings. Powered by /api/twin/validate.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Info, Loader2, RefreshCw,
  Cable, Cpu, Box, FileText, MapPin,
} from 'lucide-react';

interface Finding {
  code: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  description: string;
  sample?: string[];
}
interface Report {
  generatedAt: string;
  overallScore: number;
  totals: Record<string, number>;
  findings: Finding[];
}

const SEV = {
  critical: { color: 'text-red-300', bg: 'bg-red-500/10 border-red-500/30', icon: ShieldAlert },
  warning: { color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle },
  info: { color: 'text-sky-300', bg: 'bg-sky-500/10 border-sky-500/30', icon: Info },
};

const TOTAL_ICONS: Record<string, React.ReactNode> = {
  wires: <Cable className="h-4 w-4 text-green-400" />,
  pins: <MapPin className="h-4 w-4 text-amber-400" />,
  connectors: <Cpu className="h-4 w-4 text-pink-400" />,
  devices: <Box className="h-4 w-4 text-orange-400" />,
  drawings: <FileText className="h-4 w-4 text-sky-400" />,
  endpoints: <Cable className="h-4 w-4 text-cyan-400" />,
};

function scoreColor(s: number) {
  if (s >= 80) return 'text-green-400';
  if (s >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export default function ValidationCenterPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/twin/validate');
      const data = await res.json();
      if (res.ok && data.success) setReport(data.report);
    } catch {
      /* surfaced via empty state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
            <ShieldCheck className="h-7 w-7 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Validation Center</h1>
            <p className="text-slate-400 text-sm mt-1">
              Automatic wiring integrity checks across the connectivity graph.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Re-run
        </button>
      </div>

      {loading && !report ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-3" /> Running validation…
        </div>
      ) : report ? (
        <>
          {/* Score + totals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 flex flex-col items-center justify-center"
            >
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Connectivity Health</div>
              <div className={`text-6xl font-bold ${scoreColor(report.overallScore)}`}>
                {report.overallScore}
              </div>
              <div className="text-slate-500 text-sm mt-1">out of 100</div>
            </motion.div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(report.totals).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-1.5">
                    {TOTAL_ICONS[k]} {k}
                  </div>
                  <div className="text-2xl font-bold text-white">{v.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Findings ({report.findings.length})
            </h3>
            {report.findings.length === 0 ? (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-green-300 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6" /> No integrity issues found. The connectivity graph is sound.
              </div>
            ) : (
              report.findings.map((f, i) => {
                const sev = SEV[f.severity];
                const Icon = sev.icon;
                return (
                  <motion.div
                    key={f.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`rounded-xl border p-5 ${sev.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${sev.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold text-white">{f.title}</h4>
                          <span className={`px-2.5 py-1 rounded-md text-sm font-bold ${sev.color}`}>
                            {f.count.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1.5">{f.description}</p>
                        {f.sample && f.sample.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {f.sample.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded text-xs bg-slate-800/80 text-slate-300 font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          <p className="text-xs text-slate-600">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          Could not load validation report. Check the database connection and try Re-run.
        </div>
      )}
    </div>
  );
}
