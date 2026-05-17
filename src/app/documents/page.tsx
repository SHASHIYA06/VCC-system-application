'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Search, Cpu, MapPin, Zap, Settings, Train, DoorOpen, Battery, Radio, Wind, ShieldCheck, Layers, RefreshCw, ChevronRight, FolderOpen } from 'lucide-react';

interface DocumentData {
  id: string;
  filename: string;
  title: string;
  category: string;
  carType: string;
  location: string;
  pageCount: number;
  description: string;
  sourcePath: string;
}

const CAR_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DMC: { label: 'DMC', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Zap },
  TC: { label: 'TC', color: 'text-green-400', bg: 'bg-green-500/20', icon: Train },
  MC: { label: 'MC', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Zap },
  CAB: { label: 'Cab', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Settings },
  ALL: { label: 'All', color: 'text-slate-400', bg: 'bg-slate-500/20', icon: FileText },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  REFERENCE: { label: 'Reference', color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: FileText },
  PIN_DRAWING: { label: 'Pin Drawing', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: MapPin },
  LAYOUT: { label: 'Layout', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Layers },
  OCR: { label: 'OCR', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Search },
};

const LOCATION_CONFIG: Record<string, { label: string; color: string }> = {
  CEILING: { label: 'Ceiling', color: 'text-cyan-400' },
  UNDERFRAME: { label: 'Underframe', color: 'text-amber-400' },
  CAB: { label: 'Cab', color: 'text-purple-400' },
  ALL: { label: 'All Areas', color: 'text-slate-400' },
};

const SYSTEM_LINKS: Record<string, { name: string; color: string; href: string }[]> = {
  'VCC Description': [
    { name: 'TRL', color: 'text-blue-400', href: '/systems/TRL' },
    { name: 'TRAC', color: 'text-orange-400', href: '/systems/TRAC' },
    { name: 'BRAKE', color: 'text-red-400', href: '/systems/BRAKE' },
    { name: 'DOOR', color: 'text-amber-400', href: '/systems/DOOR' },
    { name: 'APS', color: 'text-green-400', href: '/systems/APS' },
    { name: 'VAC', color: 'text-cyan-400', href: '/systems/VAC' },
    { name: 'TMS', color: 'text-purple-400', href: '/systems/TMS' },
    { name: 'COMMS', color: 'text-pink-400', href: '/systems/COMMS' },
  ],
  'CAB': [
    { name: 'CAB', color: 'text-purple-400', href: '/systems/CAB' },
    { name: 'COMMS', color: 'text-pink-400', href: '/systems/COMMS' },
  ],
  'DMC Ceiling': [
    { name: 'TMS', color: 'text-purple-400', href: '/systems/TMS' },
    { name: 'DOOR', color: 'text-amber-400', href: '/systems/DOOR' },
    { name: 'COMMS', color: 'text-pink-400', href: '/systems/COMMS' },
  ],
  'DMC UF': [
    { name: 'TRAC', color: 'text-orange-400', href: '/systems/TRAC' },
    { name: 'BRAKE', color: 'text-red-400', href: '/systems/BRAKE' },
    { name: 'TRL', color: 'text-blue-400', href: '/systems/TRL' },
  ],
  'TC Ceiling': [
    { name: 'TMS', color: 'text-purple-400', href: '/systems/TMS' },
    { name: 'VAC', color: 'text-cyan-400', href: '/systems/VAC' },
    { name: 'COMMS', color: 'text-pink-400', href: '/systems/COMMS' },
  ],
  'TC UF': [
    { name: 'APS', color: 'text-green-400', href: '/systems/APS' },
  ],
  'MC Ceiling': [
    { name: 'TMS', color: 'text-purple-400', href: '/systems/TMS' },
    { name: 'COMMS', color: 'text-pink-400', href: '/systems/COMMS' },
  ],
  'MC UF': [
    { name: 'TRAC', color: 'text-orange-400', href: '/systems/TRAC' },
    { name: 'BRAKE', color: 'text-red-400', href: '/systems/BRAKE' },
  ],
};

const DOCUMENTS_DATA: DocumentData[] = [
  { id: 'doc-1', filename: 'VCC DESCRIPTION 13.12.2017.pdf', title: 'VCC System Description', category: 'REFERENCE', carType: 'ALL', location: 'ALL', pageCount: 54, description: 'Complete VCC system description - trainline reference (1000-9000 series), connector details, equipment layout across all cars. Contains cross-connection information, wiring conventions, and system architecture.', sourcePath: '/DOCUMENTS/VCC DESCRIPTION 13.12.2017.pdf' },
  { id: 'doc-2', filename: 'CAB_PIN DRAWINGS.pdf', title: 'Cab Pin Drawings - Part 1', category: 'PIN_DRAWING', carType: 'CAB', location: 'CAB', pageCount: 48, description: 'Driver cab connector pin assignments - operating panel CN1-CN5, master controller, indicator lamps, horn control, wiper control, lights control.', sourcePath: '/DOCUMENTS/CAB_PIN DRAWINGS.pdf' },
  { id: 'doc-3', filename: 'CAB_PIN DRAWINGS 2.pdf', title: 'Cab Pin Drawings - Part 2', category: 'PIN_DRAWING', carType: 'CAB', location: 'CAB', pageCount: 48, description: 'Extended cab pin assignments - radio interface, CCTV monitor, PIS display, additional spare pins.', sourcePath: '/DOCUMENTS/CAB_PIN DRAWINGS 2.pdf' },
  { id: 'doc-4', filename: 'DMC_CEILING.pdf', title: 'DMC Car Ceiling Layout', category: 'LAYOUT', carType: 'DMC', location: 'CEILING', pageCount: 28, description: 'DMC car ceiling equipment layout - TCMS_RIO1 (40-pin connector), DCU1-DCU4 (door control), EDB1-EDB4 (electrical distribution), CCTV controller.', sourcePath: '/DOCUMENTS/DMC_CEILING.pdf' },
  { id: 'doc-5', filename: 'DMC UF_PIN DRAWINGS.pdf', title: 'DMC Underframe Pin Drawings', category: 'PIN_DRAWING', carType: 'DMC', location: 'UNDERFRAME', pageCount: 26, description: 'DMC underframe connector pin assignments - VVVF (CN1-CN4), BCU1 (brake control), LTEB1 (X1-X4 intercar jumpers - 74-pin each), HSCB.', sourcePath: '/DOCUMENTS/DMC UF_PIN DRAWINGS.pdf' },
  { id: 'doc-6', filename: 'TC_CEILING PIN DRAWINGS.pdf', title: 'TC Car Ceiling Pin Drawings', category: 'PIN_DRAWING', carType: 'TC', location: 'CEILING', pageCount: 27, description: 'TC car ceiling connector pin assignments - TCMS_RIO2 (40-pin), VAC1-VAC2 (HVAC), PIS controller, PA amplifier.', sourcePath: '/DOCUMENTS/TC_CEILING PIN DRAWINGS.pdf' },
  { id: 'doc-7', filename: 'TC _UF PIN DRAWINGS.pdf', title: 'TC Underframe Pin Drawings', category: 'PIN_DRAWING', carType: 'TC', location: 'UNDERFRAME', pageCount: 21, description: 'TC underframe connector pin assignments - APS1 (auxiliary power), SIV1 (static inverter), BATT1 (battery), SSB1 (shore supply box).', sourcePath: '/DOCUMENTS/TC _UF PIN DRAWINGS.pdf' },
  { id: 'doc-8', filename: 'MC_CEILING_PIN DRAWINGS.pdf', title: 'MC Car Ceiling Pin Drawings', category: 'PIN_DRAWING', carType: 'MC', location: 'CEILING', pageCount: 58, description: 'MC car ceiling connector pin assignments - TCMS_RIO1, CCTV cameras (CAM1-CAM16), TFT displays (TFT1-TFT8), DVAS, PIS displays.', sourcePath: '/DOCUMENTS/MC_CEILING_PIN DRAWINGS.pdf' },
  { id: 'doc-9', filename: 'MC_UF.pdf', title: 'MC Underframe Layout', category: 'LAYOUT', carType: 'MC', location: 'UNDERFRAME', pageCount: 27, description: 'MC car underframe equipment layout - VVVF2, BCU3, BECU1 (brake electronic), LTEB3, traction motors M1-M4.', sourcePath: '/DOCUMENTS/MC_UF.pdf' },
  { id: 'doc-10', filename: 'KMRCL VCC Drawings_OCR.pdf', title: 'KMRCL VCC Drawings OCR', category: 'OCR', carType: 'ALL', location: 'ALL', pageCount: 10, description: 'OCR extracted VCC drawings - connector pin tables, wire connection lists, trainline cross reference, inter-car jumper details.', sourcePath: '/DOCUMENTS/KMRCL VCC Drawings_OCR.pdf' },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentData[]>(DOCUMENTS_DATA);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterCarType, setFilterCarType] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredDocuments = documents.filter(doc => {
    const matchSearch = !search || 
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.filename.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || doc.category === filterCategory;
    const matchCarType = !filterCarType || doc.carType === filterCarType;
    const matchLocation = !filterLocation || doc.location === filterLocation;
    return matchSearch && matchCategory && matchCarType && matchLocation;
  });

  const getRelatedSystems = (doc: DocumentData): { name: string; color: string; href: string }[] => {
    const title = doc.title;
    for (const [key, systems] of Object.entries(SYSTEM_LINKS)) {
      if (title.includes(key)) {
        return systems;
      }
    }
    return [];
  };

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-cyan-400" />
          Technical Documents Library
        </h1>
        <p className="mt-2 text-slate-400">
          Complete library of VCC technical documents - {documents.length} documents with wiring, pin assignments, and system connections
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search documents..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200" />
        </div>
        
        <select value={filterCategory || ''} onChange={(e) => setFilterCategory(e.target.value || null)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="">All Categories</option>
          {Object.keys(CATEGORY_CONFIG).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
          ))}
        </select>

        <select value={filterCarType || ''} onChange={(e) => setFilterCarType(e.target.value || null)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="">All Car Types</option>
          {Object.keys(CAR_TYPE_CONFIG).map(car => (
            <option key={car} value={car}>{CAR_TYPE_CONFIG[car].label}</option>
          ))}
        </select>

        <select value={filterLocation || ''} onChange={(e) => setFilterLocation(e.target.value || null)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="">All Locations</option>
          <option value="CEILING">Ceiling</option>
          <option value="UNDERFRAME">Underframe</option>
          <option value="CAB">Cab</option>
          <option value="ALL">All Areas</option>
        </select>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocuments.map(doc => {
          const carConfig = CAR_TYPE_CONFIG[doc.carType] || CAR_TYPE_CONFIG['ALL'];
          const catConfig = CATEGORY_CONFIG[doc.category] || CATEGORY_CONFIG['REFERENCE'];
          const locConfig = LOCATION_CONFIG[doc.location] || LOCATION_CONFIG['ALL'];
          const CatIcon = catConfig.icon;
          const relatedSystems = getRelatedSystems(doc);

          return (
            <div key={doc.id} className="glass-card p-6 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${catConfig.bg}`}>
                  <CatIcon className={`h-6 w-6 ${catConfig.color}`} />
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${catConfig.bg} ${catConfig.color}`}>
                    {catConfig.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${carConfig.bg} ${carConfig.color}`}>
                    {carConfig.label}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{doc.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{doc.description}</p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                <div>
                  <span className="font-medium">File:</span> {doc.filename}
                </div>
                <div>
                  <span className="font-medium">Pages:</span> {doc.pageCount}
                </div>
                <div className={locConfig.color}>
                  <span className="font-medium">Location:</span> {locConfig.label}
                </div>
              </div>

              {relatedSystems.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-400 mb-2">Related Systems:</div>
                  <div className="flex flex-wrap gap-2">
                    {relatedSystems.map(sys => (
                      <Link 
                        key={sys.name} 
                        href={sys.href}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${sys.color} bg-slate-800/50 hover:bg-slate-700/50`}
                      >
                        {sys.name}
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Link 
                  href={`/drawings?doc=${doc.id}`}
                  className="flex-1 text-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm"
                >
                  View Details
                </Link>
                <Link 
                  href={`/api/documents/serve/${encodeURIComponent(doc.filename)}`}
                  target="_blank"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm"
                >
                  <Download className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No documents match your filters</p>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{documents.length}</div>
          <div className="text-sm text-slate-500">Total Documents</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {documents.filter(d => d.category === 'PIN_DRAWING').length}
          </div>
          <div className="text-sm text-slate-500">Pin Drawings</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {documents.reduce((acc, d) => acc + d.pageCount, 0)}
          </div>
          <div className="text-sm text-slate-500">Total Pages</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">4</div>
          <div className="text-sm text-slate-500">Car Types</div>
        </div>
      </div>
    </div>
  );
}