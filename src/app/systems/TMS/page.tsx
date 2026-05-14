'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, Search, Cable, FileText, Settings, Activity, MapPin } from 'lucide-react';

const TCMS_WIRING = [
  { wireNo: '1001', signal: 'TCMS_PWR', description: 'TCMS main power', from: 'APS1-CN1-10', to: 'TCMS_RIO1-CN1-1' },
  { wireNo: '1002', signal: 'TCMS_GND', description: 'TCMS ground', from: 'APS1-CN1-11', to: 'TCMS_RIO1-CN1-2' },
  { wireNo: '9001', signal: 'RIO1_COM', description: 'TCMS RIO1 communication', from: 'TCMS_RIO1-CAN1', to: 'CAN_BUS_TCMS', network: true },
  { wireNo: '9002', signal: 'RIO2_COM', description: 'TCMS RIO2 communication', from: 'TCMS_RIO2-CAN1', to: 'CAN_BUS_TCMS', network: true },
  { wireNo: '9003', signal: 'RIO3_COM', description: 'TCMS RIO3 communication', from: 'TCMS_RIO3-CAN1', to: 'CAN_BUS_TCMS', network: true },
  { wireNo: '9100', signal: 'DI_1', description: 'Digital input 1 - door status', from: 'DOORS-CN1-1', to: 'TCMS_RIO1-CN10-1' },
  { wireNo: '9101', signal: 'DI_2', description: 'Digital input 2 - brake status', from: 'BCU1-CN3-1', to: 'TCMS_RIO1-CN10-2' },
  { wireNo: '9102', signal: 'DI_3', description: 'Digital input 3 - traction status', from: 'VVVF1-CN5-1', to: 'TCMS_RIO1-CN10-3' },
  { wireNo: '9200', signal: 'DO_1', description: 'Digital output 1 - horn', from: 'TCMS_RIO1-CN11-1', to: 'HORN_RELAY-CN1' },
  { wireNo: '9201', signal: 'DO_2', description: 'Digital output 2 - lights', from: 'TCMS_RIO1-CN11-2', to: 'LIGHT_CTRL-CN1' },
  { wireNo: '9300', signal: 'AI_1', description: 'Analog input 1 - speed', from: 'SPEED_SENS-CN1', to: 'TCMS_RIO1-CN12-1', analog: true },
  { wireNo: '9301', signal: 'AI_2', description: 'Analog input 2 - pressure', from: 'PRESS_SENS-CN1', to: 'TCMS_RIO1-CN12-2', analog: true },
];

const TCMS_RIO_CONFIG = [
  { rio: 'TCMS_RIO1', location: 'MC Ceiling', function: 'Main TCMS controller - all car inputs', inputs: 24, outputs: 16, ports: 'CN1: Power, CN2: CAN, CN10: DI, CN11: DO, CN12: AI' },
  { rio: 'TCMS_RIO2', location: 'TC Ceiling', function: 'TC car I/O - APS, battery, shore supply', inputs: 16, outputs: 12, ports: 'CN1: Power, CN2: CAN, CN10: DI, CN11: DO, CN12: AI' },
  { rio: 'TCMS_RIO3', location: 'DMC Ceiling', function: 'DMC I/O - VVVF, BCU monitoring', inputs: 20, outputs: 10, ports: 'CN1: Power, CN2: CAN, CN10: DI, CN11: DO, CN12: AI' },
];

const POINT_MAPPING = [
  { point: 'A1', description: 'Door 1 open status', source: 'DCU1-CN3-1', destination: 'RIO1-CN10-1' },
  { point: 'A2', description: 'Door 1 close status', source: 'DCU1-CN3-2', destination: 'RIO1-CN10-2' },
  { point: 'B1', description: 'Brake applied status', source: 'BCU1-CN3-1', destination: 'RIO1-CN10-3' },
  { point: 'B2', description: 'Parking brake status', source: 'PBMV1-CN2-1', destination: 'RIO1-CN10-4' },
  { point: 'C1', description: 'VVVF running', source: 'VVVF1-CN2-1', destination: 'RIO1-CN10-5' },
  { point: 'C2', description: 'VVVF fault', source: 'VVVF1-CN2-2', destination: 'RIO1-CN10-6' },
  { point: 'D1', description: 'Compressor run', source: 'COMP1-CN2-1', destination: 'RIO2-CN10-1' },
  { point: 'D2', description: 'SIV status', source: 'APS1-CN3-1', destination: 'RIO2-CN10-2' },
  { point: 'E1', description: 'Horn command', source: 'OP_PNL1-CN3-1', destination: 'RIO1-CN11-1' },
  { point: 'E2', description: 'Headlights', source: 'OP_PNL1-CN4-1', destination: 'RIO1-CN11-2' },
];

const DRAWINGS = [
  { drawingNo: '942-58146', title: 'TCMS System Overview', description: 'Complete TCMS architecture' },
  { drawingNo: '942-38409', title: 'TCMS RIO CN11', description: 'TCMS RIO pin assignments' },
  { drawingNo: '942-38606', title: 'MC Car TCMS', description: 'MC car TCMS wiring' },
  { drawingNo: '942-38409', title: 'TC Car TCMS', description: 'TC car TCMS wiring' },
];

export default function TCMSPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = TCMS_WIRING.filter(w => !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Cpu className="h-8 w-8 text-purple-400" />
          TCMS - Train Control Management System
        </h1>
        <p className="mt-2 text-slate-400">
          TCMS RIO, point assignments, CAN bus communication, digital I/O mapping
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring', icon: Cable },
          { id: 'rio', label: 'RIO Config', icon: Cpu },
          { id: 'points', label: 'Point Mapping', icon: MapPin },
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
                      <Link href={`/wires/${wire.wireNo}`} className={`font-mono font-bold ${wire.network ? 'text-purple-400' : wire.analog ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {wire.wireNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{wire.signal}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.from}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.to}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        wire.network ? 'bg-purple-500/20 text-purple-400' :
                        wire.analog ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {wire.network ? 'Network' : wire.analog ? 'Analog' : 'Digital'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rio' && (
        <div className="space-y-4">
          {TCMS_RIO_CONFIG.map(rio => (
            <div key={rio.rio} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-bold text-purple-400">{rio.rio}</span>
                <span className="text-sm text-slate-400">{rio.location}</span>
              </div>
              <div className="text-sm text-slate-300 mb-3">{rio.function}</div>
              <div className="flex gap-4 text-xs">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Inputs: {rio.inputs}</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Outputs: {rio.outputs}</span>
              </div>
              <div className="text-xs text-slate-500 mt-3 font-mono">{rio.ports}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'points' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Point</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {POINT_MAPPING.map(pm => (
                <tr key={pm.point}>
                  <td className="px-4 py-3 font-mono font-bold text-purple-400">{pm.point}</td>
                  <td className="px-4 py-3 text-white text-sm">{pm.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{pm.source}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{pm.destination}</td>
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