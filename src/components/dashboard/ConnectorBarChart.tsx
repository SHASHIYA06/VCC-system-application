'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ConnectorData {
  name: string;
  value: number;
}

interface ConnectorBarChartProps {
  data: ConnectorData[];
}

const COLORS = [
  '#06b6d4', '#8b5cf6', '#f97316', '#ef4444', '#10b981',
  '#f59e0b', '#ec4899', '#3b82f6', '#6366f1', '#14b8a6',
  '#a855f7', '#f43f5e', '#22c55e', '#eab308', '#64748b',
];

export default function ConnectorBarChart({ data }: ConnectorBarChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${value} connectors`, 'Count']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <span className="text-2xl font-bold text-white font-mono">{total.toLocaleString()}</span>
        <span className="text-xs text-slate-500 ml-2">Total Connectors</span>
      </div>
    </div>
  );
}
