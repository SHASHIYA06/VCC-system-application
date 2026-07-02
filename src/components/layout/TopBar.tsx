'use client';

import { Bell, Zap } from 'lucide-react';
import GlobalSearch from '../search/GlobalSearch';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 w-full h-14 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl flex items-center px-6 gap-4">
      {/* Left - System info */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-medium text-slate-400 tracking-wide hidden sm:inline">
          KMRCL RS3R — Vehicle Control Circuits
        </span>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <GlobalSearch />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] text-slate-400 font-medium">AI</span>
        </div>
        
        <button className="relative p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500" />
        </button>

        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:opacity-90 transition-opacity">
          SM
        </div>
      </div>
    </header>
  );
}
