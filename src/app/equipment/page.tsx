'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cpu, Search, ArrowRight, Box, Shield, Zap, Battery, Wind, DoorOpen, Radio, Activity } from 'lucide-react';

interface EquipmentItem {
  id: string;
  code: string;
  name: string;
  system: { code: string; name: string } | null;
  type: string | null;
  carType: string;
  location: string;
  description: string;
  connectorCount?: number;
}

interface EquipmentResponse {
  equipment: EquipmentItem[];
  count: number;
  filters?: {
    carTypes: string[];
    systems: string[];
  };
}

const SYSTEM_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: 'Zap' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20', icon: 'Shield' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20', icon: 'Battery' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: 'DoorOpen' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: 'Wind' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: 'Activity' },
  COMMS: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: 'Radio' },
  LTEB: { color: 'text-indigo-400', bg: 'bg-indigo-500/20', icon: 'Box' },
  EDB: { color: 'text-rose-400', bg: 'bg-rose-500/20', icon: 'Box' },
  HV: { color: 'text-red-600', bg: 'bg-red-600/20', icon: 'Zap' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: 'Activity' },
  CAB: { color: 'text-violet-400', bg: 'bg-violet-500/20', icon: 'Cpu' },
};

const CAR_COLORS: Record<string, { color: string; bg: string }> = {
  DMC: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  TC: { color: 'text-green-400', bg: 'bg-green-500/20' },
  MC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  CAB: { color: 'text-violet-400', bg: 'bg-violet-500/20' },
};

export default function EquipmentPage() {
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const res = await fetch('/api/equipment?connectors=true');
        const data: EquipmentResponse = await res.json();
        setEquipmentData(data.equipment || []);
      } catch {
        setEquipmentData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEquipment();
  }, []);

  const filtered = equipmentData.filter(eq => {
    const matchSearch = search === '' ||
      eq.code.toLowerCase().includes(search.toLowerCase()) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.description.toLowerCase().includes(search.toLowerCase());
    const matchCar = carFilter === 'all' || eq.carType === carFilter;
    const matchSystem = systemFilter === 'all' || eq.system?.code === systemFilter;
    return matchSearch && matchCar && matchSystem;
  });

  const systems = [...new Set(equipmentData.map(eq => eq.system?.code).filter(Boolean) as string[])].sort();
  const cars = [...new Set(equipmentData.map(eq => eq.carType).filter(Boolean))];

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Equipment Library</h1>
        <p className="mt-2 text-slate-400">
          Complete equipment registry with connectors, trainlines, and drawing references
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{loading ? '...' : equipmentData.length} equipment items</span>
          <span>{cars.length} car types</span>
          <span>{systems.length} systems</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search equipment..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <select value={carFilter} onChange={(e) => setCarFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Cars</option>
          {cars.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Systems</option>
          {systems.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-slate-400">Loading equipment...</div>
        ) : filtered.map(eq => {
          const sysInfo = SYSTEM_COLORS[eq.system?.code || 'TRL'] || SYSTEM_COLORS['TRL'];
          const carInfo = CAR_COLORS[eq.carType] || CAR_COLORS['CAB'];

          return (
            <Link key={eq.id} href={`/equipment/${eq.code}`}>
              <div className="glass-card p-5 hover:border-cyan-500/40 transition-all group h-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${carInfo.color} ${carInfo.bg}`}>
                        {eq.carType}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sysInfo.color} ${sysInfo.bg}`}>
                        {eq.system?.code || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {eq.code}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{eq.name}</p>
                  </div>
                  <Cpu className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>

                <p className="mt-3 text-xs text-slate-500 line-clamp-2">{eq.description}</p>

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span>{eq.location}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{eq.type || 'N/A'}</span>
                </div>

                {eq.connectorCount !== undefined && (
                  <div className="mt-3 flex items-center gap-1">
                    <span className="text-xs text-slate-500">{eq.connectorCount} connector{eq.connectorCount !== 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-end">
                  <span className="text-xs text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                    View <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Cpu className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No equipment matches your filters</p>
        </div>
      )}
    </div>
  );
}