'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, FileText, Cpu, Cable, Train, AlertTriangle, ChevronRight,
  Settings, Zap, ShieldCheck, Wind, Radio, Battery, DoorOpen, Activity, Box,
  Lightbulb, Link2, CheckCircle, XCircle, Clock
} from 'lucide-react';

const SYSTEM_DETAILS: Record<string, any> = {
  GEN: {
    name: 'General & Conventions',
    description: 'Foundation layer: drawing list, classification, wiring numbers, symbols, and naming rules',
    icon: Settings,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500',
    drawings: [
      { no: '942-58099', title: 'Drawing List', type: 'MASTER_INDEX', desc: 'Complete VCC drawing index' },
      { no: '942-58100', title: 'Classification', type: 'CLASSIFICATION', desc: 'Conductor classification: HV, AP, BA, measuring, shielded, data' },
      { no: '942-58101', title: 'Wiring Numbers', type: 'WIRING_GRAMMAR', desc: '5-digit wire number grammar: unit+car+trainline+serial' },
      { no: '942-58102', title: 'Symbols', type: 'SYMBOL_LIB', desc: 'IEC-style symbol library' }
    ],
    subsystems: [
      { code: 'DWG_LIST', name: 'Drawing List', drawings: ['942-58099'] },
      { code: 'CLASS', name: 'Classification', drawings: ['942-58100'] },
      { code: 'WIRE_NUM', name: 'Wiring Numbers', drawings: ['942-58101'] },
      { code: 'SYMBOLS', name: 'Symbols', drawings: ['942-58102'] }
    ],
    keyWires: ['5-digit wire grammar: NNN-NN-N'],
    equipment: []
  },
  TRL: {
    name: 'Trainlines',
    description: 'Backbone of train-wide control: train line control, signal, low/high tension power distribution',
    icon: Train,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    drawings: [
      { no: '942-58103', title: 'Train Lines Control', type: 'SCHEMATIC', desc: 'Control signals: RESET 1032, SHUT DOWN 1050, AUX ON 1040' },
      { no: '942-58104', title: 'Train Lines Signal', type: 'SCHEMATIC', desc: 'Signal wires: ATP 1515, SCS 2043, mode selection' },
      { no: '942-58105', title: 'Low Tension Power', type: 'SCHEMATIC', desc: '110VDC trainline distribution' },
      { no: '942-58106', title: 'High Tension Power', type: 'SCHEMATIC', desc: '750VDC/415VAC trainline distribution' }
    ],
    subsystems: [
      { code: 'TRL_CTRL', name: 'Train Line Control', wires: ['1032', '1050', '1040', '1207', '1209', '1215', '1217'] },
      { code: 'TRL_SIG', name: 'Train Line Signal', wires: ['1515', '2043', '9214', '9215', '9216'] },
      { code: 'TRL_LT', name: 'Low Tension Power', wires: ['1000-1999 range'] },
      { code: 'TRL_HT', name: 'High Tension Power', wires: ['4000+ range'] }
    ],
    keyWires: [
      { no: '1032', name: 'RESET', desc: 'System reset' },
      { no: '1050', name: 'SHUT DOWN', desc: 'System shutdown' },
      { no: '1040', name: 'AUX ON', desc: 'Auxiliary power on' },
      { no: '3003', name: 'FORWARD', desc: 'Forward command' },
      { no: '3004', name: 'REVERSE', desc: 'Reverse command' },
      { no: '3005', name: 'POWERING 1', desc: 'Powering level 1 (Crossed)' },
      { no: '3006', name: 'POWERING 2', desc: 'Powering level 2 (Crossed)' }
    ],
    crossConnections: [
      { location: 'X1 Pins 19/20', wires: ['3005', '3006'], desc: 'Powering 1 & 2 crossed at inter-car jumper' }
    ],
    equipment: []
  },
  CAB: {
    name: 'Cab Control & Status',
    description: 'Driver interface: controlling cab logic, startup sequence, status indication, MCB monitoring',
    icon: Activity,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500',
    drawings: [
      { no: '942-58107', title: 'Controlling Cab', type: 'SCHEMATIC', desc: 'HCR, TCR, KOR, LCAR logic for cab selection' },
      { no: '942-58108', title: 'Start-up Relay', type: 'SCHEMATIC', desc: 'Startup relay logic, auxiliary on, shutdown' },
      { no: '942-58109', title: 'System Status Indication', type: 'SCHEMATIC', desc: 'VVVF fault, HSCB trip, aux fault, VAC fault, line voltage' },
      { no: '942-58110', title: 'MCB Trip Status', type: 'SCHEMATIC', desc: 'MCB trip monitoring map' },
      { no: '942-58111', title: 'DC Train Line Supply', type: 'SCHEMATIC', desc: 'DC trainline supply contactor' }
    ],
    subsystems: [
      { code: 'CAB_CTRL', name: 'Controlling Cab', components: ['HCR', 'TCR', 'KOR', 'LCAR', 'Mode Selector'] },
      { code: 'CAB_START', name: 'Start-up Relay', components: ['Startup Relay', 'AUX ON Relay'] },
      { code: 'CAB_STATUS', name: 'System Status Indication', components: ['VVVF Fault Ind', 'HSCB Trip Ind', 'Aux Fault Ind'] },
      { code: 'CAB_MCB', name: 'MCB Trip Status', components: ['MCB Group 1', 'MCB Group 2', 'TCMS Interface'] }
    ],
    keyWires: ['1040 AUX ON', '1050 SHUT DOWN', '1032 RESET'],
    equipment: [
      { code: 'OP_PNL1', name: 'Operating Panel 1', location: 'Cab Desk' },
      { code: 'IND_PNL1', name: 'Indicator Panel 1', location: 'Cab Desk' },
      { code: 'MCB_PNL1', name: 'MCB Panel 1', location: 'Cab' },
      { code: 'CAB_VAC1', name: 'Cab VAC Unit 1', location: 'Cab' }
    ]
  },
  BRAKE: {
    name: 'Brake System',
    description: 'Complete pneumatic-electrical brake architecture: compressor, brake loop, emergency brake, parking brake, BCU/BECU',
    icon: ShieldCheck,
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    drawings: [
      { no: '942-58123', title: 'Compressor Control', type: 'SCHEMATIC', desc: 'Compressor motor, ADU, pressure governor' },
      { no: '942-58124', title: 'Brake Loop', type: 'SCHEMATIC', desc: 'Brake loop normal 4024, return 4028' },
      { no: '942-58125', title: 'Emergency Brake', type: 'SCHEMATIC', desc: 'EBLR, EBPB, EBMV, EBVR1/2, EBSS, BLCOS, DMSR, SCSR, TBC, MRPS' },
      { no: '942-58126', title: 'Parking Brake', type: 'SCHEMATIC', desc: 'PBR, PBAPB, PBRPB, PBMV, PBPS1/2 - applied 4122, released 4153' },
      { no: '942-58127', title: 'Horn', type: 'SCHEMATIC', desc: 'Horn control circuit' },
      { no: '942-58128', title: 'Brake Control DMC/MC', type: 'SCHEMATIC', desc: 'BCU architecture for DMC and MC cars' },
      { no: '942-58129', title: 'Brake Control TC', type: 'SCHEMATIC', desc: 'BECU architecture for TC car' }
    ],
    subsystems: [
      { code: 'BRAKE_COMP', name: 'Compressor Control', components: ['COMP', 'ADU', 'PGOV', 'MRPS'] },
      { code: 'BRAKE_LOOP', name: 'Brake Loop', wires: ['4024', '4028', '4062', '4070', '4103', '4110'] },
      { code: 'BRAKE_EM', name: 'Emergency Brake', components: ['EBLR', 'EBPB', 'EBMV', 'EBVR1', 'EBVR2', 'EBSS'] },
      { code: 'BRAKE_PARK', name: 'Parking Brake', wires: ['4122', '4153', '4155', '4123'], components: ['PBR', 'PBMV', 'PBPS1', 'PBPS2'] }
    ],
    keyWires: [
      { no: '4024', name: 'BRAKE LOOP', desc: 'Brake loop normal' },
      { no: '4062', name: 'EM BRAKE LOOP NORMAL', desc: 'Emergency brake loop normal path' },
      { no: '4103', name: 'EM BRAKE LOOP REDUNDANT', desc: 'Emergency brake loop redundant path' },
      { no: '4122', name: 'PARKING BRAKE APPLIED', desc: 'Parking brake applied' },
      { no: '4153', name: 'PARKING BRAKE RELEASED', desc: 'Parking brake released' },
      { no: '4155', name: 'PARKING BRAKE PRESSURE SW', desc: 'PB pressure switch' }
    ],
    equipment: [
      { code: 'BCU1', name: 'Brake Control Unit 1', location: 'DMC Underframe' },
      { code: 'BCU2', name: 'Brake Control Unit 2', location: 'TC Underframe' },
      { code: 'BECU1', name: 'Brake Electronic Control Unit', location: 'MC Underframe' },
      { code: 'COMP1', name: 'Compressor Motor', location: 'TC Underframe' }
    ]
  },
  TRAC: {
    name: 'Traction & Propulsion',
    description: 'Speed control, VVVF inverter interface, and traction return current path',
    icon: Zap,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    drawings: [
      { no: '942-58119', title: 'Speed Control', type: 'SCHEMATIC', desc: 'Forward 3003, Reverse 3004, Powering1 3005, Powering2 3006, Braking 3010, Full Service Brake 3011' },
      { no: '942-58120', title: 'VVVF Control', type: 'SCHEMATIC', desc: 'VVVF inverter interface CN1/CN2, PWM command, brake mode, propulsion enable' },
      { no: '942-58121', title: 'Traction Return Current', type: 'SCHEMATIC', desc: 'Return current path, earth brush connections' }
    ],
    subsystems: [
      { code: 'TRAC_SPD', name: 'Speed Control', wires: ['3003', '3004', '3005', '3006', '3010', '3011', '3013', '3018', '3019', '3060'] },
      { code: 'TRAC_VVVF', name: 'VVVF Control', wires: ['3020a', '3026', '1207'] },
      { code: 'TRAC_RET', name: 'Traction Return', wires: ['750V return'] }
    ],
    keyWires: [
      { no: '3003', name: 'FORWARD', desc: 'Forward propulsion command' },
      { no: '3004', name: 'REVERSE', desc: 'Reverse propulsion command' },
      { no: '3005', name: 'POWERING 1', desc: 'Powering command level 1' },
      { no: '3006', name: 'POWERING 2', desc: 'Powering command level 2' },
      { no: '3010', name: 'BRAKING', desc: 'Braking command' },
      { no: '3011', name: 'FULL SERVICE BRAKE', desc: 'Full service brake command' }
    ],
    equipment: [
      { code: 'VVVF1', name: 'VVVF Inverter 1', location: 'DMC Underframe' },
      { code: 'VVVF2', name: 'VVVF Inverter 2', location: 'MC Underframe' },
      { code: 'LTEB1', name: 'Low Tension Equipment Box 1', location: 'DMC Underframe' },
      { code: 'FILT_REACT1', name: 'Filter Reactor 1', location: 'DMC Underframe' },
      { code: 'BRAKE_RES1', name: 'Brake Resistor 1', location: 'DMC Underframe' }
    ]
  },
  APS: {
    name: 'Auxiliary Power Supply',
    description: 'Energy distribution backbone: APS, shore supply, battery control, 415V and 110V distribution',
    icon: Battery,
    color: 'text-green-400',
    bgColor: 'bg-green-500',
    drawings: [
      { no: '942-58130', title: 'APS', type: 'SCHEMATIC', desc: 'APS unit, SIV contacts 5030/5031, 415V/230V distribution' },
      { no: '942-58131', title: 'Shore Supply', type: 'SCHEMATIC', desc: 'Shore supply contact 5000, SSK box' },
      { no: '942-58132', title: 'Battery Control', type: 'SCHEMATIC', desc: 'Battery under-voltage monitoring 5064' }
    ],
    subsystems: [
      { code: 'APS_MAIN', name: 'APS', wires: ['5030', '5031'] },
      { code: 'APS_SHORE', name: 'Shore Supply', wires: ['5000'] },
      { code: 'APS_BATT', name: 'Battery Control', wires: ['5064'] }
    ],
    keyWires: [
      { no: '5000', name: 'SHORE SUPPLY CONTACT', desc: 'Shore supply contactor status' },
      { no: '5030', name: 'SIV CONTACT 1', desc: 'Static inverter contact 1' },
      { no: '5031', name: 'SIV CONTACT 2', desc: 'Static inverter contact 2' },
      { no: '5064', name: 'BATTERY UNDER-VOLTAGE', desc: 'Battery under-voltage monitoring' }
    ],
    equipment: [
      { code: 'APS1', name: 'Auxiliary Power Supply 1', location: 'TC Underframe' },
      { code: 'SSB1', name: 'Shore Supply Box 1', location: 'TC Underframe' },
      { code: 'BATT1', name: 'Battery Box 1', location: 'TC Underframe' }
    ]
  },
  DOOR: {
    name: 'Door System',
    description: 'Door power, left/right operation, proving loop, local interlock, TMS communication',
    icon: DoorOpen,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
    drawings: [
      { no: '942-58137', title: 'Door Supply Voltage', type: 'SCHEMATIC', desc: 'Door power supply, status meaning, isolation switch semantics' },
      { no: '942-58138', title: 'Left Door Operation', type: 'SCHEMATIC', desc: 'Door open left 6009, close left 6014, proving loop 6073, zero speed 6112' },
      { no: '942-58139', title: 'Right Door Operation', type: 'SCHEMATIC', desc: 'Door open right 6046, close right 6051, proving loop 6076' },
      { no: '942-58140', title: 'Door Proving Loop', type: 'SCHEMATIC', desc: 'Door proving loop logic, TCMS door status feedback' },
      { no: '942-58141', title: 'Local Door Interlock', type: 'SCHEMATIC', desc: 'Local interlock logic, emergency release handle state' },
      { no: '942-58142', title: 'Door TMS Communication', type: 'SCHEMATIC', desc: 'Door TMS communication, TCMS RIO interface' }
    ],
    subsystems: [
      { code: 'DOOR_SUPPLY', name: 'Door Supply Voltage' },
      { code: 'DOOR_L', name: 'Left Door Operation', wires: ['6009', '6014', '6073'] },
      { code: 'DOOR_R', name: 'Right Door Operation', wires: ['6046', '6051', '6076'] },
      { code: 'DOOR_PROVE', name: 'Door Proving Loop', wires: ['6073', '6076', '6112'] },
      { code: 'DOOR_INTER', name: 'Local Door Interlock' },
      { code: 'DOOR_TMS', name: 'Door TMS Communication' }
    ],
    keyWires: [
      { no: '6009', name: 'DOOR OPEN LEFT', desc: 'Left side door open command' },
      { no: '6014', name: 'DOOR CLOSE LEFT', desc: 'Left side door close command' },
      { no: '6046', name: 'DOOR OPEN RIGHT', desc: 'Right side door open command' },
      { no: '6051', name: 'DOOR CLOSE RIGHT', desc: 'Right side door close command' },
      { no: '6073', name: 'DOOR PROVING LOOP 1', desc: 'Door proving loop signal 1' },
      { no: '6076', name: 'DOOR PROVING LOOP 2', desc: 'Door proving loop signal 2' },
      { no: '6112', name: 'ZERO SPEED', desc: 'Zero speed signal (door interlock)' }
    ],
    crossConnections: [
      { location: 'Jumper Positions 43-47', wires: ['6009', '6014', '6046', '6051'], desc: 'Door open/close lines crossed at inter-car jumper' }
    ],
    equipment: [
      { code: 'DCU1', name: 'Door Control Unit 1', location: 'MC Ceiling' },
      { code: 'DCU2', name: 'Door Control Unit 2', location: 'TC Ceiling' }
    ]
  },
  VAC: {
    name: 'VAC / HVAC',
    description: 'Cab and saloon air conditioning: power supply, control logic, smoke detection, damper operation',
    icon: Wind,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500',
    drawings: [
      { no: '942-58143', title: 'Cab VAC', type: 'SCHEMATIC', desc: 'Cab VAC unit, fault indication 7001, TCMS interface' },
      { no: '942-58144', title: 'Saloon VAC Power', type: 'SCHEMATIC', desc: 'Saloon VAC1 power 7050, VAC2 power 7060, damper 7071' },
      { no: '942-58145', title: 'Saloon VAC Control', type: 'SCHEMATIC', desc: 'Saloon VAC control logic, smoke detection 7070' }
    ],
    subsystems: [
      { code: 'VAC_CAB', name: 'Cab VAC', wires: ['7001'] },
      { code: 'VAC_SAL_PWR', name: 'Saloon VAC Power', wires: ['7050', '7060'] },
      { code: 'VAC_SAL_CTRL', name: 'Saloon VAC Control', wires: ['7070', '7071'] }
    ],
    keyWires: [
      { no: '7001', name: 'CAB VAC IN SSK', desc: 'Cab VAC in SSK signal' },
      { no: '7050', name: 'SALOON VAC 1 IN SSK', desc: 'Saloon VAC 1 in SSK signal' },
      { no: '7060', name: 'SALOON VAC 2 IN SSK', desc: 'Saloon VAC 2 in SSK signal' },
      { no: '7070', name: 'SMOKE DETECTION', desc: 'Smoke detection alarm' },
      { no: '7071', name: 'DAMPER OPERATION', desc: 'Damper operation signal' }
    ],
    equipment: [
      { code: 'CAB_VAC1', name: 'Cab VAC Unit 1', location: 'Cab' },
      { code: 'VAC1', name: 'Saloon VAC Unit 1', location: 'MC Ceiling' },
      { code: 'VAC2', name: 'Saloon VAC Unit 2', location: 'TC Ceiling' }
    ]
  },
  TMS: {
    name: 'Train Management System',
    description: 'TMS interface, TCMS remote I/O, terminal blocks, communication nodes',
    icon: Cpu,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500',
    drawings: [
      { no: '942-58146', title: 'TMS Interface 1 to 4', type: 'SCHEMATIC', desc: 'TMS interface sheets, TCMS RIO points U1513/U2513, digital I/O mapping' }
    ],
    subsystems: [
      { code: 'TMS_RIO', name: 'TCMS Remote IO', points: ['U1513', 'U2513', 'U1..33', 'U2..33'] },
      { code: 'TMS_TB', name: 'TCMS Terminal Block' },
      { code: 'TMS_CN', name: 'TCMS Communication Node' }
    ],
    keyWires: [
      { no: '9214', name: 'ATP MODE', desc: 'ATP mode active' },
      { no: '9215', name: 'FWD MODE', desc: 'Forward mode active' },
      { no: '9216', name: 'REV MODE', desc: 'Reverse mode active' }
    ],
    equipment: [
      { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', location: 'MC Ceiling' },
      { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', location: 'TC Ceiling' },
      { code: 'TCMS_TB1', name: 'TCMS Terminal Block 1', location: 'MC Ceiling' },
      { code: 'TCMS_CN1', name: 'TCMS Communication Node 1', location: 'MC Ceiling' }
    ]
  },
  COMMS: {
    name: 'Communication Systems',
    description: 'PIS/TIS, DVAS/PA, PA amplifier, CBTC, train radio, CCTV',
    icon: Radio,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    drawings: [
      { no: '942-58147', title: 'PIS/TIS', type: 'SCHEMATIC', desc: 'Passenger information system, TFT display' },
      { no: '942-58148', title: 'PIS/TIS Sheet 2', type: 'SCHEMATIC', desc: 'PIS/TIS continuation' },
      { no: '942-58149', title: 'DVAS/PA', type: 'SCHEMATIC', desc: 'Digital voice announcement, PA system' },
      { no: '942-58150', title: 'PA Amplifier', type: 'SCHEMATIC', desc: 'PA amplifier unit' },
      { no: '942-58151', title: 'PA Amplifier 2', type: 'SCHEMATIC', desc: 'PA amplifier continuation' },
      { no: '942-58152', title: 'CBTC', type: 'SCHEMATIC', desc: 'Communication based train control, X10 connector' },
      { no: '942-58153', title: 'Train Radio', type: 'SCHEMATIC', desc: 'Train radio interface' },
      { no: '942-58154', title: 'CCTV', type: 'SCHEMATIC', desc: 'Closed circuit television, X5 connector' }
    ],
    subsystems: [
      { code: 'COMMS_PIS', name: 'PIS/TIS' },
      { code: 'COMMS_DVAS', name: 'DVAS/PA' },
      { code: 'COMMS_PA_AMP', name: 'PA Amplifier' },
      { code: 'COMMS_CBTC', name: 'CBTC' },
      { code: 'COMMS_RADIO', name: 'Train Radio' },
      { code: 'COMMS_CCTV', name: 'CCTV' }
    ],
    equipment: [
      { code: 'ETH_SW1', name: 'Ethernet Switch CCTV 1', location: 'MC Ceiling' },
      { code: 'ETH_SW2', name: 'Ethernet Switch CCTV 2', location: 'TC Ceiling' },
      { code: 'AAU1', name: 'Audio Alarm Unit 1', location: 'MC Ceiling' },
      { code: 'AAU2', name: 'Audio Alarm Unit 2', location: 'TC Ceiling' }
    ]
  }
};

export default function SystemDetailPage() {
  const params = useParams();
  const systemCode = (params?.systemCode as string || 'TRL').toUpperCase();
  const system = SYSTEM_DETAILS[systemCode] || SYSTEM_DETAILS['TRL'];
  const Icon = system.icon;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </Link>
            <div className={`p-2 rounded-xl ${system.bgColor}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{systemCode}</h1>
                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{system.name}</span>
              </div>
              <p className="text-sm text-slate-400">{system.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Drawings */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Related Drawings</h2>
                <span className="ml-auto text-sm text-slate-400">{system.drawings?.length || 0} drawings</span>
              </div>
              <div className="divide-y divide-slate-700/50">
                {system.drawings?.map((drawing: any) => (
                  <div key={drawing.no} className="px-5 py-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-cyan-400 font-medium">{drawing.no}</p>
                        <p className="text-white font-medium mt-1">{drawing.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{drawing.desc}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        drawing.type === 'SCHEMATIC' ? 'bg-blue-500/20 text-blue-400' :
                        drawing.type === 'PIN_ASSIGNMENT' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {drawing.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subsystems */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Subsystems</h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                {system.subsystems?.map((subsystem: any) => (
                  <div key={subsystem.code} className="p-4 bg-slate-700/30 rounded-lg border border-slate-700/50">
                    <p className="font-medium text-white">{subsystem.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{subsystem.code}</p>
                    {subsystem.wires && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subsystem.wires.map((wire: string) => (
                          <Link key={wire} href={`/trainlines/${wire}`} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs hover:bg-cyan-500/30">
                            {wire}
                          </Link>
                        ))}
                      </div>
                    )}
                    {subsystem.components && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subsystem.components.map((comp: string) => (
                          <span key={comp} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                            {comp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Wires */}
            {system.keyWires && system.keyWires.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                  <Cable className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">Key Trainlines / Wires</h2>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3">
                  {system.keyWires.map((wire: any) => (
                    <Link
                      key={wire.no}
                      href={`/trainlines/${wire.no}`}
                      className="p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors"
                    >
                      <p className="font-mono text-cyan-400 font-bold">{wire.no}</p>
                      <p className="text-sm text-white mt-1">{wire.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{wire.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cross Connections */}
            {system.crossConnections && system.crossConnections.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-red-500/30 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h2 className="text-lg font-semibold text-red-400">Cross-Connections (Critical)</h2>
                </div>
                <div className="p-5 space-y-3">
                  {system.crossConnections.map((conn: any, idx: number) => (
                    <div key={idx} className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <p className="font-medium text-red-400">{conn.location}</p>
                      <p className="text-sm text-slate-300 mt-1">{conn.desc}</p>
                      <div className="flex gap-2 mt-2">
                        {conn.wires.map((wire: string) => (
                          <Link key={wire} href={`/trainlines/${wire}`} className="px-2 py-1 bg-red-500/30 text-red-300 rounded text-sm hover:bg-red-500/40">
                            {wire}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Equipment */}
            {system.equipment && system.equipment.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Equipment</h2>
                </div>
                <div className="p-4 space-y-2">
                  {system.equipment.map((eq: any) => (
                    <Link
                      key={eq.code}
                      href={`/equipment/${eq.code}`}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <p className="font-mono text-purple-400">{eq.code}</p>
                        <p className="text-sm text-slate-300">{eq.name}</p>
                      </div>
                      <p className="text-xs text-slate-500">{eq.location}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Drawings</span>
                  <span className="text-white font-medium">{system.drawings?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subsystems</span>
                  <span className="text-white font-medium">{system.subsystems?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Equipment</span>
                  <span className="text-white font-medium">{system.equipment?.length || 0}</span>
                </div>
                {system.keyWires && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Key Wires</span>
                    <span className="text-white font-medium">{system.keyWires.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <Link href="/systems" className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">Back to Systems</span>
              </Link>
              <Link href="/drawings" className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="text-slate-300">All Drawings</span>
              </Link>
              <Link href="/wires" className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                <Cable className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-300">Wire Database</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layers(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
    </svg>
  );
}