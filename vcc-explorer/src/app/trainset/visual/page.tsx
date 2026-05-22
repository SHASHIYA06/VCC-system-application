'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Train, Zap, Cpu, Cable, FileText, Settings, Activity, 
  Battery, DoorOpen, Wind, Radio, Shield, ChevronRight,
  Layers, Box, Eye, X
} from 'lucide-react';

interface CarData {
  type: string;
  name: string;
  position: number;
  keyEquipment: string[];
  systems: string[];
  drawings: string[];
  trainlines: string[];
  connectors: string[];
}

const CARS: CarData[] = [
  {
    type: 'DMC',
    name: 'Driving Motor Car',
    position: 1,
    keyEquipment: ['VVVF1', 'BCU1', 'HSCB1', 'LTEB1', 'HTEB1', 'Pantograph'],
    systems: ['TRAC', 'BRAKE', 'HV', 'TRL', 'CAB'],
    drawings: ['942-38305', '942-38306', '942-38309', '942-38319', '942-38323'],
    trainlines: ['3003-3011', '4024-4028', '4062-4110', '1207-1215'],
    connectors: ['X1', 'X2', 'X3', 'CN1', 'CN2'],
  },
  {
    type: 'TC',
    name: 'Trailer Car',
    position: 2,
    keyEquipment: ['APS1', 'BATT1', 'SSB1', 'TCMS_RIO2', 'BECU', 'EDB2'],
    systems: ['APS', 'BRAKE', 'TMS', 'VAC', 'EDB'],
    drawings: ['942-38505', '942-38509', '942-38512', '942-38515', '942-38516', '942-38409'],
    trainlines: ['5000-5064', '4024-4028', '7001', '7050-7070'],
    connectors: ['X1', 'X2', 'X3', 'CN1', 'CN2', 'CN5'],
  },
  {
    type: 'MC',
    name: 'Motor Car',
    position: 3,
    keyEquipment: ['VVVF2', 'BCU3', 'TCMS_RIO1', 'DCU1', 'VAC1', 'ETH_SW1'],
    systems: ['TRAC', 'DOOR', 'TMS', 'VAC', 'COMMS'],
    drawings: ['942-38602', '942-38605', '942-38606', '942-38609', '942-38610'],
    trainlines: ['3003-3011', '6009-6112', '7050-7070'],
    connectors: ['X1', 'X2', 'X3', 'X4', 'X5', 'CN1', 'CN2'],
  },
  {
    type: 'MC',
    name: 'Motor Car',
    position: 4,
    keyEquipment: ['VVVF2', 'BCU3', 'TCMS_RIO1', 'DCU1', 'VAC1', 'ETH_SW1'],
    systems: ['TRAC', 'DOOR', 'TMS', 'VAC', 'COMMS'],
    drawings: ['942-38602', '942-38605', '942-38606', '942-38609', '942-38610'],
    trainlines: ['3003-3011', '6009-6112', '7050-7070'],
    connectors: ['X1', 'X2', 'X3', 'X4', 'X5', 'CN1', 'CN2'],
  },
  {
    type: 'TC',
    name: 'Trailer Car',
    position: 5,
    keyEquipment: ['APS1', 'BATT1', 'SSB1', 'TCMS_RIO2', 'BECU', 'EDB2'],
    systems: ['APS', 'BRAKE', 'TMS', 'VAC', 'EDB'],
    drawings: ['942-38505', '942-38509', '942-38512', '942-38515', '942-38516', '942-38409'],
    trainlines: ['5000-5064', '4024-4028', '7001', '7050-7070'],
    connectors: ['X1', 'X2', 'X3', 'CN1', 'CN2', 'CN5'],
  },
  {
    type: 'DMC',
    name: 'Driving Motor Car',
    position: 6,
    keyEquipment: ['VVVF1', 'BCU1', 'HSCB1', 'LTEB1', 'HTEB1', 'Pantograph'],
    systems: ['TRAC', 'BRAKE', 'HV', 'TRL', 'CAB'],
    drawings: ['942-38305', '942-38306', '942-38309', '942-38319', '942-38323'],
    trainlines: ['3003-3011', '4024-4028', '4062-4110', '1207-1215'],
    connectors: ['X1', 'X2', 'X3', 'CN1', 'CN2'],
  },
];

const CAR_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  DMC: { primary: 'from-blue-600 to-blue-700', secondary: 'border-blue-400', glow: 'shadow-blue-500/30' },
  TC: { primary: 'from-green-600 to-green-700', secondary: 'border-green-400', glow: 'shadow-green-500/30' },
  MC: { primary: 'from-orange-600 to-orange-700', secondary: 'border-orange-400', glow: 'shadow-orange-500/30' },
};

const SYSTEM_ICONS: Record<string, React.ElementType> = {
  TRAC: Zap,
  BRAKE: Shield,
  HV: Zap,
  TRL: Train,
  CAB: Activity,
  APS: Battery,
  DOOR: DoorOpen,
  VAC: Wind,
  TMS: Cpu,
  COMMS: Radio,
};

export default function Trainset3DPage() {
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
  const [viewMode, setViewMode] = useState<'trainlines' | 'systems' | 'drawings'>('trainlines');

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">3D Trainset Visualization</h1>
        <p className="mt-2 text-slate-400">
          Interactive 6-car formation with wiring interconnections and drawing links
        </p>
      </div>

      {/* View Mode Selector */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-slate-400">View Mode:</span>
        <div className="flex gap-2">
          {(['trainlines', 'systems', 'drawings'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Trainset Visual */}
      <div className="glass-card p-8 mb-8">
        <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4">
          {CARS.map((car, idx) => {
            const colors = CAR_COLORS[car.type];
            return (
              <div key={car.position} className="flex items-center">
                <div className="relative group">
                  {/* 3D Car Effect */}
                  <div className={`relative w-28 h-40 rounded-xl bg-gradient-to-br ${colors.primary} border-2 ${colors.secondary} ${colors.glow} shadow-lg transform transition-all hover:scale-105 cursor-pointer`}
                    onClick={() => setSelectedCar(car)}
                  >
                    {/* Car Roof */}
                    <div className="absolute top-0 left-2 right-2 h-8 bg-black/30 rounded-t-lg" />
                    
                    {/* Windows */}
                    <div className="absolute top-10 left-2 right-2 flex gap-1">
                      <div className="flex-1 h-6 bg-cyan-400/30 rounded" />
                      <div className="flex-1 h-6 bg-cyan-400/30 rounded" />
                      <div className="flex-1 h-6 bg-cyan-400/30 rounded" />
                    </div>
                    
                    {/* Equipment Indicators */}
                    <div className="absolute top-20 left-2 right-2 space-y-1">
                      {car.systems.slice(0, 3).map(sys => {
                        const Icon = SYSTEM_ICONS[sys] || Settings;
                        return (
                          <div key={sys} className="flex items-center gap-1 text-xs text-white/80">
                            <Icon className="h-3 w-3" />
                            <span className="font-mono">{sys}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Position Label */}
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-white font-bold text-lg">{car.position}</span>
                      <span className="block text-white/70 text-xs">{car.type}</span>
                    </div>
                  </div>

                  {/* Hover Info */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 bg-slate-800 border border-slate-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <p className="text-sm font-medium text-white">{car.name}</p>
                    <p className="text-xs text-slate-400">{car.keyEquipment.slice(0, 2).join(', ')}</p>
                    <p className="text-xs text-cyan-400 mt-1">{car.systems.length} systems • {car.connectors.length} connectors</p>
                  </div>
                </div>

                {/* Connector Lines Between Cars */}
                {idx < CARS.length - 1 && (
                  <div className="w-12 h-2 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full relative">
                    {/* Trainline indicators */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {[3000, 4000, 5000, 6000, 7000].slice(0, viewMode === 'trainlines' ? 5 : 3).map(tl => (
                        <div key={tl} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      ))}
                    </div>
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono">X1-X4</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-400">DMC - Driving Motor Car</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-slate-400">TC - Trailer Car</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-slate-400">MC - Motor Car</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 rounded-full bg-cyan-400" />
              <span className="text-slate-400">Trainline Connection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Car Details Panel */}
      {selectedCar && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Train className="h-6 w-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  Car #{selectedCar.position} - {selectedCar.type}
                </h2>
                <p className="text-sm text-slate-400">{selectedCar.name}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCar(null)} className="p-2 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Key Equipment */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Box className="h-4 w-4" /> Key Equipment
              </h3>
              <div className="space-y-2">
                {selectedCar.keyEquipment.map(eq => (
                  <Link key={eq} href={`/equipment/${eq}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30"
                  >
                    <span className="text-sm font-mono text-cyan-400">{eq}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Systems */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Systems
              </h3>
              <div className="space-y-2">
                {selectedCar.systems.map(sys => {
                  const Icon = SYSTEM_ICONS[sys] || Settings;
                  return (
                    <Link key={sys} href={`/systems/${sys}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-mono text-white">{sys}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawings */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> PIN Drawings
              </h3>
              <div className="space-y-2">
                {selectedCar.drawings.slice(0, 5).map(dwg => (
                  <Link key={dwg} href={`/drawings/${dwg}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30"
                  >
                    <span className="text-sm font-mono text-purple-400">{dwg}</span>
                    <Eye className="h-4 w-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Trainlines */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cable className="h-4 w-4" /> Trainline Connections
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedCar.trainlines.map(tl => (
                <Link key={tl} href={`/trainlines/${tl.split('-')[0]}`}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                >
                  {tl}
                </Link>
              ))}
            </div>
          </div>

          {/* Connectors */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Inter-Car Connectors
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedCar.connectors.map(cn => (
                <Link key={cn} href={`/connectors?search=${cn}`}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono bg-slate-700/50 border border-slate-600/30 text-slate-300 hover:bg-slate-600/50"
                >
                  {cn}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {Object.entries(SYSTEM_ICONS).slice(0, 8).map(([sys, Icon]) => (
          <Link key={sys} href={`/systems/${sys}`} className="glass-card p-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Icon className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <span className="font-mono font-bold text-white">{sys}</span>
                <p className="text-xs text-slate-500">System Details</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}