'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cable, Search, ArrowRight, AlertTriangle, Filter, ChevronDown, Zap } from 'lucide-react';

const WIRE_REGISTRY = [
  { wire_no: '3003', signal: 'FORWARD_CMD', description: 'Forward propulsion command to VVVF', system: 'TRAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-X1-17', dest: 'V1-CN1-12' },
  { wire_no: '3004', signal: 'REVERSE_CMD', description: 'Reverse propulsion command to VVVF', system: 'TRAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-X1-18', dest: 'V1-CN1-13' },
  { wire_no: '3005', signal: 'POWERING_1', description: 'Powering command level 1 (crossed with 3006)', system: 'TRAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-X1-19', dest: 'V1-CN1-14', cross_connected: true },
  { wire_no: '3006', signal: 'POWERING_2', description: 'Powering command level 2 (crossed with 3005)', system: 'TRAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-X1-20', dest: 'V1-CN1-15', cross_connected: true },
  { wire_no: '3010', signal: 'BRAKE_CMD', description: 'Braking command to VVVF', system: 'TRAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-X1-22', dest: 'V1-CN1-16' },
  { wire_no: '3011', signal: 'FSB_CMD', description: 'Full service brake command', system: 'TRAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-X1-23', dest: 'V1-CN1-17' },
  { wire_no: '4024', signal: 'BRAKE_LOOP_N', description: 'Brake loop normal - through BCU/BECU all cars', system: 'BRAKE', size: '2.5mm²', color: 'Red', voltage: '110VDC', type: 'Control', source: 'BCU1-X1-24', dest: 'BCU2-X1-24' },
  { wire_no: '4028', signal: 'BRAKE_LOOP_R', description: 'Brake loop return path', system: 'BRAKE', size: '2.5mm²', color: 'Black', voltage: '110VDC', type: 'Control', source: 'BCU2-X1-24', dest: 'BCU1-X1-24' },
  { wire_no: '4062', signal: 'EM_BRAKE_N', description: 'Emergency brake loop normal - all cars', system: 'BRAKE', size: '2.5mm²', color: 'Red', voltage: '110VDC', type: 'Safety', source: 'EBMV-X1-42', dest: 'EBSS-X1-42' },
  { wire_no: '4070', signal: 'EM_BRAKE_N_RTN', description: 'Emergency brake loop normal return', system: 'BRAKE', size: '2.5mm²', color: 'Black', voltage: '110VDC', type: 'Safety', source: 'EBSS-X1-42', dest: 'EBMV-X1-42' },
  { wire_no: '4103', signal: 'EM_BRAKE_R', description: 'Emergency brake loop redundant - failsafe', system: 'BRAKE', size: '2.5mm²', color: 'Red', voltage: '110VDC', type: 'Safety', source: 'EBMV-X1-44', dest: 'EBSS-X1-44' },
  { wire_no: '4110', signal: 'EM_BRAKE_R_RTN', description: 'Emergency brake loop redundant return', system: 'BRAKE', size: '2.5mm²', color: 'Black', voltage: '110VDC', type: 'Safety', source: 'EBSS-X1-44', dest: 'EBMV-X1-44' },
  { wire_no: '4122', signal: 'PB_APPLIED', description: 'Parking brake applied indication', system: 'BRAKE', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-U15-K4', dest: 'PBMV1-CN1-2' },
  { wire_no: '4153', signal: 'PB_RELEASED', description: 'Parking brake released indication', system: 'BRAKE', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-U15-K5', dest: 'PBMV1-CN1-3' },
  { wire_no: '6009', signal: 'DOOR_OPEN_L', description: 'Left door open command (crossed with 6046)', system: 'DOOR', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-U15-J7', dest: 'DCU1-CN1-3', cross_connected: true },
  { wire_no: '6014', signal: 'DOOR_CLOSE_L', description: 'Left door close command (crossed with 6051)', system: 'DOOR', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-U15-J9', dest: 'DCU1-CN1-5', cross_connected: true },
  { wire_no: '6046', signal: 'DOOR_OPEN_R', description: 'Right door open command (crossed with 6009)', system: 'DOOR', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-U15-J8', dest: 'DCU1-CN1-4', cross_connected: true },
  { wire_no: '6051', signal: 'DOOR_CLOSE_R', description: 'Right door close command (crossed with 6014)', system: 'DOOR', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO1-U15-J10', dest: 'DCU1-CN1-6', cross_connected: true },
  { wire_no: '6073', signal: 'DOOR_PROVE_1', description: 'Door 1 proving loop feedback', system: 'DOOR', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'DCU1-CN2-3', dest: 'TCMS_RIO1-U15-H2' },
  { wire_no: '6076', signal: 'DOOR_PROVE_2', description: 'Door 2 proving loop feedback', system: 'DOOR', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'DCU1-CN2-4', dest: 'TCMS_RIO1-U15-H3' },
  { wire_no: '6112', signal: 'ZERO_SPEED', description: 'Zero speed signal - enables door opening', system: 'DOOR', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'V1-CN2-3', dest: 'TCMS_RIO1-U15-L3' },
  { wire_no: '7001', signal: 'CAB_VAC_FLT', description: 'Cab VAC fault indication', system: 'VAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'CAB_VAC1-CN1-5', dest: 'TCMS_RIO2-U25-F2' },
  { wire_no: '7050', signal: 'VAC1_STATUS', description: 'Saloon VAC 1 status feedback', system: 'VAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'VAC1-CN1-3', dest: 'TCMS_RIO1-U15-F4' },
  { wire_no: '7060', signal: 'VAC2_STATUS', description: 'Saloon VAC 2 status feedback', system: 'VAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'VAC1-CN1-4', dest: 'TCMS_RIO1-U15-F5' },
  { wire_no: '7070', signal: 'SMOKE_DETECT', description: 'Smoke detection alarm', system: 'VAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'SMOKE_SNS-CN1-1', dest: 'TCMS_RIO1-U15-F6' },
  { wire_no: '1032', signal: 'RESET', description: 'System reset command', system: 'TRL', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'OP_PNL1-CN1-1', dest: 'TCMS_RIO1-X1-32' },
  { wire_no: '1040', signal: 'AUX_ON', description: 'Auxiliary power on command', system: 'APS', size: '2.5mm²', color: 'Red', voltage: '110VDC', type: 'Control', source: 'OP_PNL1-CN1-2', dest: 'APS1-CN2-1' },
  { wire_no: '1050', signal: 'SHUTDOWN', description: 'System shutdown command', system: 'TRL', size: '2.5mm²', color: 'Black', voltage: '110VDC', type: 'Control', source: 'OP_PNL1-CN1-3', dest: 'APS1-CN2-2' },
  { wire_no: '5000', signal: 'SHORE_SUPPLY', description: 'Shore supply contactor command', system: 'APS', size: '2.5mm²', color: 'Red', voltage: '110VDC', type: 'Control', source: 'TCMS_RIO2-U25-H5', dest: 'SSB1-CN1-3' },
  { wire_no: '5030', signal: 'SIV_CONTACT1', description: 'SIV contactor 1 status', system: 'APS', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'APS1-CN3-1', dest: 'TCMS_RIO2-U25-J6' },
  { wire_no: '5031', signal: 'SIV_CONTACT2', description: 'SIV contactor 2 status', system: 'APS', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'APS1-CN3-2', dest: 'TCMS_RIO2-U25-J6' },
  { wire_no: '5064', signal: 'BAT_UNDER_VOLT', description: 'Battery under-voltage warning', system: 'APS', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Control', source: 'BATT1-CN1-2', dest: 'TCMS_RIO2-U25-G4' },
  { wire_no: '1207', signal: 'VVVF_FAULT', description: 'VVVF fault indication', system: 'TRAC', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Fault', source: 'V1-CN2-5', dest: 'TCMS_RIO1-U15-M2' },
  { wire_no: '1209', signal: 'HSCB_TRIP', description: 'HSCB trip status indication', system: 'HV', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Fault', source: 'HSCB1-CN1-3', dest: 'TCMS_RIO1-U15-H4' },
  { wire_no: '1215', signal: 'AUX_FAULT', description: 'Auxiliary system fault', system: 'APS', size: '1.5mm²', color: 'Blue', voltage: '110VDC', type: 'Fault', source: 'APS1-CN2-5', dest: 'TCMS_RIO2-U25-G3' },
];

const SYSTEM_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Traction' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Brake' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Door' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'VAC/HVAC' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Aux Power' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Trainlines' },
  HV: { color: 'text-red-600', bg: 'bg-red-600/20', label: 'HV' },
};

const TYPE_COLORS: Record<string, string> = {
  Control: 'bg-slate-500/20 text-slate-400',
  Safety: 'bg-red-500/20 text-red-400',
  Fault: 'bg-amber-500/20 text-amber-400',
};

const COLOR_CODES: Record<string, string> = {
  Blue: 'bg-blue-500/20 text-blue-400',
  Red: 'bg-red-500/20 text-red-400',
  Black: 'bg-slate-700 text-slate-300',
  White: 'bg-slate-100 text-slate-700',
  Green: 'bg-green-500/20 text-green-400',
  Yellow: 'bg-yellow-500/20 text-yellow-400',
  Orange: 'bg-orange-500/20 text-orange-400',
};

export default function WiresPage() {
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [crossOnly, setCrossOnly] = useState(false);

  const filtered = WIRE_REGISTRY.filter(w => {
    const matchSearch = search === '' ||
      w.wire_no.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase());
    const matchSystem = systemFilter === 'all' || w.system === systemFilter;
    const matchType = typeFilter === 'all' || w.type === typeFilter;
    const matchCross = !crossOnly || w.cross_connected;
    return matchSearch && matchSystem && matchType && matchCross;
  });

  const systems = ['TRAC', 'BRAKE', 'DOOR', 'VAC', 'APS', 'TRL', 'HV'];
  const types = ['Control', 'Safety', 'Fault'];

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Wire Intelligence</h1>
        <p className="mt-2 text-slate-400">
          Complete wire registry with specifications for point-to-point tracing
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{WIRE_REGISTRY.length} wires defined</span>
          <span>{WIRE_REGISTRY.filter(w => w.cross_connected).length} cross-connected</span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-400" /> 4 critical cross-connections
          </span>
        </div>
      </div>

      {/* Wire Format Decoder */}
      <div className="mb-6 glass-card p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" /> Wire Number Format: XXXX XX (5-digit)
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">1-2</div>
            <div className="text-cyan-400 font-mono font-bold">Unit</div>
          </div>
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">3</div>
            <div className="text-cyan-400 font-mono font-bold">Car</div>
          </div>
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">4</div>
            <div className="text-cyan-400 font-mono font-bold">TL</div>
          </div>
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">5</div>
            <div className="text-cyan-400 font-mono font-bold">Ser</div>
          </div>
          <div className="ml-4 text-slate-400">
            Example: <span className="font-mono text-cyan-400">3</span> (M car) + <span className="font-mono text-cyan-400">003</span> (trainline 3003) + <span className="font-mono text-cyan-400">1</span> (serial)
          </div>
        </div>
      </div>

      {/* Cross-Connection Alerts */}
      <div className="mb-6 space-y-2">
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-red-400">X1 Pins 19/20:</span>
            <span className="text-slate-300 ml-2">3005 ↔ 3006 (Powering 1 & 2 crossed)</span>
            <Link href="/trainlines/3005" className="ml-2 text-red-300 hover:underline text-xs">View</Link>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-400">Jumpers 43-47:</span>
            <span className="text-slate-300 ml-2">6009↔6046, 6014↔6051 (Door open/close crossed)</span>
            <Link href="/trainlines/6009" className="ml-2 text-amber-300 hover:underline text-xs">View</Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search wires..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Systems</option>
          {systems.map(s => <option key={s} value={s}>{s} - {SYSTEM_COLORS[s]?.label}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input type="checkbox" checked={crossOnly} onChange={(e) => setCrossOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-600" />
          Cross-Connected Only
        </label>
      </div>

      {/* Wire Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Wire #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">System</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Path</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(wire => {
                const sysInfo = SYSTEM_COLORS[wire.system] || SYSTEM_COLORS['TRL'];
                const colorClass = COLOR_CODES[wire.color] || 'bg-slate-700 text-slate-300';
                const typeColor = TYPE_COLORS[wire.type] || TYPE_COLORS['Control'];

                return (
                  <tr key={wire.wire_no} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-lg font-bold ${wire.cross_connected ? 'text-amber-400' : 'text-cyan-400'}`}>
                          {wire.wire_no}
                        </span>
                        {wire.cross_connected && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium text-sm">{wire.signal}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 max-w-xs truncate block">{wire.description}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sysInfo.color} ${sysInfo.bg}`}>
                        {wire.system}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
                        {wire.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{wire.size}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                        {wire.color}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="font-mono">{wire.source}</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-mono">{wire.dest}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/wires/${wire.wire_no}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm">
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

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No wires match your filters</p>
        </div>
      )}
    </div>
  );
}