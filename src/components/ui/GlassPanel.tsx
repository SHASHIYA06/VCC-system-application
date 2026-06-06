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
  // Design System: Professional glass panel styles
  // Primary: #FFFFFF, Secondary: #E5E5E5, CTA: #007AFF
  const variantStyles = {
    // Default: Light glass effect with professional styling
    default: 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/10',
    // Elevated: Higher contrast for important sections
    elevated: 'bg-white/95 backdrop-blur-2xl border border-slate-300/80 shadow-xl shadow-slate-900/15',
    // Flat: Minimal styling
    flat: 'bg-white/80 backdrop-blur-md border border-slate-100/50 shadow-md shadow-slate-900/5',
    // Accent: Highlighted sections with blue tint
    accent: 'bg-blue-50/90 backdrop-blur-xl border border-blue-200/80 shadow-lg shadow-blue-500/10',
  };

  const glowStyles = {
    cyan: 'shadow-[0_0_30px_rgba(34,211,238,0.15)]',
    blue: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    purple: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    green: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    orange: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]',
    pink: 'shadow-[0_0_30px_rgba(236,72,153,0.15)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        rounded-xl p-6
        ${variantStyles[variant]}
        ${glow ? glowStyles[glowColor] : ''}
        transition-all duration-200
        ${className}
      `}
    >
      {/* Header */}
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-6">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-200/80 transition-colors duration-150">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
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
