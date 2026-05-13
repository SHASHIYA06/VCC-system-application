'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Zap, ChevronDown, AlertTriangle, Filter } from 'lucide-react';

const CROSS_CONNECTED_TRAINLINES = [3005, 3006, 6009, 6014, 6046, 6051];
const CRITICAL_TRAINLINES = [3003, 3004, 3005, 3006, 3010, 4062, 4103, 4122, 4153, 6009, 6046, 6112, 7001, 7050];

const SYSTEM_GROUPS: Record<string, { label: string; color: string; bg: string }> = {
  TRL: { label: 'Trainlines', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  TRAC: { label: 'Traction', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  BRAKE: { label: 'Brake', color: 'text-red-400', bg: 'bg-red-500/10' },
  APS: { label: 'Auxiliary Power', color: 'text-green-400', bg: 'bg-green-500/10' },
  DOOR: { label: 'Door', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  VAC: { label: 'VAC/HVAC', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  TMS: { label: 'TCMS', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  COMMS: { label: 'Communications', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  GEN: { label: 'General', color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

const VOLTAGE_COLORS: Record<string, { text: string; bg: string }> = {
  '110VDC': { text: 'text-green-400', bg: 'bg-green-500/20' },
  '415VAC': { text: 'text-amber-400', bg: 'bg-amber-500/20' },
  '750VDC': { text: 'text-red-400', bg: 'bg-red-500/20' },
  '230VAC': { text: 'text-cyan-400', bg: 'bg-cyan-500/20' },
};

interface TrainlineData {
  trainline_no: string;
  name: string;
  description: string;
  voltage_domain: string;
  car_code: string;
  system_code: string;
  is_cross_connected: boolean;
}

export default function TrainlinesPage() {
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [crossConnectedOnly, setCrossConnectedOnly] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [trainlines, setTrainlines] = useState<TrainlineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrainlines() {
      try {
        const response = await fetch('/api/trainlines');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setTrainlines(data.trainlines || []);
      } catch (err) {
        setError('Failed to load trainlines from database');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainlines();
  }, []);

  const filtered = trainlines.filter(tl => {
    const matchSearch = search === '' ||
      tl.trainline_no.toString().includes(search) ||
      (tl.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (tl.description || '').toLowerCase().includes(search.toLowerCase());
    const matchSystem = systemFilter === 'all' || tl.system_code === systemFilter;
    const matchCross = !crossConnectedOnly || tl.is_cross_connected;
    return matchSearch && matchSystem && matchCross;
  });

  const grouped = filtered.reduce((acc, tl) => {
    const sys = tl.system_code || 'TRL';
    if (!acc[sys]) acc[sys] = [];
    acc[sys].push(tl);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const systems = Object.keys(grouped).sort();

  if (loading) {
    return (
      <div className="animated-bg min-h-screen p-6 grid-pattern">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (error && trainlines.length === 0) {
    return (
      <div className="animated-bg min-h-screen p-6 grid-pattern">
        <div className="glass-card p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <p className="text-slate-400 mt-2">Please check database connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Trainline Explorer</h1>
        <p className="mt-2 text-slate-400">
          Trace all trainlines across the 6-car formation with cross-connection details
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{trainlines.length} trainlines in database</span>
          <span>{CROSS_CONNECTED_TRAINLINES.length} cross-connected</span>
          <span>{CRITICAL_TRAINLINES.length} critical</span>
        </div>
      </div>

      {/* Alerts */}
      <div className="mb-6 space-y-3">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">CRITICAL: X1 Pins 19/20 Crossed</p>
              <p className="text-xs text-slate-400 mt-1">
                Trainlines 3005 and 3006 (Powering 1 & 2) are crossed at X1 jumper pins 19/20. Incorrect wiring causes train creep.
                <Link href="/trainlines/3005" className="ml-2 text-red-300 hover:underline">View 3005</Link>
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Door Cross-Connections at Jumpers 43-47</p>
              <p className="text-xs text-slate-400 mt-1">
                6009/6046 (open left/right) cross at J43-44. 6014/6051 (close left/right) cross at J46-47. This enables all-door operation from single command.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trainlines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50"
          >
            <Filter className="h-4 w-4" />
            {systemFilter === 'all' ? 'All Systems' : systemFilter}
            <ChevronDown className="h-4 w-4" />
          </button>
          {showDropdown && (
            <div className="absolute top-full mt-2 z-50 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <button onClick={() => { setSystemFilter('all'); setShowDropdown(false); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50">All Systems</button>
              {Object.entries(SYSTEM_GROUPS).filter(([code]) => systems.includes(code)).map(([code, info]) => (
                <button key={code} onClick={() => { setSystemFilter(code); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50">
                  <span className={`${info.color}`}>{code}</span> - {info.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input type="checkbox" checked={crossConnectedOnly} onChange={(e) => setCrossConnectedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-600 focus:ring-cyan-500" />
          Cross-Connected Only
        </label>
      </div>

      {/* Critical Trainlines Quick Access */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Critical Trainlines</h2>
        <div className="flex flex-wrap gap-2">
          {CRITICAL_TRAINLINES.map(no => {
            const tl = trainlines.find(t => parseInt(t.trainline_no) === no);
            return (
              <Link key={no} href={`/trainlines/${no}`}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-all hover:scale-105 ${
                  CROSS_CONNECTED_TRAINLINES.includes(no)
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                }`}>
                {no}
                {tl && <span className="ml-2 text-xs text-slate-500">{tl.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grouped Listing */}
      <div className="space-y-8">
        {systems.map(systemCode => {
          const sysInfo = SYSTEM_GROUPS[systemCode] || SYSTEM_GROUPS['GEN'];
          const tlList = grouped[systemCode];

          return (
            <div key={systemCode} className="glass-card overflow-hidden">
              <div className={`px-6 py-4 border-b border-slate-700/50 flex items-center justify-between ${sysInfo.bg}`}>
                <div className="flex items-center gap-3">
                  <Zap className={`h-5 w-5 ${sysInfo.color}`} />
                  <span className={`font-bold text-lg ${sysInfo.color}`}>{systemCode}</span>
                  <span className="text-slate-400 text-sm">{sysInfo.label}</span>
                </div>
                <span className="text-xs text-slate-500">{tlList.length} trainlines</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Voltage</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cross</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {tlList.map(tl => {
                      const vColor = VOLTAGE_COLORS[tl.voltage_domain] || VOLTAGE_COLORS['110VDC'];
                      const isCross = CROSS_CONNECTED_TRAINLINES.includes(parseInt(tl.trainline_no));

                      return (
                        <tr key={tl.trainline_no} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`font-mono text-lg font-bold ${isCross ? 'text-amber-400' : 'text-cyan-400'}`}>
                              {tl.trainline_no}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">{tl.name || 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-400">{tl.description || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${vColor.text} ${vColor.bg}`}>
                              {tl.voltage_domain || '110V'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {tl.is_cross_connected ? (
                              <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium">
                                <AlertTriangle className="h-3 w-3" /> Yes
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/trainlines/${tl.trainline_no}`}
                              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                              Trace <ArrowRight className="h-4 w-4" />
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

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No trainlines match your search</p>
        </div>
      )}
    </div>
  );
}