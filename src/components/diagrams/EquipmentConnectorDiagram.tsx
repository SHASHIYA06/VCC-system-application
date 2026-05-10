"use client";

import React from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface EquipmentConnectorProps {
  equipmentCode: string;
  connectors: Array<{ code: string; pinCount: number }>;
}

export default function EquipmentConnectorDiagram({ equipmentCode, connectors }: EquipmentConnectorProps) {
  
  const nodes = [
    {
      id: 'eq-main',
      type: 'input',
      data: { label: `Equipment\n${equipmentCode}` },
      position: { x: 250, y: 50 },
      style: { background: '#f8fafc', border: '2px solid #334155', borderRadius: '8px', padding: '15px', fontWeight: 'bold' }
    },
    ...connectors.map((conn, index) => ({
      id: `conn-${conn.code}`,
      data: { label: `Connector: ${conn.code}\n(${conn.pinCount} pins)` },
      position: { x: 100 + (index * 200), y: 200 },
      style: { background: '#f1f5f9', border: '1px solid #64748b', borderRadius: '4px' }
    }))
  ];

  const edges = connectors.map(conn => ({
    id: `e-eq-${conn.code}`,
    source: 'eq-main',
    target: `conn-${conn.code}`,
    animated: false,
    style: { stroke: '#94a3b8' }
  }));

  const [currentNodes, , onNodesChange] = useNodesState(nodes);
  const [currentEdges, , onEdgesChange] = useEdgesState(edges);

  return (
    <div style={{ height: '300px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <ReactFlow
        nodes={currentNodes}
        edges={currentEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
