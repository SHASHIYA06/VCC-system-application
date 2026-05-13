'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Cpu, FileText, Lightbulb, Zap, Shield, DoorOpen, Wind, Radio, Battery, Settings, Train, Link2, ExternalLink, CheckCircle2 } from 'lucide-react';

interface Abbreviation {
  abbreviation: string;
  description: string;
  category: string;
}

interface VCCSystem {
  systemCode: string;
  systemName: string;
  chapter: number;
  description: string;
  drawings: string[];
  keyComponents: string[];
}

interface DrawingLink {
  drawingNo: string;
  found: boolean;
}

const SYSTEM_INFO: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  GEN: { label: 'General', color: 'text-slate-400', bg: 'bg-slate-500/20', icon: Settings },
  TRL: { label: 'Train Control', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Train },
  LIGHT: { label: 'Lighting & Interior', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Lightbulb },
  COUPL: { label: 'Coupling', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Link2 },
  TRAC: { label: 'Traction', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Zap },
  BRAKE: { label: 'Brake System', color: 'text-red-400', bg: 'bg-red-500/20', icon: Shield },
  APS: { label: 'Aux Power', color: 'text-green-400', bg: 'bg-green-500/20', icon: Battery },
  DOOR: { label: 'Door System', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: DoorOpen },
  VAC: { label: 'VAC/HVAC', color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: Wind },
  TMS: { label: 'TCMS', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Cpu },
  COMMS: { label: 'Communication', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Radio },
};

const VCC_SYSTEMS: VCCSystem[] = [
  {
    systemCode: 'GEN',
    systemName: 'General',
    chapter: 3,
    description: 'General part drawings provide useful information such as Drawing List, Wiring numbers, description, Train-lines, symbols etc.',
    drawings: ['942-58099', '942-58100', '942-58101', '942-58102', '942-58103', '942-58104', '942-58105', '942-58106'],
    keyComponents: ['Drawing List', 'Classification', 'Wiring Numbers', 'Symbols', 'Train Lines']
  },
  {
    systemCode: 'TRL',
    systemName: 'Train Control',
    chapter: 4,
    description: 'Train control circuits including Controlling Cab, start-up, System status indication and Train line supply Contactor circuits.',
    drawings: ['942-58107', '942-58108', '942-58109', '942-58110', '942-58111'],
    keyComponents: ['HCR', 'TCR', 'LCAR', 'STUR', 'ASDR', 'AUX ON', 'AOFFS', 'RESET', 'TLSC']
  },
  {
    systemCode: 'LIGHT',
    systemName: 'Vehicle Structure & Interior',
    chapter: 5,
    description: 'Vehicle structure & interior fitting circuits including Head Light, Cab Main Light, Tail Light, Flasher Light, Console Light, Saloon Lights, Gangway Light, Windscreen Wiper.',
    drawings: ['942-58112', '942-58113', '942-58114', '942-58115', '942-58116'],
    keyComponents: ['HLS', 'HL(L/R)', 'CML', 'TL(L/R)', 'FL', 'DCL', 'ELCB1-4', 'GWL', 'WWCB']
  },
  {
    systemCode: 'COUPL',
    systemName: 'Coupling & Uncoupling',
    chapter: 6,
    description: 'Coupling and uncoupling control circuits for train set connection.',
    drawings: ['942-58117'],
    keyComponents: ['COLPB', 'UCPB', 'MCCMV', 'MCUCMV', 'MCDR', 'COLR']
  },
  {
    systemCode: 'TRAC',
    systemName: 'Traction System',
    chapter: 7,
    description: 'Traction system including DC750V main power supply, speed control, VVVF Inverter interface and grounding.',
    drawings: ['H7L7956', '942-58119', '942-58120', '942-58121'],
    keyComponents: ['HSCB', 'VVVF', 'TBC', 'MS', 'EB(1-4)', 'EOSS']
  },
  {
    systemCode: 'BRAKE',
    systemName: 'Brake System',
    chapter: 8,
    description: 'Brake system including Compressor Control, Brake Loop, Emergency Brake Loop, Parking Brake, Horn and Brake Control.',
    drawings: ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127', '942-58128', '942-58129'],
    keyComponents: ['CM', 'ADU', 'BCU', 'BECU', 'BCPS', 'BLCB', 'BLPR', 'EBLR', 'EBMV', 'EBVR', 'PBR', 'PBMV', 'HMV1', 'HMV2']
  },
  {
    systemCode: 'APS',
    systemName: 'Auxiliary Power System',
    chapter: 9,
    description: 'Auxiliary power system including APS, Shore Supply 415VAC, Power Extension Box and Battery Control.',
    drawings: ['942-58130', '942-58131', '942-58132'],
    keyComponents: ['APS', 'SSB', 'SIV', 'BATT', 'BCB', 'BUVDR', 'APSCB', 'SSCB', 'ESK']
  },
  {
    systemCode: 'DOOR',
    systemName: 'Door System',
    chapter: 10,
    description: 'Door system including Saloon Door Supply Voltage, Door Operation, Door Proving Loop, Local Door Interlock Circuit and Communication with TCMS.',
    drawings: ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141', '942-58142'],
    keyComponents: ['DCU', 'EDCU', 'DMS', 'DOLR', 'DORR', 'DCLR', 'DCRR', 'DPR', 'ADCR', 'ADCLp']
  },
  {
    systemCode: 'VAC',
    systemName: 'Air Conditioning System',
    chapter: 11,
    description: 'Air conditioning system including Cab VAC and Saloon VAC.',
    drawings: ['942-58143', '942-58144', '942-58145'],
    keyComponents: ['CAB_VAC', 'VAC', 'ADMV', 'FR']
  },
  {
    systemCode: 'TMS',
    systemName: 'Train Management System',
    chapter: 12,
    description: 'Train Management System (TCMS) for train control and monitoring.',
    drawings: ['942-58146'],
    keyComponents: ['TCMS', 'RIO', 'TCPU', 'VDU', 'DCS']
  },
  {
    systemCode: 'COMMS',
    systemName: 'Communication System',
    chapter: 13,
    description: 'Communication system including PIS, PA, CCTV, Radio, ATP interface.',
    drawings: ['942-58147', '942-58148', '942-58149', '942-58150', '942-58151', '942-58152', '942-58153', '942-58154'],
    keyComponents: ['PIS', 'PIB', 'DVAU', 'PA', 'PAMP', 'CCTV', 'VDU', 'ATPCB', 'TRU']
  }
];

const INITIAL_ABBREVIATIONS: Abbreviation[] = [
  { abbreviation: 'AC1,2CB', description: 'Saloon Air-con1,2 Circuit Breaker', category: 'VAC' },
  { abbreviation: 'ADCLp', description: 'All Doors Closed Indicator', category: 'DOOR' },
  { abbreviation: 'ADCR', description: 'All Doors Closed Relay', category: 'DOOR' },
  { abbreviation: 'AUX ON', description: 'Auxiliary On Switch', category: 'APS' },
  { abbreviation: 'BCU', description: 'Brake Control Unit', category: 'BRAKE' },
  { abbreviation: 'BECU', description: 'Brake Electronic Control Unit', category: 'BRAKE' },
  { abbreviation: 'CM', description: 'Compressor Motor', category: 'BRAKE' },
  { abbreviation: 'CML', description: 'Cab Main Light', category: 'LIGHT' },
  { abbreviation: 'DMS', description: 'Door Mode Switch', category: 'DOOR' },
  { abbreviation: 'EBMV', description: 'Emergency Brake Magnetic Valve', category: 'BRAKE' },
  { abbreviation: 'HSCB', description: 'High Speed Circuit Breaker', category: 'HV' },
  { abbreviation: 'HCR', description: 'Head Control Relay', category: 'CAB' },
  { abbreviation: 'KOR', description: 'Key On Relay', category: 'CAB' },
  { abbreviation: 'LCAR', description: 'Last Cab Activated Relay', category: 'CAB' },
  { abbreviation: 'MS', description: 'Mode Selector', category: 'CAB' },
  { abbreviation: 'PBMV', description: 'Parking Brake Magnetic Valve', category: 'BRAKE' },
  { abbreviation: 'STUR', description: 'Start-Up Relay', category: 'APS' },
  { abbreviation: 'TBC', description: 'Traction Brake Controller', category: 'TRAC' },
  { abbreviation: 'TCR', description: 'Tail Control Relay', category: 'CAB' },
  { abbreviation: 'TCMS', description: 'Train Control Management System', category: 'TMS' },
  { abbreviation: 'VVVF', description: 'Variable Voltage Variable Frequency Inverter', category: 'TRAC' },
  { abbreviation: 'ZVAR', description: 'Zero Velocity Auxiliary Relay', category: 'TRAC' },
];

interface DrawingMap {
  [drawingNo: string]: { id: string; pages: number } | null;
}

export default function VCCReferencePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'abbreviations' | 'systems' | 'wire-format'>('abbreviations');
  const [filteredAbbrs, setFilteredAbbrs] = useState<Abbreviation[]>(INITIAL_ABBREVIATIONS);
  const [drawingMap, setDrawingMap] = useState<DrawingMap>({});
  const [loadingDrawings, setLoadingDrawings] = useState(true);

  useEffect(() => {
    async function fetchDrawingMap() {
      try {
        const response = await fetch('/api/drawings');
        if (response.ok) {
          const data = await response.json();
          const map: DrawingMap = {};
          data.drawings.forEach((d: any) => {
            map[d.drawingNo] = { id: d.id, pages: d.pageCount };
          });
          setDrawingMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch drawings:', error);
      } finally {
        setLoadingDrawings(false);
      }
    }
    fetchDrawingMap();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredAbbrs(INITIAL_ABBREVIATIONS);
    } else {
      const query = search.toLowerCase();
      setFilteredAbbrs(INITIAL_ABBREVIATIONS.filter(a => 
        a.abbreviation.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      ));
    }
  }, [search]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      VAC: 'bg-cyan-500/20 text-cyan-400',
      DOOR: 'bg-amber-500/20 text-amber-400',
      APS: 'bg-green-500/20 text-green-400',
      BRAKE: 'bg-red-500/20 text-red-400',
      LIGHT: 'bg-yellow-500/20 text-yellow-400',
      HV: 'bg-red-600/20 text-red-400',
      CAB: 'bg-violet-500/20 text-violet-400',
      TRAC: 'bg-orange-500/20 text-orange-400',
      TMS: 'bg-purple-500/20 text-purple-400',
      COMMS: 'bg-emerald-500/20 text-emerald-400',
      GEN: 'bg-slate-500/20 text-slate-400',
      COUPL: 'bg-pink-500/20 text-pink-400',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400';
  };

  const getDrawingLink = (drawingNo: string) => {
    const info = drawingMap[drawingNo];
    if (info) {
      return { href: `/drawings/${info.id}`, exists: true, pages: info.pages };
    }
    return { href: `/drawings/${drawingNo}`, exists: false, pages: 0 };
  };

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC Technical Reference</h1>
        <p className="mt-2 text-slate-400">
          Complete technical documentation from VCC Description (13.12.2017) - 54 pages
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            54 pages
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            11 Systems
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="h-4 w-4" />
            100+ Abbreviations
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab('abbreviations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'abbreviations'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Abbreviations
        </button>
        <button
          onClick={() => setActiveTab('systems')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'systems'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          System Descriptions
        </button>
        <button
          onClick={() => setActiveTab('wire-format')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'wire-format'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Wire Number Format
        </button>
      </div>

      {activeTab === 'abbreviations' && (
        <div>
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search abbreviations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Abbreviation</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredAbbrs.map((abbr, index) => (
                    <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-cyan-400">{abbr.abbreviation}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{abbr.description}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getCategoryColor(abbr.category)}`}>
                          {abbr.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Showing {filteredAbbrs.length} of {INITIAL_ABBREVIATIONS.length} abbreviations. Full list available in database.
          </p>
        </div>
      )}

      {activeTab === 'systems' && (
        <div className="space-y-6">
          {VCC_SYSTEMS.map((system) => {
            const sysInfo = SYSTEM_INFO[system.systemCode] || SYSTEM_INFO['GEN'];
            const Icon = sysInfo.icon;
            
            return (
              <div key={system.systemCode} className="glass-card overflow-hidden">
                <div className={`px-6 py-4 border-b border-slate-700/50 ${sysInfo.bg}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${sysInfo.color}`} />
                    <div>
                      <span className={`font-bold text-lg ${sysInfo.color}`}>{system.systemCode}</span>
                      <span className="ml-2 text-slate-400 text-sm">{system.systemName}</span>
                    </div>
                    <span className="ml-4 text-xs text-slate-500">Chapter {system.chapter}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-slate-300 mb-4">{system.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Drawings ({system.drawings.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {system.drawings.map((dwg) => {
                          const link = getDrawingLink(dwg);
                          return (
                            <Link
                              key={dwg}
                              href={link.href}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-sm font-mono transition-all ${
                                link.exists
                                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
                                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600/50'
                              }`}
                            >
                              <span>{dwg}</span>
                              {link.exists && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                              {!link.exists && <ExternalLink className="h-3 w-3" />}
                              {link.exists && link.pages > 0 && (
                                <span className="text-xs opacity-70">({link.pages}p)</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Cpu className="h-4 w-4" /> Key Components
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {system.keyComponents.map((comp) => (
                          <span key={comp} className="text-xs bg-slate-700/30 px-2 py-1 rounded text-slate-300 font-mono">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'wire-format' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Wire Number Format (5-digit)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Conductor Classification</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="font-mono text-lg text-red-400 font-bold">HV</div>
                  <div className="text-sm text-slate-300">Main Circuit 750V</div>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <div className="font-mono text-lg text-orange-400 font-bold">ED</div>
                  <div className="text-sm text-slate-300">Propulsion Circuits - AC Traction Motors</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="font-mono text-lg text-green-400 font-bold">AP</div>
                  <div className="text-sm text-slate-300">Auxiliary Power - 3Ph 415V & 230V AC</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="font-mono text-lg text-blue-400 font-bold">BA</div>
                  <div className="text-sm text-slate-300">Battery Supply - 110V DC</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="font-mono text-lg text-purple-400 font-bold">S</div>
                  <div className="text-sm text-slate-300">Shielded - Measuring & Analogue Signals</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Number Structure</h3>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4">
                <div className="flex items-center gap-2 text-lg font-mono mb-2">
                  <span className="text-blue-400 font-bold">X</span>
                  <span className="text-green-400 font-bold">X</span>
                  <span className="text-orange-400 font-bold">X</span>
                  <span className="text-purple-400 font-bold">X</span>
                  <span className="text-cyan-400 font-bold">X</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex-1">1st: Car Type</span>
                  <span className="flex-1">2nd: System</span>
                  <span className="flex-1">3rd: Line</span>
                  <span className="flex-1">4th: Type</span>
                  <span className="flex-1">5th: Serial</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="text-sm text-slate-400">First digit (Car Type):</div>
                  <div className="text-sm text-white">None = Train line, D = DMC, T = TC, M = MC</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="text-sm text-slate-400">Second digit (System Hierarchy):</div>
                  <div className="text-sm text-white">0-9 = Different systems</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="text-sm text-slate-400">3rd-5th digits (Trainline/Serial):</div>
                  <div className="text-sm text-white">3xxx = Propulsion, 4xxx = Brake, 6xxx = Door, etc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}