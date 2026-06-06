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
  // Premium 3D Glassmorphism Panel Styles
  const variantStyles = {
    // Default: Premium glass with 3D depth
    default: 'glass-card-premium backdrop-blur-4xl border border-glass-border shadow-premium',
    // Elevated: Ultra-premium with enhanced glow
    elevated: 'glass-card-premium backdrop-blur-4xl border border-glass-medium shadow-premium hover:shadow-glow-lg',
    // Flat: Subtle premium glass
    flat: 'glass-card-premium backdrop-blur-3xl border border-glass-light shadow-depth',
    // Accent: Highlighted with color tint
    accent: 'glass-card-premium backdrop-blur-4xl border border-accent-500/30 shadow-premium bg-gradient-to-br from-accent-500/5 to-transparent',
  };

  const glowStyles = {
    cyan: 'hover:shadow-glow-lg hover:border-cyan-400/40',
    blue: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:border-blue-400/40',
    purple: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:border-purple-400/40',
    green: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:border-green-400/40',
    orange: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:border-orange-400/40',
    pink: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:border-pink-400/40',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ 
        translateY: -5,
        scale: 1.02,
        rotateX: 2,
      }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={`
        rounded-5xl p-8
        ${variantStyles[variant]}
        ${glow ? glowStyles[glowColor] : ''}
        transition-all duration-500 ease-smooth
        gpu-accelerated card-3d
        relative overflow-hidden
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* Holographic background effect */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-[0.02] animate-mesh-rotate pointer-events-none" />
      
      {/* Premium light reflection */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />

      {/* Header with premium styling */}
      {(title || icon) && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-8"
        >
          {icon && (
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center text-white shadow-glow-sm backdrop-blur-xl"
            >
              {icon}
            </motion.div>
          )}
          <div className="flex-1">
            {title && (
              <h2 className="text-2xl font-bold font-mono text-neon tracking-wider uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-white/70 mt-1 font-sans">
                {subtitle}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Content with fade-in animation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6 relative z-10"
      >
        {children}
      </motion.div>

      {/* Premium bottom glow */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent" />
    </motion.div>
  );
}
