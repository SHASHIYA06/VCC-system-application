'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Cable, ArrowRight, ChevronRight } from 'lucide-react';

const PIN_REGISTRY = [
  { id: 'p1', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '12', signal_name: 'FORWARD_CMD', wire: '3003', description: 'Forward propulsion command' },
  { id: 'p2', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '13', signal_name: 'REVERSE_CMD', wire: '3004', description: 'Reverse propulsion command' },
  { id: 'p3', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '14', signal_name: 'POWERING_1', wire: '3005', description: 'Powering 1 (X1-19 crossed)' },
  { id: 'p4', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '15', signal_name: 'POWERING_2', wire: '3006', description: 'Powering 2 (X1-20 crossed)' },
  { id: 'p5', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '16', signal_name: 'BRAKE_CMD', wire: '3010', description: 'Braking command' },
  { id: 'p6', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '17', signal_name: 'FSB_CMD', wire: '3011', description: 'Full service brake command' },
  { id: 'p7', connector_code: 'V1-CN2', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '3', signal_name: 'ZERO_SPEED', wire: '6112', description: 'Zero speed feedback' },
  { id: 'p8', connector_code: 'V1-CN2', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '5', signal_name: 'VVVF_FAULT', wire: '1207', description: 'VVVF fault indication' },
  { id: 'p9', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J7', signal_name: 'DOOR_OPEN_LEFT', wire: '6009', description: 'Left door open command output' },
  { id: 'p10', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J8', signal_name: 'DOOR_OPEN_RIGHT', wire: '6046', description: 'Right door open command output' },
  { id: 'p11', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J9', signal_name: 'DOOR_CLOSE_LEFT', wire: '6014', description: 'Left door close command output' },
  { id: 'p12', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J10', signal_name: 'DOOR_CLOSE_RIGHT', wire: '6051', description: 'Right door close command output' },
  { id: 'p13', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'K4', signal_name: 'PARKING_BRAKE_APPLIED', wire: '4122', description: 'Parking brake applied status input' },
  { id: 'p14', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'K5', signal_name: 'PARKING_BRAKE_RELEASED', wire: '4153', description: 'Parking brake released status input' },
  { id: 'p15', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'L3', signal_name: 'ZERO_SPEED', wire: '6112', description: 'Zero speed signal input' },
  { id: 'p16', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'F4', signal_name: 'VAC1_STATUS', wire: '7050', description: 'Saloon VAC 1 status feedback' },
  { id: 'p17', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'F5', signal_name: 'VAC2_STATUS', wire: '7060', description: 'Saloon VAC 2 status feedback' },
  { id: 'p18', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'H2', signal_name: 'DOOR1_STATUS', wire: '6073', description: 'Door 1 open/closed status input' },
  { id: 'p19', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'H3', signal_name: 'DOOR2_STATUS', wire: '6076', description: 'Door 2 open/closed status input' },
  { id: 'p20', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'H4', signal_name: 'HSCB_TRIP', wire: '1209', description: 'HSCB trip status input' },
  { id: 'p21', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'M2', signal_name: 'VVVF_FAULT', wire: '1207', description: 'VVVF fault status input' },
  { id: 'p22', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'G2', signal_name: 'RESET', wire: '1032', description: 'System reset command' },
  { id: 'p23', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'F2', signal_name: 'CAB_VAC_FAULT', wire: '7001', description: 'Cab VAC fault status input' },
  { id: 'p24', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'G3', signal_name: 'APS_FAULT', wire: '1215', description: 'APS auxiliary fault input' },
  { id: 'p25', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'G4', signal_name: 'BATTERY_UNDER_VOLT', wire: '5064', description: 'Battery under-voltage warning' },
  { id: 'p26', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'H5', signal_name: 'SHORE_SUPPLY_CMD', wire: '5000', description: 'Shore supply contactor command' },
  { id: 'p27', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'J6', signal_name: 'SIV_CONTACT_STATUS', wire: '5030', description: 'SIV contactor feedback' },
  { id: 'p28', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '3', signal_name: 'DOOR_OPEN_LEFT', wire: '6009', description: 'Left door open input' },
  { id: 'p29', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '4', signal_name: 'DOOR_OPEN_RIGHT', wire: '6046', description: 'Right door open input' },
  { id: 'p30', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '5', signal_name: 'DOOR_CLOSE_LEFT', wire: '6014', description: 'Left door close input' },
  { id: 'p31', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '6', signal_name: 'DOOR_CLOSE_RIGHT', wire: '6051', description: 'Right door close input' },
  { id: 'p32', connector_code: 'DCU1-CN2', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '3', signal_name: 'DOOR_PROVE_1', wire: '6073', description: 'Door 1 proving loop input' },
  { id: 'p33', connector_code: 'DCU1-CN2', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '4', signal_name: 'DOOR_PROVE_2', wire: '6076', description: 'Door 2 proving loop input' },
  { id: 'p34', connector_code: 'DCU1-CN2', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '12', signal_name: 'ZERO_SPEED_IN', wire: '6112', description: 'Zero speed interlock input' },
  { id: 'p35', connector_code: 'APS1-CN1', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '1', signal_name: 'AUX_ON', wire: '1040', description: 'Auxiliary power on command' },
  { id: 'p36', connector_code: 'APS1-CN1', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '2', signal_name: 'SHUTDOWN', wire: '1050', description: 'System shutdown command' },
  { id: 'p37', connector_code: 'APS1-CN1', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '5', signal_name: 'AUX_FAULT', wire: '1215', description: 'Auxiliary system fault output' },
  { id: 'p38', connector_code: 'APS1-CN3', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '1', signal_name: 'SIV_CONTACT1', wire: '5030', description: 'SIV contactor 1 feedback' },
  { id: 'p39', connector_code: 'APS1-CN3', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '2', signal_name: 'SIV_CONTACT2', wire: '5031', description: 'SIV contactor 2 feedback' },
  { id: 'p40', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '17', signal_name: 'FORWARD', wire: '3003', description: 'Forward trainline' },
  { id: 'p41', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '18', signal_name: 'REVERSE', wire: '3004', description: 'Reverse trainline' },
  { id: 'p42', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '19', signal_name: 'POWERING_1', wire: '3005', description: 'Powering 1 (CROSSED with pin 20)' },
  { id: 'p43', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '20', signal_name: 'POWERING_2', wire: '3006', description: 'Powering 2 (CROSSED with pin 19)' },
  { id: 'p44', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '24', signal_name: 'BRAKE_LOOP', wire: '4024', description: 'Normal brake loop' },
  { id: 'p45', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '42', signal_name: 'EM_LOOP_NORMAL', wire: '4062', description: 'EM brake loop normal path' },
  { id: 'p46', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '44', signal_name: 'EM_LOOP_REDUNDANT', wire: '4103', description: 'EM brake loop redundant path' },
];

export default function PinsPage() {
  const [search, setSearch] = useState('');
  const [connectorFilter, setConnectorFilter] = useState('all');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');

  const filtered = PIN_REGISTRY.filter(pin => {
    const matchSearch = search === '' ||
      pin.signal_name.toLowerCase().includes(search.toLowerCase()) ||
      pin.connector_code.toLowerCase().includes(search.toLowerCase()) ||
      pin.pin_no.toLowerCase().includes(search.toLowerCase()) ||
      pin.wire.includes(search);
    const matchConnector = connectorFilter === 'all' || pin.connector_code === connectorFilter;
    const matchCar = carFilter === 'all' || pin.car_code === carFilter;
    const matchSystem = systemFilter === 'all' || pin.system_code === systemFilter;
    return matchSearch && matchConnector && matchCar && matchSystem;
  });

  const connectors = [...new Set(PIN_REGISTRY.map(p => p.connector_code))].sort();
  const cars = [...new Set(PIN_REGISTRY.map(p => p.car_code))].sort();
  const systems = [...new Set(PIN_REGISTRY.map(p => p.system_code))].sort();

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Pin Directory</h1>
        <p className="mt-2 text-slate-400">
          Complete pin listing across all connectors with signal and wire assignments
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{PIN_REGISTRY.length} pins defined</span>
          <span>{connectors.length} connectors</span>
          <span>3 car types</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search pins, signals, wires..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <select value={connectorFilter} onChange={(e) => setConnectorFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Connectors</option>
          {connectors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
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

      {/* Pin Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Connector</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Wire</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(pin => (
                <tr key={pin.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/equipment/${pin.equipment_code}`}
                      className="text-sm font-mono text-purple-400 hover:text-purple-300">
                      {pin.equipment_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-cyan-400">{pin.connector_code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-lg text-white">{pin.pin_no}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">{pin.signal_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/wires/${pin.wire}`}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-sm font-mono hover:bg-cyan-500/20">
                      {pin.wire}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 max-w-xs truncate block">{pin.description}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/trainlines/${pin.wire}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300">
                        Trainline
                      </Link>
                      <span className="text-slate-600">|</span>
                      <Link href={`/pins/${pin.id}`}
                        className="text-xs text-purple-400 hover:text-purple-300">
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No pins match your filters</p>
        </div>
      )}
    </div>
  );
}