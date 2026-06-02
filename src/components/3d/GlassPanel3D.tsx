'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface GlassPanel3DProps {
  children: ReactNode;
  className?: string;
  title?: string;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber' | 'pink';
  interactive?: boolean;
  depth?: 'shallow' | 'medium' | 'deep';
}

export function GlassPanel3D({
  children,
  className = '',
  title,
  glowColor = 'cyan',
  interactive = true,
  depth = 'medium',
}: GlassPanel3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;

    const panel = e.currentTarget;
    const rect = panel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -5;
    const rotateYValue = ((x - centerX) / centerX) * 5;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const glowColors = {
    cyan: 'shadow-cyan-500/40 hover:shadow-cyan-400/60',
    blue: 'shadow-blue-500/40 hover:shadow-blue-400/60',
    purple: 'shadow-purple-500/40 hover:shadow-purple-400/60',
    green: 'shadow-green-500/40 hover:shadow-green-400/60',
    orange: 'shadow-orange-500/40 hover:shadow-orange-400/60',
    red: 'shadow-red-500/40 hover:shadow-red-400/60',
    amber: 'shadow-amber-500/40 hover:shadow-amber-400/60',
    pink: 'shadow-pink-500/40 hover:shadow-pink-400/60',
  };

  const depthLayers = {
    shallow: 'backdrop-blur-sm bg-slate-900/20 border-slate-800/30 shadow-lg',
    medium: 'backdrop-blur-xl bg-slate-900/40 border-slate-700/50 shadow-2xl',
    deep: 'backdrop-blur-3xl bg-slate-900/60 border-slate-600/60 shadow-[0_25px_50px_rgba(0,0,0,0.5)]',
  };

  return (
    <motion.div
      className={`relative perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <motion.div
        className={`relative border rounded-2xl p-6 ${depthLayers[depth]} ${glowColors[glowColor]} transition-all duration-300 ${interactive ? 'cursor-pointer' : ''}`}
        animate={{
          y: isHovered && interactive ? -2 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Gradient overlay for depth effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />

        {/* Title */}
        {title && (
          <h3 className="text-lg font-bold text-white mb-4 relative z-10">{title}</h3>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* 3D border glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
