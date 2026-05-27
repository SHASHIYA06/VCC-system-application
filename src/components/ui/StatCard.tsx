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
  color = 'cyan',
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
    cyan: 'hover:shadow-[0_0_35px_rgba(6,182,212,0.25)]',
    blue: 'hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]',
    purple: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]',
    green: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]',
    orange: 'hover:shadow-[0_0_35px_rgba(249,115,22,0.25)]',
    red: 'hover:shadow-[0_0_35px_rgba(239,68,68,0.25)]',
    amber: 'hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]',
    pink: 'hover:shadow-[0_0_35px_rgba(236,72,153,0.25)]',
    indigo: 'hover:shadow-[0_0_35px_rgba(99,102,241,0.25)]',
    slate: 'hover:shadow-[0_0_35px_rgba(148,163,184,0.25)]',
    violet: 'hover:shadow-[0_0_35px_rgba(139,92,246,0.25)]',
    emerald: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]',
  };
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
    slate: 'from-slate-500/20 to-slate-700/20 border-slate-500/30 text-slate-400',
    violet: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30 text-violet-400',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
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
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${colorStyles[color]}
        border glass-card-morph
        p-6 transition-all duration-300
        ${glowShadows[color]}
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

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
        {/* Top Row: Icon on left, Value & Subtext on right */}
        <div className="flex items-start justify-between w-full">
          {/* Icon in a styled container */}
          <div className="inline-flex p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            {icon}
          </div>
          
          {/* Value and Subtext */}
          <div className="text-right">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {subtext && (
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Row: Label and Sparkline / Live Indicator */}
        <div className="mt-4 pt-2 flex flex-col w-full">
          <p className="text-lg font-bold text-white tracking-wide">{label}</p>
          
          {/* Animated Sparkline */}
          <div className="mt-2 h-6 w-full relative opacity-40">
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
            <p className="text-[10px] text-green-400/80 flex items-center gap-1.5 mt-2 font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              Live DB Sync
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
