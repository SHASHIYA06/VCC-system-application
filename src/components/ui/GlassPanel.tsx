'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat' | 'accent';
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
  glowColor = 'blue',
}: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-slate-900/70 backdrop-blur-xl
        border-2 border-slate-700/60
        transition-all duration-200
        ${glow ? 'hover:shadow-glow-cyan hover:border-cyan-500/20' : ''}
        ${className}
      `}
    >
      {(title || icon) && (
        <div className="flex items-center gap-4 px-6 pt-6 pb-0">
          {icon && (
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="px-6 pb-6 pt-4">
        {children}
      </div>
    </motion.div>
  );
}
