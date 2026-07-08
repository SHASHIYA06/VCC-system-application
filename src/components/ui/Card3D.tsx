'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface Card3DProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red' | 'amber';
  variant?: 'default' | 'premium' | 'glass' | 'flat' | 'elevated';
  onClick?: () => void;
}

const glowMap = {
  cyan: 'hover:border-cyan-500/30 hover:shadow-glow-cyan',
  blue: 'hover:border-blue-500/30',
  purple: 'hover:border-purple-500/30',
  green: 'hover:border-emerald-500/30',
  orange: 'hover:border-orange-500/30',
  pink: 'hover:border-pink-500/30',
  red: 'hover:border-red-500/30',
  amber: 'hover:border-amber-500/30',
};

export function Card3D({
  children,
  className = '',
  interactive = true,
  glowColor = 'cyan',
  variant = 'default',
  onClick,
}: Card3DProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-slate-900/70 backdrop-blur-xl
        border-2 border-slate-700/60
        transition-all duration-200
        ${interactive ? 'cursor-pointer' : ''}
        ${interactive ? glowMap[glowColor] : ''}
        ${className}
      `}
    >
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
