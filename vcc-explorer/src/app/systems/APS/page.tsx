'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Battery, ArrowRight, Search, Cpu, Cable, FileText, Settings, Zap } from 'lucide-react';

const APS_WIRING = [
  { wireNo: '1040', signal: 'AUX_ON', description: 'Auxiliary power on command', from: 'OP_PNL1-CN1-2', to: 'APS1-CN2-1' },
  { wireNo: '1050', signal: 'SHUTDOWN', description: 'System shutdown command', from: 'OP_PNL1-CN1-3', to: 'APS1-CN2-2' },
  { wireNo: '5000', signal: 'SHORE_SUPPLY', description: 'Shore supply contactor command', from: 'TCMS_RIO2-U25-H5', to: 'SSB1-CN1-3' },
  { wireNo: '5010', signal: 'SHORE_CONNECTED', description: 'Shore supply connected status', from: 'SSB1-CN1-5', to: 'TCMS_RIO2-U25-H6' },
  { wireNo: '5020', signal: 'APS_OUTPUT_1', description: 'APS output 1 - 110V DC bus', from: 'APS1-CN1-1', to: 'EDB1-MAIN_BUS', wireType: '25mm²' },
  { wireNo: '5021', signal: 'APS_OUTPUT_2', description: 'APS output 2 - 110V DC bus', from: 'APS1-CN1-3', to: 'EDB2-MAIN_BUS', wireType: '25mm²' },
  { wireNo: '5030', signal: 'SIV_CONTACT1', description: 'SIV contactor 1 status', from: 'APS1-CN3-1', to: 'TCMS_RIO2-U25-J6' },
  { wireNo: '5031', signal: 'SIV_CONTACT2', description: 'SIV contactor 2 status', from: 'APS1-CN3-2', to: 'TCMS_RIO2-U25-J7' },
  { wireNo: '5040', signal: 'SIV_FAULT', description: 'SIV fault output', from: 'APS1-CN2-5', to: 'TCMS_RIO2-U25-G3' },
  { wireNo: '5050', signal: 'BATTERY_CHG', description: 'Battery charger output status', from: 'APS1-CN4-1', to: 'TCMS_RIO2-U25-G5' },
  { wireNo: '5060', signal: 'DC_BUS_VOLTAGE', description: 'DC bus voltage monitoring', from: 'APS1-CN5-1', to: 'TCMS_RIO2-U25-H1', analog: true },
  { wireNo: '5064', signal: 'BAT_UNDER_VOLT', description: 'Battery under-voltage warning', from: 'BATT1-CN1-2', to: 'TCMS_RIO2-U25-G4' },
  { wireNo: '5100', signal: 'EMERGENCY_POWER', description: 'Emergency power supply command', from: 'TCMS_RIO2-U25-K1', to: 'APS1-CN6-1' },
  { wireNo: '5110', signal: 'BATT_ISOLATE', description: 'Battery isolation command', from: 'TCMS_RIO2-U25-K2', to: 'BATT_ISOLATOR-CN1' },
];

const APS_COMPONENTS = [
  { component: 'Auxiliary Power Supply', designation: 'APS1', location: 'TC Underframe', function: 'Main converter - 3-phase AC to 110V DC', drawing: '942-58130', ports: 'CN1: Output, CN2: Control, CN3: Contactors, CN4: Charger, CN5: Monitor, CN6: Emergency' },
  { component: 'Static Inverter', designation: 'SIV1', location: 'TC Underframe', function: '110V DC to 415V AC for saloon loads', drawing: '942-58131' },
  { component: 'Shore Supply Box', designation: 'SSB1', location: 'TC Car End', function: 'External power connection for depot', drawing: '942-58132' },
  { component: 'Battery', designation: 'BATT1', location: 'TC Underframe', function: '110V DC backup power supply', drawing: '942-58130' },
  { component: 'Battery Isolator', designation: 'BI1', location: 'TC Underframe', function: 'Emergency battery disconnect', drawing: '942-58130' },
  { component: 'Distribution Box', designation: 'EDB1-4', location: 'Ceiling Each Car', function: '110V DC distribution to loads', drawing: '942-58131' },
  { component: 'Line Filter', designation: 'LF1', location: 'APS Cabinet', function: 'Input filtering for APS', drawing: '942-58130' },
];

const POWER_DISTRIBUTION = [
  { bus: '110V DC Main', source: 'APS1-CN1', loads: ['EDB (all cars)', 'Battery Charger', 'TCMS RIO', 'Compressor', 'Blower'] },
  { bus: '110V DC Emergency', source: 'BATT1', loads: ['Emergency Lighting', 'Emergency Doors', 'Radio', 'Fire Detection'] },
  { bus: '415V AC 3-phase', source: 'SIV1', loads: ['VAC Units', 'Battery Charger', 'Water Heater', 'PIS'] },
  { bus: '230V AC Single', source: 'SIV1-Transformer', loads: ['Power Sockets', 'PIS Display', 'CCTV'] },
];

const TRAINLINE_REFERENCES = [
  { trainline: '1040', description: 'AUX_ON - Auxiliary power on command', route: 'OP_Panel → APS1' },
  { trainline: '5000', description: 'SHORE_SUPPLY - Shore supply command', route: 'TCMS_RIO2 → SSB1' },
  { trainline: '5030', description: 'SIV_CONTACT1 - SIV status feedback', route: 'APS1 → TCMS_RIO2' },
  { trainline: '5064', description: 'BAT_UNDER_VOLT - Battery low warning', route: 'BATT1 → TCMS_RIO2' },
];

const DRAWINGS = [
  { drawingNo: '942-58130', title: 'APS Main Circuit', description: 'APS unit and battery system' },
  { drawingNo: '942-58131', title: 'SIV and Distribution', description: 'Static inverter and EDB distribution' },
  { drawingNo: '942-58132', title: 'Shore Supply', description: 'Shore supply box and connection' },
  { drawingNo: '942-38512', title: 'TC Underframe APS Layout', description: 'Location of APS, battery, SIV' },
];

export default function APSPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = APS_WIRING.filter(w => !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Battery className="h-8 w-8 text-green-400" />
          Auxiliary Power Supply (APS)
        </h1>
        <p className="mt-2 text-slate-400">
          APS unit, shore supply, battery control, SIV contactors
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring', icon: Cable },
          { id: 'distribution', label: 'Power Distribution', icon: Zap },
          { id: 'components', label: 'Components', icon: Cpu },
          { id: 'trainlines', label: 'Trainlines', icon: Battery },
          { id: 'drawings', label: 'Drawings', icon: FileText },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'wiring' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search wire..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200" />
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Wire</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Signal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredWiring.map(wire => (
                  <tr key={wire.wireNo} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <Link href={`/wires/${wire.wireNo}`} className="font-mono font-bold text-cyan-400">{wire.wireNo}</Link>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{wire.signal}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.from}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.to}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{wire.wireType || '1.5mm²'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'distribution' && (
        <div className="space-y-4">
          {POWER_DISTRIBUTION.map(pd => (
            <div key={pd.bus} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-white">{pd.bus}</span>
                <span className="text-xs text-slate-400 ml-2">Source: {pd.source}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pd.loads.map(load => (
                  <span key={load} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">{load}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'components' && (
        <div className="space-y-4">
          {APS_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-green-400">{comp.component}</span>
                <span className="font-mono text-cyan-400">{comp.designation}</span>
              </div>
              <div className="text-sm text-slate-400">{comp.function}</div>
              <div className="text-xs text-slate-500 mt-2">Location: {comp.location}</div>
              <div className="text-xs text-slate-500 mt-1">Drawing: <Link href={`/drawings/${comp.drawing}`} className="text-cyan-400">{comp.drawing}</Link></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'trainlines' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Trainline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {TRAINLINE_REFERENCES.map(tl => (
                <tr key={tl.trainline}>
                  <td className="px-4 py-3"><Link href={`/trainlines/${tl.trainline}`} className="font-mono font-bold text-cyan-400">{tl.trainline}</Link></td>
                  <td className="px-4 py-3 text-white text-sm">{tl.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{tl.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'drawings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DRAWINGS.map(dwg => (
            <Link key={dwg.drawingNo} href={`/drawings/${dwg.drawingNo}`} className="glass-card p-4 hover:bg-slate-800/50">
              <span className="font-mono text-lg font-bold text-cyan-400">{dwg.drawingNo}</span>
              <div className="text-white font-medium mt-2">{dwg.title}</div>
              <div className="text-xs text-slate-500 mt-1">{dwg.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}