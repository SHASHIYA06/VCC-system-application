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
    
    const rotateXValue = ((y - centerY) / centerY) * -15;
    const rotateYValue = ((x - centerX) / centerX) * 15;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Premium 3D glassmorphism colors
  const glowStyles = {
    cyan: 'hover:shadow-glow-lg hover:border-cyan-400/60',
    blue: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:border-blue-400/60',
    purple: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:border-purple-400/60',
    green: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:border-green-400/60',
    orange: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:border-orange-400/60',
    red: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:border-red-400/60',
    amber: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:border-amber-400/60',
    pink: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:border-pink-400/60',
    indigo: 'hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:border-indigo-400/60',
    slate: 'hover:shadow-[0_0_40px_rgba(148,163,184,0.4)] hover:border-slate-400/60',
    violet: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:border-violet-400/60',
    emerald: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:border-emerald-400/60',
  };

  // Premium dark glassmorphism with accent colors
  const colorStyles = {
    cyan: 'text-cyan-400 [&_svg]:text-cyan-400',
    blue: 'text-blue-400 [&_svg]:text-blue-400',
    purple: 'text-purple-400 [&_svg]:text-purple-400',
    green: 'text-green-400 [&_svg]:text-green-400',
    orange: 'text-orange-400 [&_svg]:text-orange-400',
    red: 'text-red-400 [&_svg]:text-red-400',
    amber: 'text-amber-400 [&_svg]:text-amber-400',
    pink: 'text-pink-400 [&_svg]:text-pink-400',
    indigo: 'text-indigo-400 [&_svg]:text-indigo-400',
    slate: 'text-slate-400 [&_svg]:text-slate-400',
    violet: 'text-violet-400 [&_svg]:text-violet-400',
    emerald: 'text-emerald-400 [&_svg]:text-emerald-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1,
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
      }}
      whileHover={{
        translateY: -8,
        scale: 1.03,
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
        damping: 25
      }}
      className={`
        relative overflow-hidden rounded-5xl
        glass-card-premium backdrop-blur-4xl
        border border-glass-border
        p-8 transition-all duration-500 ease-smooth
        ${glowStyles[color]}
        cursor-pointer
        gpu-accelerated
        shadow-premium
        ${className}
      `}
    >
      {/* Holographic mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-[0.015] animate-mesh-rotate pointer-events-none" />
      
      {/* Premium light reflection */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Particle effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0"
        animate={{
          opacity: isHovered ? 0.1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
        {/* Top Row: Icon and Value */}
        <div className="flex items-start justify-between w-full mb-6">
          {/* Premium 3D icon container */}
          <motion.div 
            whileHover={{ 
              rotate: 15, 
              scale: 1.2,
              rotateY: 180,
            }}
            className={`
              p-4 rounded-2xl bg-gradient-accent backdrop-blur-xl
              shadow-glow-sm hover:shadow-glow
              border border-white/20
              ${colorStyles[color]}
            `}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {icon}
          </motion.div>
          
          {/* Value with premium styling */}
          <div className="text-right">
            <motion.h3 
              whileHover={{ scale: 1.05 }}
              className="text-4xl font-extrabold font-mono text-neon tracking-tighter leading-none"
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.h3>
            {subtext && (
              <p className="text-xs text-white/60 mt-2 font-medium tracking-wider uppercase">
                {subtext}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Row: Label and Live Indicator */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-white font-mono tracking-wider uppercase">
            {label}
          </h4>
          
          {/* Premium animated sparkline */}
          <div className="h-8 w-full relative opacity-60">
            <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
              <motion.path
                d="M0 15 Q 15 8, 25 12 T 50 10 T 75 6 T 100 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`${colorStyles[color]} drop-shadow-md`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut",
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "loop",
                  repeatDelay: 3,
                }}
              />
              <motion.path
                d="M0 20 L0 15 Q 15 8, 25 12 T 50 10 T 75 6 T 100 14 L 100 20 Z"
                fill="currentColor"
                className={`${colorStyles[color]} opacity-20`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </svg>
          </div>

          {/* Live sync indicator with premium styling */}
          {dataSource === 'database' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <span className="text-xs text-green-400 font-bold font-mono uppercase tracking-widest">
                  Live Sync
                </span>
              </div>
              
              {/* Premium holographic accent */}
              <div className="holographic text-xs font-bold">
                QUANTUM
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Premium bottom accent line */}
      <div className={`absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent ${colorStyles[color]} opacity-40`} />
    </motion.div>
  );
}
