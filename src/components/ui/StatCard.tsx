'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber' | 'pink' | 'indigo';
  className?: string;
  dataSource?: string;
}

export function StatCard({
  icon,
  label,
  value,
  subtext,
  trend,
  trendValue,
  color = 'cyan',
  className = '',
  dataSource = 'database',
}: StatCardProps) {
  const colorStyles = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400',
    amber: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
    pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
    indigo: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${colorStyles[color]}
        border glass-card-morph
        p-6 transition-all duration-300
        hover:shadow-2xl hover:shadow-${color}-500/20
        ${className}
      `}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4 inline-flex p-3 rounded-xl bg-white/10 backdrop-blur-sm">
          {icon}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>

        {/* Subtext and Trend */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
              {trend && trendValue && (
                <div className={`text-xs font-semibold ${trendColors[trend]} bg-slate-900/40 px-2 py-0.5 rounded-full`}>
                  {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
                </div>
              )}
            </div>
            
            {/* Animated Sparkline */}
            <div className="mt-4 h-8 w-full relative">
              <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
                <motion.path
                  d="M0 15 Q 10 5, 20 10 T 40 12 T 60 5 T 80 15 T 100 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="opacity-50 drop-shadow-md"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.path
                  d="M0 20 L0 15 Q 10 5, 20 10 T 40 12 T 60 5 T 80 15 T 100 2 L 100 20 Z"
                  fill="currentColor"
                  className="opacity-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
              </svg>
            </div>

            {dataSource === 'database' && (
              <p className="text-[10px] text-green-400/80 flex items-center gap-1.5 mt-2 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live DB Sync
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
