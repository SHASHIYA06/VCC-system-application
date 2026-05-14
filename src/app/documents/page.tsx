'use client';

import Link from 'next/link';
import { FileText, Download, Search, Cpu, MapPin, Zap, Settings, Train, DoorOpen, Battery, Radio, Wind, ShieldCheck } from 'lucide-react';

const DOCUMENTS = [
  { 
    id: 'vcc-desc', 
    filename: 'VCC DESCRIPTION 13.12.2017.pdf',
    title: 'VCC Description Document', 
    description: 'Complete VCC system description - trainline reference, connector details, equipment layout',
    category: 'Reference',
    pageCount: 54,
    keySections: ['Trainline Index', 'Connector Pin Assignments', 'Equipment List', 'System Overview'],
    relatedSystems: ['TRL', 'TRAC', 'BRAKE', 'DOOR', 'APS', 'VAC', 'TMS', 'COMMS']
  },
  { 
    id: 'tc-ceiling', 
    filename: 'TC_CEILING PIN DRAWINGS.pdf',
    title: 'TC Car Ceiling Pin Assignments', 
    description: 'TC car ceiling connector pin drawings - TCMS RIO, VAC, PIS',
    category: 'Pin Drawings',
    pageCount: 3,
    keySections: ['TCMS_RIO2 CN1-CN4', 'VAC1 Connections', 'PIS Controller'],
    relatedSystems: ['TMS', 'VAC', 'COMMS']
  },
  { 
    id: 'tc-uf', 
    filename: 'TC _UF PIN DRAWINGS.pdf',
    title: 'TC Car Underframe Pin Assignments', 
    description: 'TC car underframe connector pin drawings - APS, Battery, Shore Supply',
    category: 'Pin Drawings',
    pageCount: 4,
    keySections: ['APS1 Connections', 'Battery Isolation', 'Shore Supply Box', 'SIV'],
    relatedSystems: ['APS']
  },
  { 
    id: 'mc-ceiling', 
    filename: 'MC_CEILING_PIN DRAWINGS.pdf',
    title: 'MC Car Ceiling Pin Assignments', 
    description: 'MC car ceiling connector pin drawings - TCMS RIO, CCTV, TFT Display',
    category: 'Pin Drawings',
    pageCount: 3,
    keySections: ['TCMS_RIO1 Connections', 'CCTV Controller', 'TFT Displays'],
    relatedSystems: ['TMS', 'COMMS']
  },
  { 
    id: 'dmc-uf', 
    filename: 'DMC UF_PIN DRAWINGS.pdf',
    title: 'DMC Car Underframe Pin Assignments', 
    description: 'DMC car underframe connector pin drawings - VVVF, BCU, LTEB',
    category: 'Pin Drawings',
    pageCount: 5,
    keySections: ['VVVF Inverter', 'Brake Control Unit', 'LTEB X1-X4 Jumpers'],
    relatedSystems: ['TRAC', 'BRAKE', 'TRL']
  },
  { 
    id: 'mc-uf', 
    filename: 'MC_UF.pdf',
    title: 'MC Car Underframe Layout', 
    description: 'MC car underframe equipment layout and connections',
    category: 'Layout',
    pageCount: 2,
    keySections: ['VVVF2', 'BCU3', 'BECU1', 'LTEB3'],
    relatedSystems: ['TRAC', 'BRAKE']
  },
  { 
    id: 'dmc-ceiling', 
    filename: 'DMC_CEILING.pdf',
    title: 'DMC Car Ceiling Layout', 
    description: 'DMC car ceiling equipment layout and connections',
    category: 'Layout',
    pageCount: 2,
    keySections: ['TCMS_RIO1', 'DCU1-4', 'EDB'],
    relatedSystems: ['TMS', 'DOOR']
  },
  { 
    id: 'cab-pin', 
    filename: 'CAB_PIN DRAWINGS.pdf',
    title: 'Cab Pin Drawings', 
    description: 'Driver cab connector pin assignments - controls, indicators',
    category: 'Pin Drawings',
    pageCount: 4,
    keySections: ['Operating Panel', 'Master Controller', 'Indicators', 'Radio'],
    relatedSystems: ['CAB', 'COMMS']
  },
  { 
    id: 'cab-pin-2', 
    filename: 'CAB_PIN DRAWINGS 2.pdf',
    title: 'Cab Pin Drawings (Extended)', 
    description: 'Extended cab pin assignments',
    category: 'Pin Drawings',
    pageCount: 2,
    keySections: ['Additional Controls', 'Spare Pins'],
    relatedSystems: ['CAB']
  },
  { 
    id: 'kmrcl-ocr', 
    filename: 'KMRCL VCC Drawings_OCR.pdf',
    title: 'KMRCL VCC Drawings OCR', 
    description: 'OCR extracted VCC drawings with connector and wire information',
    category: 'OCR',
    pageCount: 10,
    keySections: ['Connector Tables', 'Wire Lists', 'Trainline Cross Reference'],
    relatedSystems: ['GEN']
  },
];

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Reference': { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: FileText },
  'Pin Drawings': { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: MapPin },
  'Layout': { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Settings },
  'OCR': { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Search },
};

const SYSTEM_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'TRL': { label: 'Trainlines', color: 'text-blue-400', icon: Train },
  'TRAC': { label: 'Traction', color: 'text-orange-400', icon: Zap },
  'BRAKE': { label: 'Brake', color: 'text-red-400', icon: ShieldCheck },
  'DOOR': { label: 'Door', color: 'text-amber-400', icon: DoorOpen },
  'APS': { label: 'APS', color: 'text-green-400', icon: Battery },
  'VAC': { label: 'VAC/HVAC', color: 'text-cyan-400', icon: Wind },
  'TMS': { label: 'TCMS', color: 'text-purple-400', icon: Cpu },
  'COMMS': { label: 'Comms', color: 'text-pink-400', icon: Radio },
  'CAB': { label: 'Cab', color: 'text-violet-400', icon: Settings },
  'GEN': { label: 'General', color: 'text-slate-400', icon: FileText },
};

export default function DocumentsPage() {
  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <FileText className="h-8 w-8 text-cyan-400" />
          Technical Documents
        </h1>
        <p className="mt-2 text-slate-400">
          Complete library of VCC technical documents, drawings, and pin assignments
        </p>
        <div className="mt-3 text-sm text-slate-500">
          {DOCUMENTS.length} documents available
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOCUMENTS.map(doc => {
          const catConfig = CATEGORY_CONFIG[doc.category] || CATEGORY_CONFIG['Reference'];
          const Icon = catConfig.icon;
          
          return (
            <div key={doc.id} className="glass-card p-6 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${catConfig.bg}`}>
                  <Icon className={`h-6 w-6 ${catConfig.color}`} />
                </div>
                <span className={`text-xs px-2 py-1 rounded ${catConfig.bg} ${catConfig.color}`}>
                  {doc.category}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{doc.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{doc.description}</p>
              
              <div className="text-xs text-slate-500 mb-3">
                <span className="font-medium">File:</span> {doc.filename}
              </div>
              <div className="text-xs text-slate-500 mb-3">
                <span className="font-medium">Pages:</span> {doc.pageCount}
              </div>
              
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-400 mb-2">Key Sections:</div>
                <div className="flex flex-wrap gap-1">
                  {doc.keySections.map(section => (
                    <span key={section} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400">
                      {section}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">Related Systems:</div>
                <div className="flex flex-wrap gap-1">
                  {doc.relatedSystems.map(sys => {
                    const sysConfig = SYSTEM_CONFIG[sys] || SYSTEM_CONFIG['GEN'];
                    const SysIcon = sysConfig.icon;
                    return (
                      <Link 
                        key={sys} 
                        href={`/systems/${sys === 'CAB' ? 'CAB' : sys === 'GEN' ? 'GEN' : sys}`}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${sysConfig.color} bg-slate-800/50 hover:bg-slate-700/50`}
                      >
                        <SysIcon className="h-3 w-3" />
                        {sys}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Categories Summary */}
      <div className="mt-12 glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Document Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
            const count = DOCUMENTS.filter(d => d.category === category).length;
            const Icon = config.icon;
            return (
              <div key={category} className="p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <span className="font-semibold text-white">{category}</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{count}</div>
                <div className="text-xs text-slate-500">documents</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}