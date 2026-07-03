'use client';

import React, { useState, useEffect } from 'react';
import StarBranchVisualizer from './StarBranchVisualizer';
import { SystemTopology, SystemNode, SystemEdge } from '@/lib/gsd/topology';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

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
  const [formattedData, setFormattedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTopology = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ action: 'topology' });
        if (system) params.append('system', system);

        const res = await fetch(`/api/gsd?${params.toString()}`);
        const data = await res.json();

        if (cancelled) return;

        if (data.success && data.data) {
          const topo: SystemTopology = data.data;
          setFormattedData({
            nodes: topo.nodes.map((n: SystemNode) => ({
              id: n.id,
              label: n.label,
              type: n.type,
              color: n.color || '#6b7280',
              metadata: n.metadata,
            })),
            edges: topo.edges.map((e: SystemEdge) => ({
              source: e.source,
              target: e.target,
              label: e.label,
              color: e.color || '#6b7280',
              value: 1,
            })),
          });
        } else {
          setError(data.error || 'Failed to load topology');
        }
      } catch (err) {
        if (!cancelled) setError('Failed to connect to topology API');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTopology();
    return () => { cancelled = true; };
  }, [system]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading topology data...</p>
        </div>
      </div>
    );
  }

  if (error || !formattedData) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-2">{error || 'No topology data available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] relative" suppressHydrationWarning>
      <StarBranchVisualizer
        data={formattedData}
        onNodeClick={onNodeClick}
      />
    </div>
  );
};

export default GSDViewer;
