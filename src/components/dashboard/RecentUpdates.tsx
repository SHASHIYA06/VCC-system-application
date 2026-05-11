import { query } from '@/lib/db';
import Link from 'next/link';

async function getRecentSystems() {
  try {
    const result = await query<{ code: string; name: string; category: string }>(
      'SELECT code, name, category FROM systems ORDER BY sort_order LIMIT 8'
    );
    return result;
  } catch {
    return [];
  }
}

export default async function RecentUpdates() {
  const systems = await getRecentSystems();
  
  const updateItems = [
    { type: 'system', label: 'Systems', value: systems.length, color: 'blue' },
    { type: 'trainline', label: 'Trainlines', value: 51, color: 'cyan' },
    { type: 'equipment', label: 'Equipment', value: 0, color: 'emerald' },
    { type: 'drawings', label: 'Drawings', value: 0, color: 'purple' },
  ];
  
  return (
    <div className="glass-card p-6 mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">System Explorer</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systems.map((system) => {
          const colorMap: Record<string, string> = {
            'Core Systems': 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
            'Power': 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
            'Propulsion': 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
            'Auxiliary': 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
            'Control': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
            'Foundation': 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
            'Electrical Distribution': 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
            'Communication': 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
          };
          const theme = colorMap[system.category || ''] || colorMap['Core Systems'];
          
          return (
            <Link 
              key={system.code} 
              href={`/systems/${system.code}`}
              className="group"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${theme} border hover:scale-105 transition-all duration-200`}>
                <div className="text-lg font-bold text-white">{system.code}</div>
                <div className="text-sm text-slate-300 truncate mt-1">{system.name}</div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-center">
        <Link href="/systems" className="glass-btn text-sm">
          View All Systems →
        </Link>
      </div>
    </div>
  );
}