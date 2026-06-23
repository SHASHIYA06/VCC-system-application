'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic import for react-force-graph-3d to prevent SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface StarBranchVisualizerProps {
  data: any;
  onNodeClick?: (node: any) => void;
}

export default function StarBranchVisualizer({ data, onNodeClick }: StarBranchVisualizerProps) {
  const fgRef = useRef<any>(null);
  const intervalRef = useRef<any>(null); // Store interval here to clear
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      // Clear interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Process data for react-force-graph
  const graphData = useMemo(() => {
    if (!data || !data.nodes) return { nodes: [], links: [] };

    const nodes = data.nodes.map((n: any) => {
      // 3D Galaxy sizing logic
      let size = 5;
      if (n.type === 'system') size = 30; // Sun
      else if (n.type === 'drawing') size = 20; // Planet
      else if (n.type === 'connector') size = 10; // Moon
      
      return {
        ...n,
        val: size,
        color: n.color || '#4f46e5',
        name: n.label
      };
    });

    const links = (data.edges || []).map((e: any) => ({
      ...e,
      color: e.color || '#ffffff40'
    }));

    return { nodes, links };
  }, [data]);

  const handleNodeClick = useCallback((node: any) => {
    if (fgRef.current && typeof fgRef.current.cameraPosition === 'function') {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
      
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }
    
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] relative glass-card-premium overflow-hidden border border-glass-border rounded-xl shadow-glow-lg bg-black"
    >
      <div className="absolute inset-0 grid-pattern opacity-[0.05] mix-blend-screen pointer-events-none z-0"></div>
      
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>

      <div className="relative z-10 w-full h-full">
        {graphData.nodes.length > 0 ? (
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={6}
            linkColor="color"
            linkWidth={1}
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={d => d.value * 0.001 || 0.005}
            onNodeClick={handleNodeClick}
            backgroundColor="rgba(0,0,0,0)"
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTicks={100}
            nodeResolution={32}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8 glass-card rounded-xl border border-white/10 max-w-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full mx-auto mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              />
              <h3 className="text-xl font-bold text-white mb-2 font-mono">INITIALIZING 3D GALAXY TOPOLOGY</h3>
              <p className="text-white/60 text-sm">Building the micro-level 3D network from database records...</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-20 flex gap-2">
        <div className="px-3 py-1.5 glass-card bg-slate-900/80 rounded border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span> System (Sun)
        </div>
        <div className="px-3 py-1.5 glass-card bg-slate-900/80 rounded border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span> Device (Planet)
        </div>
        <div className="px-3 py-1.5 glass-card bg-slate-900/80 rounded border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span> Connector (Moon)
        </div>
      </div>
      
      {/* HUD overlay for 3D controls info */}
      <div className="absolute top-4 right-4 z-20">
         <div className="px-3 py-2 glass-card bg-black/60 rounded border border-white/10 text-xs font-mono text-white/50 text-right">
           <div>Left Click: Rotate</div>
           <div>Right Click: Pan</div>
           <div>Scroll: Zoom</div>
         </div>
      </div>
    </div>
  );
}
