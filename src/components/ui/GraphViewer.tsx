'use client';

import React from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Cast ReactFlow to any to avoid overload conflicts with our flexible node/edge types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RF = ReactFlow as any;

// Accept any node/edge shape so callers don't need to import @xyflow types
interface GraphViewerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any[];
}

// A premium wrapper around React Flow with glass‑morphism styling
export default function GraphViewer({ nodes, edges }: GraphViewerProps) {
  return (
    <ReactFlowProvider>
      <div className="relative h-[600px] w-full rounded-xl bg-white/10 backdrop-blur-md shadow-xl border border-white/20">
        <RF
          nodes={nodes as Node[]}
          edges={edges as Edge[]}
          fitView
        >
          <Background color="#ffffff33" gap={20} />
          <MiniMap nodeColor={(n: Node) => (n.style?.background as string) ?? '#06b6d4'} />
          <Controls showZoom showFitView showInteractive={false} />
        </RF>
      </div>
    </ReactFlowProvider>
  );
}
