import React from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const ReactFlowComponent = ReactFlow as any;

// A premium wrapper around React Flow with glass‑morphism styling
export default function GraphViewer({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  return (
    <div className="relative h-[600px] w-full rounded-xl bg-white/10 backdrop-blur-md shadow-xl border border-white/20">
      <ReactFlowComponent nodes={nodes} edges={edges} fitView>
        <Background color="#ffffff33" gap={20} />
        <MiniMap nodeColor={(n) => (n.style?.background as any ?? '#fff')} />
        <Controls showZoom showFitView showInteractive={false} />
      </ReactFlowComponent>
    </div>
  );
}
