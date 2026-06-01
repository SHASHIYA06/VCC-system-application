'use client';

import React from 'react';
import { SystemInfo } from '@/lib/gsd/topology';

interface SystemSelectorProps {
  systems: SystemInfo[];
  selectedSystem?: string;
  onSystemChange: (systemCode: string) => void;
}

export const SystemSelector: React.FC<SystemSelectorProps> = ({
  systems,
  selectedSystem,
  onSystemChange,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Systems</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSystemChange('')}
          className={`w-full text-left px-3 py-2 rounded-lg transition ${
            !selectedSystem
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
              : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <p className="font-semibold">All Systems</p>
          <p className="text-xs text-slate-400">View complete topology</p>
        </button>

        {systems.map((sys) => (
          <button
            key={sys.code}
            onClick={() => onSystemChange(sys.code)}
            className={`w-full text-left px-3 py-2 rounded-lg transition ${
              selectedSystem === sys.code
                ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{sys.code}</p>
                <p className="text-xs text-slate-400">{sys.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold">{sys.devices}</p>
                <p className="text-xs text-slate-400">devices</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemSelector;
