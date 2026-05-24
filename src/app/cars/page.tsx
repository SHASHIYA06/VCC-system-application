import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card3D, GlassPanel } from '@/components/ui';
import { Car, Cpu, Box, Cable, FileText, ChevronRight, Train } from 'lucide-react';

const CAR_TYPES = [
  {
    type: 'DMC',
    name: 'Driving Motor Car',
    positions: [1, 6],
    description: 'Driving motor car with cab, VVVF inverter, pantograph, BCU. Leading/trailing ends of train.',
    key_equipment: ['VVVF1', 'BCU1', 'HSCB1', 'LTEB1', 'LTEB2', 'HTEB1'],
    key_connectors: ['X1', 'X2', 'X3', 'X4', 'CN1', 'CN2'],
    drawing: '942-38309',
    systems: ['TRAC', 'BRAKE', 'HV', 'TRL'],
    trainlines: ['3003-3011', '4062', '4122', '6009-6112'],
    features: ['Cab Control', 'VVVF Inverter', 'HSCB', 'BCU', 'Pantograph', 'Earth Brush'],
  },
  {
    type: 'TC',
    name: 'Trailer Car',
    positions: [2, 5],
    description: 'Trailer car with auxiliary power supply, battery, TCMS RIO, BECU. Middle of train.',
    key_equipment: ['APS1', 'BATT1', 'SSB1', 'TCMS_RIO2', 'BCU2', 'LTEB2', 'EDB2'],
    key_connectors: ['X1', 'X2', 'X3', 'X4', 'CN1', 'CN2', 'CN5'],
    drawing: '942-38509 / 942-38409',
    systems: ['APS', 'BRAKE', 'TMS', 'VAC'],
    trainlines: ['7001', '7050-7060', '5000-5064', '4024-4153'],
    features: ['APS Unit', 'Battery Box', 'Shore Supply', 'TCMS RIO', 'BECU', 'SSK Box'],
  },
  {
    type: 'MC',
    name: 'Motor Car',
    positions: [3, 4],
    description: 'Motor car with VVVF inverter, TCMS RIO, DCU, VAC units. Powered middle section.',
    key_equipment: ['VVVF2', 'BCU3', 'TCMS_RIO1', 'DCU1', 'VAC1', 'ETH_SW1', 'BECU1'],
    key_connectors: ['X1', 'X2', 'X3', 'X4', 'X5', 'X10', 'CN1', 'CN2'],
    drawing: '942-38609 / 942-38610',
    systems: ['TRAC', 'DOOR', 'TMS', 'COMMS', 'VAC'],
    trainlines: ['3003-3011', '6009-6112', '4024', '4062', '7050-7060'],
    features: ['VVVF Inverter', 'TCMS RIO', 'Door Control', 'VAC Units', 'CBTC', 'CCTV', 'PIS'],
  },
];

const CAR_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  DMC: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-blue-600' },
  TC: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', gradient: 'from-green-500 to-green-600' },
  MC: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', gradient: 'from-orange-500 to-orange-600' },
};

export default function CarsPage() {
  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Fleet Explorer</h1>
        <p className="mt-2 text-slate-400">
          Browse car types, equipment, connectors, and PIN diagrams for the 6-car formation
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>3 car types</span>
          <span>6 positions</span>
          <span>DMC-TC-MC-MC-TC-DMC</span>
        </div>
      </div>

      {/* Fleet Formation Visual */}
      <div className="mb-8 glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Fleet Formation</h2>
        <div className="flex items-center justify-center gap-3">
          {['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'].map((car, i) => {
            const colors = CAR_COLORS[car];
            return (
              <div key={i} className="flex items-center gap-3">
                <Link href={`/cars/${car}`} className="group">
                  <div className={`w-20 h-28 rounded-xl bg-gradient-to-br ${colors.gradient} border-2 ${colors.border} flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <span className="text-white font-bold text-lg">{car}</span>
                    <span className="text-white/70 text-xs">#{i + 1}</span>
                  </div>
                </Link>
                {i < 5 && (
                  <div className="flex flex-col items-center">
                    <Cable className="h-6 w-6 text-slate-500" />
                    <span className="text-xs text-slate-600">X1-X4</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span>DMC = Driving Motor Car (with cab)</span>
          <span>TC = Trailer Car (with APS)</span>
          <span>MC = Motor Car (powered, no cab)</span>
        </div>
      </div>

      {/* Car Type Cards */}
      <div className="space-y-6">
        {CAR_TYPES.map(car => {
          const colors = CAR_COLORS[car.type];

          return (
            <div key={car.type} className={`glass-card overflow-hidden border-2 ${colors.border}`}>
              <div className={`px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r ${colors.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                      <Car className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className={`text-2xl font-bold ${colors.text}`}>{car.type}</h2>
                        <span className="text-white/70">{car.name}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{car.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">Positions: {car.positions.map(p => `#${p}`).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/cars/${car.type}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all">
                    Full Details <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Features */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Box className="h-4 w-4" /> Key Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map(f => (
                        <span key={f} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Systems */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> Systems
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {car.systems.map(s => (
                        <Link key={s} href={`/systems/${s}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50">
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Trainlines */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Train className="h-4 w-4" /> Key Trainlines
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {car.trainlines.map(tl => (
                        <Link key={tl} href={`/trainlines/${tl.split('-')[0]}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-700/50 text-cyan-400 hover:bg-slate-600/50">
                          {tl}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Key Equipment */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> Key Equipment ({car.key_equipment.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {car.key_equipment.map(eq => (
                        <Link key={eq} href={`/equipment/${eq}`}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30">
                          <span className="text-sm font-mono text-cyan-400">{eq}</span>
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Connectors & PIN Drawing */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Cable className="h-4 w-4" /> Connectors & PIN Drawing
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
                        <div>
                          <span className="text-sm font-medium text-white">PIN Drawing</span>
                          <p className="text-xs text-slate-500">Underframe + Ceiling</p>
                        </div>
                        <span className="text-sm font-mono text-purple-400">{car.drawing}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {car.key_connectors.map(cn => (
                          <span key={cn} className="px-2 py-1 rounded bg-slate-700/50 text-xs font-mono text-slate-300">
                            {cn}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PIN Drawing Reference */}
      <div className="mt-8 glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-cyan-400" /> PIN Drawing Reference by Car & Zone
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h3 className="font-bold text-blue-400 mb-2">DMC Underframe</h3>
            <p className="text-sm font-mono text-white">942-38309</p>
            <p className="text-xs text-slate-400 mt-1">VVVF CN1/CN2, BCU, HSCB connectors</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <h3 className="font-bold text-green-400 mb-2">TC Underframe / Ceiling</h3>
            <p className="text-sm font-mono text-white">942-38509 / 942-38409</p>
            <p className="text-xs text-slate-400 mt-1">APS, BECU, TCMS_RIO2 connectors</p>
          </div>
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <h3 className="font-bold text-orange-400 mb-2">MC Underframe / Ceiling</h3>
            <p className="text-sm font-mono text-white">942-38609 / 942-38610</p>
            <p className="text-xs text-slate-400 mt-1">VVVF CN1/CN2, TCMS_RIO1, DCU, VAC</p>
          </div>
        </div>
      </div>
    </div>
  );
}