'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  href?: string;
}

export function Card3D({ children, className = '', glowColor = 'cyan', onClick, href }: Card3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const glowColors = {
    cyan: 'shadow-cyan-500/50',
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    green: 'shadow-green-500/50',
    orange: 'shadow-orange-500/50',
    red: 'shadow-red-500/50',
    amber: 'shadow-amber-500/50',
  };

  const content = (
    <motion.div
      className={`relative perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <div className={`glass-card hover:shadow-2xl ${glowColors[glowColor as keyof typeof glowColors] || glowColors.cyan} transition-all duration-300`}>
        {children}
      </div>
    </motion.div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
