'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber' | 'pink' | 'indigo' | 'slate' | 'violet' | 'emerald';
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
  color = 'blue',
  className = '',
  dataSource = 'database',
}: StatCardProps) {
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
    
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const glowShadows = {
    cyan: 'hover:shadow-[0_0_35px_rgba(34,211,238,0.2)] hover:border-cyan-200',
    blue: 'hover:shadow-[0_0_35px_rgba(59,130,246,0.2)] hover:border-blue-200',
    purple: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.2)] hover:border-purple-200',
    green: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.2)] hover:border-green-200',
    orange: 'hover:shadow-[0_0_35px_rgba(249,115,22,0.2)] hover:border-orange-200',
    red: 'hover:shadow-[0_0_35px_rgba(239,68,68,0.2)] hover:border-red-200',
    amber: 'hover:shadow-[0_0_35px_rgba(245,158,11,0.2)] hover:border-amber-200',
    pink: 'hover:shadow-[0_0_35px_rgba(236,72,153,0.2)] hover:border-pink-200',
    indigo: 'hover:shadow-[0_0_35px_rgba(99,102,241,0.2)] hover:border-indigo-200',
    slate: 'hover:shadow-[0_0_35px_rgba(148,163,184,0.2)] hover:border-slate-300',
    violet: 'hover:shadow-[0_0_35px_rgba(139,92,246,0.2)] hover:border-violet-200',
    emerald: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.2)] hover:border-emerald-200',
  };

  // Design System colors: Light backgrounds with professional styling
  const colorStyles = {
    cyan: 'bg-cyan-50/80 border-cyan-200/60 text-cyan-600',
    blue: 'bg-blue-50/80 border-blue-200/60 text-blue-600',
    purple: 'bg-purple-50/80 border-purple-200/60 text-purple-600',
    green: 'bg-green-50/80 border-green-200/60 text-green-600',
    orange: 'bg-orange-50/80 border-orange-200/60 text-orange-600',
    red: 'bg-red-50/80 border-red-200/60 text-red-600',
    amber: 'bg-amber-50/80 border-amber-200/60 text-amber-600',
    pink: 'bg-pink-50/80 border-pink-200/60 text-pink-600',
    indigo: 'bg-indigo-50/80 border-indigo-200/60 text-indigo-600',
    slate: 'bg-slate-50/80 border-slate-200/60 text-slate-600',
    violet: 'bg-violet-50/80 border-violet-200/60 text-violet-600',
    emerald: 'bg-emerald-50/80 border-emerald-200/60 text-emerald-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      className={`
        relative overflow-hidden rounded-lg
        ${colorStyles[color]}
        border backdrop-blur-sm
        p-6 transition-all duration-200
        ${glowShadows[color]}
        cursor-pointer
        ${className}
      `}
    >
      {/* Animated background gradient - subtle on hover */}
      <motion.div
        className="absolute inset-0 opacity-0"
        animate={{
          opacity: isHovered ? 0.05 : 0,
          background: [
            'radial-gradient(circle at 0% 0%, rgba(0,0,0,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(0,0,0,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(0,0,0,0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
        {/* Top Row: Icon on left, Value & Subtext on right */}
        <div className="flex items-start justify-between w-full">
          {/* Icon in a styled container */}
          <div className="inline-flex p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors duration-150">
            {icon}
          </div>
          
          {/* Value and Subtext */}
          <div className="text-right">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {subtext && (
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Row: Label and Sparkline / Live Indicator */}
        <div className="mt-4 pt-2 flex flex-col w-full">
          <p className="text-lg font-semibold text-slate-900">{label}</p>
          
          {/* Animated Sparkline */}
          <div className="mt-2 h-6 w-full relative opacity-40">
            <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible" preserveAspectRatio="none">
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
            <p className="text-[10px] text-green-600 flex items-center gap-1.5 mt-2 font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-700"></span>
              </span>
              Live DB Sync
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
