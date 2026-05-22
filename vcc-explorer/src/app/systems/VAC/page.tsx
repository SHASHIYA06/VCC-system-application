'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wind, ArrowRight, Search, Cpu, Cable, FileText, Settings } from 'lucide-react';

const VAC_WIRING = [
  { wireNo: '7001', signal: 'CAB_VAC_FLT', description: 'Cab VAC fault indication', from: 'CAB_VAC1-CN1-5', to: 'TCMS_RIO2-U25-F2' },
  { wireNo: '7005', signal: 'CAB_VAC_CMD', description: 'Cab VAC on/off command', from: 'TCMS_RIO1-U25-E1', to: 'CAB_VAC1-CN1-1' },
  { wireNo: '7010', signal: 'CAB_VAC_FAN', description: 'Cab VAC fan speed', from: 'TCMS_RIO1-U25-E2', to: 'CAB_VAC1-CN1-2' },
  { wireNo: '7050', signal: 'VAC1_STATUS', description: 'Saloon VAC 1 status feedback', from: 'VAC1-CN1-3', to: 'TCMS_RIO1-U15-F4' },
  { wireNo: '7060', signal: 'VAC2_STATUS', description: 'Saloon VAC 2 status feedback', from: 'VAC1-CN1-4', to: 'TCMS_RIO1-U15-F5' },
  { wireNo: '7070', signal: 'SMOKE_DETECT', description: 'Smoke detection alarm', from: 'SMOKE_SNS-CN1-1', to: 'TCMS_RIO1-U15-F6' },
  { wireNo: '7075', signal: 'SMOKE_RESET', description: 'Smoke detector reset', from: 'TCMS_RIO1-U15-G1', to: 'SMOKE_SNS-CN1-2' },
  { wireNo: '7080', signal: 'VAC_FAULT_1', description: 'VAC unit 1 fault', from: 'VAC1-CN2-1', to: 'TCMS_RIO1-U15-G2' },
  { wireNo: '7085', signal: 'VAC_FAULT_2', description: 'VAC unit 2 fault', from: 'VAC2-CN2-1', to: 'TCMS_RIO1-U15-G3' },
  { wireNo: '7090', signal: 'VAC_TEMP_1', description: 'VAC temperature sensor 1', from: 'TEMP_SENS1-CN1', to: 'TCMS_RIO1-U15-H1', analog: true },
  { wireNo: '7095', signal: 'VAC_TEMP_2', description: 'VAC temperature sensor 2', from: 'TEMP_SENS2-CN1', to: 'TCMS_RIO1-U15-H2', analog: true },
];

const VAC_COMPONENTS = [
  { component: 'Cab HVAC Unit', designation: 'CAB_VAC1', location: 'Cab Ceiling', function: 'Driver cab air conditioning', drawing: '942-58143' },
  { component: 'Saloon HVAC Unit 1', designation: 'VAC1', location: 'TC Ceiling', function: 'Saloon air conditioning', drawing: '942-58144' },
  { component: 'Saloon HVAC Unit 2', designation: 'VAC2', location: 'MC Ceiling', function: 'Saloon air conditioning', drawing: '942-58145' },
  { component: 'Smoke Detector', designation: 'SMOKE_SNS', location: 'Saloon Ceiling', function: 'Fire detection in saloon', drawing: '942-58145' },
  { component: 'Temperature Sensor', designation: 'TEMP_SENS1-2', location: 'HVAC Ducts', function: 'Temperature monitoring', drawing: '942-58144' },
  { component: 'HVAC Controller', designation: 'HVAC_CTRL', location: 'HVAC Unit', function: 'Climate control logic', drawing: '942-58144' },
];

const DRAWINGS = [
  { drawingNo: '942-58143', title: 'Cab HVAC Circuit', description: 'Cab air conditioning' },
  { drawingNo: '942-58144', title: 'Saloon HVAC Circuit', description: 'Saloon air conditioning' },
  { drawingNo: '942-58145', title: 'Smoke Detection', description: 'Fire detection system' },
];

export default function VACPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = VAC_WIRING.filter(w => !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Wind className="h-8 w-8 text-emerald-400" />
          Ventilation AC (VAC/HVAC)
        </h1>
        <p className="mt-2 text-slate-400">Cab VAC, saloon VAC power/control, smoke detection</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring', icon: Cable },
          { id: 'components', label: 'Components', icon: Cpu },
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
                    <td className="px-4 py-3">
                      {wire.analog && <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Analog</span>}
                      {!wire.analog && <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">Digital</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="space-y-4">
          {VAC_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-emerald-400">{comp.component}</span>
                <span className="font-mono text-cyan-400">{comp.designation}</span>
              </div>
              <div className="text-sm text-slate-400">{comp.function}</div>
              <div className="text-xs text-slate-500 mt-2">Drawing: <Link href={`/drawings/${comp.drawing}`} className="text-cyan-400">{comp.drawing}</Link></div>
            </div>
          ))}
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