'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WireDistributionData {
  name: string;
  value: number;
  color?: string;
}

interface WireDistributionChartProps {
  data: WireDistributionData[];
}

const COLORS = [
  '#06b6d4', '#8b5cf6', '#f97316', '#ef4444', '#10b981',
  '#f59e0b', '#ec4899', '#3b82f6', '#6366f1', '#14b8a6',
  '#a855f7', '#f43f5e', '#22c55e', '#eab308', '#64748b',
];

export default function WireDistributionChart({ data }: WireDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(15, 23, 42, 0.8)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${Number(value).toLocaleString()} wires`, 'Count']}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <span className="text-2xl font-bold text-white font-mono">{total.toLocaleString()}</span>
        <span className="text-xs text-slate-500 ml-2">Total Wires</span>
      </div>
    </div>
  );
}
