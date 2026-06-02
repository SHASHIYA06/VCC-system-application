'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Button3DProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber' | 'pink';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  interactive?: boolean;
}

export function Button3D({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  glowColor = 'cyan',
  onClick,
  disabled = false,
  type = 'button',
  interactive = true,
}: Button3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive || disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -8;
    const rotateYValue = ((x - centerX) / centerX) * 8;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-500/50 hover:border-cyan-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40',
    secondary:
      'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 border border-slate-600/50 hover:border-slate-500 shadow-lg shadow-slate-600/20',
    outline:
      'bg-transparent text-slate-200 border-2 border-slate-600 hover:border-cyan-400 hover:text-cyan-400',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-900/30 border border-transparent',
  };

  const glowColors = {
    cyan: 'hover:shadow-cyan-400/50',
    blue: 'hover:shadow-blue-400/50',
    purple: 'hover:shadow-purple-400/50',
    green: 'hover:shadow-green-400/50',
    orange: 'hover:shadow-orange-400/50',
    red: 'hover:shadow-red-400/50',
    amber: 'hover:shadow-amber-400/50',
    pink: 'hover:shadow-pink-400/50',
  };

  return (
    <motion.button
      type={type}
      className={`relative font-bold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${sizeClasses[size]} ${variantClasses[variant]} ${glowColors[glowColor]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      disabled={disabled}
      style={{
        transformStyle: interactive && !disabled ? 'preserve-3d' : 'flat',
      }}
      animate={
        interactive && !disabled
          ? {
              rotateX,
              rotateY,
              y: isPressed ? 2 : isHovered ? -2 : 0,
            }
          : {}
      }
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      whileTap={{ scale: interactive && !disabled ? 0.95 : 1 }}
    >
      {/* Gradient overlay */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

      {/* 3D depth effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Animated glow on hover */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 pointer-events-none"
          animate={{
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
    </motion.button>
  );
}
