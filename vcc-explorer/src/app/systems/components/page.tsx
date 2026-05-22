'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, Search, Zap, Settings, Gauge, FileText, AlertTriangle } from 'lucide-react';

const ELECTRONIC_COMPONENTS = [
  { type: 'Diode', designation: 'D1-D24', location: 'Various', function: 'Reverse current protection, rectification', applications: ['VVVF input protection', 'Relay flyback protection', 'Battery charging'] },
  { type: 'Resistor', designation: 'R1-R56', location: 'Various', function: 'Current limiting, voltage division', applications: ['LED current limit', 'Pull-up/down', 'Snubber circuits'] },
  { type: 'Relay', designation: 'K1-K48', location: 'Relay Panel', function: 'Electrical isolation, switching', applications: ['Horn control', 'Compressor control', 'Door supply'] },
  { type: 'Contactor', designation: 'C1-C12', location: 'Power Panel', function: 'High current switching', applications: ['SIV contactors', 'Shore supply', 'APS output'] },
  { type: 'Fuse', designation: 'F1-F32', location: 'Fuse Panel', function: 'Overcurrent protection', applications: ['110V DC bus', '24V circuits', 'Motor circuits'] },
  { type: 'Circuit Breaker', designation: 'CB1-CB16', location: 'MCB Panel', function: 'Resettable protection', applications: ['Branch circuits', 'System isolation'] },
  { type: 'Transistor', designation: 'Q1-Q24', location: 'Control Boards', function: 'Switching, amplification', applications: ['Driver outputs', 'Sensor interfaces'] },
  { type: 'Capacitor', designation: 'C1-C48', location: 'Filter Boards', function: 'Filtering, energy storage', applications: ['DC link filter', 'Snubber', 'Power supply filter'] },
  { type: 'LED', designation: 'LED1-LED96', location: 'Panels', function: 'Status indication', applications: ['System status', 'Fault indicators', 'Display segments'] },
  { type: 'Optocoupler', designation: 'OP1-OP32', location: 'Control Boards', function: 'Galvanic isolation', applications: ['Input isolation', 'Output isolation'] },
  { type: 'Voltage Regulator', designation: 'VR1-VR8', location: 'Power Supplies', function: 'Voltage stabilization', applications: ['24V supply', '12V supply', '5V supply'] },
  { type: 'Current Sensor', designation: 'CT1-CT16', location: 'Power Panels', function: 'Current measurement', applications: ['Traction current', 'APS output', 'Battery current'] },
];

const WIRING_PROTECTION = [
  { component: 'Diode Matrix', location: 'TCMS RIO Output', description: 'Flyback diodes across all relay coils', wireNos: 'Use relay contacts' },
  { component: 'Snubber Circuit', location: 'Contactor Coils', description: 'RC network for contactor suppression', wireNos: '470Ω + 0.1µF' },
  { component: 'TVS Diode', location: 'Sensor Inputs', description: 'Transient voltage suppression', wireNos: '24V sensor lines' },
  { component: 'Filter Capacitor', location: 'Power Inputs', description: 'Bulk + ceramic filtering', wireNos: '1000µF + 0.1µF' },
];

const DIODE_DETAILS = [
  { diode: 'D1', circuit: 'VVVF Input', function: 'Reverse polarity protection', specs: '3A, 1000V' },
  { diode: 'D2', circuit: 'Horn Relay', function: 'Flyback protection', specs: '1A, 600V' },
  { diode: 'D3', circuit: 'Door Supply', function: 'Reverse current block', specs: '5A, 200V' },
  { diode: 'D4', circuit: 'Battery Charger', function: 'Charging isolation', specs: '10A, 200V' },
  { diode: 'D5', circuit: 'SIV Output', function: 'Blocking diode', specs: '20A, 200V' },
  { diode: 'D6', circuit: 'TCMS Power', function: 'OR logic for dual supply', specs: '3A, 100V' },
];

const RELAY_DETAILS = [
  { relay: 'K1', function: 'Horn Command', location: 'Relay Panel 1', coil: '24V DC', contacts: '2A @ 110V' },
  { relay: 'K2', function: 'Compressor Run', location: 'Relay Panel 1', coil: '24V DC', contacts: '10A @ 110V' },
  { relay: 'K3', function: 'Door Supply A', location: 'Relay Panel 2', coil: '24V DC', contacts: '20A @ 110V' },
  { relay: 'K4', function: 'Door Supply B', location: 'Relay Panel 2', coil: '24V DC', contacts: '20A @ 110V' },
  { relay: 'K5', function: 'Headlight Left', location: 'Relay Panel 1', coil: '24V DC', contacts: '5A @ 110V' },
  { relay: 'K6', function: 'Headlight Right', location: 'Relay Panel 1', coil: '24V DC', contacts: '5A @ 110V' },
  { relay: 'K7', function: 'Backup Light', location: 'Relay Panel 1', coil: '24V DC', contacts: '5A @ 110V' },
  { relay: 'K8', function: 'Wiper Motor', location: 'Relay Panel 1', coil: '24V DC', contacts: '3A @ 110V' },
];

export default function ComponentsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('components');

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Cpu className="h-8 w-8 text-cyan-400" />
          Electronic Components
        </h1>
        <p className="mt-2 text-slate-400">
          Diodes, resistors, relays, contactors, fuses, and protection circuits
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'components', label: 'Component Types', icon: Cpu },
          { id: 'protection', label: 'Protection Circuits', icon: AlertTriangle },
          { id: 'diodes', label: 'Diode Details', icon: Zap },
          { id: 'relays', label: 'Relay Details', icon: Settings },
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

      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ELECTRONIC_COMPONENTS.map(comp => (
            <div key={comp.type} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <span className="text-lg font-bold text-white">{comp.type}</span>
              </div>
              <div className="font-mono text-sm text-cyan-400 mb-2">{comp.designation}</div>
              <div className="text-xs text-slate-400 mb-2">{comp.function}</div>
              <div className="text-xs text-slate-500">
                <span className="font-medium">Location:</span> {comp.location}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {comp.applications.map(app => (
                  <span key={app} className="px-1 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400">{app}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'protection' && (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Wiring Protection Circuits
            </h3>
            <div className="space-y-4">
              {WIRING_PROTECTION.map(pc => (
                <div key={pc.component} className="p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{pc.component}</span>
                    <span className="text-xs text-slate-400">{pc.location}</span>
                  </div>
                  <div className="text-sm text-slate-400">{pc.description}</div>
                  <div className="text-xs text-cyan-400 mt-1 font-mono">{pc.wireNos}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'diodes' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Diode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Circuit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Function</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {DIODE_DETAILS.map(d => (
                <tr key={d.diode} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">{d.diode}</td>
                  <td className="px-4 py-3 text-white">{d.circuit}</td>
                  <td className="px-4 py-3 text-slate-400">{d.function}</td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{d.specs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'relays' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Relay</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Function</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Coil</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Contacts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {RELAY_DETAILS.map(r => (
                <tr key={r.relay} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">{r.relay}</td>
                  <td className="px-4 py-3 text-white">{r.function}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{r.location}</td>
                  <td className="px-4 py-3 font-mono text-xs text-green-400">{r.coil}</td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{r.contacts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}