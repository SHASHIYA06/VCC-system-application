'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, Search, ArrowRight, Cpu, MapPin, Cable } from 'lucide-react';

const DRAWING_DATA: Record<string, any> = {
  '942-58131': {
    title: 'SIV and Distribution',
    description: 'Static Inverter and 110V DC Distribution',
    system: 'APS',
    pageCount: 3,
    connectors: ['APS1-CN1', 'APS1-CN2', 'APS1-CN3', 'APS1-CN4'],
    wires: ['5020', '5021', '5030', '5031', '5040', '5050'],
    relatedDocs: ['TC UF Pin Drawings'],
  },
  '942-58130': {
    title: 'APS Main Circuit',
    description: 'Auxiliary Power Supply and Battery System',
    system: 'APS',
    pageCount: 2,
    connectors: ['APS1-CN1', 'APS1-CN2', 'BATT1-CN1'],
    wires: ['1040', '1050', '5000', '5064'],
    relatedDocs: ['TC UF Pin Drawings'],
  },
  '942-58138': {
    title: 'Door Control Circuit',
    description: 'DCU Control and Motor Drive',
    system: 'DOOR',
    pageCount: 4,
    connectors: ['DCU1-CN1', 'DCU1-CN2', 'DCU1-CN3', 'DCU1-CN4'],
    wires: ['6009', '6014', '6046', '6051', '6073', '6076'],
    relatedDocs: ['DMC Ceiling', 'MC Ceiling'],
  },
  '942-38606': {
    title: 'MC Car TCMS',
    description: 'MC car TCMS RIO and I/O mapping',
    system: 'TMS',
    pageCount: 6,
    connectors: ['TCMS_RIO1-CN1', 'TCMS_RIO1-CN10', 'TCMS_RIO1-CN11', 'TCMS_RIO1-CN12'],
    wires: ['9001', '9100-9120', '9200-9220', '9300-9320'],
    relatedDocs: ['MC Ceiling Pin Drawings'],
  },
  '942-38409': {
    title: 'TC Car TCMS',
    description: 'TC car TCMS RIO and I/O mapping',
    system: 'TMS',
    pageCount: 4,
    connectors: ['TCMS_RIO2-CN1', 'TCMS_RIO2-CN10', 'TCMS_RIO2-CN11', 'TCMS_RIO2-CN12'],
    wires: ['9002', '9100-9120', '9200-9220'],
    relatedDocs: ['TC Ceiling Pin Drawings'],
  },
  '942-58147': {
    title: 'PA System',
    description: 'Public Address and DVAS',
    system: 'COMMS',
    pageCount: 2,
    connectors: ['PA_AMP-CN1', 'PA_AMP-CN2', 'DVAS-CN1', 'DVAS-CN2'],
    wires: ['8001', '8002', '8003', '8010', '8015'],
    relatedDocs: ['TC Ceiling', 'MC Ceiling'],
  },
  '942-58153': {
    title: 'CCTV System',
    description: 'CCTV Controller and Recording',
    system: 'COMMS',
    pageCount: 3,
    connectors: ['CCTV_CTRL-CN1', 'CCTV_CTRL-CN2', 'NVR-CN1'],
    wires: ['8050', '8055', '8060', '8065'],
    relatedDocs: ['MC Ceiling Pin Drawings'],
  },
};

const ALL_DRAWINGS = [
  { drawingNo: '942-58101', title: 'VCC Drawing Index', system: 'GEN', category: 'Index' },
  { drawingNo: '942-58102', title: 'Drawing Classification', system: 'GEN', category: 'Classification' },
  { drawingNo: '942-58103', title: 'HV System Circuit', system: 'HV', category: 'Power' },
  { drawingNo: '942-58104', title: 'Pantograph Circuit', system: 'HV', category: 'Power' },
  { drawingNo: '942-58107', title: 'Trainline 3000 Series', system: 'TRL', category: 'Trainlines' },
  { drawingNo: '942-58108', title: 'Trainline 4000 Series', system: 'TRL', category: 'Trainlines' },
  { drawingNo: '942-58109', title: 'Trainline 5000 Series', system: 'TRL', category: 'Trainlines' },
  { drawingNo: '942-58110', title: 'Trainline 6000 Series', system: 'TRL', category: 'Trainlines' },
  { drawingNo: '942-58111', title: 'Trainline 7000 Series', system: 'TRL', category: 'Trainlines' },
  { drawingNo: '942-58119', title: 'Traction Motor Circuit', system: 'TRAC', category: 'Traction' },
  { drawingNo: '942-58120', title: 'VVVF Control Circuit', system: 'TRAC', category: 'Traction' },
  { drawingNo: '942-58121', title: 'Traction Power Circuit', system: 'TRAC', category: 'Traction' },
  { drawingNo: '942-58123', title: 'Brake Control Circuit', system: 'BRAKE', category: 'Brake' },
  { drawingNo: '942-58124', title: 'Emergency Brake Circuit', system: 'BRAKE', category: 'Brake' },
  { drawingNo: '942-58125', title: 'Brake Electronics', system: 'BRAKE', category: 'Brake' },
  { drawingNo: '942-58126', title: 'Parking Brake Circuit', system: 'BRAKE', category: 'Brake' },
  { drawingNo: '942-58127', title: 'Brake Pneumatic Circuit', system: 'BRAKE', category: 'Brake' },
  { drawingNo: '942-58128', title: 'Bogie Speed Sensors', system: 'BOGIE', category: 'Bogie' },
  { drawingNo: '942-58129', title: 'Bogie Monitoring', system: 'BOGIE', category: 'Bogie' },
  { drawingNo: '942-58130', title: 'APS Main Circuit', system: 'APS', category: 'Power' },
  { drawingNo: '942-58131', title: 'SIV and Distribution', system: 'APS', category: 'Power' },
  { drawingNo: '942-58132', title: 'Shore Supply', system: 'APS', category: 'Power' },
  { drawingNo: '942-58137', title: 'Door Supply Circuit', system: 'DOOR', category: 'Door' },
  { drawingNo: '942-58138', title: 'Door Control Circuit', system: 'DOOR', category: 'Door' },
  { drawingNo: '942-58139', title: 'Door Position Sensors', system: 'DOOR', category: 'Door' },
  { drawingNo: '942-58140', title: 'Door Proving Loop', system: 'DOOR', category: 'Door' },
  { drawingNo: '942-58141', title: 'Door Local Control', system: 'DOOR', category: 'Door' },
  { drawingNo: '942-58142', title: 'Door Emergency Release', system: 'DOOR', category: 'Door' },
  { drawingNo: '942-58143', title: 'Cab HVAC Circuit', system: 'VAC', category: 'HVAC' },
  { drawingNo: '942-58144', title: 'Saloon HVAC Circuit', system: 'VAC', category: 'HVAC' },
  { drawingNo: '942-58145', title: 'Smoke Detection', system: 'VAC', category: 'HVAC' },
  { drawingNo: '942-58146', title: 'TCMS System Overview', system: 'TMS', category: 'TCMS' },
  { drawingNo: '942-58147', title: 'PA System', system: 'COMMS', category: 'Comms' },
  { drawingNo: '942-58148', title: 'DVAS Circuit', system: 'COMMS', category: 'Comms' },
  { drawingNo: '942-58149', title: 'PIS System', system: 'COMMS', category: 'Comms' },
  { drawingNo: '942-58150', title: 'TFT Display Circuit', system: 'COMMS', category: 'Comms' },
  { drawingNo: '942-58151', title: 'Radio System', system: 'COMMS', category: 'Comms' },
  { drawingNo: '942-58152', title: 'ATC/CBTC', system: 'COMMS', category: 'Comms' },
  { drawingNo: '942-58153', title: 'CCTV System', system: 'COMMS', category: 'Comms' },
  { drawingNo: '942-58154', title: 'Camera Wiring', system: 'COMMS', category: 'Comms' },
];

const SYSTEM_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  GEN: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'General' },
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Traction' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Brake' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Door' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'APS' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'VAC/HVAC' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'TCMS' },
  COMMS: { color: 'text-pink-400', bg: 'bg-pink-500/20', label: 'Comms' },
  HV: { color: 'text-red-600', bg: 'bg-red-600/20', label: 'HV' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Trainlines' },
  BOGIE: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Bogie' },
};

function DrawingsContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('doc');
  
  const [search, setSearch] = useState('');
  const [filterSystem, setFilterSystem] = useState<string | null>(null);

  const filteredDrawings = ALL_DRAWINGS.filter(d => {
    const matchSearch = !search || 
      d.drawingNo.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase());
    const matchSystem = !filterSystem || d.system === filterSystem;
    return matchSearch && matchSystem;
  });

  const groupedDrawings = filteredDrawings.reduce((acc, d) => {
    if (!acc[d.system]) acc[d.system] = [];
    acc[d.system].push(d);
    return acc;
  }, {} as Record<string, typeof ALL_DRAWINGS>);

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <FileText className="h-8 w-8 text-cyan-400" />
          VCC Drawing Register
        </h1>
        <p className="mt-2 text-slate-400">
          Complete index of all Vehicle Control Circuit drawings - {ALL_DRAWINGS.length} drawings
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by drawing number or title..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200" />
        </div>
        <select value={filterSystem || ''} onChange={(e) => setFilterSystem(e.target.value || null)}
          className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200">
          <option value="">All Systems</option>
          {Object.keys(SYSTEM_COLORS).map(sys => (
            <option key={sys} value={sys}>{SYSTEM_COLORS[sys].label}</option>
          ))}
        </select>
      </div>

      {/* Drawings by System */}
      <div className="space-y-8">
        {Object.entries(groupedDrawings).map(([systemCode, drawings]) => {
          const sysInfo = SYSTEM_COLORS[systemCode] || SYSTEM_COLORS['GEN'];
          
          return (
            <div key={systemCode} className="glass-card overflow-hidden">
              <div className={`px-6 py-4 border-b border-slate-700/50 flex items-center justify-between ${sysInfo.bg}`}>
                <div className="flex items-center gap-3">
                  <Cpu className={`h-5 w-5 ${sysInfo.color}`} />
                  <span className={`font-bold text-lg ${sysInfo.color}`}>{systemCode}</span>
                  <span className="text-slate-400 text-sm">{sysInfo.label}</span>
                </div>
                <Link href={`/systems/${systemCode}`} className="text-xs text-cyan-400 hover:text-cyan-300">
                  View System <ArrowRight className="h-4 w-4 inline" />
                </Link>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {drawings.map(dwg => {
                  const details = DRAWING_DATA[dwg.drawingNo];
                  
                  return (
                    <div key={dwg.drawingNo} className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Link href={`/drawings/${dwg.drawingNo}`} className="font-mono text-cyan-400 font-bold">
                          {dwg.drawingNo}
                        </Link>
                        <span className="text-xs text-slate-500">{dwg.category}</span>
                      </div>
                      <div className="text-sm text-white mb-2">{dwg.title}</div>
                      
                      {details && (
                        <div className="space-y-1 text-xs text-slate-500">
                          {details.connectors && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{details.connectors.length} connectors</span>
                            </div>
                          )}
                          {details.wires && (
                            <div className="flex items-center gap-1">
                              <Cable className="h-3 w-3" />
                              <span>{Array.isArray(details.wires) ? details.wires.length : details.wires.split(',').length} wires</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Link href={`/drawings/${dwg.drawingNo}`} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                        View Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDrawings.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No drawings found</p>
        </div>
      )}
    </div>
  );
}

export default function DrawingsPage() {
  return (
    <Suspense fallback={
      <div className="animated-bg min-h-screen p-6 grid-pattern flex items-center justify-center">
        <div className="text-cyan-400">Loading drawings...</div>
      </div>
    }>
      <DrawingsContent />
    </Suspense>
  );
}