'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles = {
  primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/30 shadow-sm hover:shadow-glow-sm',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30',
  danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-500/30',
  warning: 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500/30',
  info: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30',
  outline: 'bg-transparent border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-xl font-semibold
        transition-colors duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        cursor-pointer
        inline-flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
