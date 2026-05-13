'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cpu, Search, ChevronRight } from 'lucide-react';

interface TCMSPoint {
  id: string;
  point_code: string;
  signal_name: string;
  signal_type: string;
  connector_code: string;
  wire_no: string | null;
  device_name: string;
  remarks: string;
}

interface TCMSResponse {
  points: TCMSPoint[];
  count: number;
}

const SIGNAL_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string; badge: string }> = {
  DI: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Digital Input', badge: 'DI' },
  DO: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Digital Output', badge: 'DO' },
  AI: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Analog Input', badge: 'AI' },
  AO: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Analog Output', badge: 'AO' },
};

const SYSTEM_COLORS: Record<string, { color: string; bg: string }> = {
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20' },
  HV: { color: 'text-red-600', bg: 'bg-red-600/20' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  COMMS: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
};

export default function TcmsPage() {
  const [search, setSearch] = useState('');
  const [signalFilter, setSignalFilter] = useState<string>('all');
  const [tcmsData, setTcmsData] = useState<TCMSPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTCMS() {
      try {
        const res = await fetch('/api/tcms');
        const data: TCMSResponse = await res.json();
        setTcmsData(data.points || []);
      } catch {
        setTcmsData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTCMS();
  }, []);

  const filtered = tcmsData.filter(p => {
    const matchSearch = search === '' ||
      p.point_code.toLowerCase().includes(search.toLowerCase()) ||
      p.signal_name.toLowerCase().includes(search.toLowerCase()) ||
      p.remarks.toLowerCase().includes(search.toLowerCase());
    const matchType = signalFilter === 'all' || p.signal_type === signalFilter;
    return matchSearch && matchType;
  });

  const grouped = filtered.reduce((acc, p) => {
    const key = p.device_name || p.connector_code;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">TCMS I/O Point Browser</h1>
        <p className="mt-2 text-slate-400">
          Browse TCMS Remote I/O digital inputs and outputs with trainline mapping
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <>
              <span>{tcmsData.length} points defined</span>
              <span>{Object.keys(grouped).length} devices</span>
            </>
          )}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="mb-8 glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">TCMS Architecture</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-32 p-3 rounded-lg bg-slate-800 border border-slate-600 text-center">
              <div className="text-xs text-slate-400">Central</div>
              <div className="font-bold text-white">TMS CPU</div>
            </div>
            <div className="w-0.5 h-8 bg-slate-600"></div>
            <div className="w-4 h-0.5 bg-slate-600"></div>
          </div>
          <div className="flex items-center gap-8">
            {!loading && Object.entries(grouped).slice(0, 2).map(([deviceName, pts], idx) => (
              <div key={deviceName} className="flex flex-col items-center">
                <div className={`w-40 p-3 rounded-lg border ${idx === 0 ? 'bg-blue-500/20 border-blue-500/50' : 'bg-green-500/20 border-green-500/50'} text-center`}>
                  <div className={`text-xs ${idx === 0 ? 'text-blue-400' : 'text-green-400'}`}>Device</div>
                  <div className="font-bold text-white">{deviceName}</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {pts.length} points
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search points..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>

        <select value={signalFilter} onChange={(e) => setSignalFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none">
          <option value="all">All Types</option>
          <option value="DIGITAL_IN">Digital Input</option>
          <option value="DIGITAL_OUT">Digital Output</option>
          <option value="ANALOG_IN">Analog Input</option>
          <option value="ANALOG_OUT">Analog Output</option>
        </select>
      </div>

      {/* Points by Device */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([deviceName, points], idx) => {
          const isEven = idx % 2 === 0;
          const bgClass = isEven ? 'border-blue-500/30' : 'border-green-500/30';
          const headerClass = isEven ? 'bg-blue-500/10' : 'bg-green-500/10';

          return (
            <div key={deviceName} className={`glass-card overflow-hidden border-2 ${bgClass}`}>
              <div className={`px-6 py-4 border-b border-slate-700/50 flex items-center gap-4 ${headerClass}`}>
                <Cpu className={`h-6 w-6 ${isEven ? 'text-blue-400' : 'text-green-400'}`} />
                <div>
                  <h2 className={`font-bold text-lg ${isEven ? 'text-blue-400' : 'text-green-400'}`}>
                    {deviceName || 'Unknown Device'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {points.filter(p => p.signal_type === 'DIGITAL_IN').length} DI / {points.filter(p => p.signal_type === 'DIGITAL_OUT').length} DO
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Point Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Signal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Connector</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Wire</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {points.map(p => {
                      const typeKey = p.signal_type.replace('_IN', '').replace('_OUT', '').toUpperCase();
                      const typeConfig = SIGNAL_TYPE_CONFIG[typeKey] || SIGNAL_TYPE_CONFIG['DI'];

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <span className="font-mono text-cyan-400 font-medium">{p.point_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-white font-medium text-sm">{p.signal_name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${typeConfig.color} ${typeConfig.bg}`}>
                              {typeConfig.badge}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">{p.connector_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-500 font-mono">{p.wire_no || '-'}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/tcms/${p.point_code}`}
                              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm">
                              Details <ChevronRight className="h-4 w-4" />
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
          <Cpu className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No TCMS points match your filters</p>
        </div>
      )}
    </div>
  );
}