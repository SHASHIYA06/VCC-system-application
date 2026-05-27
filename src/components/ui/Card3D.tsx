'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber' | 'pink' | 'indigo' | 'slate' | 'violet' | 'emerald';
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'elevated' | 'flat' | 'outline';
  interactive?: boolean;
}

export function Card3D({ 
  children, 
  className = '', 
  glowColor = 'cyan', 
  onClick, 
  href,
  variant = 'default',
  interactive = true
}: Card3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
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

  const glowColors = {
    cyan: 'shadow-cyan-500/50 hover:shadow-cyan-400/70',
    blue: 'shadow-blue-500/50 hover:shadow-blue-400/70',
    purple: 'shadow-purple-500/50 hover:shadow-purple-400/70',
    green: 'shadow-green-500/50 hover:shadow-green-400/70',
    orange: 'shadow-orange-500/50 hover:shadow-orange-400/70',
    red: 'shadow-red-500/50 hover:shadow-red-400/70',
    amber: 'shadow-amber-500/50 hover:shadow-amber-400/70',
    pink: 'shadow-pink-500/50 hover:shadow-pink-400/70',
    indigo: 'shadow-indigo-500/50 hover:shadow-indigo-400/70',
    slate: 'shadow-slate-500/50 hover:shadow-slate-400/70',
    violet: 'shadow-violet-500/50 hover:shadow-violet-400/70',
    emerald: 'shadow-emerald-500/50 hover:shadow-emerald-400/70',
  };

  const variantStyles = {
    default: 'glass-card-morph',
    elevated: 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl',
    flat: 'bg-slate-900/40 backdrop-blur-md border border-slate-800/30',
    outline: 'bg-transparent backdrop-blur-sm border-2 border-slate-600/50',
  };

  const content = (
    <motion.div
      className={`relative perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={onClick}
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
        className={`${variantStyles[variant]} ${glowColors[glowColor]} transition-all duration-300 ${interactive ? 'cursor-pointer' : ''}`}
        animate={{
          y: isHovered && interactive ? -4 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
