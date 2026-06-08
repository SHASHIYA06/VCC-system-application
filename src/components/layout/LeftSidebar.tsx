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
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-full shadow-lg">
      {/* HEADER */}
      <div className="px-4 py-4 border-b border-slate-700/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-sm font-bold text-white">VCC Explorer</h1>
        </div>
        
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search systems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
          />
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-4 py-3 border-b border-slate-700/30 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 hover:text-white transition text-xs font-medium group">
          <Layout className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          Dashboard
        </Link>
        <Link href="/drawings" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 hover:text-white transition text-xs font-medium group">
          <FileText className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          All Drawings
        </Link>
        <Link href="/topology" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 hover:text-white transition text-xs font-medium group">
          <Network className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          Topology
        </Link>
      </div>

      {/* SYSTEMS TREE */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin">
              <Zap className="w-4 h-4 text-cyan-500" />
            </div>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="text-xs text-slate-500 px-2 py-4 text-center">
            No systems found
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSystems.map(sys => (
              <div key={sys.code}>
                {/* System Item */}
                <button
                  onClick={() => toggleSystem(sys.code)}
                  className="w-full flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-slate-700/40 text-slate-300 hover:text-white transition group text-xs"
                >
                  {expanded[sys.code] ? (
                    <ChevronDown className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                  ) : (
                    <ChevronUp className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                  )}
                  <span className="flex-1 text-left font-medium">{sys.name}</span>
                  <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full opacity-70 group-hover:opacity-100">
                    {sys.drawingCount}
                  </span>
                </button>

                {/* System Details (when expanded) */}
                {expanded[sys.code] && (
                  <div className="ml-4 mt-1 pb-2 border-l border-slate-700/50 pl-3 space-y-1">
                    <Link
                      href={`/drawings?system_code=${sys.code}`}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-700/30 transition"
                    >
                      <FileText className="w-3 h-3" />
                      Drawings ({sys.drawingCount})
                    </Link>
                    <Link
                      href={`/topology?system=${sys.code}`}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-700/30 transition"
                    >
                      <Network className="w-3 h-3" />
                      Connections
                    </Link>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-700/30 transition">
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER - STATUS */}
      <div className="px-4 py-3 border-t border-slate-700/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>System Online</span>
        </div>
        <div className="text-xs text-slate-500">
          {systems.length} systems · {systems.reduce((sum, s) => sum + s.drawingCount, 0)} drawings
        </div>
      </div>
    </div>
  );
}
