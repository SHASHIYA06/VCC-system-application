'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat';
  glow?: boolean;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink';
}

export function GlassPanel({
  children,
  title,
  subtitle,
  icon,
  className = '',
  variant = 'default',
  glow = false,
  glowColor = 'cyan',
}: GlassPanelProps) {
  const variantStyles = {
    default: 'bg-slate-900/40 backdrop-blur-xl border border-slate-700/50',
    elevated: 'bg-slate-800/60 backdrop-blur-2xl border border-slate-600/50 shadow-2xl',
    flat: 'bg-slate-950/30 backdrop-blur-md border border-slate-800/30',
  };

  const glowStyles = {
    cyan: 'shadow-[0_0_30px_rgba(34,211,238,0.2)]',
    blue: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    purple: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    green: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    orange: 'shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    pink: 'shadow-[0_0_30px_rgba(236,72,153,0.2)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl p-6
        ${variantStyles[variant]}
        ${glow ? glowStyles[glowColor] : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {/* Header */}
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-6">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400">
              {icon}
            </div>
          )}
          <div>
            {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}
