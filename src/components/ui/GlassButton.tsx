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

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: GlassButtonProps) {
  // Design System: Professional enterprise button styles
  // Primary: #007AFF (System Blue), Secondary: #FFFFFF (White), Text: #000000
  const variantStyles = {
    // Primary CTA: System Blue with white text
    primary: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950',
    // Secondary: Light background with text
    secondary: 'bg-slate-200 hover:bg-slate-100 active:bg-slate-300 text-slate-900 shadow-md shadow-slate-400/20 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950',
    // Success: Green
    success: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950',
    // Danger/Error: Red
    danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-500/25 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-950',
    // Warning: Amber
    warning: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-lg shadow-amber-500/25 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950',
    // Info: Cyan
    info: 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950',
    // Outline: Transparent with border
    outline: 'bg-transparent border-2 border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, translateY: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-lg font-semibold
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translateY-0
        backdrop-blur-sm
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
