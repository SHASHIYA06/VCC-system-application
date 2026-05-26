'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, Map, ChevronDown, ChevronRight, Cable, Cpu, 
  FileText, Box, Database, RefreshCw, Layers
} from 'lucide-react';

interface CarData {
  carType: string;
  stats: {
    drawings: number;
    devices: number;
    connectors: number;
    totalPins: number;
  };
  drawings: { no: string; title: string; system: string; sheets: number }[];
  systems: { code: string; connectors: number; pins: number; wired: number; connectorList: unknown[] }[];
  devices: { code: string; count: number; list: unknown[] }[];
}

export default function CarTreePage() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCars, setExpandedCars] = useState<Record<string, boolean>>({});
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  useEffect(() => {
    fetchCarData();
  }, []);

  async function fetchCarData() {
    try {
      setLoading(true);
      const res = await fetch('/api/car-tree');
      const data = await res.json();
      setCars(data.cars);
      // Expand first car by default
      if (data.cars.length > 0) {
        setExpandedCars({ [data.cars[0].carType]: true });
      }
    } catch (err) {
      setError('Failed to load car data');
    } finally {
      setLoading(false);
    }
  }

  function toggleCar(carType: string) {
    setExpandedCars(prev => ({ ...prev, [carType]: !prev[carType] }));
  }

  const CAR_COLORS: Record<string, { bg: string; text: string }> = {
    DMC: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    TC: { bg: 'bg-green-500/20', text: 'text-green-400' },
    MC: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    ALL: { bg: 'bg-slate-500/20', text: 'text-slate-400' }
  };

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Car className="h-8 w-8 text-cyan-400" />
          VCC Car Hierarchy
        </h1>
        <p className="mt-2 text-slate-400">
          Complete breakdown by car type: DMC, TC, MC - showing System → Equipment → Connectors → Pins
        </p>
      </div>

      {/* Car Type Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {cars.map(car => {
          const color = CAR_COLORS[car.carType] || CAR_COLORS['ALL'];
          return (
            <div key={car.carType} 
              className={`glass-card p-4 cursor-pointer hover:scale-[1.02] transition-transform ${color.bg}`}
              onClick={() => toggleCar(car.carType)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-lg ${color.text}`}>{car.carType}</span>
                {expandedCars[car.carType] ? 
                  <ChevronDown className="h-5 w-5 text-slate-400" /> : 
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                }
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Drawings</span>
                  <p className="font-bold text-white">{car.stats.drawings}</p>
                </div>
                <div>
                  <span className="text-slate-500">Connectors</span>
                  <p className="font-bold text-cyan-400">{car.stats.connectors}</p>
                </div>
                <div>
                  <span className="text-slate-500">Devices</span>
                  <p className="font-bold text-orange-400">{car.stats.devices}</p>
                </div>
                <div>
                  <span className="text-slate-500">Pins</span>
                  <p className="font-bold text-purple-400">{car.stats.totalPins}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Car Details */}
      {cars.map(car => {
        if (!expandedCars[car.carType]) return null;
        
        return (
          <div key={car.carType} className="glass-card overflow-hidden mb-6">
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
              <h2 className={`text-xl font-bold ${CAR_COLORS[car.carType]?.text || 'text-white'}`}>
                {car.carType} Car - Complete Hierarchy
              </h2>
            </div>
            
            <div className="p-6">
              {/* Systems with Connectors */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Map className="h-5 w-5 text-cyan-400" />
                  System Breakdown
                </h3>
                <div className="space-y-4">
                  {car.systems.map(sys => (
                    <div key={sys.code} className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Link href={`/systems/${sys.code}`} 
                          className="font-bold text-cyan-400 hover:text-cyan-300"
                        >
                          {sys.code}
                        </Link>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-400">{sys.connectors} connectors</span>
                          <span className="text-slate-400">{sys.pins} pins</span>
                          <span className="text-green-400">{sys.wired} wired</span>
                        </div>
                      </div>
                      
                      {/* Connector Grid */}
                      <div className="grid grid-cols-6 gap-2">
                        {sys.connectorList.map((conn: any) => (
                          <div key={conn.id} className="bg-slate-700/30 rounded p-2 text-center">
                            <Link href={`/connectors/${conn.code}`} 
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                            >
                              {conn.code}
                            </Link>
                            <p className="text-xs text-slate-500">{conn.pinCount}P</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-orange-400" />
                  Equipment ({car.devices.reduce((sum, d) => sum + d.count, 0)})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {car.devices.map(dev => (
                    <div key={dev.code} className="bg-slate-800/30 rounded-lg p-3">
                      <div className="font-semibold text-orange-400 mb-2">{dev.code} ({dev.count})</div>
                      {dev.list.map((d: any) => (
                        <div key={d.id} className="text-xs text-slate-400 py-1">
                          <span className="font-mono">{d.tag}</span>: {d.name}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Drawings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Key Drawings ({car.drawings.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {car.drawings.slice(0, 12).map(dwg => (
                    <Link key={dwg.no} href={`/drawings/${dwg.no}`}
                      className="bg-slate-700/30 rounded p-3 hover:bg-slate-600/30"
                    >
                      <p className="text-sm font-mono text-cyan-400">{dwg.no}</p>
                      <p className="text-xs text-slate-500 truncate">{dwg.title}</p>
                      <p className="text-xs text-slate-600">{dwg.sheets} sheets</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}