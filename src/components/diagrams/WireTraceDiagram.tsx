"use client";

import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface WireTraceProps {
  wireNo: string;
  sourceEquipment: string;
  sourcePin: string;
  targetEquipment: string;
  targetPin: string;
  color?: string;
}

export default function WireTraceDiagram({ 
  wireNo, 
  sourceEquipment, 
  sourcePin, 
  targetEquipment, 
  targetPin,
  color = '#2563eb' // default blue
}: WireTraceProps) {
  
  const initialNodes = [
    {
      id: 'source-eq',
      type: 'input',
      data: { label: `Equipment: ${sourceEquipment}` },
      position: { x: 50, y: 50 },
      style: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }
    },
    {
      id: 'source-pin',
      data: { label: `Pin: ${sourcePin}` },
      position: { x: 250, y: 65 },
      style: { background: '#f1f5f9', border: '1px solid #94a3b8', borderRadius: '4px', fontSize: '12px' }
    },
    {
      id: 'wire-node',
      data: { label: `Wire: ${wireNo}` },
      position: { x: 450, y: 65 },
      style: { background: '#eff6ff', border: `2px solid ${color}`, borderRadius: '4px', fontWeight: 'bold' }
    },
    {
      id: 'target-pin',
      data: { label: `Pin: ${targetPin}` },
      position: { x: 650, y: 65 },
      style: { background: '#f1f5f9', border: '1px solid #94a3b8', borderRadius: '4px', fontSize: '12px' }
    },
    {
      id: 'target-eq',
      type: 'output',
      data: { label: `Equipment: ${targetEquipment}` },
      position: { x: 850, y: 50 },
      style: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }
    },
  ];

  const initialEdges = [
    { id: 'e1-2', source: 'source-eq', target: 'source-pin', animated: false },
    { 
      id: 'e2-3', 
      source: 'source-pin', 
      target: 'wire-node', 
      animated: true,
      style: { stroke: color, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: color }
    },
    { 
      id: 'e3-4', 
      source: 'wire-node', 
      target: 'target-pin', 
      animated: true,
      style: { stroke: color, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: color }
    },
    { id: 'e4-5', source: 'target-pin', target: 'target-eq', animated: false },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ height: '400px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
