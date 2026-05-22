'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DoorOpen, ArrowRight, Search, AlertTriangle, Cpu, Cable, FileText, Settings } from 'lucide-react';

const DOOR_WIRING = [
  { wireNo: '6009', signal: 'DOOR_OPEN_L', description: 'Left door open command (crossed at J43-44)', from: 'TCMS_RIO1-U15-J7', to: 'DCU1-CN1-3', crossed: true },
  { wireNo: '6046', signal: 'DOOR_OPEN_R', description: 'Right door open command (crossed at J43-44)', from: 'TCMS_RIO1-U15-J8', to: 'DCU1-CN1-4', crossed: true },
  { wireNo: '6014', signal: 'DOOR_CLOSE_L', description: 'Left door close command (crossed at J46-47)', from: 'TCMS_RIO1-U15-J9', to: 'DCU1-CN1-5', crossed: true },
  { wireNo: '6051', signal: 'DOOR_CLOSE_R', description: 'Right door close command (crossed at J46-47)', from: 'TCMS_RIO1-U15-J10', to: 'DCU1-CN1-6', crossed: true },
  { wireNo: '6073', signal: 'DOOR_PROVE_1', description: 'Door 1 proving loop feedback', from: 'DCU1-CN2-3', to: 'TCMS_RIO1-U15-H2', type: 'Input' },
  { wireNo: '6076', signal: 'DOOR_PROVE_2', description: 'Door 2 proving loop feedback', from: 'DCU1-CN2-4', to: 'TCMS_RIO1-U15-H3', type: 'Input' },
  { wireNo: '6079', signal: 'DOOR_PROVE_3', description: 'Door 3 proving loop feedback', from: 'DCU1-CN2-5', to: 'TCMS_RIO1-U15-H4', type: 'Input' },
  { wireNo: '6082', signal: 'DOOR_PROVE_4', description: 'Door 4 proving loop feedback', from: 'DCU1-CN2-6', to: 'TCMS_RIO1-U15-H5', type: 'Input' },
  { wireNo: '6101', signal: 'DOOR_CLOSE_IND', description: 'Door closed indication', from: 'DCU1-CN3-1', to: 'TCMS_RIO1-U15-J1', type: 'Output' },
  { wireNo: '6102', signal: 'DOOR_OPEN_IND', description: 'Door open indication', from: 'DCU1-CN3-2', to: 'TCMS_RIO1-U15-J2', type: 'Output' },
  { wireNo: '6112', signal: 'ZERO_SPEED', description: 'Zero speed interlock - allows door open', from: 'V1-CN2-3', to: 'TCMS_RIO1-U15-L3', type: 'Input' },
  { wireNo: '6120', signal: 'DOOR_FAULT', description: 'Door system fault output', from: 'DCU1-CN4-1', to: 'TCMS_RIO1-U15-K1', type: 'Output' },
  { wireNo: '6125', signal: 'EM_DOOR_CUTOUT', description: 'Emergency door cutoff command', from: 'TCMS_RIO1-U15-L1', to: 'DCU1-CN4-5', type: 'Input' },
];

const DOOR_COMPONENTS = [
  { component: 'Door Control Unit', designation: 'DCU1-4', location: 'Door Header Each Door', function: 'Door open/close control, motor drive', drawing: '942-58138' },
  { component: 'Door Motor', designation: 'DM1-8', location: 'Each Door', function: 'Electric motor for door actuation', drawing: '942-58138' },
  { component: 'Door Position Sensor', designation: 'DPS1-8', location: 'Each Door', function: 'Door position feedback for control', drawing: '942-58139' },
  { component: 'Proving Loop', designation: 'PL1-8', location: 'Door Threshold', function: 'Verify door is free before closing', drawing: '942-58140' },
  { component: 'Safety Edge', designation: 'SE1-8', location: 'Door Leading Edge', function: 'Obstruction detection', drawing: '942-58140' },
  { component: 'Emergency Release', designation: 'ER1-8', location: 'Inside Door', function: 'Manual door release', drawing: '942-58139' },
  { component: 'Local Control Panel', designation: 'LCP1-4', location: 'Car Doorway', function: 'Door override controls', drawing: '942-58137' },
];

const JUMPER_CONNECTIONS = [
  { jumper: 'J43', pins: '43-44', description: 'Door open cross - 6009↔6046', purpose: 'Left/right door open command cross' },
  { jumper: 'J46', pins: '46-47', description: 'Door close cross - 6014↔6051', purpose: 'Left/right door close command cross' },
  { jumper: 'J45', pins: '45-46', description: 'Door supply positive', purpose: '110V door power' },
  { jumper: 'J48', pins: '48-49', description: 'Door supply negative', purpose: '110V door return' },
];

const TRAINLINE_REFERENCES = [
  { trainline: '6009', description: 'DOOR_OPEN_L - Left door open (crossed at J43-44)', route: 'TCMS_RIO1 → U15-J7 → J43(cross) → DCU1' },
  { trainline: '6046', description: 'DOOR_OPEN_R - Right door open (crossed at J43-44)', route: 'TCMS_RIO1 → U15-J8 → J43(cross) → DCU1' },
  { trainline: '6014', description: 'DOOR_CLOSE_L - Left door close (crossed at J46-47)', route: 'TCMS_RIO1 → U15-J9 → J46(cross) → DCU1' },
  { trainline: '6051', description: 'DOOR_CLOSE_R - Right door close (crossed at J46-47)', route: 'TCMS_RIO1 → U15-J10 → J46(cross) → DCU1' },
];

const DRAWINGS = [
  { drawingNo: '942-58137', title: 'Door Supply Circuit', description: 'Door power supply and distribution' },
  { drawingNo: '942-58138', title: 'Door Control Circuit', description: 'DCU control and motor drive' },
  { drawingNo: '942-58139', title: 'Door Position Sensors', description: 'Position sensor wiring' },
  { drawingNo: '942-58140', title: 'Door Proving Loop', description: 'Proving loop circuit' },
  { drawingNo: '942-58141', title: 'Door Local Control', description: 'Local control panel wiring' },
];

export default function DOORPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = DOOR_WIRING.filter(w => !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <DoorOpen className="h-8 w-8 text-amber-400" />
          Door System
        </h1>
        <p className="mt-2 text-slate-400">
          Door operation, proving loops, local interlock, TCMS interface
        </p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">Jumper Cross-Connections</p>
            <p className="text-xs text-slate-400 mt-1">
              Door commands are crossed at jumpers J43-44 (open) and J46-47 (close). This enables all-door operation from single cab command.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring', icon: Cable },
          { id: 'jumpers', label: 'Jumpers', icon: Settings },
          { id: 'components', label: 'Components', icon: Cpu },
          { id: 'trainlines', label: 'Trainlines', icon: DoorOpen },
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredWiring.map(wire => (
                  <tr key={wire.wireNo} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/wires/${wire.wireNo}`} className={`font-mono font-bold ${wire.crossed ? 'text-amber-400' : 'text-cyan-400'}`}>
                          {wire.wireNo}
                        </Link>
                        {wire.crossed && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{wire.signal}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.from}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.to}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{wire.type || 'Command'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'jumpers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JUMPER_CONNECTIONS.map(j => (
            <div key={j.jumper} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-lg font-bold text-cyan-400">{j.jumper}</span>
                <span className="text-sm text-slate-400">Pins {j.pins}</span>
              </div>
              <div className="text-sm text-white">{j.description}</div>
              <div className="text-xs text-slate-500 mt-1">{j.purpose}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'components' && (
        <div className="space-y-4">
          {DOOR_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-amber-400">{comp.component}</span>
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