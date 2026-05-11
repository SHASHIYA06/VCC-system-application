'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, ChevronDown, Search, Wrench, Zap, Shield, DoorOpen, Wind, Cpu } from 'lucide-react';

const TROUBLESHOOTING_GUIDES = [
  {
    id: 'door-no-open',
    title: 'Doors Will Not Open',
    category: 'Door',
    severity: 'high',
    icon: DoorOpen,
    symptoms: ['Left/right doors fail to respond to open command', 'Single door does not open', 'All doors stuck closed'],
    checkPoints: [
      { step: 1, title: 'Verify Zero Speed Signal', description: 'Check that train is stationary. Trainline 6112 (zero speed) must be active for door opening. Use multimeter at V1-CN2 pin 3 or TCMS_RIO1-U15-L3.', wire: '6112', expected: '0V when stopped, 110V when moving', normal: '0V at standstill' },
      { step: 2, title: 'Check TCMS Door Commands', description: 'Monitor TCMS_RIO1 outputs J7 (left open) and J8 (right open). These should pulse 110V when open button pressed.', wire: '6009', expected: '110V pulse on command', normal: '0V at rest' },
      { step: 3, title: 'Verify Cross-Jumpers 43-44', description: 'CRITICAL: 6009 and 6046 are crossed at jumper positions 43-44. Check continuity between jumpers 43-44 matches drawing. Wrong jumper = left/right swap or no operation.', wire: '6009', expected: 'Continuity to jumper 43', normal: 'See drawing 942-58137' },
      { step: 4, title: 'Check DCU1 Inputs', description: 'Verify DCU1-CN1 pins 3 (left) and 4 (right) receive 110V on open command. If no voltage, trace from TCMS_RIO1 through cross-jumpers.', wire: '6009', expected: '110V on open command', normal: '0V at rest' },
      { step: 5, title: 'Verify Door Proving Loops', description: 'Check door closed indication at TCMS_RIO1-H2/H3. If doors show already closed, proving loops may be stuck.', wire: '6073', expected: '0V when open, 110V when closed', normal: 'Varies by door state' },
    ],
    relatedDrawings: ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141'],
    relatedWires: ['6009', '6046', '6014', '6051', '6073', '6076', '6112'],
    relatedEquipment: ['TCMS_RIO1', 'DCU1'],
  },
  {
    id: 'traction-no-power',
    title: 'Train Will Not Move (No Propulsion)',
    category: 'Traction',
    severity: 'critical',
    icon: Zap,
    symptoms: ['Train completely dead on propulsion', 'No response to FWD/REV command', 'VVVF shows no activity'],
    checkPoints: [
      { step: 1, title: 'Verify HSCB Status', description: 'Check if High Speed Circuit Breaker is closed. Monitor trainline 1209 (HSCB trip) at TCMS_RIO1-H4.', wire: '1209', expected: '110V = closed, 0V = trip', normal: '110V when closed' },
      { step: 2, title: 'Check Powering Commands at TCMS', description: 'Verify TCMS_RIO1 outputs for 3005/3006 (powering) at CN1. Both should be present when master controller advanced.', wire: '3005', expected: '110V when powering', normal: '0V at idle' },
      { step: 3, title: 'CRITICAL: Check X1 Pins 19/20 Cross-Connection', description: 'Trainlines 3005 and 3006 are CROSSED at X1 pins 19/20. Use multimeter to verify: continuity from 3005 source to X1-pin20, and 3006 source to X1-pin19. Swap here causes train creep.', wire: '3005', expected: '3005→X1-20, 3006→X1-19', normal: 'SEE DRAWING 942-58119' },
      { step: 4, title: 'Verify VVVF Inputs', description: 'Check V1-CN1 pins 12-15 for FWD/REV/PWR1/PWR2 commands. If powering commands missing at VVVF but present at TCMS, cross-connection at X1 is likely broken.', wire: '3003', expected: '110V on respective command', normal: '0V at rest' },
      { step: 5, title: 'Check VVVF Fault', description: 'Monitor trainline 1207 (VVVF fault) at V1-CN2-5. If high, VVVF has internal fault.', wire: '1207', expected: '0V = no fault, 110V = fault active', normal: '0V' },
    ],
    relatedDrawings: ['942-58119', '942-58120', '942-38409'],
    relatedWires: ['3003', '3004', '3005', '3006', '1207', '1209', '6112'],
    relatedEquipment: ['V1', 'TCMS_RIO1', 'HSCB1', 'LTEB1'],
  },
  {
    id: 'brake-not-release',
    title: 'Brakes Will Not Release',
    category: 'Brake',
    severity: 'high',
    icon: Shield,
    symptoms: ['Train brakes applied and will not release', 'Parking brake stuck applied', 'Full service brake active'],
    checkPoints: [
      { step: 1, title: 'Check Powering Signal', description: 'Brakes release when trainline 3010 (brake command) goes low and powering is active. Verify at BCU1-CN1.', wire: '3010', expected: '0V for brake release', normal: '110V when brake applied' },
      { step: 2, title: 'Verify BCU/BECU Status', description: 'Check BCU1/BCU2 status indicators. BECU on TC car must see proper brake loop continuity.', wire: '4024', expected: 'Loop continuity through all cars', normal: 'End-to-end continuity' },
      { step: 3, title: 'Check Parking Brake Status', description: 'Monitor 4122 (PB applied) and 4153 (PB released) at TCMS_RIO1-K4/K5. Parking brake must be released for service.', wire: '4122', expected: '0V when applied, 110V when released', normal: 'See parking brake state' },
      { step: 4, title: 'Verify PBMV Operation', description: 'Check PBMV1-CN1-2/3 for parking brake valve. 110V on pin 2 = apply, pin 3 = release.', wire: '4122', expected: '110V on release command', normal: '0V when applied' },
      { step: 5, title: 'Check EM Brake Loops', description: 'EM brake loops 4062/4103 must have continuity. Any break applies emergency brake. Use low current continuity test to avoid triggering EBMV.', wire: '4062', expected: 'Continuity through all cars', normal: 'End-to-end <1 ohm' },
    ],
    relatedDrawings: ['942-58124', '942-58125', '942-58126', '942-58128', '942-58129'],
    relatedWires: ['3010', '4024', '4028', '4062', '4103', '4122', '4153'],
    relatedEquipment: ['BCU1', 'BCU2', 'BCU3', 'BECU1', 'PBMV1'],
  },
  {
    id: 'vac-no-cool',
    title: 'VAC/HVAC Not Working',
    category: 'VAC',
    severity: 'medium',
    icon: Wind,
    symptoms: ['No cooling or heating in saloon', 'Cab AC not functioning', 'VAC fault indicated'],
    checkPoints: [
      { step: 1, title: 'Check VAC Status Signal', description: 'Monitor trainline 7050 (VAC1 status) at TCMS_RIO1-F4. 110V = unit running, 0V = fault/off.', wire: '7050', expected: '110V when running', normal: 'Varies' },
      { step: 2, title: 'Check TCMS Command', description: 'VAC units receive commands via trainlines. Verify correct command wires to VAC1-CN1.', wire: '7050', expected: 'See VAC schematic', normal: '110V on demand' },
      { step: 3, title: 'Check Smoke Detection', description: 'Trainline 7070 triggers VAC shutdown on smoke detection. Verify smoke sensor status.', wire: '7070', expected: '0V = no smoke', normal: '0V normal' },
      { step: 4, title: 'Check 415V AC Supply', description: 'VAC units require 415V AC from APS. Check X3 jumper for 3-phase supply continuity.', wire: '5030', expected: '415V AC between phases', normal: '415V nominal' },
      { step: 5, title: 'Check Cab VAC Fault', description: 'Cab VAC fault shown on trainline 7001 at TCMS_RIO2-F2.', wire: '7001', expected: '0V = no fault', normal: '0V normal' },
    ],
    relatedDrawings: ['942-58143', '942-58144', '942-58145'],
    relatedWires: ['7050', '7060', '7070', '7001', '5030', '5031'],
    relatedEquipment: ['VAC1', 'VAC2', 'CAB_VAC1', 'APS1'],
  },
  {
    id: 'tcms-no-comm',
    title: 'TCMS Communication Loss',
    category: 'TCMS',
    severity: 'critical',
    icon: Cpu,
    symptoms: ['TCMS shows equipment offline', 'Cannot send commands to subsystem', 'Status updates missing'],
    checkPoints: [
      { step: 1, title: 'Check RIO Power Supply', description: 'Verify TCMS_RIO1/2 has 110V DC power. Check power input at RIO connector.', wire: '1040', expected: '110V DC present', normal: '110V DC nominal' },
      { step: 2, title: 'Verify Trainline Inputs', description: 'Check that essential trainlines are reaching RIO. Use oscilloscope for signal integrity.', wire: '3003', expected: 'Clean 110V pulses', normal: 'Stable signal' },
      { step: 3, title: 'Check Ethernet Connection', description: 'TCMS RIO communicates via ethernet to TMS CPU. Verify link lights and cable continuity.', wire: 'N/A', expected: 'Link lights active', normal: 'Green link light' },
      { step: 4, title: 'Verify Digital Output Status', description: 'Use TCMS diagnostic to check DO output states. No voltage = output failure or command not received.', wire: '6009', expected: '110V on command', normal: '0V idle' },
      { step: 5, title: 'Check Cross-Jumper Integrity', description: 'X1/X2 jumpers carry trainline signals between cars. Continuity failure on X1 means no cross-car trainlines.', wire: '4024', expected: 'Continuity through all cars', normal: 'Loop continuity' },
    ],
    relatedDrawings: ['942-58146'],
    relatedWires: ['1032', '1040', '3003', '4024'],
    relatedEquipment: ['TCMS_RIO1', 'TCMS_RIO2'],
  },
  {
    id: 'battery-low',
    title: 'Battery Under-Voltage',
    category: 'APS',
    severity: 'high',
    icon: AlertTriangle,
    symptoms: ['Battery under-voltage warning', 'TCMS alarm active', 'Low voltage on 110V bus'],
    checkPoints: [
      { step: 1, title: 'Check Battery Voltage', description: 'Measure battery voltage at BATT1 terminals. Below 91V triggers under-voltage. Below 77V causes emergency shutdown.', wire: '5064', expected: '>91V for normal, >77V minimum', normal: '110V nominal' },
      { step: 2, title: 'Verify APS Charging', description: 'Check SIV contactors 5030/5031 status. APS should maintain battery when main power available.', wire: '5030', expected: 'SIV contactor closed when APS running', normal: 'Closed during operation' },
      { step: 3, title: 'Check Battery Connection', description: 'Verify BATT1-CN1 connections and battery fuse. High resistance causes under-voltage.', wire: '5064', expected: 'Direct connection', normal: 'Low resistance' },
      { step: 4, title: 'Check APS Fault', description: 'Trainline 1215 indicates APS fault. If active, APS cannot charge battery.', wire: '1215', expected: '0V = no fault', normal: '0V' },
      { step: 5, title: 'Verify Shore Supply', description: 'Shore supply (5000) provides external charging. If train parked long-term, shore supply may be needed.', wire: '5000', expected: 'Shore supply command available', normal: 'Optional when parked' },
    ],
    relatedDrawings: ['942-58130', '942-58131', '942-58132'],
    relatedWires: ['5064', '5030', '5031', '1215', '5000', '1040'],
    relatedEquipment: ['BATT1', 'APS1', 'SSB1'],
  },
];

const SEVERITY_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Critical' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'High' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Medium' },
};

export default function TroubleshootingPage() {
  const [search, setSearch] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const filtered = TROUBLESHOOTING_GUIDES.filter(g =>
    search === '' ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase()) ||
    g.symptoms.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    g.relatedWires.some(w => w.includes(search)) ||
    g.relatedEquipment.some(e => e.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = TROUBLESHOOTING_GUIDES.find(g => g.id === selectedGuide);
  const sevConfig = selected ? SEVERITY_COLORS[selected.severity] || SEVERITY_COLORS.high : null;

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Troubleshooting Guide</h1>
        <p className="mt-2 text-slate-400">
          Step-by-step fault diagnosis procedures for VCC systems
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{TROUBLESHOOTING_GUIDES.length} fault guides</span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-400" /> {TROUBLESHOOTING_GUIDES.filter(g => g.severity === 'critical').length} critical
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Guide List */}
        <div className="w-96 flex-shrink-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search symptoms, wires, equipment..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
          </div>

          {/* Warning */}
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">
                <strong>Safety:</strong> Always verify HV isolation before working on high tension circuits. Use proper PPE.
              </p>
            </div>
          </div>

          {/* Guide Cards */}
          <div className="space-y-3">
            {filtered.map(guide => {
              const Icon = guide.icon;
              const sev = SEVERITY_COLORS[guide.severity];
              const isSelected = selectedGuide === guide.id;

              return (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(isSelected ? null : guide.id)}
                  className={`glass-card p-4 cursor-pointer transition-all ${isSelected ? 'border-cyan-500/50' : 'hover:border-slate-600/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${sev.bg}`}>
                      <Icon className={`h-5 w-5 ${sev.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold truncate">{guide.title}</h3>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${sev.color} ${sev.bg}`}>
                          {sev.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{guide.category}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {guide.symptoms[0]}
                      </p>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guide Detail */}
        <div className="flex-1">
          {selected ? (
            <div className="glass-card overflow-hidden">
              {/* Header */}
              <div className={`px-6 py-4 border-b border-slate-700/50 ${sevConfig?.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${sevConfig?.bg}`}>
                      {(() => { const Icon = selected.icon; return <Icon className={`h-6 w-6 ${sevConfig?.color}`} />; })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${sevConfig?.color} ${sevConfig?.bg}`}>
                          {sevConfig?.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{selected.category} System</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="px-6 py-5 border-b border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Symptoms</h3>
                <ul className="space-y-2">
                  {selected.symptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <ChevronRight className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Check Points */}
              <div className="px-6 py-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Diagnostic Steps ({selected.checkPoints.length} steps)
                </h3>
                <div className="space-y-3">
                  {selected.checkPoints.map(cp => (
                    <div key={cp.step} className="rounded-lg border border-slate-700/50 overflow-hidden">
                      <div
                        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
                        onClick={() => setExpandedStep(expandedStep === cp.step ? null : cp.step)}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm">
                          {cp.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{cp.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cp.description}</p>
                        </div>
                        {cp.wire !== 'N/A' && (
                          <Link href={`/wires/${cp.wire}`}
                            className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20">
                            {cp.wire}
                          </Link>
                        )}
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedStep === cp.step ? 'rotate-180' : ''}`} />
                      </div>
                      {expandedStep === cp.step && (
                        <div className="px-4 py-4 border-t border-slate-700/50 bg-slate-800/30">
                          <p className="text-sm text-slate-300 leading-relaxed">{cp.description}</p>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                              <div className="text-xs text-slate-500">Expected Value</div>
                              <div className="text-sm text-cyan-400 font-medium mt-1">{cp.expected}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                              <div className="text-xs text-slate-500">Normal Condition</div>
                              <div className="text-sm text-emerald-400 font-medium mt-1">{cp.normal}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related */}
              <div className="px-6 py-5 border-t border-slate-700/50 grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Related Drawings</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.relatedDrawings.map(d => (
                      <Link key={d} href={`/drawings/${d}`}
                        className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-mono hover:bg-purple-500/20">
                        {d}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Related Equipment</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.relatedEquipment.map(eq => (
                      <Link key={eq} href={`/equipment/${eq}`}
                        className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 text-xs font-mono hover:bg-slate-600/50">
                        {eq}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Wrench className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">Select a Troubleshooting Guide</h3>
              <p className="text-sm text-slate-500 mt-2">
                Click on a fault symptom on the left to view diagnostic steps, check points, and related references.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}