'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, ChevronRight, Play, CircuitBoard, 
  Cpu, Zap, Shield, DoorOpen, Wind, Battery,
  Settings, Radio, Activity, Box, Train
} from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  sections: LearningSection[];
}

interface LearningSection {
  id: string;
  title: string;
  content: string[];
}

const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'intro',
    title: 'VCC Introduction',
    description: 'Vehicle Control Circuits overview and project background',
    icon: BookOpen,
    category: 'Foundation',
    sections: [
      {
        id: 'intro-1',
        title: 'Project Overview',
        content: [
          'KMRCL RS(3R) Project - 6-Car Formation',
          'DMC Car - TC Car - MC Car - MC Car - TC Car - DMC Car',
          'VCC (Vehicle Control Circuits) system for train control',
        ]
      },
      {
        id: 'intro-2',
        title: 'Car Configuration',
        content: [
          'DMC: Driving Motor Car with VVVF, BCU, HSCB, LTEB, LTJB',
          'TC: Trailer Car with APS, Battery, TCMS RIO, BCU, VAC',
          'MC: Motor Car with VVVF, TCMS RIO, DCU, VAC, BECU',
          'CAB: Driver Cab with Operating Panel, Indicator Panel, MCB Panel, Cab VAC',
        ]
      },
      {
        id: 'intro-3',
        title: 'Drawing Classification',
        content: [
          '942-58100 Series: Drawing Lists and Classification',
          '942-58101: Wiring Numbers and Descriptions',
          '942-58102: Symbol Library (4 parts)',
          '942-58103: Train Lines Control (4 parts)',
          '942-58104: Train Lines Signal (8 parts)',
          '942-58106: High Tension Power Train Lines',
        ]
      },
    ]
  },
  {
    id: 'propulsion',
    title: 'Traction & Propulsion System',
    description: 'VVVF inverter, traction motors, and propulsion control',
    icon: Zap,
    category: 'Propulsion',
    sections: [
      {
        id: 'prop-1',
        title: 'VVVF Inverter (V1, V2)',
        content: [
          'Mitsubishi VVVF Inverter for traction motor control',
          'Controls: Forward (3003), Reverse (3004), Powering 1 (3005), Powering 2 (3006)',
          'Brake resistor command via trainline 3010',
          'PWM signal generation for motor speed control',
        ]
      },
      {
        id: 'prop-2',
        title: 'Traction Motors',
        content: [
          '3-phase AC traction motors connected via TM1, TM2 connectors',
          'Traction return current path via 942-58121',
          'Speed control circuits via 942-58118, 942-58119',
        ]
      },
      {
        id: 'prop-3',
        title: 'Propulsion Trainlines',
        content: [
          '3003: Forward Command - TCMS_RIO1 X1-17 to V1 CN1-12',
          '3004: Reverse Command - TCMS_RIO1 X1-18 to V1 CN1-13',
          '3005: Powering 1 (Crossed with 3006) - TCMS_RIO1 X1-19 to V1 CN1-14',
          '3006: Powering 2 (Crossed with 3005) - TCMS_RIO1 X1-20 to V1 CN1-15',
          '3010: Brake Resistor - TCMS_RIO1 X1-22 to V1 CN1-16',
        ]
      },
      {
        id: 'prop-4',
        title: 'Fault Monitoring',
        content: [
          '1207: VVVF Fault - V1 CN2-5 to TCMS_RIO1 U15-M2',
          'Fault reset via trainline 1032',
          'Drawing: 942-58120 VVVF Control',
        ]
      },
    ]
  },
  {
    id: 'brake',
    title: 'Brake System',
    description: 'Brake control, emergency brake, parking brake systems',
    icon: Shield,
    category: 'Core Systems',
    sections: [
      {
        id: 'brake-1',
        title: 'Brake Control Units (BCU1, BCU2, BCU3)',
        content: [
          'BCU1 (DMC), BCU2 (TC), BCU3 (MC) - Knorr-Bremse brake control',
          'Full brake control logic with ABS and antiskid',
          'Emergency brake control with failsafe redundant path',
        ]
      },
      {
        id: 'brake-2',
        title: 'Normal Brake System',
        content: [
          '4024: Brake Normal - runs through BCU/BECU all cars',
          '4028: Brake Loop Return',
          'Normal brake command: 4024',
          'Drawing: 942-58124 Brake Control',
        ]
      },
      {
        id: 'brake-3',
        title: 'Emergency Brake System',
        content: [
          '4062: Emergency Brake Loop Normal - all cars via EBMV/EBSS',
          '4070: Emergency Brake Loop Return',
          '4103: Emergency Brake Loop Redundant - secondary failsafe path',
          'Drawing: 942-58125 EM Brake Loop',
        ]
      },
      {
        id: 'brake-4',
        title: 'Parking Brake System',
        content: [
          '4122: Parking Brake Applied - DMC and MC cars via PBMV/PBPS',
          '4153: Parking Brake Released',
          'PBMV1: Parking Brake Magnetic Valve (MC Car)',
          'Drawing: 942-58126 Parking Brake',
        ]
      },
      {
        id: 'brake-5',
        title: 'Compressor System',
        content: [
          'COMP1: Compressor Motor 1 (TC Car)',
          'Air supply for brake system',
          'ADU1: Air Drying Unit',
          'Drawing: 942-58123 Compressor Control',
        ]
      },
    ]
  },
  {
    id: 'door',
    title: 'Door System',
    description: 'Passenger door operation, control, and safety systems',
    icon: DoorOpen,
    category: 'Core Systems',
    sections: [
      {
        id: 'door-1',
        title: 'Door Control Units (DCU1, DCU2)',
        content: [
          'DCU1: Door Control Unit 1 (MC Car)',
          'DCU2: Door Control Unit 2 (TC Car)',
          'Controls all passenger doors on respective cars',
        ]
      },
      {
        id: 'door-2',
        title: 'Door Operation Commands',
        content: [
          '6009: Door Open Left (Crossed with 6046)',
          '6014: Door Close Left (Crossed with 6051)',
          '6046: Door Open Right (Crossed with 6009)',
          '6051: Door Close Right (Crossed with 6014)',
        ]
      },
      {
        id: 'door-3',
        title: 'Door Status Feedback',
        content: [
          '6073: Door 1 Proving Status - DCU1 CN2-3 to TCMS_RIO1 U15-H2',
          '6076: Door 2 Proving Status - DCU1 CN2-4 to TCMS_RIO1 U15-H3',
          '6112: Zero Speed - enables door opening - V1 CN2-3 to TCMS_RIO1 U15-L3',
        ]
      },
      {
        id: 'door-4',
        title: 'Drawings',
        content: [
          '942-58137: Saloon Door Supply Voltage',
          '942-58138: Door Operation Left',
          '942-58139: Door Operation Right',
          '942-58140: Door Proving',
        ]
      },
    ]
  },
  {
    id: 'vac',
    title: 'VAC / HVAC System',
    description: 'Ventilation and air conditioning systems',
    icon: Wind,
    category: 'Core Systems',
    sections: [
      {
        id: 'vac-1',
        title: 'Saloon VAC Units',
        content: [
          'VAC1: Saloon VAC Unit 1 (MC Car Ceiling)',
          'VAC2: Saloon VAC Unit 2 (TC Car Ceiling)',
        ]
      },
      {
        id: 'vac-2',
        title: 'Cab VAC',
        content: [
          'CAB_VAC1: Cab VAC Unit 1 (Driver Cab)',
          '7001: Cab VAC Fault - CAB_VAC1 CN1-5 to TCMS_RIO2 U25-F2',
        ]
      },
      {
        id: 'vac-3',
        title: 'VAC Status Monitoring',
        content: [
          '7050: VAC1 Status - VAC1 CN1-3 to TCMS_RIO1 U15-F4',
          '7060: VAC2 Status - VAC1 CN1-4 to TCMS_RIO1 U15-F5',
          '7070: Smoke Detection - SMOKE_SNS CN1-1 to TCMS_RIO1 U15-F6',
          '7071: Damper Operation',
        ]
      },
      {
        id: 'vac-4',
        title: 'Drawings',
        content: [
          '942-58143: Cab VAC',
          '942-58144: Saloon VAC Power',
          '942-58145: Saloon VAC Control',
        ]
      },
    ]
  },
  {
    id: 'aps',
    title: 'Auxiliary Power Supply',
    description: 'APS, battery, shore supply systems',
    icon: Battery,
    category: 'Power',
    sections: [
      {
        id: 'aps-1',
        title: 'APS Unit (APS1)',
        content: [
          'Static inverter and battery charger',
          'Provides: 415V AC, 230V AC, 110V DC',
          'Location: TC Car Underframe',
        ]
      },
      {
        id: 'aps-2',
        title: 'Shore Supply',
        content: [
          'SSB1: Shore Supply Box (TC Car)',
          '5000: Shore Supply Command - TCMS_RIO2 U25-H5 to SSB1 CN1-3',
          'Drawing: 942-58131 AC 415V Shore Supply',
        ]
      },
      {
        id: 'aps-3',
        title: 'SIV Status',
        content: [
          '5030: SIV Contact 1 Status - APS1 CN3-1 to TCMS_RIO2 U25-J6',
          '5031: SIV Contact 2 Status - APS1 CN3-2 to TCMS_RIO2 U25-J6',
        ]
      },
      {
        id: 'aps-4',
        title: 'Battery System',
        content: [
          'BATT1: Battery Box 1 (TC Car Underframe)',
          '110V DC battery pack for emergency power',
          '5064: Battery Under Voltage Warning - BATT1 CN1-2 to TCMS_RIO2 U25-G4',
          'Drawing: 942-58132 Battery Control',
        ]
      },
    ]
  },
  {
    id: 'tcms',
    title: 'TCMS System',
    description: 'Train Control Management System and RIO units',
    icon: Cpu,
    category: 'Control',
    sections: [
      {
        id: 'tcms-1',
        title: 'TCMS RIO Units',
        content: [
          'TCMS_RIO1: MC Car - U15 location - main control RIO',
          'TCMS_RIO2: TC Car - U25 location - APS, battery, cab VAC monitoring',
          ' Mitsubishi RIO units for digital I/O',
        ]
      },
      {
        id: 'tcms-2',
        title: 'TCMS_RIO1 Connections (MC Car)',
        content: [
          'CN1: Main connector - propulsion, doors, VAC',
          'CN11-CN17: Additional I/O connectors',
          'X1: Inter-car jumper connection (74 pins)',
          'Monitors: VVVF, doors, VAC, HSCB trip, VVVF fault, aux fault',
        ]
      },
      {
        id: 'tcms-3',
        title: 'TCMS_RIO2 Connections (TC Car)',
        content: [
          'CN1: Main connector',
          'Monitors: Cab VAC fault, APS fault, battery voltage, shore supply',
          'Controls: Shore supply contactor',
        ]
      },
      {
        id: 'tcms-4',
        title: 'TCMS Trainlines',
        content: [
          'All propulsion trainlines via TCMS_RIO1',
          'All door commands via TCMS_RIO1',
          'VAC status via TCMS_RIO1',
          'Cab VAC fault via TCMS_RIO2',
          'Drawing: 942-58146 TMS Interface',
        ]
      },
    ]
  },
  {
    id: 'hv',
    title: 'High Voltage System',
    description: 'HSCB, pantograph, collector shoes',
    icon: Zap,
    category: 'Power',
    sections: [
      {
        id: 'hv-1',
        title: 'High Speed Circuit Breaker (HSCB)',
        content: [
          'HSCB1: DMC Car - 1500V DC rated',
          'HSCB2: MC Car - 1500V DC rated',
          'Main circuit breaker for traction power',
        ]
      },
      {
        id: 'hv-2',
        title: 'HSCB Monitoring',
        content: [
          '1209: HSCB Trip Status - HSCB1 CN1-3 to TCMS_RIO1 U15-H4',
          'HSCB Close Command: 1001',
          'HSCB Open Command: 1002',
        ]
      },
      {
        id: 'hv-3',
        title: 'Collector Shoe System',
        content: [
          'CSJB1: Collector Shoe Junction Box 1 (DMC)',
          'CSJB2: Collector Shoe Junction Box 2 (TC)',
          'CSJB3: Collector Shoe Junction Box 3 (MC)',
          'Current collector shoe connections',
        ]
      },
      {
        id: 'hv-4',
        title: 'Drawings',
        content: [
          '942-38103: HV System',
          '942-58106: Train Lines High Tension Power',
        ]
      },
    ]
  },
  {
    id: 'comms',
    title: 'Communication Systems',
    description: 'PIS, PA, CCTV, Radio, CBTC',
    icon: Radio,
    category: 'Control',
    sections: [
      {
        id: 'comms-1',
        title: 'Ethernet Network',
        content: [
          'ETH_SW1: Ethernet Switch CCTV 1 (MC Car)',
          'ETH_SW2: Ethernet Switch CCTV 2 (TC Car)',
          'CCTV, TCMS, EBCU network connectivity',
          'Drawing: 942-58154 Ethernet Switch',
        ]
      },
      {
        id: 'comms-2',
        title: 'Audio Alarm',
        content: [
          'AAU1: Audio Alarm Unit 1 (MC Car)',
          'AAU2: Audio Alarm Unit 2 (TC Car)',
        ]
      },
      {
        id: 'comms-3',
        title: 'CBTC System',
        content: [
          'TCMS_CN1: CBTC Communication Node (MC Car)',
          'Train control and signaling interface',
          'Drawing: 942-58152 CBTC',
        ]
      },
      {
        id: 'comms-4',
        title: 'Train Radio',
        content: [
          'Train radio communication system',
          'Drawing: 942-58150 Train Radio',
        ]
      },
    ]
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Foundation: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
  Core: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  Propulsion: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  Power: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  Control: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
};

export default function LearningPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>('intro');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const activeModule = LEARNING_MODULES.find(m => m.id === selectedModule);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC Learning Center</h1>
        <p className="mt-2 text-slate-400">
          Complete technical training for Vehicle Control Circuits - KMRCL RS(3R) Project
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{LEARNING_MODULES.length} modules</span>
          <span>6-Car Formation</span>
          <span>942-581xx Drawing Series</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Training Modules</h2>
          {LEARNING_MODULES.map(module => {
            const Icon = module.icon;
            const catColor = CATEGORY_COLORS[module.category] || CATEGORY_COLORS['Foundation'];
            
            return (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedModule === module.id 
                    ? 'border-cyan-500/50 bg-cyan-500/10' 
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${catColor.text}`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{module.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{module.description}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${catColor.bg} ${catColor.text}`}>
                      {module.category}
                    </span>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-slate-500 ${selectedModule === module.id ? 'text-cyan-400' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {activeModule ? (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <activeModule.icon className="h-8 w-8 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeModule.title}</h2>
                  <p className="text-slate-400">{activeModule.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {activeModule.sections.map(section => (
                  <div key={section.id} className="border border-slate-700/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="font-medium text-white">{section.title}</span>
                      <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes(section.id) ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {expandedSections.includes(section.id) && (
                      <div className="p-4 bg-slate-900/30 space-y-2">
                        {section.content.map((item, idx) => (
                          <p key={idx} className="text-sm text-slate-300 leading-relaxed">
                            {item}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {activeModule.id === 'intro' && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">Quick Reference - Car Types</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-400 font-medium">DMC:</span>
                      <span className="text-slate-400"> Driving Motor Car (VVVF, BCU, HSCB)</span>
                    </div>
                    <div>
                      <span className="text-green-400 font-medium">TC:</span>
                      <span className="text-slate-400"> Trailer Car (APS, Battery, TCMS_RIO2)</span>
                    </div>
                    <div>
                      <span className="text-orange-400 font-medium">MC:</span>
                      <span className="text-slate-400"> Motor Car (VVVF, TCMS_RIO1, DCU, VAC)</span>
                    </div>
                    <div>
                      <span className="text-violet-400 font-medium">CAB:</span>
                      <span className="text-slate-400"> Driver Cab (Panel, Indicator, Cab VAC)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <Link href="/drawings" className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">
                  <BookOpen className="h-4 w-4" />
                  View Drawings
                </Link>
                <Link href="/trainlines" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50">
                  <CircuitBoard className="h-4 w-4" />
                  Trainlines
                </Link>
                <Link href="/equipment" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50">
                  <Box className="h-4 w-4" />
                  Equipment
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Select a training module to begin learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}