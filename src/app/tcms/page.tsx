'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cpu, Search, ChevronRight, Zap, ArrowRight } from 'lucide-react';

const TCMS_RIO_POINTS = [
  // MC - TCMS_RIO1 (U15)
  { point_code: 'U15-J7', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: '7', type: 'DO', signal: 'DOOR_OPEN_LEFT', system: 'DOOR', description: 'Left door open command', trainlines: ['6009'] },
  { point_code: 'U15-J8', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: '8', type: 'DO', signal: 'DOOR_OPEN_RIGHT', system: 'DOOR', description: 'Right door open command', trainlines: ['6046'] },
  { point_code: 'U15-J9', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: '9', type: 'DO', signal: 'DOOR_CLOSE_LEFT', system: 'DOOR', description: 'Left door close command', trainlines: ['6014'] },
  { point_code: 'U15-J10', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: '10', type: 'DO', signal: 'DOOR_CLOSE_RIGHT', system: 'DOOR', description: 'Right door close command', trainlines: ['6051'] },
  { point_code: 'U15-H2', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'H2', type: 'DI', signal: 'DOOR1_STATUS', system: 'DOOR', description: 'Door 1 open/closed status', trainlines: ['6073'] },
  { point_code: 'U15-H3', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'H3', type: 'DI', signal: 'DOOR2_STATUS', system: 'DOOR', description: 'Door 2 open/closed status', trainlines: ['6076'] },
  { point_code: 'U15-L3', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'L3', type: 'DI', signal: 'ZERO_SPEED', system: 'DOOR', description: 'Zero speed - enables door opening', trainlines: ['6112'] },
  { point_code: 'U15-K4', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'K4', type: 'DI', signal: 'PARKING_BRAKE_APPLIED', system: 'BRAKE', description: 'Parking brake applied status', trainlines: ['4122'] },
  { point_code: 'U15-K5', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'K5', type: 'DI', signal: 'PARKING_BRAKE_RELEASED', system: 'BRAKE', description: 'Parking brake released status', trainlines: ['4153'] },
  { point_code: 'U15-D2', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'D2', type: 'DO', signal: 'BRAKE_NORMAL', system: 'BRAKE', description: 'Normal brake command', trainlines: ['4024'] },
  { point_code: 'U15-D3', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'D3', type: 'DO', signal: 'EMERGENCY_BRAKE', system: 'BRAKE', description: 'Emergency brake command', trainlines: ['4062'] },
  { point_code: 'U15-F4', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'F4', type: 'DI', signal: 'VAC1_STATUS', system: 'VAC', description: 'Saloon VAC 1 status feedback', trainlines: ['7050'] },
  { point_code: 'U15-F5', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'F5', type: 'DI', signal: 'VAC2_STATUS', system: 'VAC', description: 'Saloon VAC 2 status feedback', trainlines: ['7060'] },
  { point_code: 'U15-F6', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'F6', type: 'DI', signal: 'SMOKE_DETECT', system: 'VAC', description: 'Smoke detection alarm', trainlines: ['7070'] },
  { point_code: 'U15-G2', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'G2', type: 'DO', signal: 'VVVF_FAULT_RST', system: 'TRAC', description: 'VVVF fault reset', trainlines: ['1032'] },
  { point_code: 'U15-H4', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'H4', type: 'DI', signal: 'HSCB_TRIP_STATUS', system: 'HV', description: 'HSCB trip status', trainlines: ['1209'] },
  { point_code: 'U15-M2', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'M2', type: 'DI', signal: 'VVVF_FAULT', system: 'TRAC', description: 'VVVF fault indication', trainlines: ['1207'] },
  { point_code: 'U15-M3', rio_unit: 'TCMS_RIO1', car: 'MC', connector: 'CN1', pin: 'M3', type: 'DI', signal: 'AUX_FAULT', system: 'APS', description: 'Auxiliary system fault', trainlines: ['1215'] },

  // TC - TCMS_RIO2 (U25)
  { point_code: 'U25-F2', rio_unit: 'TCMS_RIO2', car: 'TC', connector: 'CN1', pin: 'F2', type: 'DI', signal: 'CAB_VAC_FAULT', system: 'VAC', description: 'Cab VAC fault status', trainlines: ['7001'] },
  { point_code: 'U25-G3', rio_unit: 'TCMS_RIO2', car: 'TC', connector: 'CN1', pin: 'G3', type: 'DI', signal: 'APS_FAULT', system: 'APS', description: 'APS auxiliary fault', trainlines: ['1215'] },
  { point_code: 'U25-G4', rio_unit: 'TCMS_RIO2', car: 'TC', connector: 'CN1', pin: 'G4', type: 'DI', signal: 'BATTERY_UNDER_VOLT', system: 'APS', description: 'Battery under-voltage warning', trainlines: ['5064'] },
  { point_code: 'U25-H5', rio_unit: 'TCMS_RIO2', car: 'TC', connector: 'CN1', pin: 'H5', type: 'DO', signal: 'SHORE_SUPPLY_CMD', system: 'APS', description: 'Shore supply contactor command', trainlines: ['5000'] },
  { point_code: 'U25-J6', rio_unit: 'TCMS_RIO2', car: 'TC', connector: 'CN1', pin: 'J6', type: 'DI', signal: 'SIV_CONTACT_STATUS', system: 'APS', description: 'SIV contactor status feedback', trainlines: ['5030', '5031'] },
  { point_code: 'U25-K3', rio_unit: 'TCMS_RIO2', car: 'TC', connector: 'CN1', pin: 'K3', type: 'DI', signal: 'BRAKE_PRESSURE_LOW', system: 'BRAKE', description: 'Low brake pressure warning', trainlines: ['4024'] },
  { point_code: 'U25-L4', rio_unit: 'TCMS_RIO2', car: 'TC', connector: 'CN1', pin: 'L4', type: 'DI', signal: 'COMPRESSOR_STATUS', system: 'BRAKE', description: 'Compressor running status', trainlines: ['4024'] },
];

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
  const [carFilter, setCarFilter] = useState<string>('all');
  const [systemFilter, setSystemFilter] = useState<string>('all');

  const filtered = TCMS_RIO_POINTS.filter(p => {
    const matchSearch = search === '' ||
      p.point_code.toLowerCase().includes(search.toLowerCase()) ||
      p.signal.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchType = signalFilter === 'all' || p.type === signalFilter;
    const matchCar = carFilter === 'all' || p.car === carFilter;
    const matchSystem = systemFilter === 'all' || p.system === systemFilter;
    return matchSearch && matchType && matchCar && matchSystem;
  });

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.rio_unit]) acc[p.rio_unit] = [];
    acc[p.rio_unit].push(p);
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
          <span>{TCMS_RIO_POINTS.length} points defined</span>
          <span>2 RIO units</span>
          <span>2 car types</span>
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
            <div className="flex flex-col items-center">
              <div className="w-40 p-3 rounded-lg bg-blue-500/20 border border-blue-500/50 text-center">
                <div className="text-xs text-blue-400">MC Car</div>
                <div className="font-bold text-white">TCMS_RIO1</div>
                <div className="text-xs text-slate-400">U15</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {TCMS_RIO_POINTS.filter(p => p.rio_unit === 'TCMS_RIO1').length} points
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-40 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-center">
                <div className="text-xs text-green-400">TC Car</div>
                <div className="font-bold text-white">TCMS_RIO2</div>
                <div className="text-xs text-slate-400">U25</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {TCMS_RIO_POINTS.filter(p => p.rio_unit === 'TCMS_RIO2').length} points
              </div>
            </div>
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
          <option value="DI">Digital Input (DI)</option>
          <option value="DO">Digital Output (DO)</option>
        </select>

        <select value={carFilter} onChange={(e) => setCarFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none">
          <option value="all">All Cars</option>
          <option value="MC">Motor Car (MC)</option>
          <option value="TC">Trailer Car (TC)</option>
        </select>

        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none">
          <option value="all">All Systems</option>
          <option value="DOOR">Door</option>
          <option value="BRAKE">Brake</option>
          <option value="VAC">VAC</option>
          <option value="TRAC">Traction</option>
          <option value="APS">APS</option>
        </select>
      </div>

      {/* Points by RIO */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([rioUnit, points]) => {
          const carType = rioUnit === 'TCMS_RIO1' ? 'MC' : 'TC';
          const bgClass = carType === 'MC' ? 'border-blue-500/30' : 'border-green-500/30';
          const headerClass = carType === 'MC' ? 'bg-blue-500/10' : 'bg-green-500/10';

          return (
            <div key={rioUnit} className={`glass-card overflow-hidden border-2 ${bgClass}`}>
              <div className={`px-6 py-4 border-b border-slate-700/50 flex items-center gap-4 ${headerClass}`}>
                <Cpu className={`h-6 w-6 ${carType === 'MC' ? 'text-blue-400' : 'text-green-400'}`} />
                <div>
                  <h2 className={`font-bold text-lg ${carType === 'MC' ? 'text-blue-400' : 'text-green-400'}`}>
                    {rioUnit} ({carType === 'MC' ? 'M Car' : 'TC Car'})
                  </h2>
                  <p className="text-xs text-slate-400">
                    {points.filter(p => p.type === 'DI').length} DI / {points.filter(p => p.type === 'DO').length} DO
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">System</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Trainlines</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {points.map(p => {
                      const typeConfig = SIGNAL_TYPE_CONFIG[p.type];
                      const sysConfig = SYSTEM_COLORS[p.system] || SYSTEM_COLORS['TMS'];

                      return (
                        <tr key={p.point_code} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <span className="font-mono text-cyan-400 font-medium">{p.point_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-white font-medium text-sm">{p.signal}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${typeConfig.color} ${typeConfig.bg}`}>
                              {typeConfig.badge}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">{p.description}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sysConfig.color} ${sysConfig.bg}`}>
                              {p.system}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {p.trainlines.map(tl => (
                                <Link key={tl} href={`/trainlines/${tl}`}
                                  className="px-1.5 py-0.5 rounded bg-slate-700/50 text-xs font-mono text-slate-300 hover:bg-slate-600/50">
                                  {tl}
                                </Link>
                              ))}
                            </div>
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