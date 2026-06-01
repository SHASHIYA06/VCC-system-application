'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SystemNode, SystemEdge, SystemTopology } from '@/lib/gsd/topology';
import { Loader2 } from 'lucide-react';

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
  onEdgeClick,
  interactive = true,
}) => {
  const [topology, setTopology] = useState<SystemTopology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);

  // Fetch topology data
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
          throw new Error('Failed to fetch GSD topology');
        }

        const data = await response.json();
        if (data.success) {
          setTopology(data.data);

          // Convert nodes
          const xyNodes = data.data.nodes.map((node: SystemNode) => ({
            id: node.id,
            data: {
              label: node.label,
              type: node.type,
              metadata: node.metadata,
            },
            position: node.position,
            style: {
              background: node.color || '#3b82f6',
              color: '#fff',
              border: '2px solid #1e40af',
              borderRadius: node.type === 'connector' ? '4px' : '50%',
              padding: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center',
              width: node.type === 'connector' ? '60px' : '80px',
              height: node.type === 'connector' ? '40px' : '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            } as React.CSSProperties,
          }));

          // Convert edges
          const xyEdges = data.data.edges.map((edge: SystemEdge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            animated: edge.animated || false,
            style: {
              stroke: edge.color || '#6b7280',
              strokeWidth: 2,
            },
            markerEnd: {
              type: 'arrowclosed',
              color: edge.color || '#6b7280',
            },
          }));

          setNodes(xyNodes);
          setEdges(xyEdges);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching GSD topology:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopology();
  }, [system, device, wire, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      const gsdNode = topology?.nodes.find((n) => n.id === node.id);
      if (gsdNode) {
        setSelectedNode(gsdNode);
        onNodeClick?.(gsdNode);
      }
    },
    [topology, onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: any) => {
      const gsdEdge = topology?.edges.find((e) => e.id === edge.id);
      if (gsdEdge) {
        onEdgeClick?.(gsdEdge);
      }
    },
    [topology, onEdgeClick]
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-slate-300">Loading GSD topology...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4 p-6 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 font-semibold">Error Loading GSD</p>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg overflow-hidden border border-cyan-500/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
      >
        <Background color="#1e293b" gap={16} />
        <Controls />
        <MiniMap
          style={{
            background: '#0f172a',
            border: '1px solid #06b6d4',
          }}
          maskColor="rgba(0, 0, 0, 0.3)"
        />

        {/* Info Panel */}
        <Panel position="top-left" className="bg-slate-900/80 border border-cyan-500/30 rounded-lg p-4 backdrop-blur">
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-cyan-400 mb-2">GSD Topology</p>
            <p>Nodes: {topology?.statistics.totalDevices || 0}</p>
            <p>Connections: {topology?.statistics.totalConnections || 0}</p>
            <p>Wires: {topology?.statistics.totalWires || 0}</p>
          </div>
        </Panel>

        {/* Selected Node Info */}
        {selectedNode && (
          <Panel position="top-right" className="bg-slate-900/80 border border-cyan-500/30 rounded-lg p-4 backdrop-blur max-w-xs">
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-cyan-400 mb-2">{selectedNode.label}</p>
              <p className="text-xs text-slate-400 mb-2">Type: {selectedNode.type}</p>
              <p className="text-xs text-slate-400 mb-2">System: {selectedNode.system}</p>
              {Object.entries(selectedNode.metadata).map(([key, value]) => (
                <p key={key} className="text-xs text-slate-400">
                  {key}: {String(value)}
                </p>
              ))}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default GSDViewer;
