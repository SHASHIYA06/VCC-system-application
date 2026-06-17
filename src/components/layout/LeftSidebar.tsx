'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, Zap, Layout, FileText, Network, AlertCircle, Plus } from 'lucide-react';

interface SystemItem {
  code: string;
  name: string;
  drawingCount: number;
  expanded?: boolean;
}

/**
 * LEFT SIDEBAR COMPONENT
 * 
 * Professional navigation tree with:
 * - System hierarchy
 * - Drawing search
 * - Quick actions
 * - Status indicators
 */
export function LeftSidebar() {
  const [systems, setSystems] = useState<SystemItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/systems');
      const data = await res.json();
      
      setSystems(data.systems || []);
      // Expand first few systems by default
      const defaultExpanded: Record<string, boolean> = {};
      (data.systems || []).slice(0, 3).forEach((sys: SystemItem) => {
        defaultExpanded[sys.code] = true;
      });
      setExpanded(defaultExpanded);
    } catch (error) {
      console.error('Error fetching systems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSystem = (code: string) => {
    setExpanded(prev => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const filteredSystems = systems.filter(sys =>
    sys.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sys.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 flex flex-col h-full shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-50">
      {/* HEADER */}
      <div className="px-4 py-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">VCC Explorer</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">System Interface</p>
          </div>
        </div>
        
        {/* SEARCH */}
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search systems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-black/40 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-4 py-4 border-b border-white/5 space-y-2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Layout className="w-4 h-4 text-cyan-400" />
          Dashboard
        </Link>
        <Link href="/drawings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium group">
          <FileText className="w-4 h-4 text-purple-400" />
          All Drawings
        </Link>
        <Link href="/gsd" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent hover:from-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 hover:text-emerald-200 transition-all text-xs font-bold group shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <Network className="w-4 h-4 text-emerald-400" />
          3D Galaxy Topology
        </Link>
        <Link href="/admin/verify" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium group">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          DB Sync Master
        </Link>
      </div>

      {/* SYSTEMS TREE */}
      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">INITIALIZING...</span>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="text-xs text-slate-500 px-2 py-8 text-center bg-white/5 rounded-xl border border-white/5 border-dashed">
            No systems found matching criteria
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredSystems.map(sys => (
              <div key={sys.code} className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 shadow-sm">
                {/* System Item */}
                <button
                  onClick={() => toggleSystem(sys.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white transition-all group text-xs ${expanded[sys.code] ? 'bg-white/5' : ''}`}
                >
                  <div className={`p-1 rounded-md transition-all duration-300 ${expanded[sys.code] ? 'bg-cyan-500/20 text-cyan-400 rotate-0' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 -rotate-90'}`}>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <span className="flex-1 text-left font-medium tracking-wide">{sys.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border transition-all ${expanded[sys.code] ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'bg-black/30 border-white/10 text-slate-400'}`}>
                    {sys.drawingCount}
                  </span>
                </button>

                {/* System Details (when expanded) */}
                {expanded[sys.code] && (
                  <div className="p-2 pt-0 space-y-1 bg-black/20 animate-in slide-in-from-top-2 duration-200 fade-in">
                    <Link
                      href={`/drawings?system_code=${sys.code}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Drawings
                    </Link>
                    <Link
                      href={`/gsd?system=${sys.code}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
                    >
                      <Network className="w-3.5 h-3.5" />
                      3D Galaxy Subsystem
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER - STATUS */}
      <div className="px-4 py-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-emerald-400/90 uppercase">Online</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            {systems.length} SYS · {systems.reduce((sum, s) => sum + s.drawingCount, 0)} DRW
          </div>
        </div>
      </div>
    </div>
  );
}
