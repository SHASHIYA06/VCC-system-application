'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red' | 'amber';
  variant?: 'default' | 'premium' | 'glass' | 'flat' | 'elevated';
}

export function Card3D({
  children,
  className = '',
  interactive = true,
  glowColor = 'cyan',
  variant = 'default',
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
    
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const glowStyles = {
    cyan: 'hover:shadow-glow-lg hover:border-cyan-400/50',
    blue: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:border-blue-400/50',
    purple: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:border-purple-400/50',
    green: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:border-green-400/50',
    orange: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:border-orange-400/50',
    pink: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:border-pink-400/50',
    red: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:border-red-400/50',
    amber: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:border-amber-400/50',
  };

  const variantStyles = {
    default: 'glass-card-premium backdrop-blur-4xl border border-glass-border shadow-premium',
    premium: 'glass-card-premium backdrop-blur-4xl border border-glass-medium shadow-premium bg-gradient-to-br from-white/10 to-white/5',
    glass: 'glass-card-premium backdrop-blur-4xl border border-glass-light shadow-depth bg-gradient-to-br from-white/5 to-transparent',
    flat: 'glass-card-premium backdrop-blur-3xl border border-glass-light shadow-depth bg-gradient-to-br from-white/3 to-transparent',
    elevated: 'glass-card-premium backdrop-blur-4xl border border-glass-medium shadow-premium hover:shadow-glow-lg bg-gradient-to-br from-white/8 to-white/3',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        rotateX: interactive && isHovered ? rotateX : 0,
        rotateY: interactive && isHovered ? rotateY : 0,
      }}
      whileHover={interactive ? {
        translateY: -8,
        scale: 1.02,
      } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className={`
        relative overflow-hidden rounded-5xl
        ${variantStyles[variant]}
        ${interactive ? glowStyles[glowColor] : ''}
        ${interactive ? 'cursor-pointer' : ''}
        transition-all duration-500 ease-smooth
        gpu-accelerated
        ${className}
      `}
    >
      {/* Premium holographic mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-[0.02] animate-mesh-rotate pointer-events-none" />
      
      {/* Premium light reflection */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />

      {/* Particle effect on hover */}
      {interactive && (
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{
            opacity: isHovered ? 0.1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="particles">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${6 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Premium bottom accent */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}