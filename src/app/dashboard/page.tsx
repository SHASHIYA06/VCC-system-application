import StatsWidget from '@/components/dashboard/StatsWidget';
import SystemCard from '@/components/dashboard/SystemCard';
import FleetOverview from '@/components/dashboard/FleetOverview';
import RecentUpdates from '@/components/dashboard/RecentUpdates';
import { query } from '@/lib/db';

async function getCriticalSystems() {
  try {
    const result = await query<{ code: string; name: string; category: string; description: string }>(
      `SELECT code, name, category, description FROM systems 
       WHERE code IN ('TRL', 'BRAKE', 'TRAC', 'DOOR', 'VAC', 'APS', 'TMS', 'COMMS')
       ORDER BY sort_order`
    );
    return result;
  } catch {
    return [];
  }
}

const systemDescriptions: Record<string, string> = {
  TRL: 'Train Line Control, Signal, Jumper Mapping',
  BRAKE: 'BCU, Emergency Brake, Parking Brake, Loop',
  TRAC: 'VVVF, Speed Control, Propulsion Enable',
  DOOR: 'Left/Right Operation, Proving Loop, TMS',
  VAC: 'Cab VAC, Saloon VAC, Smoke Detection',
  APS: 'Auxiliary Power, Shore Supply, Battery',
  TMS: 'TCMS Interface, RIO Points, I/O Mapping',
  COMMS: 'PIS/TIS, PA, CBTC, Radio, CCTV',
};

const colorThemes: Record<string, string> = {
  TRL: 'blue',
  BRAKE: 'red',
  TRAC: 'orange',
  DOOR: 'cyan',
  VAC: 'emerald',
  APS: 'amber',
  TMS: 'purple',
  COMMS: 'pink',
};

export default async function Dashboard() {
  const criticalSystems = await getCriticalSystems();
  
  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text">
          VCC Intelligence Dashboard
        </h1>
        <p className="mt-2 text-slate-400 text-lg">
          KMRCL RS3R Metro Vehicle Control Circuits Explorer
        </p>
      </div>
      
      {/* Stats Widget */}
      <StatsWidget />
      
      {/* Fleet Overview */}
      <FleetOverview />
      
      {/* Critical Systems Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
            Core Systems
          </h3>
          <span className="text-sm text-slate-500">
            Click any system to explore
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {criticalSystems.map((system) => (
            <SystemCard 
              key={system.code}
              systemCode={system.code}
              name={system.name}
              description={systemDescriptions[system.code] || system.description || ''}
              status="Active"
              colorTheme={colorThemes[system.code] || 'blue'}
            />
          ))}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/trainlines" className="glass-card p-5 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Trainline Explorer</h4>
              <p className="text-sm text-slate-400">Trace signals across 6-car formation</p>
            </div>
          </div>
        </a>
        
        <a href="/wires" className="glass-card p-5 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Wire Finder</h4>
              <p className="text-sm text-slate-400">Search wires by number, type, connector</p>
            </div>
          </div>
        </a>
        
        <a href="/tcms" className="glass-card p-5 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">TCMS I/O Browser</h4>
              <p className="text-sm text-slate-400">Browse RIO points, signals, connectors</p>
            </div>
          </div>
        </a>
      </div>
      
      {/* Learning Mode CTA */}
      <div className="mt-8 glass-card p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Learning Mode</h3>
            <p className="text-slate-400 text-sm mt-1">
              Beginner-friendly explanations with step-by-step system walkthroughs
            </p>
          </div>
          <a href="/learning" className="glass-btn bg-gradient-to-r from-violet-500/30 to-purple-500/30">
            Start Learning →
          </a>
        </div>
      </div>
      
      <RecentUpdates />
    </div>
  );
}