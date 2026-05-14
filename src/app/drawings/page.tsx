'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, Search, ArrowRight, Cpu, MapPin, Cable, Loader2 } from 'lucide-react';

interface Drawing {
  id: string;
  drawingNo: string;
  title: string;
  revision: string;
  totalSheets: number;
  system?: { code: string; name: string };
  remarks?: string;
}

interface DrawingDetail {
  connectors?: { connectorCode: string; pinCount: number }[];
  wires?: string[];
}

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
  LTEB: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'LTEB' },
  LTJB: { color: 'text-yellow-500', bg: 'bg-yellow-600/20', label: 'LTJB' },
  EDB: { color: 'text-teal-400', bg: 'bg-teal-500/20', label: 'EDB' },
  LIGHT: { color: 'text-amber-500', bg: 'bg-amber-600/20', label: 'Lighting' },
  CAB: { color: 'text-indigo-400', bg: 'bg-indigo-500/20', label: 'Cab' },
  COUPL: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Coupling' },
};

const DETAILED_DRAWINGS: Record<string, DrawingDetail> = {
  '942-58131': { connectors: ['APS1-CN1', 'APS1-CN2', 'APS1-CN3', 'APS1-CN4'], wires: ['5020', '5021', '5030', '5031', '5040', '5050'] },
  '942-58130': { connectors: ['APS1-CN1', 'APS1-CN2', 'BATT1-CN1'], wires: ['1040', '1050', '5000', '5064'] },
  '942-58138': { connectors: ['DCU1-CN1', 'DCU1-CN2', 'DCU1-CN3', 'DCU1-CN4'], wires: ['6009', '6014', '6046', '6051', '6073', '6076'] },
  '942-38606': { connectors: ['TCMS_RIO1-CN1', 'TCMS_RIO1-CN10', 'TCMS_RIO1-CN11', 'TCMS_RIO1-CN12'], wires: ['9001', '9100-9120', '9200-9220', '9300-9320'] },
  '942-38409': { connectors: ['TCMS_RIO2-CN1', 'TCMS_RIO2-CN10', 'TCMS_RIO2-CN11', 'TCMS_RIO2-CN12'], wires: ['9002', '9100-9120', '9200-9220'] },
  '942-58147': { connectors: ['PA_AMP-CN1', 'PA_AMP-CN2', 'DVAS-CN1', 'DVAS-CN2'], wires: ['8001', '8002', '8003', '8010', '8015'] },
  '942-58153': { connectors: ['CCTV_CTRL-CN1', 'CCTV_CTRL-CN2', 'NVR-CN1'], wires: ['8050', '8055', '8060', '8065'] },
};

function DrawingsContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('doc');
  
  const [search, setSearch] = useState('');
  const [filterSystem, setFilterSystem] = useState<string | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrawings() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterSystem) params.append('system_code', filterSystem);
        
        const res = await fetch(`/api/drawings?${params.toString()}`);
        const data = await res.json();
        
        if (data.drawings) {
          setDrawings(data.drawings);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Failed to fetch drawings:', err);
        setError('Failed to load drawings from database');
      } finally {
        setLoading(false);
      }
    }

    fetchDrawings();
  }, [filterSystem]);

  const filteredDrawings = drawings.filter(d => {
    const matchSearch = !search || 
      d.drawingNo.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase());
    const matchSystem = !filterSystem || d.system?.code === filterSystem;
    return matchSearch && matchSystem;
  });

  const groupedDrawings = filteredDrawings.reduce((acc, d) => {
    const systemCode = d.system?.code || 'GEN';
    if (!acc[systemCode]) acc[systemCode] = [];
    acc[systemCode].push(d);
    return acc;
  }, {} as Record<string, Drawing[]>);

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <FileText className="h-8 w-8 text-cyan-400" />
          VCC Drawing Register
        </h1>
        <p className="mt-2 text-slate-400">
          Complete index of all Vehicle Control Circuit drawings - {filteredDrawings.length} drawings from database
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

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

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          <span className="ml-3 text-slate-400">Loading drawings from database...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDrawings).map(([systemCode, systemDrawings]) => {
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
                  {systemDrawings.map(dwg => {
                    const details = DETAILED_DRAWINGS[dwg.drawingNo];
                    const subsystem = dwg.remarks?.split('|')[1] || systemCode;
                    
                    return (
                      <div key={dwg.id} className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Link href={`/drawings/${dwg.drawingNo}`} className="font-mono text-cyan-400 font-bold">
                            {dwg.drawingNo}
                          </Link>
                          <span className="text-xs text-slate-500">Rev {dwg.revision || 'A'}</span>
                        </div>
                        <div className="text-sm text-white mb-2">{dwg.title}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <span className="px-2 py-0.5 bg-slate-700/50 rounded">{subsystem}</span>
                          <span>{dwg.totalSheets} sheets</span>
                        </div>
                        
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
      )}

      {filteredDrawings.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No drawings found</p>
          {filterSystem && (
            <button onClick={() => setFilterSystem(null)} className="mt-4 text-cyan-400 hover:text-cyan-300">
              Clear filter
            </button>
          )}
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