import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';
import { Activity, ShieldCheck, Zap, Thermometer, Radio, Train, Battery } from 'lucide-react';

const mockSystems = [
  { id: '1', code: 'TRL', name: 'Trainlines', description: 'Train Lines Control & Signal', status: 'active', icon: 'Train' },
  { id: '2', code: 'BRAKE', name: 'Brake System', description: 'Brake Loop and BCU', status: 'active', icon: 'ShieldCheck' },
  { id: '3', code: 'APS', name: 'Auxiliary Power', description: 'Auxiliary Power Supply', status: 'active', icon: 'Zap' },
  { id: '4', code: 'TMS', name: 'TCMS', description: 'Train Control and Management System', status: 'active', icon: 'Activity' },
  { id: '5', code: 'TRAC', name: 'Traction', description: 'Traction and VVVF Control', status: 'active', icon: 'Zap' },
  { id: '6', code: 'HVAC', name: 'HVAC', description: 'Heating, Ventilation, and Air Conditioning', status: 'active', icon: 'Thermometer' },
  { id: '7', code: 'PIS', name: 'PIS/TIS', description: 'Passenger Information System', status: 'active', icon: 'Radio' },
];

const iconMap: Record<string, any> = {
  Train,
  ShieldCheck,
  Zap,
  Activity,
  Thermometer,
  Radio,
  Battery
};

export default async function SystemsPage() {
  let systems = mockSystems;

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('*')
        .order('code');
      
      if (data && !error) {
        systems = data;
      }
    } catch (e) {
      console.error('Failed to fetch systems from Supabase', e);
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-slate-900">System-wise Explorer</h1>
          <p className="mt-2 text-sm text-slate-700">
            Browse wiring, equipment, and drawings by functional subsystem.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {!hasValidSupabaseConfig && (
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              Using Mock Data
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => {
          const IconComponent = iconMap[system.icon || 'Activity'] || Activity;
          return (
            <Link key={system.code} href={`/systems/${system.code}`}>
              <div className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="absolute rounded-md bg-blue-500 p-3 group-hover:bg-blue-600 transition-colors">
                    <IconComponent className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-slate-900">
                      {system.code}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                      {system.name}
                    </p>
                  </div>
                </div>
                {system.description && (
                   <p className="mt-4 text-sm text-slate-600">
                     {system.description}
                   </p>
                )}
                <div className="mt-6 flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    system.status === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20'
                  }`}>
                    {system.status || 'Active'}
                  </span>
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-500">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
