import Link from 'next/link';
import { query } from '@/lib/db';
import {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Lightbulb, Link2, AlertTriangle, Gauge, Cpu, Box, ZapOff
} from 'lucide-react';

interface System {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  icon_name: string;
  sort_order: number;
  drawing_count?: number;
  trainline_count?: number;
}

const ALL_SYSTEMS: System[] = [
  { id: '1', code: 'GEN', name: 'General / Foundation', category: 'Foundation', description: 'Drawing list, conductor classification, wiring number system, symbol library', icon_name: 'Settings', sort_order: 0 },
  { id: '2', code: 'TRL', name: 'Trainlines', category: 'Core', description: 'Train line control, signal, power distribution across all cars', icon_name: 'Train', sort_order: 1, trainline_count: 52 },
  { id: '3', code: 'CAB', name: 'Controlling Cab', category: 'Core', description: 'Head/Tail control relay, key-on relay, MCB trip status, system status', icon_name: 'Cpu', sort_order: 2 },
  { id: '4', code: 'TRAC', name: 'Traction Control', category: 'Propulsion', description: 'Speed control, VVVF inverter, traction return current', icon_name: 'Zap', sort_order: 3, trainline_count: 10 },
  { id: '5', code: 'BRAKE', name: 'Brake System', category: 'Core', description: 'Compressor, brake loop, emergency brake, parking brake, horn', icon_name: 'ShieldCheck', sort_order: 4, trainline_count: 12 },
  { id: '6', code: 'APS', name: 'Auxiliary Power', category: 'Power', description: 'APS unit, shore supply, battery control, SIV contactors', icon_name: 'Battery', sort_order: 5, trainline_count: 6 },
  { id: '7', code: 'DOOR', name: 'Door System', category: 'Core', description: 'Door supply, left/right operation, proving loop, TCMS interface', icon_name: 'DoorOpen', sort_order: 6, trainline_count: 8 },
  { id: '8', code: 'VAC', name: 'VAC / HVAC', category: 'Core', description: 'Cab VAC, saloon VAC power, VAC control, smoke detection', icon_name: 'Wind', sort_order: 7, trainline_count: 5 },
  { id: '9', code: 'TMS', name: 'TCMS', category: 'Control', description: 'TMS interface, TCMS RIO digital I/O mapping, point assignments', icon_name: 'Activity', sort_order: 8 },
  { id: '10', code: 'COMMS', name: 'Communications', category: 'Control', description: 'PIS/TIS, PA, DVAS, CBTC, train radio, CCTV', icon_name: 'Radio', sort_order: 9 },
  { id: '11', code: 'LIGHT', name: 'Interior Lighting', category: 'Power', description: 'Head cab light, tail light, door console light, interior lights, wiper', icon_name: 'Lightbulb', sort_order: 10 },
  { id: '12', code: 'COUPL', name: 'Coupler Control', category: 'Core', description: 'Gangway coupler control for coupling and uncoupling', icon_name: 'Link2', sort_order: 11 },
  { id: '13', code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Power', description: 'Underframe low tension equipment panel', icon_name: 'Box', sort_order: 12 },
  { id: '14', code: 'LTJB', name: 'Low Tension Junction Box', category: 'Power', description: 'Underframe low tension junction box', icon_name: 'Box', sort_order: 13 },
  { id: '15', code: 'EDB', name: 'Electrical Distribution Box', category: 'Power', description: 'Ceiling electrical distribution box', icon_name: 'Box', sort_order: 14 },
  { id: '16', code: 'HV', name: 'High Tension / HV', category: 'Power', description: 'HSCB, pantograph, high tension bus, earth brushes, collector shoes', icon_name: 'ZapOff', sort_order: 15 },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Train, ShieldCheck, Zap, Wind, Radio, Battery, Settings, DoorOpen,
  Activity, Lightbulb, Link2, Gauge, Cpu, Box, ZapOff,
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Foundation: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', icon: 'text-slate-400' },
  Core: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
  Propulsion: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  Power: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  Control: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
};

export default async function SystemsPage() {
  let systems: System[] = [];

  try {
    systems = await query<System>('SELECT * FROM systems ORDER BY sort_order');
  } catch (e) {
    console.error('Failed to fetch systems from DB', e);
  }

  if (systems.length === 0) {
    systems = ALL_SYSTEMS;
  }

  const grouped = systems.reduce((acc, sys) => {
    const cat = sys.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sys);
    return acc;
  }, {} as Record<string, System[]>);

  const categoryOrder = ['Foundation', 'Core', 'Propulsion', 'Power', 'Control'];

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">System Explorer</h1>
        <p className="mt-2 text-slate-400">
          Browse all 16 VCC systems with drawings, equipment, trainlines, and wire connections
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{systems.length} Systems</span>
          <span className="flex items-center gap-1">
            <Train className="h-4 w-4" />
            {ALL_SYSTEMS.reduce((sum, s) => sum + (s.trainline_count || 0), 0)} Trainlines
          </span>
          <span className="flex items-center gap-1">
            <Box className="h-4 w-4" />
            200+ Equipment
          </span>
        </div>
      </div>

      {categoryOrder.filter(cat => grouped[cat]).map(category => {
        const catColors = CATEGORY_COLORS[category] || CATEGORY_COLORS['Core'];
        const catSystems = grouped[category];

        return (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className={`text-lg font-semibold ${catColors.text}`}>{category} Systems</h2>
              <div className="flex-1 h-px bg-slate-700/50"></div>
              <span className="text-xs text-slate-600">{catSystems.length} systems</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {catSystems.map(system => {
                const IconComponent = iconMap[system.icon_name || 'Settings'] || Settings;

                return (
                  <Link key={system.code} href={`/systems/${system.code}`}>
                    <div className="glass-card p-5 group hover:border-cyan-500/40 transition-all h-full">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg ${catColors.bg} border ${catColors.border}`}>
                          <IconComponent className={`h-5 w-5 ${catColors.icon}`} />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {system.trainline_count && (
                            <span className="inline-flex items-center rounded bg-slate-700/50 px-1.5 py-0.5 text-xs font-medium text-slate-400">
                              {system.trainline_count} TL
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {system.code}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">
                          {system.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {system.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center text-cyan-400 text-xs font-medium group-hover:translate-x-1 transition-transform">
                        Explore System <span className="ml-1">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}