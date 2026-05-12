'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cable, Search, ArrowRight, ChevronDown, Box, Cpu } from 'lucide-react';

const CONNECTOR_REGISTRY: Array<{
  id: string; connector_code: string; connector_type: string; pin_count: number; description: string;
  equipment_code: string; equipment_name: string; car_code: string; system_code: string; drawing: string;
  pins: Array<{ pin_no: string; signal_name: string; wire: string; description: string }>;
}> = [
  // VVVF Connectors
  { id: 'cn-v1-1', connector_code: 'V1-CN1', connector_type: 'VVVF', pin_count: 20, description: 'VVVF main connector - propulsion commands', equipment_code: 'V1', equipment_name: 'VVVF Inverter 1', car_code: 'DMC', system_code: 'TRAC', drawing: '942-58120',
    pins: [
      { pin_no: '12', signal_name: 'FORWARD_CMD', wire: '3003', description: 'Forward command' },
      { pin_no: '13', signal_name: 'REVERSE_CMD', wire: '3004', description: 'Reverse command' },
      { pin_no: '14', signal_name: 'POWERING_1', wire: '3005', description: 'Powering level 1 (X1-19)' },
      { pin_no: '15', signal_name: 'POWERING_2', wire: '3006', description: 'Powering level 2 (X1-20)' },
      { pin_no: '16', signal_name: 'BRAKE_CMD', wire: '3010', description: 'Braking command' },
      { pin_no: '17', signal_name: 'FSB_CMD', wire: '3011', description: 'Full service brake' },
    ]
  },
  { id: 'cn-v1-2', connector_code: 'V1-CN2', connector_type: 'VVVF', pin_count: 12, description: 'VVVF status connector - mode signals and faults', equipment_code: 'V1', equipment_name: 'VVVF Inverter 1', car_code: 'DMC', system_code: 'TRAC', drawing: '942-58120',
    pins: [
      { pin_no: '3', signal_name: 'ZERO_SPEED', wire: '6112', description: 'Zero speed feedback' },
      { pin_no: '5', signal_name: 'VVVF_FAULT', wire: '1207', description: 'Fault indication' },
    ]
  },

  // TCMS RIO Connectors
  { id: 'cn-rio1-1', connector_code: 'TCMS_RIO1-CN1', connector_type: 'TCMS_RIO', pin_count: 40, description: 'TCMS RIO main connector - all digital I/O', equipment_code: 'TCMS_RIO1', equipment_name: 'TCMS Remote IO Unit 1', car_code: 'MC', system_code: 'TMS', drawing: '942-38610',
    pins: [
      { pin_no: 'J7', signal_name: 'DOOR_OPEN_L', wire: '6009', description: 'Left door open' },
      { pin_no: 'J8', signal_name: 'DOOR_OPEN_R', wire: '6046', description: 'Right door open' },
      { pin_no: 'J9', signal_name: 'DOOR_CLOSE_L', wire: '6014', description: 'Left door close' },
      { pin_no: 'J10', signal_name: 'DOOR_CLOSE_R', wire: '6051', description: 'Right door close' },
      { pin_no: 'K4', signal_name: 'PB_APPLIED', wire: '4122', description: 'Parking brake applied' },
      { pin_no: 'K5', signal_name: 'PB_RELEASED', wire: '4153', description: 'Parking brake released' },
      { pin_no: 'L3', signal_name: 'ZERO_SPEED', wire: '6112', description: 'Zero speed signal' },
      { pin_no: 'F4', signal_name: 'VAC1_STATUS', wire: '7050', description: 'VAC1 status' },
      { pin_no: 'F5', signal_name: 'VAC2_STATUS', wire: '7060', description: 'VAC2 status' },
      { pin_no: 'H2', signal_name: 'DOOR1_STATUS', wire: '6073', description: 'Door 1 status' },
      { pin_no: 'H3', signal_name: 'DOOR2_STATUS', wire: '6076', description: 'Door 2 status' },
    ]
  },
  { id: 'cn-rio2-1', connector_code: 'TCMS_RIO2-CN1', connector_type: 'TCMS_RIO', pin_count: 40, description: 'TCMS RIO2 connector - APS and battery monitoring', equipment_code: 'TCMS_RIO2', equipment_name: 'TCMS Remote IO Unit 2', car_code: 'TC', system_code: 'TMS', drawing: '942-38409',
    pins: [
      { pin_no: 'F2', signal_name: 'CAB_VAC_FAULT', wire: '7001', description: 'Cab VAC fault' },
      { pin_no: 'G3', signal_name: 'APS_FAULT', wire: '1215', description: 'APS fault' },
      { pin_no: 'G4', signal_name: 'BAT_UNDER_VOLT', wire: '5064', description: 'Battery under-voltage' },
      { pin_no: 'H5', signal_name: 'SHORE_SUPPLY', wire: '5000', description: 'Shore supply command' },
      { pin_no: 'J6', signal_name: 'SIV_STATUS', wire: '5030', description: 'SIV contactor status' },
    ]
  },

  // DCU Connector
  { id: 'cn-dcu1-1', connector_code: 'DCU1-CN1', connector_type: 'DOOR', pin_count: 16, description: 'Door control unit main connector', equipment_code: 'DCU1', equipment_name: 'Door Control Unit 1', car_code: 'MC', system_code: 'DOOR', drawing: '942-58138',
    pins: [
      { pin_no: '3', signal_name: 'DOOR_OPEN_L', wire: '6009', description: 'Left door open command' },
      { pin_no: '4', signal_name: 'DOOR_OPEN_R', wire: '6046', description: 'Right door open command' },
      { pin_no: '5', signal_name: 'DOOR_CLOSE_L', wire: '6014', description: 'Left door close command' },
      { pin_no: '6', signal_name: 'DOOR_CLOSE_R', wire: '6051', description: 'Right door close command' },
    ]
  },
  { id: 'cn-dcu1-2', connector_code: 'DCU1-CN2', connector_type: 'DOOR', pin_count: 8, description: 'Door control unit status connector', equipment_code: 'DCU1', equipment_name: 'Door Control Unit 1', car_code: 'MC', system_code: 'DOOR', drawing: '942-58140',
    pins: [
      { pin_no: '3', signal_name: 'DOOR_PROVE_1', wire: '6073', description: 'Door 1 proving loop' },
      { pin_no: '4', signal_name: 'DOOR_PROVE_2', wire: '6076', description: 'Door 2 proving loop' },
      { pin_no: '12', signal_name: 'ZERO_SPEED_IN', wire: '6112', description: 'Zero speed interlock' },
    ]
  },

  // APS Connectors
  { id: 'cn-aps1-1', connector_code: 'APS1-CN1', connector_type: 'APS', pin_count: 24, description: 'APS main power connector', equipment_code: 'APS1', equipment_name: 'Auxiliary Power Supply', car_code: 'TC', system_code: 'APS', drawing: '942-58130',
    pins: [
      { pin_no: '1', signal_name: 'AUX_ON', wire: '1040', description: 'Auxiliary on command' },
      { pin_no: '2', signal_name: 'SHUTDOWN', wire: '1050', description: 'Shutdown command' },
      { pin_no: '5', signal_name: 'AUX_FAULT', wire: '1215', description: 'Auxiliary fault output' },
    ]
  },
  { id: 'cn-aps1-3', connector_code: 'APS1-CN3', connector_type: 'APS', pin_count: 8, description: 'SIV contactor connector', equipment_code: 'APS1', equipment_name: 'Auxiliary Power Supply', car_code: 'TC', system_code: 'APS', drawing: '942-58130',
    pins: [
      { pin_no: '1', signal_name: 'SIV_CONTACT1', wire: '5030', description: 'SIV contactor 1' },
      { pin_no: '2', signal_name: 'SIV_CONTACT2', wire: '5031', description: 'SIV contactor 2' },
    ]
  },

  // Inter-car Jumpers
  { id: 'cn-x1-dmc', connector_code: 'X1', connector_type: 'INTERCAR', pin_count: 74, description: '74-pin inter-car control jumper - all control signals', equipment_code: 'LTEB1', equipment_name: 'Low Tension Equipment Box', car_code: 'DMC', system_code: 'TRL', drawing: '942-38409',
    pins: [
      { pin_no: '17', signal_name: 'FORWARD', wire: '3003', description: 'Forward command' },
      { pin_no: '18', signal_name: 'REVERSE', wire: '3004', description: 'Reverse command' },
      { pin_no: '19', signal_name: 'POWERING_1', wire: '3005', description: 'Powering 1 (CROSSED with 20)' },
      { pin_no: '20', signal_name: 'POWERING_2', wire: '3006', description: 'Powering 2 (CROSSED with 19)' },
      { pin_no: '24', signal_name: 'BRAKE_LOOP', wire: '4024', description: 'Normal brake loop' },
      { pin_no: '42', signal_name: 'EM_LOOP_N', wire: '4062', description: 'EM brake normal loop' },
      { pin_no: '44', signal_name: 'EM_LOOP_R', wire: '4103', description: 'EM brake redundant loop' },
      { pin_no: '35', signal_name: 'PB_APPLIED', wire: '4122', description: 'Parking brake applied' },
    ]
  },
  { id: 'cn-x2-dmc', connector_code: 'X2', connector_type: 'INTERCAR', pin_count: 74, description: '74-pin inter-car control + power jumper', equipment_code: 'LTEB1', equipment_name: 'Low Tension Equipment Box', car_code: 'DMC', system_code: 'TRL', drawing: '942-38409', pins: [] },
  { id: 'cn-x3-dmc', connector_code: 'X3', connector_type: 'POWER', pin_count: 11, description: '11-pin 415V AC power jumper', equipment_code: 'LTJB1', equipment_name: 'Low Tension Junction Box', car_code: 'DMC', system_code: 'TRL', drawing: '942-38409', pins: [] },
  { id: 'cn-x4-dmc', connector_code: 'X4', connector_type: 'POWER', pin_count: 3, description: '3-pin 110V DC power jumper', equipment_code: 'LTJB1', equipment_name: 'Low Tension Junction Box', car_code: 'DMC', system_code: 'TRL', drawing: '942-38409', pins: [] },
];

const SYSTEM_COLORS: Record<string, { color: string; bg: string }> = {
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
};

const CAR_COLORS: Record<string, { color: string; bg: string }> = {
  DMC: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  TC: { color: 'text-green-400', bg: 'bg-green-500/20' },
  MC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

export default function ConnectorsPage() {
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = CONNECTOR_REGISTRY.filter(cn => {
    const matchSearch = search === '' ||
      cn.connector_code.toLowerCase().includes(search.toLowerCase()) ||
      cn.equipment_code.toLowerCase().includes(search.toLowerCase()) ||
      cn.description.toLowerCase().includes(search.toLowerCase());
    const matchCar = carFilter === 'all' || cn.car_code === carFilter;
    const matchSystem = systemFilter === 'all' || cn.system_code === systemFilter;
    return matchSearch && matchCar && matchSystem;
  });

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Connector Library</h1>
        <p className="mt-2 text-slate-400">
          All connectors, inter-car jumpers, and pin assignments
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{CONNECTOR_REGISTRY.length} connectors</span>
          <span>4 jumper types (X1-X4)</span>
          <span>DMC, TC, MC</span>
        </div>
      </div>

      {/* Jumper Quick Reference */}
      <div className="mb-6 glass-card p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Inter-car Jumper Quick Reference</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="text-sm font-mono text-blue-400 font-bold">X1 (74P)</div>
            <div className="text-xs text-slate-400 mt-1">Control signals + trainlines</div>
            <div className="text-xs text-slate-500 mt-1">Pins 17-20 = propulsion</div>
            <div className="text-xs text-amber-400 mt-1">Pins 19/20 = CROSSED</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/30">
            <div className="text-sm font-mono text-slate-400 font-bold">X2 (74PW)</div>
            <div className="text-xs text-slate-400 mt-1">Control + power combined</div>
            <div className="text-xs text-slate-500 mt-1">Same pinout as X1</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="text-sm font-mono text-amber-400 font-bold">X3 (11P)</div>
            <div className="text-xs text-slate-400 mt-1">415V AC power</div>
            <div className="text-xs text-slate-500 mt-1">3-phase AC distribution</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="text-sm font-mono text-red-400 font-bold">X4 (3P)</div>
            <div className="text-xs text-slate-400 mt-1">110V DC power</div>
            <div className="text-xs text-slate-500 mt-1">Battery/main power</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search connectors..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <select value={carFilter} onChange={(e) => setCarFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Cars</option>
          <option value="DMC">DMC</option>
          <option value="TC">TC</option>
          <option value="MC">MC</option>
        </select>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Systems</option>
          <option value="TRAC">Traction</option>
          <option value="TMS">TCMS</option>
          <option value="DOOR">Door</option>
          <option value="APS">APS</option>
          <option value="TRL">Trainlines</option>
        </select>
      </div>

      {/* Connector List */}
      <div className="space-y-3">
        {filtered.map(cn => {
          const sysInfo = SYSTEM_COLORS[cn.system_code] || SYSTEM_COLORS['TRL'];
          const carInfo = CAR_COLORS[cn.car_code] || CAR_COLORS['DMC'];
          const isExpanded = expandedId === cn.id;

          return (
            <div key={cn.id} className="glass-card overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : cn.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 font-bold text-lg">{cn.connector_code}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cn.connector_type === 'INTERCAR' ? 'bg-blue-500/20 text-blue-400' : cn.connector_type === 'POWER' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {cn.connector_type}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${carInfo.color} ${carInfo.bg}`}>
                      {cn.car_code}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sysInfo.color} ${sysInfo.bg}`}>
                      {cn.system_code}
                    </span>
                    {cn.pin_count > 0 && (
                      <span className="text-xs text-slate-500">{cn.pin_count}P</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400 truncate">{cn.description}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {cn.equipment_code} - Drawing: <span className="font-mono text-purple-400">{cn.drawing}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{cn.pins.length} pins defined</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isExpanded && cn.pins.length > 0 && (
                <div className="border-t border-slate-700/50">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Pin</th>
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Signal</th>
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Wire</th>
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Description</th>
                        <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {cn.pins.map(pin => (
                        <tr key={pin.pin_no} className="hover:bg-slate-800/20">
                          <td className="px-5 py-2">
                            <span className="font-mono font-bold text-cyan-400">{pin.pin_no}</span>
                          </td>
                          <td className="px-5 py-2">
                            <span className="text-sm text-white font-medium">{pin.signal_name}</span>
                          </td>
                          <td className="px-5 py-2">
                            <Link href={`/wires/${pin.wire}`}
                              className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20">
                              {pin.wire}
                            </Link>
                          </td>
                          <td className="px-5 py-2">
                            <span className="text-xs text-slate-400">{pin.description}</span>
                          </td>
                          <td className="px-5 py-2 text-right">
                            <Link href={`/trainlines/${pin.wire}`}
                              className="text-xs text-cyan-400 hover:text-cyan-300">
                              Trainline
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No connectors match your filters</p>
        </div>
      )}
    </div>
  );
}