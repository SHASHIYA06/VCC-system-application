'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, ArrowRight, Search, Cpu, Cable, FileText, Gauge } from 'lucide-react';

const BOGIE_WIRING = [
  { wireNo: '2001', signal: 'WHEEL_DIAMETER', description: 'Wheel diameter sensor', from: 'WDS1-CN1-1', to: 'BCU1-CN4-1', analog: true },
  { wireNo: '2002', signal: 'AXLE_SPEED_1', description: 'Axle 1 speed sensor', from: 'SS1-CN1-1', to: 'BCU1-CN4-2', analog: true },
  { wireNo: '2003', signal: 'AXLE_SPEED_2', description: 'Axle 2 speed sensor', from: 'SS2-CN1-1', to: 'BCU1-CN4-3', analog: true },
  { wireNo: '2004', signal: 'AXLE_SPEED_3', description: 'Axle 3 speed sensor', from: 'SS3-CN1-1', to: 'BCU1-CN4-4', analog: true },
  { wireNo: '2005', signal: 'AXLE_SPEED_4', description: 'Axle 4 speed sensor', from: 'SS4-CN1-1', to: 'BCU1-CN4-5', analog: true },
  { wireNo: '2010', signal: 'BRAKE_CYL_1', description: 'Brake cylinder pressure 1', from: 'BC_PS1-CN1-1', to: 'BCU1-CN5-1', analog: true },
  { wireNo: '2011', signal: 'BRAKE_CYL_2', description: 'Brake cylinder pressure 2', from: 'BC_PS2-CN1-1', to: 'BCU1-CN5-2', analog: true },
  { wireNo: '2020', signal: 'SUSPENSION_1', description: 'Suspension height sensor 1', from: 'SUSP1-CN1-1', to: 'BCU1-CN6-1', analog: true },
  { wireNo: '2021', signal: 'SUSPENSION_2', description: 'Suspension height sensor 2', from: 'SUSP2-CN1-1', to: 'BCU1-CN6-2', analog: true },
  { wireNo: '2030', signal: 'BOGIE_TEMP_1', description: 'Bogie temperature sensor 1', from: 'TEMP_BG1-CN1', to: 'BCU1-CN7-1', analog: true },
  { wireNo: '2031', signal: 'BOGIE_TEMP_2', description: 'Bogie temperature sensor 2', from: 'TEMP_BG2-CN1', to: 'BCU1-CN7-2', analog: true },
];

const BOGIE_COMPONENTS = [
  { component: 'Speed Sensor', designation: 'SS1-4', location: 'Each Axle', function: 'Wheel speed detection for ABS/traction', drawing: '942-58128' },
  { component: 'Wheel Diameter Sensor', designation: 'WDS1', location: 'Bogie Frame', function: 'Wheel wear measurement', drawing: '942-58128' },
  { component: 'Brake Cylinder Pressure Sensor', designation: 'BC_PS1-2', location: 'Brake Unit', function: 'Brake pressure monitoring', drawing: '942-58128' },
  { component: 'Suspension Height Sensor', designation: 'SUSP1-2', location: 'Bogie', function: 'Air suspension level', drawing: '942-58129' },
  { component: 'Bogie Temperature Sensor', designation: 'TEMP_BG1-2', location: 'Bogie', function: 'Bogie bearing temperature', drawing: '942-58129' },
  { component: 'Traction Motor', designation: 'M1-4', location: 'Bogie', function: 'Traction drive motor', drawing: '942-58119' },
  { component: 'Gearbox', designation: 'GB1-4', location: 'Bogie', function: 'Motor to axle gear reduction', drawing: '942-58119' },
  { component: 'Wheel Set', designation: 'WS1-4', location: 'Bogie', function: 'Wheels and axle assembly', drawing: '942-58128' },
];

const TRAINLINE_REFERENCES = [
  { trainline: '2001', description: 'WHEEL_DIAMETER - Wheel diameter monitoring', route: 'WDS → BCU' },
  { trainline: '2002', description: 'AXLE_SPEED_1 - Speed sensor axle 1', route: 'SS1 → BCU' },
  { trainline: '2010', description: 'BRAKE_CYL_1 - Brake cylinder pressure', route: 'BC_PS1 → BCU' },
];

const DRAWINGS = [
  { drawingNo: '942-58128', title: 'Bogie Speed Sensors', description: 'Speed and wheel diameter sensors' },
  { drawingNo: '942-58129', title: 'Bogie Monitoring', description: 'Suspension and temperature' },
  { drawingNo: '942-58119', title: 'Traction Motor', description: 'Motor and gearbox' },
];

export default function BOGIEPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = BOGIE_WIRING.filter(w => !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Settings className="h-8 w-8 text-slate-400" />
          Bogie System
        </h1>
        <p className="mt-2 text-slate-400">Bogie monitoring, speed sensors, suspension, brake cylinder</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring', icon: Cable },
          { id: 'components', label: 'Components', icon: Cpu },
          { id: 'trainlines', label: 'Trainlines', icon: Settings },
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BOGIE_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-slate-300">{comp.component}</span>
                <span className="font-mono text-cyan-400">{comp.designation}</span>
              </div>
              <div className="text-sm text-slate-400">{comp.function}</div>
              <div className="text-xs text-slate-500 mt-2">Drawing: <Link href={`/drawings/${comp.drawing}`} className="text-cyan-400">{comp.drawing}</Link></div>
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