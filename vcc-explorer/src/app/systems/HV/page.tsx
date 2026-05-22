'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Search, Cpu, Cable, FileText, AlertTriangle } from 'lucide-react';

const HV_WIRING = [
  { wireNo: '1201', signal: 'HSCB_CLOSE_CMD', description: 'HSCB close command', from: 'TCMS_RIO1-U15-K1', to: 'HSCB1-CN1-1' },
  { wireNo: '1202', signal: 'HSCB_OPEN_CMD', description: 'HSCB open command', from: 'TCMS_RIO1-U15-K2', to: 'HSCB1-CN1-2' },
  { wireNo: '1205', signal: 'HSCB_STATUS', description: 'HSCB status feedback', from: 'HSCB1-CN2-1', to: 'TCMS_RIO1-U15-L1' },
  { wireNo: '1209', signal: 'HSCB_TRIP', description: 'HSCB trip status', from: 'HSCB1-CN1-3', to: 'TCMS_RIO1-U15-H4' },
  { wireNo: '1210', signal: 'PANTO_UP', description: 'Pantograph up command', from: 'TCMS_RIO1-U15-M1', to: 'PGS1-CN1-1' },
  { wireNo: '1211', signal: 'PANTO_DOWN', description: 'Pantograph down command', from: 'TCMS_RIO1-U15-M2', to: 'PGS1-CN1-2' },
  { wireNo: '1215', signal: 'PANTO_STATUS', description: 'Pantograph status', from: 'PGS1-CN2-1', to: 'TCMS_RIO1-U15-M3' },
  { wireNo: '1220', signal: 'PANTograph_FAULT', description: 'Pantograph fault', from: 'PGS1-CN2-2', to: 'TCMS_RIO1-U15-M4' },
  { wireNo: '1225', signal: 'HTEB_STATUS', description: 'High tension earth brush status', from: 'HTEB1-CN1-1', to: 'TCMS_RIO1-U15-N1' },
  { wireNo: '1230', signal: 'HTJB_STATUS', description: 'High tension junction box status', from: 'HTJB1-CN1-1', to: 'TCMS_RIO1-U15-N2' },
];

const HV_COMPONENTS = [
  { component: 'High Speed Circuit Breaker', designation: 'HSCB1', location: 'DMC Underframe', function: 'Main traction circuit protection', drawing: '942-58103', voltage: '1500V DC' },
  { component: 'Pantograph', designation: 'PGS1', location: 'MC Roof', function: 'Current collection from OCS', drawing: '942-58104', voltage: '1500V DC' },
  { component: 'Pantograph Control', designation: 'PGS_CTRL', location: 'MC Cabinet', function: 'Pantograph up/down control', drawing: '942-58104' },
  { component: 'High Tension Equipment Box', designation: 'HTEB1', location: 'DMC Underframe', function: 'HV distribution and filtering', drawing: '942-58103' },
  { component: 'High Tension Junction Box', designation: 'HTJB1', location: 'MC Underframe', function: 'HV connection points', drawing: '942-58103' },
  { component: 'Earth Brush', designation: 'EB1-4', location: 'All Cars', function: 'Traction return current path', drawing: '942-58103' },
  { component: 'Surge Arrester', designation: 'SA1-4', location: 'Roof/Underframe', function: 'Overvoltage protection', drawing: '942-58104' },
];

const DRAWINGS = [
  { drawingNo: '942-58103', title: 'HV System Circuit', description: 'HSCB, HTEB, HTJB, earth brushes' },
  { drawingNo: '942-58104', title: 'Pantograph Circuit', description: 'Pantograph and surge protection' },
  { drawingNo: '942-38103', title: 'DMC HV Layout', description: 'DMC high voltage equipment' },
];

export default function HVPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = HV_WIRING.filter(w => !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Zap className="h-8 w-8 text-red-600" />
          High Voltage (HV) System
        </h1>
        <p className="mt-2 text-slate-400">HSCB, pantograph, high tension bus, earth brushes</p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">DANGER: High Voltage System</p>
            <p className="text-xs text-slate-400 mt-1">
              This system operates at 1500V DC. Only qualified personnel should work on these circuits.
            </p>
          </div>
        </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="space-y-4">
          {HV_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-red-400">{comp.component}</span>
                <span className="font-mono text-cyan-400">{comp.designation}</span>
                {comp.voltage && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">{comp.voltage}</span>}
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