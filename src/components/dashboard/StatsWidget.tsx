import { FileText, Cpu, Cable, Activity } from 'lucide-react';

const stats = [
  { name: 'Total Drawings', stat: '143', icon: FileText, change: '+4', changeType: 'increase' },
  { name: 'Systems Tracked', stat: '16', icon: Activity, change: '0', changeType: 'neutral' },
  { name: 'Equipment Nodes', stat: '1,284', icon: Cpu, change: '+12', changeType: 'increase' },
  { name: 'Wire Connections', stat: '14,028', icon: Cable, change: '+142', changeType: 'increase' },
];

export default function StatsWidget() {
  return (
    <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className="absolute rounded-md bg-blue-500 p-3">
              <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-slate-500">{item.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-slate-900">{item.stat}</p>
            <p
              className={`ml-2 flex items-baseline text-sm font-semibold ${
                item.changeType === 'increase' ? 'text-green-600' : 'text-slate-500'
              }`}
            >
              {item.change}
            </p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
