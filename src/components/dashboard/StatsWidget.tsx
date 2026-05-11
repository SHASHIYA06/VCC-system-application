import { query } from '@/lib/db';
import { FileText, Cpu, Cable, Activity, Zap, TrainFront } from 'lucide-react';

async function getStats() {
  try {
    const [systems, drawings, trainlines, equipment] = await Promise.all([
      query<{ count: number }>('SELECT COUNT(*) as count FROM systems'),
      query<{ count: number }>('SELECT COUNT(*) as count FROM drawings'),
      query<{ count: number }>('SELECT COUNT(*) as count FROM trainlines'),
      query<{ count: number }>('SELECT COUNT(*) as count FROM equipment'),
    ]);
    
    const drawingsCount = Number(drawings[0]?.count) || 0;
    const systemsCount = Number(systems[0]?.count) || 0;
    const trainlinesCount = Number(trainlines[0]?.count) || 0;
    const equipmentCount = Number(equipment[0]?.count) || 0;
    
    return {
      drawings: drawingsCount,
      systems: systemsCount,
      trainlines: trainlinesCount,
      equipment: equipmentCount,
    };
  } catch (e) {
    return { drawings: 0, systems: 0, trainlines: 0, equipment: 0 };
  }
}

export default async function StatsWidget() {
  const stats = await getStats();
  
  const statItems = [
    { name: 'Systems', stat: stats.systems, icon: Activity, color: 'blue' },
    { name: 'Trainlines', stat: stats.trainlines, icon: TrainFront, color: 'cyan' },
    { name: 'Drawings', stat: stats.drawings, icon: FileText, color: 'emerald' },
    { name: 'Equipment', stat: stats.equipment, icon: Cpu, color: 'purple' },
  ];
  
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/30 to-blue-600/20 border-blue-500/30',
    cyan: 'from-cyan-500/30 to-cyan-600/20 border-cyan-500/30',
    emerald: 'from-emerald-500/30 to-emerald-600/20 border-emerald-500/30',
    purple: 'from-purple-500/30 to-purple-600/20 border-purple-500/30',
  };
  
  const iconColorMap: Record<string, string> = {
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.name}
          className={`glass-card p-6 relative overflow-hidden`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[item.color]} opacity-50`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[item.color]}`}>
                <item.icon className={`h-6 w-6 ${iconColorMap[item.color]}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">{item.stat.toLocaleString()}</p>
              <p className="text-sm text-slate-400 mt-1">{item.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}