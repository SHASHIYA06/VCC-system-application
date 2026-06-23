'use client';

import React from 'react';
import StarBranchVisualizer from './StarBranchVisualizer';
import { SystemTopology, SystemNode, SystemEdge } from '@/lib/gsd/topology';

interface GSDViewerProps {
  system?: string;
  device?: string;
  wire?: string;
  onNodeClick?: (node: SystemNode) => void;
  onEdgeClick?: (edge: SystemEdge) => void;
  interactive?: boolean;
}

// Hardcoded demo topology data
const demoTopology: SystemTopology & { formattedData?: any } = {
  nodes: [
    { id: 'device-demo-1', label: 'Traction Inverter', type: 'device', system: 'TRAC', position: { x: -200, y: 0 }, metadata: { deviceType: 'Inverter', tagNo: 'INV-01' }, color: '#3b82f6', icon: 'Cpu' },
    { id: 'device-demo-2', label: 'Auxiliary Power', type: 'device', system: 'APS', position: { x: 200, y: 0 }, metadata: { deviceType: 'Power Unit', tagNo: 'APS-01' }, color: '#10b981', icon: 'Zap' },
    { id: 'conn-demo-1', label: 'CN-101', type: 'connector', system: 'TRAC', position: { x: 0, y: -150 }, metadata: { pinCount: 8 }, color: '#f97316', icon: 'Plug' },
    { id: 'conn-demo-2', label: 'CN-202', type: 'connector', system: 'APS', position: { x: 0, y: 150 }, metadata: { pinCount: 12 }, color: '#06b6d4', icon: 'Plug' },
  ],
  edges: [
    { id: 'edge-demo-1', source: 'device-demo-1', target: 'conn-demo-1', label: 'Power', type: 'power', metadata: {}, color: '#ef4444', animated: true },
    { id: 'edge-demo-2', source: 'device-demo-2', target: 'conn-demo-2', label: 'Signal', type: 'signal', metadata: {}, color: '#3b82f6', animated: true },
  ],
  systems: [
    { code: 'TRAC', name: 'Traction System', devices: 15, connections: 40, color: '#3b82f6' },
    { code: 'APS', name: 'Auxiliary Power', devices: 10, connections: 30, color: '#10b981' },
  ],
  statistics: {
    totalDevices: 2,
    totalConnections: 2,
    totalWires: 2,
    systemCount: 2,
    connectorCount: 2,
    devicesBySystem: {},
    connectionsByType: {},
  },
  formattedData: {
    nodes: [
      { id: 'device-demo-1', label: 'Traction Inverter', type: 'device', color: '#3b82f6', metadata: { deviceType: 'Inverter', tagNo: 'INV-01' } },
      { id: 'device-demo-2', label: 'Auxiliary Power', type: 'device', color: '#10b981', metadata: { deviceType: 'Power Unit', tagNo: 'APS-01' } },
      { id: 'conn-demo-1', label: 'CN-101', type: 'connector', color: '#f97316', metadata: { pinCount: 8 } },
      { id: 'conn-demo-2', label: 'CN-202', type: 'connector', color: '#06b6d4', metadata: { pinCount: 12 } },
    ],
    edges: [
      { source: 'device-demo-1', target: 'conn-demo-1', label: 'Power', color: '#06b6d480', value: 2 },
      { source: 'device-demo-2', target: 'conn-demo-2', label: 'Signal', color: '#06b6d480', value: 2 },
    ],
  },
};

export const GSDViewer: React.FC<GSDViewerProps> = ({
  system,
  device,
  wire,
  onNodeClick,
}) => {
  return (
    <div className="w-full h-full min-h-[600px] relative" suppressHydrationWarning>
      <StarBranchVisualizer 
        data={demoTopology.formattedData} 
        onNodeClick={onNodeClick} 
      />
    </div>
  );
};

export default GSDViewer;
