'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic import for react-force-graph-2d to prevent SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface StarBranchVisualizerProps {
  data: any;
  onNodeClick?: (node: any) => void;
}

export default function StarBranchVisualizer({ data, onNodeClick }: StarBranchVisualizerProps) {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dimensions on resize
  useEffect(() => {
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
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Process data for react-force-graph
  const graphData = useMemo(() => {
    if (!data || !data.nodes) return { nodes: [], links: [] };

    const nodes = data.nodes.map((n: any) => ({
      ...n,
      val: n.type === 'system' ? 30 : n.type === 'drawing' ? 20 : n.type === 'connector' ? 10 : 5,
      color: n.color || '#4f46e5',
      name: n.label
    }));

    const links = (data.edges || []).map((e: any) => ({
      ...e,
      color: e.color || '#ffffff40'
    }));

    return { nodes, links };
  }, [data]);

  const handleNodeClick = useCallback((node: any) => {
    // Zoom in on the node
    fgRef.current?.centerAt(node.x, node.y, 1000);
    fgRef.current?.zoom(4, 1000);
    
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] relative glass-card-premium overflow-hidden border border-glass-border rounded-xl shadow-glow-lg"
    >
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] mix-blend-screen pointer-events-none z-0"></div>
      
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>

      <div className="relative z-10 w-full h-full">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={6}
            linkColor="color"
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={d => d.value * 0.001 || 0.005}
            onNodeClick={handleNodeClick}
            backgroundColor="rgba(0,0,0,0)"
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTicks={100}
            onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8 glass-card rounded-xl border border-white/10 max-w-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full mx-auto mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              />
              <h3 className="text-xl font-bold text-white mb-2 font-mono">INITIALIZING TOPOLOGY</h3>
              <p className="text-white/60 text-sm">Building the star and branch circuit network from database records...</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-20 flex gap-2">
        <div className="px-3 py-1.5 glass-card bg-slate-900/80 rounded border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span> System
        </div>
        <div className="px-3 py-1.5 glass-card bg-slate-900/80 rounded border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Device
        </div>
        <div className="px-3 py-1.5 glass-card bg-slate-900/80 rounded border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Connector
        </div>
      </div>
    </div>
  );
}
