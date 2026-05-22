'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Search, AlertTriangle, Cpu, Cable, FileText, Settings, Gauge } from 'lucide-react';

const BRAKE_WIRING = [
  { wireNo: '4024', signal: 'BRAKE_LOOP_N', description: 'Brake loop normal path - all cars', from: 'BCU1-X1-24', to: 'EBSS-X1-24', wireType: '2.5mm²', color: 'Red', voltage: '110VDC', loop: 'Normal' },
  { wireNo: '4028', signal: 'BRAKE_LOOP_R', description: 'Brake loop return path', from: 'EBSS-X1-24', to: 'BCU1-X1-24', wireType: '2.5mm²', color: 'Black', voltage: '110VDC', loop: 'Return' },
  { wireNo: '4062', signal: 'EM_BRAKE_N', description: 'Emergency brake loop normal - all cars', from: 'EBMV-X1-42', to: 'EBSS-X1-42', wireType: '2.5mm²', color: 'Red', voltage: '110VDC', loop: 'EM Normal' },
  { wireNo: '4070', signal: 'EM_BRAKE_N_RTN', description: 'Emergency brake loop normal return', from: 'EBSS-X1-42', to: 'EBMV-X1-42', wireType: '2.5mm²', color: 'Black', voltage: '110VDC', loop: 'EM Return' },
  { wireNo: '4103', signal: 'EM_BRAKE_R', description: 'Emergency brake loop redundant - failsafe', from: 'EBMV-X1-44', to: 'EBSS-X1-44', wireType: '2.5mm²', color: 'Red', voltage: '110VDC', loop: 'EM Redundant' },
  { wireNo: '4110', signal: 'EM_BRAKE_R_RTN', description: 'Emergency brake loop redundant return', from: 'EBSS-X1-44', to: 'EBMV-X1-44', wireType: '2.5mm²', color: 'Black', voltage: '110VDC', loop: 'EM Redundant Return' },
  { wireNo: '4122', signal: 'PB_APPLIED', description: 'Parking brake applied indication', from: 'TCMS_RIO1-U15-K4', to: 'PBMV1-CN1-2', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '4153', signal: 'PB_RELEASED', description: 'Parking brake released indication', from: 'TCMS_RIO1-U15-K5', to: 'PBMV1-CN1-3', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '4201', signal: 'BRAKE_PRESSURE_1', description: 'Brake cylinder pressure sensor 1', from: 'BCU1-CN1-5', to: 'TCMS_RIO1-U15-E1', wireType: '1.5mm²', color: 'Blue', voltage: '24VDC', analog: true },
  { wireNo: '4202', signal: 'BRAKE_PRESSURE_2', description: 'Brake cylinder pressure sensor 2', from: 'BCU1-CN1-6', to: 'TCMS_RIO1-U15-E2', wireType: '1.5mm²', color: 'Blue', voltage: '24VDC', analog: true },
  { wireNo: '4205', signal: 'BCU_FAULT', description: 'Brake Control Unit fault output', from: 'BCU1-CN2-1', to: 'TCMS_RIO1-U15-F1', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '4210', signal: 'COMPRESSOR_RUN', description: 'Air compressor running status', from: 'COMP1-CN1-3', to: 'TCMS_RIO1-U15-G1', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '4215', signal: 'LOW_PRESSURE', description: 'Low air pressure warning', from: 'LR1-CN1-2', to: 'TCMS_RIO1-U15-G2', wireType: '1.5mm²', color: 'Blue', voltage: '110VDC' },
  { wireNo: '4220', signal: 'HORN_CMD', description: 'Horn command from cab', from: 'OP_PNL1-CN3-1', to: 'HORN_RELAY-CN1-1', wireType: '2.5mm²', color: 'Red', voltage: '110VDC' },
];

const BRAKE_COMPONENTS = [
  { component: 'Brake Control Unit', designation: 'BCU1', location: 'DMC/TC Underframe', function: 'Electronic brake control, brake demand calculation', drawing: '942-58123', ports: 'CN1: I/O, CN2: Fault, CN3: Pressure sensors' },
  { component: 'Brake Electronic Unit', designation: 'BECU1', location: 'MC Underframe', function: 'Brake actuator electronic control', drawing: '942-58125', ports: 'CN1: Motor, CN2: Position sensor' },
  { component: 'Emergency Brake Valve', designation: 'EBMV', location: 'Each Car', function: 'Emergency brake application on trainline', drawing: '942-58124', ports: 'X1: Trainline, CN1: Local control' },
  { component: 'Emergency Brake Solenoid', designation: 'EBSS', location: 'Each Car', function: 'Solenoid valve for EM brake release', drawing: '942-58124', ports: 'X1: Trainline, CN1: Solenoid coil' },
  { component: 'Parking Brake Valve', designation: 'PBMV1', location: 'Each Car', function: 'Parking brake application/release', drawing: '942-58126', ports: 'CN1: TCMS interface, CN2: Pneumatic output' },
  { component: 'Air Compressor', designation: 'COMP1', location: 'TC Car Underframe', function: 'Main air supply for brake system', drawing: '942-58123', ports: 'CN1: Motor, CN2: Pressure switch' },
  { component: 'Low Pressure Relay', designation: 'LR1', location: 'TC Car', function: 'Low air pressure detection', drawing: '942-58123', ports: 'CN1: Pressure sensor, CN2: Relay output' },
  { component: 'Pressure Sensor', designation: 'PS1-4', location: 'Each Car', function: 'Brake cylinder pressure monitoring', drawing: '942-58125', ports: 'Analog output 4-20mA' },
];

const BRAKE_PNEUMATICS = [
  { component: 'Main Reservoir', location: 'TC Underframe', capacity: '100L', function: 'Compressed air storage' },
  { component: 'Auxiliary Reservoir', location: 'Each Car Underframe', capacity: '20L', function: 'Brake cylinder supply' },
  { component: 'Brake Cylinder', location: 'Each Wheel', capacity: '5L', function: 'Apply brake pressure to disc' },
  { component: 'Quick Release Valve', location: 'Each Car', function: 'Release brake quickly on demand' },
  { component: 'Check Valve', location: 'Distribution pipe', function: 'One-way air flow' },
  { component: 'Pressure Reducing Valve', location: 'Each Car', function: 'Reduce pressure to working level' },
  { component: 'Safety Valve', location: 'Main reservoir', function: 'Overpressure protection' },
];

const TRAINLINE_REFERENCES = [
  { trainline: '4024', description: 'BRAKE_LOOP_N - Normal brake loop through all cars', route: 'BCU1 → X1 → BCU2 → X2 → BCU3 → X3 → BCU4 → X4' },
  { trainline: '4062', description: 'EM_BRAKE_N - Emergency brake normal loop', route: 'EBMV → X1 → EBSS → X2 → EBMV2 → X3 → EBSS2' },
  { trainline: '4103', description: 'EM_BRAKE_R - Emergency brake redundant loop (failsafe)', route: 'EBMV → X1 → EBSS → X2 → EBMV2 (parallel)' },
  { trainline: '4122', description: 'PB_APPLIED - Parking brake applied status', route: 'TCMS_RIO1 → PBMV1 feedback' },
];

const DRAWINGS = [
  { drawingNo: '942-58123', title: 'Brake Control Circuit', description: 'BCU control and compressor control' },
  { drawingNo: '942-58124', title: 'Emergency Brake Circuit', description: 'Emergency brake valve and EM loop' },
  { drawingNo: '942-58125', title: 'Brake Electronics', description: 'BECU and pressure sensor wiring' },
  { drawingNo: '942-58126', title: 'Parking Brake Circuit', description: 'Parking brake valve control' },
  { drawingNo: '942-58127', title: 'Brake Pneumatic Circuit', description: 'Air piping and reservoirs' },
];

export default function BRAKEPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = BRAKE_WIRING.filter(w => 
    !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-red-400" />
          Brake System
        </h1>
        <p className="mt-2 text-slate-400">
          Complete brake control, emergency brake loops, parking brake, and pneumatics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring', icon: Cable },
          { id: 'electronics', label: 'Brake Electronics', icon: Cpu },
          { id: 'pneumatics', label: 'Pneumatics', icon: Gauge },
          { id: 'components', label: 'Components', icon: Settings },
          { id: 'trainlines', label: 'Trainlines', icon: ShieldCheck },
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
            <input type="text" placeholder="Search..."
              value={search} onChange={(e) => setSearch(e.target.value)}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Loop</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Size</th>
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
                      {wire.loop && <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">{wire.loop}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{wire.wireType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'electronics' && (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Brake Electronics Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-white">BCU (Brake Control Unit)</span>
                  <span className="text-slate-400 text-sm">- Master controller</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-white">BECU (Brake Electronic Unit)</span>
                  <span className="text-slate-400 text-sm">- Actuator control</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white">Pressure Sensors</span>
                  <span className="text-slate-400 text-sm">- 4-20mA feedback</span>
                </div>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Control Flow:</h4>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div>TCMS → BCU: Brake demand</div>
                  <div>BCU → BECU: Actuator command</div>
                  <div>BECU → BCU: Position feedback</div>
                  <div>BCU → TCMS: Status/Fault</div>
                  <div>Pressure sensors → BCU: Analog input</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pneumatics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRAKE_PNEUMATICS.map(item => (
            <div key={item.component} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold text-white">{item.component}</span>
              </div>
              <div className="text-sm text-slate-400 mb-1">{item.location}</div>
              {item.capacity && <div className="text-xs text-cyan-400">Capacity: {item.capacity}</div>}
              <div className="text-xs text-slate-500 mt-1">{item.function}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'components' && (
        <div className="space-y-4">
          {BRAKE_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-400">{comp.component}</span>
                    <span className="font-mono text-cyan-400">{comp.designation}</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{comp.function}</div>
                  <div className="text-xs text-slate-500 mt-2">{comp.ports}</div>
                </div>
                <Link href={`/equipment/${comp.designation}`} className="text-cyan-400 text-sm">View →</Link>
              </div>
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