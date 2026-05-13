'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Search, ChevronRight, Pin, Cpu, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface DrawingDoc {
  id: string;
  drawingNo: string;
  title: string;
  revision: string;
  carType: string;
  subsystem: string;
  drawingType: string;
  pageCount: number;
  sourceFile: string | null;
  notes: string | null;
}

const DRAWING_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SCHEMATIC: { label: 'Schematic', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  PIN_ASSIGNMENT: { label: 'PIN', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  DRAWING_LIST: { label: 'Index', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  CLASSIFICATION: { label: 'Classification', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  WIRING_NUMBER_DEF: { label: 'Wire Def', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  SYMBOL_LIBRARY: { label: 'Symbols', color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

const SYSTEM_GROUPS: Record<string, { label: string; color: string; bg: string }> = {
  GEN: { label: 'General', color: 'text-slate-400', bg: 'bg-slate-500/20' },
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

const VCC_PIN_REFERENCE = [
  { car: 'DMC Underframe', drawing: '942-38309', components: 'LTEB, VVVF, BCU, HSCB', color: 'blue' },
  { car: 'TC Underframe', drawing: '942-38509', components: 'APS, BECU, ESK, EDB2', color: 'green' },
  { car: 'TC Ceiling', drawing: '942-38409', components: 'TCMS_RIO2, DCU2, VAC2', color: 'green' },
  { car: 'MC Underframe', drawing: '942-38609', components: 'VVVF2, BCU3, BECU1, LTEB3', color: 'orange' },
  { car: 'MC Ceiling', drawing: '942-38610', components: 'TCMS_RIO1, DCU1, VAC1, ETH', color: 'orange' },
  { car: 'CAB Desk', drawing: '942-38107', components: 'Operating panels, indicators', color: 'purple' },
  { car: 'HV System', drawing: '942-38103', components: 'HSCB, pantograph, HTEB/HTJB', color: 'red' },
  { car: 'TCMS M Car', drawing: '942-38606', components: 'TCMS RIO pin assignment', color: 'cyan' },
];

const VCC_SYSTEM_DRAWINGS: Record<string, string[]> = {
  GEN: ['942-58099', '942-58100', '942-58101', '942-58102', '942-58103', '942-58104', '942-58105', '942-58106'],
  TRL: ['942-58107', '942-58108', '942-58109', '942-58110', '942-58111'],
  LIGHT: ['942-58112', '942-58113', '942-58114', '942-58115', '942-58116'],
  COUPL: ['942-58117'],
  TRAC: ['H7L7956', '942-58119', '942-58120', '942-58121'],
  BRAKE: ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127', '942-58128', '942-58129'],
  APS: ['942-58130', '942-58131', '942-58132'],
  DOOR: ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141', '942-58142'],
  VAC: ['942-58143', '942-58144', '942-58145'],
  TMS: ['942-58146'],
  COMMS: ['942-58147', '942-58148', '942-58149', '942-58150', '942-58151', '942-58152', '942-58153', '942-58154'],
};

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  };
  return colors[color] || colors.blue;
};

export default function DrawingsPage() {
  const [drawings, setDrawings] = useState<DrawingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSystem, setFilterSystem] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrawings() {
      try {
        const response = await fetch('/api/drawings');
        if (response.ok) {
          const data = await response.json();
          setDrawings(data.drawings || []);
        }
      } catch (error) {
        console.error('Failed to fetch drawings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDrawings();
  }, []);

  const grouped = drawings.reduce((acc, d) => {
    const sys = d.subsystem || 'GEN';
    if (!acc[sys]) acc[sys] = [];
    acc[sys].push(d);
    return acc;
  }, {} as Record<string, DrawingDoc[]>);

  const systems = Object.keys(grouped).sort();

  const filteredDrawings = drawings.filter(d => {
    const matchesSearch = !searchTerm || 
      d.drawingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = !filterSystem || d.subsystem === filterSystem;
    return matchesSearch && matchesSystem;
  });

  const getLinkedDrawingNo = (drawingNo: string) => {
    const found = drawings.find(d => d.drawingNo === drawingNo);
    return found ? `/drawings/${found.id}` : `/drawings/${drawingNo}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC Drawing Register</h1>
        <p className="mt-2 text-slate-400">
          Complete index of all Vehicle Control Circuit drawings
          {drawings.length > 0 && <span className="text-cyan-400 ml-2">({drawings.length} documents in database)</span>}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by drawing number or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
        <select
          value={filterSystem || ''}
          onChange={(e) => setFilterSystem(e.target.value || null)}
          className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="">All Systems</option>
          {Object.keys(VCC_SYSTEM_DRAWINGS).map(sys => (
            <option key={sys} value={sys}>{sys}</option>
          ))}
        </select>
      </div>

      {/* VCC PIN Drawing Reference */}
      <div className="mb-8 glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Pin className="h-4 w-4" /> PIN Drawing Reference by Car & Zone
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VCC_PIN_REFERENCE.map((ref, i) => {
            const colors = getColorClasses(ref.color);
            const href = getLinkedDrawingNo(ref.drawing);
            return (
              <Link
                key={i}
                href={href}
                className={`p-3 rounded-lg ${colors.bg} border ${colors.border} hover:scale-[1.02] transition-transform`}
              >
                <div className={`text-xs font-medium ${colors.text}`}>{ref.car}</div>
                <div className="text-sm font-mono text-white mt-1">{ref.drawing}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{ref.components}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Database Drawings */}
      {filteredDrawings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            Imported Drawings ({filteredDrawings.length})
            {drawings.length !== filteredDrawings.length && (
              <span className="text-sm text-slate-400">(filtered from {drawings.length} total)</span>
            )}
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Drawing No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">System</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Pages</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredDrawings.map((drawing) => {
                    const typeConfig = DRAWING_TYPE_CONFIG[drawing.drawingType] || DRAWING_TYPE_CONFIG.SCHEMATIC;
                    return (
                      <tr key={drawing.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/drawings/${drawing.id}`} className="font-mono text-cyan-400 font-bold hover:text-cyan-300">
                            {drawing.drawingNo}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{drawing.title || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color} ${typeConfig.bg}`}>
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400 font-mono">{drawing.subsystem}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">{drawing.pageCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          {drawing.sourceFile ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400">
                              <CheckCircle2 className="h-3 w-3" /> Imported
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                              <AlertCircle className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/drawings/${drawing.id}`} className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 text-sm">
                            View <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drawings by System (VCC Reference) */}
      <div className="space-y-8">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          VCC Drawing Index by System
        </h2>
        
        {Object.entries(VCC_SYSTEM_DRAWINGS).map(([systemCode, systemDrawings]) => {
          const sysInfo = SYSTEM_GROUPS[systemCode] || SYSTEM_GROUPS['GEN'];
          
          return (
            <div key={systemCode} className="glass-card overflow-hidden">
              <div className={`px-6 py-4 border-b border-slate-700/50 flex items-center justify-between ${sysInfo.bg}`}>
                <div className="flex items-center gap-3">
                  <Cpu className={`h-5 w-5 ${sysInfo.color}`} />
                  <span className={`font-bold text-lg ${sysInfo.color}`}>{systemCode}</span>
                  <span className="text-slate-400 text-sm">{sysInfo.label}</span>
                </div>
                <Link 
                  href={`/systems/${systemCode}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  View System <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {systemDrawings.map((dwg) => {
                  const found = drawings.find(d => d.drawingNo === dwg);
                  return (
                    <Link
                      key={dwg}
                      href={getLinkedDrawingNo(dwg)}
                      className={`flex items-center justify-between p-2 rounded transition-all ${
                        found
                          ? 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20'
                          : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-600/50'
                      }`}
                    >
                      <span className={`font-mono text-sm ${found ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {dwg}
                      </span>
                      {found ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : (
                        <span className="text-xs text-slate-500">not found</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {drawings.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No drawings imported yet</p>
          <Link href="/admin/import" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors">
            <RefreshCw className="h-4 w-4" />
            Import Drawings
          </Link>
        </div>
      )}
    </div>
  );
}