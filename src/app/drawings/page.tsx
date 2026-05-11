import Link from 'next/link';
import { VCC_DRAWING_REGISTRY } from '@/types/index';
import { FileText, Search, Filter, ChevronRight, Pin, Zap, Cpu } from 'lucide-react';

const DRAWING_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SCHEMATIC: { label: 'Schematic', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  PIN_ASSIGNMENT: { label: 'PIN', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  DRAWING_LIST: { label: 'Index', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  CLASSIFICATION: { label: 'Classification', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  WIRING_NUMBER_DEF: { label: 'Wire Def', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  SYMBOL_LIBRARY: { label: 'Symbols', color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

const SYSTEM_GROUPS: Record<string, { label: string; color: string; bg: string }> = {
  GEN: { label: 'Foundation', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  TRL: { label: 'Trainlines', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  CAB: { label: 'Cab Control', color: 'text-violet-400', bg: 'bg-violet-500/20' },
  LIGHT: { label: 'Lighting', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  COUPL: { label: 'Coupler', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  TRAC: { label: 'Traction', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  BRAKE: { label: 'Brake', color: 'text-red-400', bg: 'bg-red-500/20' },
  APS: { label: 'Aux Power', color: 'text-green-400', bg: 'bg-green-500/20' },
  DOOR: { label: 'Door', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  VAC: { label: 'VAC/HVAC', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  TMS: { label: 'TCMS', color: 'text-teal-400', bg: 'bg-teal-500/20' },
  COMMS: { label: 'Comms', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  LTEB: { label: 'LTEB', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  LTJB: { label: 'LTJB', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  EDB: { label: 'EDB', color: 'text-rose-400', bg: 'bg-rose-500/20' },
  HV: { label: 'HV', color: 'text-red-600', bg: 'bg-red-600/20' },
};

export default function DrawingsPage() {
  const allDrawings = Object.values(VCC_DRAWING_REGISTRY);

  const grouped = allDrawings.reduce((acc, d) => {
    const sys = d.system_code;
    if (!acc[sys]) acc[sys] = [];
    acc[sys].push(d);
    return acc;
  }, {} as Record<string, typeof allDrawings>);

  const systems = Object.keys(grouped).sort();

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC Drawing Register</h1>
        <p className="mt-2 text-slate-400">
          Complete index of all Vehicle Control Circuit drawings and PIN assignments
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{allDrawings.length} drawings</span>
          <span>VCC 942-58099 to 942-58154</span>
          <span>PIN: 942-383xx, 942-384xx, 942-385xx, 942-386xx</span>
        </div>
      </div>

      {/* PIN Drawing Reference */}
      <div className="mb-8 glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Pin className="h-4 w-4" /> PIN Drawing Reference by Car & Zone
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="text-xs text-blue-400 font-medium">DMC Underframe</div>
            <div className="text-sm font-mono text-white mt-1">942-38309</div>
            <div className="text-xs text-slate-500 mt-0.5">LTEB, VVVF, BCU, HSCB</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="text-xs text-green-400 font-medium">TC Underframe</div>
            <div className="text-sm font-mono text-white mt-1">942-38509</div>
            <div className="text-xs text-slate-500 mt-0.5">APS, BECU, ESK, EDB2</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="text-xs text-green-400 font-medium">TC Ceiling</div>
            <div className="text-sm font-mono text-white mt-1">942-38409</div>
            <div className="text-xs text-slate-500 mt-0.5">TCMS_RIO2, DCU2, VAC2</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="text-xs text-orange-400 font-medium">MC Underframe</div>
            <div className="text-sm font-mono text-white mt-1">942-38609</div>
            <div className="text-xs text-slate-500 mt-0.5">VVVF2, BCU3, BECU1, LTEB3</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="text-xs text-orange-400 font-medium">MC Ceiling</div>
            <div className="text-sm font-mono text-white mt-1">942-38610</div>
            <div className="text-xs text-slate-500 mt-0.5">TCMS_RIO1, DCU1, VAC1, ETH</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="text-xs text-purple-400 font-medium">CAB Desk</div>
            <div className="text-sm font-mono text-white mt-1">942-38107</div>
            <div className="text-xs text-slate-500 mt-0.5">Operating panels, indicators</div>
          </div>
          <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/30">
            <div className="text-xs text-red-400 font-medium">HV System</div>
            <div className="text-sm font-mono text-white mt-1">942-38103</div>
            <div className="text-xs text-slate-500 mt-0.5">HSCB, pantograph, HTEB/HTJB</div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="text-xs text-cyan-400 font-medium">TCMS M Car</div>
            <div className="text-sm font-mono text-white mt-1">942-38606</div>
            <div className="text-xs text-slate-500 mt-0.5">TCMS RIO pin assignment</div>
          </div>
        </div>
      </div>

      {/* Drawings by System */}
      <div className="space-y-8">
        {systems.map(systemCode => {
          const sysInfo = SYSTEM_GROUPS[systemCode] || SYSTEM_GROUPS['GEN'];
          const drawings = grouped[systemCode];

          return (
            <div key={systemCode} className="glass-card overflow-hidden">
              <div className={`px-6 py-4 border-b border-slate-700/50 flex items-center justify-between ${sysInfo.bg}`}>
                <div className="flex items-center gap-3">
                  <Cpu className={`h-5 w-5 ${sysInfo.color}`} />
                  <span className={`font-bold text-lg ${sysInfo.color}`}>{systemCode}</span>
                  <span className="text-slate-400 text-sm">{sysInfo.label}</span>
                </div>
                <span className="text-xs text-slate-500">{drawings.length} drawings</span>
              </div>

              <div className="divide-y divide-slate-700/30">
                {drawings.map(drawing => {
                  const typeConfig = DRAWING_TYPE_CONFIG[drawing.drawing_type] || DRAWING_TYPE_CONFIG.SCHEMATIC;

                  return (
                    <div key={drawing.id} className="hover:bg-slate-800/30 transition-colors">
                      <Link href={`/drawings/${drawing.id}`}
                        className="flex items-center gap-4 px-6 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-cyan-400 font-bold text-lg">{drawing.drawing_no}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color} ${typeConfig.bg}`}>
                              {typeConfig.label}
                            </span>
                            {drawing.sheet_count > 1 && (
                              <span className="text-xs text-slate-500">{drawing.sheet_count} sheets</span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-300 truncate">{drawing.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 truncate">
                            {drawing.notes || 'No description available'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {drawing.current_revision && (
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Rev</div>
                              <div className="text-sm font-mono text-slate-300">{drawing.current_revision || '-'}</div>
                            </div>
                          )}
                          <ChevronRight className="h-5 w-5 text-slate-500" />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}