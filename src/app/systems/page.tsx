import Link from 'next/link';
import { query } from '@/lib/db';
import { Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen, Activity } from 'lucide-react';

interface System {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  sort_order: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trainlines: Train,
  Brake: ShieldCheck,
  TRAC: Zap,
  VAC: Wind,
  TMS: Activity,
  COMMS: Radio,
  APS: Battery,
  DOOR: DoorOpen,
  GEN: Settings,
  CAB: Settings,
  LIGHT: Zap,
  COUPL: Settings,
  LTEB: Zap,
  LTJB: Zap,
  EDB: Zap,
  HV: Zap,
};

const colorMap: Record<string, string> = {
  'Core Systems': 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'Power': 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  'Propulsion': 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  'Auxiliary': 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  'Control': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  'Foundation': 'from-slate-500/20 to-slate-600/10 border-slate-500/30',
  'Electrical': 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
};

export default async function SystemsPage() {
  let systems: System[] = [];
  
  try {
    systems = await query<System>('SELECT * FROM systems ORDER BY sort_order');
  } catch (e) {
    console.error('Failed to fetch systems', e);
  }

  if (systems.length === 0) {
    systems = [
      { id: '1', code: 'TRL', name: 'Trainlines', category: 'Core Systems', description: 'Train Line Control & Signal', sort_order: 1 },
      { id: '2', code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Brake Loop and BCU', sort_order: 2 },
      { id: '3', code: 'TRAC', name: 'Traction', category: 'Propulsion', description: 'VVVF, Speed Control', sort_order: 3 },
      { id: '4', code: 'DOOR', name: 'Door System', category: 'Core Systems', description: 'Left/Right Operation, Proving Loop', sort_order: 4 },
      { id: '5', code: 'VAC', name: 'VAC/HVAC', category: 'Core Systems', description: 'Cab & Saloon VAC', sort_order: 5 },
      { id: '6', code: 'APS', name: 'Auxiliary Power', category: 'Power', description: 'APS, Shore Supply, Battery', sort_order: 6 },
      { id: '7', code: 'TMS', name: 'TCMS', category: 'Control', description: 'Remote I/O, Interface', sort_order: 7 },
      { id: '8', code: 'COMMS', name: 'Communications', category: 'Core Systems', description: 'PIS, PA, CBTC, CCTV', sort_order: 8 },
    ];
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">System Explorer</h1>
        <p className="mt-2 text-slate-400">
          Browse wiring, equipment, and drawings by functional subsystem
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {systems.map((system) => {
          const IconComponent = iconMap[system.code] || Settings;
          const theme = colorMap[system.category] || colorMap['Core Systems'];
          
          return (
            <Link key={system.code} href={`/systems/${system.code}`}>
              <div className="glass-card p-6 group hover:border-cyan-500/40 transition-all h-full">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${theme} border`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="status-active">{system.category || 'Active'}</span>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {system.code}
                  </h3>
                  <p className="text-sm text-slate-300 font-medium mt-1">
                    {system.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {system.description}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Explore System →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}