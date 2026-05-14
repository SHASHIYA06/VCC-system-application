'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Search, AlertTriangle, Cpu, Cable, FileText, Settings, ChevronDown } from 'lucide-react';

const TRACTION_WIRING = [
  { wireNo: '3003', signal: 'FORWARD_CMD', description: 'Forward propulsion command to VVVF', from: 'TCMS_RIO1-X1-17', to: 'V1-CN1-12', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '3004', signal: 'REVERSE_CMD', description: 'Reverse propulsion command to VVVF', from: 'TCMS_RIO1-X1-18', to: 'V1-CN1-13', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '3005', signal: 'POWERING_1', description: 'Powering command level 1 (X1-19 jumper crossed)', from: 'TCMS_RIO1-X1-19', to: 'V1-CN1-14', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC', crossed: true },
  { wireNo: '3006', signal: 'POWERING_2', description: 'Powering command level 2 (X1-20 jumper crossed)', from: 'TCMS_RIO1-X1-20', to: 'V1-CN1-15', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC', crossed: true },
  { wireNo: '3010', signal: 'BRAKE_CMD', description: 'Braking command to VVVF', from: 'TCMS_RIO1-X1-22', to: 'V1-CN1-16', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '3011', signal: 'FSB_CMD', description: 'Full service brake command', from: 'TCMS_RIO1-X1-23', to: 'V1-CN1-17', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '1207', signal: 'VVVF_FAULT', description: 'VVVF fault indication output', from: 'V1-CN2-5', to: 'TCMS_RIO1-U15-M2', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC', direction: 'Input to TCMS' },
  { wireNo: '1211', signal: 'VVVF_RUN', description: 'VVVF running status', from: 'V1-CN2-7', to: 'TCMS_RIO1-U15-M3', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '1213', signal: 'VVVF_READY', description: 'VVVF ready signal', from: 'V1-CN2-9', to: 'TCMS_RIO1-U15-M4', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '1217', signal: 'VVVF_OVLD', description: 'VVVF overload indication', from: 'V1-CN2-11', to: 'TCMS_RIO1-U15-M5', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '1301', signal: 'TRACTION_RETURN', description: 'Traction return current monitoring', from: 'V1-CN3-1', to: 'LTEB1-TERMINAL', wireType: '25mm²', color: 'Black', voltage: 'Load', purpose: 'High current return' },
  { wireNo: '1302', signal: 'TRACTION_FAULT_RESET', description: 'Traction fault reset command', from: 'TCMS_RIO1-U15-N1', to: 'V1-CN2-1', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
];

const VVVF_CONNECTIONS = [
  { connector: 'CN1', pins: '12-17', description: ' Propulsion commands from TCMS', type: 'Input' },
  { connector: 'CN1', pins: '18-26', description: 'Reserved for future expansion', type: 'NC' },
  { connector: 'CN2', pins: '1-2', description: 'Fault reset and spare', type: 'Control' },
  { connector: 'CN2', pins: '3-4', description: 'Zero speed and spare', type: 'Input' },
  { connector: 'CN2', pins: '5-15', description: 'Status outputs to TCMS', type: 'Output' },
  { connector: 'CN3', pins: '1-5', description: 'Traction motor current feedback', type: 'Analog' },
  { connector: 'CN3', pins: '6-10', description: 'DC link voltage monitoring', type: 'Analog' },
  { connector: 'CN4', pins: '1-3', description: 'Main power input (3-phase)', type: 'Power' },
];

const TRACTION_COMPONENTS = [
  { component: 'VVVF Inverter', designation: 'V1', location: 'MC Car Underframe', function: 'Variable Voltage Variable Frequency control for traction motors', drawing: '942-58120' },
  { component: 'Traction Motor 1', designation: 'M1', location: 'MC1 Bogie', function: 'Propulsion motor - 3-phase induction', drawing: '942-58119' },
  { component: 'Traction Motor 2', designation: 'M2', location: 'MC2 Bogie', function: 'Propulsion motor - 3-phase induction', drawing: '942-58119' },
  { component: 'Line Filter', designation: 'LF1', location: 'MC Underframe', function: 'Input filtering and harmonic reduction', drawing: '942-58121' },
  { component: 'Pre-charge Circuit', designation: 'PC1', location: 'VVVF cabinet', function: 'DC link capacitor pre-charging', drawing: '942-58121' },
  { component: 'Braking Resistor', designation: 'BR1', location: 'MC Underframe', function: 'Dynamic braking energy dissipation', drawing: '942-58120' },
  { component: 'Current Sensor', designation: 'CT1-4', location: 'VVVF output', function: 'Traction current monitoring for feedback', drawing: '942-58120' },
  { component: 'Voltage Sensor', designation: 'VT1', location: 'VVVF DC link', function: 'DC link voltage monitoring', drawing: '942-58121' },
];

const TRAINLINE_REFERENCES = [
  { trainline: '3003', description: 'FORWARD - Forward command to VVVF', route: 'TCMS_RIO1 → X1 → X2 → V1' },
  { trainline: '3004', description: 'REVERSE - Reverse command to VVVF', route: 'TCMS_RIO1 → X1 → X2 → V1' },
  { trainline: '3005', description: 'POWERING_1 - Powering level 1 (crossed at X1-19)', route: 'TCMS_RIO1 → X1-19(crossed) → X2-19 → V1' },
  { trainline: '3006', description: 'POWERING_2 - Powering level 2 (crossed at X1-20)', route: 'TCMS_RIO1 → X1-20(crossed) → X2-20 → V1' },
  { trainline: '3010', description: 'BRAKE_CMD - Brake command to VVVF', route: 'TCMS_RIO1 → X1 → V1' },
  { trainline: '3011', description: 'FSB_CMD - Full service brake command', route: 'TCMS_RIO1 → X1 → V1' },
];

const DRAWINGS = [
  { drawingNo: '942-58119', title: 'Traction Motor Circuit', description: 'Traction motor power and control wiring' },
  { drawingNo: '942-58120', title: 'VVVF Control Circuit', description: 'VVVF inverter control and status signals' },
  { drawingNo: '942-58121', title: 'Traction Power Circuit', description: 'Main power and filtering circuit' },
  { drawingNo: '942-38306', title: 'MC Underframe Equipment Layout', description: 'Location of VVVF, line filter, braking resistor' },
];

export default function TRACPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = TRACTION_WIRING.filter(w => 
    !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Zap className="h-8 w-8 text-orange-400" />
          Traction & Propulsion System
        </h1>
        <p className="mt-2 text-slate-400">
          Complete VVVF inverter control, traction motor drive, and propulsion system wiring
        </p>
      </div>

      {/* Warning Banner */}
      <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">CRITICAL: X1 Pins 19/20 Cross-Connection</p>
            <p className="text-xs text-slate-400 mt-1">
              Trainline 3005 and 3006 are crossed at inter-car jumper X1 pins 19-20. This enables both DMC and TC to send powering commands to both MC cars' VVVF. Incorrect wiring will cause train creep or no propulsion.
            </p>
            <Link href="/trainlines/3005" className="mt-2 inline-block text-xs text-amber-300 hover:underline">View Cross-Connection Details →</Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring Connections', icon: Cable },
          { id: 'vvvf', label: 'VVVF Connectors', icon: Cpu },
          { id: 'components', label: 'Components', icon: Settings },
          { id: 'trainlines', label: 'Trainlines', icon: Zap },
          { id: 'drawings', label: 'Drawings', icon: FileText },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wiring Tab */}
      {activeTab === 'wiring' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search wire number or signal..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200" />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Wire #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Signal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Color</th>
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
                    <td className="px-4 py-3 text-white font-medium text-sm">{wire.signal}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm max-w-xs">{wire.description}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-300">{wire.from}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-300">{wire.to}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{wire.wireType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs ${
                        wire.color === 'Blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-black/50 text-slate-300'
                      }`}>{wire.color}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VVVF Connectors Tab */}
      {activeTab === 'vvvf' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VVVF_CONNECTIONS.map(conn => (
              <div key={conn.connector} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-lg font-bold text-cyan-400">{conn.connector}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    conn.type === 'Input' ? 'bg-blue-500/20 text-blue-400' :
                    conn.type === 'Output' ? 'bg-green-500/20 text-green-400' :
                    conn.type === 'Power' ? 'bg-amber-500/20 text-amber-400' :
                    conn.type === 'Analog' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>{conn.type}</span>
                </div>
                <div className="text-sm font-mono text-slate-400 mb-1">Pins: {conn.pins}</div>
                <div className="text-xs text-slate-500">{conn.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Components Tab */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          {TRACTION_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-orange-400">{comp.component}</span>
                    <span className="font-mono text-cyan-400">{comp.designation}</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{comp.function}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    <span className="font-medium">Location:</span> {comp.location}
                  </div>
                </div>
                <Link href={`/equipment/${comp.designation}`} className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                  View <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Drawing: <Link href={`/drawings/${comp.drawing}`} className="font-mono text-cyan-400">{comp.drawing}</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trainlines Tab */}
      {activeTab === 'trainlines' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Trainline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Route</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {TRAINLINE_REFERENCES.map(tl => (
                <tr key={tl.trainline} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <Link href={`/trainlines/${tl.trainline}`} className="font-mono font-bold text-cyan-400">
                      {tl.trainline}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{tl.description}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-400">{tl.route}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/trainlines/${tl.trainline}`} className="text-cyan-400 text-sm">Trace</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawings Tab */}
      {activeTab === 'drawings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DRAWINGS.map(dwg => (
            <Link key={dwg.drawingNo} href={`/drawings/${dwg.drawingNo}`} className="glass-card p-4 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-cyan-400">{dwg.drawingNo}</span>
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div className="text-white font-medium mt-2">{dwg.title}</div>
              <div className="text-xs text-slate-500 mt-1">{dwg.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}