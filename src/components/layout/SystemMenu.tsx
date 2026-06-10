'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import {
  getActiveSystems,
  SYSTEM_CATEGORIES,
  getSystemColor,
  getSystemBgColor,
  MenuSystemConfig
} from '@/config/menu-systems';

interface SystemStatus {
  code: string;
  syncStatus: 'PENDING' | 'SYNCING' | 'COMPLETE' | 'FAILED';
  dataCompleteness: number;
}

export function SystemMenu() {
  const pathname = usePathname();
  const [systems, setSystems] = useState<MenuSystemConfig[]>([]);
  const [statuses, setStatuses] = useState<Record<string, SystemStatus>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Primary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load systems
    setSystems(getActiveSystems());
    
    // Fetch system statuses
    fetchSystemStatuses();
    
    setLoading(false);
  }, []);

  const fetchSystemStatuses = async () => {
    try {
      const response = await fetch('/api/systems/status');
      if (response.ok) {
        const data = await response.json();
        const statusMap: Record<string, SystemStatus> = {};
        data.data?.forEach((sys: any) => {
          statusMap[sys.code] = {
            code: sys.code,
            syncStatus: sys.syncStatus,
            dataCompleteness: sys.dataCompleteness
          };
        });
        setStatuses(statusMap);
      }
    } catch (error) {
      console.error('Failed to fetch system statuses:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': return 'bg-green-500/20 border-green-500/50 text-green-600';
      case 'SYNCING': return 'bg-blue-500/20 border-blue-500/50 text-blue-600';
      case 'PENDING': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-600';
      case 'FAILED': return 'bg-red-500/20 border-red-500/50 text-red-600';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETE': return '✓';
      case 'SYNCING': return '⟳';
      case 'PENDING': return '○';
      case 'FAILED': return '✕';
      default: return '?';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white w-64 min-h-screen p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categories = Object.keys(SYSTEM_CATEGORIES) as string[];
  const filteredSystems = systems.filter(sys => sys.category === selectedCategory);

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          VCC Systems
        </h1>
        <p className="text-xs text-slate-400 mt-1">Railway Control System</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-700">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-3 py-1 rounded text-xs font-medium transition-colors
              ${selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Systems List */}
      <nav className="flex-1 space-y-1">
        {filteredSystems.length === 0 ? (
          <div className="text-slate-400 text-sm py-4">
            No systems in this category
          </div>
        ) : (
          filteredSystems.map(system => {
            const IconComponent = Icons[system.icon as keyof typeof Icons] as React.ComponentType<any>;
            const status = statuses[system.code];
            const isActive = pathname?.includes(system.code.toLowerCase());

            return (
              <Link
                key={system.id}
                href={system.route || `/systems/${system.code.toLowerCase()}`}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all group
                  ${isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                {/* Icon */}
                <div
                  className="flex-shrink-0 p-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: getSystemBgColor(system.code),
                    color: getSystemColor(system.code)
                  }}
                >
                  <IconComponent size={16} />
                </div>

                {/* Name and Status */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{system.displayName}</p>
                  
                  {status && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(status.syncStatus)}`}>
                        {getStatusBadge(status.syncStatus)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {Math.round(status.dataCompleteness * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <Icons.ChevronRight
                  size={16}
                  className="flex-shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors"
                />
              </Link>
            );
          })
        )}
      </nav>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-slate-700 space-y-2 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Total Systems:</span>
          <span className="text-white font-semibold">{systems.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Active:</span>
          <span className="text-green-400 font-semibold">
            {systems.filter(s => s.isActive).length}
          </span>
        </div>
      </div>
    </div>
  );
}
