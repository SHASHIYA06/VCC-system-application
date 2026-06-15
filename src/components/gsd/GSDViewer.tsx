'use client';

import React, { useEffect, useState } from 'react';
import StarBranchVisualizer from './StarBranchVisualizer';
import { Loader2, AlertTriangle } from 'lucide-react';
import { SystemTopology, SystemNode, SystemEdge } from '@/lib/gsd/topology';

interface GSDViewerProps {
  system?: string;
  device?: string;
  wire?: string;
  onNodeClick?: (node: SystemNode) => void;
  onEdgeClick?: (edge: SystemEdge) => void;
  interactive?: boolean;
}

export const GSDViewer: React.FC<GSDViewerProps> = ({
  system,
  device,
  wire,
  onNodeClick,
}) => {
  const [topology, setTopology] = useState<(SystemTopology & { formattedData?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (system) params.append('system', system);
        if (device) params.append('device', device);
        if (wire) params.append('wire', wire);

        const response = await fetch(`/api/gsd?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch GSD topology (${response.status})`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Unknown error fetching topology');
        }

        // Convert the backend topology data format into what ForceGraph expects
        const formattedData = {
          nodes: (data.data.nodes || []).map((n: SystemNode) => ({
            id: n.id,
            label: n.label,
            type: n.type,
            color: n.color || '#3b82f6',
            metadata: n.metadata
          })),
          edges: (data.data.edges || []).map((e: SystemEdge) => ({
            source: e.source,
            target: e.target,
            label: e.label,
            color: '#06b6d480', // Cyan-ish translucent
            value: 2 // Particle speed/size
          }))
        };

        // For react-force-graph, nodes and edges must reference each other correctly
        setTopology({ ...data.data, formattedData });

      } catch (err: any) {
        console.error('Error fetching GSD topology:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopology();
  }, [system, device, wire]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-slate-900/50 rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-cyan-400 font-mono animate-pulse">Initializing Neural Topology...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-slate-900/50 rounded-xl border border-red-500/20">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
          <AlertTriangle className="w-12 h-12 text-red-500/80" />
          <h3 className="text-xl font-bold text-red-400">Topology Error</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] relative">
      {topology?.formattedData && (
        <StarBranchVisualizer 
          data={topology.formattedData} 
          onNodeClick={onNodeClick} 
        />
      )}
    </div>
  );
};

export default GSDViewer;
