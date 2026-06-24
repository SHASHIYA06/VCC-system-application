'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, BookOpen, Cpu, FileText, Zap, Shield, DoorOpen, Wind, Radio,
  Battery, Settings, Train, Lightbulb, Activity, Box, Cable, MapPin,
  Loader2, ChevronRight, Layers, ExternalLink, Database,
} from 'lucide-react';

interface VCCSystem {
  id: string;
  code: string;
  name: string;
  category: string | null;
  description: string | null;
  vccDescription: {
    description: string | null;
    technicalSpecs: string | null;
    powerRequirements: string | null;
    voltage: string | null;
    safetyFeatures: string | null;
  } | null;
  metadata: {
    dataCompleteness: number;
    totalDrawings: number;
    verifiedDrawings: number;
    totalDevices: number;
    totalConnectors: number;
    totalWires: number;
  } | null;
  counts: { devices: number; drawings: number; subsystems: number };
}

const SYSTEM_ICONS: Record<string, any> = {
  TRAC: Zap, BRAKE: Shield, DOOR: DoorOpen, VAC: Wind, APS: Battery,
  COMMS: Radio, TMS: Cpu, HV: Activity, LIGHT: Lightbulb, GEN: Settings,
  TRL: Train, CAB: Settings, BOGIE: Box, COUPLING: Cable, EDB: Database,
  LTEB: Battery, LTJB: Battery, PIS: Radio, AUX: Battery,
};
const SYSTEM_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  TRAC: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  BRAKE: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  DOOR: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  VAC: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  APS: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  COMMS: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  TMS: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  HV: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  LIGHT: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  GEN: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  TRL: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  CAB: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
};

function getSystemStyle(code: string) {
  return SYSTEM_COLORS[code] || { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
}

export default function VCCReferencePage() {
  const [systems, setSystems] = useState<VCCSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [systemDetail, setSystemDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function loadSystems() {
      try {
        const res = await fetch('/api/vcc-descriptions');
        const data = await res.json();
        if (data.success) setSystems(data.data);
      } catch (err) {
        console.error('Failed to load VCC descriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSystems();
  }, []);

  useEffect(() => {
    if (!selectedSystem) { setSystemDetail(null); return; }
    async function loadDetail() {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/vcc-descriptions?systemCode=${selectedSystem}`);
        const data = await res.json();
        if (data.success) setSystemDetail(data.data);
      } catch (err) { console.error(err); }
      finally { setDetailLoading(false); }
    }
    loadDetail();
  }, [selectedSystem]);

  const filteredSystems = systems.filter(s =>
    !search ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.vccDescription?.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-teal-400" />
            VCC Knowledge Center
          </h1>
          <p className="text-slate-400 mt-1">
            Vehicle Control Circuits — system descriptions, drawings, and technical references from the production database
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search systems, descriptions..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System List */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Systems ({filteredSystems.length})
            </h2>
            {filteredSystems.map(sys => {
              const style = getSystemStyle(sys.code);
              const Icon = SYSTEM_ICONS[sys.code] || Layers;
              const isSelected = selectedSystem === sys.code;
              return (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystem(sys.code)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? `${style.bg} ${style.border} ring-1 ring-cyan-500/30`
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${style.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{sys.code}</span>
                        <span className="text-slate-400 text-xs truncate">{sys.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{sys.counts.drawings} dwgs</span>
                        <span>{sys.counts.devices} devices</span>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {!selectedSystem ? (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a system from the list to view its VCC documentation</p>
                <p className="text-slate-500 text-sm mt-2">
                  {systems.length} systems · Loaded from production database
                </p>
              </div>
            ) : detailLoading ? (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
              </div>
            ) : systemDetail ? (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 space-y-6">
                {/* System Header */}
                <div>
                  <h2 className="text-2xl font-bold text-white">{systemDetail.code} — {systemDetail.name}</h2>
                  {systemDetail.category && (
                    <span className="text-sm text-slate-400 mt-1">Category: {systemDetail.category}</span>
                  )}
                </div>

                {/* VCC Description */}
                {systemDetail.vccDescription && (
                  <div className="space-y-4">
                    {systemDetail.vccDescription.description && (
                      <div>
                        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {systemDetail.vccDescription.description}
                        </p>
                      </div>
                    )}
                    {systemDetail.vccDescription.technicalSpecs && (
                      <div>
                        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Technical Specifications</h3>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {systemDetail.vccDescription.technicalSpecs}
                        </p>
                      </div>
                    )}
                    {systemDetail.vccDescription.powerRequirements && (
                      <div>
                        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Power Requirements</h3>
                        <p className="text-slate-300 text-sm">{systemDetail.vccDescription.powerRequirements}</p>
                      </div>
                    )}
                    {systemDetail.vccDescription.voltage && (
                      <div>
                        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Voltage</h3>
                        <p className="text-slate-300 text-sm">{systemDetail.vccDescription.voltage}</p>
                      </div>
                    )}
                    {systemDetail.vccDescription.safetyFeatures && (
                      <div>
                        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Safety Features</h3>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{systemDetail.vccDescription.safetyFeatures}</p>
                      </div>
                    )}
                  </div>
                )}

                {!systemDetail.vccDescription && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-400 text-sm">No VCC description available for this system yet.</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Drawings" value={systemDetail.drawings?.length || 0} icon={<FileText className="h-4 w-4" />} />
                  <StatCard label="Devices" value={systemDetail.devices?.length || 0} icon={<Cpu className="h-4 w-4" />} />
                  <StatCard label="Connectors" value={systemDetail.connectorCount || 0} icon={<Box className="h-4 w-4" />} />
                  <StatCard label="Wires" value={systemDetail.wireCount || 0} icon={<Cable className="h-4 w-4" />} />
                </div>

                {/* Drawings list */}
                {systemDetail.drawings && systemDetail.drawings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                      Drawings ({systemDetail.drawings.length})
                    </h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {systemDetail.drawings.map((dwg: any) => (
                        <Link
                          key={dwg.id}
                          href={`/drawings/${dwg.id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-slate-500 group-hover:text-cyan-400" />
                          <span className="font-mono text-sm text-slate-300 group-hover:text-white">
                            {dwg.drawingNo}
                          </span>
                          <span className="text-xs text-slate-500 truncate flex-1">{dwg.title}</span>
                          <span className="text-xs text-slate-600">Rev {dwg.revision}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Devices list */}
                {systemDetail.devices && systemDetail.devices.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                      Equipment/Devices ({systemDetail.devices.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {systemDetail.devices.map((dev: any) => (
                        <div key={dev.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <Cpu className="h-3.5 w-3.5 text-pink-400" />
                          <span className="text-sm text-slate-300 truncate">{dev.deviceName}</span>
                          {dev.tagNo && <span className="text-xs text-slate-500 ml-auto">{dev.tagNo}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation links */}
                <div className="pt-4 border-t border-slate-700/50 flex flex-wrap gap-3">
                  <Link
                    href={`/systems/${systemDetail.code}`}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm hover:bg-cyan-600/30 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View System Page
                  </Link>
                  <Link
                    href={`/gsd/explore`}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    GSD Topology
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/30 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
