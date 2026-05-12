'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Box, Lightbulb, Link2, Search, ChevronRight, Layers,
  Cpu, Cable, FileText, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';

// System data with full hierarchy
const SYSTEMS_DATA = [
  {
    code: 'GEN',
    name: 'General & Conventions',
    category: 'Foundation',
    description: 'Drawing list, classification, wiring numbers, symbols',
    icon: Settings,
    color: 'from-slate-500/20 to-slate-600/10',
    borderColor: 'border-slate-500/30',
    drawings: 4,
    equipment: 0,
    keyWires: ['Wire grammar', 'Symbol library'],
    subsystems: ['Drawing List', 'Classification', 'Wiring Numbers', 'Symbols']
  },
  {
    code: 'TRL',
    name: 'Trainlines',
    category: 'Core Systems',
    description: 'Train line control, signal, low/high tension power',
    icon: Train,
    color: 'from-blue-500/20 to-blue-600/10',
    borderColor: 'border-blue-500/30',
    drawings: 4,
    equipment: 0,
    keyWires: ['3003 FORWARD', '3004 REVERSE', '3005 POWERING1', '3006 POWERING2', '3010 BRAKING'],
    subsystems: ['Train Line Control', 'Train Line Signal', 'Low Tension Power', 'High Tension Power']
  },
  {
    code: 'CAB',
    name: 'Cab Control & Status',
    category: 'Core Systems',
    description: 'Controlling cab, startup, status indication, MCB trip',
    icon: Activity,
    color: 'from-violet-500/20 to-violet-600/10',
    borderColor: 'border-violet-500/30',
    drawings: 5,
    equipment: 4,
    keyWires: ['1040 AUX ON', '1050 SHUT DOWN', '1032 RESET'],
    subsystems: ['Controlling Cab', 'Start-up Relay', 'System Status Indication', 'MCB Trip Status']
  },
  {
    code: 'TRAC',
    name: 'Traction & Propulsion',
    category: 'Propulsion',
    description: 'Speed control, VVVF control, traction return current',
    icon: Zap,
    color: 'from-orange-500/20 to-orange-600/10',
    borderColor: 'border-orange-500/30',
    drawings: 3,
    equipment: 6,
    keyWires: ['3003', '3004', '3005', '3006', '3010', '3011'],
    subsystems: ['Speed Control', 'VVVF Control', 'Traction Return Current']
  },
  {
    code: 'BRAKE',
    name: 'Brake System',
    category: 'Core Systems',
    description: 'Compressor, brake loop, emergency brake, parking brake, horn',
    icon: ShieldCheck,
    color: 'from-red-500/20 to-red-600/10',
    borderColor: 'border-red-500/30',
    drawings: 7,
    equipment: 12,
    keyWires: ['4024 BRAKE LOOP', '4062 EM BRAKE N', '4103 EM BRAKE R', '4122 PB APPLIED', '4153 PB RELEASED'],
    subsystems: ['Compressor Control', 'Brake Loop', 'Emergency Brake', 'Parking Brake', 'Horn', 'Brake Control DMC/MC', 'Brake Control TC']
  },
  {
    code: 'APS',
    name: 'Auxiliary Power Supply',
    category: 'Power',
    description: 'APS, shore supply, battery control',
    icon: Battery,
    color: 'from-green-500/20 to-green-600/10',
    borderColor: 'border-green-500/30',
    drawings: 3,
    equipment: 4,
    keyWires: ['5000 SHORE CONTACT', '5030 SIV 1', '5031 SIV 2', '5064 BAT UV'],
    subsystems: ['APS', 'Shore Supply', 'Battery Control']
  },
  {
    code: 'DOOR',
    name: 'Door System',
    category: 'Core Systems',
    description: 'Door supply, left/right operation, proving loop, interlock',
    icon: DoorOpen,
    color: 'from-amber-500/20 to-amber-600/10',
    borderColor: 'border-amber-500/30',
    drawings: 6,
    equipment: 4,
    keyWires: ['6009 DOOR OPEN L', '6014 DOOR CLOSE L', '6046 DOOR OPEN R', '6051 DOOR CLOSE R', '6073 DOOR PROVE 1'],
    subsystems: ['Door Supply Voltage', 'Left Door Operation', 'Right Door Operation', 'Door Proving Loop', 'Local Door Interlock', 'Door TMS Communication']
  },
  {
    code: 'VAC',
    name: 'VAC / HVAC',
    category: 'Core Systems',
    description: 'Cab VAC, saloon VAC power and control',
    icon: Wind,
    color: 'from-cyan-500/20 to-cyan-600/10',
    borderColor: 'border-cyan-500/30',
    drawings: 3,
    equipment: 4,
    keyWires: ['7001 CAB VAC', '7050 SALOON VAC1', '7060 SALOON VAC2', '7070 SMOKE', '7071 DAMPER'],
    subsystems: ['Cab VAC', 'Saloon VAC Power', 'Saloon VAC Control']
  },
  {
    code: 'TMS',
    name: 'Train Management System',
    category: 'Control',
    description: 'TMS interface, TCMS remote I/O, communication nodes',
    icon: Cpu,
    color: 'from-teal-500/20 to-teal-600/10',
    borderColor: 'border-teal-500/30',
    drawings: 1,
    equipment: 6,
    keyWires: ['9214 ATP', '9215 FWD', '9216 REV'],
    subsystems: ['TCMS Remote IO', 'TCMS Terminal Block', 'TCMS Communication Node']
  },
  {
    code: 'COMMS',
    name: 'Communication Systems',
    category: 'Core Systems',
    description: 'PIS/TIS, DVAS/PA, CBTC, train radio, CCTV',
    icon: Radio,
    color: 'from-emerald-500/20 to-emerald-600/10',
    borderColor: 'border-emerald-500/30',
    drawings: 8,
    equipment: 8,
    keyWires: [],
    subsystems: ['PIS/TIS', 'DVAS/PA', 'PA Amplifier', 'CBTC', 'Train Radio', 'CCTV']
  },
  {
    code: 'LIGHT',
    name: 'Lighting',
    category: 'Auxiliary',
    description: 'Head cab light, saloon lights, console light',
    icon: Lightbulb,
    color: 'from-yellow-500/20 to-yellow-600/10',
    borderColor: 'border-yellow-500/30',
    drawings: 4,
    equipment: 0,
    keyWires: [],
    subsystems: ['Head Cab Main Light', 'Tail/Console Light', 'Interior Light', 'Wiper']
  },
  {
    code: 'COUPL',
    name: 'Gangway & Coupler',
    category: 'Auxiliary',
    description: 'Coupling and uncoupling control',
    icon: Link2,
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-500/30',
    drawings: 1,
    equipment: 0,
    keyWires: [],
    subsystems: ['Coupling Control']
  },
  {
    code: 'LTEB',
    name: 'Low Tension Equipment Box',
    category: 'Electrical Distribution',
    description: 'LTEB pin assignments and wiring',
    icon: Box,
    color: 'from-indigo-500/20 to-indigo-600/10',
    borderColor: 'border-indigo-500/30',
    drawings: 4,
    equipment: 3,
    keyWires: [],
    subsystems: ['LTEB DMC', 'LTEB TC', 'LTEB MC']
  },
  {
    code: 'LTJB',
    name: 'Low Tension Junction Box',
    category: 'Electrical Distribution',
    description: 'LTJB pin assignments and wiring',
    icon: Box,
    color: 'from-pink-500/20 to-pink-600/10',
    borderColor: 'border-pink-500/30',
    drawings: 4,
    equipment: 3,
    keyWires: [],
    subsystems: ['LTJB1', 'LTJB2']
  },
  {
    code: 'EDB',
    name: 'Electrical Distribution Box',
    category: 'Electrical Distribution',
    description: 'EDB panel assignments',
    icon: Box,
    color: 'from-rose-500/20 to-rose-600/10',
    borderColor: 'border-rose-500/30',
    drawings: 2,
    equipment: 2,
    keyWires: [],
    subsystems: ['EDB TC', 'EDB MC']
  },
  {
    code: 'HV',
    name: 'High Voltage Equipment',
    category: 'Power',
    description: 'Collector shoe, HSCB, main switch box, HTEB',
    icon: Zap,
    color: 'from-red-600/20 to-red-700/10',
    borderColor: 'border-red-600/30',
    drawings: 8,
    equipment: 8,
    keyWires: ['1209 HSCB TRIP'],
    subsystems: ['Collector Shoe', 'HSCB', 'Main Switch Box', 'Current Collector Fuse Box', 'HTEB/HTJB', 'Earth Brush']
  }
];

// Quick search data
const SEARCH_INDEX = [
  // Trainlines
  { type: 'trainline', code: '3003', name: 'FORWARD', description: 'Forward propulsion command', system: 'TRAC' },
  { type: 'trainline', code: '3004', name: 'REVERSE', description: 'Reverse propulsion command', system: 'TRAC' },
  { type: 'trainline', code: '3005', name: 'POWERING 1', description: 'Powering command level 1 (Cross-connected)', system: 'TRAC' },
  { type: 'trainline', code: '3006', name: 'POWERING 2', description: 'Powering command level 2 (Cross-connected)', system: 'TRAC' },
  { type: 'trainline', code: '3010', name: 'BRAKING', description: 'Braking command', system: 'TRAC' },
  { type: 'trainline', code: '3011', name: 'FULL SERVICE BRAKE', description: 'Full service brake command', system: 'TRAC' },
  { type: 'trainline', code: '4062', name: 'EM BRAKE LOOP NORMAL', description: 'Emergency brake loop normal path', system: 'BRAKE' },
  { type: 'trainline', code: '4103', name: 'EM BRAKE LOOP REDUNDANT', description: 'Emergency brake loop redundant path', system: 'BRAKE' },
  { type: 'trainline', code: '4122', name: 'PARKING BRAKE APPLIED', description: 'Parking brake applied indication', system: 'BRAKE' },
  { type: 'trainline', code: '4153', name: 'PARKING BRAKE RELEASED', description: 'Parking brake released indication', system: 'BRAKE' },
  { type: 'trainline', code: '6009', name: 'DOOR OPEN LEFT', description: 'Left side door open command', system: 'DOOR' },
  { type: 'trainline', code: '6014', name: 'DOOR CLOSE LEFT', description: 'Left side door close command', system: 'DOOR' },
  { type: 'trainline', code: '6046', name: 'DOOR OPEN RIGHT', description: 'Right side door open command', system: 'DOOR' },
  { type: 'trainline', code: '6051', name: 'DOOR CLOSE RIGHT', description: 'Right side door close command', system: 'DOOR' },
  { type: 'trainline', code: '6073', name: 'DOOR PROVING LOOP 1', description: 'Door proving loop signal 1', system: 'DOOR' },
  { type: 'trainline', code: '6112', name: 'ZERO SPEED', description: 'Zero speed signal', system: 'DOOR' },
  { type: 'trainline', code: '7001', name: 'CAB VAC IN SSK', description: 'Cab VAC in SSK signal', system: 'VAC' },
  { type: 'trainline', code: '7050', name: 'SALOON VAC 1 IN SSK', description: 'Saloon VAC 1 in SSK signal', system: 'VAC' },
  { type: 'trainline', code: '7060', name: 'SALOON VAC 2 IN SSK', description: 'Saloon VAC 2 in SSK signal', system: 'VAC' },
  { type: 'trainline', code: '7070', name: 'SMOKE DETECTION', description: 'Smoke detection alarm', system: 'VAC' },
  { type: 'trainline', code: '7071', name: 'DAMPER OPERATION', description: 'Damper operation signal', system: 'VAC' },
  { type: 'trainline', code: '9214', name: 'ATP MODE', description: 'ATP mode active', system: 'TMS' },
  { type: 'trainline', code: '9215', name: 'FWD MODE', description: 'Forward mode active', system: 'TMS' },
  { type: 'trainline', code: '9216', name: 'REV MODE', description: 'Reverse mode active', system: 'TMS' },
  // Equipment
  { type: 'equipment', code: 'VVVF1', name: 'VVVF Inverter 1', description: 'MELCO VVVF Inverter', system: 'TRAC' },
  { type: 'equipment', code: 'BCU1', name: 'Brake Control Unit 1', description: 'KNORR BCU', system: 'BRAKE' },
  { type: 'equipment', code: 'BECU1', name: 'Brake Electronic Control Unit 1', description: 'KNORR BECU', system: 'BRAKE' },
  { type: 'equipment', code: 'APS1', name: 'Auxiliary Power Supply 1', description: 'APS Unit', system: 'APS' },
  { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', description: 'MELCO TCMS RIO', system: 'TMS' },
  { type: 'equipment', code: 'DCU1', name: 'Door Control Unit 1', description: 'Door Control Unit', system: 'DOOR' },
  // Drawings
  { type: 'drawing', code: '942-58103', name: 'Train Lines Control', description: 'Trainline control signals', system: 'TRL' },
  { type: 'drawing', code: '942-58124', name: 'Brake Loop', description: 'Brake loop schematic', system: 'BRAKE' },
  { type: 'drawing', code: '942-58138', name: 'Left Door Operation', description: 'Left door operation schematic', system: 'DOOR' },
  { type: 'drawing', code: '942-58143', name: 'Cab VAC', description: 'Cab air conditioning schematic', system: 'VAC' },
  { type: 'drawing', code: '942-38606', name: 'TCMS RIO - M Car', description: 'TCMS Remote IO pin assignment', system: 'TMS' },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof SEARCH_INDEX>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = SEARCH_INDEX.filter(item =>
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">KMRCL VCC Explorer</h1>
                <p className="text-sm text-slate-400">Intelligent Wiring Knowledge System</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search wires, trainlines, equipment, drawings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  {searchResults.map((result, idx) => (
                    <Link
                      key={idx}
                      href={`/${result.type === 'trainline' ? 'trainlines' : result.type === 'equipment' ? 'equipment' : 'drawings'}/${result.code}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
                      onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    >
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        result.type === 'trainline' ? 'bg-blue-500/20 text-blue-400' :
                        result.type === 'equipment' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {result.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-200 truncate">{result.code} - {result.name}</p>
                        <p className="text-sm text-slate-400 truncate">{result.description}</p>
                      </div>
                      <span className="text-xs text-slate-500">{result.system}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Fleet Formation */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Fleet Formation: DMC-TC-MC-MC-TC-DMC</h2>
          <div className="flex gap-2">
            {[
              { label: 'DMC1', desc: 'Driving Motor Car', color: 'from-blue-600 to-blue-700', position: 1 },
              { label: 'TC1', desc: 'Trailer Car', color: 'from-slate-600 to-slate-700', position: 2 },
              { label: 'MC1', desc: 'Motor Car', color: 'from-purple-600 to-purple-700', position: 3 },
              { label: 'MC2', desc: 'Motor Car', color: 'from-purple-600 to-purple-700', position: 4 },
              { label: 'TC2', desc: 'Trailer Car', color: 'from-slate-600 to-slate-700', position: 5 },
              { label: 'DMC2', desc: 'Driving Motor Car', color: 'from-blue-600 to-blue-700', position: 6 }
            ].map((car) => (
              <div key={car.label} className="flex items-center gap-2">
                <div className={`px-4 py-2 bg-gradient-to-r ${car.color} rounded-lg text-white font-medium shadow-lg`}>
                  {car.label}
                </div>
                {car.position < 6 && <ChevronRight className="h-4 w-4 text-slate-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">113</p>
                <p className="text-sm text-slate-400">Drawings</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Cable className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">56+</p>
                <p className="text-sm text-slate-400">Trainlines</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Cpu className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">55+</p>
                <p className="text-sm text-slate-400">Equipment</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">16</p>
                <p className="text-sm text-slate-400">Systems</p>
              </div>
            </div>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">System Explorer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SYSTEMS_DATA.map((system) => {
              const Icon = system.icon;
              return (
                <Link key={system.code} href={`/systems/${system.code}`}>
                  <div className={`relative overflow-hidden bg-gradient-to-br ${system.color} border ${system.borderColor} rounded-xl p-5 h-full hover:scale-[1.02] transition-transform cursor-pointer group`}>
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                      <Icon className="h-20 w-20 text-white" />
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-white" />
                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium text-white">
                          {system.code}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                        {system.name}
                      </h3>
                      <p className="text-sm text-slate-300/80 mb-3 line-clamp-2">
                        {system.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {system.keyWires.slice(0, 3).map((wire) => (
                          <span key={wire} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/80">
                            {wire}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>{system.drawings} drawings</span>
                        <span>{system.equipment} equipment</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-3 gap-6">
          {/* Popular Trainlines */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Critical Trainlines
            </h3>
            <div className="space-y-2">
              {[
                { no: '3003', name: 'FORWARD', system: 'TRAC' },
                { no: '3005', name: 'POWERING 1', system: 'TRAC' },
                { no: '4062', name: 'EM BRAKE LOOP', system: 'BRAKE' },
                { no: '4122', name: 'PB APPLIED', system: 'BRAKE' },
                { no: '6009', name: 'DOOR OPEN L', system: 'DOOR' },
                { no: '6112', name: 'ZERO SPEED', system: 'DOOR' }
              ].map((tl) => (
                <Link
                  key={tl.no}
                  href={`/trainlines/${tl.no}`}
                  className="flex items-center justify-between p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <div>
                    <span className="font-mono text-cyan-400 font-medium">{tl.no}</span>
                    <span className="text-slate-300 ml-2">{tl.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{tl.system}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Key Equipment */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-400" />
              Key Equipment
            </h3>
            <div className="space-y-2">
              {[
                { code: 'VVVF1', name: 'VVVF Inverter 1', system: 'TRAC' },
                { code: 'BCU1', name: 'Brake Control Unit', system: 'BRAKE' },
                { code: 'APS1', name: 'Auxiliary Power Supply', system: 'APS' },
                { code: 'TCMS_RIO1', name: 'TCMS Remote IO', system: 'TMS' },
                { code: 'DCU1', name: 'Door Control Unit', system: 'DOOR' },
                { code: 'HSCB1', name: 'High Speed Circuit Breaker', system: 'HV' }
              ].map((eq) => (
                <Link
                  key={eq.code}
                  href={`/equipment/${eq.code}`}
                  className="flex items-center justify-between p-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <div>
                    <span className="font-mono text-purple-400 font-medium">{eq.code}</span>
                    <span className="text-slate-300 ml-2">{eq.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{eq.system}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Cross-Connections */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Cross-Connections
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="font-medium text-red-400">X1 Pins 19/20</p>
                <p className="text-sm text-slate-400">Powering 1 &amp; 2 crossed</p>
                <p className="text-xs text-slate-500 mt-1">3005 ↔ 3006</p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="font-medium text-amber-400">Jumper Positions 43-47</p>
                <p className="text-sm text-slate-400">Door open/close crossed</p>
                <p className="text-xs text-slate-500 mt-1">6009/6046 ↔ 6014/6051</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <Link href="/drawings" className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
            <FileText className="h-6 w-6 text-blue-400 mb-2" />
            <p className="font-medium text-white">All Drawings</p>
            <p className="text-sm text-slate-400">Browse by system, car, or number</p>
          </Link>
          <Link href="/wires" className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
            <Cable className="h-6 w-6 text-cyan-400 mb-2" />
            <p className="font-medium text-white">Wire Database</p>
            <p className="text-sm text-slate-400">Search all wiring connections</p>
          </Link>
          <Link href="/trainlines" className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
            <Train className="h-6 w-6 text-amber-400 mb-2" />
            <p className="font-medium text-white">Trainline Explorer</p>
            <p className="text-sm text-slate-400">Trace signals across cars</p>
          </Link>
          <Link href="/tcms" className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
            <Activity className="h-6 w-6 text-teal-400 mb-2" />
            <p className="font-medium text-white">TCMS Points</p>
            <p className="text-sm text-slate-400">RIO I/O browser</p>
          </Link>
        </div>
      </div>
    </div>
  );
}