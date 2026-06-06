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
  // Premium 3D Glassmorphism Button Styles
  const variantStyles = {
    // Primary: Premium gradient with glow
    primary: 'btn-premium bg-gradient-accent text-white border border-white/20 shadow-glow-lg hover:shadow-glow-xl focus:shadow-glow-xl transform-gpu',
    // Secondary: Glass effect with subtle glow
    secondary: 'glass-card-premium bg-glass-light hover:bg-glass-medium text-white border border-glass-border shadow-depth hover:shadow-depth-lg',
    // Success: Green gradient with glow
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border border-white/20 shadow-glow-sm hover:shadow-glow',
    // Danger: Red gradient with glow
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-white/20 shadow-glow-sm hover:shadow-glow',
    // Warning: Amber gradient with glow
    warning: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border border-white/20 shadow-glow-sm hover:shadow-glow',
    // Info: Cyan gradient with glow
    info: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-white/20 shadow-glow-sm hover:shadow-glow',
    // Outline: Premium glass outline
    outline: 'bg-transparent border-2 border-accent-500/60 hover:bg-accent-500/10 text-accent-400 hover:text-accent-300 shadow-inner-glow hover:shadow-glow-sm',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ 
        scale: disabled ? 1 : 1.05, 
        translateY: disabled ? 0 : -3,
        rotateX: disabled ? 0 : 5,
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95,
        translateY: disabled ? 0 : 0,
      }}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-premium font-bold font-mono
        transition-all duration-300 ease-smooth
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translateY-0
        backdrop-blur-4xl
        cursor-pointer
        uppercase tracking-wider
        relative overflow-hidden
        gpu-accelerated
        ${disabled ? '' : 'hover:animate-float-gentle'}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* Premium shimmer effect */}
      <div className="absolute inset-0 shimmer-enhanced opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
