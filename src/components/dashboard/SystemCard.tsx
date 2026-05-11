import Link from 'next/link';
import { ArrowRight, Zap, Shield, Train, DoorOpen, Wind, Radio, Battery, Settings } from 'lucide-react';

interface SystemCardProps {
  systemCode: string;
  name: string;
  description: string;
  status: string;
  drawingCount?: number;
  pinCount?: number;
  colorTheme?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TRL: Train,
  BRAKE: Shield,
  TRAC: Zap,
  DOOR: DoorOpen,
  VAC: Wind,
  COMMS: Radio,
  APS: Battery,
  GEN: Settings,
};

const colorThemes: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  green: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', glow: 'emerald' },
  blue: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', icon: 'text-blue-400', glow: 'blue' },
  cyan: { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', icon: 'text-cyan-400', glow: 'cyan' },
  purple: { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', icon: 'text-purple-400', glow: 'purple' },
  orange: { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', icon: 'text-orange-400', glow: 'orange' },
  red: { bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', icon: 'text-red-400', glow: 'red' },
};

const statusColors: Record<string, string> = {
  'Verified': 'status-active',
  'Active': 'status-active',
  'In Review': 'status-warning',
  'Pending': 'status-warning',
  'Error': 'status-error',
};

export default function SystemCard({ systemCode, name, description, status, drawingCount, pinCount, colorTheme = 'blue' }: SystemCardProps) {
  const Icon = iconMap[systemCode] || Settings;
  const theme = colorThemes[colorTheme] || colorThemes.blue;
  
  return (
    <Link href={`/systems/${systemCode}`} className="block group">
      <div className={`glass-card p-6 relative overflow-hidden h-full`}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-60`} />
        
        {/* Glow Effect */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${theme.glow}-500/20 rounded-full blur-3xl`} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.bg} border ${theme.border}`}>
              <Icon className={`h-6 w-6 ${theme.icon}`} />
            </div>
            <span className={statusColors[status] || 'status-active'}>
              {status}
            </span>
          </div>
          
          {/* Content */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          
          {/* Stats */}
          {(drawingCount !== undefined || pinCount !== undefined) && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm">
              {drawingCount !== undefined && (
                <div className="text-slate-400">
                  <span className="text-white font-medium">{drawingCount}</span> drawings
                </div>
              )}
              {pinCount !== undefined && (
                <div className="text-slate-400">
                  <span className="text-white font-medium">{pinCount}</span> pins
                </div>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-4 flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
            Explore
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}