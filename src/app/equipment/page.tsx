'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cpu, Search, ArrowRight, Box, Shield, Zap, Battery, Wind, DoorOpen, Radio, Activity } from 'lucide-react';
import { EQUIPMENT_REGISTRY } from '@/types/index';

const EQUIPMENT_FULL: Record<string, Array<{
  id: string; equipment_code: string; equipment_name: string; car_code: string; system_code: string;
  equipment_type: string; manufacturer: string; part_number: string; location_hint: string; description: string;
  connectors: string[]; trainlines: string[]; drawings: string[];
}>> = {
  DMC: [
    { id: 'eq001', equipment_code: 'V1', equipment_name: 'VVVF Inverter 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'INVERTER', manufacturer: 'Mitsubishi', part_number: '', location_hint: 'Underframe', description: 'Variable voltage variable frequency inverter for traction motors', connectors: ['CN1', 'CN2', 'CN3'], trainlines: ['3003', '3004', '3005', '3006', '3010', '1207'], drawings: ['942-58120'] },
    { id: 'eq002', equipment_code: 'BCU1', equipment_name: 'Brake Control Unit 1', car_code: 'DMC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'Knorr-Bremse', part_number: '', location_hint: 'Underframe', description: 'Full brake control logic with ABS, antiskid, and EM brake', connectors: ['CN1', 'CN2', 'X1'], trainlines: ['4024', '4062', '4103', '4122', '4153'], drawings: ['942-58124', '942-58125', '942-58128'] },
    { id: 'eq003', equipment_code: 'HSCB1', equipment_name: 'High Speed Circuit Breaker', car_code: 'DMC', system_code: 'HV', equipment_type: 'BREAKER', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Main circuit breaker - 1500V DC rated', connectors: ['CN1', 'CN2'], trainlines: ['1209'], drawings: ['942-38103'] },
    { id: 'eq004', equipment_code: 'LTEB1', equipment_name: 'Low Tension Equipment Box 1', car_code: 'DMC', system_code: 'LTEB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Main low tension distribution panel', connectors: ['X1', 'X2', 'X3', 'X4'], trainlines: ['All 110VDC'], drawings: ['942-38309'] },
    { id: 'eq005', equipment_code: 'ASCOS1', equipment_name: 'ASCOS EPIC SR 1', car_code: 'DMC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'EPIC brake control unit variant', connectors: ['CN1'], trainlines: ['4062'], drawings: ['942-58125'] },
    { id: 'eq006', equipment_code: 'TM1', equipment_name: 'Traction Motor Connector 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'CONNECTOR', manufacturer: '', part_number: '', location_hint: 'Bogie', description: 'Traction motor 3-phase AC connection', connectors: ['CN1'], trainlines: ['HV'], drawings: ['942-58121'] },
    { id: 'eq007', equipment_code: 'BRAKE_RES1', equipment_name: 'Brake Resistor 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'RESISTOR', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Dynamic braking resistor bank', connectors: ['CN1'], trainlines: ['3010'], drawings: ['942-58120'] },
    { id: 'eq008', equipment_code: 'FILT_REACT1', equipment_name: 'Filter Reactor 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'REACTOR', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Input filter reactor for VVVF', connectors: ['CN1'], trainlines: ['HV'], drawings: ['942-58121'] },
    { id: 'eq009', equipment_code: 'CSJB1', equipment_name: 'Collector Shoe Junction Box', car_code: 'DMC', system_code: 'HV', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Current collector shoe connections', connectors: ['CN1'], trainlines: ['HV'], drawings: ['942-38103'] },
    { id: 'eq010', equipment_code: 'AUTO_CPL1', equipment_name: 'Auto Coupler', car_code: 'DMC', system_code: 'COUPL', equipment_type: 'COUPLER', manufacturer: '', part_number: '', location_hint: 'Front/Rear', description: 'Automatic coupler for car-to-car connection', connectors: ['X1', 'X2', 'X3', 'X4', 'X6', 'X7'], trainlines: ['All'], drawings: ['942-58117'] },
  ],
  TC: [
    { id: 'eq101', equipment_code: 'APS1', equipment_name: 'Auxiliary Power Supply 1', car_code: 'TC', system_code: 'APS', equipment_type: 'POWER_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Static inverter and battery charger - provides 415V AC, 230V AC, 110V DC', connectors: ['CN1', 'CN2', 'CN3', 'X1'], trainlines: ['1040', '1050', '5000', '5030', '5031', '5064', '1215'], drawings: ['942-58130', '942-58131', '942-58132'] },
    { id: 'eq102', equipment_code: 'BATT1', equipment_name: 'Battery Box 1', car_code: 'TC', system_code: 'APS', equipment_type: 'BATTERY', manufacturer: '', part_number: '', location_hint: 'Underframe', description: '110V DC battery pack for emergency power', connectors: ['CN1'], trainlines: ['5064'], drawings: ['942-58132'] },
    { id: 'eq103', equipment_code: 'SSB1', equipment_name: 'Shore Supply Box 1', car_code: 'TC', system_code: 'APS', equipment_type: 'POWER_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'External shore supply connection box', connectors: ['CN1', 'CN2'], trainlines: ['5000'], drawings: ['942-58131'] },
    { id: 'eq104', equipment_code: 'BCU2', equipment_name: 'Brake Control Unit 2', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'Knorr-Bremse', part_number: '', location_hint: 'Underframe', description: 'TC car brake control - passive BECU architecture', connectors: ['CN1', 'CN5', 'X1'], trainlines: ['4024', '4062', '4103'], drawings: ['942-58124', '942-58129'] },
    { id: 'eq105', equipment_code: 'TCMS_RIO2', equipment_name: 'TCMS Remote IO Unit 2', car_code: 'TC', system_code: 'TMS', equipment_type: 'RIO', manufacturer: 'Mitsubishi', part_number: '', location_hint: 'Ceiling', description: 'TCMS RIO U25 - APS, battery, cab VAC monitoring', connectors: ['CN1'], trainlines: ['7001', '1215', '5064', '5000', '5030'], drawings: ['942-38409', '942-58146'] },
    { id: 'eq106', equipment_code: 'LTEB2', equipment_name: 'Low Tension Equipment Box 2', car_code: 'TC', system_code: 'LTEB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'TC low tension distribution panel', connectors: ['X1', 'X2', 'X3', 'X4'], trainlines: ['All 110VDC'], drawings: ['942-38509'] },
    { id: 'eq107', equipment_code: 'LTJB1', equipment_name: 'Low Tension Junction Box 1', car_code: 'TC', system_code: 'LTJB', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'TC junction box for 415V AC distribution', connectors: ['CN1', 'CN2'], trainlines: ['5030', '5031'], drawings: ['942-38509'] },
    { id: 'eq108', equipment_code: 'COMP1', equipment_name: 'Compressor Motor 1', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'MOTOR', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Air compressor for brake system', connectors: ['CN1'], trainlines: ['4024'], drawings: ['942-58123'] },
    { id: 'eq109', equipment_code: 'EDB2', equipment_name: 'Electrical Distribution Box 2', car_code: 'TC', system_code: 'EDB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Ceiling', description: 'Ceiling distribution for TC car', connectors: ['CN1', 'CN2'], trainlines: ['110VDC loads'], drawings: ['942-38409'] },
    { id: 'eq110', equipment_code: 'VAC2', equipment_name: 'Saloon VAC Unit 2', car_code: 'TC', system_code: 'VAC', equipment_type: 'HVAC_UNIT', manufacturer: '', part_number: '', location_hint: 'Ceiling', description: 'Saloon air conditioning unit 2', connectors: ['CN1'], trainlines: ['7060'], drawings: ['942-58144', '942-58145'] },
  ],
  MC: [
    { id: 'eq201', equipment_code: 'V2', equipment_name: 'VVVF Inverter 2', car_code: 'MC', system_code: 'TRAC', equipment_type: 'INVERTER', manufacturer: 'Mitsubishi', part_number: '', location_hint: 'Underframe', description: 'Variable voltage variable frequency inverter for MC car', connectors: ['CN1', 'CN2', 'CN3'], trainlines: ['3003', '3004', '3005', '3006', '3010', '1207'], drawings: ['942-58120'] },
    { id: 'eq202', equipment_code: 'TCMS_RIO1', equipment_name: 'TCMS Remote IO Unit 1', car_code: 'MC', system_code: 'TMS', equipment_type: 'RIO', manufacturer: 'Mitsubishi', part_number: '', location_hint: 'Ceiling', description: 'TCMS RIO U15 - main control RIO for propulsion, doors, VAC', connectors: ['CN1'], trainlines: ['3003', '3004', '3005', '3006', '6009', '6014', '6046', '6051', '6112', '7050', '7060', '7070', '1207', '1209'], drawings: ['942-38610', '942-58146'] },
    { id: 'eq203', equipment_code: 'DCU1', equipment_name: 'Door Control Unit 1', car_code: 'MC', system_code: 'DOOR', equipment_type: 'CONTROL_UNIT', manufacturer: '', part_number: '', location_hint: 'Ceiling', description: 'Door control electronics for all doors', connectors: ['CN1', 'CN2'], trainlines: ['6009', '6014', '6046', '6051', '6073', '6076', '6112'], drawings: ['942-58137', '942-58138', '942-58139', '942-58140'] },
    { id: 'eq204', equipment_code: 'VAC1', equipment_name: 'Saloon VAC Unit 1', car_code: 'MC', system_code: 'VAC', equipment_type: 'HVAC_UNIT', manufacturer: '', part_number: '', location_hint: 'Ceiling', description: 'Main saloon air conditioning unit', connectors: ['CN1'], trainlines: ['7050', '7060', '7070'], drawings: ['942-58144', '942-58145'] },
    { id: 'eq205', equipment_code: 'BCU3', equipment_name: 'Brake Control Unit 3', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'Knorr-Bremse', part_number: '', location_hint: 'Underframe', description: 'MC car brake control with full logic', connectors: ['CN1', 'X1'], trainlines: ['4024', '4062', '4103', '4122', '4153'], drawings: ['942-58124', '942-58125', '942-58128'] },
    { id: 'eq206', equipment_code: 'BECU1', equipment_name: 'Brake Electronic Control Unit 1', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'Knorr-Bremse', part_number: '', location_hint: 'Underframe', description: 'Electronic brake control for MC', connectors: ['CN1'], trainlines: ['4024', '4062', '4103'], drawings: ['942-58128'] },
    { id: 'eq207', equipment_code: 'PBMV1', equipment_name: 'Parking Brake Magnetic Valve 1', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'VALVE', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'Parking brake apply/release valve', connectors: ['CN1'], trainlines: ['4122', '4153'], drawings: ['942-58126'] },
    { id: 'eq208', equipment_code: 'ETH_SW1', equipment_name: 'Ethernet Switch CCTV 1', car_code: 'MC', system_code: 'COMMS', equipment_type: 'NETWORK_SWITCH', manufacturer: '', part_number: '', location_hint: 'Ceiling', description: 'Ethernet switch for CCTV, TCMS, EBCU network', connectors: ['CN1', 'CN2'], trainlines: [], drawings: ['942-58154'] },
    { id: 'eq209', equipment_code: 'TCMS_CN1', equipment_name: 'TCMS Communication Node 1', car_code: 'MC', system_code: 'COMMS', equipment_type: 'COMMS_NODE', manufacturer: '', part_number: '', location_hint: 'Ceiling', description: 'CBTC and TCMS communication interface', connectors: ['X10'], trainlines: ['1515'], drawings: ['942-58152'] },
    { id: 'eq210', equipment_code: 'LTEB3', equipment_name: 'Low Tension Equipment Box 3', car_code: 'MC', system_code: 'LTEB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe', description: 'MC low tension distribution panel', connectors: ['X1', 'X2', 'X3', 'X4'], trainlines: ['All 110VDC'], drawings: ['942-38609'] },
    { id: 'eq211', equipment_code: 'EDB1', equipment_name: 'Electrical Distribution Box 1', car_code: 'MC', system_code: 'EDB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Ceiling', description: 'Ceiling distribution for saloon', connectors: ['CN1', 'CN2'], trainlines: ['110VDC loads'], drawings: ['942-38610'] },
  ],
  CAB: [
    { id: 'eq301', equipment_code: 'OP_PNL1', equipment_name: 'Operating Panel 1', car_code: 'CAB', system_code: 'CAB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Cab Desk', description: 'Main operating panel with master controller', connectors: ['CN1', 'CN2'], trainlines: ['1032', '1040', '1050', '3003', '3004'], drawings: ['942-58107', '942-58108'] },
    { id: 'eq302', equipment_code: 'IND_PNL1', equipment_name: 'Indicator Panel 1', car_code: 'CAB', system_code: 'CAB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Cab Desk', description: 'System status indicator panel', connectors: ['CN1', 'CN2'], trainlines: ['1207', '1209', '1215', '1217', '1219'], drawings: ['942-58109', '942-58110'] },
    { id: 'eq303', equipment_code: 'MCB_PNL1', equipment_name: 'MCB Panel 1', car_code: 'CAB', system_code: 'CAB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Cab', description: 'Main circuit breaker panel', connectors: ['CN1'], trainlines: ['All 110VDC'], drawings: ['942-58110'] },
    { id: 'eq304', equipment_code: 'CAB_VAC1', equipment_name: 'Cab VAC Unit 1', car_code: 'CAB', system_code: 'VAC', equipment_type: 'HVAC_UNIT', manufacturer: '', part_number: '', location_hint: 'Cab', description: 'Driver cab air conditioning', connectors: ['CN1'], trainlines: ['7001'], drawings: ['942-58143'] },
  ],
};

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

  const allEquipment = Object.values(EQUIPMENT_FULL).flat();
  const filtered = allEquipment.filter(eq => {
    const matchSearch = search === '' ||
      eq.equipment_code.toLowerCase().includes(search.toLowerCase()) ||
      eq.equipment_name.toLowerCase().includes(search.toLowerCase()) ||
      eq.description.toLowerCase().includes(search.toLowerCase());
    const matchCar = carFilter === 'all' || eq.car_code === carFilter;
    const matchSystem = systemFilter === 'all' || eq.system_code === systemFilter;
    return matchSearch && matchCar && matchSystem;
  });

  const systems = [...new Set(allEquipment.map(eq => eq.system_code))].sort();
  const cars = ['DMC', 'TC', 'MC', 'CAB'];

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Equipment Library</h1>
        <p className="mt-2 text-slate-400">
          Complete equipment registry with connectors, trainlines, and drawing references
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{allEquipment.length} equipment items</span>
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
        {filtered.map(eq => {
          const sysInfo = SYSTEM_COLORS[eq.system_code] || SYSTEM_COLORS['TRL'];
          const carInfo = CAR_COLORS[eq.car_code] || CAR_COLORS['CAB'];

          return (
            <Link key={eq.id} href={`/equipment/${eq.equipment_code}`}>
              <div className="glass-card p-5 hover:border-cyan-500/40 transition-all group h-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${carInfo.color} ${carInfo.bg}`}>
                        {eq.car_code}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sysInfo.color} ${sysInfo.bg}`}>
                        {eq.system_code}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {eq.equipment_code}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{eq.equipment_name}</p>
                  </div>
                  <Cpu className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>

                <p className="mt-3 text-xs text-slate-500 line-clamp-2">{eq.description}</p>

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span>{eq.location_hint}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{eq.equipment_type}</span>
                </div>

                {eq.trainlines.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {eq.trainlines.slice(0, 4).map(tl => (
                      <span key={tl} className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono">
                        {tl}
                      </span>
                    ))}
                    {eq.trainlines.length > 4 && (
                      <span className="text-xs text-slate-500">+{eq.trainlines.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{eq.connectors.length} connectors</span>
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