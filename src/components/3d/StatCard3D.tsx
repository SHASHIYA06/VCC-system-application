'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCard3DProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: { value: number; direction: 'up' | 'down' };
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber' | 'pink';
  backgroundColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard3D({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  glowColor = 'cyan',
  backgroundColor = 'from-slate-800/60 to-slate-900/60',
  className = '',
  onClick,
}: StatCard3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -6;
    const rotateYValue = ((x - centerX) / centerX) * 6;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const glowColors = {
    cyan: 'shadow-cyan-500/30 hover:shadow-cyan-400/50',
    blue: 'shadow-blue-500/30 hover:shadow-blue-400/50',
    purple: 'shadow-purple-500/30 hover:shadow-purple-400/50',
    green: 'shadow-green-500/30 hover:shadow-green-400/50',
    orange: 'shadow-orange-500/30 hover:shadow-orange-400/50',
    red: 'shadow-red-500/30 hover:shadow-red-400/50',
    amber: 'shadow-amber-500/30 hover:shadow-amber-400/50',
    pink: 'shadow-pink-500/30 hover:shadow-pink-400/50',
  };

  return (
    <motion.div
      className={`relative perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <motion.div
        className={`relative bg-gradient-to-br ${backgroundColor} backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 ${glowColors[glowColor]} transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
        animate={{
          y: isHovered ? -3 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-white">{value}</p>
                {unit && <p className="text-sm text-slate-400 font-medium">{unit}</p>}
              </div>
            </div>

            {Icon && (
              <div className="p-3 rounded-lg bg-white/5 border border-slate-600/30 shadow-lg">
                <Icon className="h-6 w-6 text-cyan-400" />
              </div>
            )}
          </div>

          {/* Trend indicator */}
          {trend && (
            <div className="pt-2 border-t border-slate-700/30 flex items-center gap-2">
              <span className={`text-xs font-bold ${trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500">vs last period</span>
            </div>
          )}
        </div>

        {/* 3D border accent */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
