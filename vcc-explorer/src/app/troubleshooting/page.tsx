'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, Search, ChevronRight, Wrench, 
  Zap, Shield, DoorOpen, Wind, Battery, Cpu, Info
} from 'lucide-react';

interface FaultCode {
  code: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  system: string;
  trainlines: string[];
  symptoms: string[];
  causes: string[];
  solutions: string[];
  drawings: string[];
}

const TROUBLESHOOTING_GUIDES = [
  {
    id: 'propulsion',
    title: 'Traction & Propulsion Faults',
    icon: Zap,
    color: 'text-orange-400',
    issues: [
      {
        code: 'VVVF_FAULT',
        description: 'VVVF Inverter Fault',
        severity: 'critical' as const,
        system: 'TRAC',
        trainlines: ['1207'],
        symptoms: [
          'Train fails to accelerate',
          'VVVF fault indicator lit',
          'HSCB may trip',
        ],
        causes: [
          'Overcurrent condition in VVVF',
          'Motor overload or short circuit',
          'Cooling system failure',
          'Internal VVVF protection trip',
        ],
        solutions: [
          'Check trainline 1207 for fault signal',
          'Verify VVVF CN2 connections',
          'Check motor insulation',
          'Monitor cooling system status',
          'Reset VVVF using trainline 1032',
        ],
        drawings: ['942-58120', '942-58121'],
      },
      {
        code: 'HSCB_TRIP',
        description: 'High Speed Circuit Breaker Trip',
        severity: 'critical' as const,
        system: 'HV',
        trainlines: ['1209'],
        symptoms: [
          'Traction power lost',
          'HSCB indicator shows trip',
          'Train coasts to stop',
        ],
        causes: [
          'Overcurrent on traction circuit',
          'Ground fault detection',
          'VVVF fault causing trip',
          'Protective relay operation',
        ],
        solutions: [
          'Check trainline 1209 status',
          'Verify HSCB CN1 connections',
          'Check for ground faults',
          'Check VVVF fault status',
          'Reset HSCB after fault clearance',
        ],
        drawings: ['942-38103', '942-58106'],
      },
    ],
  },
  {
    id: 'brake',
    title: 'Brake System Faults',
    icon: Shield,
    color: 'text-red-400',
    issues: [
      {
        code: 'EM_BRAKE_FAULT',
        description: 'Emergency Brake Application Fault',
        severity: 'critical' as const,
        system: 'BRAKE',
        trainlines: ['4062', '4103'],
        symptoms: [
          'Emergency brake stuck on',
          'Brake cannot be released',
          'Train cannot move',
        ],
        causes: [
          'Break in emergency brake loop (4062)',
          'EBMV or EBSS failure',
          'Wiring fault in redundant path (4103)',
        ],
        solutions: [
          'Check trainline 4062 continuity',
          'Check trainline 4103 redundant path',
          'Verify BCU/EBCU connections',
          'Check all car-to-car jumpers',
        ],
        drawings: ['942-58125', '942-58128'],
      },
      {
        code: 'PARKING_BRAKE',
        description: 'Parking Brake Fault',
        severity: 'warning' as const,
        system: 'BRAKE',
        trainlines: ['4122', '4153'],
        symptoms: [
          'Parking brake not applying',
          'Parking brake not releasing',
          'Brake indicator flashing',
        ],
        causes: [
          'PBMV (Parking Brake Magnetic Valve) fault',
          'Air pressure insufficient',
          'Wiring issue to PBMV1',
        ],
        solutions: [
          'Check trainline 4122 (applied)',
          'Check trainline 4153 (released)',
          'Verify PBMV1 connections',
          'Check air pressure',
        ],
        drawings: ['942-58126'],
      },
    ],
  },
  {
    id: 'door',
    title: 'Door System Faults',
    icon: DoorOpen,
    color: 'text-amber-400',
    issues: [
      {
        code: 'DOOR_FAULT',
        description: 'Door System Fault',
        severity: 'warning' as const,
        system: 'DOOR',
        trainlines: ['6073', '6076', '6112'],
        symptoms: [
          'Door not opening/closing',
          'Door proving failure',
          'Door safety loop open',
        ],
        causes: [
          'Door proving circuit open (6073, 6076)',
          'Zero speed signal issue (6112)',
          'DCU internal fault',
          'Door motor failure',
        ],
        solutions: [
          'Check door proving status (6073, 6076)',
          'Verify zero speed signal (6112)',
          'Check DCU1 connections',
          'Verify door edge sensors',
          'Check door motor operation',
        ],
        drawings: ['942-58137', '942-58138', '942-58139', '942-58140'],
      },
      {
        code: 'DOOR_CROSS_FAULT',
        description: 'Door Cross Connection Fault',
        severity: 'warning' as const,
        system: 'DOOR',
        trainlines: ['6009', '6014', '6046', '6051'],
        symptoms: [
          'Left and right doors operating together',
          'Crossed wire condition',
        ],
        causes: [
          'Crossed connections at jumpers 43-44',
          'Crossed connections at jumpers 46-47',
          'Wire mix-up in trainline routing',
        ],
        solutions: [
          'Check jumper 43-44 for 6009/6046 cross',
          'Check jumper 46-47 for 6014/6051 cross',
          'Verify TCMS_RIO1 CN17 connections',
          'Trace wire routing through X1',
        ],
        drawings: ['942-58138', '942-58139'],
      },
    ],
  },
  {
    id: 'vac',
    title: 'VAC/HVAC Faults',
    icon: Wind,
    color: 'text-cyan-400',
    issues: [
      {
        code: 'CAB_VAC_FAULT',
        description: 'Cab VAC Fault',
        severity: 'warning' as const,
        system: 'VAC',
        trainlines: ['7001'],
        symptoms: [
          'Cab air conditioning not working',
          'Cab VAC fault indicator',
          'Temperature not controlled',
        ],
        causes: [
          'CAB_VAC1 unit fault',
          'Power supply issue to VAC',
          'Communication fault with TCMS',
        ],
        solutions: [
          'Check trainline 7001 for fault signal',
          'Verify CAB_VAC1 CN1 connections',
          'Check power supply to cab VAC',
          'Reset using TCMS interface',
        ],
        drawings: ['942-58143'],
      },
      {
        code: 'SALOON_VAC_FAULT',
        description: 'Saloon VAC Fault',
        severity: 'warning' as const,
        system: 'VAC',
        trainlines: ['7050', '7060', '7070'],
        symptoms: [
          'Saloon not cooling',
          'VAC status shows fault',
          'Smoke detection alarm',
        ],
        causes: [
          'VAC1 or VAC2 unit fault',
          'Power supply issue (415V from APS)',
          'Smoke detection triggered',
          'Dampers not operating',
        ],
        solutions: [
          'Check trainline 7050 (VAC1 status)',
          'Check trainline 7060 (VAC2 status)',
          'Check trainline 7070 (smoke detection)',
          'Verify APS 415V supply via X3',
          'Check damper operation (7071)',
        ],
        drawings: ['942-58144', '942-58145'],
      },
    ],
  },
  {
    id: 'aps',
    title: 'Auxiliary Power Faults',
    icon: Battery,
    color: 'text-green-400',
    issues: [
      {
        code: 'AUX_FAULT',
        description: 'Auxiliary System Fault',
        severity: 'warning' as const,
        system: 'APS',
        trainlines: ['1215'],
        symptoms: [
          'Auxiliary power not available',
          'SIV contact not closing',
          'Battery not charging',
        ],
        causes: [
          'APS1 internal fault',
          'SIV (Static Inverter) failure',
          'Battery charger fault',
        ],
        solutions: [
          'Check trainline 1215 for fault signal',
          'Verify SIV contact status (5030, 5031)',
          'Check battery voltage (5064)',
          'Verify APS1 connections',
        ],
        drawings: ['942-58130', '942-58131', '942-58132'],
      },
      {
        code: 'BATTERY_FAULT',
        description: 'Battery Under Voltage',
        severity: 'warning' as const,
        system: 'APS',
        trainlines: ['5064'],
        symptoms: [
          'Low battery voltage warning',
          'Battery discharge indicator',
          'Emergency lighting may activate',
        ],
        causes: [
          'Battery discharged',
          'Battery failing',
          'APS not charging battery',
          'Excessive load on battery',
        ],
        solutions: [
          'Check trainline 5064 battery voltage',
          'Verify BATT1 connections',
          'Check APS charging function',
          'Connect shore supply for charging',
        ],
        drawings: ['942-58132'],
      },
    ],
  },
  {
    id: 'tcms',
    title: 'TCMS Faults',
    icon: Cpu,
    color: 'text-purple-400',
    issues: [
      {
        code: 'TCMS_FAULT',
        description: 'TCMS Communication Fault',
        severity: 'warning' as const,
        system: 'TMS',
        trainlines: [],
        symptoms: [
          'TCMS not responding',
          'Loss of monitoring data',
          'Multiple system faults shown',
        ],
        causes: [
          'TCMS_RIO failure',
          'Ethernet network issue',
          'Power supply to RIO',
        ],
        solutions: [
          'Check TCMS_RIO1 (U15) status',
          'Check TCMS_RIO2 (U25) status',
          'Verify Ethernet switch connections',
          'Check power supply to RIO units',
        ],
        drawings: ['942-58146'],
      },
    ],
  },
];

const SEVERITY_STYLES = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function TroubleshootingPage() {
  const [selectedGuide, setSelectedGuide] = useState<string | null>('propulsion');
  const [searchTerm, setSearchTerm] = useState('');

  const activeGuide = TROUBLESHOOTING_GUIDES.find(g => g.id === selectedGuide);

  const filteredIssues = activeGuide?.issues.filter(issue => 
    searchTerm === '' || 
    issue.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.trainlines.some(tl => tl.includes(searchTerm))
  ) || [];

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC Troubleshooting Guide</h1>
        <p className="mt-2 text-slate-400">
          Fault diagnosis and resolution for Vehicle Control Circuits - KMRCL RS(3R) Project
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search fault codes, trainlines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Guide List */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">System Guides</h2>
          {TROUBLESHOOTING_GUIDES.map(guide => (
            <button
              key={guide.id}
              onClick={() => setSelectedGuide(guide.id)}
              className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-all ${
                selectedGuide === guide.id
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
              }`}
            >
              <guide.icon className={`h-5 w-5 ${guide.color}`} />
              <span className="text-sm font-medium text-white">{guide.title}</span>
            </button>
          ))}
        </div>

        {/* Fault Details */}
        <div className="lg:col-span-3 space-y-4">
          {filteredIssues.map((issue, idx) => (
            <div key={idx} className="glass-card p-5 border border-slate-700/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{issue.description}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${SEVERITY_STYLES[issue.severity]}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-slate-400">Code: {issue.code}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sm text-slate-400">System: {issue.system}</span>
                  </div>
                </div>
                <AlertTriangle className={`h-6 w-6 ${
                  issue.severity === 'critical' ? 'text-red-400' :
                  issue.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                }`} />
              </div>

              {issue.trainlines.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-slate-500">Related Trainlines:</span>
                  <div className="flex gap-2 mt-1">
                    {issue.trainlines.map(tl => (
                      <Link key={tl} href={`/trainlines/${tl}`} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-sm font-mono hover:bg-cyan-500/20">
                        {tl}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/30 p-3 rounded">
                  <h4 className="font-medium text-slate-300 mb-2">Symptoms</h4>
                  <ul className="space-y-1">
                    {issue.symptoms.map((s, i) => (
                      <li key={i} className="text-slate-400">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800/30 p-3 rounded">
                  <h4 className="font-medium text-slate-300 mb-2">Possible Causes</h4>
                  <ul className="space-y-1">
                    {issue.causes.map((c, i) => (
                      <li key={i} className="text-slate-400">• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-green-500/10 border border-green-500/30 p-3 rounded">
                <h4 className="font-medium text-green-400 mb-2">Solutions</h4>
                <ol className="space-y-1">
                  {issue.solutions.map((s, i) => (
                    <li key={i} className="text-slate-300 text-sm">
                      <span className="text-green-400 font-mono">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ol>
              </div>

              {issue.drawings.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-slate-500">Reference Drawings:</span>
                  {issue.drawings.map(dwg => (
                    <Link key={dwg} href={`/drawings/${dwg}`} className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-sm hover:bg-slate-600/50">
                      {dwg}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredIssues.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Wrench className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No matching fault codes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}