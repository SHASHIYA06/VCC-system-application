'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, Search, ChevronRight, Wrench, 
  Zap, Shield, DoorOpen, Wind, Battery, Cpu, Info, Lightbulb,
  Loader2, RefreshCw, Database, ExternalLink, Radio, Activity,
  CheckCircle2, XCircle, ChevronDown
} from 'lucide-react';

interface DatabaseLink {
  id: string;
  drawingNo: string;
  title: string;
  exists: boolean;
}

interface WireLink {
  wireNo: string;
  signalName: string;
  description: string;
  exists: boolean;
}

interface FaultCode {
  code: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  system: string;
  trainlines: string[];
  symptoms: string[];
  causes: string[];
  solutions: string[];
  drawings: string[];
  databaseLinks: {
    drawings: DatabaseLink[];
    wires: WireLink[];
    missingDrawings: string[];
    missingWires: string[];
  };
}

interface SystemStat {
  code: string;
  name: string;
  faultCount: number;
  drawingCount: number;
  deviceCount: number;
}

interface TroubleshootingData {
  faults: FaultCode[];
  total: number;
  systems: SystemStat[];
  statistics: {
    totalFaults: number;
    criticalCount: number;
    warningCount: number;
    systemsCovered: number;
  };
}

const SYSTEM_ICONS: Record<string, any> = {
  TRAC: Zap, BRAKE: Shield, DOOR: DoorOpen, VAC: Wind, APS: Battery,
  TMS: Cpu, LIGHT: Lightbulb, HV: Activity, COMMS: Radio,
};

const SYSTEM_COLORS: Record<string, string> = {
  TRAC: 'text-orange-400', BRAKE: 'text-red-400', DOOR: 'text-amber-400',
  VAC: 'text-cyan-400', APS: 'text-green-400', TMS: 'text-purple-400',
  LIGHT: 'text-yellow-400', HV: 'text-rose-400', COMMS: 'text-emerald-400',
};

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle },
  warning: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: AlertTriangle },
  info: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: Info },
};

export default function TroubleshootingPage() {
  const [data, setData] = useState<TroubleshootingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFault, setExpandedFault] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSystem) params.set('systemCode', selectedSystem);
      if (searchTerm) params.set('search', searchTerm);
      
      const res = await fetch(`/api/troubleshooting?${params.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to load troubleshooting data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [selectedSystem, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFaults = data?.faults || [];

  const toggleFault = (code: string) => {
    setExpandedFault(expandedFault === code ? null : code);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wrench className="h-8 w-8 text-red-400" />
            VCC Troubleshooting Center
          </h1>
          <p className="mt-2 text-slate-400">
            Fault diagnosis and resolution for Vehicle Control Circuits — KMRCL RS(3R)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {data && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm">
              <Database className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-300">{data.total} faults · {data.statistics.systemsCovered} systems</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Bar */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="text-2xl font-bold text-white">{data.statistics.totalFaults}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Faults</div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{data.statistics.criticalCount}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Critical</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-2xl font-bold text-amber-400">{data.statistics.warningCount}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Warning</div>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="text-2xl font-bold text-cyan-400">{data.statistics.systemsCovered}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Systems</div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search fault codes, symptoms, trainlines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSystem(null)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              !selectedSystem
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}
          >
            All Systems
          </button>
          {data?.systems.filter(s => s.faultCount > 0).map(sys => {
            const Icon = SYSTEM_ICONS[sys.code] || Cpu;
            return (
              <button
                key={sys.code}
                onClick={() => setSelectedSystem(sys.code === selectedSystem ? null : sys.code)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  sys.code === selectedSystem
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${SYSTEM_COLORS[sys.code] || 'text-slate-400'}`} />
                {sys.code}
                <span className="text-xs opacity-60">({sys.faultCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Fault Cards */}
      {!loading && !error && (
        <div className="space-y-3">
          {filteredFaults.map((fault) => {
            const severity = SEVERITY_STYLES[fault.severity];
            const SeverityIcon = severity.icon;
            const isExpanded = expandedFault === fault.code;
            const SystemIcon = SYSTEM_ICONS[fault.system] || Cpu;
            
            return (
              <div
                key={fault.code}
                className={`rounded-xl border transition-all ${
                  isExpanded 
                    ? 'bg-slate-800/60 border-slate-600/50 shadow-lg' 
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                {/* Fault Header */}
                <button
                  onClick={() => toggleFault(fault.code)}
                  className="w-full text-left p-5 flex items-start gap-4 cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${severity.bg} shrink-0 mt-0.5`}>
                    <SeverityIcon className={`h-5 w-5 ${severity.text}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{fault.description}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${severity.bg} ${severity.text} ${severity.border}`}>
                            {fault.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <SystemIcon className={`h-3.5 w-3.5 ${SYSTEM_COLORS[fault.system] || 'text-slate-400'}`} />
                            {fault.system}
                          </span>
                          <span className="font-mono text-xs">Code: {fault.code}</span>
                          {fault.trainlines.length > 0 && (
                            <span className="text-xs">{fault.trainlines.length} trainlines</span>
                          )}
                          {fault.databaseLinks && (
                            <span className="flex items-center gap-1 text-xs text-cyan-400/60">
                              <Database className="h-3 w-3" />
                              {fault.databaseLinks.drawings.length} drawings linked
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-slate-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-5 border-t border-slate-700/50 pt-4 ml-11">
                    {/* Trainlines */}
                    {fault.trainlines.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Related Trainlines</h4>
                        <div className="flex gap-2 flex-wrap">
                          {fault.trainlines.map(tl => {
                            const wireExists = fault.databaseLinks?.wires.find(w => w.wireNo === tl)?.exists;
                            return (
                              <Link
                                key={tl}
                                href={`/wires?search=${tl}`}
                                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${
                                  wireExists
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
                                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700'
                                }`}
                              >
                                {tl}
                                {wireExists && <CheckCircle2 className="inline h-3 w-3 ml-1 text-green-400" />}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Symptoms & Causes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                        <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Symptoms
                        </h4>
                        <ul className="space-y-1.5">
                          {fault.symptoms.map((s, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                        <h4 className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Possible Causes
                        </h4>
                        <ul className="space-y-1.5">
                          {fault.causes.map((c, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-rose-500 mt-0.5">•</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Solutions */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Resolution Steps
                      </h4>
                      <ol className="space-y-2">
                        {fault.solutions.map((s, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Database-linked Drawings */}
                    {fault.databaseLinks && fault.databaseLinks.drawings.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Database className="h-3.5 w-3.5 text-cyan-400" />
                          Reference Drawings (from database)
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {fault.databaseLinks.drawings.map(dwg => (
                            <Link
                              key={dwg.id}
                              href={`/drawings/${dwg.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              <span className="font-mono">{dwg.drawingNo}</span>
                              <ExternalLink className="h-3 w-3 text-slate-500" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Drawings Warning */}
                    {fault.databaseLinks?.missingDrawings && fault.databaseLinks.missingDrawings.length > 0 && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                        <p className="text-xs text-amber-400 flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Drawings not found in database: {fault.databaseLinks.missingDrawings.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaults.length === 0 && !loading && (
            <div className="text-center py-16 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <Wrench className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No matching fault codes found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search or system filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
