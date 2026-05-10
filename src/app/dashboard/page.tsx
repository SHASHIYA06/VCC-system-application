import StatsWidget from '@/components/dashboard/StatsWidget';
import SystemCard from '@/components/dashboard/SystemCard';
import FleetOverview from '@/components/dashboard/FleetOverview';
import RecentUpdates from '@/components/dashboard/RecentUpdates';

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          System Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          KMRCL RS3R VCC Intelligence Dashboard
        </p>
      </div>

      <StatsWidget />
      
      <FleetOverview />

      {/* Subsystem Health / Status */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Critical Subsystems</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SystemCard 
            systemCode="TRAC" 
            name="Traction" 
            description="VVVF, Speed Control, Motors"
            status="Verified"
            drawingCount={12}
            pinCount={842}
            colorTheme="green"
          />
          <SystemCard 
            systemCode="BRAKE" 
            name="Brake" 
            description="BCU, Compressor, Loops"
            status="In Review"
            drawingCount={18}
            pinCount={1104}
            colorTheme="yellow"
          />
          <SystemCard 
            systemCode="TRL" 
            name="Trainlines" 
            description="Control & Signal Jumpers"
            status="Active"
            drawingCount={52}
            pinCount={24}
            colorTheme="blue"
          />
        </div>
      </div>

      <RecentUpdates />
    </div>
  );
}
