import { query } from '@/lib/db';
import Link from 'next/link';

interface CarType {
  code: string;
  name: string;
  position: number;
}

const carColors: Record<string, string> = {
  DMC: 'from-amber-500 to-orange-600',
  TC: 'from-violet-500 to-purple-600',
  MC: 'from-cyan-500 to-blue-600',
  CAB: 'from-emerald-500 to-teal-600',
};

const carDescriptions: Record<string, string> = {
  DMC: 'Driving Motor Car - Leading',
  TC: 'Trailer Car - Middle',
  MC: 'Motor Car - Powered',
  CAB: 'Cab / Driver Desk',
};

async function getCarTypes() {
  try {
    const result = await query<{ code: string; name: string }>(
      'SELECT code, name FROM car_types ORDER BY position_in_formation'
    );
    return result.length > 0 ? result : [
      { code: 'DMC', name: 'Driving Motor Car' },
      { code: 'TC', name: 'Trailer Car' },
      { code: 'MC', name: 'Motor Car' },
      { code: 'DMC2', name: 'Driving Motor Car (Rear)' },
    ];
  } catch {
    return [
      { code: 'DMC', name: 'Driving Motor Car' },
      { code: 'TC', name: 'Trailer Car' },
      { code: 'MC', name: 'Motor Car' },
      { code: 'DMC2', name: 'Driving Motor Car (Rear)' },
    ];
  }
}

export default async function FleetOverview() {
  const carTypes = await getCarTypes();
  
  return (
    <div className="glass-card p-6 mt-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" />
        Fleet Formation - KMRCL RS3R (6-Car)
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {carTypes.map((car, index) => {
          const isLeading = index === 0;
          const isTrailing = index === carTypes.length - 1;
          const colorKey = car.code.replace(/\d+$/, '');
          const gradient = carColors[colorKey] || carColors.MC;
          
          return (
            <Link 
              key={car.code} 
              href={`/cars/${car.code}`}
              className="group"
            >
              <div className={`relative px-6 py-4 rounded-xl bg-gradient-to-r ${gradient} 
                hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg 
                group-hover:shadow-${colorKey.split('')[0]}-500/30`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {car.code}
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    {car.name}
                  </div>
                  {isLeading && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  )}
                  {isTrailing && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  )}
                </div>
                
                {/* Connection lines */}
                {index < carTypes.length - 1 && (
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden lg:block">
                    <svg width="24" height="20" viewBox="0 0 24 20">
                      <path d="M0 10H20M15 5L20 10L15 15" stroke="currentColor" strokeWidth="2" 
                        className="text-slate-500" fill="none"/>
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      <p className="text-sm text-slate-400 mt-4">
        Click any car to view its system configuration and equipment
      </p>
    </div>
  );
}