import React from 'react';
import GraphViewer from '@/components/ui/GraphViewer';
import { Node, Edge } from '@xyflow/react';
import { notFound } from 'next/navigation';

// Transform API payload into React Flow nodes/edges
function buildGraph(data: any) {
  const { trainline, relatedWires = [] } = data;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // main trainline node
  nodes.push({
    id: `tl-${trainline.id}`,
    data: { label: trainline.itemName ?? trainline.wireNo },
    position: { x: 0, y: 0 },
    style: { background: 'linear-gradient(135deg, #6e45e2, #88d3ce)', color: '#fff' },
  });

  // add related wires as nodes
  relatedWires.forEach((w: any, idx: number) => {
    const nodeId = `wire-${w.id}`;
    nodes.push({
      id: nodeId,
      data: { label: w.wireNo },
      position: { x: 200 * (idx + 1), y: 0 },
      style: { background: '#222', color: '#fff' },
    });
    edges.push({
      id: `e-${trainline.id}-${w.id}`,
      source: `tl-${trainline.id}`,
      target: nodeId,
      animated: true,
      style: { stroke: '#fff' },
    });
  });

  return { nodes, edges };
}

export default async function TrainlineDetailPage({ params }: { params: { trainline_no: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/trainlines/${params.trainline_no}`);
  if (!res.ok) {
    notFound();
  }
  const data = await res.json();
  const { nodes, edges } = buildGraph(data);

  return (
    <section className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <h1 className="text-3xl font-bold text-center text-white mb-6 drop-shadow-lg">
        Trainline Trace – {params.trainline_no}
      </h1>
      <div className="flex justify-center">
        <GraphViewer nodes={nodes} edges={edges} />
      </div>
    </section>
  );
}
