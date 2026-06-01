'use client';

import React from 'react';
import { TopologyStatistics } from '@/lib/gsd/topology';
import { Activity, Zap, Network, Cpu } from 'lucide-react';

interface GSDStatsProps {
  statistics: TopologyStatistics;
}

export const GSDStats: React.FC<GSDStatsProps> = ({ statistics }) => {
  const stats = [
    {
      label: 'Total Devices',
      value: statistics.totalDevices,
      icon: Cpu,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Connections',
      value: statistics.totalConnections,
      icon: Network,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Total Wires',
      value: statistics.totalWires,
      icon: Zap,
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Systems',
      value: statistics.systemCount,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default GSDStats;
