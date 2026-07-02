'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber' | 'pink' | 'indigo' | 'slate' | 'violet' | 'emerald';
  className?: string;
  dataSource?: string;
}

const colorMap = {
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', ring: 'ring-cyan-500/30' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', ring: 'ring-blue-500/30' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', ring: 'ring-purple-500/30' },
  green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', ring: 'ring-green-500/30' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', ring: 'ring-orange-500/30' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', ring: 'ring-red-500/30' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', ring: 'ring-amber-500/30' },
  pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', ring: 'ring-pink-500/30' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', ring: 'ring-indigo-500/30' },
  slate: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', ring: 'ring-slate-500/30' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', ring: 'ring-violet-500/30' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', ring: 'ring-emerald-500/30' },
};

export function StatCard({
  icon,
  label,
  value,
  subtext,
  color = 'blue',
  className = '',
  dataSource = 'database',
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-slate-900/70 backdrop-blur-xl
        border border-slate-800/80
        hover:border-slate-700/80
        p-6 transition-all duration-200
        cursor-pointer group
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.border} border`}>
          <div className={colors.text}>{icon}</div>
        </div>
        {dataSource === 'database' && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          {label}
        </h4>
        {subtext && (
          <p className="text-xs text-slate-500">{subtext}</p>
        )}
      </div>

      {/* Bottom accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </motion.div>
  );
}
